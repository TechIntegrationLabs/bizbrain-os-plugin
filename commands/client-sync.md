---
name: client-sync
description: Sync client intelligence from Gmail, Drive, Slack, and meetings
argument-hint: [client-name] [--quick|--full|--status]
---

Invoke the `bizbrain-os:client-sync` skill and follow it.

- `/client-sync` — Full sync for ALL active clients
- `/client-sync <name>` — Full sync for specific client
- `/client-sync --status` — Show last sync times and pending items
- `/client-sync --quick` — Quick check only (unread messages)

**Arguments:** $ARGUMENTS
