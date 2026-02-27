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
3. Profile selection — present the 5 profiles with descriptions using AskUserQuestion:
   - Developer / Technical Solopreneur (Recommended)
   - Content Creator
   - Consultant / Freelancer
   - Agency Owner
   - Personal / Life Organizer
   The user can also type their own description if none of these fit — adapt the closest profile and customize features based on what they describe.

### Step 2.5: Mode Selection

After profile selection, ask about brain organization mode.
Read the selected profile JSON from `${CLAUDE_PLUGIN_ROOT}/profiles/<profile_id>.json` to get the `recommended_mode`.

Present the choice using AskUserQuestion:

```
How should your brain be organized?

  [1] Full Install (Recommended)
      Three separate zones inside one folder: brain, workspaces, and conversations.
      Your code repos get lean AI context (~80 lines vs ~300).
      Business conversations get auto-captured with entity watchdog.
      Best for: getting the most out of BizBrain OS.

  [2] Simple
      Everything in one folder. Quick setup, easy to manage.
      Best for: trying it out or minimal setups.

This is optional — you can switch modes later with /brain configure.
```

Full Install is always the recommended option regardless of profile. The three-zone architecture gives every user the best experience.

The user can also type a custom answer to describe their own preference.

Store the choice as `mode` ("full" or "compact") for Step 4.

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

**Before presenting categories, offer a quick shortcut:**

```
I found projects, services, and collaborators on your machine.

  [1] Include Everything (Recommended) — add all discovered items to your brain
  [2] Let Me Choose — review each category and pick what to include

This step is optional — you can always add or remove items later with /brain scan.
```

If the user picks "Include Everything", skip the per-category selection and include all items.
If the user picks "Let Me Choose" (or types a custom response), present each category:

**Projects/Repos** (if any found):
```
Found N code repositories:

  [1] ✓ geoviz-app          NextJS    ~/Repos/geoviz-app
  [2] ✓ bizbrain-os         Rust      ~/Repos/bizbrain-os
  [3] ✓ old-prototype       Node      ~/Projects/old-prototype
  [4] ✓ client-portal       Python    ~/Repos/client-portal

Type numbers to EXCLUDE (e.g. "3 4"), "all" to keep all, "none" to skip,
or type your own paths to add manually:
```

**Services/Tools** (if any found):
```
Found N services and tools:

  [1] ✓ GitHub CLI           authenticated
  [2] ✓ Node.js              v20.11.0
  [3] ✓ Python               3.13
  [4] ✓ Claude Code config   ~/.claude.json

Type numbers to EXCLUDE, "all" to keep all, "none" to skip,
or type a service name to add manually:
```

**Entities/Collaborators** (if any found from git history — optional):
```
Found N collaborators in git history (optional — skip if you don't need entity tracking):

  [1] ✓ Jane Smith           jane@example.com      12 commits
  [2] ✓ Bob Johnson          bob@corp.com           5 commits
  [3] ✓ GitHub Actions       noreply@github.com     3 commits

Type numbers to EXCLUDE, "all" to keep all, "none" to skip,
or type names/emails to add people not found in git:
```

**Processing user response:**
- Numbers (e.g. "3 4" or "3, 4") → exclude those items, keep the rest
- "all" → keep everything in this category
- "none" → exclude everything in this category
- Empty response → treat as "all" (keep everything)
- Free text (paths, names, services) → add those manually in addition to discovered items

After all categories are selected, show a final summary:
```
Brain will track:
  Projects: 2 of 4
  Services: 4 of 4
  Entities: 2 of 3

Proceed? (yes/no)
```

Store selections in `.bizbrain/scan-cache.json` (full results) and only populate the brain with selected items in Step 5. The excluded items are saved so `/brain scan` can offer them again later.

### Step 3.7: Plugin Ecosystem Detection

Scan the user's Claude Code setup to detect existing plugins and integrations:

1. **Read `~/.claude/settings.json`** → extract `enabledPlugins` list
2. **Scan `~/.claude/plugins/marketplaces/`** → list registered marketplaces
3. **Check for key plugins** and record what's already available:

| Plugin | What It Provides | Brain Integration |
|--------|-----------------|-------------------|
| `superpowers` | TDD, debugging, brainstorming, plan writing, git worktrees | Brain stores plans and decisions from superpowers workflows |
| `gsd` (if standalone) | Phase-based project execution | Brain tracks GSD phases, roadmaps, and completion |
| `code-review` | PR review workflows | Brain logs review feedback and patterns |
| `commit-commands` | Git commit workflows | Brain captures commit patterns |
| `feature-dev` | Guided feature development | Brain stores feature specs and architecture decisions |
| `hookify` | Custom hook creation | Brain can suggest hooks based on patterns |
| `slidev` | Presentation creation | Brain tracks presentation assets |

