# BizBrain OS — Getting Started Guide

## NotebookLM Slide Deck Instructions

**Generate a visual, engaging slide deck presentation from this document.** This is a getting started guide for BizBrain OS, a Claude Code plugin that creates a persistent AI knowledge brain.

- **Format:** Slide deck with speaker notes
- **Target length:** 20–28 slides
- **Audience:** Developers, agency owners, consultants, and solopreneurs who use Claude Code daily
- **Tone:** Professional but energetic — like a senior developer showing a colleague something that genuinely changed how they work
- **Visual style:** Clean, modern, dark theme preferred. Use diagrams, code blocks, and comparison tables where described. Bold key numbers and takeaways.
- **Narrative arc:** Problem → Solution → How It Works → Getting Started → Features → Proof → Compound Value → Call to Action
- **Key principle:** Every slide should have ONE clear takeaway. If the audience remembers nothing else from a slide, they should remember the bolded headline.

---

# The Problem

## Every Claude Code Session Starts From Zero

Open Claude Code. Explain your project. Describe your tech stack. List your clients. Share file paths. Describe that decision you made last Tuesday.

Close the session. Open a new one. Do it all again.

Claude doesn't remember who you are. It doesn't know your projects, your clients, your architectural decisions, or the 47 open tasks you're juggling across 8 repositories. **Every session is a blank slate.**

This isn't a minor inconvenience. It's a structural problem that gets worse the more you use Claude Code.

## The Math Is Brutal

For power users, "context amnesia" has a real cost:

- **Average re-explanation time:** 5–10 minutes per session
- **Sessions per day:** 5–15 (for active developers)
- **Daily cost:** 25–150 minutes of context re-loading
- **Weekly cost:** Up to 12.5 hours — more than a full workday
- **Monthly cost:** 50+ hours of telling the AI who you are

That's up to **2.5 hours per day** spent re-explaining yourself to an AI that should already know.

For a solo developer managing 8 projects across 3 clients, this is frustrating. For an agency owner juggling 15 client projects, it's devastating.

## What If Claude Already Knew?

Imagine opening Claude Code and it already knows:
- Your 12 active projects and their current status
- Your 5 clients and what you promised each of them
- That you chose Supabase over Firebase last month (and why)
- The 3 action items from yesterday's meeting
- Your preferred tech stack, naming conventions, and workflow patterns

**No re-explaining. No context files. No copy-pasting.** Claude just knows — because it learned from every previous session.

That's BizBrain OS.

---

# What Is BizBrain OS?

## The Compound Interest of AI Context

BizBrain OS is a **Claude Code plugin** that creates a persistent knowledge brain on your local machine. It's the context layer that teaches Claude your business — once — and gets smarter every day.

Think of it like compound interest:

- **Every session deposits context** — decisions you made, entities you mentioned, tasks you created, knowledge you captured
- **Every future session withdraws it** — Claude starts with your full business context already loaded
- **The balance only grows** — patterns, preferences, and relationships compound over time

After one week, Claude knows your projects. After one month, Claude knows your clients, their preferences, and your architectural patterns. After three months, Claude is an extension of your business memory.

**Nothing ever falls through the cracks again.**

## How It Works: Three Pillars

BizBrain OS is built on three pillars that work together automatically.

### Pillar 1: The Brain Folder

A local-only knowledge store on your machine. Structured folders for everything about your business:

```
~/bizbrain-os/
  ├── brain/                  # Your business intelligence
  │   ├── Knowledge/          # Docs, decisions, templates, reports
  │   ├── Entities/           # Clients, partners, vendors, contacts
  │   ├── Projects/           # Project metadata, status, action items
  │   ├── Operations/         # Todos, credentials, timesheets, integrations
  │   └── _intake-dump/       # Drop zone — voice notes, PDFs, contracts
  │
  ├── workspaces/             # Code repos with lean AI context
  └── launchpad/              # Start all sessions here
```

Your data never leaves your machine. No cloud. No external APIs. No telemetry. **100% local.**

### Pillar 2: Automatic Context Injection

Every time you open Claude Code, a SessionStart hook fires automatically:

1. **Discovers** your brain folder
2. **Reads** your config, active projects, entities, open tasks, recent decisions
3. **Generates** a tailored context block for your current session
4. **Injects** it into Claude's system prompt — before you type a single word

**Result:** Claude already knows your projects, clients, and stack the moment the session starts. Zero manual effort.

### Pillar 3: Continuous Learning

While you work, the brain is silently learning:

