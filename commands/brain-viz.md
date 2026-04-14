---
name: brain-viz
description: Generate a 3D interactive visualization of any BizBrain instance. Runs graphify, auto-labels communities, renders Three.js neural explorer, optionally deploys to Netlify.
argument-hint: [path] [--update] [--labels-only] [--public] [--deploy [site-name]] [--port N]
---

# /brain-viz — 3D Brain Visualizer

Builds a 3D interactive map of a BizBrain knowledge graph with community detection, timeline
growth animation, search, multi-brain selector, and animation presets. Built on top of `/graphify`.

## Instructions

**You MUST automatically run the build. Do NOT just describe the steps — actually execute them.**

### Step 1: Locate the skill directory

```bash
SKILL_DIR=""
for dir in \
  "${CLAUDE_PLUGIN_ROOT}/skills/brain-viz" \
  "$HOME/.claude/skills/brain-viz" \
  "$HOME/Repos/bizbrain-os-plugin/skills/brain-viz"; do
  if [ -d "$dir" ] && [ -f "$dir/build.py" ]; then
    SKILL_DIR="$dir"
    break
  fi
done
if [ -z "$SKILL_DIR" ]; then
  echo "brain-viz skill not found. Check BizBrain OS plugin install."
  exit 1
fi
```

### Step 2: Determine the brain path

- If `$1` is provided and is a directory, use it.
- Else, check current working directory for a `graphify-out/graph.json` or `_meta.json`.
- Else, prompt the user for the brain path.

### Step 3: Run build

```bash
python "$SKILL_DIR/build.py" "<brain-path>"
```

If the graph.json does not exist yet, tell the user and offer to run `/graphify` first.

### Step 4: Handle flags

| Flag | Action |
|------|--------|
| `--labels-only` | Re-run labeling only: `python "$SKILL_DIR/build.py" "<brain>" --labels-only` |
| `--public` | After build, run: `python "$SKILL_DIR/optimize.py" "<brain>" --max-nodes 3000` |
| `--deploy [name]` | After `--public`, run: `python "$SKILL_DIR/deploy.py" "<brain>" --site-name <name>` |
| `--port N` | Start local server on custom port |

### Step 5: Serve and open

By default, start a local HTTP server on port 8847 and open the viewer in Chrome:

```bash
cd "<brain>/graphify-out"
python -m http.server 8847 &
sleep 1
# User can open http://localhost:8847/graph-3d.html
```

Report the URL to the user and offer to open it via the browser automation tools.

### Step 6: Summary

Tell the user:
- Node/edge/community counts
- Top god nodes
- Where the viewer is served
- For `--public`/`--deploy`: show bundle size and public URL

## Examples

```
/brain-viz                                    # build BB1 (if CWD is BB1) or prompt
/brain-viz c:/Users/Disruptors/c2-clients/pair-dental
/brain-viz --public                           # produce graphify-out/public/ bundle
/brain-viz --deploy bb1-brain-viewer          # deploy to Netlify
/brain-viz --labels-only                      # re-run community labeling only
```
