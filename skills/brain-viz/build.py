#!/usr/bin/env python3
"""brain-viz build — assembles 3D viewer for a BizBrain instance.

Usage:
    python build.py <brain-path> [--update] [--labels-only]

Produces:
    <brain>/graphify-out/graph-3d.html      parameterized viewer
    <brain>/graphify-out/communities.json   community labels
    <brain>/graphify-out/brand.json         brand config
    <brain>/graphify-out/brains.json        multi-brain manifest
"""
from __future__ import annotations
import argparse
import json
import sys
from collections import Counter
from pathlib import Path

SKILL_DIR = Path(__file__).parent
TEMPLATE = SKILL_DIR / 'viewer-template.html'


def load_brain_meta(brain: Path) -> dict:
    """Read brain metadata from _meta.json, config.json, or infer from dirname."""
    for name in ('_meta.json', 'config.json', '_internal/config.json', '_brand.json'):
        p = brain / name
        if p.exists():
            try:
                return json.loads(p.read_text(encoding='utf-8'))
            except Exception:
                pass
    # Fallback: use directory name
    title = brain.name.replace('-', ' ').replace('_', ' ').title()
    return {'name': title, 'display_name': title}


def derive_brand(meta: dict, brain: Path) -> dict:
    """Build brand.json content: palette, colors, title, subtitle."""
    title = meta.get('display_name') or meta.get('name') or meta.get('business_name') or brain.name
    subtitle = meta.get('subtitle') or f'{title} — 3D Neural Map'
    palette = meta.get('palette') or [
        '#38bdf8','#a78bfa','#f472b6','#34d399','#fbbf24','#fb923c','#f87171','#818cf8',
        '#2dd4bf','#e879f9','#a3e635','#60a5fa','#c084fc','#fb7185','#4ade80','#facc15',
        '#f97316','#ef4444','#8b5cf6','#06b6d4','#10b981','#ec4899','#f59e0b','#6366f1','#14b8a6'
    ]
    return {
        'title': title,
        'subtitle': subtitle,
        'palette': palette,
        'nucleus_color': meta.get('nucleus_color', '#fbbf24'),
        'god_rim_color': meta.get('god_rim_color', '#38bdf8'),
    }


def label_communities(graph_path: Path, top_n: int = 40) -> dict:
    """Heuristic auto-labeling of top communities by frequent token + most-connected node."""
    data = json.loads(graph_path.read_text(encoding='utf-8'))
    nodes = data.get('nodes', [])

    # Group nodes by community
    by_comm: dict[int, list[dict]] = {}
    for n in nodes:
        c = n.get('community', -1)
        if c < 0:
            continue
        by_comm.setdefault(c, []).append(n)

    # Rank communities by size, take top N
    ranked = sorted(by_comm.items(), key=lambda kv: len(kv[1]), reverse=True)[:top_n]

    # Count degrees to find hub nodes
    deg: Counter = Counter()
    for e in data.get('links', []):
        s = e.get('source'); t = e.get('target')
        if isinstance(s, dict): s = s.get('id')
        if isinstance(t, dict): t = t.get('id')
        deg[s] += 1
        deg[t] += 1

    labels: dict[int, str] = {}
    for cid, members in ranked:
        # Label = the hub node's label, or most common token across member labels
        sorted_members = sorted(members, key=lambda n: deg.get(n['id'], 0), reverse=True)
        hub = sorted_members[0]
        hub_label = hub.get('label') or hub.get('id', '')

        # Extract tokens to find shared theme
        tokens: Counter = Counter()
        for m in members[:50]:
            label = (m.get('label') or m.get('id') or '').lower()
            for tok in label.replace('/', ' ').replace('_', ' ').replace('-', ' ').replace('.', ' ').split():
                if len(tok) >= 4 and not tok.isdigit():
                    tokens[tok] += 1
        common = [tok for tok, cnt in tokens.most_common(3) if cnt >= 2]

        # Prefer hub label if distinctive, else common tokens, else generic
        if len(hub_label) < 40 and not hub_label.islower():
            labels[cid] = hub_label
        elif common:
            labels[cid] = ' '.join(w.capitalize() for w in common[:2])
        else:
            labels[cid] = f'Module {cid}'
    return labels


