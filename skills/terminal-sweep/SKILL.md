---
name: terminal-sweep
description: >
  Sweep all running Claude Code terminal sessions — discover, analyze, document,
  and optionally finish work across all open tabs. Generates comprehensive handoff
  documents so you can safely close everything. Triggers on: /sweep, "sweep terminals",
  "save all sessions", "what's running", "close all tabs".
version: 1.0.0
---

# Terminal Sweep

You sweep all running Claude Code sessions on this machine, analyze what each one is doing, generate a comprehensive handoff document, and optionally finish incomplete work.

## How It Works

Claude Code stores active session metadata in `~/.claude/sessions/<pid>.json` and conversation transcripts in `~/.claude/projects/<encoded-path>/<sessionId>.jsonl`. This skill reads that data directly — no screenshots, no computer use, no guessing.

## Session Discovery

### Step 1: Find All Active Sessions

Read every `.json` file in `~/.claude/sessions/`:

```json
{
  "pid": 592740,
  "sessionId": "403fd0b6-e93a-485b-8fd2-c72a9fd216f8",
  "cwd": "C:\\Users\\Disruptors\\BB1-Conversations",
  "startedAt": 1774560969063,
  "kind": "interactive",
  "entrypoint": "cli"
}
```

### Step 2: Verify Which Are Alive

For each PID, check if the process is still running:

```bash
powershell.exe -Command "Get-Process -Id <PID> -ErrorAction SilentlyContinue"
```

Categorize as:
- **ALIVE** — process exists, session is active
- **STALE** — process gone, session file is orphaned (clean up later)

### Step 3: Identify the Current Session

The current session (the one running THIS sweep) should be excluded from "finish" operations but included in the report. Identify it by matching `$CLAUDE_SESSION_ID` env var or by matching the PID of the current process.

## Session Analysis

### Step 4: Read Each Session's Transcript

For each alive session, find its JSONL transcript:

