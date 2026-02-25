# BizBrain OS — The Complete Getting Started Guide

## NotebookLM Generation Instructions

This document is optimized for Google NotebookLM slide deck generation. Please create a comprehensive, visually engaging presentation that serves as a getting started guide for BizBrain OS. Use professional design with clear section breaks. Include speaker notes for each slide with additional context. Target audience: developers, agency owners, consultants, and solopreneurs who use Claude Code daily.

### Recommended Output Format
- **Type:** Slide Deck (Presenter format with speaker notes)
- **Slides:** 25-35 slides
- **Tone:** Professional but energetic, builder-focused
- **Visual Style:** Clean, modern, with clear diagrams and code examples

---

# Part 1: What Is BizBrain OS?

## The Problem Every AI User Faces

Every time you open Claude Code, you start from zero. Claude doesn't remember your projects, your clients, your tech stack, or that critical decision you made last Tuesday. You re-explain context. You re-share file paths. You re-describe your business. Every. Single. Session.

For a solo developer managing 8 projects across 3 clients, this "context amnesia" costs hours per week. For an agency owner juggling 15 client projects, it's devastating.

**The math is brutal:**
- Average context re-explanation: 5-10 minutes per session
- Sessions per day: 5-15
- That's 25-150 minutes per day — up to 2.5 hours — just telling the AI who you are

## The Solution: Compound Context

BizBrain OS is a Claude Code plugin that creates a **persistent knowledge brain** on your machine. It's the context layer that teaches Claude your business — once.

Think of it like compound interest, but for AI context:
- **Every session deposits context** — decisions, entities, action items, project status
- **Every future session withdraws it** — Claude already knows your business when it starts
- **The brain grows smarter over time** — patterns, preferences, relationships compound

**After setup, every Claude Code session starts with your full business context automatically injected.** No re-explaining. No context files. No copy-pasting project details. Claude just knows.

## How It Works: Three Pillars

### Pillar 1: The Brain Folder

A local-only knowledge store on your machine. Organized folders for everything:

```
~/bizbrain-os/
  ├── brain/                  # Your business intelligence
  │   ├── Knowledge/          # Docs, decisions, templates
  │   ├── Entities/           # Clients, partners, vendors
  │   ├── Projects/           # Project metadata and status
  │   ├── Operations/         # Todos, credentials, timesheets
  │   └── _intake-dump/       # Drop zone for processing
  │
  ├── workspaces/             # Code repos (lean AI context)
  │   └── my-app/
  │
  └── conversations/          # Business chats (auto-captured)
```

### Pillar 2: Automatic Context Injection

Every time Claude Code opens — startup, resume, clear, compact — the SessionStart hook fires:

1. Discovers your brain folder
2. Reads your config, projects, entities, todos, recent decisions
3. Generates a context block tailored to what you're doing
4. Injects it into Claude's system prompt

**Result:** Claude already knows your projects, clients, and tech stack before you type a single word.

### Pillar 3: Continuous Learning

While you work, the brain is learning:

- **Time tracking:** Every tool use is logged (heartbeat-based — survives crashes)
- **Entity detection:** The Entity Watchdog monitors conversations for client/partner mentions
- **Decision logging:** When you make architectural or business decisions, they're captured
- **Action item extraction:** Tasks mentioned in conversation are routed to the right project
- **Session summaries:** AI-generated summaries connect sessions to each other

The brain doesn't just read — it writes back. Every session makes the next one smarter.

---

# Part 2: Getting Started

## Prerequisites

- **Claude Code** (latest version with plugin support)
- **Node.js** 18+ (for context generation)
- **Bash** (Git Bash on Windows, native on macOS/Linux)
- 5 minutes of your time

## Step 1: Install the Plugin

```bash
claude plugins install bizbrain-os
```

That's it. The plugin registers its hooks, commands, and skills automatically.

## Step 2: Run Brain Setup

Open Claude Code anywhere and run:

```
/brain setup
```

The setup wizard walks you through:

### 2a. Basic Info
- Your name
- Your business name (or project name)
- Profile selection

