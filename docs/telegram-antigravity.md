# Socialora Telegram connection

**Current status:** the legacy webhook was removed and verified empty on 7 November 2026 at 23:44 Europe/Istanbul at the owner's explicit request. The bot and posting rights remain. Do not reconnect ControllerBot. The Termux publisher is prepared but not installed; inbound message processing and AI replies are not deployed. `AGENTS.md` is the current working instruction. Earlier setup/audit sections below are historical where they conflict with this status.


The private repository's `Socialora Telegram` GitHub Actions workflow provides a persistent **bot** connection for Antigravity. It does not log in to a personal Telegram account or depend on a browser session.

## One-time setup

1. In this repository's Settings > Secrets and variables > Actions, add the existing publisher bot token as the repository secret `SOCIALORA_TELEGRAM_BOT_TOKEN`. Enter it only in GitHub's secret field, never in a chat, file, workflow input, screenshot or command.
2. The expected bot is `@socialora_publisher_2026_bot`. Do not revoke or replace its token, change its webhook, or disconnect ControllerBot.
3. Run `.github/workflows/socialora-telegram.yml` with `operation=inspect` and `target=channel`, then with `target=group`. The check sends no messages. It verifies the bot identity, destination, membership and posting rights; reports member count and whether a webhook already exists without exposing its URL.
4. Resolve missing bot permissions with owner approval. Do not report the connection working until the inspect run succeeds.

## Use from Antigravity

Use the connected GitHub tools to dispatch and read this workflow on current `main`. CLI examples, when available:

```text
gh workflow run socialora-telegram.yml --repo socialora1-code/socialora -f operation=inspect -f target=channel
```

For an explicitly requested, approved plain-text Telegram post, use `operation=send`, `target=channel` or `group`, and `text`. Always check the latest run and actual Telegram result before retrying an uncertain dispatch. The workflow sends at most one message, does not retry requests, and rejects reruns of send operations. Do not put secrets in any workflow input. Member names or message history are not retrieved.

## Current limits

- This is a connection and publishing bridge, not a deployed content calendar.
- No periodic schedule, automatic posting or new group-message ingestion is enabled.
- No getUpdates polling, webhook changes, personal-account access or ControllerBot queue modifications occur.
- Reading and answering new group questions requires a separately verified inbound integration that preserves the existing webhook consumer.
- Repository GitHub access and the bot secret persist across Antigravity conversations. If Telegram revokes the token or bot rights change, the next inspect fails and requires repair.

## Verified connection — 2026-11-07

Read-only inspections succeeded with the repository secret and expected publisher bot:
- Channel `@SocialoraOfficial`: bot is an administrator, `can_send=true`. Run: https://github.com/socialora1-code/socialora/actions/runs/42390010416
- Group `@SocialoraChat`: bot is an administrator, `can_send=true`. Run: https://github.com/socialora1-code/socialora/actions/runs/42390063725

No messages were sent. An existing webhook is configured and was not changed. Preserve it; do not enable polling or replace its consumer without an integration plan and owner approval. The token value was never inspected. Automatic scheduling and inbound group-message reading remain unconfigured.


## Termux publisher package — prepared 2026-11-07

`automation/telegram/` now contains a standalone no-AI-cost editorial publisher, a 14-day content queue, tests and installation instructions. It is prepared for the owner's Android phone; it is not deployed to that phone by this repository change. See its README for activation and device checks.

Do not schedule the same content through both this manual GitHub bridge and the phone. The phone keeps the authoritative delivery ledger after activation. Existing ControllerBot schedules must be checked before activation; this package cannot inspect that queue. The existing webhook stays unchanged; inbound group reading and contextual AI replies are still not enabled.

## Webhook audit — 2026-11-07 20:18 UTC

A fresh read-only run succeeded: https://github.com/socialora1-code/socialora/actions/runs/42410446337 (job 128517234506, workflow commit c7ff5857e266d8b411db9a43f898f932e043eea6).

Observed:
- Expected publisher bot identity verified; channel administrator with posting permission; channel count 1,202.
- A webhook is configured. Public registrable domain: iunsvcontrbsoifj.top. URL fingerprint: f4b1f42f6509a7b9.
- Pending updates: 0. No last delivery error was reported. These fields do not prove that the service is useful, that it processes messages correctly, or that its publishing queue is empty.
- The workflow prints neither full webhook URL/path/query nor raw delivery error/IP. No message, webhook mutation, token rotation or pending-update deletion occurred.

Attribution:
- Historical setup reports say the publisher token was connected to ControllerBot for channel publishing. The earlier 6 November setup file documents the preceding incomplete stage, with no connected channels at that time.
- Current public-domain research did not establish who operates the observed receiving domain. Do not present ControllerBot ownership as verified from the domain.
- The website free-views invitation code uses a separate server-side value as a signing secret; its documented flow does not require this webhook. This is separate from proving that no other consumer depends on the publisher webhook.
- Rose moderation is a separate bot; its current settings were not inspected in this audit.

Decision and next gate:
- The user's instruction authorizes removing the legacy connection if it proves unnecessary. Do not ask again for that same conditional authorization.
- No removal was performed: current ControllerBot channel/queue state is not accessible through Bot API, and the new phone's inbound listener is not deployed. Inspect the owner's ControllerBot conversation before concluding that the legacy queue is unused.
- Telegram Web in the shared browser is signed out. Its QR sign-in was reported unusable on the user's mobile client; do not claim login succeeded. Phone-number sign-in is the alternative method awaiting the user's choice.
- When migration is concretely ready, preserve pending updates (do not use drop_pending_updates=true), verify the exact bot and previously audited webhook fingerprint, and verify the replacement receives updates before declaring completion.
- Removing a webhook does not revoke a service's knowledge of the bot token. If ControllerBot access must be fully withdrawn, disconnect it through its supported interface; credential rotation requires the owner to perform the credential-change step and then update the GitHub/phone secret locations securely. Do not rotate casually or affect the website invitation signing configuration.


## Legacy webhook removed — 2026-11-07 23:44 Europe/Istanbul

The owner explicitly instructed immediate removal. Run https://github.com/socialora1-code/socialora/actions/runs/42412507165 succeeded and verified the expected bot, the audited webhook fingerprint, deleteWebhook(drop_pending_updates=false), and a subsequent empty webhook URL. Pending updates were preserved; count at verification was 0. No channel/group posts, members, token or website settings were deleted or changed. This supersedes the earlier decision to defer removal. The phone publisher is still not installed and no inbound AI responder is yet deployed. Removing the webhook does not revoke any third party's previously held bot token.
