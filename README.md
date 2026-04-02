<p align="center">
  <img src="assets/brain-hero.png" alt="BizBrain OS Plugin" width="600" />
</p>

<h1 align="center">BizBrain OS — Claude Code Plugin</h1>

<p align="center">
  <strong>Persistent knowledge brain for Claude Code. Install once, never re-explain your business again.</strong>
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-Proprietary-red?style=flat-square" alt="License"></a>
  <img src="https://img.shields.io/badge/Version-3.5.1-22c55e?style=flat-square" alt="v3.5.0">
  <img src="https://img.shields.io/badge/Skills-23-f59e0b?style=flat-square" alt="23 Skills">
  <img src="https://img.shields.io/badge/Commands-16-ec4899?style=flat-square" alt="16 Commands">
  <img src="https://img.shields.io/badge/Integrations-37+-8b5cf6?style=flat-square" alt="37+ Integrations">
  <a href="#privacy--security"><img src="https://img.shields.io/badge/Privacy-100%25_Local-10b981?style=flat-square" alt="100% Local"></a>
</p>

---

## What It Does

BizBrain OS builds a **persistent knowledge layer** on your machine. It captures your clients, projects, decisions, and workflows — then automatically injects that context into every Claude Code session.

- **Session 1:** You tell Claude about your business once
- **Session 2+:** Claude already knows. Permanently.

Every session deposits context. Every future session withdraws it. The balance only grows.

---

## See It In Action

<p align="center">
  <a href="https://www.youtube.com/watch?v=_NzW5FakGyw">
    <img src="assets/bizbrain-architecture-demo.jpg" alt="Watch: Building a Persistent AI Memory System" width="700" />
  </a>
</p>

<p align="center">
  <a href="https://www.youtube.com/watch?v=_NzW5FakGyw"><img src="https://img.shields.io/badge/%E2%96%B6_Watch_on_YouTube-Architecture_Deep_Dive_(7:38)-ff0000?style=for-the-badge&logo=youtube&logoColor=white" alt="Watch on YouTube" /></a>
</p>

---

## Install in 4 Steps

### Step 1 — Open Claude Code

> **Prerequisite:** You need [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code/overview) installed. If you don't have it yet: `npm install -g @anthropic-ai/claude-code`

```bash
claude
```

### Step 2 — Install the plugin (inside Claude Code)

Type these **slash commands** at the Claude Code prompt (they start with `/`):

```
/plugin marketplace add TechIntegrationLabs/bizbrain-os-plugin
/plugin install bizbrain-os
```

> **Important:** These are slash commands inside Claude Code, not terminal commands. Type them at the `>` prompt after starting Claude Code.

### Step 3 — Restart Claude Code and run setup

Close and reopen Claude Code, then type:

```
/brain setup
```

This takes ~5 minutes. It asks your name, business, and role — then builds your brain.

### Step 4 — Launch your dashboard

```
/dashboard
```

Opens a visual command center in your browser. **You're done!**

Every Claude Code session now starts pre-loaded with your full business context.

---

## Keeping BizBrain Updated

BizBrain OS checks for updates automatically — once per day, on session start. If a new version is available, you'll see a notification like:

> **Update available:** BizBrain OS v3.6.0 (you have v3.5.1). Run `/plugin update bizbrain-os` to update.

To update manually at any time (inside Claude Code):

```
/plugin update bizbrain-os
```

Your brain data, settings, and configurations are never touched during updates — only the plugin code is refreshed. After updating, restart Claude Code to pick up new features.

---

## What Happens During Setup

```
/brain setup
   │
   ├─ 1. Basic Info ─────── Your name, business, role
   ├─ 2. Pick Profile ───── Developer / Agency / Consultant / Creator / Personal
   ├─ 3. Choose Mode ────── Full (3-zone) or Simple (1 folder)
   ├─ 4. Machine Scan ───── Auto-discovers repos, tools, services
   │     ├─ Found 45 repositories
   │     ├─ Found 5 services/tools
   │     └─ Found 25 Claude plugins
   ├─ 5. Intelligence ───── Paste URLs, drag-and-drop docs
   └─ 6. Brain Built ────── Context auto-injected from now on
```

---

## Features

### 23 Skills

| Category | Skills |
|:---------|:-------|
| **Core** | Brain bootstrap, entity management, project tracking, knowledge management |
| **Execution** | GSD workflow, todo management, time tracking, session archiving |
| **Operations** | Credential management, intake processing, MCP management, communications hub |
| **Content** | Content pipeline, outreach engine, meeting transcription |
| **Visual** | Visual companion, plugin release |
| **Advanced** | Brain orchestration, Google Workspace, browser automation, intelligence gathering |

### 16 Commands

```
/brain          Brain status, setup, scan, configure
/dashboard      Visual command center in your browser
/visual         Real-time diagrams, mockups, and dashboards
/entity         Client / partner / vendor lookup
/todo           Unified task dashboard
/knowledge      Search and load brain knowledge
/hours          Time tracking (today / week / month)
/gsd            Project execution: plan, execute, status
/intake         Process files dropped in _intake-dump
/mcp            MCP server management and profiles
/archive        Archive sessions to Obsidian vault
/comms          Communication hub
/content        Content pipeline
/outreach       Lead pipeline and sequences
/meetings       Local meeting transcription
/swarm          Brain Swarm orchestration
```