### 2b. Pick a Profile

Five profiles optimized for different workflows:

| Profile | Best For | Features | Mode |
|---------|----------|----------|------|
| **Developer / Technical Solopreneur** | Solo devs, indie hackers, technical founders | Full dev stack: GSD, repos, Supabase, GitHub, entity management | Full (3-zone) |
| **Agency Owner** | Multi-client agencies | ALL features: clients, billing, content, outreach, comms | Full (3-zone) |
| **Consultant / Freelancer** | Service providers | Client tracking, proposals, time tracking, billing | Full (3-zone) |
| **Content Creator** | Bloggers, YouTubers, writers | Content pipeline, social media, scheduling | Compact |
| **Personal / Life Organizer** | Personal productivity | Minimal: knowledge, todos, intake | Compact |

### 2c. Choose Your Mode

**Simple (Compact):** Brain is a single folder. Easy, straightforward. Everything in one place. Best for content creators and personal use.

**Power User (Full):** Three-zone architecture. Code repos get lean AI context (~80 lines instead of ~300). Business conversations get auto-captured with entity watchdog. This is the setup that serious developers and agencies want.

### 2d. Machine Scan

The scanner automatically discovers:
- All code repositories in common locations (`~/Repos/`, `~/Projects/`, etc.)
- Installed tools (git, node, gh, python, cargo, etc.)
- Service configurations (Claude Code, Obsidian vaults)
- Git collaborators (potential entities)

You choose what to include — nothing is imported without your approval.

### 2e. Intelligence Report

After scanning, the brain generates a personalized report:

> *"You're a full-stack developer working primarily in TypeScript and Next.js, maintaining 8 active projects across 3 clients. Your most active project is BuildTrack (committed 2 hours ago). You use Supabase as your primary database across 4 projects, Stripe for payments in 2, and Clerk for auth in 3."*

This is the moment the brain proves its value — it already understands you.

## Step 3: Restart Claude Code

After setup, restart Claude Code. The SessionStart hook activates and injects your full context. From now on, every session starts with your business intelligence loaded.

---

# Part 3: The Three-Zone Architecture (Power Users)

## Why Three Zones?

Claude Code reads `CLAUDE.md` files up the directory tree. A rich business brain with 300+ lines of context loads every time — even when you're just fixing a CSS bug. That's wasted tokens.

The three-zone system solves this with **physical directory separation**:

| Zone | Context | Token Load | Use For |
|------|---------|------------|---------|
| `brain/` | Full business intelligence | ~300 lines | Business operations, entity management, intake |
| `workspaces/` | Lean dev commands | ~80 lines | Code development — fast, minimal overhead |
| `conversations/` | Compact brain briefing | ~120 lines | Business discussions with auto-capture |

### The Brain Zone (`brain/`)

This is your full business intelligence center. Open Claude Code here for:
- Managing clients, partners, vendors
- Processing intake files (voice notes, contracts, PDFs)
- Running the GSD project management system
- Viewing the business status dashboard
- Full entity watchdog with auto-updating

### The Workspaces Zone (`workspaces/`)

Clone or create code repos here. When you `cd workspaces/my-app && claude`:
- Context is lean (~80 lines) — just dev commands and project list
- Brain commands still available: `/knowledge`, `/todo`, `/entity`, `/hours`
- Time tracking is active
- New repos are auto-detected for brain onboarding
- No business context overhead

### The Conversations Zone (`conversations/`)

Open Claude Code here for business discussions. You get:
- Compact brain briefing (projects, entities, action items)
- Full entity watchdog (auto-detects mentions)
- All brain commands available
- **Auto-capture:** Every conversation is saved to the brain's intake for processing
- Where to record decisions, action items, and updates back to the brain

### How It All Connects

```
You: cd ~/bizbrain-os/workspaces/my-saas-app && claude
Claude: [Lean context loaded — knows your project list, has dev commands]

You: "What's the auth setup for this project?"
Claude: /knowledge systems/auth-patterns
Claude: [Reads brain knowledge, answers with full context]

You: "Tim from Acme called — they want the dashboard by Friday"
Claude: [Entity watchdog detects 'Tim' + 'Acme' → updates entity records]
Claude: [Captures action item → routes to project's action-items.md]
```

