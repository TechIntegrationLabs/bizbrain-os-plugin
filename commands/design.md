---
name: design
description: Frontend design studio — orchestrate all design tools (UI UX Pro Max, page-design-guide, 21st.dev Magic, frontend-design, Google Stitch)
user_invocable: true
---

# /design Command

Route to the `frontend-studio` skill for unified design intelligence.

## Usage

```
/design                    # Show available design tools and workflow
/design <description>      # Start design workflow for described project
/design review             # Run holistic design review on current project
/design component <desc>   # Generate a specific component via 21st.dev Magic
/design palette <mood>     # Get color palette recommendations
/design fonts <style>      # Get typography recommendations
/design stitch <prompt>    # Generate full-page UI designs via Google Stitch
/design stitch extract <url>  # Extract design DNA from a live site
/design stitch screens     # List screens in current Stitch project
/design stitch code <id>   # Get HTML/CSS code for a Stitch screen
/design stitch export      # Export DESIGN.md from Stitch project
```

## Routing

- Invoke the `frontend-studio` skill
- If user says "stitch", "redesign", "generate screens", or "design pages" → route to Stitch MCP
- If user says "extract design" or "analyze site" → route to Stitch `extract_design_context`
- If user says "component" or "generate" → route to 21st.dev Magic MCP
- If user says "review" or "audit" → use Page Design Guide MCP holistic review
- If user says "palette" or "colors" → use UI UX Pro Max color search + Page Design Guide
- Otherwise, run full design workflow from the skill (auto-selects best tool for the task)
