---
name: dashboard
description: Launch the BizBrain OS visual dashboard in your browser
---

# /dashboard — BizBrain OS Dashboard

Launch the visual dashboard for managing your brain setup, integrations, and quick actions.

## Instructions

1. **Check if the dashboard server is already running:**

```bash
curl -s http://localhost:3850/api/brain-status > /dev/null 2>&1 && echo "RUNNING" || echo "NOT_RUNNING"
```

2. **If NOT running, install dependencies and start the server:**

Find the dashboard directory relative to the plugin installation. The dashboard is at `tools/dashboard/` inside the plugin.

```bash
# Find the plugin path
PLUGIN_DIR="$(dirname "$(dirname "$(readlink -f "$0")")")"
# Or use the known path pattern for installed plugins
DASHBOARD_DIR=""

# Check common locations
for dir in \
  "$HOME/.claude/plugins/cache/TechIntegrationLabs/bizbrain-os-plugin/"*/tools/dashboard \
  "$HOME/.claude/plugins/cache/bizbrain-os-plugin/"*/tools/dashboard \
  "$HOME/Repos/bizbrain-os-plugin/tools/dashboard"; do
  if [ -d "$dir" ]; then
    DASHBOARD_DIR="$dir"
    break
  fi
done

if [ -z "$DASHBOARD_DIR" ]; then
  echo "Dashboard not found. Looking in plugin cache..."
fi
```

Then:
```bash
cd "$DASHBOARD_DIR"
[ -d node_modules ] || npm install --silent
node server.js &
```

Wait 2 seconds for the server to start.

3. **Open in the user's default browser:**

```bash
# Windows
start http://localhost:3850

# macOS
open http://localhost:3850

# Linux
xdg-open http://localhost:3850
```

4. **Confirm to the user:** "BizBrain OS Dashboard is running at http://localhost:3850"

## Notes

- The dashboard runs on port 3850
- It serves a local web application with no external dependencies
- All data is read from the brain folder on your machine
- The server auto-discovers the brain path (BIZBRAIN_PATH env, ~/bizbrain-os/, etc.)
- Close the terminal or press Ctrl+C to stop the server
