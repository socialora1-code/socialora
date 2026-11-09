#!/data/data/com.termux/files/usr/bin/bash
# Public GitHub issue heartbeat: aggregated counts only, no Telegram content.
set -Eeuo pipefail
umask 077
STATE="$HOME/.local/share/socialora-telegram"
REPORTER="$HOME/.local/bin/socialora-health-report"
TOKEN_FILE="$HOME/.config/socialora-telegram/github-issue-token"
PUB="$PREFIX/var/service/socialora-telegram"
UP="$PREFIX/var/service/socialora-health"
ISSUE_URL="https://api.github.com/repos/socialora1-code/socialora/issues/2/comments"
mkdir -p "$STATE"
log() { printf '%s %s\n' "$(date -u '+%FT%TZ')" "$1" >> "$STATE/health-report.log"; }
collect() {
  python3 - "$STATE" "$PUB" <<'PY'
import datetime,json,os,pathlib,sqlite3,subprocess,sys,time
st=pathlib.Path(sys.argv[1]); pub=sys.argv[2]; now=int(time.time())
def count(db,sql,params=()):
  try: return int(db.execute(sql,params).fetchone()[0])
  except (sqlite3.Error,TypeError,ValueError): return None
hb=st/'heartbeat'
try: age=max(0,now-int(hb.read_text().strip()))
except (OSError,ValueError): age=None
try:
  result=subprocess.run(['sv','status',pub],capture_output=True,text=True,timeout=5)
  running=result.returncode==0 and result.stdout.startswith('run:')
except Exception: running=False
info={'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='seconds'),
'publisher_running':running,'heartbeat_age_seconds':age,
'installed_sha':(st/'installed-github-sha').read_text().strip()[:40] if (st/'installed-github-sha').exists() else 'untracked'}
try:
  with sqlite3.connect('file:'+str(st/'queue.sqlite3')+'?mode=ro',uri=True,timeout=3) as db:
    info['sent_24h']=count(db,"SELECT COUNT(*) FROM posts WHERE status='sent' AND sent_at>=?",(now-86400,))
    info['replies_24h']=count(db,"SELECT COUNT(*) FROM inbox WHERE status='replied' AND replied_at>=?",(now-86400,))
    info['pending_posts']=count(db,"SELECT COUNT(*) FROM posts WHERE status='pending'")
    info['failed_posts']=count(db,"SELECT COUNT(*) FROM posts WHERE status IN ('failed','unknown')")
    info['pending_replies']=count(db,"SELECT COUNT(*) FROM inbox WHERE status='pending'")
    info['failed_replies']=count(db,"SELECT COUNT(*) FROM inbox WHERE status IN ('failed','unknown')")
except sqlite3.Error: info['database']='unavailable'
print(json.dumps(info,ensure_ascii=True,separators=(',',':')))
PY
}
once() {
  if [ ! -s "$TOKEN_FILE" ]; then log 'disabled: token not configured'; return 0; fi
  local tempfile code
  tempfile="$(mktemp "$STATE/.health.XXXXXXXX")"
  trap 'rm -f "$tempfile"' EXIT
  collect > "$tempfile" || { log 'collect_failed'; return 1; }
  # Credential is read from a private file, never passed in shell process arguments.
  code="$(python3 - "$tempfile" "$TOKEN_FILE" "$ISSUE_URL" <<'PY'
import json,sys,urllib.request,urllib.error
data=json.load(open(sys.argv[1]))
token=open(sys.argv[2]).read().strip()
payload=json.dumps({'body':'Sanitized automated health snapshot (not live monitoring):\\n\\x60\\x60\\x60json\\n'+json.dumps(data,indent=2)+'\\n\\x60\\x60\\x60'}).encode()
req=urllib.request.Request(sys.argv[3],data=payload,method='POST',headers={
 'Accept':'application/vnd.github+json','Content-Type':'application/json',
 'Authorization':'Bearer '+token,'User-Agent':'SocialoraHealth/1.0'})
try:
 with urllib.request.urlopen(req,timeout=20) as response: print(response.status)
except urllib.error.HTTPError as err: print(err.code)
except Exception: print('network')
PY
)"
  [ "$code" = 201 ] && { log 'health_report_sent'; return 0; }
  log "health_report_failed_http_${code:-network}"
  return 1
}
setup() {
  mkdir -p "$(dirname "$TOKEN_FILE")" "$HOME/.local/bin" "$UP"
  chmod 700 "$(dirname "$TOKEN_FILE")"
  cp "$0" "$REPORTER"; chmod 700 "$REPORTER"
  if [ ! -s "$TOKEN_FILE" ]; then
    printf '%s\n' 'GitHub fine-grained token gerekli: yalnizca socialora1-code/socialora, Issues: Read and write.'
    printf '%s\n' 'Tokeni SADECE bu terminale gir; ChatGPT sohbetine ve repoya gonderme.'
    read -r -s -p 'GitHub issue-only token: ' token
    printf '\n'
    if [ -z "$token" ]; then echo 'Token skipped; monitoring disabled.'; return 0; fi
    printf '%s' "$token" > "$TOKEN_FILE"; unset token
    chmod 600 "$TOKEN_FILE"
  fi
  cat > "$UP/run" <<EOF
#!$PREFIX/bin/sh
while true; do
  "$REPORTER" --once >/dev/null 2>&1 || true
  sleep 21600
done
EOF
  chmod 700 "$UP/run"
  rm -f "$UP/down"
  sv up "$UP" || true
  echo 'GitHub health reporter configured. Reports approximately every 6 hours while phone is running.'
  "$REPORTER" --once || true
}
case "${1:---once}" in
  --setup) setup ;;
  --once) once ;;
  *) echo 'Usage: health-report.sh --setup|--once'; exit 2 ;;
esac
