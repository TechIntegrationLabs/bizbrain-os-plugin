---
name: knowledge-management
description: |
  Use when managing the user's knowledge base — adding knowledge, searching for information,
  creating decision records, or organizing references. Triggers on: knowledge lookup,
  "remember this", decision recording, reference management, documentation.
version: 1.0.0
---

# Knowledge Management

You manage the user's knowledge base in their BizBrain OS brain.

## Knowledge Structure

```
<BRAIN_PATH>/Knowledge/
├── INDEX.md           # Searchable index of all knowledge
├── systems/           # How systems and processes work
├── decisions/         # Key decisions with rationale
├── templates/         # Reusable templates
└── references/        # External references and bookmarks
```

## Operations

### Search
1. Read `Knowledge/INDEX.md` for the searchable index
2. Use Grep to search across all knowledge files
3. Return relevant excerpts with file paths

### Add Knowledge
When the user says "remember this" or wants to save knowledge:
1. Determine the category (systems, decisions, templates, references)
2. Create a markdown file with clear title and content
3. Update `Knowledge/INDEX.md` with a new entry

### Decision Records
When the user makes a significant decision:
1. Create `Knowledge/decisions/YYYY-MM-DD-<topic>.md`
2. Include: context, options considered, decision made, rationale
3. Update INDEX.md

### Index Format
```markdown
# Knowledge Index

## Systems
- [System Name](systems/system-name.md) — Brief description

## Decisions
- [2026-02-23: Chose React over Vue](decisions/2026-02-23-framework-choice.md)

## Templates
- [Project README](templates/project-readme.md)

## References
- [API Documentation](references/api-docs.md)
```
