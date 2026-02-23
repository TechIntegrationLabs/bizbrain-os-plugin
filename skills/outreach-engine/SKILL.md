---
name: Outreach Engine
description: >
  Lead pipeline and outreach sequence management. Track prospects, manage follow-up
  sequences, and automate outreach campaigns linked to brain entities.
  Triggers on: /outreach, "lead pipeline", "prospect", "outreach sequence", "follow up leads".
version: 1.0.0
---

# Outreach Engine

You manage the lead pipeline and outreach sequences.

## Brain Location

Check: BIZBRAIN_PATH env → ~/bizbrain-os/

## Lead Pipeline

### Pipeline Stages

```
Prospect → Contacted → Responded → Meeting → Proposal → Won/Lost
```

### Lead Storage

Leads are entities in the brain:
- New leads → `Entities/People/<name>/` with `_meta.json` type: "lead"
- Converted leads → reclassify to Client/Partner as appropriate

### Pipeline View

Track in `Operations/outreach/pipeline.json`:
```json
{
  "leads": [
    {
      "name": "Jane Smith",
      "company": "Acme Corp",
      "stage": "contacted",
      "source": "LinkedIn",
      "last_contact": "2026-02-20",
      "next_action": "Follow up on proposal",
      "next_action_date": "2026-02-25",
      "entity_path": "Entities/People/Jane-Smith"
    }
  ]
}
```

## Outreach Sequences

### Sequence Templates

Stored in `Knowledge/templates/outreach/`:
- `cold-intro.md` — First contact template
- `follow-up-1.md` — Day 3 follow-up
- `follow-up-2.md` — Day 7 follow-up
- `breakup.md` — Final attempt

### Sequence Tracking

Each lead has a sequence state:
```json
{
  "sequence": "cold-intro",
  "step": 2,
  "started": "2026-02-15",
  "last_sent": "2026-02-18",
  "next_due": "2026-02-22"
}
```

## Commands

- `/outreach` — Show pipeline overview and overdue actions
- `/outreach add <name>` — Add a new lead
- `/outreach pipeline` — Full pipeline view by stage
- `/outreach sequence <lead>` — Show/advance sequence for a lead
- `/outreach follow-up` — List all overdue follow-ups

## Integration

- **Entity Watchdog** — When a lead is mentioned in conversation, update their record
- **Communications Hub** — Draft outreach messages linked to sequences
- **Todo Management** — Follow-up actions appear in unified todo view

## Rules

- Always link leads to brain entities
- Track every touchpoint in entity history
- Flag overdue follow-ups prominently
- Never auto-send — always present drafts for user approval
- When a lead converts, update entity type and create full entity record
