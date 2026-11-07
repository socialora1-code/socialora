# Telegram invitation before free views

The owner requested a simple invitation popup with the existing Socialora Community name and profile photo, no website Telegram login. This replaces the earlier identity and membership verification design.

On first use, Get free views opens a centered native dialog. Join group opens a same-site redirect endpoint in a new tab, records a signed HttpOnly invitation receipt and immediately redirects to the existing Telegram invitation. Telegram can open the installed app. On returning, the visitor can submit the original form. The browser remembers the click for 90 days. Closing the popup does not unlock claims.

Important: this is an invitation-click check, NOT proof of membership. No Telegram identity, password or login code is requested. No Telegram membership API is called. Three claims per IP per rolling 24 hours and the 30-day post duplicate limit remain unchanged. Without identity there is no per-Telegram-account quota. Atomic reservations and uncertain panel-response protection remain.

Production uses FREE_VIEWS_TELEGRAM_ENABLED=true. The existing server-only FREE_VIEWS_TELEGRAM_BOT_TOKEN is reused only as the signing secret for the invitation receipt, never sent to the client. The new cookie is socialora_telegram_invite; old authentication cookies do not unlock claims. No ControllerBot webhook changes or new-member CAPTCHA changes are involved.

Validation: node --experimental-strip-types --test tests/telegram-free-views.test.mjs; npm run build. Tests never send real panel orders.
