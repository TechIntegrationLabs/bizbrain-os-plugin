---
name: social-engage
description: This skill should be used when the user asks to "engage on social", "reply to comments", "check my posts", "respond to community", "autorespond", "social engagement", "check skool", "check linkedin", "community replies", or mentions responding to comments or posts on social platforms. Also triggered by /engage, /social, or /respond commands.
version: 0.1.0
---

# Social Engagement

Intelligent social media engagement across platforms. Finds posts, comments, and questions that need responses and replies in the user's authentic voice.

## Purpose

Automate community engagement by scanning platforms for mentions, comments, and questions related to the user's products and brand, then composing and posting replies that match the user's natural writing style.

## Workflow

### 1. Determine Scope

Parse the user's request to identify:
- **Platform:** Skool, LinkedIn, Discord, or "all"
- **Community/channel:** Specific group or default to known communities
- **Topic:** Product name, keyword, or "all recent activity"
- **Action:** respond to comments, create a post, or both

If not specified, default to scanning all known communities for unreplied mentions.

### 2. Load Voice Profile

Read `references/voice-guide.md` before composing ANY response. The voice guide defines exact writing patterns, forbidden patterns, and tone examples. Every reply MUST follow these rules.

Key principles:
- Short, lowercase, casual, no m-dashes
- Informative but not salesy
- Sounds human, never AI-generated
- Authentic and direct

### 3. Scan for Engagement Opportunities

Use browser automation (Claude-in-Chrome) or platform MCPs to:
1. Navigate to the platform/community
2. Search for relevant keywords (product names, brand)
3. Open each post with recent comment activity
4. Identify unreplied comments that warrant a response

### 4. Prioritize Responses

Reply priority order:
1. **Direct questions** about the product (highest priority)
2. **Potential leads/collaborators** expressing interest
3. **Community admin/owner** comments
4. **Technical questions** from users trying the product
5. **Positive feedback** deserving a quick thanks
6. **General discussion** where adding value makes sense

Skip: casual mentions with no substance, your own comments, comments already replied to.

### 5. Compose and Confirm

For each reply:
1. Read the FULL thread context (not just the one comment)
2. Draft a reply following voice-guide.md
3. Present the draft to the user for approval before posting
4. Post only after explicit confirmation

After first confirmation, the user may say "just go" or "post them all" to approve batch posting.

### 6. Post and Report

After posting all replies, provide a summary:
- Number of replies posted
- Which posts/threads were engaged
- Any notable interactions (potential leads, admin engagement)
- Suggested follow-ups

## Platform-Specific Instructions

See `references/platforms.md` for detailed platform navigation, API usage, and technical posting instructions.

## Creating New Posts

When asked to create a post (not just reply):
1. Ask what platform and community
2. Ask for the topic or key points
3. Load relevant context from BB1 brain (project status, recent updates, features)
4. Draft the post in the user's voice
5. Present for approval
6. Post after confirmation

## Knowledge Sources

To respond accurately to technical questions, load context from:
- `~/bizbrain-os/brain/` or BB1 brain for product details
- Project CLAUDE.md files for current status
- GitHub repo README for install instructions and features
- bizbrain-os.com for public-facing messaging

## Important Rules

- ALWAYS confirm before posting the first reply in a session
- Match the energy of the conversation (don't over-reply to brief comments)
- Never argue or get defensive
- If someone has a legitimate criticism, acknowledge it honestly
- Don't reply to every single comment - be selective and natural
- Space out engagement (don't reply to 10 things in 30 seconds)
- Track which posts have been engaged to avoid double-replying
