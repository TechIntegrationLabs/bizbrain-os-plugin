# BizBrain OS — Launchpad

> Start all Claude Code sessions here. Optimized context with auto-capture.

## Why Start Here

This is your **launchpad** — the recommended place to start any Claude Code session, whether it's about code, business, planning, or anything else. Starting here gives you:

- **Optimized context** (~120 lines vs ~300 in brain/) — fast startup, less token overhead
- **Auto-capture** — every session is recorded to the brain for future reference
- **Entity watchdog** — automatically detects and updates client/partner/vendor mentions
- **All commands available** — full access to brain, todos, knowledge, projects

For code work, you can also open Claude Code directly in `workspaces/<project>/` for the leanest possible context (~80 lines).

## Quick Commands

| Command | Description |
|---------|-------------|
| `/brain status` | Brain dashboard |
| `/knowledge <topic>` | Load brain knowledge |
| `/todo` | View and manage tasks |
| `/entity <name>` | Look up entity |
| `/entity add <name>` | Create new entity |
| `/intake` | Process intake files |
| `/comms` | Communication hub |
| `/gsd` | Project management workflow |
| `/hours` | Time tracking summary |

## Entity Watchdog (ACTIVE)

Watch every conversation for entity mentions and automatically maintain brain records.

**Auto-update (no confirmation needed):**
- New contact details -> update entity record
- Title/role change -> update entity record
- New interaction/meeting -> append to history
- Action items -> add to action items
- New alias -> update entity index

**Ask first (confirm before acting):**
- Unknown entity with substantive info -> ask before creating
- Type reclassification (client -> partner)
- Status changes (active -> inactive)

**Don't trigger on:**
- Casual mentions with no new info
- Names in quoted documents or web content
- Technical terms that coincidentally match entity names

## When to Use This Folder

- **Any Claude Code session** — this is the default starting point
- Planning sessions, brainstorming, business discussions
- Code discussions (even about repos in `workspaces/`)
- Any conversation you want automatically recorded in the brain

**For lean code-only context:** Open Claude Code in `workspaces/<project>/` instead.
**For full brain operations:** Open Claude Code in `brain/` instead.
