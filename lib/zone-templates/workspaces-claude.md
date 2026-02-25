# BizBrain OS — Workspaces

> Lean context zone for code development. Full brain context loads only when needed.

## Available Commands

| Command | Description |
|---------|-------------|
| `/brain status` | Brain dashboard |
| `/knowledge <topic>` | Load specific brain knowledge |
| `/todo` | View and manage tasks |
| `/todo add <task>` | Add a task (auto-routes to correct project) |
| `/hours` | Time tracking summary |
| `/gsd` | Project management workflow |
| `/entity <name>` | Look up a client or collaborator |

## Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server
npm run build        # Production build
npm run test         # Run tests
```

## Linking to Brain

Each project can link to its brain record via `Projects/<name>/` in the brain.
Use `/gsd` within a project for structured execution with wave-based parallelization.

*Full brain context: open Claude Code in the `brain/` folder instead.*
