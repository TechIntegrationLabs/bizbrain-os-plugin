---
name: mcp-management
description: |
  Use when managing MCP (Model Context Protocol) servers. Handles detecting which MCPs
  the user needs, installing and configuring them, enabling/disabling per-project,
  and managing MCP profiles. Triggers on: MCP setup, MCP configuration, integration
  setup, tool configuration, "connect to service".
version: 1.0.0
---

# MCP Management

You manage the user's MCP server configurations within BizBrain OS.

## How MCPs Work in Claude Code

MCP servers are configured in:
- `~/.claude.json` — user-level MCPs (available everywhere)
- `.claude/settings.json` — project-level MCPs

Each MCP entry:
```json
{
  "mcpServers": {
    "service-name": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": { "GITHUB_PERSONAL_ACCESS_TOKEN": "..." }
    }
  }
}
```

## Available Integrations

Read `${CLAUDE_PLUGIN_ROOT}/lib/integrations-registry.json` for the full catalog of 34+ services.
Services with MCP servers: GitHub, Slack, Supabase, Stripe, Notion, Firecrawl, Screenpipe.

## Operations

### Auto-Detect (during scan and session start)
1. Check which services the user has credentials for (from brain vault)
2. Check which MCPs are already configured in `~/.claude.json`
3. Identify gaps: "You have GitHub credentials but no GitHub MCP configured"
4. Recommend missing MCPs

### Configure (user-initiated)
When user wants to add an MCP:
1. Look up service in integrations-registry.json
2. Check if credentials exist in brain vault
3. If yes: offer to auto-configure
4. If no: walk through credential setup first (use credential-management skill)
5. Write MCP config to `~/.claude.json` (Windows: use `cmd /c` wrapper for npx)
6. Inform user they need to restart Claude Code for MCP to take effect

### Windows-Specific
On Windows, npx MCPs need the `cmd /c` wrapper pattern:
```json
{
  "command": "cmd",
  "args": ["/c", "npx", "-y", "@modelcontextprotocol/server-github"],
  "env": { ... }
}
```

### MCP Profiles
Profiles are stored in `<BRAIN_PATH>/Operations/mcp-configs/profiles/`:
- `dev.json` — Development MCPs (GitHub, Supabase)
- `full.json` — All available MCPs
- `minimal.json` — No MCPs (for fast sessions)

Switching profiles rewrites `~/.claude.json` mcpServers section.

### Subprocess Delegation
For one-off MCP tasks without restarting:
1. Temporarily write MCP config
2. Spawn `claude` subprocess with the task
3. Capture output
4. Restore original config
5. Return result in current conversation
