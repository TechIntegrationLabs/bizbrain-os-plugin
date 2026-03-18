---
name: health
description: Run a comprehensive health check on your BizBrain OS installation — validates hooks, brain structure, dependencies, and configuration
---

You are running a BizBrain OS health check. Systematically validate the entire installation and report results.

## Checks to Run

### 1. Brain Existence
- Check if `~/bizbrain-os/` or `$BIZBRAIN_PATH` exists
- Read `.bizbrain-root.json` for mode detection
- Report: brain path, mode (compact/full), zone

### 2. Brain Structure
For the detected mode, verify these folders exist:
- `Entities/` (with `Clients/`, `Partners/`, `Vendors/` subfolders)
- `Projects/`
- `Knowledge/`
- `Operations/`
- `_intake-dump/`
- `.bizbrain/`

Report missing folders as warnings.

### 3. Plugin Version
- Read `$PLUGIN_ROOT/.claude-plugin/plugin.json` for installed version
- Read `.bizbrain/update-check.json` if exists — report if update available

### 4. Hook Installation
Check that all three hooks are firing:
- `SessionStart` — check `.bizbrain/session-state.json` exists and `lastSessionStart` is recent (within 24h)
- `PostToolUse` — check `Operations/learning/sessions/` has today's log file
- `SessionEnd` — check `.bizbrain/last-session.json` exists (may be stale if user rarely exits cleanly — this is OK)

### 5. Configuration
- Read `config.json` if exists — report profile, enabled features
- Check for `.bizbrain/checklist-progress.json` — report completion percentage

### 6. Dependencies
- Check `node --version` is available and >= 18
- Check `git --version` is available
- Check `curl --version` is available (needed for update checks)

### 7. Disk Usage
- Report total size of brain folder (use `du -sh` or equivalent)
- Report count of files in brain

## Output Format

Present results as a clear checklist:

```
BizBrain OS Health Check
========================

Brain
  [PASS] Brain found at ~/bizbrain-os (compact mode)
  [PASS] All required folders present
  [WARN] Missing: Knowledge/references/

Plugin
  [PASS] Version 3.5.1 (up to date)

Hooks
  [PASS] SessionStart — last fired 2 minutes ago
  [PASS] PostToolUse — 47 heartbeats today
  [WARN] SessionEnd — last session file is 3 days old (normal if you don't exit cleanly)

Config
  [PASS] Profile: developer
  [PASS] Setup progress: 14/37 (38%)

Dependencies
  [PASS] Node.js v25.1.0
  [PASS] Git 2.47.1
  [PASS] curl 8.11.1

Disk
  [INFO] Brain size: 12.4 MB (847 files)

Overall: 8 PASS, 2 WARN, 0 FAIL
```

Use `[PASS]` for good, `[WARN]` for non-critical issues, `[FAIL]` for problems that need fixing.

For each `[WARN]` or `[FAIL]`, include a one-line fix suggestion.
