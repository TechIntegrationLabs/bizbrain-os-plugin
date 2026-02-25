---
name: brain-bootstrap
description: |
  Use when setting up BizBrain OS for the first time, when the user runs /brain setup,
  or when no brain folder is detected. Handles machine scanning, profile selection,
  brain folder creation, and initial CLAUDE.md generation.
version: 1.0.0
---

# Brain Bootstrap

You are setting up BizBrain OS — the AI context layer that teaches Claude the user's business.

## Process

### Step 1: Check for Existing Brain

Look for a brain folder in this order:
1. `BIZBRAIN_PATH` environment variable
2. `~/bizbrain-os/`
3. Ask the user where they want it (default: `~/bizbrain-os/`)

If a brain already exists, ask: "Found an existing brain at [path]. Reconfigure it, or start fresh?"

### Step 2: Gather Basic Info

Ask the user (one question at a time, use AskUserQuestion):
1. "What's your name?" (for the brain's owner field)
2. "What's your business or project name?" (or "What should we call your brain?")
3. Profile selection — present the 5 profiles with descriptions:
   - Developer / Technical Solopreneur
   - Content Creator
   - Consultant / Freelancer
   - Agency Owner
   - Personal / Life Organizer

### Step 3: Scan the Machine

Run the scanner script to discover:
- Code repositories (look in scan_paths.code from the selected profile)
- Documents and recent files
- Git history and collaborators
- Installed tools and package managers
- Claude Code configuration (existing MCPs, project contexts)
- Service configs (.env files, API keys)

Store full scan results in memory for the selection step.

### Step 3.5: Interactive Selection

Present scan results as numbered lists organized by category. All items are **included by default**.
The user types numbers to exclude, "all" to keep everything, or "none" to skip a category.

**For each category with results, present a selection prompt using AskUserQuestion:**

**Projects/Repos** (if any found):
```
Found N code repositories:

  [1] ✓ geoviz-app          NextJS    ~/Repos/geoviz-app
  [2] ✓ bizbrain-os         Rust      ~/Repos/bizbrain-os
  [3] ✓ old-prototype       Node      ~/Projects/old-prototype
  [4] ✓ client-portal       Python    ~/Repos/client-portal

Type numbers to EXCLUDE (e.g. "3 4"), "all" to keep all, or "none" to skip:
```

**Services/Tools** (if any found):
```
Found N services and tools:

  [1] ✓ GitHub CLI           authenticated
  [2] ✓ Node.js              v20.11.0
  [3] ✓ Python               3.13
  [4] ✓ Claude Code config   ~/.claude.json

Type numbers to EXCLUDE, "all" to keep all, or "none" to skip:
```

**Entities/Collaborators** (if any found from git history):
```
Found N collaborators in git history:

  [1] ✓ Jane Smith           jane@example.com      12 commits
  [2] ✓ Bob Johnson          bob@corp.com           5 commits
  [3] ✓ GitHub Actions       noreply@github.com     3 commits

Type numbers to EXCLUDE, "all" to keep all, or "none" to skip:
```

**Processing user response:**
- Numbers (e.g. "3 4" or "3, 4") → exclude those items, keep the rest
- "all" → keep everything in this category
- "none" → exclude everything in this category
- Empty response → treat as "all" (keep everything)

After all categories are selected, show a final summary:
```
Brain will track:
  Projects: 2 of 4
  Services: 4 of 4
  Entities: 2 of 3

Proceed? (yes/no)
```

Store selections in `.bizbrain/scan-cache.json` (full results) and only populate the brain with selected items in Step 5. The excluded items are saved so `/brain scan` can offer them again later.

### Step 4: Create the Brain Folder

1. Create `~/bizbrain-os/` (or chosen path)
2. Read `${CLAUDE_PLUGIN_ROOT}/lib/folder-structure.json`
3. Create all `core` folders
4. Create `features` folders based on selected profile
5. Write `config.json` from `${CLAUDE_PLUGIN_ROOT}/lib/default-config.json` template, filled with user info + profile settings
6. Write `.bizbrain/state.json` with initial state
7. Write `.bizbrain/hooks-state.json` with auto_behaviors from profile

### Step 5: Populate from Selections

**Only populate items the user selected in Step 3.5.**

For each **selected** project:
- Create `Projects/<name>/_meta.json` with repo path, stack, last activity
- Create `Projects/<name>/overview.md` with basic info

For each **selected** service/credential:
- Add to `Operations/credentials/registry.json` (catalog only — don't copy secrets)

For each **selected** entity (from git history collaborators):
- Create entity records in the appropriate `Entities/` subfolder

**Save full scan results** (both selected and excluded) to `.bizbrain/scan-cache.json`:
```json
{
  "lastScanAt": "2026-02-25T14:32:00Z",
  "projects": {
    "selected": [{ "name": "...", "path": "...", "stack": "..." }],
    "excluded": [{ "name": "...", "path": "...", "stack": "..." }]
  },
  "services": {
    "selected": [...],
    "excluded": [...]
  },
  "entities": {
    "selected": [...],
    "excluded": [...]
  }
}
```

This allows `/brain scan` to show previously-excluded items and offer to add them.

### Step 6: Generate CLAUDE.md

The brain's `CLAUDE.md` will be auto-generated by the SessionStart hook on next session.
Tell the user: "Brain created! Restart Claude Code to activate. Every session will now start with your full business context."

### Step 7: MCP Recommendations

Based on detected services (GitHub authenticated? Notion docs found?), recommend MCPs:
"I detected you use GitHub and Notion. Want me to configure their MCP servers?"

If yes, help set up each one conversationally.

## Important Notes

- Always use `${CLAUDE_PLUGIN_ROOT}` to reference plugin files
- Never copy credential values — only catalog what exists
- Write all brain data to the brain folder, never to the plugin directory
- The brain folder should be gitignored by default (add a .gitignore)
- Set `BIZBRAIN_PATH` environment variable for future sessions