The zones are porous — Claude can always reach into the brain for knowledge. But the **default context** is optimized for what you're doing right now.

---

# Part 4: Core Features

## Entity Management

Every client, partner, vendor, and person gets a structured record:

```
Entities/
  ├── Clients/
  │   └── Acme-Corp/
  │       ├── _meta.json        # Name, type, status, aliases, contacts
  │       ├── overview.md       # What they do, relationship summary
  │       ├── history.md        # Interaction timeline
  │       └── action-items.md   # Open/completed tasks
  │
  ├── Partners/
  ├── Vendors/
  └── People/
      └── ENTITY-INDEX.md       # Master cross-reference
```

### Entity Watchdog

The always-on background monitor that watches every conversation:

- **Auto-updates** when you mention new contact info, titles, interactions
- **Asks first** before creating new entities or changing status
- **Silently ignores** casual mentions with no new information

> *"Updated Tim's email to tim@acme.com in brain."*

You never manually enter entity data. Just talk about your work and the brain keeps itself current.

## Project Tracking

Every project gets metadata linked to its repository:

```json
{
  "name": "buildtrack",
  "status": "active",
  "repoPath": "~/bizbrain-os/workspaces/buildtrack",
  "stack": "nextjs",
  "client": "Tim",
  "lastActivity": "2026-02-25"
}
```

The SessionStart hook shows all your projects in every session. New repos are auto-detected and offered for brain onboarding.

## GSD (Get Shit Done) Workflow

Structured project execution: **Milestones → Phases → Plans → Waves → Tasks**

```
/gsd new my-project          # Initialize
/gsd requirements            # Define done criteria
/gsd roadmap                 # Create phase roadmap
/gsd plan                    # Break phase into waves
/gsd execute                 # Execute with parallel agents
/gsd status                  # Check progress
```

Waves contain independent tasks that can run in parallel with subagents. After each wave, changes are committed. This turns ambitious projects into systematic execution.

## Time Tracking

**Heartbeat-based** — not bookend-based. Every tool use writes a timestamp. This means:
- Survives crashes (everything up to the last tool call is captured)
- No "forgot to start/stop the timer" problem
- Session breaks auto-detected (>30 min gap = new session)
- Rounds to nearest 15 minutes for billing

```
/hours           # Today's hours
/hours week      # Week summary
/hours month     # Month summary
```

## Todo Management

Unified task tracking across all projects, entities, and operations:

```
/todo                    # Aggregated dashboard
/todo add Fix auth bug   # Auto-routes to current project
/todo done P-BT-003      # Mark complete
/todo sync               # Rebuild aggregated view
```

Todos are context-routed: mention a project and it goes to that project's action items. Mention a client and it goes to their record.

## Knowledge Base

Your accumulated wisdom, organized:

```
Knowledge/
  ├── systems/        # How things work
  ├── decisions/      # What was decided and why
  ├── templates/      # Reusable patterns
  ├── references/     # External links and docs
  └── reports/        # Generated analysis
```

Access from anywhere:
```
/knowledge systems/auth-patterns
/knowledge decisions/2026-02-database-choice
```

## Intake Processing

Drop any file into `_intake-dump/` and run `/intake`:

- **Voice notes** → Transcribed, entities extracted, action items routed
- **Contracts** → Filed to client/partner, key terms extracted
- **PDFs** → Analyzed, categorized, knowledge captured
- **Emails** → Classified, linked to entities, follow-ups tracked

Nothing is ever deleted — originals are archived after processing.

## Session Archiving to Obsidian

Every Claude Code session can be archived to your Obsidian vault:

```
/archive-sessions              # Archive new sessions
/archive-sessions stats        # Show statistics
```

Each session becomes a searchable Obsidian note with:
- Frontmatter tags (project, date, tools used)
- Full user prompts preserved
- Auto-generated summary
- Tool usage statistics
- Cross-linkable with other notes

