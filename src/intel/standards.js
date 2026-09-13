const KEY = 'tessercadina.studio.v1';

export const DEFAULT_STANDARDS = {
  units: 'mm',
  material: 'aluminium',
  namePattern: '{part}-{nn}',
  author: '',
  process: 'cnc3',
  minWall: null,
  minFeature: null,
  tolerance: null,
  batch: 1,
  currency: 'Rp',
  rates: {},
  materialPrice: {},
  exportQuality: 'standard',
  autoDoctor: true,
  seedNewDocuments: true,
};

const MAX_DECISIONS = 200;

function read() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
    return {
      standards: { ...DEFAULT_STANDARDS, ...(raw.standards || {}) },
      decisions: Array.isArray(raw.decisions) ? raw.decisions : [],
      macros: Array.isArray(raw.macros) ? raw.macros : [],
    };
  } catch {
    return { standards: { ...DEFAULT_STANDARDS }, decisions: [], macros: [] };
  }
}
function write(state) {
  try { localStorage.setItem(KEY, JSON.stringify(state)); }
  catch { /* private mode */ }
}
export function standards() { return read().standards; }
export function setStandard(key, value) {
  const s = read(); s.standards[key] = value; write(s); return s.standards;
}
export function setStandards(patch) {
  const s = read(); s.standards = { ...s.standards, ...patch }; write(s); return s.standards;
}
export function resetStandards() {
  const s = read(); s.standards = { ...DEFAULT_STANDARDS }; write(s); return s.standards;
}
export function seedDocument(doc) {
  const s = standards();
  if (!s.seedNewDocuments) return doc;
  doc.meta.units = s.units;
  if (s.author) doc.meta.author = s.author;
  doc.studio = { process: s.process, batch: s.batch };
  return doc;
}
export function limits(process) {
  const s = standards();
  return {
    minWall: s.minWall ?? process.minWall,
    minFeature: s.minFeature ?? process.minFeature,
    tolerance: s.tolerance ?? process.tolerance,
  };
}
export function logDecision(entry) {
  const s = read();
  s.decisions.unshift({
    id: `d${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    at: new Date().toISOString(),
    ...entry,
  });
  if (s.decisions.length > MAX_DECISIONS) s.decisions.length = MAX_DECISIONS;
  write(s);
  return s.decisions;
}
export function decisions({ doc = null } = {}) {
  const all = read().decisions;
  return doc ? all.filter(d => d.doc === doc) : all;
}
export function deleteDecision(id) {
  const s = read();
  s.decisions = s.decisions.filter(d => d.id !== id);
  write(s);
  return s.decisions;
}
export function clearDecisions() {
  const s = read(); s.decisions = []; write(s);
}
export function macros() { return read().macros; }
export function saveMacro(macro) {
  const s = read();
  const i = s.macros.findIndex(m => m.id === macro.id);
  if (i >= 0) s.macros[i] = macro; else s.macros.push(macro);
  write(s);
  return s.macros;
}
export function deleteMacro(id) {
  const s = read();
  s.macros = s.macros.filter(m => m.id !== id);
  write(s);
  return s.macros;
}
export function exportStudio() {
  return JSON.stringify({ app: 'TesserCADIna', kind: 'studio', version: 1, ...read() }, null, 2);
}
export function importStudio(json) {
  const raw = typeof json === 'string' ? JSON.parse(json) : json;
  if (raw.kind !== 'studio') throw new Error('Not a TesserCADIna studio file');
  const next = {
    standards: { ...DEFAULT_STANDARDS, ...(raw.standards || {}) },
    decisions: Array.isArray(raw.decisions) ? raw.decisions.slice(0, MAX_DECISIONS) : [],
    macros: Array.isArray(raw.macros) ? raw.macros : [],
  };
  write(next);
  return next;
}
