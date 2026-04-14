#!/usr/bin/env python3
"""brain-viz optimize — produces a public-ready, fast-loading deployment bundle.

Pipeline:
  1. Strip sensitive fields from graph.json (source_file path, source_location, rationale_id).
  2. Collapse very low-degree leaf nodes (optional).
  3. Bake 3D positions via a fast force-directed layout (Fruchterman-Reingold in 3D).
  4. Gzip the graph JSON.
  5. Generate public/index.html based on viewer-template.html with optimized boot-up logic.
  6. Drop netlify.toml with caching headers.

Usage:
    python optimize.py <brain-path> [--strip-level 1|2] [--max-nodes N]
"""
from __future__ import annotations
import argparse
import gzip
import json
import math
import random
import shutil
import sys
from pathlib import Path

SKILL_DIR = Path(__file__).parent
TEMPLATE = SKILL_DIR / 'viewer-template.html'

# Fields we remove from public graph
SENSITIVE_NODE_FIELDS = (
    'source_file', 'source_location', 'source_url',
    'author', 'contributor', 'captured_at', 'rationale_id',
    'source_path', 'source_file_path',
)
SENSITIVE_EDGE_FIELDS = (
    'source_file', 'source_location', 'source_url', 'confidence_score', 'weight',
)


def strip_fields(graph: dict, strip_level: int) -> dict:
    """Remove sensitive fields from node and edge dicts. strip_level 1=minimal, 2=aggressive."""
    for n in graph.get('nodes', []):
        for k in SENSITIVE_NODE_FIELDS:
            n.pop(k, None)
        if strip_level >= 2:
            # Even more aggressive — drop file_type granular details
            if 'metadata' in n:
                n.pop('metadata', None)
    for e in graph.get('links', graph.get('edges', [])):
        for k in SENSITIVE_EDGE_FIELDS:
            e.pop(k, None)
    return graph


def cap_nodes(graph: dict, max_nodes: int) -> dict:
    """Keep highest-degree nodes + their neighbors, drop the rest."""
    nodes = graph.get('nodes', [])
    links = graph.get('links', graph.get('edges', []))
    if len(nodes) <= max_nodes:
        return graph
    deg: dict[str, int] = {}
    for l in links:
        s = l.get('source'); t = l.get('target')
        if isinstance(s, dict): s = s.get('id')
        if isinstance(t, dict): t = t.get('id')
        deg[s] = deg.get(s, 0) + 1
        deg[t] = deg.get(t, 0) + 1
    top_ids = set(sorted(deg, key=lambda i: deg[i], reverse=True)[:max_nodes])
    graph['nodes'] = [n for n in nodes if n['id'] in top_ids]
    graph['links'] = [
        l for l in links
        if (l.get('source').get('id') if isinstance(l.get('source'), dict) else l.get('source')) in top_ids
        and (l.get('target').get('id') if isinstance(l.get('target'), dict) else l.get('target')) in top_ids
    ]
    print(f'  capped to {len(graph["nodes"])} nodes, {len(graph["links"])} links')
    return graph