## MCP Management

Control which AI services load with profiles:

```
/mcp                          # Show status
/mcp enable notion            # Enable an MCP
/mcp profile dev              # Switch profile (dev, full, minimal)
```

Each MCP server consumes 3K-20K tokens. Profiles let you manage your context budget:
- **minimal:** Zero MCPs, maximum context for simple tasks
- **dev:** GitHub + Supabase (~30K tokens)
- **full:** Everything (~80K tokens)

---

# Part 5: Real-World Use Cases

## Use Case 1: "I Got a $1,800 Google API Bill"

A real story from a BizBrain OS user: an unexpected $1,800 charge from Google Cloud. Instead of hours of frustrated manual investigation, they opened Claude Code and said: *"Hey, look into this charge."*

The brain:
1. Read the notification from Gmail (via MCP)
2. Analyzed Google Cloud usage logs
3. Determined the charges came from an IP address that wasn't theirs
4. Compiled a complete dispute package with screenshots and evidence
5. Drafted and sent the dispute email to Google

**Time saved: Hours of investigation → Minutes of automated work.**

## Use Case 2: Voice Notes → Structured Project Requirements

A construction client (non-technical) recorded three voice memos on his phone describing what he wanted his app to do. The files were dropped into `_intake-dump/`.

One `/intake` command processed all three recordings and:
- Extracted FMCSA compliance requirements
- Created Gantt scheduling specifications
- Documented Smart Form feature requirements
- Generated 17 action items with priorities
- Identified 8 project risks

**A client rambles on his phone. Minutes later, you have structured engineering specs.**

## Use Case 3: Meeting Transcript → Everything Updates

A 57-minute client meeting was transcribed and dropped into intake. The brain:
- Detected 3 entities (project, partner, client company)
- Extracted 11 architectural gaps between the PRD and the client's actual vision
- Captured the exact 6-step workflow the client described
- Created 6 new implementation spec documents
- Updated the project status dashboard

**One meeting, one transcript. The entire project architecture updated itself.**

## Use Case 4: Autonomous Slack App Setup

The user said: *"Use Chrome to set up a Slack integration for me."*

BizBrain OS (with Claude-in-Chrome):
- Navigated to api.slack.com/apps
- Clicked "Create an App" → "From scratch"
- Named it "BizBrain Connector"
- Selected the workspace from dropdown
- Got the App ID
- Navigated to OAuth & Permissions
- Started configuring Bot Token Scopes

**The AI literally clicked through Chrome and set up a Slack app without human interaction.**

## Use Case 5: Client Reports a Bug in Slack → Fixed and Deployed Automatically

The Bug Crusher system watches a Slack channel for keywords like "bug", "broken", "error":

1. Client posts: "The login page is broken"
2. Bug Crusher detects the message (20-minute polling cycle)
3. Clones the repo, identifies the root cause
4. Fixes the code, runs the build
5. Deploys to Netlify
6. Verifies the fix in production
7. Posts back to Slack: "Fixed and deployed!"

**Zero human intervention. Bug reported → fixed → deployed → verified → communicated.**

## Use Case 6: Automated Daily Social Media

The Content Autopilot runs every morning at 7 AM:
1. Scans 84+ RSS feeds for relevant content
2. Scores each item against your brand topics (AI, SaaS, tech leadership)
3. Selects the top 5 items scoring 7+/10
4. Generates platform-specific posts (LinkedIn, Twitter, Instagram, Facebook)
5. Creates images with AI
6. Posts everything — no human in the loop

**Your social media presence runs while you sleep.**

## Use Case 7: Multi-Instance Product Management

ContentEngine is one product deployed to 3 different clients:
- Disruptors Media (AI content)
- Polynesian Cultural Center (Hawaiian cultural content)
- Vinx Pest Control (pest control industry content)

Each instance has isolated databases, branding, and configurations. When the template improves, one sync command shows what's different across all three instances.

**Build once, deploy many. Manage all instances from one brain.**

