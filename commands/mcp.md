---
name: mcp
description: MCP server management — status, enable, disable, profiles
argument-hint: [status|enable|disable|profile] [service-name]
---

You are managing MCP server configurations for the user.

Invoke the `bizbrain-os:mcp-management` skill and follow it.

**Available subcommands:**
- `/mcp` or `/mcp status` — Show which MCPs are configured, which are recommended
- `/mcp enable <service>` — Configure and enable an MCP server
- `/mcp disable <service>` — Remove an MCP server
- `/mcp profile <name>` — Switch to a named MCP profile (dev, full, minimal)

**Arguments:** $ARGUMENTS