def bake_positions_3d(graph: dict, iterations: int = 200) -> None:
    """Vectorized 3D Fruchterman-Reingold layout via numpy.

    Uses O(n^2) repulsion (fine up to ~5000 nodes in numpy) or sampled repulsion above that.
    Writes n['x'], n['y'], n['z'] into each node.
    """
    try:
        import numpy as np
    except ImportError:
        print('  WARNING: numpy not available, skipping position baking', file=sys.stderr)
        return

    nodes = graph['nodes']
    links = graph.get('links', graph.get('edges', []))
    n = len(nodes)
    if n == 0:
        return

    idx = {node['id']: i for i, node in enumerate(nodes)}
    scale = max(100.0, (n ** (1/3)) * 30)

    rng = np.random.default_rng(42)
    pos = (rng.random((n, 3)) - 0.5) * scale  # initial positions

    # Build edges as int arrays for vectorized ops
    edge_pairs = []
    for l in links:
        s = l.get('source'); t = l.get('target')
        if isinstance(s, dict): s = s.get('id')
        if isinstance(t, dict): t = t.get('id')
        if s in idx and t in idx and s != t:
            edge_pairs.append((idx[s], idx[t]))
    edge_pairs = np.array(edge_pairs, dtype=np.int32) if edge_pairs else np.zeros((0,2), dtype=np.int32)
    src_idx = edge_pairs[:, 0] if len(edge_pairs) else np.array([], dtype=np.int32)
    tgt_idx = edge_pairs[:, 1] if len(edge_pairs) else np.array([], dtype=np.int32)

    k = scale / (n ** 0.5) * 2.5
    k2 = k * k
    temperature = scale * 0.12

    use_sampled = n > 2500  # above this, O(n^2) is slow even in numpy
    SAMPLES = 80  # per-node repulsion samples

    for it in range(iterations):
        disp = np.zeros_like(pos)

        # REPULSION
        if use_sampled:
            # Each node compared against a random sample, vectorized per batch
            sample_idx = rng.integers(0, n, size=(n, SAMPLES))  # (n, SAMPLES)
            # For each i, gather positions of sampled j
            sampled_pos = pos[sample_idx]  # (n, SAMPLES, 3)
            diff = pos[:, None, :] - sampled_pos  # (n, SAMPLES, 3)
            d2 = (diff * diff).sum(-1) + 0.01
            f = k2 / d2 * (n / SAMPLES)  # scale up for sampling
            disp += (diff * (f / np.sqrt(d2))[..., None]).sum(1)
        else:
            # Full O(n^2) vectorized
            diff = pos[:, None, :] - pos[None, :, :]  # (n, n, 3)
            d2 = (diff * diff).sum(-1) + 0.01
            np.fill_diagonal(d2, np.inf)
            f = k2 / d2
            disp += (diff * (f / np.sqrt(d2))[..., None]).sum(1)

        # ATTRACTION along edges (vectorized)
        if len(edge_pairs):
            edge_diff = pos[src_idx] - pos[tgt_idx]
            ed = np.sqrt((edge_diff * edge_diff).sum(-1)) + 0.01
            ef = (ed * ed) / k
            force = edge_diff * (ef / ed)[:, None]
            np.add.at(disp, src_idx, -force)
            np.add.at(disp, tgt_idx, force)

        # Apply displacement with cooling
        d_mag = np.sqrt((disp * disp).sum(-1)) + 0.01
        limited = np.minimum(d_mag, temperature)
        pos += disp * (limited / d_mag)[:, None]

        temperature *= 0.96

        if (it + 1) % 25 == 0:
            print(f'  layout iter {it+1}/{iterations}')

    # Center + write positions
    pos -= pos.mean(axis=0)
    for i, node in enumerate(nodes):
        node['x'] = float(round(pos[i, 0], 1))
        node['y'] = float(round(pos[i, 1], 1))
        node['z'] = float(round(pos[i, 2], 1))


def write_public_html(brain: Path, public_dir: Path) -> None:
    """Render the template with public-mode tweaks (lazy bloom, skip warmup)."""
    html = TEMPLATE.read_text(encoding='utf-8')

    # Load brand
    brand_p = brain / 'graphify-out' / 'brand.json'
    if brand_p.exists():
        brand = json.loads(brand_p.read_text(encoding='utf-8'))
    else:
        brand = {'title': brain.name, 'subtitle': f'{brain.name} — 3D Neural Map'}

    html = html.replace('{{TITLE}}', brand.get('title', brain.name))
    html = html.replace('{{SUBTITLE}}', brand.get('subtitle', ''))
    html = html.replace('{{BRAIN_ID}}', brain.name.lower().replace(' ', '-'))

    # Public tweaks — switch to gzipped graph, skip physics warmup
    html = html.replace(
        "const resp=await fetch('graph.json');const rawData=await resp.json();",
        """// PUBLIC MODE: fetch gzipped graph, use pre-baked positions
const resp=await fetch('graph.json.gz');
const buf=await resp.arrayBuffer();
let rawData;
try{
  const ds=new DecompressionStream('gzip');
  const stream=new Response(new Blob([buf]).stream().pipeThrough(ds));
  rawData=await stream.json();
}catch(e){
  // Fallback: try uncompressed
  const r2=await fetch('graph.json');rawData=await r2.json();
}"""
    )

    # Skip warmup ticks since positions are pre-baked
    html = html.replace(
        '.d3AlphaDecay(0.012).d3VelocityDecay(0.25).warmupTicks(120).cooldownTicks(300)',
        '.d3AlphaDecay(0.03).d3VelocityDecay(0.4).warmupTicks(0).cooldownTicks(50)'
    )

    # Weaker forces since positions are already good
    html = html.replace(
        "Graph.d3Force('charge').strength(-150);Graph.d3Force('link').distance(35);",
        "Graph.d3Force('charge').strength(-40);Graph.d3Force('link').distance(20);"
    )

    (public_dir / 'index.html').write_text(html, encoding='utf-8')
    print(f'  public/index.html ({len(html)} chars)')


