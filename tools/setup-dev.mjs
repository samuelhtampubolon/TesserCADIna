/**
 * Creates a tiny node_modules/three shim that points at the vendored build.
 * Run this once before `npm test`. Nothing is downloaded.
 */
import { mkdirSync, copyFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dest = join(root, 'node_modules', 'three');
const src = join(root, 'vendor', 'three.module.js');

if (!existsSync(src)) {
  console.error('vendor/three.module.js is missing — the repository is incomplete.');
  process.exit(1);
}
mkdirSync(dest, { recursive: true });
copyFileSync(src, join(dest, 'three.module.js'));

const addons = join(dest, 'addons');
mkdirSync(addons, { recursive: true });
const vendor = join(root, 'vendor');
let n = 0;
for (const f of readdirSync(vendor)) {
  if (!f.endsWith('.js') || f === 'three.module.js') continue;
  copyFileSync(join(vendor, f), join(addons, f));
  n++;
}

writeFileSync(join(dest, 'package.json'), JSON.stringify({
  name: 'three', version: 'vendored', type: 'module',
  main: 'three.module.js',
  exports: { '.': './three.module.js', './addons/*': './addons/*' },
}, null, 2));
console.log(`dev shim ready: node_modules/three (core + ${n} addons) -> vendor/`);
