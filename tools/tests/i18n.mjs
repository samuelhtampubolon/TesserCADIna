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
const { scan } = await import('../lex.mjs');

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
  ['(min-width: 700px) and (max-width: 1279px) and (min-height: 461px)', 'a CSS media query, not language'],
  ['<code>pi</code> <code>tau</code> <code>e</code> <code>phi</code>', 'the constants the expression engine defines, which are their own names'],
  ['<svg viewBox="-40 -40 80 80" width="72" height="72"></svg>', 'an empty SVG frame the section preview draws into'],
  ['property uchar red', 'a PLY header token, written into an exported file'],
  ['property uchar green', 'a PLY header token'],
  ['property uchar blue', 'a PLY header token'],
  ['property list uchar int vertex_indices', 'a PLY header token'],
  ['[bus] handler for "${…}" threw', 'a console warning for whoever is debugging the event bus'],
  ['Boolean skipped: ${…}k triangles exceeds the ${…}k budget.',
    'raised inside the boolean kernel, which the workers load and the dictionary is deliberately kept out of; rebuild.js phrases it (see readableError)'],
  ['Jelajahi templat', 'already Indonesian at the source'],
  ['Pintasan', 'already Indonesian at the source'],
  ['Mulai memodel', 'already Indonesian at the source'],
]);

/**
 * Written in Indonesian where it stands, and so needing no entry.
 *
 * Most of this application's strings are inherited from TesserCAD and are
 * English keys that the dictionary answers. Some were written here, in
 * Indonesian, and translating those would mean inventing an English original
 * to translate back. So the rule the suite enforces is not "every string is in
 * the dictionary" but the one that matters: **no English prose reaches a user
 * without a translation**.
 *
 * One-and-two-letter markers are left out: `di` and `ke` are ordinary
 * Indonesian words and nothing in English, but they are too short to risk
 * against acronyms and identifiers.
 */
const INDONESIAN = new RegExp('\\b(' + [
  // function words
  'yang', 'tidak', 'dan', 'dengan', 'untuk', 'dari', 'ini', 'itu', 'adalah',
  'pada', 'bisa', 'akan', 'sudah', 'atau', 'jadi', 'lebih', 'tanpa', 'setiap',
  'semua', 'sebuah', 'belum', 'sedang', 'kembali', 'hanya', 'ada', 'anda',
  'saat', 'agar', 'bukan', 'masih', 'juga', 'sendiri', 'dalam', 'oleh',
  'selamat', 'datang', 'sepenuhnya', 'diunggah',
  'seperti', 'karena', 'tetapi', 'saja', 'dulu', 'sekali', 'kali', 'tiap',
  // content words with no English homograph
  'panjang', 'lebar', 'tinggi', 'tebal', 'kedalaman', 'jarak', 'jumlah',
  'ukuran', 'titik', 'garis', 'bidang', 'muka', 'sisi', 'lubang', 'baut',
  'pelat', 'kotak', 'silinder', 'tabung', 'bola', 'potong', 'gambar',
  'berkas', 'dokumen', 'versi', 'cabang', 'konflik', 'satuan', 'nilai',
  'angka', 'catatan', 'peramban', 'pengaturan', 'perintah', 'fitur',
  // verbs, which in Indonesian carry their affixes
  'dipilih', 'disimpan', 'dihapus', 'ditambahkan', 'dibangun', 'diterapkan',
  'berjalan', 'memakai', 'membuat', 'menyimpan', 'menghapus', 'memilih',
].join('|') + ')\\b', 'i');

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
  ['html', String.raw`\bhtml:\s*`],
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
  // Widgets that take their label as the first argument rather than in an
  // attribute bag. `section()` and friends do pass it through el(), so the
  // string is translated if the dictionary has it - the sweep just could not
  // see it, and four panel headings were missing entries because of that.
  ['section()', String.raw`\bsection\(\s*`],
  ['field()', String.raw`\bfield\(\s*`],
  ['checkbox()', String.raw`\bcheckbox\(\s*`],
  ['emptyState()', String.raw`\bemptyState\(\s*`],
  ['confirmDialog()', String.raw`\bconfirmDialog\(\s*`],
  ['promptDialog()', String.raw`\bpromptDialog\(\s*`],
  // Assigning straight to the DOM goes around el() entirely, which is how the
  // two panel headings stayed English while everything inside them was not.
  ['textContent', String.raw`\.textContent\s*=\s*`],
  ['innerHTML', String.raw`\.innerHTML\s*=\s*`],
  // The command registry takes its label positionally, after the id, and every
  // one of those labels is a menu entry and a palette row. Scoped to that one
  // file: mobile.js has two `add` helpers of its own whose second argument is
  // an icon name in one of them and a label in the other.
  ['command', String.raw`\badd\(\s*'[^']*',\s*`, 'ui/commands.js'],
];