def write_netlify_toml(public_dir: Path) -> None:
    content = """[[headers]]
  for = "/*.json.gz"
  [headers.values]
    Content-Type = "application/json"
    Content-Encoding = "gzip"
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.json"
  [headers.values]
    Cache-Control = "public, max-age=3600"

[[headers]]
  for = "/*.html"
  [headers.values]
    Cache-Control = "public, max-age=300"
    X-Frame-Options = "SAMEORIGIN"

[build]
  publish = "."
"""
    (public_dir / 'netlify.toml').write_text(content, encoding='utf-8')
    print('  netlify.toml')


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('brain_path')
    ap.add_argument('--strip-level', type=int, default=1, choices=[1, 2])
    ap.add_argument('--max-nodes', type=int, default=0, help='0=keep all')
    ap.add_argument('--iterations', type=int, default=200)
    ap.add_argument('--no-bake', action='store_true', help='skip position baking')
    args = ap.parse_args()

    brain = Path(args.brain_path).resolve()
    out_dir = brain / 'graphify-out'
    graph_path = out_dir / 'graph.json'
    if not graph_path.exists():
        print(f'Error: no graph at {graph_path}', file=sys.stderr)
        return 1

    public_dir = out_dir / 'public'
    public_dir.mkdir(parents=True, exist_ok=True)

    print(f'brain-viz optimize: {brain.name}')
    print(f'  loading graph...')
    graph = json.loads(graph_path.read_text(encoding='utf-8'))
    orig_size = len(json.dumps(graph))
    n_nodes = len(graph.get('nodes', []))
    n_edges = len(graph.get('links', graph.get('edges', [])))
    print(f'  input: {n_nodes} nodes, {n_edges} edges, {orig_size:,} bytes')

    # Strip
    graph = strip_fields(graph, args.strip_level)
    print(f'  stripped sensitive fields (level {args.strip_level})')

    # Cap
    if args.max_nodes and n_nodes > args.max_nodes:
        graph = cap_nodes(graph, args.max_nodes)

    # Bake positions
    if not args.no_bake:
        print(f'  baking 3D positions ({args.iterations} iter)...')
        bake_positions_3d(graph, args.iterations)

    # Write uncompressed JSON + gzipped
    out_json = public_dir / 'graph.json'
    out_json.write_text(json.dumps(graph, separators=(',', ':')), encoding='utf-8')

    out_gz = public_dir / 'graph.json.gz'
    with open(out_json, 'rb') as fin, gzip.open(out_gz, 'wb', compresslevel=9) as fout:
        shutil.copyfileobj(fin, fout)

    new_size = out_json.stat().st_size
    gz_size = out_gz.stat().st_size
    print(f'  graph.json: {new_size:,} bytes ({new_size/orig_size*100:.0f}% of original)')
    print(f'  graph.json.gz: {gz_size:,} bytes ({gz_size/orig_size*100:.0f}% of original)')

    # Copy sidecar configs
    for sidecar in ('communities.json', 'brand.json', 'brains.json'):
        src = out_dir / sidecar
        if src.exists():
            shutil.copy(src, public_dir / sidecar)

    # Write HTML
    write_public_html(brain, public_dir)
    write_netlify_toml(public_dir)

    print(f'\nPublic bundle: {public_dir}')
    print(f'Deploy:  cd "{public_dir}" && netlify deploy --dir=. --prod')
    return 0


if __name__ == '__main__':
    sys.exit(main())
