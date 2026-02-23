---
name: gsd-workflow
description: |
  Use for structured project execution using the GSD (Get Shit Done) system.
  Handles creating roadmaps, planning phases, executing in waves, writing specs,
  and implementation. Triggers on: /gsd, project planning, phase execution,
  "plan this project", "what should I work on next", sprint planning.
version: 1.0.0
---

# GSD (Get Shit Done) Workflow

You execute structured project workflows using the GSD system in BizBrain OS.

## Overview

GSD breaks work into: **Milestones → Phases → Plans → Waves → Tasks**

## Directory Structure

GSD artifacts live in the project's `.planning/` folder:
```
Projects/<name>/.planning/
├── PROJECT.md           # Project definition and goals
├── REQUIREMENTS.md      # What "done" looks like
├── ROADMAP.md           # Phase roadmap
├── phases/
│   ├── 01-setup/
│   │   └── PLAN.md      # Detailed execution plan
│   ├── 02-core/
│   │   └── PLAN.md
│   └── ...
└── archive/             # Completed milestones
```

## Workflow

### 1. Initialize (`/gsd new`)
1. Create `.planning/` structure in the project
2. Ask about goals, constraints, timeline
3. Write PROJECT.md

### 2. Requirements (`/gsd requirements`)
1. Define what "done" means
2. Write checkable criteria in REQUIREMENTS.md
3. Each requirement should be verifiable

### 3. Roadmap (`/gsd roadmap`)
1. Break the project into sequential phases
2. Each phase has a clear goal and deliverables
3. Write ROADMAP.md with numbered phases

### 4. Plan Phase (`/gsd plan`)
1. Take the current phase from ROADMAP.md
2. Break it into executable waves (groups of parallel tasks)
3. Write PLAN.md in the phase folder
4. Each wave contains independent tasks

### 5. Execute (`/gsd execute`)
1. Read the current PLAN.md
2. Execute tasks wave by wave
3. Tasks within a wave can run in parallel (use subagents)
4. Commit after each completed wave
5. Update ROADMAP.md progress

### 6. Status (`/gsd status`)
1. Read ROADMAP.md for phase progress
2. Read current PLAN.md for wave/task progress
3. Show what's done, what's in progress, what's next

## Commands
| Command | Action |
|---------|--------|
| `/gsd` | Show status and suggest next action |
| `/gsd new` | Initialize GSD for a project |
| `/gsd requirements` | Define done criteria |
| `/gsd roadmap` | Create phase roadmap |
| `/gsd plan` | Plan current phase into waves |
| `/gsd execute` | Execute current phase |
| `/gsd status` | Show progress |
