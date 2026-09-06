#!/usr/bin/env bash
# Upsert every skills/*/SKILL.md into user-level Grok, Cursor, Claude, and Codex dirs.
set -euo pipefail

root=$(cd "$(dirname "$0")/.." && pwd)
src="$root/skills"
home=${HOME:?HOME is unset}

grok="${GROK_HOME:-$home/.grok}/skills"
cursor="$home/.cursor/skills"
claude="${CLAUDE_CONFIG_DIR:-$home/.claude}/skills"
codex="${CODEX_HOME:-$home/.codex}/skills"

upsert() {
  local from=$1 to=$2
  mkdir -p "$(dirname "$to")"
  if [ -e "$to" ] || [ -L "$to" ]; then
    rm -rf "$to"
  fi
  ln -s "$from" "$to"
}

count=0
for dir in "$src"/*; do
  [ -d "$dir" ] || continue
  [ -f "$dir/SKILL.md" ] || continue
  name=$(basename "$dir")
  upsert "$dir" "$grok/$name"
  upsert "$dir" "$cursor/$name"
  upsert "$dir" "$claude/$name"
  upsert "$dir" "$codex/$name"
  printf '%s\n  grok    %s\n  cursor  %s\n  claude  %s\n  codex   %s\n' \
    "$name" "$grok/$name" "$cursor/$name" "$claude/$name" "$codex/$name"
  count=$((count + 1))
done

if [ "$count" -eq 0 ]; then
  echo "no skills in $src" >&2
  exit 1
fi
echo "$count skill(s) upserted"
