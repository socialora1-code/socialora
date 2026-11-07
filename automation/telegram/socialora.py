#!/usr/bin/env python3
"""Socialora's token-local, no-AI-cost Telegram editorial publisher."""
import argparse
import contextlib
import datetime as dt
import fcntl
import getpass
import hashlib
import json
import logging
from logging.handlers import RotatingFileHandler
import os
from pathlib import Path
import re
import sqlite3
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

ROOT = Path(__file__).resolve().parent
STATE = Path(os.environ.get('SOCIALORA_STATE_DIR', str(Path.home() / '.local/share/socialora-telegram')))
CONFIG = Path(os.environ.get('SOCIALORA_CONFIG', str(Path.home() / '.config/socialora-telegram/config.json')))
TZ = dt.timezone(dt.timedelta(hours=3), 'Europe/Istanbul')
TARGETS = {'channel': '@SocialoraOfficial', 'group': '@SocialoraChat'}
BOT = 'socialora_publisher_2026_bot'
VERSION = '1.0.0'
LOG = logging.getLogger('socialora')


class SafeError(Exception):
    """Only fixed, non-secret text may be passed to this exception."""


class TelegramError(SafeError):
    def __init__(self, code=0, retry_after=0, uncertain=False):
        self.code, self.retry_after, self.uncertain = code, retry_after, uncertain
        super().__init__(f'Telegram request failed (code={code}; uncertain={uncertain}).')


def private_dir(path):
    path.mkdir(parents=True, exist_ok=True)
    path.chmod(0o700)


