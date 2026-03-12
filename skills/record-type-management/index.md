---
name: record-type-management
description: |
  Use when creating, viewing, modifying, or managing custom record types in the
  BizBrain OS brain. Triggers on: adding a record type, viewing schemas, managing
  records, checking pending proposals, undoing recent type creations, signal review.
version: 1.0.0
---

# Record Type Management

You manage custom record types in the user's BizBrain OS brain. Record types extend the brain beyond the builtin types (entities, projects, knowledge) to track any category of structured data the user needs.

## Brain Location

Check: BIZBRAIN_PATH env -> ~/bizbrain-os/

## Commands

| Command | Description |
|---------|-------------|
| `/records` | List all custom record types and their record counts |
| `/records create <name>` | Manually create a new record type |
| `/records schema <type>` | View schema and fields for a type |
| `/records add-field <type> <field>` | Add a field to an existing type |
| `/records modify-field <type> <field>` | Modify field properties |
| `/records new <type>` | Create a new record within a type |
| `/records list <type>` | List all records within a type |
| `/records undo <type>` | Undo a recently created type (within 24h window) |
| `/records pending` | View signal accumulation for potential types |
| `/records signals <type>` | View detailed signals for a pending type |
| `/record-types` | Alias for `/records` |

## Key Paths

| Path | Purpose |
|------|---------|
| `Records/_schema.json` | Master schema definitions for all custom types |
| `Records/{TypeName}/` | Folder containing records of that type |
| `Records/_proposals/pending/` | Signal accumulation for potential types |
| `Records/_proposals/_signals/` | Per-type signal files |
| `Records/_proposals/applied/` | Auto-created types with undo window info |
| `Records/_proposals/undone/` | Types that were undone |
| `Records/_archived/` | Preserved data from undone types |

## Creating a Custom Record Type

When creating a new record type manually:

1. Ask for a name and description if not provided
2. Ask which fields the type should have (or infer from context)
3. Create the schema entry in `Records/_schema.json`
4. Create the type folder: `Records/{TypeName}/`
5. Create standard files in the folder
6. Update `config.json` `record_types.custom` with the new type slug
7. Log to `.bizbrain/changelog/`

### Schema Entry Format

Add to `Records/_schema.json` under `types`:

```json
{
  "name": "Invoices",
  "singular": "Invoice",
  "slug": "invoices",
  "icon": "folder",
  "color": "#2196F3",
  "description": "Track invoices and payment status",
  "fields": [
    { "key": "client", "type": "text", "required": true },
    { "key": "amount", "type": "number", "required": true },
    { "key": "date_issued", "type": "date", "required": true },
    { "key": "date_due", "type": "date", "required": false },
    { "key": "status", "type": "select", "required": true, "options": ["draft", "sent", "paid", "overdue"] }
  ],
  "file_structure": ["_meta.json", "overview.md", "history.md", "action-items.md"],
  "views": ["list", "board"],
  "default_sort": "-updated",
  "relationships": [],
  "created": "ISO-DATE",
  "created_by": "user"
}
```

### Type Folder Structure

Create `Records/{TypeName}/` with:

**`_meta.json`:**
```json
{
  "name": "Invoices",
  "type": "invoices",
  "slug": "invoices",
  "status": "active",
  "created": "ISO-DATE",
  "created_by": "user",
  "tags": [],
  "record_count": 0
}
```

**`overview.md`:**
```markdown
# Invoices

> Custom record type | Status: Active
> Created: ISO-DATE

## Description
Track invoices and payment status.

## Fields
| Field | Type | Required | Options |
|-------|------|----------|---------|
| client | text | yes | |
| amount | number | yes | |
| date_issued | date | yes | |
| date_due | date | no | |
| status | select | yes | draft, sent, paid, overdue |
```

## Viewing Existing Types

When the user asks to see record types:

1. Read `Records/_schema.json` for all type definitions
2. Read `config.json` `record_types` for builtin vs custom
3. Display a summary table:

```
| Type | Records | Fields | Created | Source |
|------|---------|--------|---------|--------|
| Patients | 12 | 6 | 2026-03-10 | auto (schema-evolution) |
| Invoices | 3 | 5 | 2026-03-11 | manual |
```

4. For detailed view, show the full schema with field definitions

## Adding/Modifying Fields

### Adding a Field

1. Read `Records/_schema.json`
2. Add the new field to the type's `fields` array
3. Determine: `key`, `type`, `required`, and options if applicable
4. Update `Records/_schema.json`
5. Log to changelog

### Modifying a Field

1. Read `Records/_schema.json`
2. Find the field by key
3. Update the requested properties (type, required, options, etc.)
4. Update `Records/_schema.json`
5. Log to changelog

**Supported field types:** `text`, `number`, `date`, `boolean`, `select`, `multi_select`, `url`, `email`, `phone`

## Creating Records Within a Type

When creating a new record:

1. Read the type's schema from `Records/_schema.json`
2. Create a folder: `Records/{TypeName}/{RecordName}/`
3. Create `_meta.json` with all fields populated:

```json
{
  "id": "rec_<short-id>",
  "type": "invoices",
  "name": "Invoice #1042",
  "client": "Acme Corp",
  "amount": 5000,
  "date_issued": "2026-03-12",
  "date_due": "2026-04-12",
  "status": "sent",
  "created": "ISO-DATE",
  "updated": "ISO-DATE"
}
```

4. Create `overview.md` and `history.md` if the type's `file_structure` includes them
5. Update `_meta.json` at the type level: increment `record_count`

## Undoing Recently Created Types

When the user requests an undo:

1. Read `Records/_proposals/applied/{slug}-applied.json`
2. Check `undo_expires` — if past, inform user the window has closed
3. If within window:
   - Move `Records/{TypeName}/` to `Records/_archived/{slug}/`
   - Remove entry from `Records/_schema.json`
   - Remove from `config.json` `record_types.custom`
   - Move applied proposal to `Records/_proposals/undone/`
   - Update proposal with `undone: true` and `undone_at`
   - Log to changelog
4. Output: "Undone record type: [Name]. Data preserved in Records/_archived/."

## Viewing Pending Proposals

When the user asks about pending types or signal accumulation:

1. Read all files in `Records/_proposals/_signals/`
2. For each signal file, display:

```
| Potential Type | Confidence | Signals | Threshold | Status |
|----------------|------------|---------|-----------|--------|
| patients       | 0.75       | 4       | 0.80      | Accumulating |
| vehicles       | 0.30       | 1       | 0.80      | Early signal |
```

3. For detailed view (`/records signals <type>`), show each individual signal with source, weight, and timestamp

## Builtin Types

These types are always available and cannot be removed:

| Type | Location | Managed By |
|------|----------|------------|
| entities | Entities/ | entity-management skill + entity-watchdog agent |
| projects | Projects/ | project-tracking skill |
| knowledge | Knowledge/ | knowledge-management skill |

Custom record types complement these builtins for domain-specific data that doesn't fit the standard categories.

## Rules

- **Check before creating** — read `Records/_schema.json` to avoid duplicate slugs
- **Slugs are lowercase** — use snake_case for slugs (e.g., `medical_records`)
- **Names are title case** — display names use title case (e.g., "Medical Records")
- **Always log changes** — every schema modification gets a changelog entry
- **Preserve on undo** — never delete data, always archive
- **Respect the undo window** — only allow undo within 24 hours of creation
- **Update config.json** — always keep `record_types.custom` in sync with `Records/_schema.json`
