#!/data/data/com.termux/files/usr/bin/bash
# Repair only the update/reporting wrappers. Do not touch Telegram queues, tokens or AI prompts.
set -Eeuo pipefail
umask 077
APP="$HOME/.local/opt/socialora-telegram/socialora.py"
STATE="$HOME/.local/share/socialora-telegram"
[ -f "$APP" ] || { echo 'Existing Socialora app not found; no changes.'; exit 1; }
command -v sv >/dev/null || { echo 'termux-services unavailable; no changes.'; exit 1; }
mkdir -p "$HOME/.local/bin" "$STATE"
tmp="$(mktemp -d "$STATE/.repair.XXXXXXXX")"
trap 'rm -rf "$tmp"' EXIT
base=https://raw.githubusercontent.com/socialora1-code/socialora/main/automation/telegram
curl -fsSL --retry 2 --max-time 45 "$base/auto-update.sh" -o "$tmp/auto-update.sh"
curl -fsSL --retry 2 --max-time 45 "$base/health-report.sh" -o "$tmp/health-report.sh"
bash -n "$tmp/auto-update.sh"
bash -n "$tmp/health-report.sh"
cp "$tmp/auto-update.sh" "$HOME/.local/bin/socialora-auto-update"
cp "$tmp/health-report.sh" "$HOME/.local/bin/socialora-health-report"
chmod 700 "$HOME/.local/bin/socialora-auto-update" "$HOME/.local/bin/socialora-health-report"
# Ensure the existing publisher is up; unlike installing, do not stop it.
sv up "$PREFIX/var/service/socialora-telegram" || true
sleep 4
echo 'Service status:'
for name in socialora-telegram socialora-updater socialora-health; do
  printf '%s: ' "$name"
  sv status "$PREFIX/var/service/$name" || true
done
echo 'Reporter verification:'
"$HOME/.local/bin/socialora-health-report" --once
echo 'Repair complete; no secret was displayed or changed.'
