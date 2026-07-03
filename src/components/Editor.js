// Inlined into the playground page. A code pane + a live canvas pane + Run (Ctrl/Cmd+Enter). runUserCode
// and starterCode come from `use ... from "~/lib/playground.ts"` on the page. Styled with inline styles
// (reliable — not dependent on Tailwind scanning this JS file).
function mount(el) {
  el.style.cssText = 'display:flex; gap:16px; flex-wrap:wrap; align-items:stretch'

  const left = document.createElement('div')
  left.style.cssText = 'flex:1 1 380px; display:flex; flex-direction:column; gap:10px; min-width:300px'
  const ta = document.createElement('textarea')
  ta.value = starterCode(); ta.spellcheck = false
  ta.style.cssText = 'width:100%; height:440px; font:13px/1.55 ui-monospace,SFMono-Regular,Menlo,monospace; padding:16px; border-radius:14px; border:1px solid #1e293b; background:#0b1120; color:#e2e8f0; resize:vertical; tab-size:2; outline:none'
  const row = document.createElement('div')
  row.style.cssText = 'display:flex; gap:12px; align-items:center'
  const run = document.createElement('button')
  run.textContent = 'Run ▶'
  run.className = 'btn btn-default'   // shadcn button (.btn is real CSS in globals, not a JIT utility)
  const hint = document.createElement('span')
  hint.textContent = 'Ctrl / Cmd + Enter'
  hint.style.cssText = 'font:12px ui-monospace,monospace; color:#94a3b8'
  const err = document.createElement('div')
  err.style.cssText = 'color:#f43f5e; font:12px/1.4 ui-monospace,monospace; min-height:18px; white-space:pre-wrap'
  row.append(run, hint)
  left.append(ta, row, err)

  const host = document.createElement('div')
  host.style.cssText = 'flex:1 1 380px; min-width:300px; min-height:440px; display:flex; align-items:center; justify-content:center; background:#0b0f17; border-radius:14px; padding:14px; overflow:auto'
  el.append(left, host)

  const go = () => {
    err.textContent = ''
    try { runUserCode(host, ta.value) } catch (e) { err.textContent = String((e && e.message) || e) }
  }
  run.addEventListener('click', go)
  ta.addEventListener('keydown', (e) => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); go() } })
  go()
}
