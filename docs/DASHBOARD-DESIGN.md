# BizBrain OS Plugin Dashboard — Design Document

> Date: 2026-03-10
> Status: Implementation Ready

---

## Overview

A local web dashboard bundled with the BizBrain OS Claude Code plugin that provides:
1. **Setup Checklist** — Guided "level up" system with categories, priorities, and automated setup
2. **Integration Hub** — Visual status of all connected services
3. **Quick Launch** — One-click buttons to open brain, conversations, Claude Code
4. **Brain Status** — Health, stats, and progress overview

## Architecture

### How It Ships With the Plugin

```
bizbrain-os-plugin/
  tools/
    dashboard/
      server.js           # Express server (serves static + API endpoints)
      package.json         # Dependencies (express only)
      public/
        index.html         # SPA shell
        css/
          style.css        # All styles
        js/
          app.js           # Main application
          router.js        # Hash-based routing
          data.js          # Checklist items, categories
          components.js    # UI component renderers
        images/            # Generated preview icons (one per checklist item)

  commands/
    dashboard.md           # /dashboard command

  skills/
    dashboard-setup/       # Skill for running automated setups
      SKILL.md
```

### How Users Launch It

1. User types `/dashboard` in Claude Code
2. Skill checks if `tools/dashboard/node_modules` exists, runs `npm install` if not
3. Starts Express server on port 3850
4. Opens `http://localhost:3850` in default browser
5. Dashboard reads brain state from filesystem via API

### API Endpoints (Express Server)

```
GET  /api/brain-status     → Brain folder path, exists, zone mode, stats
GET  /api/checklist        → All checklist items with completion status
POST /api/checklist/:id    → Mark item as started/completed
GET  /api/integrations     → Connected services status
GET  /api/quick-actions    → Available quick-launch paths
POST /api/launch-claude    → Open terminal + start Claude Code in right folder
```

### State Storage

```
<BRAIN>/.bizbrain/dashboard/
  progress.json           # { "items": { "obsidian-vault": "completed", ... } }
  preferences.json        # { "theme": "dark", "compactView": false }
```

---

## Setup Checklist — Full Item List

### Category 1: FOUNDATIONS (Priority: Critical)
*"Get your brain running. Everything else builds on this."*

| # | ID | Title | Short Description |
|---|-----|-------|-------------------|
| 1 | `brain-bootstrap` | Brain Bootstrap | Scan your machine and create your business brain |
| 2 | `profile-selection` | Choose Your Profile | Select your business type for optimized defaults |
| 3 | `claude-config` | Optimize Claude Code | Configure optimal settings, hooks, and permissions |
| 4 | `folder-structure` | Open Your Brain | Learn the brain folder structure and where things live |

### Category 2: MEMORY & PERSISTENCE (Priority: Critical)
*"Guarantee nothing is ever lost. Your brain's insurance policy."*

| # | ID | Title | Short Description |
|---|-----|-------|-------------------|
| 5 | `obsidian-vault` | Obsidian Vault | Permanent searchable memory — download Obsidian + MCP + auto-archive |
| 6 | `github-backup` | Git Brain Backup | Version control your brain with automatic commits |
| 7 | `auto-memory` | Auto-Memory Files | Cross-session learning that persists between conversations |
| 8 | `session-archiving` | Session Archiving | Archive every Claude conversation for future reference |

### Category 3: COMMUNICATION (Priority: High)
*"Connect your messaging and email so AI can communicate for you."*

| # | ID | Title | Short Description |
|---|-----|-------|-------------------|
| 9 | `slack-integration` | Slack | Team messaging, channel monitoring, automated responses |
| 10 | `gmail-integration` | Gmail | Read, draft, and send emails with AI assistance |
| 11 | `discord-integration` | Discord | Community chat, server management, bot automation |
| 12 | `calendar-integration` | Google Calendar | Schedule awareness, meeting prep, calendar management |
| 13 | `whatsapp-bridge` | WhatsApp | WhatsApp messaging via autonomous bridge (requires OpenClaw) |

### Category 4: PRODUCTIVITY (Priority: High)
*"Connect the tools you use every day."*

| # | ID | Title | Short Description |
|---|-----|-------|-------------------|
| 14 | `notion-integration` | Notion | Pages, databases, wikis — bidirectional sync |
| 15 | `google-workspace` | Google Workspace | Docs, Sheets, Drive — full workspace access |
| 16 | `airtable-integration` | Airtable | Spreadsheet databases for structured data |
| 17 | `todoist-integration` | Task Manager | Connect Todoist, Linear, or Asana for task sync |

### Category 5: DEVELOPMENT (Priority: Medium)
*"Supercharge your development workflow."*

