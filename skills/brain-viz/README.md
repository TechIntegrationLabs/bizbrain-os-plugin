# brain-viz

3D interactive visualization for any BizBrain instance. Runs on top of `/graphify`.

## Files

| File | Purpose |
|------|---------|
| `SKILL.md` | Skill metadata + trigger description |
| `viewer-template.html` | Parameterized 3D viewer (Three.js + 3d-force-graph) |
| `build.py` | Build local viewer: label communities, render template, write sidecar JSON |
| `optimize.py` | Produce public deployment bundle: strip PII, bake positions, gzip |
| `deploy.py` | Push public bundle to Netlify |

## Sidecar JSON contract

The template fetches these at runtime so the same HTML works for any brain:

- `graph.json` — graph data (from graphify)
- `communities.json` — `{"0": "Community Label", ...}` keyed by community ID
- `brand.json` — `{"title", "subtitle", "palette", "nucleus_color", "god_rim_color"}`
- `brains.json` — multi-brain manifest for the selector dropdown

## Public mode transformations

When `optimize.py` runs, the public `index.html`:

1. Fetches `graph.json.gz` via `DecompressionStream('gzip')` instead of `graph.json`
2. Skips physics warmup (positions are pre-baked via Python ForceAtlas)
3. Uses weaker force params (`charge -40`, `link 20`) since layout is already good

## Output sizes (BB1 reference)

| Stage | Size |
|-------|------|
| Full graph.json | 10.7 MB |
| Stripped + capped to 3k nodes | 2.5 MB |
| Gzipped | **157 KB** |

## Integration with BizBrain OS plugin

Synced to `bizbrain-os-plugin/skills/brain-viz/` + command at `bizbrain-os-plugin/commands/brain-viz.md`.
Plugin users get `/brain-viz` automatically after plugin version bump.
