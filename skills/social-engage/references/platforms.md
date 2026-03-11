# Platform Guide

## Skool Communities
- **URL pattern:** skool.com/[community-name]
- **Navigation:** Community tab shows posts, search bar at top
- **Post types:** General, Wins, Intros (NEW), Tools & Skills, Projects
- **Engagement:** Comments are threaded, Reply button on each comment
- **Rich text editor:** contenteditable div, use JS execCommand for reliable input
- **Submit reply:** Find Cancel button sibling Reply button via JS
- **Search:** Use search bar to find posts by keyword
- **Current communities:** Agent Architects (skool.com/agent-architects)

### Skool Reply Technique (Claude-in-Chrome)
1. Click "Reply" link on the target comment
2. Use JavaScript to find the contenteditable editor containing the @mention
3. Focus editor, collapse selection to end, use `document.execCommand('insertText', false, text)`
4. Submit via JS: find Cancel button parent, get sibling Reply button, click it

## LinkedIn
- Profile: linkedin.com/in/williamjwelsh/
- Use composio-social MCP or linkedin-scraper MCP
- Post types: articles, posts, comments
- Keep comments even shorter than Skool (2-3 sentences max)

## Discord
- BizBrain OS Discord: discord.gg/ph9D5gSgW3
- MCP: discord-mcp (user scope)
- Tools: discord_send, discord_read_messages, etc.

## General Platform Strategy
1. Search for mentions of your product/brand
2. Read the full thread context before replying
3. Prioritize: direct questions > potential leads > praise/thanks
4. Reply in voice (see voice-guide.md)
5. Don't spam - only reply where it makes sense
6. Like/upvote comments that engage with your content
