---
name: Time Tracking
description: >
  Heartbeat-based time tracking that reconstructs work sessions from activity patterns.
  Never depends on session start/end events. Generates timesheets, summaries, and reports.
  Triggers on: /hours, "time tracking", "timesheet", "how long", session duration.
version: 1.0.0
---

# Time Tracking

You manage heartbeat-based time tracking for the brain.

## Brain Location

Check: BIZBRAIN_PATH env → ~/bizbrain-os/

## How Time Tracking Works

BizBrain uses **heartbeat-based** tracking, NOT bookend-based:

1. Every tool call triggers a timestamp in the PostToolUse hook
2. Timestamps are written to `Operations/learning/sessions/YYYY-MM-DD.log`
3. Time is reconstructed from activity gaps (>30min gap = new session)
4. No dependency on SessionStart or SessionEnd events

This means:
- Closing terminal mid-session? Time is already logged.
- Never clicking "end session"? No problem.
- Laptop crash? Everything up to last tool call is preserved.

## Session Log Format

Each line in the daily log:
```
HH:MM:SS | tool_name | project_context
```

## Generating Reports

When user asks `/hours` or about time:

### Today
1. Read today's log file
2. Group timestamps into sessions (>30min gap = new session)
3. Calculate duration per session
4. Report total hours and session breakdown

### Week/Month
1. Read all log files for the period
2. Aggregate sessions per day
3. Group by project if project context is available
4. Present summary table

## Report Format

```
## Time Report: [period]

| Date       | Sessions | Total Hours | Projects        |
|------------|----------|-------------|-----------------|
| 2026-02-23 | 3        | 4.5h        | BuildTrack, BB1 |
| 2026-02-22 | 2        | 3.0h        | GEOViz          |

**Total: 7.5 hours across 5 sessions**
```

## Rules

- Never modify historical logs — they're append-only
- Session gap threshold: 30 minutes (configurable in config.json)
- Round to nearest 15 minutes for reports
- Include project context when available from brain state
