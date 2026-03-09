<p align="center">
  <img src="assets/brain-hero.png" alt="BizBrain OS — The persistent AI knowledge layer for Claude Code" width="600" />
</p>

<p align="center">
  <strong>The compound interest of AI context.</strong><br />
  Every session deposits knowledge. Every future session withdraws it. The balance only grows.
</p>

<p align="center">
  <a href="#quick-install"><img src="https://img.shields.io/badge/Install-5_minutes-22c55e?style=flat-square" alt="Install in 5 minutes"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-AGPL--3.0-blue?style=flat-square" alt="License"></a>
  <a href="#privacy--security"><img src="https://img.shields.io/badge/Privacy-100%25_Local-8b5cf6?style=flat-square" alt="100% Local"></a>
  <img src="https://img.shields.io/badge/Skills-17-f59e0b?style=flat-square" alt="17 Skills">
  <img src="https://img.shields.io/badge/Integrations-34+-ec4899?style=flat-square" alt="34+ Integrations">
  <img src="https://img.shields.io/badge/Cost-$0/month-10b981?style=flat-square" alt="$0/month">
</p>

<br />

> **A localized context engine** that teaches Claude your business once, and gets smarter every day.
> Open source under AGPL-3.0.

---

## The Problem

Every Claude Code session starts from zero. You re-explain your projects, your clients, your tech stack, your decisions — every single time.

```
┌─────────────────────────────────────────────────────┐
│  Session 1: "I'm building a Next.js app for..."     │
│  Session 2: "As I mentioned, I'm working on..."     │
│  Session 3: "Remember, my client Acme wants..."     │
│  Session 4: "So my tech stack is Next.js +..."      │
│  Session 5: "Let me explain the project again..."   │
│              ...                                     │
│  Session 15: "I already told you this."              │
└─────────────────────────────────────────────────────┘
   5-10 min × 5-15 sessions/day = up to 2.5 hours LOST
```

**BizBrain OS fixes this.** Install once, and Claude learns your business permanently.

## See It In Action

<p align="center">
  <a href="https://github.com/TechIntegrationLabs/bizbrain-os-plugin/releases/download/media-v1.0/Building_a_Persistent_AI_Memory_System__The_Architecture_of_Biz.mp4">
    <img src="assets/bizbrain-architecture-demo.jpg" alt="Watch: Building a Persistent AI Memory System — The Architecture of BizBrain OS" width="640" />
  </a>
  <br />
  <strong>Building a Persistent AI Memory System — The Architecture of BizBrain OS</strong><br />
  <em>Deep dive into the event layer, compound knowledge accumulation, and entity watchdog system.</em>
</p>

## The Solution

```
                    ╔══════════════════════════════╗
                    ║   COMPOUND CONTEXT ENGINE    ║
                    ╚══════════════╤═══════════════╝
                                   │
              ┌────────────────────┼────────────────────┐
              │                    │                     │
     ╔════════╧════════╗  ╔═══════╧═══════╗  ╔═════════╧════════╗
     ║  BRAIN FOLDER   ║  ║   AUTOMATIC   ║  ║   CONTINUOUS     ║
     ║                 ║  ║   INJECTION   ║  ║   LEARNING       ║
     ║ Local knowledge ║  ║               ║  ║                  ║
     ║ store: clients, ║  ║ SessionStart  ║  ║ Entity Watchdog  ║
     ║ projects, docs, ║  ║ hook injects  ║  ║ Time Tracking    ║
     ║ decisions, time ║  ║ full context  ║  ║ Decision Logging ║
     ║                 ║  ║ automatically ║  ║ Action Items     ║
     ╚═════════════════╝  ╚═══════════════╝  ╚══════════════════╝

     YOUR DATA              ZERO EFFORT           GETS SMARTER
     100% local             Every session          Every session
     Never uploaded         Pre-loaded             Writes back
```

<br />

