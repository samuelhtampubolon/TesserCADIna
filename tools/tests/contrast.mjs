/**
 * Colour contrast, from the stylesheet's own tokens.
 *
 * Every colour in styles/app.css is a token with a dark and a light value, so
 * whether text can be read is arithmetic on those tokens and does not need a
 * browser. An audit with axe-core in Chromium found 171 text nodes below
 * WCAG 2.2 AA (4.5:1) across both themes: the tertiary text colour on every
 * panel, and white on the bright accent. This holds the fix.
 *
 * The pairs below are the ones the interface actually draws: each text token
 * on each surface it sits on, and the text on a filled accent control.
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const css = readFileSync(join(root, 'styles', 'app.css'), 'utf8');

let fails = 0;
const ok = (name, cond, extra = '') => { if (!cond) fails++; console.log(`${cond ? 'ok  ' : 'FAIL'} ${name}${extra ? '  - ' + extra : ''}`); };

/** The custom properties declared in the first block matching `selector`. */
function tokens(selector) {
  const at = css.indexOf(selector + ' {');
  if (at < 0) throw new Error(`no ${selector} block in app.css`);
  const body = css.slice(at, css.indexOf('\n}', at));
  const out = {};
  for (const m of body.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})\b/g)) out[m[1]] = m[2];
  return out;
}

const luminance = (hex) => {
  const c = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map(v => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

const dark = tokens(':root');
// The light theme only overrides; anything it leaves alone is the dark value.
const light = { ...dark, ...tokens(':root[data-theme="light"]') };

// Text on the surfaces panels, menus, cards and dialogs are drawn on. --bg-4
// is left out on purpose: it is a pressed or hover state, never a reading
// surface for small text.
const SURFACES = ['bg', 'bg-2', 'bg-3'];
const TEXT = ['txt', 'txt-2', 'txt-3'];

for (const [theme, tk] of [['dark', dark], ['light', light]]) {
  for (const fg of TEXT) {
    const worst = Math.min(...SURFACES.map(bg => ratio(tk[fg], tk[bg])));
    ok(`${theme}: --${fg} reads at 4.5:1 or better on every panel surface`, worst >= 4.5, worst.toFixed(2));
  }
  // Without a fill token of its own, a filled control is painted in the line
  // accent, so that is what gets measured.
  const filled = ratio(tk['on-accent'] || '#ffffff', tk['accent-fill'] || tk.accent);
  ok(`${theme}: text on a filled accent control reads at 4.5:1`, filled >= 4.5, filled.toFixed(2));
  const hover = ratio(tk['on-accent'] || '#ffffff', tk['accent-fill-2'] || tk['accent-2']);
  ok(`${theme}: and on its hover state`, hover >= 4.5, hover.toFixed(2));
}

// The tokens are only half of it: a filled control that still paints white on
// the line accent is the bug this suite exists for, whatever the tokens say.
const whiteOnAccent = [...css.matchAll(/[^{}]*\{[^}]*background:\s*var\(--accent\)[^}]*color:\s*#fff[^}]*\}/g)].map(m => m[0].trim().split('{')[0].trim());
ok('no rule paints white text on the line accent', whiteOnAccent.length === 0, whiteOnAccent.join(', '));

// Dimmed rows were dimmed with opacity, which takes the text below 4.5:1 and
// says why only in colour. A row's name has to stay readable.
const opacityOnNames = [...css.matchAll(/\.tree-node\.[\w-]+[^{]*\.tn-name\s*\{[^}]*opacity/g)].length;
ok('a dimmed tree row is dimmed with a token colour, not opacity', opacityOnNames === 0);

console.log(fails ? `\n${fails} FAILURES` : '\nALL CONTRAST CHECKS PASS');
process.exit(fails ? 1 : 0);
