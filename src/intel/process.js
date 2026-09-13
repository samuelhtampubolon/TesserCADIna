export const PROCESSES = {
  fdm: { label: 'FDM 3D printing', kind: 'additive', minWall: 1.2, minFeature: 0.8, envelope: [256, 256, 256], tolerance: 0.3, setup: 4, tooling: 0, rate: 3.5, throughput: 16000, scrap: 0.15, wants: ['overhangs under 45 degrees', 'no unsupported bridges over 10mm'], note: 'Prototype process.' },
  sla: { label: 'Resin (SLA/DLP)', kind: 'additive', minWall: 0.6, minFeature: 0.3, envelope: [145, 145, 175], tolerance: 0.1, setup: 9, tooling: 0, rate: 6, throughput: 9000, scrap: 0.25, wants: ['drain holes in every hollow', 'no fully enclosed voids'], note: 'Fine detail; brittle parts.' },
  sls: { label: 'SLS nylon', kind: 'additive', minWall: 0.8, minFeature: 0.5, envelope: [330, 330, 600], tolerance: 0.2, setup: 25, tooling: 0, rate: 22, throughput: 26000, scrap: 0.35, wants: ['escape holes for unsintered powder'], note: 'No supports; small batches viable.' },
  cnc3: { label: '3-axis CNC', kind: 'subtractive', minWall: 0.8, minFeature: 1.0, envelope: [400, 400, 150], tolerance: 0.05, setup: 70, tooling: 0, rate: 65, throughput: 40000, scrap: 0.1, wants: ['internal corners with a radius', 'features reachable from one side'], note: 'Pay for material you cut away.' },
  sheet: { label: 'Laser-cut sheet', kind: 'subtractive', minWall: 1.0, minFeature: 1.0, envelope: [1500, 3000, 12], tolerance: 0.15, setup: 25, tooling: 0, rate: 55, throughput: 90000, scrap: 0.2, wants: ['constant thickness', 'bends no tighter than the material thickness'], note: 'Cheapest metal process for folded sheet.' },
  cast: { label: 'Sand casting', kind: 'formative', minWall: 3.0, minFeature: 3.0, envelope: [1000, 1000, 600], tolerance: 0.8, setup: 120, tooling: 350, rate: 40, throughput: 150000, scrap: 0.3, wants: ['uniform wall thickness', 'draft on every vertical face', 'generous fillets'], note: 'Cheap per kilogram at volume.' },
  im: { label: 'Injection moulding', kind: 'formative', minWall: 1.0, minFeature: 0.5, envelope: [400, 400, 250], tolerance: 0.1, setup: 200, tooling: 7000, rate: 55, throughput: 400000, scrap: 0.05, wants: ['uniform wall thickness', 'draft on every vertical face', 'no thick solid sections'], note: 'Tool dominates cost.' },
};
export const PROCESS_IDS = Object.keys(PROCESSES);
export const MATERIAL_PRICE = {
  steel: 2.2, aluminium: 5.5, stainless: 8.0, brass: 11, copper: 12,
  titanium: 60, abs: 3.2, pla: 3.0, nylon: 9, acrylic: 6,
  wood: 1.5, concrete: 0.4, glass: 4, rubber: 5, custom: 5,
};
const METALS = new Set(['steel', 'aluminium', 'stainless', 'brass', 'copper', 'titanium']);
const PLASTICS = new Set(['abs', 'pla', 'nylon', 'acrylic', 'rubber']);
export function processSuits(processId, material) {
  const p = PROCESSES[processId];
  if (!p) return false;
  if (processId === 'fdm' || processId === 'sla' || processId === 'sls' || processId === 'im') return PLASTICS.has(material);
  if (processId === 'cast') return METALS.has(material);
  if (processId === 'sheet') return METALS.has(material) || material === 'acrylic';
  return METALS.has(material) || PLASTICS.has(material) || material === 'wood';
}
export function processFitsShape(processId, part) {
  const p = PROCESSES[processId];
  if (!p || !part?.box) return true;
  const dims = [part.box.x, part.box.y, part.box.z].sort((a, b) => a - b);
  const [min, mid, max] = dims;
  if (processId === 'sheet') {
    if (min > p.envelope[2]) return false;
    if (min > max * 0.25) return false;
    const fill = part.volume / Math.max(1e-9, min * mid * max);
    if (fill < 0.3) return false;
  }
  return true;
}
export function processFitsEnvelope(processId, part) {
  const p = PROCESSES[processId];
  if (!p || !part?.box) return true;
  const dims = [part.box.x, part.box.y, part.box.z].sort((a, b) => b - a);
  const env = [...p.envelope].sort((a, b) => b - a);
  return dims.every((v, i) => v <= env[i]);
}
export function processOf(id) { return PROCESSES[id] || PROCESSES.cnc3; }