| # | ID | Title | Short Description |
|---|-----|-------|-------------------|
| 18 | `github-mcp` | GitHub | Repos, PRs, issues, code search, branch management |
| 19 | `supabase-integration` | Supabase | PostgreSQL database, auth, storage, edge functions |
| 20 | `deployment-integration` | Vercel & Netlify | Deploy and manage your web applications |
| 21 | `playwright-integration` | Browser Automation | Automate web interactions and testing |

### Category 6: BUSINESS OPERATIONS (Priority: Medium)
*"Run your business with AI-powered operations."*

| # | ID | Title | Short Description |
|---|-----|-------|-------------------|
| 22 | `stripe-integration` | Stripe | Payment processing, subscriptions, invoicing |
| 23 | `crm-integration` | CRM (GoHighLevel) | Contact management, pipelines, conversations |
| 24 | `docuseal-integration` | E-Signatures | Digital contracts and document signing |
| 25 | `bookkeeping-integration` | Bookkeeping | Invoice tracking, expense categorization, financial reports |

### Category 7: CONTENT & MEDIA (Priority: Low)
*"Create, publish, and distribute content with AI."*

| # | ID | Title | Short Description |
|---|-----|-------|-------------------|
| 26 | `youtube-integration` | YouTube | Upload videos, manage channel, track analytics |
| 27 | `social-media` | Social Media | LinkedIn & Instagram posting and engagement |
| 28 | `design-tools` | Canva & Figma | Access designs, create graphics, collaborate |
| 29 | `image-generation` | AI Image Generation | Create images with OpenAI, Gemini, and Replicate |
| 30 | `presentations` | Gamma & Slides | AI-powered presentation creation |
| 31 | `notebooklm` | NotebookLM | Grounded research and cinematic video creation |

### Category 8: ADVANCED INTELLIGENCE (Priority: Low)
*"Unlock the full power of your AI brain."*

| # | ID | Title | Short Description |
|---|-----|-------|-------------------|
| 32 | `brain-swarm` | Brain Swarm | Multi-agent orchestration with staging and validation |
| 33 | `meeting-transcription` | Meeting Transcriber | Free local meeting transcription (replaces Otter.ai) |
| 34 | `openclaw-setup` | OpenClaw | Autonomous AI assistant across all messaging platforms |
| 35 | `custom-mcp` | Custom MCPs | Build your own integrations for any service |
| 36 | `n8n-workflows` | n8n Workflows | Visual automation builder for complex workflows |
| 37 | `browser-suite` | Browser Suite | Full web automation with Chrome, Playwright, Puppeteer |

---

## Checklist Item Detail Schema

```json
{
  "id": "obsidian-vault",
  "title": "Obsidian Vault",
  "category": "memory",
  "priority": "critical",
  "difficulty": "easy",
  "timeEstimate": "10 min",
  "shortDescription": "Permanent searchable memory — download Obsidian + MCP + auto-archive",
  "longDescription": "Obsidian is a free, local-first knowledge base that becomes your brain's permanent memory. Every Claude Code session gets automatically archived as a searchable Obsidian note. Combined with the Obsidian MCP, your AI can read and search your entire vault — giving it access to every conversation, decision, and insight you've ever had. This is the single most important persistence layer because it guarantees that no context is ever truly lost, even if your brain folder is reset or moved.",
  "benefits": [
    "Every conversation permanently searchable",
    "AI can reference past sessions and decisions",
    "Works offline — your data, your machine",
    "Free and open source (no subscription)",
    "Markdown files — portable, no vendor lock-in"
  ],
  "useCases": [
    "Find what you discussed about a client 3 months ago",
    "Reference a technical decision and its reasoning",
    "Search across hundreds of sessions instantly",
    "Build a personal knowledge base that compounds"
  ],
  "prerequisites": ["brain-bootstrap"],
  "setupSteps": [
    "Download and install Obsidian (free)",
    "Create a vault at ~/Documents/Obsidian/BB1-Archive/",
    "Install and configure the Obsidian MCP",
    "Configure session archiving hooks",
    "Run first archive to populate the vault"
  ],
  "automationLevel": "mostly-automated",
  "image": "images/obsidian-vault.png",
  "setupCommand": "Setup Obsidian vault, install Obsidian MCP, and configure session archiving",
  "relatedItems": ["session-archiving", "auto-memory", "github-backup"]
}
```

---

