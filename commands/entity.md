---
name: entity
description: Look up or add entities (clients, partners, vendors, people)
argument-hint: [add|search] <name>
---

Manage entities in the user's BizBrain OS brain.

- `/entity <name>` — Look up an entity by name or alias
- `/entity add <name>` — Add a new entity (asks for type: client/partner/vendor/person)
- `/entity search <query>` — Search across all entities

Read `<BRAIN_PATH>/Entities/People/ENTITY-INDEX.md` for the master cross-reference.
Entity folders: `Entities/Clients/`, `Entities/Partners/`, `Entities/Vendors/`, `Entities/People/`

**Brain path:** Check BIZBRAIN_PATH env → ~/bizbrain-os/
**Arguments:** $ARGUMENTS