def atomic_text(path, text):
    private_dir(path.parent)
    tmp = path.with_name(path.name + '.tmp')
    fd = os.open(tmp, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
    with os.fdopen(fd, 'w') as handle:
        handle.write(text)
        handle.flush()
        os.fsync(handle.fileno())
    os.replace(tmp, path)
    path.chmod(0o600)


def load_config():
    try:
        if CONFIG.stat().st_mode & 0o077:
            raise SafeError('Config izinleri güvensiz. chmod 600 ile düzeltin.')
        result = json.loads(CONFIG.read_text())
        token = result['bot_token']
        if not re.fullmatch(r'\d{5,}:[A-Za-z0-9_-]{20,}', token):
            raise ValueError()
        return result
    except (OSError, KeyError, ValueError):
        raise SafeError('Bot kurulumu eksik. Önce setup komutunu çalıştırın.') from None


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


class Telegram:
    def __init__(self, token):
        self.token = token
        self.opener = urllib.request.build_opener(NoRedirect)

    def call(self, method, payload=None):
        # This allowlist deliberately excludes webhook mutation and message ingestion.
        if method not in {'getMe', 'getChat', 'getChatMember', 'getChatMemberCount',
                          'getWebhookInfo', 'sendMessage'}:
            raise SafeError('Desteklenmeyen Telegram işlemi.')
        req = urllib.request.Request('https://api.telegram.org/bot' + self.token + '/' + method,
                                     data=json.dumps(payload or {}).encode(),
                                     headers={'Content-Type': 'application/json'}, method='POST')
        try:
            with self.opener.open(req, timeout=20) as response:
                data = json.loads(response.read(1024 * 1024))
        except urllib.error.HTTPError as err:
            # Never print raw exceptions: Telegram URLs contain the token.
            retry = 0
            if err.code == 429:
                try:
                    retry = int(json.loads(err.read(65536)).get('parameters', {}).get('retry_after', 60))
                except (ValueError, OSError, TypeError):
                    retry = 60
            raise TelegramError(err.code, retry, uncertain=err.code >= 500) from None
        except Exception:
            raise TelegramError(0, uncertain=True) from None
        if data.get('ok') is not True:
            code = data.get('error_code', 0)
            raise TelegramError(code, data.get('parameters', {}).get('retry_after', 0),
                                uncertain=not code or code >= 500)
        return data.get('result')


def verify(api, target):
    bot = api.call('getMe')
    if not isinstance(bot, dict) or bot.get('username', '').lower() != BOT:
        raise SafeError('Bot kimliği uyuşmuyor; yayın durduruldu.')
    chat = api.call('getChat', {'chat_id': TARGETS[target]})
    expected_type = 'channel' if target == 'channel' else 'supergroup'
    if chat.get('username', '').lower() != TARGETS[target][1:].lower() or chat.get('type') != expected_type:
        raise SafeError('Hedef kimliği uyuşmuyor; yayın durduruldu.')
    member = api.call('getChatMember', {'chat_id': chat['id'], 'user_id': bot['id']})
    allowed = member.get('status') in {'creator', 'administrator'}
    if target == 'channel' and member.get('status') != 'creator':
        allowed = allowed and member.get('can_post_messages') is True
    if not allowed:
        raise SafeError('Botun yönetici/yayın yetkisi yok; yayın durduruldu.')
    return chat['id']


def connect():
    private_dir(STATE)
    db = sqlite3.connect(STATE / 'queue.sqlite3', timeout=10)
    db.row_factory = sqlite3.Row
    db.execute('PRAGMA journal_mode=WAL')
    db.execute('PRAGMA synchronous=FULL')
    db.executescript('''
        CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS posts (
          id TEXT PRIMARY KEY, target TEXT NOT NULL, text TEXT NOT NULL,
          digest TEXT NOT NULL, due INTEGER NOT NULL, expires INTEGER NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending', attempts INTEGER NOT NULL DEFAULT 0,
          next_attempt INTEGER NOT NULL DEFAULT 0, message_id INTEGER, sent_at INTEGER,
          note TEXT NOT NULL DEFAULT '', UNIQUE(target, digest));
        CREATE TABLE IF NOT EXISTS snapshots (
          day TEXT PRIMARY KEY, channel INTEGER, members INTEGER, captured_at INTEGER NOT NULL);
    ''')
    db.commit()
    (STATE / 'queue.sqlite3').chmod(0o600)
    return db


@contextlib.contextmanager
def worker_lock(name='worker.lock'):
    private_dir(STATE)
    with (STATE / name).open('a') as lock:
        try:
            fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            raise SafeError('Başka yayın işlemi zaten çalışıyor.') from None
        yield


def canonical_text(text):
    # Campaign tags must not let identical copy bypass duplicate detection.
    return ' '.join(re.sub(r'https://[^\s]+',
                         lambda m: m[0].split('?')[0], text.lower()).split())


def validate_posts(data):
    if not isinstance(data, dict) or data.get('brand') != 'Socialora' or data.get('version') != 1:
        raise SafeError('İçerik paketi Socialora formatında değil.')
    posts, seen, digests, perday = data.get('posts', []), set(), set(), {}
    if not isinstance(posts, list) or not 1 <= len(posts) <= 80:
        raise SafeError('İçerik sayısı geçersiz.')
    for p in posts:
        if not isinstance(p, dict):
            raise SafeError('Geçersiz içerik kaydı.')
        if not re.fullmatch(r'[a-z0-9_-]{3,80}', str(p.get('id', ''))) or p['id'] in seen:
            raise SafeError('İçerik kimliği geçersiz veya tekrarlı.')
        seen.add(p['id'])
        target, text, day, hour = p.get('target'), p.get('text'), p.get('day'), p.get('time')
        if target not in TARGETS or not isinstance(text, str) or not 30 <= len(text.encode('utf-16-le')) // 2 <= 3500:
            raise SafeError('İçerik hedefi veya uzunluğu geçersiz.')
        if not isinstance(day, int) or isinstance(day, bool) or not 0 <= day <= 60:
            raise SafeError('İçerik günü geçersiz.')
        if not isinstance(hour, str) or not re.fullmatch(r'(0[8-9]|1\d|2[01]):[0-5]\d', hour):
            raise SafeError('Yayın saati 08.00–21.59 arasında olmalı.')
        if re.search(r'\b\d{5,}:[A-Za-z0-9_-]{20,}', text) or re.search(r'\b(?:100% safe|never drops|guaranteed followers)\b', text, re.I):
            raise SafeError('İçerikte yasak bilgi veya garanti bulundu.')
        digest = hashlib.sha256(canonical_text(text).encode()).hexdigest()
        if (target, digest) in digests:
            raise SafeError('Tekrarlı içerik bulundu.')
        digests.add((target, digest))
        key = (target, day)
        perday[key] = perday.get(key, 0) + 1
        if perday[key] > (2 if target == 'channel' else 1):
            raise SafeError('Günlük yayın sınırı aşıldı.')
        for raw in re.findall(r'https?://[^\s]+', text):
            u = urllib.parse.urlsplit(raw)
            if u.scheme != 'https' or u.username or u.password or u.port:
                raise SafeError('İçerik bağlantısı güvenli değil.')
            if u.netloc == 'www.getsocialora.com':
                query = urllib.parse.parse_qs(u.query)
                if query.get('utm_source') != ['telegram'] or query.get('utm_medium') != [target] or query.get('utm_campaign') != [p['id']]:
                    raise SafeError('Site bağlantısında takip etiketleri eksik.')
            elif u.netloc != 't.me' or u.path not in {'/SocialoraOfficial', '/SocialoraChat'} or u.query:
                raise SafeError('İçerikte beklenmeyen dış bağlantı var.')
    return posts


def import_content(db, file, start):
    posts = validate_posts(json.loads(Path(file).read_text()))
    start_date = dt.date.fromisoformat(start)
    if start_date < dt.datetime.now(TZ).date():
        raise SafeError('Geçmiş tarihe yayın planlanamaz.')
    inserted = 0
    # The entire batch rolls back on any changed ID or duplicate; never partial import.
    with db:
        for p in posts:
            due = int(dt.datetime.combine(start_date + dt.timedelta(days=p['day']),
                                         dt.time.fromisoformat(p['time']), TZ).timestamp())
            digest = hashlib.sha256(canonical_text(p['text']).encode()).hexdigest()
            previous = db.execute('SELECT * FROM posts WHERE id=?', (p['id'],)).fetchone()
            if previous:
                if previous['text'] != p['text'] or previous['target'] != p['target']:
                    raise SafeError('Aynı kimlikte değiştirilmiş içerik var; yeni kimlik kullanın.')
                continue
            try:
                db.execute('INSERT INTO posts (id,target,text,digest,due,expires) VALUES (?,?,?,?,?,?)',
                           (p['id'], p['target'], p['text'], digest, due, due + 90 * 60))
            except sqlite3.IntegrityError:
                raise SafeError('Bu metin başka kimlikle zaten kayıtlı; içe aktarma iptal.') from None
            inserted += 1
    return inserted


def pause(reason='Kullanıcı duraklattı.'):
    atomic_text(STATE / 'PAUSED', reason + '\n')


def recover(db):
    with db:
        count = db.execute("UPDATE posts SET status='unknown',note='Interrupted while sending; check Telegram.' WHERE status='sending'").rowcount
    if count:
        pause('Kesinti sırasında sonucu belirsiz yayın var; Telegram kontrolü gerekiyor.')


def publish_one(db, api, now):
    if (STATE / 'PAUSED').exists():
        return False
    with db:
        db.execute("UPDATE posts SET status='expired',note='Offline/stale slot; not replayed.' WHERE status='pending' AND expires < ?", (now,))
    post = db.execute("SELECT * FROM posts WHERE status='pending' AND due<=? AND next_attempt<=? ORDER BY due,id LIMIT 1", (now, now)).fetchone()
    if not post:
        return False
    # Across restarts and multiple imported batches: no catch-up bursts or more than 2/day/channel.
    local_date = dt.datetime.fromtimestamp(now, TZ).date()
    midnight = int(dt.datetime.combine(local_date, dt.time(), TZ).timestamp())
    today_count = db.execute("SELECT COUNT(*) FROM posts WHERE target=? AND status='sent' AND sent_at>=?", (post['target'], midnight)).fetchone()[0]
    last = db.execute("SELECT MAX(sent_at) FROM posts WHERE status='sent'").fetchone()[0]
    if today_count >= (2 if post['target'] == 'channel' else 1) or (last and now - last < 1800):
        return False
    try:
        chat_id = verify(api, post['target'])
    except SafeError as error:
        # No send attempted. Safe to retry read-only preflight later, without a burst.
        with db:
            db.execute('UPDATE posts SET next_attempt=?,note=? WHERE id=?',
                       (now + 900, 'Preflight unavailable; no send attempted.', post['id']))
        LOG.warning('preflight_unavailable id=%s', post['id'])
        if not isinstance(error, TelegramError) or error.code in {400, 401, 403}:
            pause('Bot kimliği, hedef veya yetki doğrulaması başarısız; doctor ile kontrol edin.')
        return False
    if (STATE / 'PAUSED').exists():
        return False
    # Commit BEFORE contacting Telegram. On crash, sending becomes unknown, never auto-replayed.
    with db:
        changed = db.execute("UPDATE posts SET status='sending',attempts=attempts+1 WHERE id=? AND status='pending'", (post['id'],)).rowcount
    if changed != 1:
        return False
    try:
        sent = api.call('sendMessage', {'chat_id': chat_id, 'text': post['text'],
                                      'link_preview_options': {'is_disabled': True},
                                      'disable_notification': False})
        if not isinstance(sent, dict) or not isinstance(sent.get('message_id'), int) or sent['message_id'] <= 0 or sent.get('chat', {}).get('id') != chat_id:
            raise TelegramError(0, uncertain=True)
    except TelegramError as err:
        if err.code == 429 and post['attempts'] < 3:
            status, retry = 'pending', now + max(60, min(int(err.retry_after or 60), 86400))
        else:
            status, retry = ('unknown' if err.uncertain else 'failed'), 0
        with db:
            db.execute('UPDATE posts SET status=?,next_attempt=?,note=? WHERE id=?',
                       (status, retry, f'Telegram code={err.code}; uncertain={err.uncertain}', post['id']))
        if status == 'unknown' or err.code in {401, 403}:
            pause('Yayın sonucu veya bot erişimi kontrol edilmeli; otomatik tekrar yok.')
        LOG.warning('send_result id=%s status=%s code=%s', post['id'], status, err.code)
        return False
    with db:
        db.execute("UPDATE posts SET status='sent',message_id=?,sent_at=?,note='' WHERE id=?",
                   (sent['message_id'], now, post['id']))
    LOG.info('sent id=%s target=%s message_id=%d', post['id'], post['target'], sent['message_id'])
    return True


def snapshot(db, api, now):
    day = dt.datetime.fromtimestamp(now, TZ).date().isoformat()
    if db.execute('SELECT 1 FROM snapshots WHERE day=?', (day,)).fetchone():
        return
    counts = []
    for target in TARGETS:
        chat = verify(api, target)
        counts.append(api.call('getChatMemberCount', {'chat_id': chat}))
    with db:
        db.execute('INSERT INTO snapshots VALUES (?,?,?,?)', (day, *counts, now))


def report(db, now=None):
    now = int(now or time.time())
    today = dt.datetime.fromtimestamp(now, TZ).date()
    midnight = int(dt.datetime.combine(today, dt.time(), TZ).timestamp())
    counts = dict(db.execute('SELECT status,COUNT(*) FROM posts GROUP BY status').fetchall())
    snaps = db.execute('SELECT * FROM snapshots ORDER BY day DESC LIMIT 2').fetchall()
    latest = snaps[0] if snaps else None
    yesterday = next((s for s in snaps if s['day'] == (today-dt.timedelta(days=1)).isoformat()), None)
    members = f"Kanal {latest['channel']}; grup {latest['members']} ({latest['day']})" if latest else 'Üye sayısı: veri yok'
    previous = f"Dün: kanal {yesterday['channel']}; grup {yesterday['members']}" if yesterday else 'Dünkü üye sayısı: veri yok'
    sent = db.execute("SELECT COUNT(*) FROM posts WHERE status='sent' AND sent_at>=?", (midnight,)).fetchone()[0]
    status = 'DURAKLATILDI' if (STATE / 'PAUSED').exists() else 'YAYIN İZNİ AÇIK'
    text = '\n'.join([f'Socialora — {today} — {status}', members, previous,
                      f'Bugün yayınlanan: {sent}; bekleyen: {counts.get("pending", 0)}',
                      f'Belirsiz: {counts.get("unknown", 0)}; hatalı: {counts.get("failed", 0)}; süresi geçen: {counts.get("expired", 0)}',
                      'Site tıklaması / satış / en iyi gönderi: analitik verisi yok',
                      'AI/API çağrısı: 0; otomatik grup yanıtı: kapalı',
                      'Plan: kuyruk bitmeden yeni, incelenmiş haftalık içerik ekle.'])
    atomic_text(STATE / 'report.txt', text + '\n')
    return text


def setup():
    if CONFIG.exists():
        raise SafeError('Kurulum zaten var. Mevcut token üzerine yazılmadı; doctor ile kontrol edin.')
    if not sys.stdin.isatty():
        raise SafeError('Token yalnızca telefonun etkileşimli terminalinde girilebilir.')
    print('Bot tokenini yalnızca buraya girin; yazarken görünmez. Sohbete göndermeyin.')
    token = getpass.getpass('Socialora Publisher token: ').strip()
    if not re.fullmatch(r'\d{5,}:[A-Za-z0-9_-]{20,}', token):
        raise SafeError('Bot token biçimi geçersiz.')
    api = Telegram(token)
    for target in TARGETS:
        verify(api, target)
    webhook = api.call('getWebhookInfo')
    private_dir(CONFIG.parent)
    atomic_text(CONFIG, json.dumps({'bot_token': token, 'version': 1}, indent=2) + '\n')
    pause('İlk kurulum: içerik ve mevcut botun yayın kuyruğu kontrol edilmeli.')
    print('Bot doğrulandı; anahtar telefonda özel dosyaya kaydedildi. Yayın henüz kapalı.')
    print('Webhook ayarı değiştirilmedi. Gelen grup mesajlarını henüz okumuyoruz.')
    print('Başka webhook var:', bool(webhook.get('url')))


def doctor():
    api = Telegram(load_config()['bot_token'])
    for target in TARGETS:
        chat_id = verify(api, target)
        count = api.call('getChatMemberCount', {'chat_id': chat_id})
        print(f'{TARGETS[target]}: kimlik ve yayın yetkisi doğru; üye={count}')
    print('Mevcut webhook:', bool(api.call('getWebhookInfo').get('url')), '(değiştirilmedi)')
    print('AI/API kullanımı: yok. Kişisel Telegram oturumu: kullanılmıyor.')


def main():
    os.umask(0o077)
    parser = argparse.ArgumentParser(description='Socialora Telegram — yalnızca kendi kanal/grubuna yayın')
    sub = parser.add_subparsers(dest='command', required=True)
    for command in ['setup', 'doctor', 'status', 'pause', 'run', 'tick', 'report', 'check-content']:
        sub.add_parser(command)
    preview = sub.add_parser('preview')
    preview.add_argument('--file', default=str(ROOT / 'content.json'))
    imp = sub.add_parser('import')
    imp.add_argument('--file', default=str(ROOT / 'content.json'))
    imp.add_argument('--start', default=(dt.datetime.now(TZ).date() + dt.timedelta(days=1)).isoformat())
    resume = sub.add_parser('resume')
    resume.add_argument('--queue-reviewed', action='store_true')
    resolve = sub.add_parser('resolve')
    resolve.add_argument('id')
    action = resolve.add_mutually_exclusive_group(required=True)
    action.add_argument('--sent-message-id', type=int)
    action.add_argument('--skip', action='store_true')
    args = parser.parse_args()
    if args.command == 'setup':
        setup()
        return
    if args.command == 'doctor':
        doctor()
        return
    if args.command in {'preview', 'check-content'}:
        posts = validate_posts(json.loads(Path(getattr(args, 'file', ROOT / 'content.json')).read_text()))
        if args.command == 'preview':
            for post in sorted(posts, key=lambda p: (p['day'], p['time'])):
                print(f"\n[{post['day'] + 1}. gün {post['time']} — {post['target']} — {post['id']}]\n{post['text']}")
        print(f'Kontrol tamam: {len(posts)} farklı içerik. Hiçbir şey gönderilmedi.')
        return
    db = connect()
    try:
        if args.command == 'pause':
            pause()
        elif args.command == 'import':
            with worker_lock():
                first = not db.execute('SELECT 1 FROM posts LIMIT 1').fetchone()
                if first:
                    pause('İlk içerik yüklendi; yayın başlangıcı onayı bekleniyor.')
                print('Yeni içerik:', import_content(db, args.file, args.start), '— henüz yayınlanmadı.')
        elif args.command == 'resume':
            with worker_lock():
                recover(db)
                if db.execute("SELECT 1 FROM posts WHERE status='unknown' LIMIT 1").fetchone():
                    raise SafeError('Belirsiz gönderileri Telegram’dan kontrol edip resolve ile işaretleyin.')
                if not args.queue_reviewed:
                    raise SafeError('ControllerBot kuyruğunda çakışma olmadığını kontrol edin; sonra --queue-reviewed kullanın.')
                doctor()
                if not db.execute("SELECT 1 FROM posts WHERE status='pending' AND expires>?", (int(time.time()),)).fetchone():
                    raise SafeError('Gelecekte bekleyen içerik yok; önce import yapın.')
                (STATE / 'PAUSED').unlink(missing_ok=True)
                print('Yayın açıldı. Gönderiler planlanan saatlerinde yayınlanacak.')
        elif args.command == 'resolve':
            with worker_lock():
                if args.sent_message_id is not None and args.sent_message_id <= 0:
                    raise SafeError('Geçerli Telegram mesaj numarası girin.')
                with db:
                    changed = db.execute("UPDATE posts SET status=?,message_id=?,sent_at=?,note='Manually reconciled; no resend.' WHERE id=? AND status IN ('unknown','failed','sending')",
                                         ('sent' if args.sent_message_id else 'skipped', args.sent_message_id,
                                          int(time.time()) if args.sent_message_id else None, args.id)).rowcount
                if changed != 1:
                    raise SafeError('Çözümlenebilir bir gönderi bulunamadı.')
                print('Durum kaydedildi; tekrar gönderim yapılmadı.')
        elif args.command in {'run', 'tick'}:
            api = Telegram(load_config()['bot_token'])
            private_dir(STATE)
            handler = RotatingFileHandler(STATE / 'worker.log', maxBytes=250000, backupCount=2)
            handler.setFormatter(logging.Formatter('%(asctime)s %(levelname)s %(message)s'))
            LOG.addHandler(handler)
            LOG.setLevel(logging.INFO)
            with worker_lock('runner.lock'):
                with worker_lock():
                    recover(db)
                last_snapshot_attempt, last_report, last_backup = 0, 0, ''
                while True:
                    now = int(time.time())
                    with worker_lock():
                        publish_one(db, api, now)
                    if now - last_snapshot_attempt >= 1800:
                        last_snapshot_attempt = now
                        try:
                            snapshot(db, api, now)
                        except SafeError:
                            LOG.warning('member_snapshot_unavailable')
                    if now - last_report >= 300:
                        report(db, now)
                        last_report = now
                    day = dt.datetime.fromtimestamp(now, TZ).date().isoformat()
                    if day != last_backup:
                        with contextlib.closing(sqlite3.connect(STATE / 'queue.backup.sqlite3')) as backup:
                            db.backup(backup)
                        last_backup = day
                    atomic_text(STATE / 'heartbeat', str(now))
                    if args.command == 'tick':
                        break
                    time.sleep(30)
        else:
            print(report(db))
            if args.command == 'status':
                heartbeat = STATE / 'heartbeat'
                age = int(time.time()) - int(heartbeat.read_text()) if heartbeat.exists() else None
                print('Son motor kontrolü (saniye):', age if age is not None else 'henüz çalışmadı')
                for p in db.execute("SELECT id,status,message_id FROM posts WHERE status IN ('unknown','failed') ORDER BY due LIMIT 8"):
                    print(dict(p))
    finally:
        db.close()


if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        # Built-in exceptions may contain token paths or data. Only SafeError is printable.
        print(str(error) if isinstance(error, SafeError) else 'İşlem tamamlanamadı; veri/config dosyalarını kontrol edin. Yayınları körlemesine tekrar göndermeyin.', file=sys.stderr)
        sys.exit(1)
    except KeyboardInterrupt:
        sys.exit(0)
