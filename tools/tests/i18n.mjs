/**
 * Bahasa Indonesia coverage.
 *
 * The edition's whole claim is that the interface is Indonesian, and nothing
 * in the architecture makes that true on its own: `el()` runs every `text`,
 * `title`, `placeholder` and `aria-label` through `t()`, and a string with no
 * entry in the dictionary passes through as the English it started as. That
 * failure is silent and it is invisible to every other suite, which is exactly
 * the kind of drift a test has to hold.
 *
 * So this walks the source for the strings that reach a user, and fails when
 * one of them has no translation. Anything that is meant to stay as it is has
 * to be named in KEEP below, with the reason, because "we meant that one"
 * is not something a reader can tell from the outside.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const src = join(root, 'src');

const { ID, t, tfmt } = await import('../../src/core/i18n.js');

let fails = 0;
const ok = (name, cond, extra = '') => { if (!cond) fails++; console.log(`${cond ? 'ok  ' : 'FAIL'} ${name}${extra ? '  - ' + extra : ''}`); };

/**
 * Strings that reach the interface and need no dictionary entry.
 *
 * Two kinds, and the reason says which. Some are not language at all, or are
 * an international designation that is the same word everywhere. The rest are
 * already written in Indonesian where they are defined, so translating them
 * would mean shipping the same sentence twice.
 *
 * A CAD term that stays in English is *not* one of these: the dictionary
 * carries it as an entry mapping to itself, which is how the rest of the file
 * already records that decision, and keeps every user-visible string in one
 * place where it can be read and argued with.
 */
const EXEMPT = new Map([
  ['mm', 'unit code, written the same way in Indonesian'],
  ['cm', 'unit code'],
  ['m', 'unit code'],
  ['in', 'unit code, inches'],
  ['ft', 'unit code, feet'],
  ['s', 'unit code, seconds'],
  ['0.00 s', 'a formatted clock reading, not a sentence'],
  ['esc', 'the name printed on the key'],
  ['⌘K', 'the keystroke itself'],
  ['param', 'the abbreviation is the same word in both languages'],
  ['text', 'an icon identifier in the tree, never displayed'],
  ['M5 6V4h14v2M12 4v16M9 20h6', 'SVG path data'],
  ['6061-T6', 'alloy designation, an international standard name'],
  ['Ti-6Al-4V', 'alloy designation'],
  ['Nylon 12', 'polymer grade designation'],
  ['Resin (SLA/DLP)', 'process name, identical in Indonesian'],
  ['Normal (±3σ)', 'identical in Indonesian'],
  ['ISO/SNI: tampilan dari atas digambar di bawah tampilan depan, tampilan kanan di sebelah kirinya.',
    'already Indonesian at the source'],
  ['ASME: tampilan dari atas digambar di atas tampilan depan, tampilan kanan di sebelah kanannya.',
    'already Indonesian at the source'],
  ['Tiga hal yang perlu diketahui', 'already Indonesian at the source'],
  ['Batas yang jujur', 'already Indonesian at the source'],
  ['Jelajahi templat', 'already Indonesian at the source'],
  ['Pintasan', 'already Indonesian at the source'],
  ['Mulai memodel', 'already Indonesian at the source'],
]);

/* ------------------------------------------------------------------ sweep */

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (p.endsWith('.js')) out.push(p);
  }
  return out;
}

// A quoted JavaScript string, escapes included, in either quote style.
const STR = String.raw`(?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)")`;

/**
 * The places a string becomes something a user reads. `el()` translates these
 * four attributes, `status`/`toast`/`flash` translate their message, and
 * `label` reaches the command registry, the menus and the catalogue.
 */
