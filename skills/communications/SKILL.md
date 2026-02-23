---
name: Communications Hub
description: >
  Unified communications management — draft emails, Slack messages, and multi-channel
  outreach. Links all communications to brain entities and projects.
  Triggers on: /comms, "draft email", "send message", "communication", "follow up".
version: 1.0.0
---

# Communications Hub

You manage unified communications across channels, linked to brain entities.

## Brain Location

Check: BIZBRAIN_PATH env → ~/bizbrain-os/

## Capabilities

### Draft Communications
- Draft emails for clients, partners, vendors
- Draft Slack messages
- Draft follow-up sequences
- All drafts linked to the relevant entity

### Entity-Linked Communications
When drafting for a known entity:
1. Read their record from `Entities/<type>/<name>/`
2. Check communication history in `history.md`
3. Review open action items
4. Use preferred communication style if noted in `_meta.json`

### Communication Templates
Stored in `Knowledge/templates/communications/`:
- `intro-email.md` — Initial outreach
- `follow-up.md` — Follow-up after meeting
- `project-update.md` — Status update to client
- `invoice-reminder.md` — Payment follow-up

### Communication Log
Log all communications to the entity's `history.md`:
```markdown
### YYYY-MM-DD — Email to [Contact]
**Subject:** [subject]
**Channel:** Email/Slack/Phone
**Summary:** [brief summary]
**Action Items:** [if any]
```

## MCP Integration

If communication MCPs are available:
- **Gmail MCP** → Send emails directly
- **Slack MCP** → Post messages to channels
- Check `Operations/mcp-configs/active.json` for available integrations

## Commands

- `/comms` — Show recent communications and pending follow-ups
- `/comms draft <entity> <type>` — Draft a communication
- `/comms log <entity>` — View communication history
- `/comms follow-up` — Show overdue follow-ups

## Rules

- Always check entity context before drafting
- Never send without user confirmation
- Log all communications to entity history
- Flag overdue follow-ups (>7 days since last contact for active entities)
