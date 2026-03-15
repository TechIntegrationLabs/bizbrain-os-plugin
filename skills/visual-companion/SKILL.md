---
name: visual-companion
description: >
  Browser-based visual layer for BizBrain OS. Renders diagrams, mockups, comparisons,
  dashboards, kanban boards, timelines, and flowcharts in real-time alongside Claude Code
  conversations. Any skill or agent can push visual content to the companion.
  Triggers on: "show me visually", "visualize this", "draw a diagram", "render mockup",
  "visual companion", "open companion", "show architecture", "show comparison",
  "visual mode", "diagram this".
version: 1.0.0
---

# Visual Companion

You orchestrate the Visual Companion — a browser-based renderer that displays diagrams,
mockups, comparisons, and dashboards alongside the terminal conversation.

## How It Works

1. **Server** runs at `http://localhost:3851` (auto-launches on first use)
2. **WebSocket** streams content from Claude Code to the browser in real-time
3. **API** accepts POST requests with typed content — renders instantly
4. **History** — all pushed content is saved; user can browse previous views

## Launching the Companion

### Check if running
```bash
curl -s http://localhost:3851/api/status 2>/dev/null | grep -q '"running":true' && echo "RUNNING" || echo "NOT_RUNNING"
```

### Start if not running
```bash
COMPANION_DIR=""
for dir in \
  "${CLAUDE_PLUGIN_ROOT}/tools/visual-companion" \
  "$HOME/.claude/plugins/cache/TechIntegrationLabs/bizbrain-os-plugin/"*/tools/visual-companion \
  "$HOME/.claude/plugins/cache/bizbrain-os-plugin/"*/tools/visual-companion \
  "$HOME/Repos/bizbrain-os-plugin/tools/visual-companion"; do
  if [ -d "$dir" ]; then
    COMPANION_DIR="$dir"
    break
  fi
done

if [ -z "$COMPANION_DIR" ]; then
  echo "ERROR: Visual Companion not found"
  exit 1
fi

cd "$COMPANION_DIR" && [ -d node_modules ] || npm install --silent 2>&1
node server.js &
```

Wait 2 seconds, then open browser:
```bash
if command -v start &>/dev/null || [ "$(uname -o 2>/dev/null)" = "Msys" ]; then
  start http://localhost:3851
elif command -v open &>/dev/null; then
  open http://localhost:3851
elif command -v xdg-open &>/dev/null; then
  xdg-open http://localhost:3851
fi
```

## Pushing Content

Push content via HTTP POST to the companion server. Always ensure the server is running first.

### Content Types

| Type | Content Format | Use Case |
|------|---------------|----------|
| `mermaid` | Mermaid diagram syntax | Architecture, flowcharts, entity relationships, sequences |
| `markdown` | Markdown text | Explanations, documentation, formatted text |
| `html` | Raw HTML | Custom layouts, rich content |
| `svg` | SVG markup | Vector graphics, custom diagrams |
| `comparison` | JSON: `{left, right, leftLabel, rightLabel}` | Side-by-side options, before/after |
| `cards` | JSON array: `[{icon, title, description, meta}]` | Feature lists, option grids |
| `timeline` | JSON array: `[{title, description, date, status}]` | Project roadmaps, milestones |
| `kanban` | JSON: `{columns: [{title, items: [{title, desc}]}]}` | Task boards, workflow status |
| `dashboard` | JSON array: `[{value, label, color, change}]` | KPI displays, metrics |
| `code` | Plain text | Code snippets with monospace rendering |
| `mockup` | Full HTML document | UI mockups rendered in sandboxed iframe |
| `flowchart` | Mermaid syntax | Alias for mermaid |
| `table` | JSON array of objects | Tabular data display |
| `image` | URL or data URI | Image display |

### Push via curl

```bash
curl -s -X POST http://localhost:3851/api/push \
  -H "Content-Type: application/json" \
  -d '{
    "type": "mermaid",
    "title": "System Architecture",
    "content": "graph TD\n  A[User] --> B[API]\n  B --> C[Database]"
  }'
```

### Push Comparison
```bash
curl -s -X POST http://localhost:3851/api/push-comparison \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Database Options",
    "leftLabel": "PostgreSQL",
    "rightLabel": "MongoDB",
    "left": "## PostgreSQL\n- Relational\n- ACID compliant\n- Strong typing",
    "right": "## MongoDB\n- Document store\n- Flexible schema\n- Horizontal scaling"
  }'
```

### Push Cards
```bash
curl -s -X POST http://localhost:3851/api/push-cards \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Feature Overview",
    "cards": [
      {"icon": "🧠", "title": "Brain", "description": "Persistent knowledge layer"},
      {"icon": "📊", "title": "Dashboard", "description": "Visual command center"}
    ]
  }'
```

## Integration with Other Skills

When ANY skill or agent wants to show something visual, it should:

1. Ensure the companion is running (check `/api/status`)
2. POST to `/api/push` with appropriate type and content
3. Tell the user: "Pushed to Visual Companion — check your browser tab."

### Skills That Should Use Visual Companion

| Skill | What to Visualize |
|-------|------------------|
| **brainstorming** | Architecture diagrams, option comparison cards |
| **GSD workflow** | Phase roadmap timeline, wave execution kanban |
| **frontend-studio** | UI mockups in sandboxed iframe |
| **brain status** | Brain stats dashboard, entity relationship mermaid |
| **knowledge management** | Knowledge graph mermaid diagram |
| **todo management** | Kanban board of tasks by status |
| **project tracking** | Timeline of milestones |
| **entity management** | Contact cards, relationship maps |
| **time tracking** | Hours dashboard with utilization stats |

## API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/push` | POST | Push new content `{type, title, content, metadata}` |
| `/api/push-comparison` | POST | Push comparison `{title, left, right, leftLabel, rightLabel}` |
| `/api/push-cards` | POST | Push cards `{title, cards: [{icon, title, description}]}` |
| `/api/current` | GET | Get currently displayed content |
| `/api/history` | GET | Get content history `?limit=N` |
| `/api/clear` | POST | Clear the display |
| `/api/status` | GET | Server status and connected clients |
