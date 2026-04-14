# Changelog

All notable changes to the BizBrain OS Claude Code Plugin.

## [3.6.0] - 2026-04-14

### Added
- **`/brain-viz` command & skill** — generate a full-featured 3D Three.js neural explorer for any BizBrain instance. Auto-detects brain root, runs/updates graphify, labels top 40 communities, renders an interactive viewer with timeline growth animation, search (Ctrl+K), multi-brain selector, draggable panels, and 6 animation presets (Calm, Active, Neural Storm, Demo, Heartbeat, Growth Replay).
- **Public deploy pipeline** — `/brain-viz --public` strips sensitive fields, bakes 3D positions offline (vectorized Fruchterman-Reingold), gzips output, injects service worker + boot loader + OG meta, and self-hosts `3d-force-graph.min.js`. Achieves **99% graph size reduction** (10.7MB → 157KB).
- **`/brain-viz --deploy [site-name]`** — one-shot deploy to Netlify with immutable cache headers on graph.json.gz.
- **Parameterized viewer template** — single HTML template works for BB1 and any C² client brain. Reads `communities.json` + `brand.json` sidecars at runtime so you can customize colors/titles without touching the template.
- **Service worker** — caches graph data + HTML + vendor libs for instant repeat visits.

### Changed
- Skill count: 23 → **31**
- Command count: 16 → **24**
- README badges updated to reflect current counts (were stale since 3.5.0)

### Reference deploy
- BB1 main brain: <https://bb1-brain-viewer.netlify.app>
- Load time: 333ms HTML / 400ms graph (11,806 nodes capped to 3,000 hubs, 157KB gzipped)

## [3.5.1] - 2026-03-17

### Added
- **Auto-Update Notifications** — SessionStart hook checks GitHub for new versions once per day. If newer exists, shows a one-line notification in your session context.
- **37 AI-Generated Infographic Icons** — every dashboard module now has a unique Flux 1.1 Pro generated icon with category-colored neon accents on dark backgrounds.
- **`/report` command** — generates an anonymous usage report (session counts, tool usage, brain stats) you can share with the BizBrain team. No private data ever included.
- **`/health` command** — comprehensive installation health check validating brain structure, hooks, dependencies, and config with PASS/WARN/FAIL indicators.
- **Opt-in Telemetry Beacon** — enable in `/brain configure` to automatically send anonymous usage data to the BizBrain team once per day via Discord webhook.
- **Changelog Notifications** — after updating, your next session shows what changed in the new version.
- **Brain Schema Versioning** — `BRAIN_SCHEMA_VERSION` in `.bizbrain-root.json` enables safe future migrations without breaking existing data.

### Changed
- README rewritten with clear 4-step numbered install guide
- Marketplace.json version synced (was stuck at 3.4.0)
- Dashboard images compressed from 23MB → 0.4MB (WebP) on site, 7.3MB on plugin
- Command count: 16 → 18

## [3.5.0] - 2026-03-15

### Added
- **Visual Companion** — browser-based real-time visualization at `localhost:3851`
  - Renders Mermaid diagrams, HTML mockups, side-by-side comparisons, kanban boards, timelines, dashboards, cards, tables, and code views
  - WebSocket streaming for instant content updates from conversations
  - Content history with browsable sidebar
  - Dark theme matching BizBrain OS design language
  - Zero-dependency frontend (vanilla HTML/CSS/JS + CDN-loaded Mermaid.js and Marked.js)
  - Auto-installs on first use (Express + ws)
- **Visual Presenter agent** — converts concepts into optimal visual formats and pushes to companion
- **Visual Companion skill** — orchestrates the companion server, provides API reference for other skills
- **`/visual` command** — launches the companion with auto-install and browser opening
- **Plugin Release skill** — mandatory checklist for every plugin update (version bump, README, CHANGELOG, launch content, validation, git, announcements)

### Changed
- Skill count: 21 → 23
- Command count: 15 → 16
- Agent count: 6 → 7
- Version: 3.4.0 → 3.5.0

## [3.4.0] - 2026-03-12

### Added
- Schema Evolution agent for dynamic record type management
- Client Sync agent for external data synchronization
- Social engagement skill
- Media downloader skill
- Google Workspace integration skill

## [3.3.0] - 2026-02-23

### Added
- Visual Dashboard at `localhost:3850`
- 37-item setup checklist across 8 categories
- AI-generated preview icons (gpt-image-1)
- Intelligence gathering page (URL scraping, file upload)
- Progress ring SVG visualization
- Integrations hub (37+ services)
- Quick launch buttons
- `/dashboard` command

## [3.2.0] - 2026-02-15

### Added
- Meeting Transcription — local WASAPI + faster-whisper, $0/month Otter.ai replacement
- Brain Swarm orchestration layer (opt-in)
- Event queue, staging, conflict detection, changelog audit trail
- Smart model routing (haiku/sonnet)

## [3.1.0] - 2026-02-08

### Added
- Cross-platform polyglot run-hook.cmd (CMD→Git Bash on Windows)
- 5 user profiles (developer, agency, consultant, content-creator, personal)
- Brain Learner agent
- Entity Watchdog agent

## [3.0.0] - 2026-02-01

### Added
- Initial public release
- 15 core skills
- 12 commands
- Brain Gateway agent
- Brain Orchestrator agent
- SessionStart + PostToolUse hooks
- Three-zone architecture (launchpad/workspaces/brain)
