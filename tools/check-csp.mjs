import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const path = new URL('../index.html', import.meta.url);
const html = readFileSync(path, 'utf8');
const write = process.argv.includes('--write');

const IMPORTMAP = /<script type="importmap">([\s\S]*?)<\/script>/;
const found = IMPORTMAP.exec(html);
if (!found) {
  console.error('check-csp: no import map in index.html.');
  process.exit(1);
}

const digest = createHash('sha256').update(found[1], 'utf8').digest('base64');
const want = `'sha256-${digest}'`;

const POLICY = /(<meta http-equiv="Content-Security-Policy" content=")([^"]*)(">)/;
const policy = POLICY.exec(html);
if (!policy) {
  console.error('check-csp: index.html has no Content-Security-Policy meta tag.');
  process.exit(1);
}

const current = /'sha256-[A-Za-z0-9+/=]+'/.exec(policy[2]);
if (current && current[0] === want) {
  console.log(`check-csp: ok, import map hash matches (${want}).`);
  process.exit(0);
}

if (!write) {
  console.error('check-csp: STALE.');
  process.exit(1);
}

const updated = html.replace(POLICY, (_, a, body, c) => {
  const next = current
    ? body.replace(/'sha256-[A-Za-z0-9+/=]+'/, want)
    : body.replace(/script-src ([^;]*)/, `script-src $1 ${want}`);
  return a + next + c;
});
writeFileSync(path, updated);
console.log(`check-csp: updated the import map hash to ${want}.`);