- **Entity Watchdog** monitors every conversation for client/partner mentions and auto-updates records
- **Time Tracking** logs every tool use as a heartbeat — survives crashes, requires no timers
- **Decision Logging** captures architectural and business decisions with full rationale
- **Action Item Extraction** routes tasks mentioned in conversation to the right project or client
- **Session Summaries** connect your sessions to each other across days and weeks

The brain doesn't just read your context — **it writes back.** Every session makes the next one smarter.

---

# Getting Started

## Prerequisites

You need three things:

- **Claude Code** (latest version with plugin support)
- **Node.js** 18+ (for context generation scripts)
- **5 minutes** of your time

That's it.

## Step 1: Install the Plugin

Open Claude Code (`claude` in your terminal), then type these slash commands:

```
/plugin marketplace add TechIntegrationLabs/bizbrain-os-plugin
/plugin install bizbrain-os
```

> **Important:** These are slash commands inside Claude Code, not terminal commands.

The plugin registers its hooks, commands, skills, and agents automatically. No configuration needed.

## Step 2: Run the Setup Wizard

Close and reopen Claude Code, then type:

```
/brain setup
```

The wizard walks you through four stages in about 5 minutes.

### Stage 1: Tell It About You

Three questions: your name, your business name, and which profile fits your work style.

### Stage 2: Pick Your Profile

Five profiles, each optimized for a different workflow:

| Profile | Best For | Key Features |
|---------|----------|-------------|
| **Developer** | Solo devs, indie hackers, technical founders | GSD workflow, repo tracking, Supabase/GitHub, entity management |
| **Agency Owner** | Multi-client agencies managing teams | ALL features enabled — clients, billing, content, outreach, comms |
| **Consultant** | Freelancers and service providers | Client tracking, proposals, time tracking, billing |
| **Content Creator** | Bloggers, YouTubers, social media creators | Content pipeline, social scheduling, audience management |
| **Personal** | Life organization and knowledge management | Minimal: knowledge, todos, intake processing |

Every feature can be toggled on or off later. The profile just sets smart defaults.

### Stage 3: Machine Scan

The scanner automatically discovers everything on your machine:

- **Code repositories** in common locations (~/Repos, ~/Projects, ~/Code, etc.)
- **Installed tools** (git, node, gh, python, cargo, docker, etc.)
- **Service configs** (Claude Code settings, Obsidian vaults, .env files)
- **Git collaborators** (potential entity records from commit history)

You review everything and choose what to include. **Nothing is imported without your approval.** You can add or remove items any time with `/brain scan`.

### Stage 4: Intelligence Report

After scanning, the brain generates a personalized analysis of your setup:

> *"You're a full-stack developer working primarily in TypeScript and Next.js, maintaining 45 active repositories. Your most active project is bizbrain-os-site (committed today). You use Supabase as your primary database across 8 projects, Stripe for payments in 2, and Clerk for auth in 3. You have 25 Claude Code plugins installed with 14 custom hooks — one of the most instrumented setups I've seen."*

This is the moment the brain proves its value — **it already understands you**, and you haven't even started using it yet.

## Step 3: Restart Claude Code

After setup, restart Claude Code. The SessionStart hook activates and injects your context. From this moment forward, every session starts with your business intelligence loaded.

**Total setup time: ~5 minutes. Value: every future session is smarter.**

---

# The Three-Zone Architecture

## Why Three Zones?

Claude Code reads CLAUDE.md files from your working directory upward. A rich business brain with 300+ lines of context loads every time — even when you're just fixing a CSS bug. That's wasted tokens and slower startup.

The three-zone system solves this with **physical directory separation:** different folders load different amounts of context, optimized for what you're doing right now.

## Zone Overview

