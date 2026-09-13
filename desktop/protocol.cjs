const path = require('node:path');
const fs = require('node:fs');

const SCHEME = 'app';
const HOST = 'tessercadina';
const ORIGIN = `${SCHEME}://${HOST}`;

const TYPES = new Map(Object.entries({
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.ico': 'image/x-icon',
}));

const HEADERS = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'Cache-Control': 'no-store',
};

function resolveSafely(root, urlPath) {
  const base = path.resolve(root);
  let decoded;
  try { decoded = decodeURIComponent(String(urlPath).split('?')[0].split('#')[0]); }
  catch { return null; }
  if (decoded.includes('\0')) return null;
  const rel = decoded === '/' || decoded === '' ? 'index.html' : decoded.replace(/^[/\\]+/, '');
  const full = path.resolve(base, rel);
  if (full !== base && !full.startsWith(base + path.sep)) return null;
  if (!TYPES.has(path.extname(full).toLowerCase())) return null;
  let stat;
  try { stat = fs.statSync(full); } catch { return null; }
  if (!stat.isFile()) return null;
  return full;
}

function createHandler(root) {
  return async function handle(request) {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response(null, { status: 405, headers: { ...HEADERS, Allow: 'GET, HEAD' } });
    }
    let url;
    try { url = new URL(request.url); } catch { return refuse(); }
    if (url.host !== HOST) return refuse();
    const file = resolveSafely(root, url.pathname);
    if (!file) return refuse();
    const type = TYPES.get(path.extname(file).toLowerCase());
    if (request.method === 'HEAD') {
      return new Response(null, { status: 200, headers: { ...HEADERS, 'Content-Type': type } });
    }
    try {
      const body = await fs.promises.readFile(file);
      return new Response(body, { status: 200, headers: { ...HEADERS, 'Content-Type': type } });
    } catch {
      return refuse();
    }
  };
}

function refuse() {
  return new Response('Not found', {
    status: 404,
    headers: { ...HEADERS, 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

module.exports = { SCHEME, HOST, ORIGIN, TYPES, HEADERS, resolveSafely, createHandler };