1. Encode the `cwd` path to match project directory names (replace `:\` with `-`, `\` with `-`)
   - Example: `C:\Users\Disruptors\Repos\my-app` → `C--Users-Disruptors-Repos-my-app`
2. Look in `~/.claude/projects/<encoded-cwd>/<sessionId>.jsonl`
3. Read the **last 200 lines** of the JSONL file (most recent activity)

### Step 5: Extract Key Information

From each session's transcript, extract:

| Field | Source | How |
|-------|--------|-----|
| **Project/Repo** | `cwd` from session metadata | Direct read |
| **Started** | `startedAt` from session metadata | Convert epoch ms to human date |
| **Duration** | `startedAt` vs now | Calculate |
| **Git Branch** | `gitBranch` from JSONL entries | Last known value |
| **Last User Message** | Last `type: "user"` entry | Read `message.content` |
| **Last Assistant Action** | Last `type: "assistant"` entry | Summarize `message.content` (tool calls, text) |
| **Task Summary** | First 1-3 user messages | Infer what was being worked on |
| **Status** | Analysis of last few turns | One of: active, idle, blocked, erroring, waiting-for-user |
| **Tools Used** | Assistant entries | List unique tool names from `content[].name` |
| **Uncommitted Changes** | Run `git status` in cwd | Only if cwd is a git repo |

### Step 6: Check Git State

For each unique `cwd` that is a git repository:

```bash
cd <cwd> && git status --porcelain && git log --oneline -3
```

This tells us if there are uncommitted changes that would be lost.

## Output Generation

### Step 7: Generate Sweep Report

Create a comprehensive Markdown document:

```markdown
# Terminal Sweep Report
**Generated:** YYYY-MM-DD HH:MM
**Machine:** <hostname>
**Active Sessions:** N (M stale cleaned up)

---

## Session 1: [Project Name] — [Status]
- **PID:** 592740 | **Branch:** feature/auth
- **Started:** 2026-03-26 10:15 (2h 30m ago)
- **Working On:** [inferred task summary]
- **Last Activity:** [last user message summary]
- **Git State:** 3 modified files, 1 untracked
- **Uncommitted Files:**
  - M src/components/Auth.tsx
  - M src/lib/api.ts
  - ? src/components/NewThing.tsx

### Resume Prompt
> [A ready-to-paste prompt that would let a new Claude Code session pick up exactly where this one left off, including full context of what was being done, what's been completed, what remains, and any blockers]

---

## Session 2: [Project Name] — [Status]
...

---

## Summary

| # | Project | Task | Status | Duration | Uncommitted |
|---|---------|------|--------|----------|-------------|
| 1 | BuildTrack | Auth refactor | active | 2h 30m | 3 files |
| 2 | BB1-Conversations | Sweep setup | active | 0h 15m | 0 files |
| ... | ... | ... | ... | ... | ... |

## Action Items Extracted
- [ ] [Any action items found across sessions]

## Recommended Next Steps
- [Sessions that can be safely closed]
- [Sessions with uncommitted work that need attention]
- [Sessions that are blocked on something]
```

### Step 8: Save the Report

Save to TWO locations:

1. **BB1 Intake:** `BB1/_intake-dump/sweeps/YYYY-MM-DD-HHMMSS-sweep.md`
2. **Quick Access:** `~/.claude/sweeps/latest.md` (overwritten each time)

Also create a machine-readable version at `~/.claude/sweeps/latest.json` with structured session data for programmatic use.

## Commands

| Command | Description |
|---------|-------------|
| `/sweep` | Full sweep — discover, analyze, report |
| `/sweep status` | Quick status — just list active sessions with one-liner summaries |
| `/sweep finish` | Sweep + spawn agents to try completing each session's work |
| `/sweep clean` | Remove stale session files (dead PIDs) |
| `/sweep <pid>` | Analyze a single session by PID |

## /sweep (Default)

1. Discover all sessions (Steps 1-3)
2. Analyze each session (Steps 4-6)
3. Generate and save report (Steps 7-8)
4. Display the summary table and any urgent items to the user

## /sweep status

Quick mode — skip transcript analysis, just show:

```
Active Claude Code Sessions (8):
  PID 592740 | BB1-Conversations    | 2h 30m | interactive
  PID 593972 | Home directory       | 2h 45m | interactive
  PID 428136 | BB1-Conversations    | 33h    | interactive
  ...
```

## /sweep finish

After generating the report, for each session that is NOT the current one:

1. Read the session's task and current state
2. Assess if the remaining work can be completed autonomously
3. For completable tasks: spawn a background Agent (subagent_type: "general-purpose") with:
   - The resume prompt from the report
   - Instructions to complete the work, commit, and report back
4. For non-completable tasks: flag them in the report with reason why

**Safety rules for /sweep finish:**
- NEVER force-push, delete branches, or take destructive actions
- NEVER send messages to external services (Slack, email, etc.)
- Only commit if changes are coherent and tests pass
- If unsure, document the state and skip — better to leave work intact than corrupt it

## /sweep clean

Remove orphaned session files where the PID is no longer running:

```bash
# For each session file, check if PID exists
# If not, move to ~/.claude/sessions/_stale/ (don't delete — just in case)
```

## Integration with BizBrain OS

### Brain Learning

After a sweep, the brain-learner agent should be notified with:
- Which projects had active work
- Any decisions or patterns detected across sessions
- Action items extracted

### Time Tracking

Cross-reference sweep timestamps with heartbeat data to reconstruct accurate time spent per project.

### Entity Watchdog

Scan sweep results for entity mentions — sessions may reference clients, partners, or vendors that should be tracked.

## Rules

1. **Never kill processes** — sweep is read-only by default. Only `/sweep finish` takes action, and even then it spawns NEW agents rather than interfering with existing sessions.
2. **Respect the current session** — always identify and exclude self from destructive operations.
3. **Git safety** — check for uncommitted work before recommending "safe to close". Always warn about uncommitted changes.
4. **Large transcripts** — only read the last 200 lines of JSONL. For very long sessions, summarize rather than read everything.
5. **Privacy** — sweep reports may contain sensitive information (API keys in error messages, client names, etc.). Save locally only, never push to external services.
6. **Stale cleanup** — move stale files to `_stale/` directory, never delete them outright.

## Dependencies

- PowerShell (for `Get-Process` on Windows)
- Git (for `git status` checks)
- Read access to `~/.claude/sessions/` and `~/.claude/projects/`
- Write access to BB1 intake and `~/.claude/sweeps/`
