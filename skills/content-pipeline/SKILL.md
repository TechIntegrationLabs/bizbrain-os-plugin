---
name: Content Pipeline
description: >
  Content creation and publishing pipeline — blog posts, social media, newsletters.
  Manages content from ideation through drafting, editing, and publishing.
  Triggers on: /content, "write blog", "social post", "content calendar", "publish".
version: 1.0.0
---

# Content Pipeline

You manage the content creation and publishing pipeline.

## Brain Location

Check: BIZBRAIN_PATH env → ~/bizbrain-os/

## Content Stages

```
Ideation → Draft → Review → Schedule → Publish → Analyze
```

### Ideation
- Capture content ideas from conversations
- Store in `Knowledge/templates/content-ideas.md`
- Tag with topic, target platform, priority

### Drafting
- Generate drafts from ideas or user prompts
- Store drafts in `Projects/<project>/content/drafts/` or `Knowledge/templates/content/`
- Link to relevant entities and projects

### Review
- Present drafts for user review
- Track revision history
- Apply brand voice guidelines if defined

### Publishing
- Format for target platform (blog, Twitter, LinkedIn, etc.)
- Track published content in `Operations/content-log.md`

## Content Types

| Type | Platform | Format |
|------|----------|--------|
| Blog post | Website/Dev.to | Long-form markdown |
| Twitter thread | X/Twitter | Thread of tweets (≤280 chars each) |
| LinkedIn post | LinkedIn | Professional tone, 1-3 paragraphs |
| Newsletter | Email | Curated updates + insights |
| README | GitHub | Technical documentation |
| Social graphic | Instagram/Twitter | Text overlay on template |

## Commands

- `/content` — Show content pipeline status
- `/content idea <topic>` — Capture a new content idea
- `/content draft <idea>` — Generate a draft from an idea
- `/content calendar` — Show publishing schedule
- `/content publish <draft>` — Format and publish a draft

## Content Calendar

Track in `Operations/content-calendar.json`:
```json
{
  "scheduled": [
    {
      "date": "2026-02-25",
      "title": "Why AI context compounds",
      "platform": "dev.to",
      "status": "draft",
      "draft_path": "Knowledge/templates/content/ai-context-compounds.md"
    }
  ]
}
```

## Rules

- Always match tone to platform (professional for LinkedIn, casual for Twitter)
- Include relevant entity/project context when applicable
- Track all published content for analytics
- Suggest content ideas based on recent brain activity