4. **Store detected plugins** in `config.json` under `integrations.detected_plugins`
5. **Recommend missing plugins** that would enhance the brain:

```
I detected these Claude Code plugins already installed:
  ✓ superpowers (TDD, debugging, brainstorming)
  ✓ code-review
  ✓ commit-commands
  ✓ feature-dev

These plugins would supercharge your brain:
  [1] hookify — Create custom automations (your brain can suggest hooks)
  [2] context7 — Library documentation lookup
  [3] episodic-memory — Semantic search across past sessions

Install any? (optional) Type numbers, "skip", or describe a plugin you'd like:
```

6. **Configure integrations** — For detected plugins, the brain automatically:
   - Stores GSD roadmaps/plans in `Projects/<name>/.planning/`
   - Logs decisions from brainstorming sessions to `Knowledge/decisions/`
   - Captures feature specs from feature-dev to `Knowledge/specs/`
   - Tracks code review feedback patterns
   - Feeds superpowers' TDD results into project status

The brain doesn't duplicate these plugins — it **wraps around them**, capturing the outputs they produce and feeding context back in. Superpowers does TDD; the brain remembers what was tested and why. GSD manages phases; the brain persists phase history across sessions.

### Step 4: Create the Brain Folder

**The folder structure depends on the mode selected in Step 2.5.**

#### Compact Mode (mode = "compact")

Brain IS the root. Simple, flat structure:

```
~/bizbrain-os/                    # Brain root (config.json lives here)
  ├── config.json
  ├── Knowledge/
  ├── Entities/
  ├── Projects/
  ├── Operations/
  ├── _intake-dump/
  └── .bizbrain/
```

1. Create `~/bizbrain-os/` (or chosen path)
2. Read `${CLAUDE_PLUGIN_ROOT}/lib/folder-structure.json`
3. Create all `core` folders directly in root
4. Create `features` folders based on selected profile
5. Write `config.json` with `"mode": "compact"`
6. Write `.bizbrain/state.json` with initial state
7. Write `.bizbrain/hooks-state.json` with auto_behaviors from profile

#### Full Mode (mode = "full")

Three-zone architecture with context isolation:

```
~/bizbrain-os/                    # Root container
  ├── .bizbrain-root.json         # Mode marker (tells hooks which mode)
  ├── CLAUDE.md                   # Minimal root context (~20 lines)
  │
  ├── brain/                      # Full business intelligence
  │   ├── config.json
  │   ├── CLAUDE.md               # (auto-generated by SessionStart hook)
  │   ├── Knowledge/
  │   ├── Entities/
  │   ├── Projects/
  │   ├── Operations/
  │   ├── _intake-dump/
  │   └── .bizbrain/
  │
  ├── workspaces/                 # Code repos (lean context)
  │   ├── CLAUDE.md               # Lean dev commands (~80 lines)
  │   └── (repos cloned/created here)
  │
  └── conversations/              # Quick brain chats (medium context)
      ├── CLAUDE.md               # Compact brain briefing + entity watchdog
      └── (auto-captured sessions)
```

1. Create `~/bizbrain-os/` root container
2. Write `.bizbrain-root.json` root marker:
   ```json
   {
     "mode": "full",
     "version": "2.0.0",
     "brainDir": "brain",
     "workspacesDir": "workspaces",
     "conversationsDir": "conversations"
   }
   ```
3. Copy zone CLAUDE.md templates from `${CLAUDE_PLUGIN_ROOT}/lib/zone-templates/`:
   - `root-claude.md` → `~/bizbrain-os/CLAUDE.md`
   - `workspaces-claude.md` → `~/bizbrain-os/workspaces/CLAUDE.md`
   - `conversations-claude.md` → `~/bizbrain-os/conversations/CLAUDE.md`
4. Create `brain/` subdirectory
5. Read `${CLAUDE_PLUGIN_ROOT}/lib/folder-structure.json`
6. Create all `core` folders inside `brain/`
7. Create `features` folders based on selected profile inside `brain/`
8. Write `brain/config.json` with `"mode": "full"`
9. Write `brain/.bizbrain/state.json` with initial state
10. Write `brain/.bizbrain/hooks-state.json` with auto_behaviors from profile

**Both modes:** Write `config.json` from `${CLAUDE_PLUGIN_ROOT}/lib/default-config.json` template, filled with user info + profile settings. Set the `"mode"` field accordingly.

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

### Step 6: Brain Intelligence Report

After populating the brain, analyze everything discovered and generate a **"Here's What I Learned"** report.
This is the moment the brain proves its value — show the user you already understand them.

**6a. Profile Summary — "Here's what I see"**

Write a natural-language overview of what the brain learned. Present it directly to the user (not as a file). Example tone:

