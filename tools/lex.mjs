/**
 * A small JavaScript lexer, enough to find the strings in a module.
 *
 * The Bahasa Indonesia suite has to know which strings are really strings: a
 * regex-based sweep reads sentences out of comments, mistakes an apostrophe
 * for a quote, and cannot tell a template's literal text from the expressions
 * inside it. Each of those produced a wrong answer in both directions — work
 * invented, and real untranslated strings hidden.
 *
 * Walks source with an explicit context stack, yielding string literals and
 * template chunks while skipping comments and regex literals.
 * `${ }` pushes an expression context, so a template nested inside another
 * template's substitution is handled by the same loop rather than guessed at.
 */
export function scan(code) {
  const strings = [], templates = [];
  const n = code.length;
  let i = 0, prev = '';
  const stack = [];                       // {k:'tmpl',chunks,cur,raw} | {k:'expr',braces}
  while (i < n) {
    const top = stack[stack.length - 1];
    if (top && top.k === 'tmpl') {
      const c = code[i];
      if (c === '\\') { top.cur += code[i + 1] ?? ''; top.raw += code.slice(i, i + 2); i += 2; continue; }
      if (c === '`') { top.chunks.push(top.cur); templates.push({ chunks: top.chunks, raw: top.raw }); stack.pop(); i++; prev = 'x'; continue; }
      if (c === '$' && code[i + 1] === '{') { top.chunks.push(top.cur); top.cur = ''; top.raw += '${…}'; stack.push({ k: 'expr', braces: 0 }); i += 2; continue; }
      top.cur += c; top.raw += c; i++; continue;
    }
    const c = code[i];
    if (c === '/' && code[i + 1] === '/') { while (i < n && code[i] !== '\n') i++; continue; }
    if (c === '/' && code[i + 1] === '*') { i += 2; while (i < n && !(code[i] === '*' && code[i + 1] === '/')) i++; i += 2; continue; }
    if (c === '/' && !/[\w$)\]]/.test(prev)) {
      let j = i + 1, cls = false, done = false;
      while (j < n) {
        const d = code[j];
        if (d === '\\') { j += 2; continue; }
        if (d === '[') cls = true;
        else if (d === ']') cls = false;
        else if (d === '/' && !cls) { done = true; break; }
        else if (d === '\n') break;
        j++;
      }
      if (done) { i = j + 1; prev = '/'; continue; }
    }
    if (c === "'" || c === '"') {
      let j = i + 1, out = '';
      while (j < n) {
        if (code[j] === '\\') { out += code[j] + (code[j + 1] ?? ''); j += 2; continue; }
        if (code[j] === c || code[j] === '\n') break;
        out += code[j]; j++;
      }
      strings.push({ value: out.replace(/\\(['"\\])/g, '$1').replace(/\\n/g, '\n'), index: i });
      i = j + 1; prev = 'x'; continue;
    }
    if (c === '`') { stack.push({ k: 'tmpl', chunks: [], cur: '', raw: '' }); i++; continue; }
    if (top && top.k === 'expr') {
      if (c === '{') { top.braces++; i++; prev = c; continue; }
      if (c === '}') { if (top.braces === 0) { stack.pop(); i++; prev = 'x'; continue; } top.braces--; i++; prev = c; continue; }
    }
    if (!/\s/.test(c)) prev = c;
    i++;
  }
  return { strings, templates };
}
