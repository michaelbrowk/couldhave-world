#!/usr/bin/env bash
# Exercise the real remote promotion block in temporary directories only.
set -euo pipefail
cd "$(dirname "$0")/../.."
root=$(mktemp -d "${TMPDIR:-/tmp}/couldhave-deploy-test.XXXXXX")
trap 'rm -rf "$root"' EXIT
mkdir "$root/bin"
python3 - "$root" <<'PY'
from pathlib import Path
import sys
root=Path(sys.argv[1])
source=Path('scripts/deploy.sh').read_text()
remote=source.split("<<'REMOTE'\n",1)[1].split('\nREMOTE',1)[0]
(root/'promote.sh').write_text(remote+'\n')
# Darwin lacks Linux flock and mv -T. These shims reproduce only the Linux
# primitives used by the production script, keeping the promotion code intact.
(root/'bin/flock').write_text('''#!/usr/bin/env python3
import fcntl,sys
fcntl.flock(int(sys.argv[-1]),fcntl.LOCK_EX)
''')
(root/'bin/mv').write_text('''#!/usr/bin/env python3
import os,sys
if '-Tf' in sys.argv:
    os.replace(sys.argv[-2],sys.argv[-1])
else:
    os.execv('/bin/mv',['/bin/mv']+sys.argv[1:])
''')
(root/'bin/curl').write_text('''#!/usr/bin/env python3
import fcntl,os,pathlib,shutil,signal,sys
base=pathlib.Path(os.environ['DEPLOY_BASE'])
# A health check outside the promotion lock is a regression.
with (base/'deploy.lock').open('a') as lock:
    try:
        fcntl.flock(lock,fcntl.LOCK_EX|fcntl.LOCK_NB)
    except BlockingIOError:
        pass
    else:
        sys.exit('Verification ran without the deployment lock')
args=sys.argv[1:]
assert '--resolve' in args and args[args.index('--resolve')+1]=='couldhave.world:443:127.0.0.1'
mode=os.environ.get('CHECK_MODE','ok')
if mode=='http-failure':sys.exit(22)
if mode=='interrupt':
    os.kill(os.getppid(),signal.SIGTERM)
    sys.exit(1)
url=next(x for x in args if x.startswith('https://'))
relative=url.removeprefix('https://couldhave.world/')
if relative.endswith('/'):relative+='index.html'
out=pathlib.Path(args[args.index('-o')+1])
if mode=='wrong-bytes':out.write_text('Wrong release')
else:shutil.copyfile(base/'out'/relative,out)
''')
for file in (root/'bin').iterdir():file.chmod(0o755)
PY

fixture() {
  base="$root/$1"
  mkdir -p "$base/releases/old" "$base/releases/candidate"
  for version in old candidate; do
    for locale in en es de fr; do
      mkdir -p "$base/releases/$version/$locale"
      printf '%s-%s\n' "$version" "$locale" > "$base/releases/$version/$locale/index.html"
    done
    printf '%s-image\n' "$version" > "$base/releases/$version/og.png"
  done
  if [ "$2" = symlink ]; then ln -s releases/old "$base/out";
  else cp -R "$base/releases/old" "$base/out"; fi
}
run_promotion() {
  DEPLOY_BASE="$base" CHECK_MODE="$1" PATH="$root/bin:$PATH" bash "$root/promote.sh" candidate
}
assert_clean() {
  test ! -e "$base/out.next-candidate"
  test ! -L "$base/out.next-candidate"
  test ! -e "$base/out.rollback-candidate"
  test -d "$base/releases/old"
  test -d "$base/releases/candidate"
  test -z "$(find "$base" -maxdepth 1 -name '.verify-*' -print)"
}

fixture symlink-success symlink
# A leftover staging link from another attempt must not block this release.
ln -s releases/old "$base/out.next-interrupted"
run_promotion ok
test "$(readlink "$base/out")" = releases/candidate
assert_clean

fixture symlink-http-failure symlink
if run_promotion http-failure; then echo 'Expected HTTP failure' >&2; exit 1; fi
test "$(readlink "$base/out")" = releases/old
cmp "$base/out/en/index.html" "$base/releases/old/en/index.html"
assert_clean

fixture legacy-success directory
run_promotion ok
test "$(readlink "$base/out")" = releases/candidate
cmp "$base/out-before-candidate/en/index.html" "$base/releases/old/en/index.html"
assert_clean

fixture legacy-wrong-bytes directory
if run_promotion wrong-bytes; then echo 'Expected byte mismatch' >&2; exit 1; fi
test -d "$base/out" && test ! -L "$base/out"
cmp "$base/out/en/index.html" "$base/releases/old/en/index.html"
assert_clean

fixture legacy-interrupt directory
if run_promotion interrupt; then echo 'Expected interrupted deployment' >&2; exit 1; fi
test -d "$base/out" && test ! -L "$base/out"
cmp "$base/out/en/index.html" "$base/releases/old/en/index.html"
assert_clean

fixture incomplete-upload symlink
rm "$base/releases/candidate/fr/index.html"
if run_promotion ok; then echo 'Expected incomplete upload failure' >&2; exit 1; fi
test "$(readlink "$base/out")" = releases/old
assert_clean
printf 'PASS: six isolated promotion, rollback and lock scenarios\n'