| Zone | Context Lines | Token Load | Best For |
|------|--------------|------------|----------|
| **launchpad/** | ~120 lines | Light | Daily sessions — planning, business, code discussions, brainstorming |
| **workspaces/** | ~80 lines | Ultra-lean | Pure code development — fast, minimal overhead |
| **brain/** | ~300 lines | Full | Deep operations — entity management, intake processing, brain admin |

### Launchpad — Your Daily Driver

**Start all Claude Code sessions here.** This is the default starting point for everything.

```bash
cd ~/bizbrain-os/launchpad && claude
```

You get optimized context (~120 lines), full entity watchdog, all brain commands, and automatic session capture. Every decision, action item, and entity mention is recorded back to the brain.

**Best for:** Any session — code, business, planning, brainstorming. When in doubt, start here.

### Workspaces — Lean Code Context

Clone or create repos inside `workspaces/`. When you open Claude Code in a project:

```bash
cd ~/bizbrain-os/workspaces/my-app && claude
```

Context is ultra-lean (~80 lines) — just dev commands and a project list. Brain commands like `/knowledge`, `/todo`, and `/entity` still work. Time tracking is still active. But there's no business context overhead slowing you down.

**Best for:** Active code development where speed matters.

### Brain — Full Business Intelligence

Open Claude Code directly in `brain/` for the complete picture:

```bash
cd ~/bizbrain-os/brain && claude
```

Full 300-line context with every entity, project, decision, and operational detail. Use this for deep operations like bulk entity management, intake processing, or brain configuration.

**Best for:** Admin tasks and deep business operations. You won't need this zone daily.

### How They Connect

The zones are porous — you can always reach across boundaries:

```
You (in workspaces/my-app): "What auth pattern do we use?"
Claude: /knowledge systems/auth  →  Reads from brain/Knowledge/
Claude: "You chose Supabase RLS over JWT middleware last month because..."

You: "Tim from Acme called — they want the dashboard by Friday"
Entity Watchdog: Updates Tim's record in brain/Entities/Clients/Acme-Corp/
Brain Learner: Creates action item in the project's task list
```

**Different zones, one brain.** The architecture is about optimizing token budgets, not limiting capabilities.

---

# Core Features

## Entity Management — Your Business Relationship Memory

Every person and organization that matters to your business gets a structured record:

```
Entities/Clients/Acme-Corp/
  ├── _meta.json        # Name, type, status, contacts
  ├── overview.md       # Relationship summary
  ├── history.md        # Complete interaction timeline
  └── action-items.md   # Open and completed tasks
```

### The Entity Watchdog

The always-on background agent that makes entity management effortless:

- You mention **"Jane's new email is jane@newco.com"** → Watchdog updates Jane's contact record automatically
- You mention **"We're starting a project with Spark Digital"** → Watchdog asks if you want to create their record
- You casually reference a client name with no new info → Watchdog silently ignores it

**You never manually enter entity data.** Just talk about your work and the brain keeps itself current.

## GSD — Get Shit Done Workflow

Structured project execution that turns ambitious goals into systematic progress:

**Milestones → Phases → Plans → Waves → Tasks**

```
/gsd new my-project      # Initialize with goals and timeline
/gsd requirements        # Define what "done" looks like (checkable criteria)
/gsd roadmap             # Break project into sequential phases
/gsd plan                # Break current phase into parallel waves
/gsd execute             # Run waves — tasks execute in parallel via subagents
/gsd status              # See what's done, in progress, and next
```

Independent tasks within a wave run in parallel using subagents. After each wave completes, changes are committed. Then the next wave begins.

**Result:** Complex projects execute systematically instead of ad-hoc. Progress is tracked automatically.

## Time Tracking — Heartbeat-Based, Not Timer-Based

Most time trackers require you to start and stop timers. You forget. Data is lost.

BizBrain OS uses **heartbeat tracking:** every tool call (Read, Write, Edit, Bash) generates a timestamp. This means:

- **Survives crashes** — everything up to the last tool call is captured
- **No "forgot the timer" problem** — it tracks passively while you work
- **Auto-detects breaks** — gaps longer than 30 minutes are treated as session boundaries
- **Per-project attribution** — time is linked to whichever project you're working in

```
/hours           # Today's hours
/hours week      # Weekly breakdown by project
/hours month     # Monthly summary for billing
```

## Todo Management — Context-Routed Tasks

Tasks from every project, client, and operation — in one unified dashboard:

```
/todo                        # See everything across all sources
/todo add Fix auth bug       # Auto-routes to current project
/todo done P-BT-003          # Mark complete with ID
/todo sync                   # Rebuild aggregated view
```

When you mention a task in conversation, it gets routed to the right place automatically — project action items, client records, or general operations — based on context.

## Knowledge Base — Your Accumulated Wisdom

Every decision, pattern, template, and reference — organized and searchable:

```
Knowledge/
  ├── systems/        # How your processes work
  ├── decisions/      # What was decided and why
  ├── templates/      # Reusable patterns
  ├── references/     # External bookmarks
  └── reports/        # Generated analysis
```

Access from anywhere: `/knowledge systems/auth-patterns` or `/knowledge decisions/2026-02-database-choice`

## Intake Processing — Drop Files, Get Structure

Drop any file into `_intake-dump/` and run `/intake`:

- **Voice notes** → Transcribed, entities extracted, 17 action items captured
- **Meeting transcripts** → Analyzed, 11 architectural gaps identified, 6 spec docs created
- **Contracts** → Filed to client folder, key terms extracted
- **PDFs** → Categorized, knowledge captured, linked to entities

Nothing is deleted — originals are archived after processing.

## Session Archiving to Obsidian

Every Claude Code session can be archived to your Obsidian vault as a searchable note:

```
/archive-sessions         # Archive new sessions
/archive-sessions stats   # Show statistics
```

Each note includes frontmatter tags, full user prompts, tool usage stats, and an auto-generated summary. Your entire Claude Code history becomes searchable.

---

# Real-World Proof

## "I Got a $1,800 Google API Bill"

An unexpected charge from Google Cloud. Instead of hours of manual investigation, one prompt: *"Hey, look into this charge."*

The brain analyzed the notification, pulled Google Cloud usage logs, determined the charges came from an unfamiliar IP address, compiled a complete dispute package with screenshots, and drafted the dispute email.

**Hours of investigation → minutes of automated work.**

## Voice Notes to Engineering Specs

A construction client recorded three voice memos on his phone describing what he wanted. The files were dropped into intake.

One `/intake` command processed all three and extracted: FMCSA compliance requirements, Gantt scheduling specifications, Smart Form feature requirements, **17 action items** with priorities, and 8 project risks.

**A client rambles on his phone. Minutes later, you have structured engineering specs.**

## Meeting Transcript to Architecture Update

A 57-minute client meeting transcript dropped into intake. The brain detected 3 entities, extracted 11 architectural gaps between the PRD and the client's actual vision, captured the exact 6-step workflow the client described, created 6 implementation spec documents, and updated the project dashboard.

**One meeting, one transcript. The entire project architecture updated itself.**

## Bug Reported in Slack → Fixed and Deployed Automatically

The Bug Crusher watches a Slack channel for keywords like "bug," "broken," "error":

1. Client posts: *"The login page is broken"*
2. Bug Crusher detects the message
3. Clones the repo, identifies root cause
4. Fixes the code, runs the build
5. Deploys to production
6. Verifies the fix
7. Posts back to Slack: *"Fixed and deployed!"*

**Zero human intervention. Bug reported → fixed → deployed → verified → communicated.**

## Automated Daily Social Media

Content Autopilot runs every morning at 7 AM:

1. Scans **84+ RSS feeds** for relevant content
2. Scores each item against your brand topics
3. Selects the top 5 items scoring 7+/10
4. Generates platform-specific posts (LinkedIn, Twitter, Instagram, Facebook)
5. Creates images with AI
6. Posts everything automatically

**Your social media presence runs while you sleep.**

## Multi-Instance Product Management

One product (ContentEngine) deployed to three different clients — each with isolated databases, branding, and configurations. When the template improves, one sync command shows what's different across all instances.

**Build once, deploy many. Manage all instances from one brain.**

---

# Security and Privacy

## Everything Stays Local

This is non-negotiable. BizBrain OS is 100% local:

- **Brain folder lives on YOUR machine** — never uploaded anywhere
- **No external API calls** from the plugin itself
- **No telemetry, no analytics, no phone-home** — zero data collection
- **Credentials are cataloged, never auto-copied** — actual values require explicit user action
- **Brain folder is gitignored by default** — sensitive data excluded from version control

Your business intelligence is yours alone. If you version-control your brain for backup, all credentials, configs, and intake files are automatically excluded.

---

# Your First Week

## Day 1: Setup

Run `/brain setup`. Let the scanner discover your projects. Pick a profile. Restart Claude Code.

**What changes:** Claude now knows your projects and basic context when you start a session.

## Day 2: Discover

Notice that Claude already knows your projects. Use `/todo add` to start tracking tasks. Mention a client in conversation and watch the Entity Watchdog update records automatically.

**What changes:** Tasks are tracked. Entities are building.

## Day 3: Process

Drop a file into `_intake-dump/` — a voice note, a meeting transcript, a contract. Run `/intake`. Watch it get classified, entity-linked, and routed to the right place.

**What changes:** Your intake pipeline is working. Unstructured input becomes structured knowledge.

## Day 4: Execute

Use `/gsd` to plan a project phase. Break it into waves. Execute with parallel agents. Watch tasks complete and commit automatically.

**What changes:** Project execution is systematic, not ad-hoc.

## Day 5: Reflect

Run `/hours` and see your week automatically logged by project. Run `/archive-sessions` to save everything to Obsidian. Check `/brain status` and see your brain's first week of growth.

**What changes:** Complete visibility into where your time went, and a searchable archive of everything you did.

---

# The Compound Effect

## Week 1
Claude knows your projects, tech stack, and basic setup. It's useful but still learning.

## Month 1
Claude knows your clients, their preferences, and your architectural patterns. It remembers decisions from two weeks ago. Entity records are filling out. Time tracking is complete.

## Month 3
Claude knows your entire business — relationships, decisions, workflows, and preferences. It starts sessions knowing exactly where you left off. Nothing falls through the cracks.

## Month 6
Claude is an extension of your business memory. It anticipates what you need, references past decisions contextually, and manages your operations with full historical awareness.

**Every session deposits context. Every future session withdraws it. The balance only grows.**

This is compound interest — applied to AI context. And unlike financial compound interest, there's no risk. Only growth.

---

# Get Started Now

## Install

Open Claude Code, then type these slash commands:

```
/plugin marketplace add TechIntegrationLabs/bizbrain-os-plugin
/plugin install bizbrain-os
```

## Setup (5 minutes)

Restart Claude Code, then type:

```
/brain setup
```

## Start Every Session From Your Launchpad

```bash
cd ~/bizbrain-os/launchpad && claude
```

## Key Numbers

- **5 minutes** to set up
- **14 skills** covering every aspect of operations
- **34+ service integrations** (GitHub, Supabase, Stripe, Slack, Notion, and more)
- **5 role-based profiles** with optimized defaults
- **3 background agents** working automatically
- **100% local** — your data never leaves your machine
- **Zero monthly cost** — open source under AGPL-3.0

---

# Appendix: Commands Reference

| Category | Command | Description |
|----------|---------|-------------|
| **Brain** | `/brain` | Status dashboard |
| | `/brain setup` | First-time wizard |
| | `/brain scan` | Re-scan for new projects |
| | `/brain configure` | Toggle features |
| | `/brain profile` | Switch profiles |
| **Entities** | `/entity <name>` | Look up entity |
| | `/entity add <name>` | Create entity |
| **Tasks** | `/todo` | Aggregated dashboard |
| | `/todo add <task>` | Add task (auto-routed) |
| | `/todo done <id>` | Complete task |
| **Projects** | `/gsd` | Project status + next action |
| | `/gsd new` | Initialize project |
| | `/gsd plan` | Plan phase into waves |
| | `/gsd execute` | Execute with parallel agents |
| **Operations** | `/hours` | Time tracking summary |
| | `/intake` | Process intake files |
| | `/mcp` | MCP server management |
| | `/archive-sessions` | Archive to Obsidian |
| **Communications** | `/comms` | Communication hub |
| | `/content` | Content pipeline |
| | `/outreach` | Lead pipeline |

# Appendix: Profile Feature Matrix

| Feature | Developer | Agency | Consultant | Creator | Personal |
|---------|:---------:|:------:|:----------:|:-------:|:--------:|
| Entity Management | Yes | Yes | Yes | Yes | — |
| Project Tracking | Yes | Yes | Yes | Yes | Yes |
| GSD Workflow | Yes | Yes | Yes | — | — |
| Knowledge Base | Yes | Yes | Yes | Yes | Yes |
| Time Tracking | Yes | Yes | Yes | Yes | — |
| Todo Management | Yes | Yes | Yes | Yes | Yes |
| Credential Management | Yes | Yes | Yes | Yes | Yes |
| MCP Management | Yes | Yes | Yes | Yes | Yes |
| Intake Processing | Yes | Yes | Yes | Yes | Yes |
| Communications | — | Yes | Yes | Yes | — |
| Content Pipeline | — | Yes | — | Yes | — |
| Outreach Engine | — | Yes | — | Yes | — |
| Session Archiving | Yes | Yes | Yes | Yes | Yes |

# Appendix: Integration Ecosystem

BizBrain OS supports **34+ service integrations** across 8 categories:

| Category | Services |
|----------|----------|
| **Development** | GitHub, Supabase, Stripe, Clerk, Netlify, Vercel |
| **Communication** | Gmail, Slack, Discord, WhatsApp, Telegram |
| **Social** | X/Twitter, LinkedIn, Facebook, Instagram, Bluesky, TikTok, YouTube, Reddit, Threads |
| **Productivity** | Notion, Google Drive, Google Calendar, Obsidian |
| **AI** | OpenAI, Anthropic, ElevenLabs, HeyGen, Veo 3 |
| **Publishing** | Postiz, Late.dev, Buffer |
| **CRM** | GoHighLevel |
| **Research** | Firecrawl, Screenpipe |

---

*BizBrain OS is built by Tech Integration Labs. Open source under AGPL-3.0.*
*GitHub: github.com/TechIntegrationLabs/bizbrain-os-plugin*
