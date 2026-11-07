#!/data/data/com.termux/files/usr/bin/bash
set -eu
umask 077
cd "$(dirname "$0")"
if ! command -v pkg >/dev/null 2>&1; then
  echo 'Bu kurulum Termux içinde çalıştırılmalı.' >&2
  exit 1
fi
pkg install -y python termux-services
python -c 'import sys; assert sys.version_info >= (3, 10), "Python 3.10 veya üstü gerekli"'
APP_DIR="$HOME/.local/opt/socialora-telegram"
SERVICE_DIR="$PREFIX/var/service/socialora-telegram"
mkdir -p "$APP_DIR" "$SERVICE_DIR" "$HOME/.termux/boot" "$HOME/.local/share/socialora-telegram"
if command -v sv >/dev/null 2>&1 && [ -e "$SERVICE_DIR/run" ]; then
  sv down "$SERVICE_DIR" >/dev/null 2>&1 || true
fi
for name in socialora.py content.json README.md sources.json growth-plan.md; do
  cp "$name" "$APP_DIR/$name"
done
mkdir -p "$APP_DIR/tests"
cp tests/test_publisher.py "$APP_DIR/tests/test_publisher.py"
chmod 700 "$APP_DIR"
# New installations stay paused. Existing state is never reset or re-imported.
if [ ! -e "$HOME/.local/share/socialora-telegram/queue.sqlite3" ]; then
  printf '%s\n' 'İlk kurulum; setup/import/resume bekleniyor.' > "$HOME/.local/share/socialora-telegram/PAUSED"
fi
touch "$SERVICE_DIR/down"
cat > "$SERVICE_DIR/run" <<EOF
#!$PREFIX/bin/sh
cd "$APP_DIR"
exec 2>/dev/null
exec $PREFIX/bin/python "$APP_DIR/socialora.py" run
EOF
cat > "$SERVICE_DIR/finish" <<EOF
#!$PREFIX/bin/sh
sleep 30
EOF
chmod 700 "$SERVICE_DIR/run" "$SERVICE_DIR/finish"
cat > "$HOME/.termux/boot/socialora-telegram" <<EOF
#!$PREFIX/bin/sh
termux-wake-lock
. "$PREFIX/etc/profile.d/start-services.sh"
EOF
chmod 700 "$HOME/.termux/boot/socialora-telegram"
mkdir -p "$PREFIX/bin"
cat > "$PREFIX/bin/socialora" <<EOF
#!$PREFIX/bin/sh
exec $PREFIX/bin/python "$APP_DIR/socialora.py" "\$@"
EOF
chmod 700 "$PREFIX/bin/socialora"
python "$APP_DIR/socialora.py" check-content
echo 'Paket kuruldu; yayın kapalı. Sonraki komut: socialora setup'
echo 'İlk kurulumdan sonra Termux’u kapatıp yeniden açın; servis yöneticisi o zaman başlar.'
echo 'Termux:Boot uygulamasını aynı kaynaktan kurup bir kez açın; pil ayarını da kontrol edin.'
