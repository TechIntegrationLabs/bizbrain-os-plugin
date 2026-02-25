---
name: session-archiving
description: >
  Archive Claude Code sessions to both the brain's knowledge base AND Obsidian vault.
  Extracts decisions, action items, entities, and key context from conversations.
  Supports Obsidian integration for full searchable session history.
  Triggers on: "archive session", "save this conversation", "/archive-sessions".
version: 2.0.0
---

# Session Archiving

You archive Claude Code session content into the brain's knowledge base and optionally to an Obsidian vault for searchable long-term history.

## Brain Location

Check: BIZBRAIN_PATH env → ~/bizbrain-os/
For full mode: brain data is at `<root>/brain/`

## Part 1: Brain Knowledge Extraction

From each session, extract and save:

1. **Decisions made** → `Knowledge/decisions/YYYY-MM-DD-<topic>.md`
2. **Action items created** → relevant `action-items.md` files
3. **Entity updates** → relevant entity records
4. **Key knowledge** → `Knowledge/references/` or `Knowledge/systems/`
5. **Session summary** → `Operations/learning/summaries/YYYY-MM-DD-summary.md`

### Archive Process

When user asks to archive or at session end:

1. **Summarize** the session in 3-5 bullet points
2. **Extract decisions** — any choices made about architecture, tools, approaches
3. **Extract action items** — anything the user committed to doing
4. **Identify entities** — new or updated entity information
5. **Save knowledge** — any reusable patterns, solutions, or references
6. **Write summary** to `Operations/learning/summaries/`

### Session Summary Format

```markdown
# Session: YYYY-MM-DD HH:MM

## Summary
- [Key activities and outcomes]

## Decisions
- [Decision]: [Rationale]

## Action Items
- [ ] [Item] — assigned to [project/entity]

## Knowledge Captured
- [Topic]: saved to [location]

## Entities Mentioned
- [Entity]: [updates made]
```

## Part 2: Obsidian Vault Archiving

If Obsidian integration is configured, also archive the full session transcript as a searchable Obsidian note.

### Configuration

Check `Operations/integrations/obsidian.json`:
```json
{
  "enabled": true,
  "vaultPath": "C:\\Users\\<user>\\Documents\\Obsidian\\<vault>",
  "archiveFolder": "Claude-Sessions",
  "autoArchive": true
}
```

If no config exists and the user asks to archive to Obsidian, ask where their vault is and create the config.

### Obsidian Archive Process

#### Step 1: Discover Sessions

Claude Code stores session data in `~/.claude/projects/` as JSONL transcript files.

1. List all project directories in `~/.claude/projects/`
2. For each project, find `.jsonl` transcript files
3. Check the archive index (`Operations/integrations/obsidian-archive-index.json`) to skip already-archived
4. Sort by modification date (newest first)

#### Step 2: Parse Each Session

For each unarchived session transcript (`.jsonl` file):

1. Read the JSONL file — each line is a JSON object representing a conversation turn
2. Extract:
   - **Session ID:** From the filename or first message
   - **Date/Time:** From timestamps in the messages
   - **Project:** From the project directory name
   - **User Prompts:** All human messages (full text)
   - **Topics:** Auto-detect from content (project names, file paths, technologies)
   - **Duration:** From first to last timestamp
   - **Tool Usage:** Count of each tool type used

#### Step 3: Generate Obsidian Note

Create a markdown file at `<vaultPath>/<archiveFolder>/YYYY-MM-DD-HH-MM-<project>.md`:

```markdown
---
date: YYYY-MM-DD
time: HH:MM
project: <project-name>
duration: <duration>
tools_used: <count>
tags:
  - claude-session
  - project/<project-name>
  - YYYY/MM
---

# Claude Session — <project-name>

**Date:** YYYY-MM-DD HH:MM
**Duration:** X hours Y minutes
**Project:** <project-name>
**Tools Used:** X

## Summary

<2-3 sentence AI-generated summary of what was accomplished>

## User Prompts

### Prompt 1
<full user prompt text>

### Prompt 2
<full user prompt text>

## Topics Detected

- <topic 1>
- <topic 2>

## Tool Usage

| Tool | Count |
|------|-------|
| Read | X |
| Edit | X |
| Bash | X |
```

#### Step 4: Update Archive Index

Append to `Operations/integrations/obsidian-archive-index.json`:
```json
{
  "sessions": [
    {
      "sessionId": "abc123",
      "archivedAt": "2026-02-25T17:00:00Z",
      "obsidianPath": "Claude-Sessions/2026-02-25-17-00-my-project.md",
      "project": "my-project",
      "date": "2026-02-25"
    }
  ]
}
```

#### Step 5: Report

```
Archived X new sessions to Obsidian:
  - 2026-02-25 17:00 — my-project (45 min, 23 tools)
  - 2026-02-25 14:30 — bizbrain-os (1h 12m, 89 tools)

Total sessions archived: Y
Vault: <vault-path>
```

## Commands

| Command | Action |
|---------|--------|
| `/archive-sessions` | Archive new sessions (incremental — both brain + Obsidian) |
| `/archive-sessions --force` | Re-archive all sessions |
| `/archive-sessions --dry-run` | Preview what would be archived |
| `/archive-sessions stats` | Show archive statistics |

## Integration

- **PostToolUse hook** already writes activity timestamps
- **SessionEnd hook** captures session metadata to `.bizbrain/last-session.json`
- **SessionStart** recovers stale sessions that were never archived
- Archive complements (doesn't replace) real-time write-through observations
- If `autoArchive` is true, the brain-learner agent should trigger archiving at session end

## Rules

- Focus on extracting VALUE, not transcribing conversation verbatim
- Link archived knowledge to existing brain structures
- Don't duplicate information already captured by the entity watchdog
- Keep brain summaries concise — bullet points, not paragraphs
- Obsidian notes can be more detailed (full prompts preserved for searchability)
- Never delete source session files — only read them
- Handle large sessions gracefully (truncate Obsidian notes if >50KB)
- Always quote vault paths that may contain spaces
