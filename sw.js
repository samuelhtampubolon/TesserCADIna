const VERSION = 'tessercad-b0f84a257ee1';
const FILES = [
  "assets/favicon.svg",
  "index.html",
  "src/boot.js",
  "src/core/bus.js",
  "src/core/csg-core.js",
  "src/core/csg-pool.js",
  "src/core/csg-worker.js",
  "src/core/csg.js",
  "src/core/doc.js",
  "src/core/expr.js",
  "src/core/geometry.js",
  "src/core/i18n.js",
  "src/core/rebuild.js",
  "src/draft/draft.js",
  "src/draft/dxf.js",
  "src/draft/entity.js",
  "src/intel/brief.js",
  "src/intel/configs.js",
  "src/intel/cost.js",
  "src/intel/deviation.js",
  "src/intel/doctor.js",
  "src/intel/drawing.js",
  "src/intel/fasteners.js",
  "src/intel/history.js",
  "src/intel/hygiene.js",
  "src/intel/interfere.js",
  "src/intel/macros.js",
  "src/intel/merge.js",
  "src/intel/offline.js",
  "src/intel/process.js",
  "src/intel/recognise.js",
  "src/intel/release.js",
  "src/intel/section.js",
  "src/intel/speak.js",
  "src/intel/spec.js",
  "src/intel/standards.js",
  "src/intel/tessellate.js",
  "src/intel/tolerance.js",
  "src/intel/why.js",
  "src/intel/zip.js",
  "src/io/io.js",
  "src/main.js",
  "src/sim/recorder.js",
  "src/sim/sim.js",
  "src/ui/commands.js",
  "src/ui/icons.js",
  "src/ui/inspector.js",
  "src/ui/menus.js",
  "src/ui/mobile.js",
  "src/ui/operators.js",
  "src/ui/shell.js",
  "src/ui/timelineui.js",
  "src/ui/tree.js",
  "src/view/viewport.js",
  "styles/app.css",
  "vendor/BufferGeometryUtils.js",
  "vendor/GLTFExporter.js",
  "vendor/OBJExporter.js",
  "vendor/OBJLoader.js",
  "vendor/OrbitControls.js",
  "vendor/RoomEnvironment.js",
  "vendor/STLExporter.js",
  "vendor/STLLoader.js",
  "vendor/TextureUtils.js",
  "vendor/TransformControls.js",
  "vendor/three.module.js"
];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    await Promise.all(FILES.map(f => cache.add(new Request(f, { cache: 'reload' })).catch(() => {})));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    for (const key of await caches.keys()) {
      if (key !== VERSION && key.startsWith('tessercad-')) await caches.delete(key);
    }
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  e.respondWith((async () => {
    const cache = await caches.open(VERSION);
    const hit = await cache.match(req, { ignoreSearch: true });
    if (hit) {
      fetch(req).then(res => { if (res.ok) cache.put(req, res.clone()); }).catch(() => {});
      return hit;
    }
    try {
      const res = await fetch(req);
      if (res.ok) cache.put(req, res.clone());
      return res;
    } catch {
      if (req.mode === 'navigate') {
        const shell = await cache.match('index.html');
        if (shell) return shell;
      }
      return new Response('Offline and not in the cache.', { status: 504, statusText: 'Offline' });
    }
  })());
});
