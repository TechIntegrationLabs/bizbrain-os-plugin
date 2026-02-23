#!/usr/bin/env bash
# BizBrain OS — Machine Scanner
# Discovers projects, documents, services, and tools on the machine.
# Output: structured text to stdout
# Usage: scanner.sh [profile-id]

set -euo pipefail

# Default scan paths (overridden by profile)
CODE_PATHS=("$HOME/Repos" "$HOME/Projects" "$HOME/Code" "$HOME/src")
DOC_PATHS=("$HOME/Documents")
RECENT_PATHS=("$HOME/Desktop" "$HOME/Downloads")

# --- Discover Code Projects ---
discover_projects() {
  for dir in "${CODE_PATHS[@]}"; do
    if [ -d "$dir" ]; then
      for project_dir in "$dir"/*/; do
        [ -d "$project_dir" ] || continue
        local name=$(basename "$project_dir")
        local has_git=false
        local last_commit=""
        local stack=""

        if [ -d "$project_dir/.git" ]; then
          has_git=true
          last_commit=$(git -C "$project_dir" log -1 --format="%ai" 2>/dev/null || echo "")
        fi

        # Detect stack
        if [ -f "$project_dir/package.json" ]; then
          stack="node"
          if grep -q '"next"' "$project_dir/package.json" 2>/dev/null; then stack="nextjs"; fi
          if grep -q '"react"' "$project_dir/package.json" 2>/dev/null; then stack="react"; fi
          if grep -q '"vue"' "$project_dir/package.json" 2>/dev/null; then stack="vue"; fi
        elif [ -f "$project_dir/Cargo.toml" ]; then stack="rust"
        elif [ -f "$project_dir/go.mod" ]; then stack="go"
        elif [ -f "$project_dir/requirements.txt" ] || [ -f "$project_dir/pyproject.toml" ]; then stack="python"
        fi

        [ -n "$stack" ] || [ "$has_git" = true ] && echo "PROJECT|$name|$project_dir|$has_git|$last_commit|$stack"
      done
    fi
  done
}

# --- Discover Services & Tools ---
discover_services() {
  # Check Claude Code config
  [ -f "$HOME/.claude.json" ] && echo "SERVICE|claude-config|$HOME/.claude.json"
  [ -f "$HOME/.claude/settings.json" ] && echo "SERVICE|claude-settings|$HOME/.claude/settings.json"

  # Check for common tools
  command -v gh &>/dev/null && echo "TOOL|gh|$(gh auth status &>/dev/null && echo "authenticated" || echo "not-authenticated")"
  command -v node &>/dev/null && echo "TOOL|node|$(node -v 2>/dev/null || echo "unknown")"
  command -v git &>/dev/null && echo "TOOL|git|$(git --version 2>/dev/null | head -1 || echo "unknown")"
  command -v python3 &>/dev/null && echo "TOOL|python|$(python3 --version 2>/dev/null || echo "unknown")"
  command -v cargo &>/dev/null && echo "TOOL|cargo|$(cargo --version 2>/dev/null | head -1 || echo "unknown")"
  command -v go &>/dev/null && echo "TOOL|go|$(go version 2>/dev/null | head -1 || echo "unknown")"
}

# --- Output ---
echo "=== PROJECTS ==="
discover_projects 2>/dev/null || true
echo "=== SERVICES ==="
discover_services 2>/dev/null || true
echo "=== DONE ==="
