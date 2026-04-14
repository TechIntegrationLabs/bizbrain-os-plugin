#!/usr/bin/env python3
"""brain-viz deploy — push public bundle to Netlify.

Usage:
    python deploy.py <brain-path> [--site-name <name>] [--alias <preview-name>]

Requires: `netlify` CLI installed and authenticated (`netlify login`).
If the site doesn't exist, creates a new one.
"""
from __future__ import annotations
import argparse
import subprocess
import sys
from pathlib import Path


def check_netlify() -> bool:
    try:
        r = subprocess.run(['netlify', '--version'], capture_output=True, text=True, timeout=10)
        return r.returncode == 0
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return False


def deploy(public_dir: Path, site_name: str | None, prod: bool) -> int:
    cmd = ['netlify', 'deploy', f'--dir={public_dir}']
    if prod:
        cmd.append('--prod')
    if site_name:
        cmd += ['--site', site_name]
    print(f'Running: {" ".join(cmd)}')
    r = subprocess.run(cmd)
    return r.returncode


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('brain_path')
    ap.add_argument('--site-name', default=None)
    ap.add_argument('--preview', action='store_true', help='deploy draft, not prod')
    args = ap.parse_args()

    brain = Path(args.brain_path).resolve()
    public_dir = brain / 'graphify-out' / 'public'
    if not public_dir.exists():
        print(f'Error: no public/ dir at {public_dir}. Run optimize.py first.', file=sys.stderr)
        return 1

    if not check_netlify():
        print('Error: `netlify` CLI not found. Install with: npm i -g netlify-cli', file=sys.stderr)
        print('Then login: netlify login', file=sys.stderr)
        return 1

    return deploy(public_dir, args.site_name, not args.preview)


if __name__ == '__main__':
    sys.exit(main())