### 5 Background Agents

| Agent | Purpose |
|:------|:--------|
| **Brain Orchestrator** | Coordinates all agents via event queue, staging, validation, and changelog |
| **Entity Watchdog** | Monitors conversations for entity mentions, auto-updates records |
| **Brain Learner** | Captures decisions, action items, patterns, and session summaries |
| **Brain Gateway** | Full brain access from any repository or directory |
| **Visual Presenter** | Converts concepts into visual formats and pushes to the Visual Companion |

### Visual Companion

Type `/visual` and a real-time visualization browser app opens at `localhost:3851`:

- **Mermaid diagrams** — architecture, flowcharts, sequences, entity relationships
- **Side-by-side comparisons** — option A vs B with formatted content
- **Kanban boards** — task status visualization with columns
- **Timelines** — project roadmaps, milestones, phase progress
- **Dashboards** — KPI stats, progress metrics, utilization charts
- **Cards** — feature grids, contact cards, option lists
- **Mockups** — UI concepts rendered in sandboxed iframes
- **WebSocket streaming** — content pushes instantly from your conversation

Any skill or agent can push visual content. Keep the tab open alongside your terminal.

### Visual Dashboard

Type `/dashboard` and a browser-based command center opens with:

- **37-item setup checklist** across 8 categories with progress tracking
- **Integrations hub** — see all 37+ services at a glance
- **Intelligence gathering** — paste URLs, drag-and-drop documents
- **Quick launch** — open brain folder, conversations, repos with one click

### Meeting Transcription

Local recording and transcription that replaces cloud services like Otter.ai — for $0/month. Records any audio source (Zoom, Meet, Teams, Discord) via system audio capture. 100% private, nothing leaves your machine.

### Brain Swarm

Multi-agent orchestration layer (opt-in):

- **Event Queue** — Every tool use generates an event; orchestrator processes them in order
- **Staging Area** — Agents propose changes; validated before applying
- **Conflict Detection** — Two agents modifying the same file? Flagged for resolution
- **Changelog** — Full audit trail of every brain modification
- **Smart Routing** — Simple tasks to haiku, complex to sonnet — saves 40-60% on agent ops

---

## Integrations

37+ services with guided credential setup:

| Category | Services |
|:---------|:---------|
| **Development** | GitHub, Supabase, Stripe, Clerk, Netlify, Vercel |
| **Communication** | Slack, Discord, WhatsApp, Telegram, Gmail |
| **Social** | X/Twitter, LinkedIn, Facebook, Instagram, Bluesky, TikTok, YouTube, Reddit |
| **Productivity** | Notion, Google Workspace, Obsidian |
| **AI** | OpenAI, Anthropic, ElevenLabs, HeyGen |
| **Publishing** | Postiz, Late.dev, Buffer |

---

## Profiles

Pick your role during setup — features adapt automatically:

| Profile | Focus |
|:--------|:------|
| **Developer** | GSD workflow, repo tracking, Supabase, GitHub, credentials, time tracking |
| **Agency** | All features — clients, billing, content, outreach, comms, team tracking |
| **Consultant** | Client entities, proposals, time tracking, communications, billing |
| **Content Creator** | Content pipeline, social scheduling, outreach, audience management |
| **Personal** | Minimal: knowledge base, todos, intake. Easy to expand later |

Switch any time with `/brain profile`.

---

## Three-Zone Architecture

```
~/bizbrain-os/
├── launchpad/          Start all sessions here (~120 lines context)
├── workspaces/         Code repos live here (~80 lines, ultra-lean)
└── brain/              Full business intelligence (~300 lines)
    ├── Knowledge/
    ├── Entities/
    ├── Projects/
    ├── Operations/
    └── _intake-dump/
```

Zones control how much context loads by default. All commands work from any zone.

---

## Privacy & Security

```
  Your brain folder is LOCAL-ONLY — never uploaded
  No external API calls from the plugin
  No telemetry, no analytics, no phone-home
  Credentials cataloged locally, never auto-copied
  Values always masked in display
  Source-available — inspect the code you're running
```

---

## Requirements

| Requirement | Version | Notes |
|:------------|:--------|:------|
| Claude Code | Latest | With plugin support |
| Node.js | 18+ | For context generation |
| Bash | Any | Git Bash on Windows |
| Python | 3.10+ | *Optional* — meeting transcription only |

---

## License

**Proprietary** — Copyright (c) 2025-2026 Tech Integration Labs. All rights reserved.

You may install and use this plugin for personal or internal business purposes. Forking, redistribution, modification for distribution, and creation of competing products are strictly prohibited. See [LICENSE](LICENSE) for full terms.

For licensing inquiries: hello@bizbrain-os.com

---

<p align="center">
  <strong>Built by <a href="https://github.com/TechIntegrationLabs">Tech Integration Labs</a></strong>
  <br />
  <a href="https://bizbrainos.com">bizbrainos.com</a> · <a href="https://discord.gg/ph9D5gSgW3">Discord</a> · <a href="https://x.com/bizbrain_os">X / Twitter</a>
  <br /><br />
  <sub>Every session deposits context. Every future session withdraws it. The balance only grows.</sub>
</p>
