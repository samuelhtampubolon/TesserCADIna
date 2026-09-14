/**
 * How close this edition is to TesserCAD, measured rather than asserted.
 *
 * The README makes two claims about the relationship. Both are checkable, and
 * neither is checkable from inside this repository alone, so this is a script
 * a reader runs against a TesserCAD checkout rather than a suite that fails
 * the build:
 *
 *   node tools/parity.mjs ../TesserCAD
 *
 * It reports three things:
 *
 *   Feature parity   the command registry and the exported API of every
 *                    module, compared by name. A missing command is a feature
 *                    this edition does not have.
 *   Source sharing   what proportion of this edition's source is line-for-line
 *                    the same as upstream. This is the "85-95%" figure.
 *   Payload          what a browser downloads, before and after gzip. The
 *                    dictionary is an addition, so this number is expected to
 *                    be larger here, and the README should say so.
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const MINE = join(here, '..');
const THEIRS = process.argv[2];

if (!THEIRS || !existsSync(join(THEIRS, 'src', 'main.js'))) {
  console.error('usage: node tools/parity.mjs <path to a TesserCAD checkout>');
  console.error('       (the path must contain src/main.js)');
  process.exit(2);
}

const walk = (dir, out = []) => {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
};

const modules = (root) => walk(join(root, 'src'))
  .filter(f => f.endsWith('.js'))
  .map(f => relative(join(root, 'src'), f).split('\\').join('/'))
  .sort();

/* ------------------------------------------------------------ 1. features */

const commandIds = (root) => [...readFileSync(join(root, 'src/ui/commands.js'), 'utf8')
  .matchAll(/\badd\(\s*'([a-zA-Z0-9.]+)'/g)].map(m => m[1]).sort();

const exportsOf = (root) => modules(root)
  .flatMap(f => [...readFileSync(join(root, 'src', f), 'utf8')
    .matchAll(/^export\s+(?:async\s+)?(?:function|const|class)\s+([A-Za-z_$][\w$]*)/gm)]
    .map(m => m[1]))
  .sort();

const theirCommands = commandIds(THEIRS);
const myCommands = commandIds(MINE);
const missingCommands = theirCommands.filter(c => !myCommands.includes(c));
const extraCommands = myCommands.filter(c => !theirCommands.includes(c));

const theirExports = new Set(exportsOf(THEIRS));
const myExports = new Set(exportsOf(MINE));
const missingExports = [...theirExports].filter(x => !myExports.has(x));

console.log('FEATURE PARITY');
console.log(`  commands            ${myCommands.length} here, ${theirCommands.length} upstream`);
console.log(`  missing from here   ${missingCommands.length ? missingCommands.join(', ') : 'none'}`);
console.log(`  added here          ${extraCommands.length ? extraCommands.join(', ') : 'none'}`);
console.log(`  exported API        ${myExports.size} here, ${theirExports.size} upstream`);
console.log(`  missing from here   ${missingExports.length ? missingExports.join(', ') : 'none'}`);

/* -------------------------------------------------------------- 2. sharing */

/** Lines of `b` that are not in `a`, by the usual longest-common-subsequence. */
function addedLines(a, b) {
  const A = a.split('\n'), B = b.split('\n');
  // Trim the common head and tail first: these files are near-identical, and
  // the quadratic table on 1,500 lines is what makes the naive version slow.
  let head = 0;
  while (head < A.length && head < B.length && A[head] === B[head]) head++;
  let tail = 0;
  while (tail < A.length - head && tail < B.length - head
    && A[A.length - 1 - tail] === B[B.length - 1 - tail]) tail++;
  const a2 = A.slice(head, A.length - tail), b2 = B.slice(head, B.length - tail);
  if (!a2.length) return b2.length;
  if (!b2.length) return 0;
  // Count how many of b2's lines are matched by an LCS against a2.
  const prev = new Array(a2.length + 1).fill(0);
  let cur = new Array(a2.length + 1).fill(0);
  for (let j = 0; j < b2.length; j++) {
    cur = new Array(a2.length + 1).fill(0);
    for (let i = 0; i < a2.length; i++) {
      cur[i + 1] = a2[i] === b2[j] ? prev[i] + 1 : Math.max(cur[i], prev[i + 1]);
    }
    prev.splice(0, prev.length, ...cur);
  }
  return b2.length - cur[a2.length];
}

let kept = 0, added = 0, sharedModules = 0;
for (const f of modules(MINE)) {
  const mine = readFileSync(join(MINE, 'src', f), 'utf8');
  const theirPath = join(THEIRS, 'src', f);
  const lines = mine.split('\n').length;
  if (!existsSync(theirPath)) { added += lines; continue; }
  sharedModules++;
  const n = addedLines(readFileSync(theirPath, 'utf8'), mine);
  added += n;
  kept += lines - n;
}

const total = kept + added;
console.log('\nSOURCE SHARING');
console.log(`  modules             ${modules(MINE).length} here, ${sharedModules} of them also upstream`);
console.log(`  lines               ${total.toLocaleString()} here`);
console.log(`  unchanged           ${kept.toLocaleString()}  (${(100 * kept / total).toFixed(1)}%)`);
console.log(`  new or changed      ${added.toLocaleString()}  (${(100 * added / total).toFixed(1)}%)`);

/* -------------------------------------------------------------- 3. payload */

const payload = (root) => {
  const files = [
    ...walk(join(root, 'src')).filter(f => f.endsWith('.js')),
    ...walk(join(root, 'vendor')).filter(f => f.endsWith('.js')),
    ...walk(join(root, 'styles')).filter(f => f.endsWith('.css')),
    join(root, 'index.html'),
  ].filter(existsSync);
  let raw = 0, gz = 0;
  for (const f of files) {
    const buf = readFileSync(f);
    raw += buf.length;
    gz += gzipSync(buf, { level: 9 }).length;
  }
  return { raw, gz };
};

const mine = payload(MINE), theirs = payload(THEIRS);
const mb = (n) => `${(n / 1048576).toFixed(2)} MB`;
const pc = (a, b) => `${a > b ? '+' : ''}${(100 * (a - b) / b).toFixed(1)}%`;

console.log('\nWHAT A BROWSER DOWNLOADS');
console.log(`  raw                 ${mb(mine.raw)} here, ${mb(theirs.raw)} upstream   ${pc(mine.raw, theirs.raw)}`);
console.log(`  gzipped             ${mb(mine.gz)} here, ${mb(theirs.gz)} upstream   ${pc(mine.gz, theirs.gz)}`);
console.log('\n  The dictionary is an addition, so the web payload is larger here.');
console.log('  The desktop download is the other way round: this edition ships two');
console.log('  Chromium locale packs where TesserCAD ships all of them.');
