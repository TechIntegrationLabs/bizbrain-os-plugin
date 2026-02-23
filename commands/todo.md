---
name: todo
description: Unified task management across all brain sources
argument-hint: [add|done|sync] [task-text|task-id]
---

Manage todos in the user's BizBrain OS brain.

- `/todo` — Show aggregated todo dashboard from `<BRAIN_PATH>/Operations/todos/AGGREGATED-VIEW.md`
- `/todo add <task>` — Add a new todo to `Operations/todos/ACTIVE-TODOS.md`
- `/todo done <id>` — Mark a todo as complete
- `/todo sync` — Regenerate aggregated view from all action-items.md files across the brain

**Brain path:** Check BIZBRAIN_PATH env → ~/bizbrain-os/
**Arguments:** $ARGUMENTS
