---
name: report
description: Generate an anonymous usage report you can share with the BizBrain OS team — no private or sensitive data included
argument-hint: [generate|preview]
---

You are generating a BizBrain OS usage report. This report contains ONLY aggregate, anonymous usage data — never file contents, entity names, client info, project details, or any private data.

**Arguments:** $ARGUMENTS

## What to Collect

Read the following files from the user's brain to build the report. If any file is missing, skip it gracefully.

### 1. Plugin Version
Read `$PLUGIN_ROOT/.claude-plugin/plugin.json` → extract `version`

### 2. Brain Metadata
Read `$BRAIN_PATH/.bizbrain-root.json` (if exists) → extract `mode` (compact/full), `profile`, `createdAt`
Read `$BRAIN_PATH/.bizbrain/session-state.json` → extract `lastSessionStart`, `mode`, `zone`
Read `$BRAIN_PATH/.bizbrain/update-check.json` → extract `installedVersion`, `latestVersion`

### 3. Session Activity (Last 30 Days)
Look in `$BRAIN_PATH/Operations/learning/sessions/` for daily log files (format: `YYYY-MM-DD.log`).
For each file from the last 30 days:
- Count total heartbeats (lines)
- Extract unique tool names used (first column after timestamp)
- Calculate session duration (first timestamp to last timestamp)

Aggregate into:
- Total sessions (days with activity)
- Total heartbeats
- Average session duration
- Top 10 most-used tools (tool name + count)

### 4. Brain Stats (Counts Only)
Count items — DO NOT read contents:
- `$BRAIN_PATH/Entities/Clients/` → number of client folders
- `$BRAIN_PATH/Entities/Partners/` → number of partner folders
- `$BRAIN_PATH/Entities/Vendors/` → number of vendor folders
- `$BRAIN_PATH/Projects/` → number of project folders
- `$BRAIN_PATH/Knowledge/` → total number of .md files (recursive)
- `$BRAIN_PATH/Operations/todos/` → count lines containing `- [ ]` and `- [x]` in any .md files

### 5. Integrations Enabled
Read `$BRAIN_PATH/.bizbrain/checklist-progress.json` (if exists) → list item IDs where status is "completed"

### 6. Features Enabled
Read `$BRAIN_PATH/config.json` (if exists) → extract `features` object (just the boolean flags, not values)

### 7. Operating System
Report: platform (win32/darwin/linux), Node.js version

## Report Format

Generate a clean markdown report like this:

```markdown
# BizBrain OS Usage Report
Generated: [date]

## Environment
- Plugin Version: [version]
- Brain Mode: [compact/full]
- Profile: [profile]
- Brain Age: [days since creation]
- OS: [platform]
- Node.js: [version]

## Activity (Last 30 Days)
- Active Days: [count] / 30
- Total Heartbeats: [count]
- Avg Session Duration: [minutes]
- Longest Session: [minutes]

## Top Tools
| Tool | Uses |
|------|------|
| [tool] | [count] |
...

## Brain Size
- Clients: [count]
- Partners: [count]
- Vendors: [count]
- Projects: [count]
- Knowledge Files: [count]
- Open Todos: [count]
- Completed Todos: [count]

## Integrations Completed
[list of completed checklist item IDs, or "None tracked"]

## Features
[list of enabled feature flags, or "Default"]

---
*This report contains no private data — only aggregate counts and tool usage patterns.*
*Share with: hello@techintegrationlabs.com or paste in Discord #help*
```

## Behavior

1. **Default / "generate"**: Generate the report and display it to the user. Tell them they can copy it and email to `hello@techintegrationlabs.com` or paste in the BizBrain OS Discord `#help` channel.

2. **"preview"**: Show what data will be collected (the list above) WITHOUT actually reading any files. Let the user confirm before generating.

## CRITICAL PRIVACY RULES

- NEVER include file contents, entity names, project names, client names, or any text from brain files
- ONLY count items — never list names
- Tool names (Read, Write, Edit, Bash, etc.) are safe to include
- Checklist item IDs (e.g., "slack-integration", "github-mcp") are safe — they're public plugin data
- Feature flag names are safe — they're public plugin configuration
- Timestamps and durations are safe
- If in doubt, EXCLUDE the data
