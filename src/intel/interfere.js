import * as THREE from 'three';
import { booleanGeometries, TRI_BUDGET } from '../core/csg.js';
import { massProperties } from '../core/rebuild.js';

const NOISE_VOLUME = 1e-4;

export function findClashes(bodies, { maxPairs = 200, budget = TRI_BUDGET, budgetMs = 4000 } = {}) {
  const clashes = [];
  const t0 = (typeof performance !== 'undefined' ? performance : Date).now();
  let tested = 0, skipped = 0, unchecked = 0;
  const pairs = [];
  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const a = bodies[i], b = bodies[j];
      if (a.feature.id === b.feature.id) continue;
      if (!a.box.intersectsBox(b.box)) continue;
      pairs.push([a, b]);
    }
  }
  for (const [a, b] of pairs.slice(0, maxPairs)) {
    const now = (typeof performance !== 'undefined' ? performance : Date).now();
    if (now - t0 > budgetMs) { unchecked++; continue; }
    const tris = triCount(a.geometry) + triCount(b.geometry);
    if (tris > budget) {
      skipped++;
      const box = a.box.clone().intersect(b.box);
      const size = new THREE.Vector3(); box.getSize(size);
      clashes.push({
        a, b, exact: false,
        volume: size.x * size.y * size.z,
        fraction: 0,
        at: box.getCenter(new THREE.Vector3()),
        box,
      });
      continue;
    }
    tested++;
    let shared;
    try {
      shared = booleanGeometries('intersect', [
        { geometry: a.geometry, matrix: a.matrix },
        { geometry: b.geometry, matrix: b.matrix },
      ]);
    } catch { skipped++; continue; }
    if (!shared || !shared.attributes?.position?.count) continue;
    const mp = massProperties(shared);
    shared.dispose?.();
    if (!(mp.volume > NOISE_VOLUME)) continue;
    const smaller = Math.min(a.volume || Infinity, b.volume || Infinity);
    clashes.push({
      a, b, exact: true,
      volume: mp.volume,
      fraction: Number.isFinite(smaller) && smaller > 0 ? mp.volume / smaller : 0,
      at: mp.centroid,
      box: mp.box,
    });
  }
  return {
    clashes: clashes.sort((x, y) => y.volume - x.volume),
    tested, skipped,
    unchecked: unchecked + Math.max(0, pairs.length - maxPairs),
    pairs: pairs.length,
    truncated: pairs.length > maxPairs,
    ms: (typeof performance !== 'undefined' ? performance : Date).now() - t0,
  };
}
function triCount(g) {
  return (g.index ? g.index.count : g.attributes.position.count) / 3;
}
export function clearance(a, b, { samples = 400 } = {}) {
  const pa = worldPoints(a, samples);
  const pb = worldPoints(b, samples);
  if (!pa.length || !pb.length) return null;
  let best = Infinity;
  const at = [new THREE.Vector3(), new THREE.Vector3()];
  for (const p of pa) {
    for (const q of pb) {
      const d = p.distanceToSquared(q);
      if (d < best) { best = d; at[0].copy(p); at[1].copy(q); }
    }
  }
  return {
    distance: Math.sqrt(best),
    from: at[0].clone(), to: at[1].clone(),
    approximate: true, sampled: pa.length + pb.length,
  };
}
function worldPoints(body, n) {
  const g = body.geometry;
  const pos = g.attributes.position;
  const count = pos.count;
  const step = Math.max(1, Math.floor(count / n));
  const out = [];
  const v = new THREE.Vector3();
  for (let i = 0; i < count; i += step) {
    v.fromBufferAttribute(pos, i);
    if (body.matrix) v.applyMatrix4(body.matrix);
    out.push(v.clone());
  }
  return out;
}
