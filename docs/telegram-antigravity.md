# Socialora Telegram connection

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