def render_viewer(brain: Path, brand: dict) -> None:
    """Fill template placeholders and write graph-3d.html."""
    html = TEMPLATE.read_text(encoding='utf-8')
    brain_id = brain.name.lower().replace(' ', '-').replace('_', '-')
    html = html.replace('{{TITLE}}', brand['title'])
    html = html.replace('{{SUBTITLE}}', brand['subtitle'])
    html = html.replace('{{BRAIN_ID}}', brain_id)
    out = brain / 'graphify-out' / 'graph-3d.html'
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(html, encoding='utf-8')
    print(f'  graph-3d.html ({len(html)} chars)')


def discover_sibling_brains(brain: Path) -> list[dict]:
    """Find other brains near this one (parent dir + c2-clients)."""
    brains = []
    # Self
    self_graph = brain / 'graphify-out' / 'graph.json'
    if self_graph.exists():
        data = json.loads(self_graph.read_text(encoding='utf-8'))
        brains.append({
            'id': brain.name.lower().replace(' ', '-'),
            'name': brain.name.replace('-', ' ').title(),
            'subtitle': f'{brain.name} — 3D Neural Map',
            'path': 'graph.json',
            'has_graph': True,
            'nodes': len(data.get('nodes', [])),
        })
    # Siblings in parent
    for sib in brain.parent.iterdir() if brain.parent.exists() else []:
        if sib == brain or not sib.is_dir() or sib.name.startswith('.'):
            continue
        g = sib / 'graphify-out' / 'graph.json'
        if g.exists():
            try:
                d = json.loads(g.read_text(encoding='utf-8'))
                brains.append({
                    'id': sib.name.lower().replace(' ', '-'),
                    'name': sib.name.replace('-', ' ').title(),
                    'subtitle': f'{sib.name} — 3D Neural Map',
                    'path': str(g).replace('\\', '/'),
                    'has_graph': True,
                    'nodes': len(d.get('nodes', [])),
                })
            except Exception:
                pass
    # c2-clients siblings (standard location)
    c2_root = Path('C:/Users/Disruptors/c2-clients')
    if c2_root.exists() and brain.parent != c2_root:
        for cd in sorted(c2_root.iterdir()):
            if not cd.is_dir() or cd.name.startswith('.'):
                continue
            g = cd / 'graphify-out' / 'graph.json'
            if g.exists():
                try:
                    d = json.loads(g.read_text(encoding='utf-8'))
                    brains.append({
                        'id': f'c2-{cd.name}',
                        'name': cd.name.replace('-', ' ').title(),
                        'subtitle': f'C² Client — {cd.name}',
                        'path': str(g).replace('\\', '/'),
                        'has_graph': True,
                        'nodes': len(d.get('nodes', [])),
                    })
                except Exception:
                    pass
    return brains


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('brain_path')
    ap.add_argument('--update', action='store_true')
    ap.add_argument('--labels-only', action='store_true')
    args = ap.parse_args()

    brain = Path(args.brain_path).resolve()
    if not brain.exists():
        print(f'Error: {brain} does not exist', file=sys.stderr)
        return 1

    out_dir = brain / 'graphify-out'
    out_dir.mkdir(parents=True, exist_ok=True)

    graph_path = out_dir / 'graph.json'
    if not graph_path.exists() and not args.labels_only:
        print(f'Error: no graph.json at {graph_path}. Run /graphify first.', file=sys.stderr)
        return 1

    print(f'brain-viz: building for {brain.name}')

    meta = load_brain_meta(brain)
    brand = derive_brand(meta, brain)
    (out_dir / 'brand.json').write_text(json.dumps(brand, indent=2), encoding='utf-8')
    print(f'  brand.json  ({brand["title"]})')

    if graph_path.exists():
        labels = label_communities(graph_path)
        labels_json = {str(k): v for k, v in labels.items()}
        (out_dir / 'communities.json').write_text(
            json.dumps(labels_json, indent=2), encoding='utf-8')
        print(f'  communities.json ({len(labels)} labels)')

    if args.labels_only:
        return 0

    render_viewer(brain, brand)

    brains = discover_sibling_brains(brain)
    (out_dir / 'brains.json').write_text(json.dumps(brains, indent=2), encoding='utf-8')
    print(f'  brains.json ({len(brains)} brains)')

    print(f'\nOpen: {out_dir / "graph-3d.html"}')
    print(f'Serve: cd "{out_dir}" && python -m http.server 8847')
    return 0


if __name__ == '__main__':
    sys.exit(main())