## Quick Install

```bash
# Add the marketplace
claude plugin marketplace add TechIntegrationLabs/bizbrain-os-plugin

# Install the plugin
claude plugin install bizbrain-os
```

Then open a **new terminal** and run the setup wizard:

```bash
claude
> /brain setup
```

**5 minutes later:** Every Claude Code session starts with your full business context automatically injected. You never re-explain yourself again.

<br />

## What It Looks Like

When BizBrain OS boots, it injects your context before you type a word:

```
 user@bizbrain-os:~/launchpad$ claude

   ____  _     ____            _          ___  ____
  | __ )(_)___| __ ) _ __ __ _(_)_ __    / _ \/ ___|
  |  _ \| |_  /  _ \| '__/ _` | | '_ \  | | | \___ \
  | |_) | |/ /| |_) | | | (_| | | | | | | |_| |___) |
  |____/|_/___|____/|_|  \__,_|_|_| |_|  \___/|____/

  ✓ Brain loaded             ~/bizbrain-os/brain/
  ✓ Profile                  Developer (Will @ Tech Integration Labs)
  ✓ Projects                 45 tracked (12 active this month)
  ✓ Entities                 8 clients, 3 partners
  ✓ Open tasks               23 across 6 projects
  ✓ Entity Watchdog          Active
  ✓ Time Tracking            Session started

  Context injected: 120 lines | Mode: launchpad | Swarm: enabled

 >
```

Claude already knows your business. Start working.

<br />

## What Happens During Setup

```
/brain setup
   │
   ├─ 1. Basic Info ─────── Your name, business, role
   │
   ├─ 2. Pick Profile ───── Developer / Agency / Consultant / Creator / Personal
   │
   ├─ 3. Choose Mode ────── Full (3-zone) or Simple (1 folder)
   │
   ├─ 4. Machine Scan ───── Auto-discovers repos, tools, services, collaborators
   │     │
   │     ├─ Found 45 repositories        ✓
   │     ├─ Found 5 services/tools       ✓
   │     ├─ Found Obsidian vault         ✓
   │     └─ Found 25 Claude plugins      ✓
   │
   ├─ 5. You Choose ─────── Include all, or pick what to track
   │
   └─ 6. Intelligence ───── "You're a full-stack developer working
      Report                  primarily in TypeScript and Next.js,
                              maintaining 45 active repositories..."

      The brain already understands you. ✓
```

<br />

## Three-Zone Architecture

Different work needs different context. BizBrain OS optimizes token budgets with physical directory separation:

```
~/bizbrain-os/
│
├── launchpad/              ★ START ALL SESSIONS HERE
│   └── CLAUDE.md           ~120 lines of context
│                            Entity watchdog active
│                            Auto-capture enabled
│                            All commands available
│
├── workspaces/             Code repos live here
│   ├── my-saas-app/        ~80 lines of context
│   ├── client-portal/      Ultra-lean, ultra-fast
│   └── api-service/        Brain commands still work
│
└── brain/                  Full business intelligence
    ├── Knowledge/          ~300 lines of context
    │   ├── systems/        Deep operations only
    │   ├── decisions/      Entity management
    │   └── reports/        Intake processing
    ├── Entities/
    │   ├── Clients/
    │   ├── Partners/
    │   └── Vendors/
    ├── Projects/
    ├── Operations/
    │   ├── credentials/
    │   ├── todos/
    │   ├── timesheets/
    │   └── learning/
    └── _intake-dump/
        ├── files/
        └── conversations/
