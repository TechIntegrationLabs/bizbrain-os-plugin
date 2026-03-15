---
name: plugin-release
description: >
  BizBrain OS plugin release checklist. MUST be invoked every time the plugin
  gets a meaningful update. Handles version bump, README, CHANGELOG, launch content,
  site content, validation, git tag, push, and announcement drafts.
  Triggers on: plugin update, version bump, "release plugin", "publish plugin",
  "update plugin version", "new plugin version".
version: 1.0.0
---

# Plugin Release Checklist

**This skill is MANDATORY for every meaningful plugin update.** Do not skip steps.

## Pre-Release

1. **Verify all changes work** — run the companion/dashboard servers, check new skills load
2. **Check for breaking changes** — anything that changes existing behavior needs migration notes

## Release Steps

Execute ALL of the following in order:

### 1. Version Bump

- Update `.claude-plugin/plugin.json` — bump `version` field
  - **Patch** (3.x.Y): bug fixes, typo corrections
  - **Minor** (3.Y.0): new features, skills, agents, commands
  - **Major** (Y.0.0): breaking changes, architecture shifts
- Search for any hardcoded version strings and update them

### 2. README.md Update

- Update version badge: `Version-X.Y.Z`
- Update skill count badge if skills were added/removed
- Update command count badge if commands were added/removed
- Update agent count if agents were added/removed
- Add new feature sections if applicable
- Update the Features table with new skills/commands

### 3. CHANGELOG.md Entry

Create or update `CHANGELOG.md` at repo root with:

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added
- New features, skills, agents, commands

### Changed
- Modified behavior, updated skills

### Fixed
- Bug fixes

### Removed
- Deprecated features removed
```

### 4. Launch Content Update

Update `~/Repos/bizbrain-os-launch/` if the feature is significant:
- Create version-specific content folder: `content/updates/vX.Y.Z-feature-name/`
- Draft announcement post
- Update `launch-checklist.md` if needed

### 5. Site Content Update

If the feature affects marketing:
- Check `~/Repos/bizbrain-os-site/` for content that references feature counts or capabilities
- Update if needed (but don't deploy — that's a separate step)

### 6. Plugin Validation

Run the plugin-validator agent to check:
- All new skills are discoverable (have SKILL.md with correct frontmatter)
- All new agents have correct frontmatter (name, description, model, tools)
- All new commands have correct frontmatter (name, description)
- `plugin.json` is valid JSON with correct version
- No orphaned files (skills referenced but not existing, etc.)

### 7. Git Commit + Tag + Push

```bash
# Stage all changes
git add -A

# Commit with version in message
git commit -m "Release vX.Y.Z — Feature Name

- List key changes
- One line per change

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"

# Tag the release
git tag -a vX.Y.Z -m "vX.Y.Z — Feature Name"

# Push with tags
git push origin main --tags
```

### 8. npm Consideration

If `create-bizbrain` CLI needs updating:
- Check `~/Repos/create-bizbrain/` for version references
- Update if needed, then `cd ~/Repos/create-bizbrain && npm publish --access public`

### 9. Discord Announcement Draft

Draft a message for the BizBrain OS Discord (`#announcements` channel):

```
**BizBrain OS Plugin vX.Y.Z — Feature Name**

[2-3 sentence description of what's new]

Key changes:
- Change 1
- Change 2
- Change 3

Update: `claude plugin update bizbrain-os`
```

### 10. Social Media Drafts

Draft posts for:
- **LinkedIn** — professional tone, focus on business value
- **X/Twitter** — concise, developer-focused, include version number

### 11. Memory Update

Update the user's auto-memory (`~/.claude/projects/.../memory/MEMORY.md`) with:
- New version number
- New skill/agent/command counts
- Key new features

## Post-Release

- Verify the GitHub release page shows the tag
- Check that `claude plugin update bizbrain-os` pulls the new version
- Monitor Discord for user feedback
