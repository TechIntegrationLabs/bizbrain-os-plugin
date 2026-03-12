---
name: document-session
description: Comprehensive session documentation — captures reasoning, decisions, architecture, and implementation details for important sessions
command: document-session
aliases:
  - doc-session
---

# Document Session

Generate comprehensive documentation of the current session's work, capturing all reasoning, architectural decisions, implementation details, and context that would otherwise be lost.

## When to Use

- After significant architectural work
- After building new systems or features
- When the user asks to document what was done
- Before ending sessions with complex multi-step implementations

## Output Location

Save documentation to: `BB1/_intake-dump/sessions/YYYY-MM-DD-{topic-slug}.md`

Where BB1 = `C:\Users\Disruptors\Documents\Tech Integration Labs BB1\`

## Process

1. **Identify scope** — What was the main topic/goal of this session?
2. **Scan recent changes** — Check git log for commits, read changed files
3. **Reconstruct the narrative** — What happened, in what order, and WHY
4. **Generate the document** using the template below
5. **Save automatically** to the sessions intake folder

## Document Template

Generate a markdown document with these sections:

### Header
- Session date
- Duration estimate
- Primary topic/goal
- Key participants (user, systems involved)

### Executive Summary
2-3 sentences: what was accomplished and why it matters.

### Problem Statement
What problem was being solved? What was the starting state?

### Architectural Decisions

For EACH significant decision made during the session:

| Decision | Options Considered | Chosen Approach | Rationale |
|----------|-------------------|-----------------|-----------|
| ... | ... | ... | ... |

Include the "why" — not just what was decided, but the reasoning behind it. This is the most valuable part of the document.

### Implementation Details

For each component/system built or modified:

#### [Component Name]
- **Purpose:** What it does and why it exists
- **Location:** File paths
- **How it works:** Technical explanation
- **Key design choices:** Why it was built this way
- **Integration points:** How it connects to other systems

### Configuration Changes
- Settings modified (with before/after if relevant)
- Scheduled tasks created
- Hooks added
- Environment changes

### Files Created/Modified

| File | Action | Description |
|------|--------|-------------|
| path/to/file | Created/Modified | What it does |

### Data Flow
Describe how data moves through the system(s) built/modified.

### Known Limitations
What doesn't work yet, what's a v1 limitation, what needs future work.

### Future Improvements
Ideas discussed or implied but not implemented.

### Key Learnings & Insights
Technical insights, gotchas encountered, patterns discovered.
Include things like "gwcli needs .cmd extension on Windows" — practical knowledge that saves time.

### Git History
List all commits from this session with their messages.

## Guidelines

- **Be specific** — include file paths, function names, config values
- **Capture the WHY** — decisions without rationale are useless
- **Include alternatives rejected** — knowing what was NOT chosen is as valuable as what was
- **Note gotchas** — platform-specific issues, encoding problems, PATH issues
- **Link to code** — reference specific files and line numbers
- **Don't summarize — document** — this is a reference, not a summary
- **Include the full picture** — how this work connects to the broader system

## After Saving

1. Confirm the file was saved with its path
2. If in a git repo, mention the file can be committed
3. Suggest updating relevant memory files if architectural decisions were made