```

| Zone | Context | When to Use |
|:-----|:--------|:------------|
| **launchpad/** | ~120 lines | Daily driver — any session, any topic |
| **workspaces/** | ~80 lines | Active code development |
| **brain/** | ~300 lines | Deep business operations |

**The zones are porous.** `/knowledge`, `/entity`, `/todo`, and `/hours` work from any zone. You always have brain access — the architecture just controls how much context loads by default.

<br />

## Features

### Core Intelligence

| | Feature | What It Does |
|:--|:--------|:-------------|
| **Brain** | **Entity Management** | Track clients, partners, vendors with auto-detection. The Entity Watchdog monitors every conversation and updates records automatically. |
| **Brain** | **Project Tracking** | Auto-discovers repos, tracks status, stack, client links, and activity across all projects. |
| **Brain** | **Knowledge Base** | Persistent store for systems docs, architectural decisions, templates, references, and reports. |
| **Brain** | **Intake Processing** | Drop voice notes, PDFs, contracts, transcripts into `_intake-dump/`. Run `/intake` — brain classifies, extracts entities, routes to the right place. |

### Execution & Productivity

| | Feature | What It Does |
|:--|:--------|:-------------|
| **Execute** | **GSD Workflow** | Structured project execution: Milestones → Phases → Waves → Tasks. Waves run in parallel via subagents. |
| **Execute** | **Todo Management** | Unified task dashboard across all projects and entities. Context-routed — mention a client and the task goes to their record. |
| **Execute** | **Time Tracking** | Heartbeat-based — every tool call is a timestamp. Survives crashes, requires no timers, auto-detects breaks. |
| **Execute** | **Session Archiving** | Every session archived to Obsidian with frontmatter tags, full prompts, tool stats, and auto-generated summaries. |

### Operations & Integrations

| | Feature | What It Does |
|:--|:--------|:-------------|
| **Ops** | **Credential Management** | Secure local cataloging of API keys and tokens. Never auto-copied, always masked in display. |
| **Ops** | **MCP Management** | Profile-based MCP switching. Run one-off MCP tasks via subprocess without restarting Claude Code. |
| **Ops** | **Communications Hub** | Unified tracking across email, Slack, Discord. Entity-linked drafting with communication history. |
| **Ops** | **Content Pipeline** | Ideation → drafting → scheduling → publishing. Tracks your content calendar across platforms. |
| **Ops** | **Outreach Engine** | Lead pipeline with stages (Prospect → Contacted → Meeting → Won). Sequence-based follow-ups. |

### Advanced

| | Feature | What It Does |
|:--|:--------|:-------------|
| **New** | **Meeting Transcription** | Local recording + transcription via faster-whisper. Replaces Otter.ai for $0/month. 100% private. |
| **New** | **Brain Swarm** | Orchestration layer: event queue, staging validation, conflict detection, changelog audit trail, smart model routing. |

<br />

## Commands

```
/brain                  Brain status, setup, scan, configure, profile
/brain setup            First-time setup wizard
/brain scan             Re-scan machine for new projects

/entity <name>          Look up client, partner, vendor, or contact
/todo                   Unified task dashboard across all sources
/knowledge <topic>      Search and load brain knowledge
/hours                  Time tracking summary (today/week/month)

/gsd                    Project execution: plan, execute, status
/intake                 Process files dropped in _intake-dump
/mcp                    MCP server management and profiles
/archive-sessions       Archive sessions to Obsidian vault

/comms                  Communication hub and follow-ups
/content                Content pipeline management
/outreach               Lead pipeline and sequences

