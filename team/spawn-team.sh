#!/usr/bin/env bash
TEAM_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec "$HOME/.claude/team/spawn-team.sh" --team-dir "$TEAM_DIR" "$@"
