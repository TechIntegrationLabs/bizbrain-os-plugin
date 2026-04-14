---
name: brain-viz
description: >
  Generate a 3D interactive visualization of any BizBrain instance (BB1 or C² client brain).
  Runs graphify to build the knowledge graph, auto-labels communities, renders a full-featured
  Three.js neural explorer with timeline, search, brain selector, and animation presets.
  Optionally optimizes and deploys to Netlify for public/shareable viewing.
  Triggers on: "brain viz", "3d brain", "visualize my brain", "neural map", "knowledge graph 3d",
  "brain visualizer", "graph viewer", "deploy brain", "/brain-viz".
version: 1.0.0
---

# /brain-viz — 3D Brain Visualizer

Turns a BizBrain folder into a 3D navigable neural map. Built on top of `/graphify` with a
parameterized viewer template, auto-labeling, and optional Netlify deploy.

## Usage

```
/brain-viz                          # build + open locally at http://localhost:8847
/brain-viz <path>                   # target a specific brain directory
/brain-viz --update                 # re-run graphify incrementally, re-render viewer
/brain-viz --labels-only            # only re-label communities (cheap)
/brain-viz --public                 # build optimized public version (strip PII, gzip, bake positions)
/brain-viz --deploy [site-name]     # public build + push to Netlify
/brain-viz --port 8900              # custom local port
```

## What Gets Built

```
<brain>/graphify-out/
  graph.json                 # full graph data (internal)
  graph-3d.html              # interactive viewer (internal)
  communities.json           # human-labeled community names
  brand.json                 # palette + title + subtitle
  brains.json                # multi-brain manifest (auto-discovered siblings)
  public/                    # only created with --public or --deploy
    index.html                   # optimized viewer (lazy bloom, LOD rendering)
    graph.json.gz                # stripped + gzipped (~60% smaller)
    communities.json             # community labels
    brand.json                   # colors + title
    vendor/                      # self-hosted Three.js + 3d-force-graph
    netlify.toml                 # caching headers
```

## Steps on Invocation

**Step 1 — Detect brain root**

- If path arg provided, use it.
- Else, check CWD for `_meta.json`, `config.json`, or `c2-clients/<name>/`.
- Else, default to `C:\Users\Disruptors\Documents\Tech Integration Labs BB1\`.

Read brain metadata if it exists: `_meta.json` → `name`, `subtitle`, `brand`.

**Step 2 — Ensure graph is current**

```bash
python "${CLAUDE_PLUGIN_ROOT:-$HOME/.claude}/skills/brain-viz/build.py" <brain-path>
```

The build script:
1. Runs `/graphify` on the brain (or `--update` if manifest exists)
2. Auto-labels top 30 communities (heuristic from file paths + god nodes)
3. Writes `communities.json` and `brand.json` sidecar files
4. Copies the viewer template into `graphify-out/graph-3d.html`
5. Rebuilds `brains.json` by scanning sibling brains

**Step 3 — Serve or deploy**

- Default: start local HTTP server on port 8847 and open the URL in Chrome.
- With `--public`: run optimize.py to produce `graphify-out/public/`.
- With `--deploy`: also push `public/` to Netlify using the Netlify CLI.

## Public Optimization (what `--public` does)

1. **Strip** sensitive fields from graph.json: `source_file`, `source_location`, `rationale_id`.
2. **Collapse** low-degree leaf clusters (keep only top N per community).
3. **Bake positions** — compute layout offline with a fast 3D spring force, write x/y/z into nodes.
4. **Gzip** → `graph.json.gz` (~60–80% smaller).
5. **Self-host** Three.js + 3d-force-graph in `vendor/` (no CDN dependency).
6. **Viewer tweaks:**
   - Skip physics warmup (positions pre-baked)
   - Lazy-load bloom shader after first paint
   - LOD: low-degree nodes use simple sprite geometry
   - Service worker caches graph.json for repeat visits
7. **Netlify headers:** `immutable, max-age=31536000` on graph.json.gz.

Expected: <2s first paint, <3s interactive on broadband.

## Deploy to Netlify

```
/brain-viz --deploy my-brain-viewer
```

1. Builds public version.
2. Runs `netlify deploy --dir=graphify-out/public --prod` (uses Netlify CLI).
3. Creates or reuses a site named `my-brain-viewer`.
4. Prints the public URL.

Requires `netlify` CLI to be installed (`npm i -g netlify-cli`) and authenticated.

## Customization via brand.json

Drop `brand.json` in `<brain>/graphify-out/` or `<brain>/_brand.json` to customize:

```json
{
  "title": "Pair Dental Business Brain",
  "subtitle": "Client Intelligence — 3D Neural Map",
  "palette": ["#38bdf8","#a78bfa","#f472b6","#34d399","#fbbf24"],
  "nucleus_color": "#fbbf24",
  "god_rim_color": "#38bdf8"
}
```

## Integration with BizBrain OS Plugin

This skill ships with the BizBrain OS plugin under `skills/brain-viz/`. The plugin provides:
- `/brain-viz` command → `commands/brain-viz.md`
- Skill auto-discovery via `skills/brain-viz/SKILL.md`
- Template + scripts in `skills/brain-viz/`

To update across all installed instances, bump the plugin version and users will receive the
new template on next update.

## Honesty Rules

- Never fabricate community labels — use file-path evidence or leave generic "Module N".
- If graphify hasn't been run, say so and offer to run it — do not pretend a graph exists.
- For public deploys, always confirm the stripped fields list with the user before publishing.