/meetings               Local meeting transcription
/swarm                  Brain Swarm orchestration
```

<br />

## Profiles

Pick your role during setup — features and scanning adapt automatically:

```
┌────────────────────┬──────────────────────────────────────────────────────┐
│     DEVELOPER      │  GSD workflow, repo tracking, Supabase, GitHub,     │
│  ★ Most Popular    │  entity management, credentials, time tracking      │
├────────────────────┼──────────────────────────────────────────────────────┤
│   AGENCY OWNER     │  ALL features active — clients, billing, content,   │
│                    │  outreach, comms, team tracking                     │
├────────────────────┼──────────────────────────────────────────────────────┤
│    CONSULTANT      │  Client entities, proposals, time tracking,         │
│                    │  communications, billing                            │
├────────────────────┼──────────────────────────────────────────────────────┤
│  CONTENT CREATOR   │  Content pipeline, social scheduling, outreach,     │
│                    │  audience management                                │
├────────────────────┼──────────────────────────────────────────────────────┤
│     PERSONAL       │  Minimal: knowledge base, todos, intake processing  │
│                    │  Quick setup, easy to expand later                  │
└────────────────────┴──────────────────────────────────────────────────────┘
```

Switch any time with `/brain profile`. Every feature can be toggled independently.

<br />

## Background Agents

Four agents work automatically while you focus on your work:

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  BRAIN ORCHESTRATOR (v3.0.2)            ┌─ Entity Watchdog           │
│  Coordinates all agents via event       │  Monitors conversations    │
│  queue, staging, validation,    ───────►│  for entity mentions,      │
│  changelog, conflict detection          │  auto-updates records      │
│                                         │                            │
│                                         ├─ Brain Learner             │
│                                         │  Captures decisions,       │
│                                         │  action items, patterns,   │
│                                         │  session summaries         │
│                                         │                            │
│                                         └─ Brain Gateway             │
│                                            Full brain access from    │
│                                            any repo or directory     │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

The Orchestrator uses **smart model routing** — simple tasks go to haiku (fast/cheap), complex tasks to sonnet — saving 40-60% on agent operations.

<br />

## Integrations

BizBrain OS includes a registry of **34+ service integrations** with guided credential setup and automatic MCP configuration:

| Category | Services |
|:---------|:---------|
| **Development** | GitHub, Supabase, Stripe, Clerk, Netlify, Vercel |
| **Communication** | Slack, Discord, WhatsApp, Telegram, Gmail |
| **Social** | X/Twitter, LinkedIn, Facebook, Instagram, Bluesky, TikTok, YouTube, Reddit, Threads |
| **Productivity** | Notion, Google Drive, Google Calendar, Obsidian |
| **AI** | OpenAI, Anthropic, ElevenLabs, HeyGen, Veo 3 |
| **Publishing** | Postiz, Late.dev, Buffer |
| **Research** | Firecrawl, Screenpipe |
| **CRM** | GoHighLevel |

<br />

## Real-World Use Cases

<table>
<tr>
<td width="50%">

**$1,800 API Bill Dispute**

Unexpected Google Cloud charge. One prompt: *"Look into this."* Brain analyzed usage logs, identified unfamiliar IP, compiled dispute package, drafted the email.

**Hours → minutes.**

</td>
<td width="50%">

**Voice Notes → Engineering Specs**

Client recorded 3 voice memos. Dropped into intake. One `/intake` command extracted FMCSA compliance requirements, scheduling specs, 17 action items, 8 project risks.

**Rambling → structured specs.**

</td>
</tr>
<tr>
<td width="50%">

**Bug → Fixed → Deployed**

Bug Crusher watches Slack for "bug" / "broken" / "error". Client reports issue → clones repo → identifies root cause → fixes → deploys → verifies → posts back.

**Zero human intervention.**

</td>
<td width="50%">

**Meeting → Architecture Update**

57-min transcript dropped into intake. Brain detected 3 entities, extracted 11 architectural gaps, captured 6-step workflow, created 6 spec documents, updated dashboard.

**One transcript, full update.**

</td>
</tr>
<tr>
<td width="50%">

**Automated Social Media**

Content Autopilot runs daily: scans 84+ RSS feeds, scores against brand topics, generates platform-specific posts, creates images, publishes.

**Your presence runs while you sleep.**

</td>
<td width="50%">

**Multi-Instance Management**

One product deployed to 3 clients with isolated databases and branding. One sync command shows what's different across all instances.

**Build once, deploy many.**

</td>
</tr>
</table>

<br />

## The Compound Effect

```
 Context
 Value
   ▲
   │                                          ╱  Month 6: Claude is an
   │                                        ╱    extension of your business
   │                                      ╱      memory. Nothing falls
   │                                   ╱         through the cracks.
   │                                ╱
   │                            ╱
   │                         ╱     Month 3: Claude knows your entire
   │                      ╱        business — relationships, decisions,
   │                   ╱           workflows, preferences.
   │                ╱
   │             ╱       Month 1: Claude knows your clients,
   │          ╱          preferences, architectural patterns.
   │       ╱
   │    ╱    Week 1: Claude knows your projects
   │  ╱      and basic context.
   │╱
   └──────────────────────────────────────────────► Time
    Setup                                    Compound Growth
   (5 min)
