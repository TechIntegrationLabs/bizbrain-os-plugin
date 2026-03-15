# Changelog

All notable changes to the BizBrain OS Claude Code Plugin.

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
