const DEFAULT_ID = 'default';
export function emptyConfigs() {
  return {
    active: DEFAULT_ID,
    list: [{ id: DEFAULT_ID, name: 'Default', overrides: {}, note: 'The design as drawn.' }],
  };
}
export function ensure(doc) {
  if (!doc.configs || !Array.isArray(doc.configs.list) || !doc.configs.list.length) {
    doc.configs = emptyConfigs();
  }
  if (!doc.configs.list.some(c => c.id === doc.configs.active)) {
    doc.configs.active = doc.configs.list[0].id;
  }
  return doc.configs;
}
export const activeConfig = (doc) => ensure(doc).list.find(c => c.id === doc.configs.active) || null;
export const configs = (doc) => ensure(doc).list;
export function activate(doc, id) {
  const cfg = ensure(doc);
  const target = cfg.list.find(c => c.id === id);
  if (!target) return false;
  const current = cfg.list.find(c => c.id === cfg.active);
  if (current && current.id !== DEFAULT_ID) capture(doc, current);
  cfg.active = id;
  apply(doc, target);
  return true;
}
export function apply(doc, cfg) {
  const base = cfg.id === DEFAULT_ID ? {} : cfg.overrides || {};
  for (const p of doc.params) {
    if (Object.prototype.hasOwnProperty.call(base, p.name)) {
      p.value = base[p.name];
    } else if (Object.prototype.hasOwnProperty.call(doc.configs.baseline || {}, p.name)) {
      p.value = doc.configs.baseline[p.name];
    }
  }
}
export function capture(doc, cfg) {
  const baseline = ensure(doc).baseline || {};
  const out = {};
  for (const p of doc.params) {
    if (!Object.prototype.hasOwnProperty.call(baseline, p.name)) continue;
    if (String(p.value) !== String(baseline[p.name])) out[p.name] = p.value;
  }
  cfg.overrides = out;
  return out;
}
export function syncBaseline(doc) {
  const cfg = ensure(doc);
  if (cfg.active !== DEFAULT_ID) return;
  cfg.baseline = Object.fromEntries(doc.params.map(p => [p.name, p.value]));
}
export function addConfig(doc, name, { from = null } = {}) {
  const cfg = ensure(doc);
  const id = `c${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
  const src = from ? cfg.list.find(c => c.id === from) : cfg.list.find(c => c.id === cfg.active);
  cfg.list.push({
    id, name: uniqueName(cfg.list, name || 'Variant'),
    overrides: { ...(src?.overrides || {}) },
    note: '',
  });
  return id;
}
export function removeConfig(doc, id) {
  const cfg = ensure(doc);
  if (id === DEFAULT_ID) return false;
  cfg.list = cfg.list.filter(c => c.id !== id);
  if (cfg.active === id) activate(doc, DEFAULT_ID);
  return true;
}
export function renameConfig(doc, id, name) {
  const c = ensure(doc).list.find(x => x.id === id);
  if (!c) return false;
  c.name = uniqueName(ensure(doc).list.filter(x => x.id !== id), name);
  return true;
}
function uniqueName(list, name) {
  const taken = new Set(list.map(c => c.name));
  if (!taken.has(name)) return name;
  let i = 2;
  while (taken.has(`${name} ${i}`)) i++;
  return `${name} ${i}`;
}
export function familyTable(doc) {
  const cfg = ensure(doc);
  const baseline = cfg.baseline || Object.fromEntries(doc.params.map(p => [p.name, p.value]));
  const columns = [...new Set(cfg.list.flatMap(c => Object.keys(c.overrides || {})))].sort();
  const rows = cfg.list.map(c => ({
    id: c.id, name: c.name, active: c.id === cfg.active, note: c.note || '',
    values: Object.fromEntries(columns.map(k => [k, c.overrides?.[k] ?? baseline[k] ?? ''])),
  }));
  return { columns, rows, baseline };
}
export function familyCSV(doc) {
  const { columns, rows } = familyTable(doc);
  const head = ['Configuration', ...columns, 'Note'];
  const body = rows.map(r => [r.name, ...columns.map(k => r.values[k]), r.note]);
  return [head, ...body]
    .map(r => r.map(c => (/[",\n]/.test(String(c)) ? `"${String(c).replace(/"/g, '""')}"` : c)).join(','))
    .join('\n');
}
export { DEFAULT_ID };
