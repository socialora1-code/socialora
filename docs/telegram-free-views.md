# Telegram community gate for free views

The existing Socialora Community group (@SocialoraChat) is the membership target. Rose remains the moderator. This integration does not use or change a bot webhook, so the existing publisher can remain connected to ControllerBot.

## Activation

Keep `FREE_VIEWS_TELEGRAM_ENABLED` unset until all steps pass.

1. Completed on 7 November 2026: BotFather confirmed `www.getsocialora.com` as the linked domain for `@socialora_publisher_2026_bot`. The public site uses this canonical host.
2. Completed on 7 November 2026: the same bot was added to the existing group and appears in its administrator list. All optional permission switches were turned off, including deleting messages, banning users, invitations, pins, changing group info, welcome messages, video chats, member tags and adding admins. Rose remains the moderator.
3. Store its token in the Socialora Vercel project as the server-only secret `FREE_VIEWS_TELEGRAM_BOT_TOKEN`. Never put it in Git, a `NEXT_PUBLIC_` variable, chat output or logs.
4. Verify the bot identity and group administrator status using the Bot API, and test the Telegram login on the canonical site.
5. Set `FREE_VIEWS_TELEGRAM_ENABLED=true` in the same project/environment and redeploy after checks pass.

## Behavior

On first claim, the visitor authorizes Telegram using the official login widget, joins the existing group, and taps Check membership & get views. Authorization is remembered for up to 90 days on that browser. We only retain the verified user ID, not the other signed profile fields. Each future claim checks current group membership server-side without asking for another login. No CAPTCHA is added.

The existing limit of three orders per IP per rolling 24 hours remains. Connected Telegram users also have a three-order limit, so changing IP alone does not create more claims. Each post remains locked for 30 days. Membership failures do not consume quota. A Lua reservation makes duplicate concurrent claims atomic. A panel response whose outcome is uncertain retains the reservation to prevent repeat spending; support must review it before a retry.

This feature does not grant more views, remove post limits, start a contest, or automatically message group members. It does not create a new group or channel.

## Validation

Run `node --experimental-strip-types --test tests/telegram-free-views.test.mjs`, `npx tsc --noEmit`, and `npm run build`. Tests use fake panel, Telegram and Redis responses; they never order real views. Live end-to-end validation still requires configured credentials, bot rights, and a Telegram login.

Until activation, the existing free-views flow is preserved. If activated with a missing token or Telegram outage, requests fail closed before ordering views. Disable `FREE_VIEWS_TELEGRAM_ENABLED` and redeploy to roll back the membership requirement.
