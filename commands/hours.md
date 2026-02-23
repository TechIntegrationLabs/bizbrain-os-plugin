---
name: hours
description: Time tracking summary from session heartbeats
argument-hint: [today|week|month]
---

Show time tracking summary from BizBrain OS session logs.

Read session heartbeat logs from `<BRAIN_PATH>/Operations/learning/sessions/`.
Each log file is named `YYYY-MM-DD.log` with lines like: `2026-02-23T14:30:00Z Write`

Calculate:
- Active time = periods with less than 5 minute gaps between heartbeats
- Total time per day
- Breakdown by tool usage

- `/hours` or `/hours today` — Today's hours
- `/hours week` — This week's summary
- `/hours month` — This month's summary

**Brain path:** Check BIZBRAIN_PATH env → ~/bizbrain-os/
**Arguments:** $ARGUMENTS
