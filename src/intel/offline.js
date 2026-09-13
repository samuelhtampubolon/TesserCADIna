const KEYS = [
  ['tessercad.autosave.v3', 'the document you have open'],
  ['tessercad.vcs.v1', 'saved versions and branches'],
  ['tessercad.studio.v1', 'studio standards, decisions and macros'],
  ['tessercad.prefs.v1', 'your preferences'],
  ['tessercad.why.v1', 'which engineering notes you have seen'],
];

export function install() {
  if (typeof navigator === 'undefined' || !navigator.serviceWorker) {
    return Promise.resolve({ ok: false, reason: 'This browser has no service worker support.' });
  }
  if (typeof location !== 'undefined' && location.protocol === 'app:') {
    return Promise.resolve({ ok: false, reason: 'Already offline: this is the desktop build, and every file is local.' });
  }
  if (typeof location !== 'undefined' && location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
    return Promise.resolve({ ok: false, reason: 'Offline install needs https, or localhost.' });
  }
  return navigator.serviceWorker.register('./sw.js', { scope: './' })
    .then(reg => ({ ok: true, reason: 'Registered', scope: reg.scope }))
    .catch(err => ({ ok: false, reason: err.message || 'Registration failed.' }));
}

export async function status() {
  const out = {
    supported: typeof navigator !== 'undefined' && !!navigator.serviceWorker,
    controlled: false, version: null, files: 0, cachedBytes: 0, online: true,
  };
  if (typeof navigator !== 'undefined') out.online = navigator.onLine !== false;
  if (!out.supported) return out;
  const reg = await navigator.serviceWorker.getRegistration?.('./');
  out.registered = !!reg;
  out.controlled = !!navigator.serviceWorker.controller;
  if (typeof caches !== 'undefined') {
    try {
      const keys = (await caches.keys()).filter(k => k.startsWith('tessercad-'));
      out.version = keys[0] || null;
      if (keys[0]) {
        const c = await caches.open(keys[0]);
        const reqs = await c.keys();
        out.files = reqs.length;
        let bytes = 0;
        for (const r of reqs) {
          const res = await c.match(r);
          if (!res) continue;
          const buf = await res.clone().arrayBuffer().catch(() => null);
          if (buf) bytes += buf.byteLength;
        }
        out.cachedBytes = bytes;
      }
    } catch { /* storage may be blocked */ }
  }
  return out;
}

export function localData() {
  const rows = [];
  if (typeof localStorage === 'undefined') return rows;
  for (const [key, what] of KEYS) {
    let raw = null;
    try { raw = localStorage.getItem(key); } catch { /* blocked */ }
    rows.push({ key, what, bytes: raw ? raw.length : 0, present: !!raw });
  }
  return rows;
}

export function forgetEverything() {
  const removed = [];
  for (const [key] of KEYS) {
    try { if (localStorage.getItem(key) !== null) { localStorage.removeItem(key); removed.push(key); } }
    catch { /* blocked */ }
  }
  return removed;
}

export async function uninstall() {
  const out = { caches: 0, worker: false };
  if (typeof caches !== 'undefined') {
    for (const k of await caches.keys()) {
      if (k.startsWith('tessercad-')) { await caches.delete(k); out.caches++; }
    }
  }
  const reg = await navigator.serviceWorker?.getRegistration?.('./');
  if (reg) out.worker = await reg.unregister();
  return out;
}

export const NETWORK_FACTS = [
  'No account, no sign-in, and nothing to activate.',
  'No telemetry, no analytics, and no error reporting.',
  'No licence check, so nothing can refuse to start.',
  'No font, map or model fetched from anyone else: three.js is vendored into this repository.',
  'Every document you open or save moves between the page and your disk, and nowhere else.',
  'Open your browser\u2019s network panel and reload: after the first visit there is nothing to see.',
];