const SITES = [
  ['text', String.raw`\btext:\s*`],
  ['title', String.raw`\btitle:\s*`],
  ['placeholder', String.raw`\bplaceholder:\s*`],
  ['aria-label', String.raw`'aria-label':\s*`],
  ['label', String.raw`\blabel:\s*`],
  ['hint', String.raw`\bhint:\s*`],
  ['note', String.raw`\bnote:\s*`],
  ['status()', String.raw`\bstatus\(\s*`],
  ['toast()', String.raw`\btoast\(\s*`],
  ['flash()', String.raw`\bflash\(\s*`],
  ['t()', String.raw`\bt\(\s*`],
  ['tfmt()', String.raw`\btfmt\(\s*`],
];

const unescape = (s) => s.replace(/\\(['"\\])/g, '$1').replace(/\\n/g, '\n');

const files = walk(src).filter(f => !f.endsWith('i18n.js'));
const found = new Map();       // string -> Set of "file (site)"

for (const file of files) {
  const code = readFileSync(file, 'utf8');
  for (const [site, prefix] of SITES) {
    const re = new RegExp(prefix + STR, 'g');
    let m;
    while ((m = re.exec(code))) {
      const raw = m[1] !== undefined ? m[1] : m[2];
      if (raw === undefined) continue;
      const s = unescape(raw);
      if (!s.trim() || !/[A-Za-z]/.test(s)) continue;
      if (!found.has(s)) found.set(s, new Set());
      found.get(s).add(`${relative(root, file)} (${site})`);
    }
  }
}

ok('the sweep finds the user-visible strings at all', found.size > 400, `${found.size} strings`);

/* ------------------------------------------------- every string is covered */

const untranslated = [...found.entries()]
  .filter(([s]) => !Object.prototype.hasOwnProperty.call(ID, s) && !EXEMPT.has(s));

ok('every user-visible string is translated, or exempt with a reason',
  untranslated.length === 0,
  untranslated.map(([s, where]) => `${[...where][0]}: ${JSON.stringify(s)}`).join('\n       '));

const covered = found.size - untranslated.length;
const kept = Object.entries(ID).filter(([k, v]) => k === v).length;
console.log(`     ${covered} of ${found.size} user-visible strings covered · ${Object.keys(ID).length} dictionary entries, ${kept} of them CAD terms held in English · ${EXEMPT.size} exempt`);

/* ---------------------------------------- the allowlist stays honest too */

const stale = [...EXEMPT.keys()].filter(s => !found.has(s));
ok('nothing sits in the exempt list that the source no longer contains',
  stale.length === 0, stale.map(s => JSON.stringify(s)).join(', '));

const contradicted = [...EXEMPT.keys()].filter(s => Object.prototype.hasOwnProperty.call(ID, s));
ok('and nothing is both exempt and translated',
  contradicted.length === 0, contradicted.map(s => JSON.stringify(s)).join(', '));

ok('every exemption carries a reason', [...EXEMPT.values()].every(r => r && r.length > 8));

/* ----------------------------------------------------- the dictionary itself */

const empty = Object.entries(ID).filter(([, v]) => typeof v !== 'string' || !v.trim());
ok('no entry is empty', empty.length === 0, empty.map(([k]) => JSON.stringify(k)).join(', '));

/* ------------------------------------------------------------ t() contract */

ok('t() returns the translation for a known string', t('Ready') === 'Siap', t('Ready'));
ok('t() is idempotent, so an already-translated string survives a second pass',
  t(t('Ready')) === 'Siap', t(t('Ready')));
ok('t() passes an unknown string through rather than blanking it',
  t('a string nobody has translated') === 'a string nobody has translated');
ok('t() survives null and empty input', t(null) === null && t('') === '');
ok('tfmt() fills placeholders after translating',
  tfmt('Hidden {n}', { n: 3 }) === t('Hidden {n}').replace('{n}', '3'));

/* ------------------------------------------- the chrome is Indonesian too */

const indexHtml = readFileSync(join(root, 'index.html'), 'utf8');
ok('the page declares Indonesian to the browser and to a screen reader',
  /<html[^>]*\blang=["']id["']/.test(indexHtml));

console.log(fails ? `\n${fails} FAILURES` : '\nALL BAHASA INDONESIA CHECKS PASS');
process.exit(fails ? 1 : 0);
