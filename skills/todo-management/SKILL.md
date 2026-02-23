---
name: Todo Management
description: >
  Aggregated todo management across all brain sources — projects, entities, operations.
  Unified view, add, complete, and sync across all sources.
  Triggers on: /todo, "add todo", "task list", "action items", "what's next".
version: 1.0.0
---

# Todo Management

You manage the unified todo system that aggregates tasks from all brain sources.

## Brain Location

Check: BIZBRAIN_PATH env → ~/bizbrain-os/

## Todo Sources

Todos live in multiple locations and are aggregated into a single view:

| Source | Location | ID Prefix |
|--------|----------|-----------|
| Project | `Projects/<name>/action-items.md` | `P-XXX-` |
| Client | `Entities/Clients/<name>/action-items.md` | `C-XXX-` |
| Partner | `Entities/Partners/<name>/action-items.md` | `PA-XXX-` |
| Vendor | `Entities/Vendors/<name>/action-items.md` | `V-XXX-` |
| Operational | `Operations/todos/ACTIVE-TODOS.md` | `OP-` |

## Aggregated View

The unified dashboard: `Operations/todos/AGGREGATED-VIEW.md`
Machine-readable: `Operations/todos/aggregated-todos.json`

## Operations

### View Todos (`/todo`)
1. Read `Operations/todos/aggregated-todos.json`
2. If stale (>1 hour), trigger a sync first
3. Display grouped by source with priorities
4. Show overdue items first, then by priority

### Add Todo (`/todo add <task>`)
1. Determine the right source based on context:
   - Mentions a project? → that project's action-items.md
   - Mentions a client? → that client's action-items.md
   - General task? → Operations/todos/ACTIVE-TODOS.md
2. Assign an ID with the correct prefix
3. Add to the source file
4. Update aggregated view

### Complete Todo (`/todo done <id>`)
1. Parse the ID prefix to find the source file
2. Mark as completed with date
3. Move to completed section (don't delete)
4. Update aggregated view

### Sync (`/todo sync`)
1. Scan ALL source locations for action items
2. Rebuild `aggregated-todos.json`
3. Regenerate `AGGREGATED-VIEW.md`
4. Report any new items found

## Todo Format in Source Files

```markdown
## Action Items

- [ ] `P-BT-001` Ship authentication module — **High** — Due: 2026-02-28
- [ ] `P-BT-002` Write API documentation — **Medium**
- [x] `P-BT-003` Fix login bug — **High** — Completed: 2026-02-20
```

## Rules

- Never delete completed todos — move to completed section
- Always update the aggregated view after changes
- Respect existing ID sequences — don't reuse IDs
- Auto-detect priority from context (deadline proximity, explicit mentions)
