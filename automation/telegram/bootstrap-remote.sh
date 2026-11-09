#!/data/data/com.termux/files/usr/bin/bash
# One-time setup for Socialora GitHub code updates + privacy-minimized health telemetry.
set -Eeuo pipefail
umask 077
[ -n "${PREFIX:-}" ] && command -v sv >/dev/null 2>&1 || { echo 'Existing Termux/termux-services required'; exit 1; }
[ -f "$HOME/.local/opt/socialora-telegram/socialora.py" ] || { echo 'Existing Socialora installation not found'; exit 1; }
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
base="https://raw.githubusercontent.com/socialora1-code/socialora/main/automation/telegram"
for name in auto-update.sh health-report.sh; do
  curl -fsSL --retry 2 --max-time 60 "$base/$name" -o "$tmp/$name"
  bash -n "$tmp/$name"
done
echo 'Installing safe GitHub updater...'
bash "$tmp/auto-update.sh" --install
echo 'Configuring sanitized GitHub device reports...'
bash "$tmp/health-report.sh" --setup
echo 'Setup complete. Use sv status socialora-telegram socialora-updater socialora-health'
