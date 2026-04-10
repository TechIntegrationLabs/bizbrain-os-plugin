---
name: openclaw-bridge
description: OpenClaw ↔ Claude Code bridge management — health checks, session management, channel setup, and troubleshooting. Triggers on /bridge, "bridge status", "openclaw health", "check bridge", "gateway status", "claude sessions".
metadata:
  priority: 8
  docs:
    - "https://github.com/alizarion/openclaw-claude-code-plugin"
  pathPatterns: []
  bashPatterns:
    - "openclaw"
    - "gateway"
  importPatterns: []
  promptSignals:
    phrases:
      - "bridge status"
      - "openclaw health"
      - "check bridge"
      - "gateway status"
      - "claude sessions"
      - "bridge health"
      - "openclaw bridge"
    allOf: []
    anyOf:
      - "bridge"
      - "gateway"
      - "openclaw"
    noneOf: []
    minScore: 4
---

# OpenClaw ↔ Claude Code Bridge Management

## Architecture

```
OpenClaw Gateway (:18789)                    Claude Code
  ├─ Telegram (@csquaredbot)                   ├─ MCP Bridge → OpenClaw (14 tools)
  ├─ WhatsApp (stock plugin)                   ├─ Telegram Channel (separate bot)
  ├─ Discord (stock plugin)                    ├─ Discord Channel
  └─ claude-code-plugin ──────────────────────►├─ openclaw-manager plugin
     (launches Claude Code sessions            └─ chrome extension
      with BB1/C2 system prompt)
```

## Commands

### `/bridge` or `/bridge status`
Run a comprehensive health check:

```bash
# 1. Gateway health
curl -s http://127.0.0.1:18789/health

# 2. MCP bridge tool count
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | timeout 5 node ~/.openclaw/mcp-bridge/index.js 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'{len(d[\"result\"][\"tools\"])} tools')"

# 3. Plugin status
grep -A5 "openclaw-claude-code-plugin" ~/.openclaw/openclaw.json

# 4. Channel configs
ls ~/.claude/channels/telegram/.env ~/.claude/channels/discord/.env 2>/dev/null

# 5. Bun runtime
~/.bun/bin/bun --version
```

Report all results in a table.

### `/bridge sessions`
Check active Claude Code sessions launched by OpenClaw:
- Use `openclaw_task_list` MCP tool if available
- Otherwise check `~/.openclaw/agents/claude/sessions/sessions.json`

### `/bridge restart`
**DO NOT restart the gateway yourself.** Tell the user:
> Run `openclaw gateway restart` in a PowerShell window. The gateway must run in a foreground terminal.

### `/bridge test`
Send a test message through each path:
1. Use `openclaw_chat` MCP tool to ping C2Bot
2. Use `openclaw_status` MCP tool to verify gateway
3. Use `event_log_write` MCP tool to log a test event
4. Report results

### `/bridge channels`
Show status of all messaging channels:

| Channel | Path | Status |
|---------|------|--------|
| Telegram (OpenClaw) | @csquaredbot → OpenClaw → claude-code-plugin | Check gateway |
| Telegram (Claude Code) | Separate bot → Claude Code directly | Check ~/.claude/channels/telegram/.env |
| Discord (Claude Code) | Bot → Claude Code directly | Check ~/.claude/channels/discord/.env |
| WhatsApp (OpenClaw) | QR-linked → OpenClaw | Check openclaw.json channels.whatsapp |

### `/bridge launch`
Show the user how to launch Claude Code with proper flags:

```powershell
# Direct session with all flags:
~\.openclaw\claude-launcher.cmd

# Telegram-connected session:
~\.openclaw\claude-channels.cmd

# Custom:
claude --dangerously-skip-permissions --chrome --channels plugin:telegram@claude-plugins-official
```

## Key Files

| File | Purpose |
|------|---------|
| `~/.openclaw/openclaw.json` | Main config — channels, plugins, agents |
| `~/.openclaw/mcp-bridge/index.js` | MCP bridge (Claude → OpenClaw, 14 tools) |
| `~/.openclaw/extensions/openclaw-claude-code-plugin/` | OpenClaw → Claude plugin |
| `~/.claude.json` | Claude Code MCP servers config |
| `~/.claude/channels/telegram/.env` | Claude Code Telegram bot token |
| `~/.claude/channels/telegram/access.json` | Telegram user allowlist |
| `~/.claude/channels/discord/.env` | Claude Code Discord bot token |
| `~/.openclaw/claude-launcher.cmd` | Launcher with --chrome --dangerously-skip-permissions |
| `~/.openclaw/claude-channels.cmd` | Telegram channel launcher |
| `~/.claude/agents/openclaw-bridge-manager.md` | Bridge manager subagent |

## MCP Bridge Tools (14)

| Tool | Direction | Purpose |
|------|-----------|---------|
| `openclaw_chat` | CC→OC | Send message to C2Bot |
| `openclaw_chat_async` | CC→OC | Fire-and-forget task |
| `openclaw_status` | CC→OC | Gateway health check |
| `openclaw_instances` | CC→OC | List agents |
| `openclaw_task_list` | CC→OC | List active tasks |
| `openclaw_task_status` | CC→OC | Check task status |
| `openclaw_task_cancel` | CC→OC | Cancel a task |
| `registry_lookup` | CC→OC | Search C2 registry |
| `registry_health` | CC→OC | Registry health check |
| `event_log_write` | CC→OC | Log an event |
| `event_log_query` | CC→OC | Query events |
| `sync_status` | CC→OC | Sync health status |
| `sync_status_update` | CC→OC | Update sync status |
| `sync_probe_all` | CC→OC | Probe all client channels |

## Plugin Tools (8, OpenClaw → Claude Code)

| Tool | Purpose |
|------|---------|
| `claude_launch` | Start new Claude Code session |
| `claude_respond` | Send follow-up message |
| `claude_fg` | Bring session to foreground |
| `claude_bg` | Send session to background |
| `claude_kill` | Terminate session |
| `claude_output` | Read buffered output |
| `claude_sessions` | List all sessions |
| `claude_stats` | Usage metrics |

## Troubleshooting

### Gateway won't start
1. Check `openclaw.json` for validation errors: `openclaw doctor`
2. Common issue: WhatsApp `allowlist` with empty `allowFrom` — use `pairing` or `disabled`
3. Plugin warnings are advisory — `plugins.allow` empty is OK

### MCP bridge not responding
```bash
cd ~/.openclaw/mcp-bridge && npm install
```

### Plugin sessions failing
1. Check model availability (default: sonnet)
2. Check budget (default: $10/session)
3. Check `claude_stats` for error patterns
4. Verify Claude Code CLI works: `claude --version`

### Chrome not working in plugin sessions
**This is a known limitation.** The plugin uses the Claude Agent SDK, which doesn't support the `--chrome` CLI flag. For browser tasks, use Claude Code Channels instead:
```powershell
~\.openclaw\claude-channels.cmd
```

### Telegram bot not responding
1. Verify bot token in `~/.claude/channels/telegram/.env`
2. Ensure Claude Code is running with `--channels` flag
3. Check user authorization in `access.json`
4. For OpenClaw bot: verify gateway is running, check `openclaw doctor`
