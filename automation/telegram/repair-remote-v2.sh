#!/data/data/com.termux/files/usr/bin/bash
set -Eeuo pipefail
umask 077
STATE="$HOME/.local/share/socialora-telegram"
SERVICE="$PREFIX/var/service/socialora-telegram"
mkdir -p "$STATE" "$HOME/.local/bin"
[ -f "$HOME/.local/opt/socialora-telegram/socialora.py" ] || { echo 'ERROR: Existing Socialora installation not found'; exit 1; }
command -v sv >/dev/null || { echo 'ERROR: termux-services not found'; exit 1; }
TEMP_DIR="$(mktemp -d "$STATE/.repairv2.XXXXXXXX")"
trap 'rm -rf -- "$TEMP_DIR"' EXIT
# Immutable revision and new URL, avoiding stale /main/ CDN caching.
REV='ca379e5f499d2579c32864b09868ff5ab2ff14ac'
BASE="https://raw.githubusercontent.com/socialora1-code/socialora/$REV/automation/telegram"
for name in auto-update.sh health-report.sh; do
  curl -fsSL --retry 2 --max-time 45 -H 'Cache-Control: no-cache' "$BASE/$name?repair_v2=20261109" -o "$TEMP_DIR/$name"
  bash -n "$TEMP_DIR/$name"
done
# Check embedded Python syntax before installing anything.
python3 - "$TEMP_DIR/auto-update.sh" "$TEMP_DIR/health-report.sh" <<'PY'
import pathlib,sys
for filename in sys.argv[1:]:
    source=pathlib.Path(filename).read_text()
    fragments=source.split("<<'PY'\n")
    for fragment in fragments[1:]:
        embedded=fragment.split('\nPY\n',1)[0]
        compile(embedded,filename,'exec')
    print('Python syntax OK:',pathlib.Path(filename).name)
PY
# Only wrapper scripts are replaced, NOT publishing/AI code or state.
for name in socialora-auto-update socialora-health-report; do
  if [ -f "$HOME/.local/bin/$name" ]; then cp "$HOME/.local/bin/$name" "$TEMP_DIR/$name.old"; fi
done
install -m 700 "$TEMP_DIR/auto-update.sh" "$HOME/.local/bin/socialora-auto-update"
install -m 700 "$TEMP_DIR/health-report.sh" "$HOME/.local/bin/socialora-health-report"
# The original installer deliberately created a 'normally down' flag.
if [ -f "$SERVICE/down" ]; then rm -f "$SERVICE/down"; fi
sv up "$SERVICE" || true
sleep 4
printf '\nSERVICE STATUS:\n'
for name in socialora-telegram socialora-updater socialora-health; do
  sv status "$PREFIX/var/service/$name" || true
done
printf '\nSEND NEW HEALTH REPORT:\n'
if "$HOME/.local/bin/socialora-health-report" --once; then
  echo 'SUCCESS: GitHub health report sent.'
else
  echo 'WARNING: Health report could not be sent. See private log in ~/.local/share/socialora-telegram/health-report.log'
fi
printf '\nLATEST LOCAL REPORT STATUS:\n'
tail -n 3 "$STATE/health-report.log" 2>/dev/null || true
printf '\nREPAIR V2 DONE\n'
