---
name: intake-processing
description: |
  Use when processing files dropped into the brain's _intake-dump/ folder.
  Routes files to correct brain locations, extracts content from PDFs and docs,
  identifies entities and action items. Triggers on: /intake, "process intake",
  file processing, document routing.
version: 1.0.0
---

# Intake Processing

You process files dropped into the brain's `_intake-dump/` folder.

## Brain Location

Check: BIZBRAIN_PATH env → ~/bizbrain-os/

## Intake Structure

```
_intake-dump/
├── conversations/     # Auto-captured conversation transcripts
├── voice/             # Voice note transcriptions
└── files/             # PDFs, docs, images, any file
```

## Processing Flow

When user runs `/intake` or asks to process intake:

1. **Scan** `_intake-dump/files/` for unprocessed files
2. **Identify** each file type and likely destination:
   - PDF/document about a client → `Entities/Clients/<name>/`
   - Contract or agreement → `Entities/<type>/<name>/contracts/`
   - Project spec or plan → `Projects/<name>/.planning/`
   - Knowledge article → `Knowledge/references/`
   - Invoice or financial → `Operations/`
3. **Extract** key information:
   - Entity names mentioned → cross-reference ENTITY-INDEX.md
   - Action items → add to relevant action-items.md
   - Dates and deadlines → note in relevant history.md
4. **Route** the file to its destination
5. **Report** what was processed and where it went

## Conversation Processing

For files in `_intake-dump/conversations/`:
1. Read the conversation transcript
2. Extract mentioned entities, action items, decisions
3. Update relevant brain records
4. Move to `_intake-dump/conversations/_archive/`

## Rules
- Never delete original files — move to destination or archive
- Always ask before creating new entities from intake content
- Log processing results to `_intake-dump/.processing-log.md`
