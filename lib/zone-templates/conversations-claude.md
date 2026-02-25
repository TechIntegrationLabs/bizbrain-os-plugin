# BizBrain OS — Conversations

> Lightweight brain entry for business discussions. All sessions are auto-captured.

## Auto-Capture System

Every conversation in this folder is automatically captured:
- All your prompts (full text)
- Auto-detected topics (projects, clients, actions)
- Extracted action items
- Decisions and their rationale

Captures go to `brain/_intake-dump/conversations/` for processing.

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
| `/find <query>` | Search across brain |

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

- Quick business discussions without loading full brain context
- Planning sessions that should be captured
- Brainstorming about business operations
- Any conversation you want recorded in the brain

**For code development:** Use `workspaces/<project>/` instead.
**For full brain operations:** Use `brain/` instead.