```
## Your Brain at a Glance

You're a full-stack developer working primarily in TypeScript and Next.js,
maintaining 8 active projects across 3 clients. Your most active project is
BuildTrack (committed 2 hours ago). You use Supabase as your primary database
across 4 projects, Stripe for payments in 2, and Clerk for auth in 3.

You collaborate with 5 people regularly — Sarah and Jake appear across multiple
repos. You have GitHub CLI authenticated and 12 MCP servers configured in
Claude Code.

Your workflow leans heavily on Claude Code (24 plugins installed) with
automated time tracking and session archiving already set up.
```

Adapt the summary based on what was actually found. Be specific — use real project names, real numbers, real patterns. This should feel like talking to someone who actually looked at your work, not a generic template.

**6b. User Review — "Did I get this right?"**

After presenting the summary, ask via AskUserQuestion:

```
Did I get this right? Feel free to correct anything, add context I missed,
or tell me more about what you're working on:
```

If the user provides corrections or additions:
- Update the relevant brain files (config.json, project overviews, entity records)
- Acknowledge each correction: "Got it — updated [thing]."
- If they mention new projects/clients/tools not found in the scan, add those too

If they say "looks good" or similar, proceed to the next step.

### Step 7: Recommendations — "Here's what I can do for you"

Based on the scan analysis, present **3-5 personalized recommendations** of things Claude Code could build or automate for the user. These should feel mind-blowingly relevant — not generic suggestions.

**Analyze patterns to generate recommendations:**

- **Cross-project patterns** → "You have 4 Next.js + Supabase projects. Want me to create a shared deployment runbook skill that handles migrations, env sync, and Vercel deploy for any of them?"
- **Workflow gaps** → "You have repos but no CI configs. Want me to scaffold GitHub Actions for your 3 most active projects?"
- **Client patterns** → "You work with 3 clients. Want me to generate a weekly status dashboard that pulls from git commits, open issues, and your time logs?"
- **Repetitive work** → "You have similar tech stacks across projects. Want me to create a project scaffold skill that spins up your standard Next.js + Supabase + Clerk setup in one command?"
- **Monitoring** → "You have 5 deployed sites. Want me to build a health-check dashboard that pings them all and alerts you when something's down?"
- **Content from code** → "Based on your project history, want me to auto-generate changelog entries, dev blog drafts, or social posts from your recent commits?"
- **Data insights** → "You have Supabase in 4 projects. Want me to build a cross-project analytics view showing user growth, API usage, and costs across all of them?"
- **Relationship intelligence** → "You collaborate with Sarah on 3 projects but Jake only on 1. Want me to track collaboration patterns and suggest when to loop people in?"

**Format recommendations as a numbered list:**

```
Based on what I found, here are some things I could build for you:

  [1] Client Status Dashboard — Auto-generated weekly report pulling
      from git commits, time logs, and open issues for each client.

  [2] Universal Deploy Skill — One command to deploy any of your
      Next.js + Supabase projects with migration checks and env sync.

  [3] Stale Project Detector — Weekly scan that flags repos with no
      commits in 30+ days and suggests archiving or follow-up.

  [4] Smart Project Scaffold — Spin up your standard stack (Next.js +
      Supabase + Clerk + Stripe) pre-configured with your conventions.

  [5] Commit-to-Content Pipeline — Auto-draft changelogs, dev blog
      posts, and social updates from your recent development work.

Want me to build any of these? (optional) Type numbers (e.g. "1 3"), "skip",
or describe your own idea:
```

If the user selects any:
- Create a `Knowledge/recommendations/` folder in the brain
- Save each selected recommendation as a brief spec file (e.g., `client-dashboard.md`)
- Tell the user: "Saved to your brain. Next time you say 'build the client dashboard', I'll know exactly what you mean."

If the user describes their own idea instead, capture that too.

### Step 8: State of the Stack Report

Generate and save a **State of Your Stack** report to `Knowledge/reports/stack-report.md`:

```markdown
# State of Your Stack
Generated: 2026-02-25

## Overview
- **Active Projects:** 8 (6 TypeScript, 1 Rust, 1 Python)
- **Primary Stack:** Next.js + Supabase + Clerk + Stripe
- **Collaborators:** 5 active across repos
- **Services:** 12 integrated (GitHub, Supabase, Stripe, Clerk, Vercel, ...)
- **Claude Code:** 24 plugins, 12 MCPs, automated time tracking

## Projects by Activity
| Project | Stack | Last Commit | Status |
|---------|-------|-------------|--------|
| BuildTrack | Next.js/Supabase | 2 hours ago | Active |
| GeoViz | Next.js/Clerk | 3 days ago | Active |
| ... | ... | ... | ... |

## Tech Distribution
- TypeScript/JavaScript: 6 projects
- Rust: 1 project
- Python: 1 project

## Service Usage
| Service | Projects Using It |
|---------|------------------|
| Supabase | 4 |
| Stripe | 2 |
| Clerk | 3 |

## Workflow Health
- ✓ Version control: All projects use git
- ✓ Auth configured: Clerk in 3 projects
- ⚠ No CI/CD detected in 5 of 8 projects
- ⚠ 2 projects with no commits in 30+ days

## Recommendations
[References from Step 7]
```

