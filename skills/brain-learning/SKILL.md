---
name: Brain Learning
description: >
  Continuous observation and learning system. Detects patterns in user behavior,
  captures preferences, and improves brain context over time. The engine behind
  the compound interest of AI context.
  Triggers on: "what have you learned", "brain patterns", "preferences", "learning".
version: 1.0.0
---

# Brain Learning

You are the continuous learning engine that makes the brain compound over time.

## Brain Location

Check: BIZBRAIN_PATH env → ~/bizbrain-os/

## Learning Categories

### Patterns (`Operations/learning/patterns.json`)
Detected behavioral patterns:
- Work schedule (when does the user typically work?)
- Project switching patterns (which projects get attention when?)
- Tool preferences (which MCPs, which commands?)
- Communication patterns (who gets contacted when?)

### Preferences (`Operations/learning/preferences.json`)
Captured user preferences:
- Code style (languages, frameworks, patterns)
- Communication style (formal/casual, length, tone)
- Workflow preferences (TDD, plan-first, dive-in)
- Naming conventions

### Observations (`Operations/learning/observations/`)
Raw observations from sessions:
- `YYYY-MM-DD.jsonl` — One JSON object per observation
- Each observation: `{"type": "preference|pattern|fact", "content": "...", "confidence": 0.8}`

## How Learning Works

1. **PostToolUse hook** writes activity timestamps (already running)
2. **Entity Watchdog** captures entity-related learning (already running)
3. **This skill** synthesizes patterns from accumulated observations
4. **SessionStart** injects learned context into future sessions

## Learning Synthesis

When invoked or periodically:

1. Read recent observations from `Operations/learning/observations/`
2. Look for recurring patterns:
   - Same entity mentioned 3+ times → high-priority relationship
   - Same tool used repeatedly → workflow preference
   - Time-based patterns → work schedule
3. Update `patterns.json` and `preferences.json`
4. Prune outdated observations (>30 days with no reinforcement)

## Context Generation

The learning data feeds into `generate-context.js`:
- High-confidence preferences → injected into CLAUDE.md
- Active patterns → inform session context
- Recent observations → available for entity watchdog

## Confidence Levels

| Level | Score | Action |
|-------|-------|--------|
| Low | 0.0-0.3 | Store observation, don't act |
| Medium | 0.4-0.6 | Store, mention if relevant |
| High | 0.7-0.9 | Store, include in context |
| Confirmed | 1.0 | User explicitly confirmed |

## Rules

- Never assume — start at low confidence, increase with repetition
- User corrections immediately set confidence to 1.0 (or 0.0 for negations)
- Don't learn from quoted content or examples — only from user behavior
- Prune stale patterns that haven't been reinforced in 30 days
- Keep observations append-only — never modify historical data
