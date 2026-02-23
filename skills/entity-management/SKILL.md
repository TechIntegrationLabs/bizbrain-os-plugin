---
name: entity-management
description: |
  Use when creating, updating, or managing entities (clients, partners, vendors, people)
  in the BizBrain OS brain. Triggers on: adding a client, updating contact info,
  managing business relationships, CRM operations, entity CRUD.
version: 1.0.0
---

# Entity Management

You manage entities (clients, partners, vendors, people) in the user's BizBrain OS brain.

## Brain Location

Check: BIZBRAIN_PATH env → ~/bizbrain-os/

## Entity Types

| Type | Folder | Description |
|------|--------|-------------|
| Client | Entities/Clients/ | Organizations that pay the user |
| Partner | Entities/Partners/ | Strategic relationships |
| Vendor | Entities/Vendors/ | Organizations the user pays |
| Person | Entities/People/ | Individual contacts |

## Creating an Entity

When creating a new entity:

1. Ask for type (client/partner/vendor/person) if not specified
2. Create the folder: `Entities/<Type>/<Name>/`
3. Create these files:

### _meta.json
```json
{
  "name": "Entity Name",
  "type": "client",
  "status": "active",
  "aliases": [],
  "primaryContact": {
    "name": "",
    "email": "",
    "phone": "",
    "role": ""
  },
  "tags": [],
  "createdAt": "ISO-DATE",
  "updatedAt": "ISO-DATE"
}
```

### overview.md
```markdown
# Entity Name

> Type: Client | Status: Active
> Primary Contact: Name (role)

## About
[What they do, relationship summary]

## Key Details
- Website:
- Industry:
- Location:

## Relationship
- How we met:
- What we do for them:
- Contract/agreement:
```

### history.md
```markdown
# Interaction History — Entity Name

| Date | Type | Summary |
|------|------|---------|
| YYYY-MM-DD | Created | Entity record created |
```

### action-items.md
```markdown
# Action Items — Entity Name

## Open
- [ ] [ID]: [Description] (due: [date])

## Completed
```

4. Update `Entities/People/ENTITY-INDEX.md` with the new entity

## Updating an Entity

When updating:
1. Read the entity's `_meta.json`
2. Update the relevant field
3. Set `updatedAt` to current ISO date
4. If contact info changed, update ENTITY-INDEX.md
5. Append to `history.md`: "Updated [field]"

## Searching Entities

1. Read ENTITY-INDEX.md for quick lookup
2. Use Grep to search across all entity folders
3. Match against name, aliases, contacts, tags

## Entity Index Format

The ENTITY-INDEX.md at `Entities/People/ENTITY-INDEX.md` should look like:

```markdown
# Entity Index

> Auto-maintained by BizBrain OS
> Last updated: ISO-DATE

## Clients
| Name | Aliases | Status | Primary Contact | Tags |
|------|---------|--------|-----------------|------|

## Partners
| Name | Aliases | Status | Primary Contact | Tags |
|------|---------|--------|-----------------|------|

## Vendors
| Name | Aliases | Status | Primary Contact | Tags |
|------|---------|--------|-----------------|------|

## People
| Name | Aliases | Entity | Role | Contact |
|------|---------|--------|------|---------|
```
