import contextlib
import datetime as dt
import importlib.util
import io
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
import urllib.error

SPEC = importlib.util.spec_from_file_location('socialora', Path(__file__).parents[1] / 'socialora.py')
app = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(app)


class FakeTelegram:
    def __init__(self, error=None, bot=app.BOT, permission=True, wrong_chat=False, webhook_url='', updates=None):
        self.calls, self.error, self.bot, self.permission, self.wrong_chat = [], error, bot, permission, wrong_chat
        self.webhook_url = webhook_url
        self.updates = list(updates or [])

    def call(self, method, payload=None):
        self.calls.append((method, payload))
        if method == 'getMe':
            return {'id': 123, 'username': self.bot}
        if method == 'getChat':
            name = payload['chat_id'][1:]
            return {'id': -1001 if name == 'SocialoraOfficial' else -1002,
                    'username': 'wrong' if self.wrong_chat else name,
                    'type': 'channel' if name == 'SocialoraOfficial' else 'supergroup'}
        if method == 'getChatMember':
            return {'status': 'administrator', 'can_post_messages': self.permission}
        if method == 'sendMessage':
            if self.error:
                raise self.error
            return {'message_id': 900, 'chat': {'id': payload['chat_id']}}
        if method == 'getChatMemberCount':
            return 100
        if method == 'getWebhookInfo':
            return {'url': self.webhook_url}
        if method == 'getUpdates':
            offset = (payload or {}).get('offset')
            if offset is not None:
                return [u for u in self.updates if u['update_id'] >= offset]
            return list(self.updates)
        raise AssertionError('Forbidden method ' + method)


class PublisherTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        root = Path(self.temp.name)
        self.state_patch = patch.object(app, 'STATE', root / 'state')
        self.config_patch = patch.object(app, 'CONFIG', root / 'config.json')
        self.state_patch.start()
        self.config_patch.start()
        self.addCleanup(self.state_patch.stop)
        self.addCleanup(self.config_patch.stop)
        self.db = app.connect()
        self.addCleanup(self.db.close)
        self.now = int(dt.datetime(2030, 1, 1, 11, tzinfo=app.TZ).timestamp())

    def enqueue(self, pid='test_one', due=None, target='channel', text=None):
        due = self.now if due is None else due
        text = text or 'A clear, useful post about making the next product description easier to understand. ' + pid
        self.db.execute('INSERT INTO posts(id,target,text,digest,due,expires) VALUES(?,?,?,?,?,?)',
                        (pid, target, text, pid, due, due + 5400))
        self.db.commit()

    def status(self, pid='test_one'):
        return self.db.execute('SELECT * FROM posts WHERE id=?', (pid,)).fetchone()

    def test_success_is_persisted_and_never_sent_twice(self):
        self.enqueue()
        api = FakeTelegram()
        self.assertTrue(app.publish_one(self.db, api, self.now))
        self.assertFalse(app.publish_one(self.db, api, self.now + 60))
        app.recover(self.db)
        self.assertFalse(app.publish_one(self.db, api, self.now + 120))
        self.assertEqual(1, sum(m == 'sendMessage' for m, p in api.calls))
        self.assertEqual(900, self.status()['message_id'])
        self.assertEqual('sent', self.status()['status'])

    def test_timeout_is_unknown_and_pauses_all_sends(self):
        self.enqueue()
        self.enqueue('test_two')
        api = FakeTelegram(error=app.TelegramError(0, uncertain=True))
        self.assertFalse(app.publish_one(self.db, api, self.now))
        self.assertEqual('unknown', self.status()['status'])
        self.assertTrue((app.STATE / 'PAUSED').exists())
        self.assertFalse(app.publish_one(self.db, api, self.now + 3600))
        self.assertEqual(1, sum(m == 'sendMessage' for m, p in api.calls))

    def test_crash_after_request_is_not_replayed_on_restart(self):
        self.enqueue()
        self.db.execute("UPDATE posts SET status='sending'")
        self.db.commit()
        app.recover(self.db)
        self.assertEqual('unknown', self.status()['status'])
        api = FakeTelegram()
        app.publish_one(self.db, api, self.now)
        self.assertEqual([], api.calls)

    def test_stale_slots_are_skipped_without_catchup(self):
        self.enqueue(due=self.now - 6000)
        api = FakeTelegram()
        self.assertFalse(app.publish_one(self.db, api, self.now))
        self.assertEqual('expired', self.status()['status'])
        self.assertEqual([], api.calls)

    def test_rate_limit_respects_wait_and_then_sends(self):
        self.enqueue()
        api = FakeTelegram(error=app.TelegramError(429, 120))
        app.publish_one(self.db, api, self.now)
        self.assertEqual('pending', self.status()['status'])
        self.assertEqual(self.now + 120, self.status()['next_attempt'])
        self.assertFalse(app.publish_one(self.db, api, self.now + 119))
        api.error = None
        self.assertTrue(app.publish_one(self.db, api, self.now + 120))

    def test_repeated_429_has_a_finite_retry_limit(self):
        self.enqueue()
        api = FakeTelegram(error=app.TelegramError(429, 60))
        for i in range(6):
            app.publish_one(self.db, api, self.now + i * 60)
        self.assertEqual('failed', self.status()['status'])
        self.assertEqual(4, sum(m == 'sendMessage' for m, p in api.calls))

    def test_permanent_denial_is_failed_and_paused(self):
        self.enqueue()
        api = FakeTelegram(error=app.TelegramError(403))
        app.publish_one(self.db, api, self.now)
        self.assertEqual('failed', self.status()['status'])
        self.assertTrue((app.STATE / 'PAUSED').exists())

    def test_server_error_is_ambiguous_not_retried(self):
        self.enqueue()
        api = FakeTelegram(error=app.TelegramError(500, uncertain=True))
        app.publish_one(self.db, api, self.now)
        self.assertEqual('unknown', self.status()['status'])

    def test_identity_destination_and_permission_guards(self):
        for kwargs in [{'bot': 'wrong_bot'}, {'permission': False}, {'wrong_chat': True}]:
            with self.subTest(**kwargs):
                self.db.execute('DELETE FROM posts')
                self.db.commit()
                (app.STATE / 'PAUSED').unlink(missing_ok=True)
                self.enqueue()
                api = FakeTelegram(**kwargs)
                app.publish_one(self.db, api, self.now)
                self.assertFalse(any(m == 'sendMessage' for m, p in api.calls))
                self.assertTrue((app.STATE / 'PAUSED').exists())

    def test_wrong_response_chat_is_unknown(self):
        self.enqueue()
        api = FakeTelegram()
        original = api.call
        def call(method, payload=None):
            if method == 'sendMessage':
                return {'message_id': 999, 'chat': {'id': -9999}}
            return original(method, payload)
        api.call = call
        app.publish_one(self.db, api, self.now)
        self.assertEqual('unknown', self.status()['status'])

    def test_pause_prevents_even_preflight(self):
        self.enqueue()
        app.pause()
        api = FakeTelegram()
        app.publish_one(self.db, api, self.now)
        self.assertEqual([], api.calls)

    def test_two_targets_do_not_burst_after_delay(self):
        self.enqueue()
        self.enqueue('test_two', target='group')
        api = FakeTelegram()
        self.assertTrue(app.publish_one(self.db, api, self.now))
        self.assertFalse(app.publish_one(self.db, api, self.now + 10))
        self.assertTrue(app.publish_one(self.db, api, self.now + 1800))

    def test_daily_ceiling_across_separate_batches(self):
        for n in range(6):
            self.enqueue('test_' + str(n))
        self.db.execute('UPDATE posts SET expires=?', (self.now + 20000,))
        self.db.commit()
        api = FakeTelegram()
        for n in range(5):
            self.assertTrue(app.publish_one(self.db, api, self.now + n * 1800))
        self.assertFalse(app.publish_one(self.db, api, self.now + 9000))


    def test_durable_delivery_marker_exists_before_http_request(self):
        self.enqueue()
        api = FakeTelegram()
        original = api.call
        def call(method, payload=None):
            if method == 'sendMessage':
                other = app.connect()
                try:
                    self.assertEqual('sending', other.execute('SELECT status FROM posts').fetchone()[0])
                finally:
                    other.close()
            return original(method, payload)
        api.call = call
        self.assertTrue(app.publish_one(self.db, api, self.now))

    def test_duplicate_worker_is_rejected(self):
        with app.worker_lock():
            with self.assertRaises(app.SafeError):
                with app.worker_lock():
                    self.fail('Second worker acquired the lock')

    def test_service_lock_allows_queue_administration(self):
        with app.worker_lock('runner.lock'):
            with app.worker_lock():
                pass

    def test_import_is_idempotent_and_preserves_original_schedule(self):
        start = (dt.datetime.now(app.TZ).date() + dt.timedelta(days=1)).isoformat()
        source = app.ROOT / 'content.json'
        self.assertEqual(37, app.import_content(self.db, source, start))
        original_due = self.db.execute('SELECT MIN(due) FROM posts').fetchone()[0]
        tomorrow = (dt.date.fromisoformat(start) + dt.timedelta(days=1)).isoformat()
        self.assertEqual(0, app.import_content(self.db, source, tomorrow))
        self.assertEqual(original_due, self.db.execute('SELECT MIN(due) FROM posts').fetchone()[0])

    def test_modified_existing_id_rolls_back_entire_batch(self):
        start = (dt.datetime.now(app.TZ).date() + dt.timedelta(days=1)).isoformat()
        source = json.loads((app.ROOT / 'content.json').read_text(encoding='utf-8'))
        app.import_content(self.db, app.ROOT / 'content.json', start)
        new = dict(source['posts'][0], id='new_post', text='A new and different useful post for our community to read today.', day=20)
        source['posts'] = [new, dict(source['posts'][0], text='This existing ID was changed and must cause the import to roll back completely.')]
        file = Path(self.temp.name) / 'changed.json'
        file.write_text(json.dumps(source), encoding='utf-8')
        with self.assertRaises(app.SafeError):
            app.import_content(self.db, file, start)
        self.assertEqual(37, self.db.execute('SELECT COUNT(*) FROM posts').fetchone()[0])

    def test_content_bundle_has_correct_targets_and_tracked_links(self):
        posts = app.validate_posts(json.loads((app.ROOT / 'content.json').read_text(encoding='utf-8')))
        self.assertEqual(35, sum(p['target'] == 'channel' for p in posts))
        self.assertEqual(2, sum(p['target'] == 'group' for p in posts))
        for day in range(7):
            self.assertEqual(5, sum(p['target'] == 'channel' and p['day'] == day for p in posts))

    def test_daytime_slots_are_varied_and_three_to_four_hours_apart(self):
        posts = json.loads((app.ROOT / 'content.json').read_text(encoding='utf-8'))['posts']
        patterns = set()
        for day in range(7):
            slots = sorted(p['time'] for p in posts if p['target'] == 'channel' and p['day'] == day)
            minutes = [int(x[:2]) * 60 + int(x[3:]) for x in slots]
            self.assertTrue(all(180 <= b-a <= 240 for a,b in zip(minutes, minutes[1:])))
            self.assertTrue(all(480 <= x < 1380 for x in minutes))
            patterns.add(tuple(slots))
        self.assertEqual(7, len(patterns))

    def test_non_socialora_external_link_is_rejected(self):
        source = json.loads((app.ROOT / 'content.json').read_text(encoding='utf-8'))
        source['posts'][0]['text'] += '\nhttps://example.com/phishing'
        with self.assertRaises(app.SafeError):
            app.validate_posts(source)

    def test_report_does_not_invent_traffic_or_publish_to_group(self):
        text = app.report(self.db, self.now)
        self.assertLessEqual(len(text.splitlines()), 8)
        self.assertIn('analitik verisi yok', text)
        self.assertIn('AI/API çağrısı: 0', text)

    def test_snapshot_does_not_change_webhook_and_runs_once_per_day(self):
        api = FakeTelegram()
        app.snapshot(self.db, api, self.now)
        n = len(api.calls)
        app.snapshot(self.db, api, self.now + 3600)
        self.assertEqual(n, len(api.calls))
        self.assertFalse(any('Webhook' in m or m == 'getUpdates' for m, p in api.calls))

    @unittest.skipIf(app.os.name == 'nt', 'POSIX mode bits only enforced on Unix/Termux')
    def test_private_config_and_state_permissions(self):
        app.atomic_text(app.CONFIG, json.dumps({'bot_token': '123456:secret_placeholder_not_real_123456'}))
        self.assertEqual(0o600, app.CONFIG.stat().st_mode & 0o777)
        self.assertEqual(0o700, app.STATE.stat().st_mode & 0o777)
        app.CONFIG.chmod(0o644)
        with self.assertRaises(app.SafeError):
            app.load_config()

    def test_transport_errors_never_expose_the_token(self):
        token = '123456:fake_secret_for_test_only_12345'
        api = app.Telegram(token)
        api.opener.open = lambda *a, **k: (_ for _ in ()).throw(OSError('sensitive ' + token))
        with self.assertRaises(app.TelegramError) as err:
            api.call('sendMessage', {'text': 'test'})
        self.assertNotIn(token, str(err.exception))
        self.assertTrue(err.exception.uncertain)

    def test_http_errors_do_not_retry_or_forward_token(self):
        api = app.Telegram('123456:not_a_real_token_1234567890123')
        calls = []
        def fail(req, timeout):
            calls.append(req)
            raise urllib.error.HTTPError(req.full_url, 429, 'private', {}, io.BytesIO(b'{"parameters":{"retry_after":42}}'))
        api.opener.open = fail
        with self.assertRaises(app.TelegramError) as err:
            api.call('sendMessage', {'text': 'test'})
        self.assertEqual(42, err.exception.retry_after)
        self.assertEqual(1, len(calls))

    def test_webhook_mutation_methods_are_impossible(self):
        api = app.Telegram('not-real')
        for method in ['setWebhook', 'deleteWebhook', 'deleteMessage', 'banChatMember']:
            with self.assertRaises(app.SafeError):
                api.call(method)

    def test_consume_updates_requires_empty_webhook_and_deduplicates(self):
        updates = [
            {'update_id': 10, 'message': {'message_id': 501, 'chat': {'id': -1002},
                                          'from': {'id': 77, 'username': 'alice', 'is_bot': False},
                                          'text': 'How can I resize a vertical photo without cropping?'}},
            {'update_id': 11, 'message': {'message_id': 502, 'chat': {'id': -1002},
                                          'from': {'id': 78, 'username': 'bob', 'is_bot': False},
                                          'text': 'Good morning everyone'}},
            {'update_id': 12, 'message': {'message_id': 503, 'chat': {'id': -9999},
                                          'from': {'id': 79, 'username': 'eve', 'is_bot': False},
                                          'text': 'Question in another chat?'}},
        ]
        blocked_api = FakeTelegram(webhook_url='https://example.com/hook', updates=updates)
        self.assertEqual(0, app.consume_updates(self.db, blocked_api, self.now))
        self.assertFalse(any(m == 'getUpdates' for m, _ in blocked_api.calls))

        api = FakeTelegram(webhook_url='', updates=updates)
        self.assertEqual(1, app.consume_updates(self.db, api, self.now))
        # Second poll with same updates must advance offset and not duplicate
        self.assertEqual(0, app.consume_updates(self.db, api, self.now + 60))
        rows = self.db.execute('SELECT * FROM inbox ORDER BY update_id').fetchall()
        self.assertEqual(2, len(rows))
        self.assertEqual('pending', rows[0]['status'])
        self.assertEqual('ignored', rows[1]['status'])

    def test_reply_to_inbox_validates_and_prevents_double_reply(self):
        updates = [{'update_id': 25, 'message': {'message_id': 600, 'chat': {'id': -1002},
                                                 'from': {'id': 80, 'username': 'creator1', 'is_bot': False},
                                                 'text': '@socialora_publisher_2026_bot how do I track my order'}}]
        api = FakeTelegram(webhook_url='', updates=updates)
        app.consume_updates(self.db, api, self.now)
        # Reject asking for private info in public group
        with self.assertRaises(app.SafeError):
            app.reply_to_inbox(self.db, api, 25, 'Please send your email and share your order id here.', self.now)
        # Reject untracked link
        with self.assertRaises(app.SafeError):
            app.reply_to_inbox(self.db, api, 25, 'Use https://www.getsocialora.com/track to check status.', self.now)
        # Valid helpful reply with tracked link
        valid_reply = ('You can check live status with your order reference on the tracking page — '
                       'avoid posting private order details in the group: '
                       'https://www.getsocialora.com/track?utm_source=telegram&utm_medium=group&utm_campaign=reply_u25')
        msg_id = app.reply_to_inbox(self.db, api, 25, valid_reply, self.now)
        self.assertEqual(900, msg_id)
        row = self.db.execute('SELECT * FROM inbox WHERE update_id=25').fetchone()
        self.assertEqual('replied', row['status'])
        self.assertEqual(900, row['reply_message_id'])
        # Prevent duplicate reply
        with self.assertRaises(app.SafeError):
            app.reply_to_inbox(self.db, api, 25, valid_reply, self.now + 10)

    def test_full_seven_day_calendar_survives_restart(self):
        start = (dt.datetime.now(app.TZ).date() + dt.timedelta(days=1)).isoformat()
        self.assertEqual(37, app.import_content(self.db, app.ROOT / 'content.json', start))
        dates = list(self.db.execute('SELECT due FROM posts ORDER BY due'))
        api = FakeTelegram()
        for n, row in enumerate(dates):
            self.assertTrue(app.publish_one(self.db, api, row['due']))
            self.assertFalse(app.publish_one(self.db, api, row['due'] + 1))
            if n == 12:
                other = app.connect()
                try:
                    app.recover(other)
                    self.assertEqual(13, other.execute("SELECT COUNT(*) FROM posts WHERE status='sent'").fetchone()[0])
                finally:
                    other.close()
        self.assertEqual(37, self.db.execute("SELECT COUNT(*) FROM posts WHERE status='sent'").fetchone()[0])
        self.assertEqual(37, sum(m == 'sendMessage' for m, p in api.calls))

    def test_sanitize_reply_text_appends_utm_tags(self):
        raw = "Check our free diagnostic tool at https://getsocialora.com/tools/tiktok-shadowban-checker to see if your account is restricted."
        sanitized = app.sanitize_reply_text(raw, 'reply_u99')
        self.assertIn('utm_source=telegram', sanitized)
        self.assertIn('utm_medium=group', sanitized)
        self.assertIn('utm_campaign=reply_u99', sanitized)
        self.assertTrue(sanitized.startswith('Check our free diagnostic tool at https://www.getsocialora.com/tools/tiktok-shadowban-checker?'))

    def test_process_inbox_with_ai_success(self):
        updates = [{'update_id': 50, 'message': {'message_id': 700, 'chat': {'id': -1002},
                                                  'from': {'id': 99, 'username': 'growth_seeker', 'is_bot': False},
                                                  'text': 'How can I check if my TikTok is shadowbanned?'}}]
        api = FakeTelegram(webhook_url='', updates=updates)
        app.consume_updates(self.db, api, self.now)
        row = self.db.execute('SELECT * FROM inbox WHERE update_id=50').fetchone()
        self.assertEqual(1, row['directed'])
        self.assertEqual('pending', row['status'])

        with patch.object(app, 'call_gemini', return_value='You can test whether your account is restricted by searching your hashtag from an alt account or using our free tool: https://getsocialora.com/tools/tiktok-shadowban-checker'):
            handled = app.process_inbox_with_ai(self.db, api, 'AQ.dummy_key_123456789012345', self.now, min_delay=0)
            self.assertTrue(handled)

        updated_row = self.db.execute('SELECT * FROM inbox WHERE update_id=50').fetchone()
        self.assertEqual('replied', updated_row['status'])
        self.assertEqual(900, updated_row['reply_message_id'])
        self.assertIn('utm_campaign=reply_u50', updated_row['reply_text'])

    def test_is_directed_to_us_ignores_casual_keyword_statements(self):
        self.assertFalse(app.is_directed_to_us({'text': 'Good morning everyone'}))
        self.assertTrue(app.is_directed_to_us({'text': 'What time is my order delivered?'}))
        self.assertTrue(app.is_directed_to_us({'text': 'Why are my tiktok views stuck at 200?'}))
        self.assertTrue(app.is_directed_to_us({'text': 'I need instagram followers for my page'}))

    def test_gemini_daily_budget_and_429_cooldown_prevent_infinite_retries(self):
        for i in range(app.DAILY_GEMINI_BUDGET):
            app.record_gemini_attempt(self.db, self.now + i)
        with self.assertRaises(app.SafeError):
            app.record_gemini_attempt(self.db, self.now + 100)
        # Next day resets budget
        tomorrow = self.now + 86400
        app.record_gemini_attempt(self.db, tomorrow)
        _, used, _ = app.gemini_budget_status(self.db, tomorrow)
        self.assertEqual(1, used)
        # Cooldown blocks further attempts
        app.set_gemini_cooldown(self.db, 1800, tomorrow)
        with self.assertRaises(app.SafeError):
            app.record_gemini_attempt(self.db, tomorrow + 60)

    def test_failed_ai_replies_stop_after_three_attempts(self):
        updates = [{'update_id': 77, 'message': {'message_id': 777, 'chat': {'id': -1002},
                                                  'from': {'id': 91, 'username': 'user77', 'is_bot': False},
                                                  'text': 'How do I check tiktok shadowban?'}}]
        api = FakeTelegram(webhook_url='', updates=updates)
        app.consume_updates(self.db, api, self.now)
        with patch.object(app, 'call_gemini', return_value='too short'):
            for _ in range(3):
                self.assertFalse(app.process_inbox_with_ai(self.db, api, 'AQ.dummy_key_123456789012345', self.now, min_delay=0))
        row = self.db.execute('SELECT * FROM inbox WHERE update_id=77').fetchone()
        self.assertEqual('failed', row['status'])


    def test_toolkit_commands_are_opt_in_and_include_campaign_tracking(self):
        self.assertEqual('photo', app.toolkit_command('/photo'))
        self.assertEqual('score', app.toolkit_command('/score@socialora_publisher_2026_bot'))
        self.assertEqual('tools', app.toolkit_command('/tools'))
        self.assertIsNone(app.toolkit_command('please review my photo'))
        self.assertIsNone(app.toolkit_command('/photo extra'))
        for command in ('photo', 'blur', 'score', 'thumbnail', 'safezone'):
            message = app.toolkit_reply(command, 'reply_u999')
            self.assertIn('utm_campaign=reply_u999', message)
            self.assertIn('utm_medium=group', message)
            self.assertEqual(1, message.count('https://'))
            app.validate_reply_text(message, 'reply_u999')
            self.assertTrue(app.is_directed_to_us({'text': '/' + command}))
        self.assertNotIn('https://', app.toolkit_reply('tools', 'reply_u999'))

    def test_toolkit_command_uses_no_gemini_api_and_replies_only_once(self):
        updates = [{'update_id': 8801, 'message': {
            'message_id': 8801, 'chat': {'id': -1002},
            'from': {'id': 81, 'username': 'tester', 'is_bot': False},
            'text': '/photo'}}]
        api = FakeTelegram(webhook_url='', updates=updates)
        app.consume_updates(self.db, api, self.now)
        with patch.object(app, 'call_gemini', side_effect=AssertionError('Gemini must not be called')):
            self.assertTrue(app.process_inbox_with_ai(self.db, api, 'dummy', self.now, min_delay=0))
            self.assertFalse(app.process_inbox_with_ai(self.db, api, 'dummy', self.now, min_delay=0))
        row = self.db.execute('SELECT * FROM inbox WHERE update_id=8801').fetchone()
        self.assertEqual('replied', row['status'])
        self.assertIn('social-media-photo-resizer', row['reply_text'])


if __name__ == '__main__':
    unittest.main()
