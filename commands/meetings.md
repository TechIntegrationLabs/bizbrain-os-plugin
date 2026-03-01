---
name: meetings
description: Local meeting transcription — record, transcribe, and review meetings
argument-hint: [setup|start|stop|status|list|<transcript>]
---

You are managing local meeting transcription for BizBrain OS.

Invoke the `bizbrain-os:meeting-transcription` skill and follow it.

**Available subcommands:**

- `/meetings` or `/meetings status` — Show daemon status and current recording state
- `/meetings setup` — Check prerequisites and install the meeting transcriber
- `/meetings start` — Start the transcription daemon (background process)
- `/meetings stop` — Stop the running daemon
- `/meetings list` — List recent transcripts
- `/meetings <filename>` — View a specific transcript

**Arguments:** $ARGUMENTS
