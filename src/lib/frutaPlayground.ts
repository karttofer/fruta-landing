// Playground, drawn in fruta (rose period). Chrome — nav, title, the two framed panels, the Run button — is all
// drawn + hit-tested in the fruta canvas. The two bits that must be DOM are framed by it: a <textarea> (you can't
// type into a canvas) and the live preview node (its own fruta canvas via runUserCode). Responsive: on resize
// the chrome rebuilds and the overlays reposition; below 720px the panels stack.
import Fruta from 'fruta'
import { PERIODS, go, drawScene, textKit, type Instance } from './frutaPage'
import { runUserCode, starterCode } from './playground'
import { FONT, ensureFonts } from './fonts'
import { drawNavBar, type NavHit } from './nav'
import { FRUTA_DTS } from './frutaTypes'

// Monaco (VS Code's editor) — lazy-loaded from a CDN, ONLY on the playground, so it never bloats the rest of the
// site or the bundle. Its TS worker gives real IntelliSense; we feed it the fruta types for API autocomplete.
const MONACO_CDN = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs'
let monacoP: Promise<any> | null = null
function loadMonaco(): Promise<any> {
  if (monacoP) return monacoP
  monacoP = new Promise((resolve) => {
    const w: any = globalThis as any
    if (typeof document === 'undefined' || !document.head) return resolve(null)   // non-DOM (tests)
    if (w.monaco) return resolve(w.monaco)
    w.MonacoEnvironment = { getWorkerUrl: () => 'data:text/javascript;charset=utf-8,' + encodeURIComponent(`self.MonacoEnvironment={baseUrl:'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/'};importScripts('${MONACO_CDN}/base/worker/workerMain.js');`) }
    const s = document.createElement('script'); s.src = MONACO_CDN + '/loader.js'
    s.onload = () => { w.require.config({ paths: { vs: MONACO_CDN } }); w.require(['vs/editor/editor.main'], () => resolve(w.monaco)) }
    s.onerror = () => resolve(null)
    document.head.appendChild(s)
  })
  return monacoP
}
let tsReady = false
function setupTs(monaco: any) {
  if (tsReady) return; tsReady = true
  const ts = monaco.languages.typescript
  ts.typescriptDefaults.setCompilerOptions({ target: ts.ScriptTarget.ES2020, allowNonTsExtensions: true, lib: ['es2020', 'dom'], noEmit: true })
  ts.typescriptDefaults.addExtraLib(FRUTA_DTS, 'file:///fruta-globals.d.ts')
}