Tell the user: "Saved your stack report to Knowledge/reports/ — I'll keep it updated as your brain learns."

### Step 9: Workflow Gap Analysis

Quickly analyze what's **missing** from the user's setup and present it as opportunities, not problems:

```
A few things I noticed that could level you up:

  • No CI/CD in 5 projects — deploys are manual or missing
  • No test frameworks detected in 3 repos
  • Supabase RLS policies not detected in 2 projects
  • No backup/export strategy for your brain data
  • 2 projects haven't been touched in 30+ days (stale?)

These aren't urgent — just things your brain will keep an eye on.
Want me to help with any of these now? (optional — type numbers, "skip", or describe something else)
```

Save gap analysis to `Knowledge/reports/gap-analysis.md`.

### Step 10: MCP Recommendations

Based on detected services (GitHub authenticated? Notion docs found?), recommend MCPs:
"I detected you use GitHub and Notion. Want me to configure their MCP servers? (optional)"

If yes, help set up each one conversationally. The user can also type custom MCP names or skip entirely.

### Step 10.5: Obsidian Session Archiving

If the scanner detected Obsidian vaults (look for `OBSIDIAN|` lines in scan output), offer to set up automatic session archiving:

```
I found Obsidian vault(s) on your machine:
  [1] BB1-Archive at ~/Documents/Obsidian/BB1-Archive/
  [2] Personal at ~/Documents/Obsidian/Personal/

Want to automatically archive your Claude Code sessions to Obsidian?
Every session will be saved as a searchable note with metadata, tags, and summaries.

Select a vault, "skip", or type a custom vault path (optional):
```

If the user selects a vault:
1. Add `obsidian` to config.json integrations with the vault path
2. Create the archive folder in the vault: `<vault>/Claude-Sessions/`
3. Store the archive config in `Operations/integrations/obsidian.json`:
   ```json
   {
     "enabled": true,
     "vaultPath": "<selected-vault-path>",
     "archiveFolder": "Claude-Sessions",
     "autoArchive": true
   }
   ```
4. Tell the user: "Session archiving is now active. Every Claude Code session will be saved to your Obsidian vault for easy searching."

### Step 11: Finalize

1. Generate the brain's `CLAUDE.md` (will be auto-refreshed by SessionStart hook on future sessions)
2. Set `BIZBRAIN_PATH` environment variable if not already set
3. Create `Operations/learning/summaries/` and `Knowledge/decisions/` directories
4. **Full mode only:** Remind the user about the three zones:
   ```
   Your brain has three zones:
     brain/          — Open Claude Code here for full brain operations
     workspaces/     — Clone or create code repos here for lean dev context
     conversations/  — Open Claude Code here for business discussions
   ```
5. Present the finish message:

```
Your brain is alive! Here's what's now running automatically:

  ✓ SessionStart hook — Injects your full context into every session
  ✓ PostToolUse hook — Tracks time, detects new repos, logs activity
  ✓ SessionEnd hook — Captures session duration and metadata
  ✓ Entity Watchdog — Monitors conversations for client/partner mentions
  ✓ Brain Learner — Writes back decisions, action items, and session summaries
  ✓ Continuous Learning — Every session compounds context for the next one

What happens from here:
  • Open Claude Code anywhere → it already knows your projects, clients, and stack
  • Make a decision → brain logs it automatically
  • Mention a task → brain captures it as an action item
  • Work in a new repo → brain detects it and offers to onboard it
  • End a session → brain saves a summary for next time

Try these:
  /brain status    — See your brain's current state
  /brain scan      — Re-scan for new projects
  /todo            — View tasks across all projects
  /entity <name>   — Look up any client or collaborator
  /gsd             — Structured project execution

Restart Claude Code to activate all hooks and agents.
```

## Important Notes

- Always use `${CLAUDE_PLUGIN_ROOT}` to reference plugin files
- Never copy credential values — only catalog what exists
- Write all brain data to the brain folder, never to the plugin directory
- The brain folder should be gitignored by default (add a .gitignore)
- Set `BIZBRAIN_PATH` environment variable for future sessions
- The Intelligence Report (Step 6) should feel personal and specific, never generic
- Recommendations (Step 7) should reference actual project names and patterns found
- Always let the user correct, add to, or reject any analysis before proceeding
