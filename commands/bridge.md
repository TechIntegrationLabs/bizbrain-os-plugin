---
name: bridge
description: OpenClaw ↔ Claude Code bridge management — health, sessions, channels, troubleshooting
argument-hint: [status|sessions|test|channels|launch|restart]
---

You are managing the OpenClaw ↔ Claude Code bidirectional bridge.

Invoke the `bizbrain-os:openclaw-bridge` skill and follow it.

**Available subcommands:**
- `/bridge` or `/bridge status` — Full health check (gateway, MCP bridge, plugin, channels)
- `/bridge sessions` — List active Claude Code sessions launched by OpenClaw
- `/bridge test` — Send test messages through each bridge path
- `/bridge channels` — Show status of all messaging channels (Telegram, WhatsApp, Discord)
- `/bridge launch` — Show launcher commands for Claude Code with proper flags
- `/bridge restart` — Instructions for restarting the OpenClaw gateway

**Quick reference:**
- Gateway port: 18789
- MCP bridge: 14 tools (Claude → OpenClaw)
- Plugin: 8 tools (OpenClaw → Claude Code)
- Launcher: `~/.openclaw/claude-launcher.cmd` (--chrome --dangerously-skip-permissions)
- Channels: `~/.openclaw/claude-channels.cmd` (Telegram + all flags)
