# BizBrain OS — Claude Code Plugin

> The context layer that teaches AI your business.

**The compound interest of AI context.** Every session deposits context. Every future session withdraws it.

## What is BizBrain OS?

BizBrain OS is a Claude Code plugin that builds a persistent knowledge brain from your actual work. Install it once, and Claude Code learns your projects, clients, tools, and preferences — compounding knowledge across every session.

No more re-explaining your tech stack. No more listing your clients again. No more "as I mentioned last time." Your brain remembers everything and injects the right context at the right time.

## Quick Install

```bash
# Add the marketplace
claude plugin marketplace add TechIntegrationLabs/bizbrain-os-plugin

# Install the plugin
claude plugin install bizbrain-os@bizbrain-os

# Run first-time setup
/brain setup
```

Or install from the official Claude Code plugin directory:

```bash
claude plugin install bizbrain-os@claude-plugin-directory
```

## Features

| Feature | Description |
|---------|-------------|
| **Brain Bootstrap** | Scans your machine, discovers projects/services/tools, and creates a structured knowledge brain |
| **Session Context Injection** | SessionStart hook automatically injects your brain context into every Claude Code session |
| **Entity Management** | Track clients, partners, vendors, and contacts with auto-detection and watchdog monitoring |
| **Project Tracking** | Auto-discovers repos, tracks status, stack, and activity across all your projects |
| **GSD Workflow** | Structured Get Shit Done project execution with phases, waves, and task management |
| **Knowledge Management** | Persistent knowledge base for systems, decisions, templates, and references |
| **Time Tracking** | Automatic session time logging with timesheet generation |
| **Todo Management** | Aggregated task tracking across all projects and entities |
| **Credential Management** | Secure cataloging and retrieval of API keys and service tokens |
| **MCP Management** | Detect, configure, and manage MCP servers with profile-based switching |
| **Intake Processing** | Drop zone for files, voice notes, and documents to be processed into the brain |
| **Communications Hub** | Unified communication tracking across email, Slack, Discord, and more |
| **Content Pipeline** | Content creation, scheduling, and publishing workflow |
| **Session Archiving** | Archive Claude Code sessions for searchability and reference |

## How It Works

### 1. Brain Folder

BizBrain OS creates a `~/bizbrain-os/` folder that serves as your persistent knowledge brain:

```
~/bizbrain-os/
  Knowledge/          # Systems, decisions, templates, references
  Projects/           # Auto-discovered project workspaces
  Entities/           # Clients, partners, vendors, people
  Operations/         # Credentials, todos, timesheets, learning
  _intake-dump/       # Drop zone for files to process
  .bizbrain/          # Plugin state
  config.json         # Brain configuration
```

### 2. SessionStart Hook

Every time you open Claude Code, the SessionStart hook runs automatically:
1. Detects your brain folder
2. Reads config, projects, entities, action items
3. Generates a context payload
4. Injects it into Claude's system prompt

Claude immediately knows your business, your projects, your open tasks, and your preferences.

### 3. Continuous Learning

The PostToolUse hook monitors your work and feeds observations back to the brain:
- New projects discovered
- Time tracked per session
- Entity mentions detected
- Action items extracted

Every session makes the next session smarter.

## Commands

| Command | Description |
|---------|-------------|
| `/brain` | Brain status, scan, configure, and profile management |
| `/brain setup` | First-time setup: scan machine, pick profile, create brain |
| `/brain scan` | Re-scan machine for new projects and services |
| `/brain configure` | Edit brain settings and feature toggles |
| `/brain profile` | Switch profile or customize feature set |
| `/knowledge <topic>` | Load specific knowledge from the brain |
| `/todo` | View and manage tasks across all sources |
| `/entity <name>` | Look up or add a client, partner, vendor, or contact |
| `/hours` | Time tracking summary |
| `/gsd` | Structured project execution workflow |
| `/intake` | Process files dropped into the intake folder |
| `/mcp` | MCP server management: status, enable, disable, profiles |

## Profiles

BizBrain OS ships with 5 profiles that tailor features and scanning to your role:

| Profile | Best For | Key Features |
|---------|----------|-------------|
| **Developer** | Software developers, indie hackers, technical founders | Full project tracking, GSD workflow, credential management |
| **Content Creator** | Bloggers, YouTubers, social creators | Content pipeline, outreach engine, social profiles |
| **Consultant** | Freelancers, service providers | Client entities, time tracking, communications |
| **Agency** | Agency owners managing multiple clients | All features active, full scanning |
| **Personal** | Anyone organizing work with AI | Minimal setup, todos, knowledge, intake |

Switch profiles any time with `/brain profile`.

## Integrations

BizBrain OS includes a registry of 34+ service integrations with guided credential setup and automatic MCP configuration:

**Development:** GitHub, Supabase, Stripe, Clerk, Netlify, Vercel

**Communication:** Slack, Discord, WhatsApp, Telegram, Gmail

**Social:** X/Twitter, LinkedIn, Facebook, Instagram, Bluesky, TikTok, YouTube, Reddit, Threads

**Productivity:** Notion, Google Drive, Google Calendar, Obsidian

**AI:** OpenAI, Anthropic, ElevenLabs, HeyGen, Veo 3

**Publishing:** Postiz, Late.dev, Buffer

**Research:** Firecrawl, Screenpipe

**CRM:** GoHighLevel

## Agents

BizBrain OS includes two background agents:

- **Entity Watchdog** — Automatically detects entity mentions in conversations and maintains brain records
- **Brain Gateway** — Provides full brain access from any repository or project

## Architecture

```
bizbrain-os-plugin/
  .claude-plugin/
    plugin.json           # Plugin manifest
    marketplace.json      # Marketplace distribution config
  hooks/
    hooks.json            # Hook definitions (SessionStart, PostToolUse)
    run-hook.cmd          # Cross-platform polyglot wrapper (Windows + Unix)
    scripts/
      session-start       # Brain detection + context generation
      post-tool-use       # Continuous learning + time tracking
  commands/               # Slash commands (/brain, /mcp, /todo, etc.)
  skills/                 # Deep capabilities (brain-bootstrap, credential-management, etc.)
  agents/                 # Background agents (entity-watchdog, brain-gateway)
  profiles/               # Role-based feature profiles (5 built-in)
  scripts/
    scanner.sh            # Machine scanner for project/service discovery
    generate-context.js   # Context generator for SessionStart injection
  lib/
    default-config.json   # Brain config template
    folder-structure.json # Brain folder structure definitions
    integrations-registry.json  # 34+ service integration definitions
```

## Requirements

- Claude Code (latest version with plugin support)
- Node.js 18+ (for context generation)
- Bash (Git Bash on Windows, native on macOS/Linux)

## Privacy & Security

- Your brain folder is local-only and never uploaded anywhere
- Credentials are cataloged but never copied without explicit permission
- Credential values are never displayed in full (always masked)
- The brain folder should be added to `.gitignore` if placed inside a repo
- No external API calls are made by the plugin itself

## License

AGPL-3.0 — See [LICENSE](LICENSE) for details.

## Author

**Tech Integration Labs**
- GitHub: [TechIntegrationLabs](https://github.com/TechIntegrationLabs)
- Web: [bizbrain.os](https://bizbrain.os)
