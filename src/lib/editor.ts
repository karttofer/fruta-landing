// A p5.js-editor-style playground, built in real DOM (the editor is a DOM app — Monaco + live preview + a
// console — so we stop fighting the canvas here). Toolbar (Run/Stop/Auto-refresh), a Monaco pane with full fruta
// IntelliSense, a centred live preview, and a console that captures logs + errors. Driven by the PlaygroundEditor
// Custom; imports are real (this is a lib module). Reuses run.ts (runCode/stopCode) + the fruta types.
import { runCode as runUserCode, stopCode } from './run'
import { starterCode } from './playground'
import { FRUTA_DTS } from './frutaTypes'
import { FONT } from './fonts'
import { NAV_LINKS } from './nav'
import { LOGO_URL, LOGO_SIZE } from './logo'

type Instance = { destroy(): void }

const MONACO_CDN = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs'
let monacoP: Promise<any> | null = null
function loadMonaco(): Promise<any> {
  if (monacoP) return monacoP
  monacoP = new Promise((resolve) => {
    const w: any = globalThis as any
    if (typeof document === 'undefined' || !document.head) return resolve(null)
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

const h = (tag: string, css: string, props: Record<string, any> = {}) => { const e: any = document.createElement(tag); e.style.cssText = css; Object.assign(e, props); return e }
// same links + look as the canvas nav bar (nav.ts) so playground ↔ examples/docs don't visually jump.
const navLink = (label: string, to: string, ext?: boolean, active?: boolean) => {
  const base = active ? 'var(--primary)' : 'var(--foreground)'
  const a: any = h('a', 'color:' + base + '; text-decoration:none; font-size:14px; font-weight:' + (active ? '800' : '600'))
  a.textContent = label; a.href = to; if (ext) a.target = '_blank'
  a.onmouseenter = () => (a.style.color = 'var(--primary)'); a.onmouseleave = () => (a.style.color = base)
  return a
}

export function mountEditor(el: HTMLElement): Instance {
  el.style.cssText = 'position:fixed; inset:0; display:flex; flex-direction:column; background:var(--background); font-family:' + FONT.sans

  // ── toolbar ── (fruta-branded: cherry accents, a warm cream bar, controls grouped in a soft well)
  const bar = h('div', 'display:flex; align-items:center; gap:14px; padding:10px 18px; border-bottom:1px solid var(--border); background:var(--card); flex-wrap:wrap; box-shadow:0 2px 10px rgba(207,59,37,0.04)')
  const logo: any = h('a', 'display:flex; align-items:center; text-decoration:none', { href: '/' })
  logo.append(h('img', 'width:' + LOGO_SIZE + 'px; height:' + LOGO_SIZE + 'px; display:block', { src: LOGO_URL, alt: 'fruta' }))
  const controls = h('div', 'display:flex; align-items:center; gap:8px; padding:5px 8px; background:var(--muted); border:1px solid var(--border); border-radius:12px')
  const runBtn: any = h('button', 'cursor:pointer'); runBtn.className = 'btn btn-default btn-sm'; runBtn.textContent = '▶  Run'
  const stopBtn: any = h('button', 'cursor:pointer'); stopBtn.className = 'btn btn-ghost btn-sm'; stopBtn.textContent = '■  Stop'
  const autoWrap: any = h('label', 'display:flex; align-items:center; gap:6px; font-size:13.5px; font-weight:600; color:var(--foreground); cursor:pointer; user-select:none; padding:0 4px')
  const auto: any = h('input', 'accent-color:var(--primary); width:15px; height:15px; cursor:pointer', { type: 'checkbox', checked: true }); autoWrap.append(auto, document.createTextNode('Auto-run'))
  controls.append(runBtn, stopBtn, h('div', 'width:1px; height:20px; background:var(--border)'), autoWrap)
  const spacer = h('div', 'flex:1')
  const badge: any = h('a', 'font-size:12px; font-weight:800; color:#fff; background:var(--primary); padding:4px 11px; border-radius:999px; text-decoration:none; box-shadow:0 3px 12px color-mix(in oklab, var(--primary) 45%, transparent)', { href: 'https://www.npmjs.com/package/fruta', target: '_blank' }); badge.textContent = 'fruta · alpha'
  const path = typeof location !== 'undefined' ? location.pathname : ''
  // nav: inline links on wide screens; a hamburger + dropdown submenu on narrow ones (matches the canvas nav)
  const navRow = h('div', 'display:flex; align-items:center; gap:22px')
  for (const l of NAV_LINKS) navRow.append(navLink(l.s, l.to, (l as any).ext, l.to === path))
  navRow.append(badge)
  const menu = h('div', 'position:absolute; top:100%; right:14px; margin-top:6px; display:none; flex-direction:column; min-width:190px; background:var(--card); border:1px solid var(--border); border-radius:14px; box-shadow:0 14px 34px rgba(20,12,6,0.18); padding:6px; z-index:50')
  const closeMenu = () => { menu.style.display = 'none' }
  NAV_LINKS.forEach((l, i) => {
    const a: any = navLink(l.s, l.to, (l as any).ext, l.to === path)
    a.style.cssText += '; display:block; padding:10px 14px; border-radius:9px; font-size:15px' + (i > 0 ? '; border-top:1px solid var(--border)' : '')
    a.addEventListener('click', closeMenu)
    menu.append(a)
  })
  const burger: any = h('button', 'display:none; flex-direction:column; gap:4px; background:none; border:none; cursor:pointer; padding:8px')
  for (let i = 0; i < 3; i++) burger.append(h('span', 'width:22px; height:2.5px; border-radius:2px; background:var(--foreground)'))
  burger.onclick = (e: Event) => { e.stopPropagation(); menu.style.display = menu.style.display === 'none' ? 'flex' : 'none' }
  if (document.addEventListener) document.addEventListener('click', closeMenu)   // click elsewhere closes the submenu
  bar.style.position = 'relative'
  bar.append(logo, spacer, navRow, burger, menu)

  // ── main split (editor | preview) ──
  const paneHead = (color: string, label: string) => { const d = h('div', 'display:flex; align-items:center; gap:8px; padding:8px 14px; font-size:12.5px; font-weight:600; color:var(--muted-foreground); border-bottom:1px solid var(--border); background:var(--card)'); const t = h('span', ''); t.textContent = label; d.append(h('span', 'width:9px; height:9px; border-radius:50%; background:' + color), t); return d }
  const edWrap = h('div', 'flex:1; display:flex; flex-direction:column; min-width:0; border-right:1px solid var(--border)')
  const edDiv = h('div', 'flex:1; min-height:0; background:#1e1e1e')
  const edHead = paneHead('#cf3b25', 'sketch.ts')                        // vermilion dot; Run/Stop/Auto-run live here, with the code
  controls.style.marginLeft = 'auto'; edHead.style.padding = '6px 12px'; edHead.append(controls)
  edWrap.append(edHead, edDiv)
  const pvWrap = h('div', 'flex:1; display:flex; flex-direction:column; min-width:0')
  const host = h('div', 'flex:1; min-height:0; display:flex; align-items:center; justify-content:center; overflow:hidden; background:#0b0f17')
  pvWrap.append(paneHead('#2c8c7c', 'Preview'), host)                   // teal dot
  const main = h('div', 'display:flex; flex:1; min-height:0')
  main.append(edWrap, pvWrap)

  // ── console ── (dark panel, fruta-coloured levels: warn = ochre, error = vermilion)
  const con = h('div', 'height:150px; display:flex; flex-direction:column; border-top:1px solid var(--border); background:#0d1117')
  const conHead = h('div', 'display:flex; align-items:center; gap:10px; padding:7px 14px; font-size:12.5px; color:#8b949e; border-bottom:1px solid rgba(255,255,255,0.06)')
  const conTitle = h('span', 'font-weight:700; color:#c9d1d9'); conTitle.textContent = 'Console'
  const conCount = h('span', 'color:#57606a'); conCount.textContent = ''
  const clearBtn: any = h('span', 'margin-left:auto; cursor:pointer; color:#8b949e; font-weight:600'); clearBtn.textContent = 'Clear'; clearBtn.onmouseenter = () => (clearBtn.style.color = 'var(--primary)'); clearBtn.onmouseleave = () => (clearBtn.style.color = '#8b949e')
  conHead.append(conTitle, conCount, clearBtn)
  const conBody = h('div', 'flex:1; overflow:auto; padding:8px 14px; font:12.5px/1.6 ' + FONT.mono + '; color:#c9d1d9')
  con.append(conHead, conBody)

  el.append(bar, main, con)

  const LVL: Record<string, string> = { log: '#c9d1d9', info: '#67d4ff', warn: '#e2a636', error: '#ff6b6b' }
  let lastEl: any = null, lastKey = '', lastN = 1, total = 0
  const fmt = (a: any): string => {
    if (a instanceof Error) return a.stack || (a.name + ': ' + a.message)   // Errors JSON.stringify to "{}" — show the real thing
    if (a && typeof a === 'object') { try { return JSON.stringify(a) } catch { return String(a) } }
    return String(a)
  }
  const logLine = (kind: string, args: any[]) => {
    const c = LVL[kind] || LVL.log
    // honour %c styled logs (e.g. the fruta banner): drop the "%c" markers and their trailing CSS args
    let parts = args
    if (typeof args[0] === 'string' && args[0].indexOf('%c') >= 0) { const n = (args[0].match(/%c/g) || []).length; parts = [args[0].replace(/%c/g, '')].concat(args.slice(1 + n)) }
    const text = parts.map(fmt).join(' ')
    total++; conCount.textContent = total + (total === 1 ? ' message' : ' messages')
    const key = kind + '|' + text
    if (lastEl && key === lastKey) { lastN++; lastEl._n.textContent = '×' + lastN; conBody.scrollTop = conBody.scrollHeight; return }   // collapse repeats (loop spam)
    lastKey = key; lastN = 1
    const d: any = h('div', 'display:flex; gap:10px; padding:2px 0 2px 9px; white-space:pre-wrap; border-left:2px solid ' + c + '; color:' + c)
    const txt = h('span', 'flex:1; min-width:0; word-break:break-word'); txt.textContent = text
    const nEl = h('span', 'color:#57606a; font-size:11px; align-self:center'); nEl.textContent = ''
    d._n = nEl; d.append(txt, nEl)
    conBody.appendChild(d); lastEl = d; conBody.scrollTop = conBody.scrollHeight
    while (conBody.childElementCount > 300) { const fc = conBody.firstChild; if (fc === lastEl) lastEl = null; conBody.removeChild(fc as Node) }
  }
  clearBtn.onclick = () => { conBody.textContent = ''; lastEl = null; lastKey = ''; total = 0; conCount.textContent = '' }

  // capture console + uncaught errors while the editor is mounted
  const orig: Record<string, any> = {}
  for (const k of ['log', 'info', 'warn', 'error'] as const) { orig[k] = (console as any)[k]; (console as any)[k] = (...a: any[]) => { logLine(k === 'error' ? 'error' : k === 'warn' ? 'warn' : 'log', a); orig[k].apply(console, a) } }
  const onErr = (e: any) => logLine('error', [(e && (e.message || (e.reason && e.reason.message) || e.reason)) || 'Error'])
  window.addEventListener('error', onErr); window.addEventListener('unhandledrejection', onErr)

  const fitPreview = () => {
    const c: any = host.querySelector('canvas'); if (!c) return
    const r = (c.dataset && parseFloat(c.dataset.frutaDpr)) || 1, lw = c.width / r, lh = c.height / r
    const iw = host.clientWidth - 24, ih = host.clientHeight - 24
    if (iw <= 0 || ih <= 0) return
    const s = Math.min(iw / lw, ih / lh, 1)
    c.style.cssText = 'display:block; width:' + Math.round(lw * s) + 'px; height:' + Math.round(lh * s) + 'px; border-radius:6px; box-shadow:0 6px 30px rgba(0,0,0,0.4)'
  }

  let editor: any = null, monacoRef: any = null, autoTimer: any = null
  const getCode = async (): Promise<string> => {
    if (!editor) return starterCode()
    if (!monacoRef) return editor.getValue()
    try { const model = editor.getModel(), worker = await monacoRef.languages.typescript.getTypeScriptWorker(), client = await worker(model.uri); const out = await client.getEmitOutput(model.uri.toString()); return (out.outputFiles && out.outputFiles[0] && out.outputFiles[0].text) || editor.getValue() } catch { return editor.getValue() }
  }
  const run = () => { getCode().then((code) => { try { runUserCode(host, code); setTimeout(fitPreview, 20) } catch (e) { logLine('error', ['⚠ ' + String((e && (e as any).message) || e)]) } }) }
  const stop = () => stopCode(host)
  const scheduleAuto = () => { if (!auto.checked) return; clearTimeout(autoTimer); autoTimer = setTimeout(run, 800) }

  runBtn.onclick = () => run()
  stopBtn.onclick = () => stop()

  loadMonaco().then((monaco: any) => {
    if (!monaco) {                                                  // CDN blocked → textarea fallback
      const ta: any = h('textarea', 'width:100%; height:100%; box-sizing:border-box; font:13px/1.55 ' + FONT.mono + '; padding:14px; border:none; outline:none; resize:none; background:#1e1e1e; color:#e2e8f0; tab-size:2', { value: starterCode(), spellcheck: false })
      ta.addEventListener('keydown', (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); run() } })
      ta.addEventListener('input', scheduleAuto)
      edDiv.appendChild(ta); editor = { getValue: () => ta.value, dispose() {} }; run()
      return
    }
    if (editor) return
    monacoRef = monaco; setupTs(monaco)
    editor = monaco.editor.create(edDiv, { value: starterCode(), language: 'typescript', theme: 'vs-dark', minimap: { enabled: false }, fontSize: 14, fontFamily: FONT.mono, automaticLayout: true, scrollBeyondLastLine: false, padding: { top: 12 }, tabSize: 2, renderLineHighlight: 'line', smoothScrolling: true })
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => run())
    editor.onDidChangeModelContent(scheduleAuto)
    run()
  }).catch(() => {})

  const applyLayout = () => {
    const w = window.innerWidth, narrow = w < 820, mobileNav = w < 720
    main.style.flexDirection = narrow ? 'column' : 'row'
    edWrap.style.borderRight = narrow ? 'none' : '1px solid var(--border)'
    edWrap.style.borderBottom = narrow ? '1px solid var(--border)' : 'none'
    con.style.height = narrow ? '120px' : '150px'
    // collapse the nav into the hamburger + submenu below 720 (same breakpoint as the canvas nav)
    navRow.style.display = mobileNav ? 'none' : 'flex'
    burger.style.display = mobileNav ? 'flex' : 'none'
    if (!mobileNav) closeMenu()
    setTimeout(fitPreview, 60)
  }
  applyLayout()
  const onResize = () => applyLayout()
  window.addEventListener('resize', onResize)

  return { destroy() { window.removeEventListener('resize', onResize); window.removeEventListener('error', onErr); window.removeEventListener('unhandledrejection', onErr); if (document.removeEventListener) document.removeEventListener('click', closeMenu); for (const k of Object.keys(orig)) (console as any)[k] = orig[k]; stop(); if (editor) editor.dispose(); el.replaceChildren() } }
}
