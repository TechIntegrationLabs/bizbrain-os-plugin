---
name: Frontend Studio
description: >
  Unified frontend design intelligence — orchestrates UI UX Pro Max, frontend-design,
  page-design-guide MCP, 21st.dev Magic MCP, and Google Stitch MCP for comprehensive
  design workflows. Triggers on: /design, "design this", "UI for", "build frontend",
  "landing page", "dashboard design", "component library", "design system",
  "make it beautiful", "stitch", "redesign site", "generate screens".
version: 2.0.0
---

# Frontend Studio

You orchestrate all available design tools for frontend work.

## Brain Location

Check: BIZBRAIN_PATH env → ~/bizbrain-os/
Design tools docs: `Knowledge/systems/ui-ux-design-tools.md`

## Available Design Tools

### 1. UI UX Pro Max (Plugin Skill)
- Searchable design database: 67 styles, 96 palettes, 57 fonts, 25 charts
- Invoke with: `/ui-ux-pro-max` or auto-triggers on UI tasks
- CLI: `python3 <brain>/Tools/ui-ux-pro-max/scripts/search.py "<query>" --domain <domain>`

### 2. Frontend Design (Plugin Skill)
- Distinctive aesthetic choices, bold typography/colors
- Invoke with: `/frontend-design`
- Best for: creative projects, landing pages, portfolios

### 3. Page Design Guide (MCP)
- Real-time design guidance via MCP tools
- Tools: `get_layout_patterns`, `get_color_guidance`, `get_typography_guidance`,
  `get_component_guidance`, `get_responsive_guidance`, `get_accessibility_guidance`,
  `get_animation_guidance`, `get_section_guidance`, `get_modern_trends`,
  `get_modern_palettes`, `get_inspiration_by_mood`, `get_holistic_design_review`

### 4. 21st.dev Magic (MCP)
- AI-generated UI components from natural language
- Prefix requests with `/ui` for component generation
- Generates React/Tailwind/shadcn components

### 5. Google Stitch (MCP)
- AI-powered UI design generation from Google Labs (Gemini-powered)
- Generates high-fidelity screens from text prompts, images, or URLs
- Exports clean HTML/CSS code, Figma-compatible designs, and DESIGN.md tokens
- Free: 350 Standard / 50 Experimental generations per month
- MCP tools available:
  - `generate_screen_from_text` — generate a screen from a text prompt
  - `fetch_screen_code` — download HTML/CSS code for a screen
  - `fetch_screen_image` — download high-res screenshot of a screen
  - `extract_design_context` — extract design DNA (fonts, colors, layouts)
  - `create_project` — create a new Stitch workspace
  - `list_projects` — list all Stitch projects
  - `list_screens` — list screens in a project
  - `get_project` — get project metadata
  - `get_screen` — get screen metadata
- Best for: full-page designs, site redesigns, multi-screen flows, design exploration
- Invoke with: `/design stitch <prompt>` or auto-routes on "redesign", "generate screens"

#### Stitch Prompt Best Practices
- **Be specific**: mention layout, color tone, target device, product type
- **Use UI/UX terms**: "hero section", "card layout", "CTA", "navigation bar"
- **Descriptive adjectives matter**: "premium", "minimalist", "vibrant" change output dramatically
- **One change per refinement**: combining multiple changes resets layouts
- **Zoom-out-zoom-in**: set context (product, user, objective) then describe the specific screen
- **Combine text + reference images**: upload competitor screenshots with "make it more modern"

#### Stitch Design-to-Code Workflow
1. Generate screens in Stitch (via MCP or web UI)
2. Use `extract_design_context` to get design DNA
3. Use `fetch_screen_code` to get HTML/CSS for each screen
4. Export DESIGN.md for consistent token usage across codebase
5. Pipe into Claude Code for component implementation
6. Run Page Design Guide `get_holistic_design_review` for quality audit

## Workflow

When a user asks for frontend/design work:

1. **Understand the project type** — SaaS, landing page, dashboard, e-commerce, portfolio, mobile
2. **Gather design direction** — Ask about mood, style preferences, brand colors if not specified
3. **Choose tool path based on task:**
   - **Full site design/redesign** → Start with Stitch (generate screens) + Page Design Guide (review)
   - **Component generation** → 21st.dev Magic + Frontend Design
   - **Design system research** → UI UX Pro Max + Page Design Guide
   - **Design audit/review** → Page Design Guide holistic review
   - **Quick aesthetic refresh** → Frontend Design + modern palette
4. **Research phase:**
   - Use Page Design Guide MCP for layout patterns and section guidance
   - Use UI UX Pro Max to search relevant styles, palettes, and typography
   - Use Stitch `extract_design_context` to analyze existing sites
5. **Design generation:**
   - Use Stitch to generate full-page designs from detailed prompts
   - Use 21st.dev Magic for individual component generation
   - Apply Frontend Design skill for distinctive aesthetic choices
6. **Design system setup:**
   - Define colors, typography, spacing based on research
   - Use `get_modern_palettes` for trending options
   - Export Stitch DESIGN.md for token consistency
7. **Code extraction:**
   - Use Stitch `fetch_screen_code` for HTML/CSS
   - Use 21st.dev Magic for React/Tailwind components
   - Merge into project codebase
8. **Review:**
   - Run `get_holistic_design_review` for full audit
   - Check `get_accessibility_guidance` for a11y compliance

## Quick Commands

| Request | Action |
|---------|--------|
| "Make it beautiful" | Apply Frontend Design + modern palette + distinctive fonts |
| "Design a dashboard" | UI UX Pro Max (SaaS style) + Page Design Guide (layout) |
| "Landing page for X" | Full workflow: research → design system → components |
| "Review the design" | Page Design Guide holistic review + accessibility audit |
| "Generate a component" | Route to 21st.dev Magic MCP |
| "Redesign the site" | Stitch full-page generation + extract code + design review |
| "Stitch this" | Route to Stitch MCP for screen generation |
| "Design screens for X" | Stitch multi-screen generation with connected flow |
| "Extract design from URL" | Stitch extract_design_context from live site |
| "Export design system" | Stitch DESIGN.md export + Page Design Guide tokens |

## Tool Selection Guide

| Need | Primary Tool | Supporting Tools |
|------|-------------|-----------------|
| Full page/site design | **Stitch** | Page Design Guide (review) |
| Individual components | **21st.dev Magic** | Frontend Design (aesthetic) |
| Design research/trends | **UI UX Pro Max** | Page Design Guide (guidance) |
| Design audit/review | **Page Design Guide** | All (as reference) |
| Creative aesthetics | **Frontend Design** | UI UX Pro Max (palettes) |
| Site analysis/extraction | **Stitch** | Page Design Guide (comparison) |
| Design tokens/system | **Stitch** (DESIGN.md) | UI UX Pro Max (font/color DB) |

## Integration with Content Pipeline

When building frontends for brain projects:
- Check `Projects/<name>/_context/` for brand guidelines
- Check `Clients/<name>/_context/` for client preferences
- Store generated design systems in project's `_context/design-system.md`
- Store Stitch DESIGN.md exports in project's `_context/stitch-design.md`
- Link Stitch project IDs in project's `_context/stitch-project.json`
