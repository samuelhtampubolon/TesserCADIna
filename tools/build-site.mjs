/**
 * Assemble the deployable site into dist-site/, for any static host.
 *
 *   node tools/build-site.mjs
 *
 * The application has no build step and still does not: this copies files, it
 * does not transform them. What it adds is a boundary. Serving the repository
 * root publishes everything in it - the test tooling, the desktop shell, the
 * documents - when what a browser needs is index.html, the service worker and
 * the four directories it loads from. dist-site/ is exactly that set, so every
 * host serves the same files GitHub Pages does and nothing beside them.
 *
 * It also writes the security headers once, as `_headers`, which Netlify and
 * Cloudflare Pages both read from the published directory. Vercel and Firebase
 * take headers from their own configuration files instead; tools/tests/
 * security.mjs checks that those carry the same policy as this file writes.
 *
 * The Content-Security-Policy header is read out of index.html rather than
 * written here a second time. The page already carries it as a <meta>, pinned
 * to the hash of the inline import map; a copy kept here would be a second
 * place to update and the one that gets forgotten. The header adds the one
 * directive a <meta> cannot carry, frame-ancestors, so the application cannot
 * be framed by another site.
 */
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/, '');
const out = join(root, 'dist-site');

/** What a browser loads. The same set tools/build-sw.mjs caches for offline use. */
export const SHIPPED_DIRS = ['src', 'styles', 'vendor', 'assets'];
export const SHIPPED_FILES = ['index.html', 'sw.js', 'LICENSE', 'NOTICE', '.nojekyll'];

/** The policy from index.html's <meta>, plus what only a header can say. */
export function cspHeader(html) {
  const m = /<meta http-equiv="Content-Security-Policy" content="([^"]+)"/.exec(html);
  if (!m) throw new Error('index.html carries no Content-Security-Policy <meta> to copy');
  return `${m[1]}; frame-ancestors 'none'`;
}

/** Headers for every response. Each one is here for a reason that can be stated. */
export function securityHeaders(html) {
  return {
    'Content-Security-Policy': cspHeader(html),
    // A file served with the wrong type is not reinterpreted as script.
    'X-Content-Type-Options': 'nosniff',
    // Nothing about the user's location in the app leaves in a Referer.
    'Referrer-Policy': 'no-referrer',
    // The application uses none of these, so it asks for none of them.
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), usb=(), serial=(), hid=(), bluetooth=(), payment=()',
    // Older browsers that ignore frame-ancestors still honour this.
    'X-Frame-Options': 'DENY',
    // Another origin's window cannot reach into this one through window.opener.
    'Cross-Origin-Opener-Policy': 'same-origin',
  };
}

export function headersFile(html) {
  const lines = ['/*'];
  for (const [k, v] of Object.entries(securityHeaders(html))) lines.push(`  ${k}: ${v}`);
  // The worker must be revalidated on every load, or a host's cache can pin
  // users to an old release for as long as that cache lives.
  lines.push('', '/sw.js', '  Cache-Control: no-cache');
  return lines.join('\n') + '\n';
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });
  for (const d of SHIPPED_DIRS) cpSync(join(root, d), join(out, d), { recursive: true });
  for (const f of SHIPPED_FILES) if (existsSync(join(root, f))) cpSync(join(root, f), join(out, f));

  const html = readFileSync(join(root, 'index.html'), 'utf8');
  writeFileSync(join(out, '_headers'), headersFile(html));

  // Hugging Face Spaces reads its configuration from README.md front matter.
  // The repository's own README is for GitHub and cannot carry it, so the
  // Space gets a README of its own, inside the published directory only.
  writeFileSync(join(out, 'README.md'), [
    '---',
    'title: TesserCADIna',
    'emoji: 📐',
    'colorFrom: blue',
    'colorTo: gray',
    'sdk: static',
    'app_file: index.html',
    'pinned: false',
    'license: mit',
    '---',
    '',
    'Studio CAD parametrik berbahasa Indonesia yang berjalan sepenuhnya di peramban.',
    '',
    'Sumber: https://github.com/samuelhtampubolon/TesserCADIna',
    '',
  ].join('\n'));

  console.log(`build-site: dist-site/ assembled (${SHIPPED_DIRS.length} directories, ${SHIPPED_FILES.length} files, _headers, Spaces README)`);
}