const unescape = (s) => s.replace(/\\(['"\\])/g, '$1').replace(/\\n/g, '\n');

// The dictionary is not a source of untranslated strings; it is the answer to
// them. Its Indonesian values carry English loanwords ("bill of materials")
// and its keys are English by definition.
const TABLES = ['i18n.js', 'lang-interface.js', 'lang-prose.js'];
const files = walk(src).filter(f => !TABLES.some(name => f.endsWith(name)));
const found = new Map();       // string -> Set of "file (site)"

for (const file of files) {
  const code = readFileSync(file, 'utf8');
  for (const [site, prefix, onlyIn] of SITES) {
    if (onlyIn && !relative(root, file).endsWith(onlyIn)) continue;
    const re = new RegExp(prefix + STR, 'g');
    let m;
    while ((m = re.exec(code))) {
      const raw = m[1] !== undefined ? m[1] : m[2];
      if (raw === undefined) continue;
      const s = unescape(raw);
      if (!s.trim() || !/[A-Za-z]/.test(s)) continue;
      if (INDONESIAN.test(s)) continue;          // written here, in Indonesian
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

/* ------------------------------------- nothing reaches a user around the table */

/**
 * Two ways a string gets past the sweep above, both of which happened.
 *
 * A template literal is never translated: `t()` matches exact text, and
 * `${n} features failed to build` is a different string every time. And a
 * sentence written as a plain literal anywhere in a module reaches a user
 * through paths the attribute sweep does not model — a thrown error, a
 * finding's detail, a note pushed onto a list.
 *
 * So the whole source is read with a real lexer and every English sentence in
 * it has to be accounted for, wherever it sits.
 */
const ENGLISH_SENTENCE = /\b(the|an|is|are|to|of|and|not|no|you|your|it|this|that|with|from|for|by|as|has|have|will|can|cannot|does|every|each|which|what|there|their|its|all|any|some|more|than|then|so|but|if|into|only|also|just|nothing|needs|need|must|should|because|while|both|other|same|at|on|in|be|was|were|had)\b/i;

/**
 * Words enough to be a phrase rather than an identifier or a format string.
 *
 * Two words only count with an English function word beside them, because
 * "Move X" and "bolt_r" are not sentences. Three or more count on their own:
 * "Known types:" carries no function word at all, and that is how one error
 * message stayed English through two passes of this file.
 */
const looksLikeProse = (s) => {
  const words = s.trim().split(/\s+/).filter(w => /^[A-Za-z]{2,}$/.test(w));
  return words.length >= 3 || (words.length === 2 && ENGLISH_SENTENCE.test(s));
};

const needsTranslation = (s) => looksLikeProse(s) && !INDONESIAN.test(s);

const strayProse = [];
const strayTemplates = [];
const allStrings = new Set();
const allTemplates = new Set();
for (const file of files) {
  // CSS class lists are three short lowercase words and read exactly like a
  // phrase to any heuristic. They are not language, so they are taken out
  // before the sweep rather than listed one by one as exemptions.
  const source = readFileSync(file, 'utf8').replace(/\bclass(?:Name)?\s*:\s*'(?:[^'\\]|\\.)*'/g, 'class: 0');
  const { strings, templates } = scan(source);
  const where = relative(root, file);
  for (const { value } of strings) {
    if (!needsTranslation(value)) continue;
    allStrings.add(value);
    if (Object.prototype.hasOwnProperty.call(ID, value) || EXEMPT.has(value)) continue;
    strayProse.push(`${where}: ${JSON.stringify(value)}`);
  }
  for (const { chunks, raw } of templates) {
    const text = chunks.join(' ');
    if (!needsTranslation(text)) continue;
    allTemplates.add(raw);
    if (EXEMPT.has(raw)) continue;
    strayTemplates.push(`${where}: \`${raw.replace(/\n/g, '\\n').slice(0, 80)}\``);
  }
}

ok('no English sentence sits in the source outside the dictionary',
  strayProse.length === 0, strayProse.slice(0, 8).join('\n       '));

ok('and no user-visible sentence is assembled with a template literal, which t() can never match',
  strayTemplates.length === 0, strayTemplates.slice(0, 8).join('\n       '));

/* ---------------------------------------- the allowlist stays honest too */

// Everything the source actually contains, from either sweep, so an exemption
// for a template or a stray sentence is not reported as stale.
const inSource = new Set([...found.keys(), ...allStrings, ...allTemplates]);
const stale = [...EXEMPT.keys()].filter(s => !inSource.has(s));
ok('nothing sits in the exempt list that the source no longer contains',
  stale.length === 0, stale.map(s => JSON.stringify(s)).join(', '));

const contradicted = [...EXEMPT.keys()].filter(s => Object.prototype.hasOwnProperty.call(ID, s));
ok('and nothing is both exempt and translated',
  contradicted.length === 0, contradicted.map(s => JSON.stringify(s)).join(', '));

ok('every exemption carries a reason', [...EXEMPT.values()].every(r => r && r.length > 8));

/* ----------------------------------------------------- the dictionary itself */

const empty = Object.entries(ID).filter(([, v]) => typeof v !== 'string' || !v.trim());
ok('no entry is empty', empty.length === 0, empty.map(([k]) => JSON.stringify(k)).join(', '));

/**
 * A key written twice is invisible: the object literal keeps the last one and
 * the earlier line sits in the file looking authoritative. Six had accumulated,
 * one of them with two different translations, so this is checked against the
 * text of the tables rather than against the merged object, which is the only
 * place the duplicate still exists.
 */
const ENTRY = /^ {2}('(?:[^'\\]|\\.)*'): /gm;
const dupes = [];
for (const table of ['lang-interface.js', 'lang-prose.js']) {
  const text = readFileSync(join(src, 'core', table), 'utf8');
  const seen = new Set();
  for (const m of text.matchAll(ENTRY)) {
    if (seen.has(m[1])) dupes.push(`${table}: ${m[1]}`);
    seen.add(m[1]);
  }
}
ok('no string is translated twice in the same table', dupes.length === 0, dupes.join(', '));

const ifaceKeys = new Set([...readFileSync(join(src, 'core', 'lang-interface.js'), 'utf8').matchAll(ENTRY)].map(m => m[1]));
const proseDupes = [...readFileSync(join(src, 'core', 'lang-prose.js'), 'utf8').matchAll(ENTRY)]
  .map(m => m[1]).filter(k => ifaceKeys.has(k));
ok('and no string appears in both tables', proseDupes.length === 0, proseDupes.join(', '));

/* ------------------------------------------------------------ t() contract */

ok('t() returns the translation for a known string', t('Ready') === 'Siap', t('Ready'));
ok('t() is idempotent, so an already-translated string survives a second pass',
  t(t('Ready')) === 'Siap', t(t('Ready')));
ok('t() passes an unknown string through rather than blanking it',
  t('a string nobody has translated') === 'a string nobody has translated');
ok('t() survives null and empty input', t(null) === null && t('') === '');
ok('tfmt() fills placeholders after translating',
  tfmt('Hidden {n}', { n: 3 }) === t('Hidden {n}').replace('{n}', '3'));

/* ---------------------------------------- the ownership panel tells the truth */

/**
 * The ownership report is the one list a user is invited to trust literally:
 * it claims to name everything on the machine, and the same list is what the
 * delete button removes. A key the application writes but this list omits is
 * data the panel swears is absent and the delete leaves behind, so the list is
 * checked against the source rather than against itself.
 */
globalThis.localStorage ??= { getItem: () => null, setItem: () => {}, removeItem: () => {} };
const offline = await import('../../src/intel/offline.js');

const declared = new Set(offline.localData().map(r => r.key));

const written = new Set();
for (const file of files) {
  for (const m of readFileSync(file, 'utf8').matchAll(/'(tessercadina\.[A-Za-z0-9_.-]+)'/g)) written.add(m[1]);
}

const unreported = [...written].filter(k => !declared.has(k));
ok('every key the application writes is named in the ownership report',
  unreported.length === 0, unreported.join(', '));

const phantom = [...declared].filter(k => !written.has(k));
ok('and the report names nothing the application never writes',
  phantom.length === 0, phantom.join(', '));

ok('the report is not empty', declared.size >= 5, `${declared.size} keys`);

ok('every key is namespaced to this application, not shared with TesserCAD',
  [...declared].every(k => k.startsWith('tessercadina.')),
  [...declared].filter(k => !k.startsWith('tessercadina.')).join(', '));

// Not a translation table, so the sweep above cannot see these: they are
// written in Indonesian where they are defined.
const ENGLISH = /\b(the|your|and|you|saved|which|open|preferences|notes)\b/i;
const englishRows = offline.localData().filter(r => ENGLISH.test(r.what));
ok('and each one describes itself in Indonesian',
  englishRows.length === 0, englishRows.map(r => `${r.key}: ${r.what}`).join(' | '));

/* ------------------------------------------- the chrome is Indonesian too */

const indexHtml = readFileSync(join(root, 'index.html'), 'utf8');
ok('the page declares Indonesian to the browser and to a screen reader',
  /<html[^>]*\blang=["']id["']/.test(indexHtml));

console.log(fails ? `\n${fails} FAILURES` : '\nALL BAHASA INDONESIA CHECKS PASS');
process.exit(fails ? 1 : 0);
