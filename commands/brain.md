---
name: brain
description: BizBrain OS brain management — status, setup, scan, configure, profiles
argument-hint: [setup|status|scan|configure|profile]
---

You are managing the user's BizBrain OS brain.

**Available subcommands:**

- `/brain` or `/brain status` — Show brain status (path, profile, stats, active features, last scan)
- `/brain setup` — First-time setup. Invoke the `bizbrain-os:brain-bootstrap` skill and follow it exactly.
- `/brain scan` — Re-scan the machine and update the brain with new discoveries
- `/brain configure` — Edit brain settings (auto-behaviors, feature toggles, communication style)
- `/brain profile` — Switch profile or customize feature set

**Arguments:** $ARGUMENTS

**If no argument or "status":**
1. Check for brain folder (BIZBRAIN_PATH env, then ~/bizbrain-os/)
2. If no brain: tell user to run `/brain setup`
3. If brain exists: read config.json, state.json, and display:
   - Brain path
   - Profile name
   - Active features (with on/off toggles shown)
   - Auto-behaviors (with current modes)
   - Scan statistics (projects, entities, services, last scan date)
   - Recent activity (last 5 sessions from Operations/learning/sessions/)

**If "setup":**
Invoke the `bizbrain-os:brain-bootstrap` skill.

**If "scan":**
Run the scanner script at `${CLAUDE_PLUGIN_ROOT}/scripts/scanner.sh`, compare results to existing brain state.
- Show **new discoveries** with the same interactive selection UI from brain-bootstrap Step 3.5
- Show **previously excluded** items (from `.bizbrain/scan-cache.json`) and ask if user wants to add any
- Show **removed items** (previously tracked but no longer found on disk) and ask if user wants to remove them
- Update Projects/ and Operations/ based on user selections
- Update `.bizbrain/scan-cache.json` with new full results

**If "configure":**
Read current config.json and present settings as an interactive menu using AskUserQuestion. Allow toggling features and auto-behaviors.

**If "profile":**
Show current profile and allow switching. Read profiles from `${CLAUDE_PLUGIN_ROOT}/profiles/`.
