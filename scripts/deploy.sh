#!/usr/bin/env bash
# Publish a checked static export. Prior releases remain available for rollback.
set -euo pipefail
remote=${1:-couldhave-droplet}
for file in out/en/index.html out/es/index.html out/de/index.html out/fr/index.html out/og.png; do
  test -s "$file" || { echo "Missing build output: $file" >&2; exit 1; }
done
revision=$(git rev-parse --short=12 HEAD)
release="$(date -u +%Y%m%dT%H%M%SZ)-${revision}-${RANDOM}"
base=/opt/couldhave-world
ssh "$remote" "mkdir -p '$base/releases/$release'"
rsync -az --checksum out/ "$remote:$base/releases/$release/"
ssh "$remote" bash -s -- "$release" <<'REMOTE'
set -Eeuo pipefail
release=$1
[[ "$release" =~ ^[A-Za-z0-9._-]+$ ]] || exit 1
# Override only for the isolated promotion tests; production uses this default.
base=${DEPLOY_BASE:-/opt/couldhave-world}
exec 9>"$base/deploy.lock"
flock -x 9
next="$base/out.next-$release"
rollback="$base/out.rollback-$release"
backup="$base/out-before-$release"
verification=""
previous_kind=none
previous_target=""
promotion_started=0

finish() {
  status=$?
  trap - EXIT HUP INT TERM
  set +e
  if [ "$status" -ne 0 ] && [ "$promotion_started" -eq 1 ]; then
    echo "Release verification failed; restoring the previous export." >&2
    if [ "$previous_kind" = symlink ]; then
      ln -s -- "$previous_target" "$rollback" && mv -Tf -- "$rollback" "$base/out"
      restore_status=$?
    elif [ "$previous_kind" = directory ]; then
      restore_status=0
      if [ -d "$backup" ]; then
        if [ -L "$base/out" ]; then rm -- "$base/out"; fi
        mv -- "$backup" "$base/out"
        restore_status=$?
      fi
    else
      restore_status=0
      if [ -L "$base/out" ] && [ "$(readlink "$base/out")" = "releases/$release" ]; then
        rm -- "$base/out"
        restore_status=$?
      fi
    fi
    if [ "$restore_status" -ne 0 ]; then
      echo "ROLLBACK FAILED: previous export remains at $previous_target or $backup." >&2
    fi
  fi
  rm -f -- "$next" "$rollback"
  if [ -n "$verification" ]; then rm -rf -- "$verification"; fi
  exit "$status"
}
trap finish EXIT
trap 'exit 129' HUP
trap 'exit 130' INT
trap 'exit 143' TERM

for path in en/index.html es/index.html de/index.html fr/index.html og.png; do
  test -s "$base/releases/$release/$path"
done
if [ -L "$base/out" ]; then
  previous_kind=symlink
  previous_target=$(readlink "$base/out")
elif [ -d "$base/out" ]; then
  previous_kind=directory
  test ! -e "$backup" && test ! -L "$backup"
elif [ -e "$base/out" ]; then
  echo "Refusing to replace an unexpected non-directory export." >&2
  exit 1
fi
verification=$(mktemp -d "$base/.verify-$release-XXXXXX")
ln -s -- "releases/$release" "$next"
promotion_started=1
if [ "$previous_kind" = directory ]; then
  mv -- "$base/out" "$backup"
fi
mv -Tf -- "$next" "$base/out"

# Verify nginx and TLS while the deployment lock is still held. No CDN or
# external proxy may answer this check in place of the droplet being updated.
for path in en/index.html es/index.html de/index.html fr/index.html og.png; do
  route=${path%index.html}
  received="$verification/${path//\//_}"
  curl --fail --silent --show-error --connect-timeout 5 --max-time 30 \
    --noproxy '*' --resolve couldhave.world:443:127.0.0.1 \
    "https://couldhave.world/$route" -o "$received"
  if ! cmp -s "$base/releases/$release/$path" "$received"; then
    echo "Served bytes do not match the staged export: $path" >&2
    exit 1
  fi
done
printf 'Published and verified release: %s\n' "$release"
REMOTE
