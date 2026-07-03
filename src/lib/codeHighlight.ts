// A tiny TS/JS tokenizer for drawing SYNTAX-HIGHLIGHTED code straight into a canvas (GitHub-Dark palette, which
// reads well on every dark code box). First matching rule wins; the gaps are default-coloured. Shared by the docs
// page and the home feature cards.
export const CODE_COL = { def: '#c9d1d9', com: '#8b949e', str: '#a5d6ff', kw: '#ff7b72', num: '#79c0ff', fn: '#d2a8ff' }
const CODE_RULES: [RegExp, string][] = [
  [/\/\/[^\n]*/, CODE_COL.com],
  [/'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"/, CODE_COL.str],
  [/\b(?:const|let|var|function|return|if|else|for|while|of|in|new|import|from|export|default|await|async|class|extends|typeof|instanceof|null|undefined|this|true|false)\b/, CODE_COL.kw],
  [/\b\d+(?:\.\d+)?\b/, CODE_COL.num],
  [/[A-Za-z_$][\w$]*(?=\s*\()/, CODE_COL.fn],
]
const CODE_MASTER = new RegExp(CODE_RULES.map((r) => '(' + r[0].source + ')').join('|'), 'g')

export function tokenizeCode(line: string): { t: string; c: string }[] {
  const out: { t: string; c: string }[] = []; let last = 0, m: RegExpExecArray | null
  CODE_MASTER.lastIndex = 0
  while ((m = CODE_MASTER.exec(line))) {
    if (m.index > last) out.push({ t: line.slice(last, m.index), c: CODE_COL.def })
    let c = CODE_COL.def; for (let i = 1; i < m.length; i++) if (m[i] !== undefined) { c = CODE_RULES[i - 1][1]; break }
    out.push({ t: m[0], c }); last = m.index + m[0].length
  }
  if (last < line.length) out.push({ t: line.slice(last), c: CODE_COL.def })
  return out
}

// Draw one line of highlighted code at the (x, y) baseline. Caller sets the font (mono) + textBaseline first.
export function drawCodeLine(cx: CanvasRenderingContext2D, line: string, x: number, y: number): void {
  cx.save(); cx.textAlign = 'left'
  let tx = x
  for (const tok of tokenizeCode(line)) { cx.fillStyle = tok.c; cx.fillText(tok.t, tx, y); tx += cx.measureText(tok.t).width }
  cx.restore()
}
