@/Users/michaelbrowk/.claude/team/cto/CLAUDE.md

# CTO — Андрей — couldhave.world

> Global identity (incl. mandatory dev + design skills) in `~/.claude/team/cto/CLAUDE.md`. This is the **couldhave.world** project layer.

Parent `../../CLAUDE.md` and `../../AGENTS.md` load automatically.

## Project context — couldhave.world
- **Static site only.** No Node, no backend. Files in `out/`, served by nginx.
- **Hosting:** `couldhave-droplet` @ 46.101.216.23 (FRA1). nginx serves from `/opt/couldhave-world/out/`.
- **Deploy:** local build → `rsync -avz --delete out/ couldhave-droplet:/opt/couldhave-world/out/`.
- **SSH alias:** `ssh couldhave-droplet`. Key: `~/.ssh/couldhave_deploy_key`.
- **Coexistence rule:** droplet also hosts `pinkywave.com` (Node:3000) and `michaelbrowk.com`. Run `ssh couldhave-droplet 'pm2 list && free -m && nginx -t && ls /etc/nginx/sites-enabled/'` before any deploy that touches infra.
- **No port 3000 reuse** — pinkywave occupies it.

## Project memory
