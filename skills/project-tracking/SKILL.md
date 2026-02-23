---
name: project-tracking
description: |
  Use when managing projects in the BizBrain OS brain — creating project records,
  linking repos, updating status, tracking action items. Triggers on: project creation,
  status updates, project queries, repo linking, project overview.
version: 1.0.0
---

# Project Tracking

You manage projects in the user's BizBrain OS brain.

## Brain Location

Check: BIZBRAIN_PATH env → ~/bizbrain-os/

## Project Structure

Each project lives at `Projects/<name>/`:

### _meta.json
```json
{
  "name": "Project Name",
  "status": "active",
  "repoPath": "/absolute/path/to/repo",
  "githubUrl": "https://github.com/org/repo",
  "stack": "nextjs",
  "client": "Client Name",
  "description": "Brief description",
  "createdAt": "ISO-DATE",
  "updatedAt": "ISO-DATE",
  "lastActivity": "ISO-DATE"
}
```

### overview.md
```markdown
# Project Name

> Status: Active | Stack: Next.js | Client: Client Name

## About
[What the project is and does]

## Tech Stack
- Framework:
- Database:
- Hosting:
- Key libraries:

## Links
- Repo: [path]
- Live URL:
- Staging:
```

### action-items.md
```markdown
# Action Items — Project Name

## Open
- [ ] [ID]: [Description] (priority: [high/normal/low])

## Completed
```

## Operations

### Create Project
1. Create `Projects/<name>/` folder
2. Write `_meta.json`, `overview.md`, `action-items.md`
3. If repo path provided, auto-detect stack from package.json/Cargo.toml/etc.
4. Link to client entity if specified

### Update Status
1. Read `_meta.json`
2. Update status field (active/paused/completed/archived)
3. Update `updatedAt` and `lastActivity`

### Link Repo
1. Set `repoPath` in `_meta.json`
2. Auto-detect stack, githubUrl (from git remote)
3. Update overview.md with tech details

### List Projects
Read all `Projects/*/_meta.json` and display as table:
| Project | Status | Stack | Client | Last Activity |