## Use Case 8: The Brain Manages Its Own Evolution

Before any structural change to the brain, the `/integrate` command fires the System Integration Architect:

1. Analyzes the change request
2. Maps every affected file across the brain
3. Checks existing patterns and conventions
4. Generates a complete implementation plan
5. Waits for approval before proceeding

When BizBrain OS was asked to add a SaaS agent, the architect identified 29 files that needed updating — and created a coherent plan for all of them.

**The brain has change control for its own evolution. You can't break it by accident.**

---

# Part 6: Security & Privacy

## Everything Is Local

- Brain folder lives on YOUR machine — never uploaded anywhere
- No external API calls from the plugin itself
- No telemetry, no analytics, no phone-home

## Credential Safety

- Credentials are **cataloged** (we know what exists and where) but **never auto-copied**
- Actual credential values require explicit user action to store
- Vault files are user-readable only
- Display is always masked: `ghp_...abc`
- Credential catalog is gitignored by default

## Brain Folder Security

The brain folder includes a comprehensive `.gitignore`:
- Credentials directory
- Config.json (contains business info)
- Intake dump contents
- Session logs
- OS/editor files

If you version-control your brain (for backup), sensitive data is excluded by default.

---

# Part 7: Commands Reference

## Brain Management
| Command | Description |
|---------|-------------|
| `/brain` | Brain status dashboard |
| `/brain setup` | First-time setup wizard |
| `/brain scan` | Re-scan machine for new projects |
| `/brain configure` | Toggle features and behaviors |
| `/brain profile` | Switch profiles |

## Knowledge & Search
| Command | Description |
|---------|-------------|
| `/knowledge <topic>` | Load brain knowledge |
| `/todo` | Aggregated task dashboard |
| `/todo add <task>` | Add task (auto-routes) |
| `/entity <name>` | Entity lookup |
| `/entity add <name>` | Create entity |

## Project Execution
| Command | Description |
|---------|-------------|
| `/gsd` | Project status + next action |
| `/gsd new` | Initialize project |
| `/gsd plan` | Plan phase into waves |
| `/gsd execute` | Execute with parallel agents |

## Operations
| Command | Description |
|---------|-------------|
| `/hours` | Time tracking summary |
| `/intake` | Process intake files |
| `/mcp` | MCP server management |
| `/archive-sessions` | Archive to Obsidian |

## Communications
| Command | Description |
|---------|-------------|
| `/comms` | Communication hub |
| `/content` | Content pipeline |
| `/outreach` | Lead pipeline |

---

# Part 8: What Happens Next

## Your First Week

**Day 1:** Run `/brain setup`. Let the scanner discover your projects. Pick a profile. Restart Claude Code.

**Day 2:** Notice that Claude already knows your projects. Use `/todo add` to start tracking tasks. Mention a client in conversation — watch the Entity Watchdog update records.

**Day 3:** Drop a file into `_intake-dump/` and run `/intake`. Watch it get classified and routed to the right place.

**Day 4:** Use `/gsd` to plan a project phase. Execute it with wave-based parallelization.

**Day 5:** Run `/hours` and see your week's work automatically logged by project. Run `/archive-sessions` to save everything to Obsidian.

## After One Month

- Your brain has 50+ entity records, all auto-maintained
- Your knowledge base has 20+ decision records with rationale
- Every project has structured status and action items
- Time tracking is complete without you ever touching a timer
- Session summaries connect your past and future work
- Claude starts your sessions knowing exactly where you left off

## The Compound Effect

The more you use BizBrain OS, the more valuable it becomes:
- **Week 1:** Claude knows your projects and basic context
- **Month 1:** Claude knows your clients, their preferences, your architectural patterns
- **Month 3:** Claude knows your entire business — relationships, decisions, workflows
- **Month 6:** Claude is an extension of your business memory — nothing falls through the cracks

This is the compound interest of AI context. Every session deposits. Every future session withdraws. The balance only grows.

---

