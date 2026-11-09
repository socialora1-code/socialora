#!/usr/bin/env python3
"""Socialora's token-local, no-AI-cost Telegram editorial publisher."""
import argparse
import contextlib
import datetime as dt
try:
    import fcntl
except ImportError:
    fcntl = None
    import msvcrt
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
VERSION = '1.2.0'
LOG = logging.getLogger('socialora')


class SafeError(Exception):
    """Only fixed, non-secret text may be passed to this exception."""


class TelegramError(SafeError):
    def __init__(self, code=0, retry_after=0, uncertain=False):
        self.code, self.retry_after, self.uncertain = code, retry_after, uncertain
        super().__init__(f'Telegram request failed (code={code}; uncertain={uncertain}).')


def private_dir(path):
    path.mkdir(parents=True, exist_ok=True)
    if os.name != 'nt':
        path.chmod(0o700)


def atomic_text(path, text):
    private_dir(path.parent)
    tmp = path.with_name(path.name + '.tmp')
    fd = os.open(tmp, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
    with os.fdopen(fd, 'w', encoding='utf-8') as handle:
        handle.write(text)
        handle.flush()
        os.fsync(handle.fileno())
    os.replace(tmp, path)
    if os.name != 'nt':
        path.chmod(0o600)


def load_config():
    try:
        if os.name != 'nt' and (CONFIG.stat().st_mode & 0o077):
            raise SafeError('Config izinleri güvensiz. chmod 600 ile düzeltin.')
        result = json.loads(CONFIG.read_text(encoding='utf-8'))
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
        # This allowlist deliberately excludes webhook mutation and destructive methods.
        if method not in {'getMe', 'getChat', 'getChatMember', 'getChatMemberCount',
                          'getWebhookInfo', 'getUpdates', 'sendMessage', 'setChatTitle', 'setChatDescription', 'pinChatMessage'}:
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
        CREATE TABLE IF NOT EXISTS inbox (
          update_id INTEGER PRIMARY KEY, chat_id INTEGER NOT NULL, message_id INTEGER NOT NULL,
          sender TEXT NOT NULL DEFAULT '', reply_to_message_id INTEGER, text TEXT NOT NULL,
          directed INTEGER NOT NULL DEFAULT 0, status TEXT NOT NULL DEFAULT 'pending',
          reply_message_id INTEGER, reply_text TEXT NOT NULL DEFAULT '',
          received_at INTEGER NOT NULL, replied_at INTEGER, note TEXT NOT NULL DEFAULT '',
          UNIQUE(chat_id, message_id));
    ''')
    db.execute("UPDATE inbox SET status='ignored',note='Channel forward/service sender.' WHERE status='pending' AND (sender IN ('Telegram','GroupAnonymousBot','Channel_Bot') OR text LIKE '%utm_source=telegram%')")
    db.commit()
    (STATE / 'queue.sqlite3').chmod(0o600)
    return db


@contextlib.contextmanager
def worker_lock(name='worker.lock'):
    private_dir(STATE)
    lock_path = STATE / name
    with lock_path.open('a+b') as lock:
        if fcntl is not None:
            try:
                fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
            except BlockingIOError:
                raise SafeError('Başka yayın işlemi zaten çalışıyor.') from None
            yield
        else:
            lock.seek(0)
            if lock.tell() == 0 and lock_path.stat().st_size == 0:
                lock.write(b'1')
                lock.flush()
            lock.seek(0)
            try:
                msvcrt.locking(lock.fileno(), msvcrt.LK_NBLCK, 1)
            except OSError:
                raise SafeError('Başka yayın işlemi zaten çalışıyor.') from None
            try:
                yield
            finally:
                try:
                    lock.seek(0)
                    msvcrt.locking(lock.fileno(), msvcrt.LK_UNLCK, 1)
                except OSError:
                    pass


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
        if not isinstance(hour, str) or not re.fullmatch(r'(0[8-9]|1\d|2[0-2]):[0-5]\d', hour):
            raise SafeError('Yayın saati 08.00–22.59 arasında olmalı.')
        if re.search(r'\b\d{5,}:[A-Za-z0-9_-]{20,}', text) or re.search(r'\b(?:100% safe|never drops|guaranteed followers)\b', text, re.I):
            raise SafeError('İçerikte yasak bilgi veya garanti bulundu.')
        digest = hashlib.sha256(canonical_text(text).encode()).hexdigest()
        if (target, digest) in digests:
            raise SafeError('Tekrarlı içerik bulundu.')
        digests.add((target, digest))
        key = (target, day)
        perday[key] = perday.get(key, 0) + 1
        if perday[key] > (5 if target == 'channel' else 1):
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
    posts = validate_posts(json.loads(Path(file).read_text(encoding='utf-8')))
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
        inbox_count = db.execute("UPDATE inbox SET status='unknown',note='Interrupted while replying; check Telegram.' WHERE status='sending'").rowcount
    if count or inbox_count:
        pause('Kesinti sırasında sonucu belirsiz yayın veya yanıt var; Telegram kontrolü gerekiyor.')


def is_directed_to_us(msg):
    text = (msg.get('text') or msg.get('caption') or '').strip()
    if not text or len(text) < 3:
        return False
    lower = text.lower()
    if f'@{BOT}' in lower or '@socialoraofficial' in lower or 'socialora' in lower:
        return True
    reply = msg.get('reply_to_message') or {}
    reply_from = reply.get('from') or {}
    reply_sender_chat = reply.get('sender_chat') or {}
    if reply_from.get('username', '').lower() == BOT:
        return True
    if reply_sender_chat.get('username', '').lower() in {'socialoraofficial', 'socialorachat'}:
        return True
    if '?' in text:
        return True
    keywords = (
        'views', 'stuck', 'shadowban', 'reels', 'tiktok', 'instagram', 'telegram', 'youtube',
        'twitter', 'followers', 'likes', 'subscribers', 'watchtime', 'watch time', 'reach',
        'algorithm', 'price', 'pricing', 'cost', 'buy', 'order', 'refill', 'delivery', 'crypto',
        'usdt', 'btc', 'payment', 'free', 'tool', 'drop', 'calculator', 'resize', 'crop',
        'photo', 'bio', 'thumbnail', 'caption', 'safe zone', 'help', 'support', 'panel', 'service',
        'how', 'why', 'what', 'where', 'when', 'who', 'can ', 'anyone', 'admin', 'work',
        'grow', 'account', 'video', 'page', 'channel', 'trial', 'legit', 'nasıl', 'fiyat', 'yardım',
    )
    return len(text) >= 6 and any(k in lower for k in keywords)


def consume_updates(db, api, now):
    if (STATE / 'PAUSED').exists():
        return 0
    webhook = api.call('getWebhookInfo')
    if not isinstance(webhook, dict) or webhook.get('url'):
        LOG.warning('polling_skipped_webhook_active')
        return 0
    group_chat_id = verify(api, 'group')
    row = db.execute("SELECT value FROM meta WHERE key='last_update_id'").fetchone()
    offset = int(row['value']) + 1 if row else None
    payload = {'timeout': 0, 'limit': 50, 'allowed_updates': ['message']}
    if offset is not None:
        payload['offset'] = offset
    updates = api.call('getUpdates', payload)
    if not isinstance(updates, list):
        return 0
    stored = 0
    max_uid = int(row['value']) if row else None
    with db:
        for upd in updates:
            if not isinstance(upd, dict) or not isinstance(upd.get('update_id'), int):
                continue
            uid = upd['update_id']
            if max_uid is None or uid > max_uid:
                max_uid = uid
            msg = upd.get('message')
            if not isinstance(msg, dict) or not isinstance(msg.get('message_id'), int):
                continue
            chat = msg.get('chat') or {}
            if chat.get('id') != group_chat_id:
                continue
            sender_info = msg.get('from') or {}
            sender_username = (sender_info.get('username') or '').lower()
            if sender_info.get('is_bot') is True or sender_username in {BOT, 'telegram', 'channelsupportbot'}:
                continue
            if msg.get('is_automatic_forward') or msg.get('sender_chat'):
                continue
            # Also ignore forwarded messages from our own channel
            forward_from_chat = msg.get('forward_from_chat') or {}
            if forward_from_chat.get('username', '').lower() in {'socialoraofficial', 'socialorachat'}:
                continue
            text = (msg.get('text') or msg.get('caption') or '').strip()
            if not text:
                continue
            sender = sender_info.get('username') or sender_info.get('first_name') or str(sender_info.get('id', 'member'))
            reply_to = (msg.get('reply_to_message') or {}).get('message_id')
            directed = 1 if is_directed_to_us(msg) else 0
            status = 'pending' if directed else 'ignored'
            msg_date = msg.get('date')
            received_ts = min(now, int(msg_date)) if isinstance(msg_date, int) and msg_date > 0 else now
            cur = db.execute('''
                INSERT OR IGNORE INTO inbox
                (update_id, chat_id, message_id, sender, reply_to_message_id, text, directed, status, received_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (uid, group_chat_id, msg['message_id'], str(sender)[:80], reply_to, text[:2000], directed, status, received_ts))
            if cur.rowcount == 1 and directed:
                stored += 1
        if max_uid is not None:
            db.execute("INSERT INTO meta(key, value) VALUES('last_update_id', ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value", (str(max_uid),))
    return stored


def validate_reply_text(text, campaign_id):
    text = text.strip()
    if not 15 <= len(text.encode('utf-16-le')) // 2 <= 1200:
        raise SafeError('Yanıt uzunluğu 15–1200 karakter arasında olmalı.')
    if re.search(r'\b\d{5,}:[A-Za-z0-9_-]{20,}', text) or re.search(r'\b(?:100% safe|never drops|guaranteed followers)\b', text, re.I):
        raise SafeError('Yanıtta yasak bilgi veya garanti bulundu.')
    if re.search(r'\b(?:send your email|share your order id|what is your order number|send payment screenshot)\b', text, re.I):
        raise SafeError('Herkese açık grupta özel sipariş/iletişim bilgisi istenemez.')
    for raw_match in re.findall(r'https?://[^\s]+', text):
        raw = raw_match.rstrip('.,!?)')
        u = urllib.parse.urlsplit(raw)
        if u.scheme != 'https' or u.username or u.password or u.port:
            raise SafeError('Yanıt bağlantısı güvenli değil.')
        if u.netloc in {'www.getsocialora.com', 'getsocialora.com'}:
            query = urllib.parse.parse_qs(u.query)
            if query.get('utm_source') != ['telegram'] or query.get('utm_medium') != ['group'] or query.get('utm_campaign') != [campaign_id]:
                raise SafeError(f'Site bağlantısında takip etiketleri eksik (utm_source=telegram&utm_medium=group&utm_campaign={campaign_id}).')
        elif u.netloc != 't.me' or u.path not in {'/SocialoraOfficial', '/SocialoraChat'} or u.query:
            raise SafeError('Yanıtta beklenmeyen dış bağlantı var.')
    return text


EMOJI_RE = re.compile('[\U0001F000-\U0001FAFF\u2600-\u27BF\u2B00-\u2BFF\uFE0F\u200D]')


def humanize_reply(text):
    """Group replies read like a person typing: no emoji, markdown, or dash flourishes."""
    text = EMOJI_RE.sub('', text)
    text = re.sub(r'[*_`#]+', '', text).replace('\u2014', ',').replace('\u2013', '-')
    text = re.sub(r'[!]{2,}', '!', text)
    return re.sub(r'[ \t]{2,}', ' ', text).strip()


def render_html(text):
    """Show long tracked site URLs as short clickable text; the tracking stays in the href."""
    import html as _html
    out, last = [], 0
    for m in re.finditer(r'https?://[^\s]+', text):
        out.append(_html.escape(text[last:m.start()], quote=False))
        raw = m.group(0).rstrip('.,!?)')
        tail = m.group(0)[len(raw):]
        u = urllib.parse.urlsplit(raw)
        if u.netloc in {'www.getsocialora.com', 'getsocialora.com'}:
            label = 'getsocialora.com' + (u.path.rstrip('/') or '')
            out.append('<a href="' + _html.escape(raw, quote=True) + '">' + _html.escape(label, quote=False) + '</a>' + _html.escape(tail, quote=False))
        else:
            out.append(_html.escape(m.group(0), quote=False))
        last = m.end()
    out.append(_html.escape(text[last:], quote=False))
    return ''.join(out)


def sanitize_reply_text(text, campaign_id):
    text = humanize_reply(text)
    def replace_url(m):
        full = m.group(0)
        url = full.rstrip('.,!?)')
        tail = full[len(url):]
        u = urllib.parse.urlsplit(url)
        if u.netloc in {'getsocialora.com', 'www.getsocialora.com'}:
            qs = urllib.parse.parse_qs(u.query)
            qs['utm_source'] = ['telegram']
            qs['utm_medium'] = ['group']
            qs['utm_campaign'] = [campaign_id]
            new_query = urllib.parse.urlencode(qs, doseq=True)
            return urllib.parse.urlunsplit((u.scheme or 'https', 'www.getsocialora.com', u.path or '/', new_query, '')) + tail
        return full
    return re.sub(r'https?://[^\s]+', replace_url, text.strip())


DAILY_GEMINI_BUDGET = 40


def gemini_budget_status(db, now=None):
    now = int(now or time.time())
    day = dt.datetime.fromtimestamp(now, TZ).date().isoformat()
    day_row = db.execute("SELECT value FROM meta WHERE key='gemini_calls_day'").fetchone()
    cnt_row = db.execute("SELECT value FROM meta WHERE key='gemini_calls_count'").fetchone()
    cool_row = db.execute("SELECT value FROM meta WHERE key='gemini_cooldown_until'").fetchone()
    used = int(cnt_row['value']) if (day_row and day_row['value'] == day and cnt_row) else 0
    cooldown_until = int(cool_row['value']) if cool_row else 0
    return day, used, max(0, cooldown_until - now)


def record_gemini_attempt(db, now=None):
    now = int(now or time.time())
    day, used, cooldown_left = gemini_budget_status(db, now)
    if cooldown_left > 0:
        raise SafeError(f'Gemini geri çekilme süresinde ({cooldown_left}sn kaldı).')
    if used >= DAILY_GEMINI_BUDGET:
        raise SafeError(f'Günlük Gemini bütçesi ({DAILY_GEMINI_BUDGET}) doldu.')
    with db:
        db.execute("INSERT INTO meta(key,value) VALUES('gemini_calls_day',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value", (day,))
        db.execute("INSERT INTO meta(key,value) VALUES('gemini_calls_count',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value", (str(used + 1),))


def set_gemini_cooldown(db, seconds, now=None):
    now = int(now or time.time())
    until = now + max(60, min(int(seconds), 86400))
    with db:
        db.execute("INSERT INTO meta(key,value) VALUES('gemini_cooldown_until',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value", (str(until),))


_MODEL_CACHE = {'at': 0, 'models': []}


def discover_gemini_models(api_key):
    """Ask the API which flash models this key can use; static names get retired."""
    now = time.time()
    if _MODEL_CACHE['models'] and now - _MODEL_CACHE['at'] < 21600:
        return _MODEL_CACHE['models']
    found = []
    try:
        req = urllib.request.Request('https://generativelanguage.googleapis.com/v1beta/models?pageSize=200',
                                     headers={'x-goog-api-key': api_key})
        with urllib.request.urlopen(req, timeout=15) as res:
            data = json.loads(res.read(1024 * 1024))
        for m in data.get('models', []):
            name = str(m.get('name', '')).replace('models/', '')
            if 'flash' in name and 'generateContent' in (m.get('supportedGenerationMethods') or []) \
                    and not re.search(r'image|tts|live|audio|preview|exp|thinking|robotics|computer|embedding', name):
                found.append(name)
    except Exception:
        found = []
    def rank(n):
        ver = re.search(r'gemini-(\d+(?:\.\d+)?)', n)
        return (-(float(ver.group(1)) if ver else 0), 'lite' in n, len(n))
    found.sort(key=rank)
    models = found[:4] or ['gemini-flash-latest', 'gemini-2.5-flash', 'gemini-flash-lite-latest']
    _MODEL_CACHE.update({'at': now, 'models': models})
    return models


def call_gemini(api_key, prompt, db=None, now=None):
    if db is not None:
        record_gemini_attempt(db, now)
    models = discover_gemini_models(api_key)
    last_error = None
    for model in models:
        config = {'temperature': 0.7, 'maxOutputTokens': 700}
        if '2.5' in model:
            config['thinkingConfig'] = {'thinkingBudget': 0}
        payload = json.dumps({'contents': [{'parts': [{'text': prompt}]}], 'generationConfig': config}).encode('utf-8')
        url = f'https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent'
        req = urllib.request.Request(url, data=payload, headers={
            'Content-Type': 'application/json',
            'x-goog-api-key': api_key,
        }, method='POST')
        try:
            with urllib.request.urlopen(req, timeout=15) as res:
                data = json.loads(res.read(1024 * 1024))
                candidates = data.get('candidates') or []
                if candidates:
                    parts = candidates[0].get('content', {}).get('parts', [])
                    if parts and parts[0].get('text'):
                        return parts[0]['text'].strip()
        except urllib.error.HTTPError as err:
            last_error = err
            if err.code in {400, 404, 429, 500, 502, 503}:
                continue
            raise SafeError(f'Gemini API hatası (kod {err.code}).') from None
        except Exception:
            if db is not None:
                set_gemini_cooldown(db, 120, now)
            raise SafeError('Gemini API bağlantı hatası.') from None
    if last_error is not None:
        _MODEL_CACHE['at'] = 0
        if last_error.code == 429:
            if db is not None:
                set_gemini_cooldown(db, 180, now)
            raise SafeError('Gemini API kota/hız sınırı (kod 429); 3dk geri çekilme uygulandı.') from None
        if last_error.code >= 500 and db is not None:
            set_gemini_cooldown(db, 180, now)
        raise SafeError(f'Gemini API hatası (kod {last_error.code}).')
    raise SafeError('Gemini API yanıt vermedi.')


def record_inbox_ai_failure(db, update_id, reason=''):
    with db:
        if reason:
            db.execute("UPDATE inbox SET reply_text=? WHERE update_id=? AND status='pending'", (('FAIL: ' + str(reason))[:200], update_id))
        db.execute("UPDATE inbox SET note=note||'x' WHERE update_id=? AND status='pending'", (update_id,))
        db.execute("UPDATE inbox SET status='failed' WHERE update_id=? AND status='pending' AND length(note)>=3", (update_id,))


def process_inbox_with_ai(db, api, api_key, now, min_delay=120, verbose=False):
    if (STATE / 'PAUSED').exists():
        return False
    _, used, cooldown_left = gemini_budget_status(db, now)
    if cooldown_left > 0 or used >= DAILY_GEMINI_BUDGET:
        return False
    # Prioritize fresh untried questions (length(note)=0, newest update_id) so an old stuck row never blocks new messages
    row = db.execute("SELECT * FROM inbox WHERE status='pending' AND directed=1 AND (? - received_at >= ? + (CASE WHEN ?>0 THEN update_id % 60 ELSE 0 END)) ORDER BY length(note) ASC, update_id DESC LIMIT 1", (now, min_delay, min_delay)).fetchone()
    if not row:
        return False
    update_id = row['update_id']
    campaign_id = f'reply_u{update_id}'
    prompt = (
        f"You are a helpful, knowledgeable team member at Socialora (getsocialora.com) helping creators in our Telegram group.\n"
        f"Socialora provides Instagram, TikTok, YouTube, X (Twitter) and Telegram followers, views, likes, watch time and subscribers services, plus 50+ free creator diagnostic tools.\n"
        f"A user just asked:\n\"{row['text']}\"\n\n"
        f"Verified service & page URLs (use at most ONE URL and ONLY if it directly answers their question):\n"
        f"- All Services / Order page: https://www.getsocialora.com/order\n"
        f"- Instagram Followers, Views & Auto Likes (USA/Spanish/Arabic/Brazilian followers, 365-day refill options, Reels views): https://www.getsocialora.com/instagram\n"
        f"- TikTok Followers, Auto Likes & Auto Views: https://www.getsocialora.com/tiktok\n"
        f"- YouTube Views, Watch Time & Subscribers: https://www.getsocialora.com/youtube\n"
        f"- X (Twitter) Followers & Views: https://www.getsocialora.com/x\n"
        f"- Telegram Channel Members & Premium Subscribers: https://www.getsocialora.com/telegram\n"
        f"- Free Instagram Views trial: https://www.getsocialora.com/free-instagram-views\n"
        f"- TikTok Shadowban Checker: https://www.getsocialora.com/tools/tiktok-shadowban-checker\n"
        f"- Instagram Shadowban Checker: https://www.getsocialora.com/tools/instagram-shadowban-checker\n"
        f"- Who Viewed My Instagram Profile: https://www.getsocialora.com/tools/who-viewed-my-instagram-profile\n"
        f"- Track Order Status: https://www.getsocialora.com/track\n"
        f"- FAQ: https://www.getsocialora.com/faq\n"
        f"- All Free Creator Tools: https://www.getsocialora.com/tools\n\n"
        f"Verified catalog & payment facts (state ONLY what is relevant, never invent prices or delivery times):\n"
        f"- No password is ever needed; only a public profile, post, video or channel link/username.\n"
        f"- Payments: the site accepts crypto. Customers can pay automatically at checkout or manually with USDT (TRON TRC20, BNB Smart Chain, Solana), USDC (Ethereum ERC20) or Bitcoin.\n"
        f"- Order status: checked on the Track page using the order reference and email. Private order help: info@getsocialora.com.\n\n"
        f"HOW TO WRITE:\n"
        f"- Plain text like a real person typing in a chat. ZERO emojis, no bullet lists, no bold, no hashtags, no dashes for effect.\n"
        f"- No greeting formula or praise ('Hey there', 'Great question', 'Happy to help'). Start directly with the answer.\n"
        f"- Answer the exact thing they asked in 1 to 3 short sentences, matching their language.\n"
        f"- Add a link only if it truly helps them take the next step, and never more than one.\n"
        f"- Do not ask for order numbers, emails or payment details in public. Do not end with a marketing question.\n"
        f"- Output ONLY the reply text."
    )
    try:
        raw_reply = call_gemini(api_key, prompt, db=db, now=now)
    except SafeError as e:
        LOG.warning('gemini_error: %s', e)
        if verbose:
            print(f'update_id={update_id}: Gemini hatası: {e}')
        record_inbox_ai_failure(db, update_id, f'gemini: {e}')
        return False
    if len(raw_reply.strip()) < 15:
        if verbose:
            print(f'update_id={update_id}: Gemini çok kısa/boş yanıt verdi.')
        record_inbox_ai_failure(db, update_id, 'gemini: too short')
        return False
    clean = sanitize_reply_text(raw_reply, campaign_id)
    prev_dup = db.execute("SELECT 1 FROM inbox WHERE status='replied' AND lower(reply_text)=lower(?) LIMIT 1", (clean,)).fetchone()
    if prev_dup:
        clean = clean + ' Let me know your platform and what you tried, and I can be more specific.'
    last_err = None
    for candidate in (clean, re.sub(r'\s*https?://\S+', '', clean).strip()):
        try:
            reply_to_inbox(db, api, update_id, candidate, now)
            LOG.info('ai_replied update_id=%d', update_id)
            if verbose:
                print(f'update_id={update_id}: yanıt gönderildi.')
            return True
        except SafeError as e:
            last_err = e
            LOG.warning('reply_error: %s', e)
            row_now = db.execute('SELECT status FROM inbox WHERE update_id=?', (update_id,)).fetchone()
            if row_now and row_now['status'] != 'pending':
                break
    if verbose:
        print(f'update_id={update_id}: gönderim reddedildi: {last_err}')
    record_inbox_ai_failure(db, update_id, f'send: {last_err}')
    return False


AI_TOPICS = [
    ("TikTok 200-view jail & 3-second retention hook math", "https://www.getsocialora.com/tools/tiktok-shadowban-checker", "channel"),
    ("How Instagram Auto Likes & Reels Views build early social proof on fresh uploads", "https://www.getsocialora.com/instagram", "channel"),
    ("Instagram Reels non-follower reach & Explore distribution signals", "https://www.getsocialora.com/tools/instagram-shadowban-checker", "channel"),
    ("Scaling TikTok profiles with High-Quality Followers & Auto Views on new videos", "https://www.getsocialora.com/tiktok", "channel"),
    ("How to spot silent Instagram profile visitors using Insights ratios", "https://www.getsocialora.com/tools/who-viewed-my-instagram-profile", "channel"),
    ("Why country-targeted Instagram followers (USA, Spanish, Arabic, Brazilian) matter for local brands", "https://www.getsocialora.com/buy-usa-instagram-followers", "channel"),
    ("TikTok Live diamonds & gift coin payout breakdown for creators", "https://www.getsocialora.com/tools/tiktok-money-coins-calculator", "channel"),
    ("Growing YouTube channels: combining 30-minute video Watch Time with Subscriber momentum", "https://www.getsocialora.com/youtube", "channel"),
    ("How to price Instagram Reels brand deals & UGC packages in 2026", "https://www.getsocialora.com/tools/instagram-sponsorship-rate-calculator", "channel"),
    ("Ranking higher in Telegram global search with Channel Members & Premium Subscribers", "https://www.getsocialora.com/telegram", "channel"),
    ("Telegram channel CPM rates & monetization benchmarks", "https://www.getsocialora.com/tools/telegram-channel-money-calculator", "channel"),
    ("Building X (Twitter) profile authority with Followers and high-impression Tweet Views", "https://www.getsocialora.com/x", "channel"),
    ("Testing early view velocity on a fresh Instagram Reel upload", "https://www.getsocialora.com/free-instagram-views", "channel"),
    ("When to combine organic hook fixes with follower & view delivery services", "https://www.getsocialora.com/order", "channel"),
    ("Creator check-in: what is your current average Reel/TikTok view count vs last month?", "https://www.getsocialora.com/tools/tiktok-shadowban-checker", "group"),
]


def auto_refill_queue_with_ai(db, api_key, now):
    if (STATE / 'PAUSED').exists() or not api_key:
        return 0
    _, used, cooldown_left = gemini_budget_status(db, now)
    if cooldown_left > 0 or used >= DAILY_GEMINI_BUDGET:
        return 0
    pending = db.execute("SELECT COUNT(*) FROM posts WHERE status='pending' AND expires>?", (now,)).fetchone()[0]
    if pending >= 6:
        return 0
    refill_cool = db.execute("SELECT value FROM meta WHERE key='ai_refill_cooldown_until'").fetchone()
    if refill_cool and int(refill_cool['value']) > now:
        return 0
    with db:
        db.execute("INSERT INTO meta(key,value) VALUES('ai_refill_cooldown_until',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value", (str(now + 21600),))
    last_due = db.execute("SELECT MAX(due) FROM posts").fetchone()[0] or now
    base_date = dt.datetime.fromtimestamp(max(now, last_due) + 86400, TZ).date()
    slots = [(10, 15), (13, 30), (16, 45), (19, 20), (22, 10)]
    batch_items = []
    for idx in range(5):
        topic, url, target = AI_TOPICS[(int(base_date.strftime('%j')) + idx) % len(AI_TOPICS)]
        post_id = f"ai_{base_date.strftime('%m%d')}_{idx+1}"
        if db.execute("SELECT 1 FROM posts WHERE id=?", (post_id,)).fetchone():
            continue
        medium = 'channel' if target == 'channel' else 'group'
        tracked_url = f"{url}?utm_source=telegram&utm_medium={medium}&utm_campaign={post_id}"
        batch_items.append((idx, post_id, target, topic, tracked_url))
    if not batch_items:
        return 0
    spec_lines = '\n'.join(
        f"{i+1}. id={pid} | target={tgt} | topic={top} | url={turl}"
        for i, (_, pid, tgt, top, turl) in enumerate(batch_items)
    )
    prompt = (
        f"You are the Editorial Director at Socialora (@SocialoraOfficial / https://www.getsocialora.com).\n"
        f"Socialora provides Instagram, TikTok and Telegram followers, views and likes services plus free creator tools.\n"
        f"Write {len(batch_items)} distinct, authentic English Telegram posts for the items below. Return ONLY a valid JSON array of objects with keys \"id\" and \"text\".\n\n"
        f"Items:\n{spec_lines}\n\n"
        f"Rules for every post:\n"
        f"1. Open with a specific creator scenario or algorithm observation (no 'Hey creators' or generic intros).\n"
        f"2. Share one concrete, testable metric or step-by-step fix.\n"
        f"3. Use 2 to 3 tasteful emojis (📊, ⚡, 🔍, 💡, 🎯) and short paragraphs.\n"
        f"4. Never use '100% safe', 'never drops', 'guaranteed followers', 'skyrocket', or 'unleash'.\n"
        f"5. Place the item's exact url on the final line of its text.\n"
        f"6. Each post text must be 220 to 500 characters."
    )
    try:
        raw = call_gemini(api_key, prompt, db=db, now=now)
    except SafeError:
        return 0
    cleaned_json = re.sub(r'^```(?:json)?\s*|\s*```$', '', raw.strip(), flags=re.I)
    try:
        parsed = json.loads(cleaned_json)
    except Exception:
        return 0
    if not isinstance(parsed, list):
        return 0
    by_id = {str(item.get('id', '')): str(item.get('text', '')).strip() for item in parsed if isinstance(item, dict)}
    added = 0
    for idx, post_id, target, topic, tracked_url in batch_items:
        text = by_id.get(post_id, '')
        if not text:
            continue
        if tracked_url not in text:
            text = f"{text}\n\n{tracked_url}"
        try:
            validate_posts({'brand': 'Socialora', 'version': 1, 'posts': [{
                'id': post_id, 'target': target, 'day': 0,
                'time': f"{slots[idx][0]:02d}:{slots[idx][1]:02d}", 'text': text
            }]})
        except SafeError:
            continue
        due = int(dt.datetime.combine(base_date, dt.time(slots[idx][0], slots[idx][1]), TZ).timestamp())
        digest = hashlib.sha256(canonical_text(text).encode()).hexdigest()
        try:
            with db:
                db.execute('INSERT INTO posts(id,target,text,digest,due,expires) VALUES (?,?,?,?,?,?)',
                           (post_id, target, text, digest, due, due + 90 * 60))
            added += 1
        except sqlite3.IntegrityError:
            continue
    return added


def reply_to_inbox(db, api, update_id, text, now=None):
    now = int(now or time.time())
    if (STATE / 'PAUSED').exists():
        raise SafeError('Sistem duraklatılmış durumda; önce durumu kontrol edin.')
    row = db.execute('SELECT * FROM inbox WHERE update_id=?', (update_id,)).fetchone()
    if not row:
        raise SafeError('Bu update_id ile kayıtlı gelen mesaj bulunamadı.')
    if row['status'] == 'replied':
        raise SafeError('Bu mesaja zaten yanıt verildi; tekrar gönderilmez.')
    if row['status'] not in {'pending', 'ignored'}:
        raise SafeError('Mesaj durumu yanıtlamaya uygun değil.')
    campaign_id = f'reply_u{update_id}'
    clean_text = validate_reply_text(text, campaign_id)
    chat_id = verify(api, 'group')
    if chat_id != row['chat_id']:
        raise SafeError('Grup kimliği doğrulanamadı.')
    with db:
        changed = db.execute("UPDATE inbox SET status='sending',reply_text=? WHERE update_id=? AND status IN ('pending','ignored')",
                             (clean_text, update_id)).rowcount
    if changed != 1:
        raise SafeError('Mesaj başka bir işlem tarafından güncellendi.')
    try:
        sent = api.call('sendMessage', {
            'chat_id': chat_id,
            'text': render_html(clean_text), 'parse_mode': 'HTML',
            'reply_parameters': {'message_id': row['message_id']},
            'link_preview_options': {'is_disabled': True},
            'disable_notification': False,
        })
        if not isinstance(sent, dict) or not isinstance(sent.get('message_id'), int) or sent['message_id'] <= 0 or sent.get('chat', {}).get('id') != chat_id:
            raise TelegramError(0, uncertain=True)
    except TelegramError as err:
        status = 'unknown' if err.uncertain else 'failed'
        with db:
            db.execute('UPDATE inbox SET status=?,note=? WHERE update_id=?',
                       (status, f'Telegram code={err.code}; uncertain={err.uncertain}', update_id))
        if status == 'unknown' or err.code in {401, 403}:
            pause('Grup yanıtı sonucu belirsiz veya yetki hatası; Telegram kontrol edilmeli.')
        raise SafeError('Yanıt gönderilemedi; durumu kontrol edin.') from None
    with db:
        db.execute("UPDATE inbox SET status='replied',reply_message_id=?,replied_at=?,note='' WHERE update_id=?",
                   (sent['message_id'], now, update_id))
    return sent['message_id']


def publish_one(db, api, now):
    if (STATE / 'PAUSED').exists():
        return False
    with db:
        db.execute("UPDATE posts SET status='expired',note='Offline/stale slot; not replayed.' WHERE status='pending' AND expires < ?", (now,))
    post = db.execute("SELECT * FROM posts WHERE status='pending' AND due<=? AND next_attempt<=? ORDER BY due,id LIMIT 1", (now, now)).fetchone()
    if not post:
        return False
    # Across restarts and multiple imported batches: no catch-up bursts or more than 5/day/channel.
    local_date = dt.datetime.fromtimestamp(now, TZ).date()
    midnight = int(dt.datetime.combine(local_date, dt.time(), TZ).timestamp())
    today_count = db.execute("SELECT COUNT(*) FROM posts WHERE target=? AND status='sent' AND sent_at>=?", (post['target'], midnight)).fetchone()[0]
    last = db.execute("SELECT MAX(sent_at) FROM posts WHERE status='sent'").fetchone()[0]
    if today_count >= (5 if post['target'] == 'channel' else 1) or (last and now - last < 1800):
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
        sent = api.call('sendMessage', {'chat_id': chat_id, 'text': render_html(post['text']), 'parse_mode': 'HTML',
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
    inbox_counts = dict(db.execute('SELECT status,COUNT(*) FROM inbox GROUP BY status').fetchall())
    snaps = db.execute('SELECT * FROM snapshots ORDER BY day DESC LIMIT 2').fetchall()
    latest = snaps[0] if snaps else None
    yesterday = next((s for s in snaps if s['day'] == (today-dt.timedelta(days=1)).isoformat()), None)
    members = f"Kanal {latest['channel']}; grup {latest['members']} ({latest['day']})" if latest else 'Üye sayısı: veri yok'
    previous = f"Dün: kanal {yesterday['channel']}; grup {yesterday['members']}" if yesterday else 'Dünkü üye sayısı: veri yok'
    sent = db.execute("SELECT COUNT(*) FROM posts WHERE status='sent' AND sent_at>=?", (midnight,)).fetchone()[0]
    status = 'DURAKLATILDI' if (STATE / 'PAUSED').exists() else 'YAYIN İZNİ AÇIK'
    config = {}
    try:
        config = load_config()
    except Exception:
        pass
    _, gemini_used, gemini_cooldown = gemini_budget_status(db, now)
    if config.get('gemini_api_key'):
        cool_note = f', geri çekilme={gemini_cooldown}sn' if gemini_cooldown > 0 else ''
        ai_status = f'Gemini Flash aktif (bugün={gemini_used}/{DAILY_GEMINI_BUDGET}{cool_note})'
    else:
        ai_status = '0 (otomatik AI kapalı)'
    text = '\n'.join([f'Socialora — {today} — {status}', members, previous,
                      f'Bugün yayınlanan: {sent}; bekleyen: {counts.get("pending", 0)}',
                      f'Belirsiz: {counts.get("unknown", 0)}; hatalı: {counts.get("failed", 0)}; süresi geçen: {counts.get("expired", 0)}',
                      'Site tıklaması / satış / en iyi gönderi: analitik verisi yok',
                      f'Grup kutusu: bekleyen={inbox_counts.get("pending", 0)}, yanıtlanan={inbox_counts.get("replied", 0)}; AI/API çağrısı: {ai_status}',
                      'Plan: gelen grup sorularını kontrol et; kuyruk bitmeden yeni haftalık içerik ekle.'])
    atomic_text(STATE / 'report.txt', text + '\n')
    return text


def set_gemini_key():
    config = load_config()
    if not sys.stdin.isatty():
        raise SafeError('Anahtar yalnızca telefonun etkileşimli terminalinde girilebilir.')
    print('Gemini API anahtarını girin (AQ... veya AIzaSy...). Yazarken ekranda görünmez.')
    key = getpass.getpass('Gemini API Key: ').strip()
    if not (key.startswith('AQ.') or key.startswith('AIzaSy')) or len(key) < 20:
        raise SafeError('Geçersiz Gemini API anahtarı formatı.')
    config['gemini_api_key'] = key
    atomic_text(CONFIG, json.dumps(config, indent=2) + '\n')
    print('Gemini API anahtarı başarıyla kaydedildi. Ücretsiz AI grup yanıtları aktif.')


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
    print('Webhook ayarı değiştirilmedi. Boş webhook varsa tek tüketici olarak grup mesajları okunabilir.')
    print('Başka webhook var:', bool(webhook.get('url')))


def doctor():
    config = load_config()
    api = Telegram(config['bot_token'])
    for target in TARGETS:
        chat_id = verify(api, target)
        count = api.call('getChatMemberCount', {'chat_id': chat_id})
        print(f'{TARGETS[target]}: kimlik ve yayın yetkisi doğru; üye={count}')
    webhook_url = bool(api.call('getWebhookInfo').get('url'))
    print('Mevcut webhook:', webhook_url, '(değiştirilmedi; boşsa getUpdates ile grup okuma açık)')
    if config.get('gemini_api_key'):
        print('AI/API kullanımı: Gemini Flash aktif (ücretsiz kota; otomatik grup yanıtları açık).')
    else:
        print('AI/API kullanımı: yok (ücretli/otomatik AI yanıtı kapalı). Kişisel Telegram oturumu: kullanılmıyor.')


TITLES = {
    'channel': 'Socialora | Instagram, TikTok & Telegram Growth',
    'group': 'Socialora Chat | Creator Growth & Free Tools',
}
PROFILE = {
    'channel': 'Instagram, TikTok, YouTube, X and Telegram growth: followers, views and likes services plus free tools like shadowban checkers and money calculators. Practical tips every day. Questions: @SocialoraChat. getsocialora.com',
    'group': 'Creator chat for Instagram, TikTok, YouTube, X and Telegram growth. Ask about stuck views, low reach, shadowban, pricing or orders. Real answers, no spam. Services and free tools: getsocialora.com',
}
PINNED = ('Welcome. Socialora provides Instagram, TikTok, YouTube, X and Telegram followers, views and likes services, plus free creator diagnostic tools.\n\n'
          'If you have stuck views, low Reels reach, a shadowban question, or a pricing question, post your platform and rough numbers here and we will reply with what to check next.\n\n'
          'Services & order page: https://www.getsocialora.com/order?utm_source=telegram&utm_medium=group&utm_campaign=pinned_welcome\n'
          'Free checkers and calculators: https://www.getsocialora.com/tools?utm_source=telegram&utm_medium=group&utm_campaign=pinned_welcome\n'
          'Private order support: info@getsocialora.com (never post payment details in public).')


def optimize_profile(api):
    for target, title in TITLES.items():
        chat_id = verify(api, target)
        try:
            api.call('setChatTitle', {'chat_id': chat_id, 'title': title[:128]})
            print(f'{TARGETS[target]}: başlık güncellendi -> {title}')
        except TelegramError as err:
            print(f'{TARGETS[target]}: başlık güncellenemedi (kod {err.code}); botta "Change info" yetkisi gerekli.')
    for target, text in PROFILE.items():
        chat_id = verify(api, target)
        try:
            api.call('setChatDescription', {'chat_id': chat_id, 'description': text[:255]})
            print(f'{TARGETS[target]}: açıklama güncellendi.')
        except TelegramError as err:
            print(f'{TARGETS[target]}: açıklama güncellenemedi (kod {err.code}); botta "Change info" yetkisi gerekli.')
    chat_id = verify(api, 'group')
    group_info = api.call('getChat', {'chat_id': chat_id}) or {}
    existing_pin = (group_info.get('pinned_message') or {}).get('text') or ''
    if 'getsocialora.com/order' in existing_pin and 'getsocialora.com/tools' in existing_pin:
        print('Grup sabit mesajı zaten güncel; yeni pin gönderilmedi.')
        return
    try:
        sent = api.call('sendMessage', {'chat_id': chat_id, 'text': render_html(PINNED), 'parse_mode': 'HTML', 'link_preview_options': {'is_disabled': True}})
        api.call('pinChatMessage', {'chat_id': chat_id, 'message_id': sent['message_id'], 'disable_notification': True})
        print('Grup karşılama mesajı gönderildi ve sabitlendi.')
    except TelegramError as err:
        print(f'Sabit mesaj tamamlanamadı (kod {err.code}); botta "Pin messages" yetkisi gerekli.')


def main():
    if hasattr(os, 'umask'):
        os.umask(0o077)
    parser = argparse.ArgumentParser(description='Socialora Telegram — yalnızca kendi kanal/grubuna yayın ve grup kutusu')
    sub = parser.add_subparsers(dest='command', required=True)
    for command in ['setup', 'set-gemini-key', 'doctor', 'status', 'pause', 'run', 'tick', 'report', 'check-content', 'poll', 'optimize-profile']:
        sub.add_parser(command)
    sub.add_parser('reply-now')
    rep = sub.add_parser('replace-pending')
    rep.add_argument('--file', default=str(ROOT / 'content.json'))
    rep.add_argument('--start', default=dt.datetime.now(TZ).date().isoformat())
    inbox_cmd = sub.add_parser('inbox')
    inbox_cmd.add_argument('--all', action='store_true')
    reply_cmd = sub.add_parser('reply')
    reply_cmd.add_argument('update_id', type=int)
    reply_cmd.add_argument('--text', required=True)
    ignore_cmd = sub.add_parser('ignore-inbox')
    ignore_cmd.add_argument('update_id', type=int)
    res_inbox = sub.add_parser('resolve-inbox')
    res_inbox.add_argument('update_id', type=int)
    res_inbox_action = res_inbox.add_mutually_exclusive_group(required=True)
    res_inbox_action.add_argument('--sent-message-id', type=int)
    res_inbox_action.add_argument('--skip', action='store_true')
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
    if args.command == 'set-gemini-key':
        set_gemini_key()
        return
    if args.command == 'doctor':
        doctor()
        return
    if args.command == 'optimize-profile':
        optimize_profile(Telegram(load_config()['bot_token']))
        return
    if args.command in {'preview', 'check-content'}:
        posts = validate_posts(json.loads(Path(getattr(args, 'file', ROOT / 'content.json')).read_text(encoding='utf-8')))
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
        elif args.command == 'reply-now':
            cfg = load_config()
            api = Telegram(cfg['bot_token'])
            if not cfg.get('gemini_api_key'):
                raise SafeError('Gemini anahtarı yok.')
            for _try in range(40):
                try:
                    lock_cm = worker_lock()
                    lock_cm.__enter__()
                    break
                except SafeError:
                    time.sleep(2)
            else:
                raise SafeError('Motor meşgul; 1 dakika sonra tekrar deneyin.')
            try:
                now_r = int(time.time())
                with db:
                    db.execute("DELETE FROM meta WHERE key='gemini_cooldown_until'")
                    db.execute("UPDATE inbox SET status='pending',note='',reply_text='' WHERE status='failed' AND reply_message_id IS NULL AND received_at >= ?", (now_r - 86400,))
                consume_updates(db, api, now_r)
                handled = 0
                for _ in range(5):
                    if not process_inbox_with_ai(db, api, cfg['gemini_api_key'], int(time.time()), min_delay=0, verbose=True):
                        break
                    handled += 1
                print('Gönderilen yanıt:', handled)
                for r in db.execute("SELECT update_id,status,substr(text,1,60) t,substr(reply_text,1,120) why FROM inbox WHERE status IN ('pending','failed') ORDER BY update_id DESC LIMIT 5"):
                    print(dict(r))
            finally:
                lock_cm.__exit__(None, None, None)
        elif args.command == 'replace-pending':
            with worker_lock():
                with db:
                    removed = db.execute("DELETE FROM posts WHERE status IN ('pending','expired')").rowcount
                    cleared_inbox = db.execute("UPDATE inbox SET status='ignored',note='Cleared stale pending item on upgrade.' WHERE status='pending' AND length(note)>=2").rowcount
                added = import_content(db, args.file, args.start)
                print(f'Eski bekleyen {removed} gönderi temizlendi; {added} yeni v2 gönderi eklendi (temizlenen takılı inbox={cleared_inbox}).')
        elif args.command == 'resume':
            with worker_lock():
                recover(db)
                if db.execute("SELECT 1 FROM posts WHERE status='unknown' LIMIT 1").fetchone() or db.execute("SELECT 1 FROM inbox WHERE status='unknown' LIMIT 1").fetchone():
                    raise SafeError('Belirsiz gönderileri/yanıtları Telegram’dan kontrol edip resolve ile işaretleyin.')
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
        elif args.command == 'resolve-inbox':
            with worker_lock():
                if args.sent_message_id is not None and args.sent_message_id <= 0:
                    raise SafeError('Geçerli Telegram mesaj numarası girin.')
                with db:
                    changed = db.execute("UPDATE inbox SET status=?,reply_message_id=?,replied_at=?,note='Manually reconciled; no resend.' WHERE update_id=? AND status IN ('unknown','failed','sending')",
                                         ('replied' if args.sent_message_id else 'ignored', args.sent_message_id,
                                          int(time.time()) if args.sent_message_id else None, args.update_id)).rowcount
                if changed != 1:
                    raise SafeError('Çözümlenebilir bir grup yanıtı bulunamadı.')
                print('Grup yanıtı durumu kaydedildi; tekrar gönderim yapılmadı.')
        elif args.command == 'poll':
            api = Telegram(load_config()['bot_token'])
            with worker_lock():
                added = consume_updates(db, api, int(time.time()))
            print(f'Gelen kutusu güncellendi; yeni yöneltilen soru/mesaj: {added}')
        elif args.command == 'inbox':
            query = "SELECT update_id,message_id,sender,status,directed,text FROM inbox ORDER BY update_id DESC LIMIT 30" if args.all else "SELECT update_id,message_id,sender,status,directed,text FROM inbox WHERE status='pending' ORDER BY update_id ASC LIMIT 30"
            rows = db.execute(query).fetchall()
            if not rows:
                print('Bekleyen grup mesajı yok.')
            for r in rows:
                print(f"[update_id={r['update_id']} msg_id={r['message_id']} @{r['sender']} status={r['status']}] {r['text']}")
        elif args.command == 'ignore-inbox':
            with worker_lock():
                with db:
                    changed = db.execute("UPDATE inbox SET status='ignored',note='Manually ignored.' WHERE update_id=? AND status='pending'", (args.update_id,)).rowcount
                if changed != 1:
                    raise SafeError('Bekleyen mesaj bulunamadı.')
                print('Mesaj yanıtlanmadan kapatıldı.')
        elif args.command == 'reply':
            api = Telegram(load_config()['bot_token'])
            with worker_lock():
                msg_id = reply_to_inbox(db, api, args.update_id, args.text, int(time.time()))
            print(f'Yanıt gönderildi ve kaydedildi (message_id={msg_id}).')
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
                    now_init = int(time.time())
                    with db:
                        db.execute("DELETE FROM meta WHERE key='gemini_cooldown_until'")
                        db.execute("UPDATE inbox SET status='ignored',note='Expired stale pending.' WHERE status='pending' AND received_at < ?", (now_init - 86400,))
                        db.execute("UPDATE inbox SET note='' WHERE status='pending' AND received_at >= ?", (now_init - 86400,))
                        for r in db.execute("SELECT update_id,text FROM inbox WHERE status IN ('ignored','failed') AND reply_message_id IS NULL AND received_at >= ? AND sender NOT IN ('Telegram','GroupAnonymousBot','Channel_Bot') AND text NOT LIKE '%utm_source=telegram%' AND note NOT LIKE '%Manually%'", (now_init - 86400,)).fetchall():
                            if is_directed_to_us({'text': r['text']}):
                                db.execute("UPDATE inbox SET status='pending',directed=1,note='' WHERE update_id=?", (r['update_id'],))
                last_snapshot_attempt, last_report, last_poll, last_backup, last_ai, last_requeue = 0, 0, 0, '', 0, 0
                while True:
                    now = int(time.time())
                    with worker_lock():
                        publish_one(db, api, now)
                        if now - last_poll >= 60:
                            last_poll = now
                            try:
                                consume_updates(db, api, now)
                            except SafeError:
                                LOG.warning('inbox_poll_unavailable')
                        cfg = {}
                        try:
                            cfg = load_config()
                        except Exception:
                            pass
                        gemini_key = cfg.get('gemini_api_key')
                        if now - last_requeue >= 900:
                            last_requeue = now
                            with db:
                                db.execute("UPDATE inbox SET status='pending',note='' WHERE status='failed' AND reply_message_id IS NULL AND directed=1 AND received_at >= ?", (now - 6 * 3600,))
                        if gemini_key and (now - last_ai >= 30):
                            last_ai = now
                            try:
                                process_inbox_with_ai(db, api, gemini_key, now)
                                auto_refill_queue_with_ai(db, gemini_key, now)
                            except Exception:
                                LOG.warning('ai_reply_unavailable')
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