## GUI Design

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  🧠 BizBrain OS                          [Settings] [Help] │
├──────────┬──────────────────────────────────────────────────┤
│          │                                                  │
│  Home    │   [Main Content Area]                           │
│  Setup   │                                                  │
│  Connect │   Renders based on current route:               │
│  Launch  │   - Home: Status + Progress                     │
│  Settings│   - Setup: Checklist grid                       │
│          │   - Connect: Integration cards                  │
│          │   - Launch: Quick action buttons                │
│          │   - Item Detail: Full item page                 │
│          │                                                  │
├──────────┴──────────────────────────────────────────────────┤
│  Brain: ~/bizbrain-os  |  12/37 complete  |  v3.2.0       │
└─────────────────────────────────────────────────────────────┘
```

### Home Page

- **Brain Health Card** — Status indicator, brain path, last session
- **Progress Ring** — Overall completion percentage
- **Category Progress Bars** — Per-category completion
- **Recent Activity** — Last 5 completed items
- **Next Recommended** — AI-suggested next setup task
- **Quick Stats** — Entities, projects, sessions archived, integrations connected

### Setup Checklist Page

- **Category tabs** across top (All, Foundations, Memory, Communication, etc.)
- **Filter bar** — Priority, difficulty, status
- **Grid of cards** — Each card shows:
  - Preview image (app icon style)
  - Title
  - Short description
  - Priority badge (Critical / High / Medium / Low)
  - Status indicator (dot: gray/amber/green)
  - Click → opens detail page

### Item Detail Page

- **Hero section** — Large preview image + title + category badge
- **Description** — Full long description
- **Benefits list** — Bullet points with check icons
- **Use Cases** — Real-world examples
- **Prerequisites** — Links to required items (with status)
- **Setup button** — "Set Up in Claude Code" (copies setup command)
- **Time estimate** + difficulty indicator
- **Related items** — Links to complementary integrations

### Integrations Page

- **Grid of service cards** — Logo + name + status
- **Connected** (green) / **Available** (gray) / **In Progress** (amber)
- **Click** → opens integration detail with setup instructions

### Quick Launch Page

Four large buttons:
1. **Open Brain** — Opens brain root folder in file explorer
2. **Open Conversations** — Opens launchpad/conversations folder
3. **Open Repos** — Opens ~/Repos/ folder
4. **Start Claude Code** — Opens terminal in conversations folder with `claude --dangerously-skip-permissions` (or configured command)

### Design Tokens

```css
--bg-primary: #0a0a0f;
--bg-secondary: #12121a;
--bg-card: #1a1a24;
--bg-card-hover: #22222e;
--border: rgba(255, 255, 255, 0.08);
--border-hover: rgba(255, 255, 255, 0.15);
--text-primary: #f0f0f0;
--text-secondary: #888;
--text-muted: #555;
--accent-blue: #2563eb;
--accent-amber: #f59e0b;
--accent-emerald: #10b981;
--accent-red: #ef4444;
--priority-critical: #ef4444;
--priority-high: #f59e0b;
--priority-medium: #2563eb;
--priority-low: #888;
--status-complete: #10b981;
--status-progress: #f59e0b;
--status-pending: #555;
--radius: 12px;
--radius-sm: 8px;
```

---

## OpenClaw Integration Plan

### One-Click Setup Wizard

1. **System check** — Docker installed? Node.js? Git?
2. **Choose deployment** — Local machine vs VPS (with Hetzner/DO one-click)
3. **Connect messaging** — WhatsApp, Telegram, Discord (guided OAuth/QR flows)
4. **Connect AI** — Claude API key (from brain credentials), GPT (optional)
5. **Connect to BizBrain** — Point OpenClaw's memory at the brain folder
6. **Auto-start configuration** — Windows Service / systemd / Docker restart policy
7. **Test & verify** — Send test message, confirm round-trip

### Claude Code ↔ OpenClaw Bridge

- OpenClaw skill that can spawn Claude Code subprocess
- Shared memory via brain folder (both read/write same knowledge base)
- OpenClaw triggers Claude Code for complex tasks (coding, analysis)
- Claude Code results feed back to OpenClaw conversation
- All orchestrated through brain event system

---

## Image Generation Plan

Generate 37 unique app-icon-style preview images using OpenAI gpt-image-1.

Each image:
- 1024x1024 square
- Unique visual style per item (not uniform — each feels like its own app)
- Modern, premium aesthetic on dark backgrounds
- Clear visual metaphor for what the integration does
- No text in the images (title is rendered by the dashboard)

---

## Implementation Sequence

1. Create `tools/dashboard/` folder structure
2. Build Express server (`server.js`)
3. Build HTML shell (`index.html`)
4. Build CSS styles (`style.css`)
5. Build JavaScript app (`app.js`, `router.js`, `data.js`, `components.js`)
6. Generate all 37 preview images via OpenAI API
7. Add `/dashboard` command
8. Add dashboard-setup skill for automated integrations
9. Update `plugin.json` with new command
10. Test end-to-end
