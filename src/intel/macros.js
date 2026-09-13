import { store } from '../core/doc.js';
import { macros as loadMacros, saveMacro, deleteMacro } from './standards.js';

const UNRECORDABLE = new Set([
  'file.new', 'file.open', 'file.import', 'file.revert', 'file.sample',
  'file.clearAutosave', 'help.guide', 'help.source', 'help.issue',
  'view.fullscreen', 'add.import', 'sim.record',
  'macro.record', 'macro.stop', 'macro.manage', 'macro.run',
  'edit.undo', 'edit.redo',
]);
const NEEDS_SELECTION = /^(mod\.|edit\.delete|edit\.duplicate|op\.)/;

export class MacroRecorder {
  constructor(app) {
    this.app = app;
    this.recording = null;
    this.onChange = () => {};
  }
  get isRecording() { return !!this.recording; }
  get list() { return loadMacros(); }
  start(name) {
    this.recording = { name: name || 'New macro', steps: [], startedAt: Date.now(), skipped: [] };
    this.onChange();
  }
  capture(id) {
    if (!this.recording) return;
    if (UNRECORDABLE.has(id)) { this.recording.skipped.push(id); return; }
    this.recording.steps.push({ id });
    this.onChange();
  }
  cancel() { this.recording = null; this.onChange(); }
  stop() {
    const rec = this.recording;
    this.recording = null;
    this.onChange();
    if (!rec || !rec.steps.length) return null;
    const macro = {
      id: `m${Date.now().toString(36)}`,
      name: rec.name,
      steps: rec.steps,
      created: new Date().toISOString(),
      runs: 0,
      needsSelection: rec.steps.some(s => NEEDS_SELECTION.test(s.id)),
    };
    saveMacro(macro);
    return macro;
  }
  run(macro) {
    const cmds = macro.steps.map(s => this.app.commandMap.get(s.id)).filter(Boolean);
    if (!cmds.length) return { ok: false, ran: 0, failed: [], reason: 'None of its commands still exist.' };
    const failed = [];
    let ran = 0;
    store.batch(`Macro: ${macro.name}`, () => {
      for (const c of cmds) {
        try {
          if (c.enabled && !c.enabled()) { failed.push({ id: c.id, why: 'not available here' }); continue; }
          c.run();
          ran++;
        } catch (e) {
          failed.push({ id: c.id, why: e.message || String(e) });
        }
      }
    });
    const saved = { ...macro, runs: (macro.runs || 0) + 1, lastRun: new Date().toISOString() };
    saveMacro(saved);
    return { ok: ran > 0, ran, failed, total: cmds.length };
  }
  rename(id, name) {
    const m = loadMacros().find(x => x.id === id);
    if (!m) return null;
    const next = { ...m, name };
    saveMacro(next);
    return next;
  }
  remove(id) { return deleteMacro(id); }
}
export { UNRECORDABLE };