```

**Every session deposits context. Every future session withdraws it. The balance only grows.**

<br />

## Brain Swarm (v3.0.2)

The orchestration layer that coordinates all brain agents into a single system:

```
User Session → PostToolUse → Event Queue → Orchestrator → Agents → Staging → Validation → Brain → Changelog
```

| Capability | What It Does |
|:-----------|:-------------|
| **Event Queue** | Every tool use generates an event; orchestrator processes them in order |
| **Staging Area** | Agents write proposals instead of modifying brain directly; validated before applying |
| **Conflict Detection** | Two agents modifying the same file? Flagged for resolution |
| **Changelog** | Every brain change logged with what/why/source for full traceability |
| **Workflow Patterns** | Learns successful multi-agent sequences and replays them automatically |
| **Smart Routing** | Routes simple tasks to haiku, complex to sonnet — saves 40-60% on agent ops |

```bash
/swarm              # Status: queue depth, pending, conflicts
/swarm process      # Manually process event queue
/swarm conflicts    # View and resolve staging conflicts
/swarm changelog    # View audit trail
/swarm patterns     # View learned workflow patterns
```

Brain Swarm is **opt-in** (disabled by default). Enable with `"orchestration": true` in your brain's `config.json`.

<br />

## Meeting Transcription

Replaces Otter.ai, Fireflies.ai, and similar services — for **$0/month**.

| | BizBrain OS | Otter.ai | Fireflies.ai |
|:--|:-----------|:---------|:-------------|
| **Cost** | $0/month | $16.99/month | $18/month |
| **Privacy** | 100% local | Cloud-processed | Cloud-processed |
| **Brain Integration** | Auto-linked entities + action items | Manual export | Manual export |
| **Platforms** | Any audio source (Zoom, Meet, Teams, etc.) | Limited | Limited |

```bash
/meetings start     # Start listening for meetings
/meetings status    # Check daemon status
/meetings list      # View recent transcripts
/meetings stop      # Stop the daemon
```

Requires: Python 3.10+, Windows (WASAPI loopback). Optional — only install if needed.

<br />

## Privacy & Security

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  ✓  Brain folder is LOCAL-ONLY — never uploaded          │
│  ✓  No external API calls from the plugin                │
│  ✓  No telemetry, no analytics, no phone-home            │
│  ✓  Credentials cataloged, never auto-copied             │
│  ✓  Values always masked in display (ghp_...abc)         │
│  ✓  Brain folder gitignored by default                   │
│  ✓  Open source — read every line of code                │
│                                                          │
│  Your business intelligence is yours alone.              │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

<br />

## Architecture

```
bizbrain-os-plugin/
│
├── hooks/
│   ├── hooks.json              # SessionStart + PostToolUse + SessionEnd
│   ├── run-hook.cmd            # Cross-platform polyglot (Windows + Unix)
│   └── scripts/
│       ├── session-start       # Brain detection + context generation
│       ├── post-tool-use       # Continuous learning + time tracking
│       └── session-end         # Session metadata + archive trigger
│
├── commands/                   # 14 slash commands
│   ├── brain.md                # /brain — status, setup, scan, configure
│   ├── entity.md               # /entity — client/partner/vendor lookup
│   ├── todo.md                 # /todo — unified task management
│   ├── gsd.md                  # /gsd — project execution
│   ├── knowledge.md            # /knowledge — brain search
│   ├── hours.md                # /hours — time tracking
│   ├── intake.md               # /intake — file processing
│   ├── mcp.md                  # /mcp — MCP management
│   ├── meetings.md             # /meetings — local transcription
│   ├── swarm.md                # /swarm — orchestration
│   └── ...                     # comms, content, outreach, archive
│
├── skills/                     # 17 deep capabilities
│   ├── brain-bootstrap/        # First-time setup wizard
│   ├── brain-orchestration/    # Swarm coordination
│   ├── entity-management/      # Entity CRUD + watchdog rules
│   ├── project-tracking/       # Repo discovery + status
│   ├── gsd-workflow/           # Phase/wave/task execution
│   ├── time-tracking/          # Heartbeat-based logging
│   ├── todo-management/        # Cross-source aggregation
│   ├── knowledge-management/   # Systems, decisions, templates
│   ├── credential-management/  # Secure local vault
│   ├── intake-processing/      # File classification + routing
│   ├── session-archiving/      # Obsidian export
│   ├── meeting-transcription/  # Local audio → text
│   └── ...                     # mcp, comms, content, outreach, learning
│
├── agents/                     # 4 background agents
│   ├── brain-orchestrator.md   # Event queue + staging + changelog
│   ├── entity-watchdog.md      # Auto-detect entity mentions
│   ├── brain-learner.md        # Capture decisions + patterns
│   └── brain-gateway.md        # Cross-repo brain access
│
├── profiles/                   # 5 role-based profiles
├── scripts/
│   ├── scanner.sh              # Machine discovery
│   └── generate-context.js     # SessionStart context builder
│
├── tools/
│   └── meeting-transcriber/    # Python: local audio transcription
│
└── lib/
    ├── default-config.json     # Brain config template
    ├── folder-structure.json   # Brain folder definitions
    ├── integrations-registry.json  # 34+ service definitions
    └── zone-templates/         # CLAUDE.md templates per zone
