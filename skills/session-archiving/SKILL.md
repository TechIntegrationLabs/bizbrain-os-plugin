---
name: Session Archiving
description: >
  Archive Claude Code sessions to the brain's knowledge base. Extracts decisions,
  action items, entities, and key context from conversations for future reference.
  Triggers on: "archive session", "save this conversation", "session summary".
version: 1.0.0
---

# Session Archiving

You archive Claude Code session content into the brain's knowledge base.

## Brain Location

Check: BIZBRAIN_PATH env → ~/bizbrain-os/

## What Gets Archived

From each session, extract and save:

1. **Decisions made** → `Knowledge/decisions/YYYY-MM-DD-<topic>.md`
2. **Action items created** → relevant `action-items.md` files
3. **Entity updates** → relevant entity records
4. **Key knowledge** → `Knowledge/references/` or `Knowledge/systems/`
5. **Session summary** → `Operations/learning/sessions/YYYY-MM-DD-summary.md`

## Archive Process

When user asks to archive or at session end:

1. **Summarize** the session in 3-5 bullet points
2. **Extract decisions** — any choices made about architecture, tools, approaches
3. **Extract action items** — anything the user committed to doing
4. **Identify entities** — new or updated entity information
5. **Save knowledge** — any reusable patterns, solutions, or references
6. **Write summary** to learning/sessions/

## Session Summary Format

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

## Integration

- **PostToolUse hook** already writes activity timestamps
- **SessionStart** recovers stale sessions that were never archived
- Archive complements (doesn't replace) real-time write-through observations

## Rules

- Focus on extracting VALUE, not transcribing conversation
- Link archived knowledge to existing brain structures
- Don't duplicate information already captured by the entity watchdog
- Keep summaries concise — bullet points, not paragraphs