# Appendix A: Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    BizBrain OS Root                       │
│                   ~/bizbrain-os/                         │
├──────────────────┬──────────────────┬───────────────────┤
│                  │                  │                    │
│   brain/         │   workspaces/    │   conversations/   │
│   ┌──────────┐   │   ┌──────────┐  │   ┌──────────┐    │
│   │Knowledge │   │   │ my-app/  │  │   │ Auto-    │    │
│   │Entities  │   │   │ api-svc/ │  │   │ captured │    │
│   │Projects  │   │   │ website/ │  │   │ sessions │    │
│   │Operations│   │   └──────────┘  │   └──────────┘    │
│   │_intake   │   │                  │                    │
│   └──────────┘   │   Lean context   │   Medium context   │
│   Full context   │   ~80 lines      │   ~120 lines       │
│   ~300 lines     │                  │                    │
├──────────────────┴──────────────────┴───────────────────┤
│                                                          │
│   SessionStart Hook → Zone Detection → Context Injection │
│   PostToolUse Hook → Time Tracking → Repo Detection      │
│   SessionEnd Hook → Session Metadata → Archive Trigger   │
│                                                          │
│   Entity Watchdog (background) — Always monitoring        │
│   Brain Learner (background) — Capturing decisions/items │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

# Appendix B: Profile Feature Matrix

| Feature | Developer | Agency | Consultant | Creator | Personal |
|---------|-----------|--------|------------|---------|----------|
| Entity Management | Yes | Yes | Yes | Yes | - |
| Project Tracking | Yes | Yes | Yes | Yes | Yes |
| GSD Workflow | Yes | Yes | Yes | - | - |
| Knowledge Base | Yes | Yes | Yes | Yes | Yes |
| Time Tracking | Yes | Yes | Yes | Yes | - |
| Todo Management | Yes | Yes | Yes | Yes | Yes |
| Credential Mgmt | Yes | Yes | Yes | Yes | Yes |
| MCP Management | Yes | Yes | Yes | Yes | Yes |
| Intake Processing | Yes | Yes | Yes | Yes | Yes |
| Communications | - | Yes | Yes | Yes | - |
| Content Pipeline | - | Yes | - | Yes | - |
| Outreach Engine | - | Yes | - | Yes | - |
| Session Archiving | Yes | Yes | Yes | Yes | Yes |
| Recommended Mode | Full | Full | Full | Compact | Compact |

# Appendix C: Integration Registry

BizBrain OS supports 34+ service integrations across 8 categories:

| Category | Services | MCP Available |
|----------|----------|---------------|
| **Development** | GitHub, Supabase, Stripe, Clerk, Netlify, Vercel | GitHub, Supabase, Stripe |
| **Communication** | Gmail, Slack, Discord, WhatsApp, Telegram | Slack |
| **Social** | Twitter/X, LinkedIn, Facebook, Instagram, Bluesky, TikTok, YouTube, Reddit, Threads | - |
| **Productivity** | Notion, Google Drive, Google Calendar, Obsidian | Notion |
| **AI** | OpenAI, Anthropic, ElevenLabs, HeyGen, Veo 3 | - |
| **Publishing** | Postiz, Late.dev, Buffer | - |
| **CRM** | GoHighLevel | - |
| **Research** | Firecrawl, Screenpipe | Firecrawl, Screenpipe |

# Appendix D: Key Statistics

- **14 skills** covering every aspect of business operations
- **2 background agents** (Entity Watchdog + Brain Gateway)
- **11 slash commands** + `/archive-sessions`
- **5 role-based profiles** with optimized feature sets
- **34+ service integrations** (7 with MCP server configs)
- **3 hook events** (SessionStart, PostToolUse, SessionEnd)
- **5 auto-behaviors** with 3 modes each (auto/ask/off)
- **Zero external dependencies** — runs on Node.js built-ins
- **100% local** — no data leaves your machine

---

*BizBrain OS is built by Tech Integration Labs. Open source under AGPL-3.0.*
*Install: `claude plugins install bizbrain-os`*
*GitHub: github.com/TechIntegrationLabs/bizbrain-os-plugin*
