---
name: visual
description: Launch the BizBrain OS Visual Companion — real-time diagrams, mockups, and dashboards in your browser
argument-hint: [open|status|push <type> <content>]
---

# /visual — BizBrain OS Visual Companion

Launch the Visual Companion browser app for real-time visual content alongside your conversation.

## Instructions

**You MUST automatically launch the companion. Do NOT just describe how — actually run the commands.**

### No argument or "open": Launch the companion

1. **Check if the companion server is already running:**

```bash
curl -s http://localhost:3851/api/status 2>/dev/null | grep -q '"running":true' && echo "RUNNING" || echo "NOT_RUNNING"
```

2. **If RUNNING**, skip to step 4.

3. **If NOT running, find the companion, install deps, and start the server:**

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
  echo "ERROR: Visual Companion not found in plugin directory"
  exit 1
fi

echo "Visual Companion found at: $COMPANION_DIR"
```

Then install dependencies (if needed) and start the server:
```bash
cd "$COMPANION_DIR" && [ -d node_modules ] || npm install --silent 2>&1
node server.js &
```

Wait 2 seconds for the server to start.

4. **Open in the user's default browser:**

```bash
if command -v start &>/dev/null || [ "$(uname -o 2>/dev/null)" = "Msys" ]; then
  start http://localhost:3851
elif command -v open &>/dev/null; then
  open http://localhost:3851
elif command -v xdg-open &>/dev/null; then
  xdg-open http://localhost:3851
fi
```

5. **Confirm to the user:**

```
Visual Companion is running at http://localhost:3851

Features:
  • Real-time diagrams — Mermaid, flowcharts, architecture visualizations
  • Mockups — UI concepts rendered in sandboxed iframes
  • Comparisons — Side-by-side option analysis
  • Dashboards — KPI stats, progress metrics
  • Kanban boards — Task status visualization
  • Timelines — Project roadmaps and milestones
  • Cards — Feature grids, contact cards, option lists

Keep this browser tab open. Content pushes automatically from your conversation.
Close the terminal or press Ctrl+C to stop the server.
```

### "status": Show companion status

```bash
curl -s http://localhost:3851/api/status 2>/dev/null || echo "Visual Companion is not running. Use /visual to launch."
```

## Notes

- The companion runs on port 3851 (next to the dashboard on 3850)
- Dependencies auto-install on first launch (~5 seconds)
- Content streams via WebSocket — opens in any modern browser
- All content history is kept in memory (cleared on server restart)
- The companion works with any skill that pushes content to its API
