#!/data/data/com.termux/files/usr/bin/bash
# Socialora code-only updater; keeps SQLite queue and bot/Gemini secrets untouched.
set -Eeuo pipefail
umask 077
APP="$HOME/.local/opt/socialora-telegram"
MIRROR="$HOME/.socialora"
STATE="$HOME/.local/share/socialora-telegram"
PUB="$PREFIX/var/service/socialora-telegram"
UP="$PREFIX/var/service/socialora-updater"
REPO="socialora1-code/socialora"
mkdir -p "$STATE" "$APP" "$MIRROR"
log() { printf '%s %s\n' "$(date '+%F %T')" "$*" >> "$STATE/auto-update.log"; }
healthy() {
  local i t age
  for i in $(seq 1 18); do
    sleep 5
    t="$(cat "$STATE/heartbeat" 2>/dev/null || echo 0)"
    if [[ "$t" =~ ^[0-9]+$ ]]; then
      age=$(( $(date +%s) - t ))
      if [ "$age" -ge 0 ] && [ "$age" -lt 25 ] && sv status "$PUB" 2>/dev/null | grep -q '^run:'; then return 0; fi
    fi
  done
  return 1
}
once() {
  mkdir "$STATE/.updater.lock" 2>/dev/null || { log 'already updating; skip'; return 0; }
  local tmp sha prior url item
  tmp="$(mktemp -d "$STATE/.upgrade.XXXXXXXX")"
  trap 'rm -rf "$tmp"; rmdir "$STATE/.updater.lock" 2>/dev/null || true' EXIT
  [ -f "$APP/socialora.py" ] && [ -f "$PUB/run" ] || { log 'Existing installation absent; stop'; return 1; }
  curl -fsSL --retry 2 --max-time 40 "https://api.github.com/repos/$REPO/commits/main" -o "$tmp/commit.json" || { log 'GitHub not available; no changes'; return 1; }
  sha="$(python3 - "$tmp/commit.json" <<'PY'
import json,re,sys
v=json.load(open(sys.argv[1]))['sha']
if not re.fullmatch('[0-9a-f]{40}', v): raise ValueError('Invalid commit SHA')
print(v)
PY
)" || return 1
  prior="$(cat "$STATE/installed-github-sha" 2>/dev/null || true)"
  [ "$sha" != "$prior" ] || { log 'already current'; return 0; }
  mkdir "$tmp/tests"
  url="https://raw.githubusercontent.com/$REPO/$sha/automation/telegram"
  for item in socialora.py content.json tests/test_publisher.py; do
    curl -fsSL --retry 2 --max-time 60 "$url/$item" -o "$tmp/$item" || { log "Download failed ($item); untouched"; return 1; }
  done
  # Documentation-only changes do not warrant restarting the publisher.
  if cmp -s "$tmp/socialora.py" "$APP/socialora.py"; then
    printf '%s\\n' "$sha" > "$STATE/installed-github-sha"
    log 'Code unchanged; service left running'
    return 0
  fi
  python3 -m py_compile "$tmp/socialora.py" "$tmp/tests/test_publisher.py" || { log 'Python validation failed'; return 1; }
  (cd "$tmp" && python3 -m unittest discover -s tests -q) || { log 'Tests failed; old code remains'; return 1; }
  cp "$APP/socialora.py" "$tmp/old.py"
  [ ! -f "$MIRROR/socialora.py" ] || cp "$MIRROR/socialora.py" "$tmp/old-mirror.py"
  sv down "$PUB" || { log 'Publisher not stoppable; no changes'; return 1; }
  for attempt in 1 2 3 4 5 6 7 8 9 10; do
    sv status "$PUB" 2>/dev/null | grep -q '^down:' && break
    sleep 1
  done
  if ! sv status "$PUB" 2>/dev/null | grep -q '^down:'; then
    log 'Publisher did not stop; aborting before file replacement'
    return 1
  fi
  if ! (cp "$tmp/socialora.py" "$APP/.new.py" && mv -f "$APP/.new.py" "$APP/socialora.py" && cp "$tmp/socialora.py" "$MIRROR/.new.py" && mv -f "$MIRROR/.new.py" "$MIRROR/socialora.py"); then
    log 'Install failed, rolling back'
    cp "$tmp/old.py" "$APP/socialora.py"
    [ ! -f "$tmp/old-mirror.py" ] || cp "$tmp/old-mirror.py" "$MIRROR/socialora.py"
    sv up "$PUB" || true
    return 1
  fi
  sv up "$PUB" || true
  if ! healthy; then
    log 'Health check failed, reverting'
    sv down "$PUB" || true
    cp "$tmp/old.py" "$APP/socialora.py"
    [ ! -f "$tmp/old-mirror.py" ] || cp "$tmp/old-mirror.py" "$MIRROR/socialora.py"
    sv up "$PUB" || true
    return 1
  fi
  printf '%s\n' "$sha" > "$STATE/installed-github-sha"
  log "Healthy update installed: $sha"
}
install() {
  [ -f "$APP/socialora.py" ] || { echo 'Original Socialora install missing'; exit 1; }
  command -v sv >/dev/null || { echo 'termux-services is required'; exit 1; }
  mkdir -p "$HOME/.local/bin" "$UP"
  cp "$0" "$HOME/.local/bin/socialora-auto-update"
  chmod 700 "$HOME/.local/bin/socialora-auto-update"
  cat > "$UP/run" <<EOF
#!$PREFIX/bin/sh
while true; do
  n=\$(TZ=Europe/Istanbul $PREFIX/bin/python -c 'import datetime as d; from zoneinfo import ZoneInfo; now=d.datetime.now(ZoneInfo("Europe/Istanbul")); target=now.replace(hour=4,minute=15,second=0,microsecond=0); target+=d.timedelta(days=target<=now); print(max(30,int((target-now).total_seconds())))')
  sleep "\$n"
  "$HOME/.local/bin/socialora-auto-update" --once >> "$STATE/auto-update.log" 2>&1 || true
done
EOF
  chmod 700 "$UP/run"
  rm -f "$UP/down"
  sv up "$UP" || true
  echo 'Updater installed. Daily at 04:15 Istanbul time.'
  "$HOME/.local/bin/socialora-auto-update" --once
}
case "${1:---once}" in
  --install) install ;;
  --once) once ;;
  *) echo 'Usage: auto-update.sh --install|--once'; exit 2 ;;
esac