```

<br />

## Requirements

| Requirement | Version | Notes |
|:------------|:--------|:------|
| Claude Code | Latest | With plugin support |
| Node.js | 18+ | For context generation |
| Bash | Any | Git Bash on Windows, native on macOS/Linux |
| Python | 3.10+ | *Optional* — only for meeting transcription |

<br />

## Contributing

BizBrain OS is open source. Contributions welcome.

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/amazing-thing`)
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

<br />

## License

[AGPL-3.0](LICENSE) — Free to use, modify, and distribute. Derivative works must also be open source.

<br />

<details>
<summary><strong>The Brain</strong></summary>

```

                          [>---]    [---<]
                     __/    {  }       \__
                   _/  >   <]  _/  _/  _/  \(__)
                 _/  >   <]  _/  _/  _/  \    __
               }      {/  *{   }-   +\
              /    )     |*       |         \
             [   •    |  .  \  ]___   /      \   ]
            [*/    \    *   >/   *        \
             [    ]+_        {           +        ]
              \      +>-*     /    \  *-(    \___    ]
                   }\_     *------_+/     *
               [      }*-         ___/-###........
                           [   \||.{..}......
                          ___|{  >+  .....
                            |\    >....
                              \    |}----|
                                \..}

```

</details>

<br />

<p align="center">
  <img src="assets/brain-hero.png" alt="BizBrain OS" width="400" />
  <br />
  <br />
  <strong>Built by <a href="https://github.com/TechIntegrationLabs">Tech Integration Labs</a></strong>
  <br />
  <a href="https://bizbrainos.com">bizbrainos.com</a>
  <br />
  <br />
  <sub>Every session deposits context. Every future session withdraws it. The balance only grows.</sub>
</p>
