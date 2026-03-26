---
name: sweep
description: Sweep all running Claude Code sessions — discover, analyze, document, finish
argument-hint: [status|finish|clean|<pid>]
---

# Terminal Sweep

Sweep all running Claude Code terminal sessions — discover, analyze, document, and optionally finish work.

## Usage

- `/sweep` — Full sweep with analysis and handoff report
- `/sweep status` — Quick list of all active sessions
- `/sweep finish` — Sweep + spawn agents to complete each session's work
- `/sweep clean` — Remove stale session files (dead PIDs)
- `/sweep <pid>` — Analyze a single session by PID

## Handler

Invoke the `bizbrain-os:terminal-sweep` skill with the provided arguments.