export function paintPlayground(el: HTMLElement): Instance {
  ensureFonts()
  const p = PERIODS.rose
  el.style.cssText = 'position:fixed; inset:0; z-index:40; overflow:hidden; background:' + p.bg
  let f: any = null, alive = true
  let hits: { x: number; y: number; w: number; h: number; fn: () => void }[] = []
  const navMenu = { open: false }; let navHits: NavHit[] = []

  const edDiv = document.createElement('div')
  edDiv.style.cssText = 'position:absolute; overflow:hidden; border-radius:12px; background:#1e1e1e'
  const host = document.createElement('div')
  host.style.cssText = 'position:absolute; overflow:hidden; border-radius:12px; background:#0b0f17; display:flex; align-items:center; justify-content:center'
  const errEl = document.createElement('div')
  errEl.style.cssText = 'color:#ff7a7a; font:13px/1.55 "JetBrains Mono",ui-monospace,monospace; padding:16px; white-space:pre-wrap; max-width:92%; text-align:left'
  let editor: any = null, monacoRef: any = null, autoTimer: any = null
  // fit the user's canvas into the preview, centred, never upscaled (host is flex-centred → it centres)
  const fitPreview = () => {
    const c: any = host.querySelector && host.querySelector('canvas'); if (!c) return
    const r = (c.dataset && parseFloat(c.dataset.frutaDpr)) || 1, lw = c.width / r, lh = c.height / r
    const iw = host.clientWidth - 22, ih = host.clientHeight - 22
    if (iw <= 0 || ih <= 0) return
    const s = Math.min(iw / lw, ih / lh, 1)
    c.style.cssText = 'display:block; width:' + Math.round(lw * s) + 'px; height:' + Math.round(lh * s) + 'px; border-radius:6px'
  }
  // The code runs via new Function (JS), so strip TS types first — Monaco's own TS worker emits the JS.
  const getCode = async (): Promise<string> => {
    if (!editor) return starterCode()
    if (!monacoRef) return editor.getValue()                        // textarea fallback (no transpile needed)
    try {
      const model = editor.getModel(), worker = await monacoRef.languages.typescript.getTypeScriptWorker(), client = await worker(model.uri)
      const out = await client.getEmitOutput(model.uri.toString())
      return (out.outputFiles && out.outputFiles[0] && out.outputFiles[0].text) || editor.getValue()
    } catch { return editor.getValue() }
  }
  const run = () => { getCode().then((code) => { try { runUserCode(host, code); setTimeout(fitPreview, 20) } catch (e) { host.replaceChildren(errEl); errEl.textContent = '⚠  ' + String((e && (e as any).message) || e) } }) }
  loadMonaco().then((monaco: any) => {
    if (!monaco) {                                                  // CDN blocked / offline → plain textarea fallback
      if (typeof document !== 'undefined' && document.head && !editor) {
        const ta = document.createElement('textarea'); ta.value = starterCode(); ta.spellcheck = false
        ta.style.cssText = 'width:100%; height:100%; box-sizing:border-box; font:13px/1.55 "JetBrains Mono",ui-monospace,monospace; padding:12px; border:none; outline:none; resize:none; background:#1e1e1e; color:#e2e8f0; tab-size:2'
        ta.addEventListener('keydown', (e) => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); run() } })
        ta.addEventListener('input', () => { clearTimeout(autoTimer); autoTimer = setTimeout(run, 800) })   // auto-run in the fallback too
        edDiv.appendChild(ta); editor = { getValue: () => ta.value, dispose() {} }; run()
      }
      return
    }
    if (editor) return
    monacoRef = monaco; setupTs(monaco)
    editor = monaco.editor.create(edDiv, { value: starterCode(), language: 'typescript', theme: 'vs-dark', minimap: { enabled: false }, fontSize: 14, fontFamily: '"JetBrains Mono", ui-monospace, monospace', automaticLayout: true, scrollBeyondLastLine: false, padding: { top: 12, bottom: 12 }, tabSize: 2, renderLineHighlight: 'none', smoothScrolling: true })
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => run())
    editor.onDidChangeModelContent(() => { clearTimeout(autoTimer); autoTimer = setTimeout(run, 800) })   // auto-run LIVE, debounced (p5-editor feel)
    run()
  }).catch(() => {})

  const build = () => {
    if (f) f.destroy()
    const W = Math.max(320, window.innerWidth), H = Math.max(400, window.innerHeight)
    f = Fruta({ width: W, height: H, background: p.bg, mount: el, dpr: true })
    if (f.canvas) f.canvas.style.cssText = 'display:block; width:100vw; height:100vh'
    el.appendChild(edDiv); el.appendChild(host)
    const cx: CanvasRenderingContext2D = f.context, T = textKit(cx), S = Math.min(W, H)
    const NAVH = Math.max(56, S * 0.075)

    f.onPress((pt: { x: number; y: number }) => {
      const nb = navHits.find((r) => pt.x >= r.x && pt.x <= r.x + r.w && pt.y >= r.y && pt.y <= r.y + r.h); if (nb) { nb.fn(); return }
      if (navMenu.open) { navMenu.open = false; return }
      const b = hits.find((r) => pt.x >= r.x && pt.x <= r.x + r.w && pt.y >= r.y && pt.y <= r.y + r.h); if (b) b.fn()
    })

    f.loop((_dt: number, t: number) => {
      f.background(p.bg)
      drawScene(f, W, H, S, t, p, 0.1)
      hits = []
      const mx = f.mouse.x, my = f.mouse.y
      const fs = Math.max(14, Math.round(S * 0.02)), pad = Math.max(16, W * 0.03)

      // header
      let hy = NAVH + 22
      T.line('Playground', pad, hy + fs * 1.6, Math.round(fs * 2), p.ink, '800', 'left', FONT.display)
      // Run button (right of title)
      const rl = 'Run  ▶', rw = T.measure(rl, fs, '700') + fs * 2, rbx = W - pad - rw, rby = hy + fs * 0.2
      f.rect({ x: rbx, y: rby, w: rw, h: fs * 2.4, radius: fs * 1.2, fill: p.accent })
      T.line(rl, rbx + rw / 2, rby + fs * 1.55, fs, '#fff', '700', 'center')
      hits.push({ x: rbx, y: rby, w: rw, h: fs * 2.4, fn: run })
      T.line('Runs live as you type · Ctrl / Cmd + Enter to run now · Fruta is in scope', pad, hy + fs * 2.7, fs * 0.85, p.muted, '500')
      hy += fs * 3.8

      // two panels (side by side on wide, stacked on narrow)
      const wide = W > 720, gap = 16
      let ed: { x: number; y: number; w: number; h: number }, pv: { x: number; y: number; w: number; h: number }
      if (wide) { const cw = (W - pad * 2 - gap) / 2, h = H - hy - 20; ed = { x: pad, y: hy, w: cw, h }; pv = { x: pad + cw + gap, y: hy, w: cw, h } }
      else { const h = (H - hy - 20 - gap) / 2; ed = { x: pad, y: hy, w: W - pad * 2, h }; pv = { x: pad, y: hy + h + gap, w: W - pad * 2, h } }
      f.rect({ x: ed.x, y: ed.y, w: ed.w, h: ed.h, radius: 14, fill: '#241210' })
      f.rect({ x: pv.x, y: pv.y, w: pv.w, h: pv.h, radius: 14, fill: '#0b0f17' })
      edDiv.style.left = ed.x + 5 + 'px'; edDiv.style.top = ed.y + 5 + 'px'; edDiv.style.width = ed.w - 10 + 'px'; edDiv.style.height = ed.h - 10 + 'px'
      host.style.left = pv.x + 'px'; host.style.top = pv.y + 'px'; host.style.width = pv.w + 'px'; host.style.height = pv.h + 'px'

      // ── responsive nav (links wide, hamburger + dropdown narrow) ──
      navHits = []
      drawNavBar({ f, cx, W, H, S, navH: NAVH, ink: p.ink, accent: p.accent, bg: p.bg, path: typeof location !== 'undefined' ? location.pathname : '', menu: navMenu, hits: navHits, onNav: (to, ext) => go(to, ext) })

      if (f.canvas) f.canvas.style.cursor = hits.some((r) => mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) || navHits.some((r) => mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) ? 'pointer' : 'default'
      const vis = navMenu.open ? 'none' : 'block'; edDiv.style.display = vis; host.style.display = vis   // hide DOM overlays so the menu is on top
    })
    run()
  }

  let rz: any
  const onResize = () => { clearTimeout(rz); rz = setTimeout(() => { if (alive) { build(); setTimeout(fitPreview, 220) } }, 160) }
  window.addEventListener('resize', onResize)
  build()
  return { destroy() { alive = false; window.removeEventListener('resize', onResize); if (f) f.destroy(); if (editor) editor.dispose(); edDiv.remove(); host.remove() } }
}
