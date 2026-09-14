/**
 * Bahasa Indonesia for TesserCADIna.
 *
 * `t()` looks a user-visible English string up and returns the Indonesian one.
 * It is idempotent, so a string that has already been translated passes
 * through unchanged, and a string with no entry passes through as it arrived:
 * the failure mode is the wrong language rather than a blank interface.
 *
 * The table itself is in two files beside this one, split by what the strings
 * are rather than by where they are used, because at fourteen hundred entries
 * one file stops being reviewable. Coverage is not a matter of diligence: the
 * suite in tools/tests/i18n.mjs sweeps the source for strings that reach a
 * user and fails when one of them has no entry here.
 *
 * Familiar CAD community terms stay in English (Extrude, Boolean, STL, Gizmo,
 * Undo, Draft, Snap, Ortho, ISO, DXF, …), recorded as an entry mapping to
 * itself so the decision is visible rather than implied by an absence.
 */
import { INTERFACE } from './lang-interface.js';
import { PROSE } from './lang-prose.js';

const ID = { ...INTERFACE, ...PROSE };


export function t(s) {
  if (s == null || s === '') return s;
  const key = String(s);
  if (Object.prototype.hasOwnProperty.call(ID, key)) return ID[key];
  return key;
}

/** Translate `en` then replace `{name}` style placeholders. */
export function tfmt(en, vars = {}) {
  let s = t(en);
  for (const [k, v] of Object.entries(vars)) {
    s = s.replaceAll(`{${k}}`, String(v ?? ''));
  }
  return s;
}

export function translateCatalog(catalog, materials) {
  if (catalog) {
    for (const cat of Object.values(catalog)) {
      if (cat.label) cat.label = t(cat.label);
      for (const f of cat.fields || []) {
        if (f.label) f.label = t(f.label);
        if (Array.isArray(f.options)) {
          f.options = f.options.map(([k, l]) => [k, t(l)]);
        }
      }
    }
  }
  if (materials) {
    for (const m of Object.values(materials)) {
      if (m.name) m.name = t(m.name);
    }
  }
}

export { ID };
