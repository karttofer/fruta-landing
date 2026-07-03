// Examples page, drawn in fruta (blue period). The chrome — nav, scrollable list, header, preview frame, the
// Preview/Code toggle — is all drawn in the fruta canvas + hit-tested. The two things that must be real DOM are
// framed by it: the live example (its own fruta canvas, mounted in an overlay div) and, in Code mode, the raw
// source (drawn as fruta monospace text — no DOM). Responsive: rebuilt on resize, overlay repositioned.
import Fruta from 'fruta'
import { PERIODS, go, drawScene, textKit, type Instance } from './frutaPage'
import { EXAMPLES, runExample } from './examples'
import { FONT, ensureFonts } from './fonts'
import { drawNavBar, type NavHit } from './nav'

// A cubist category banner colour per section.
const CAT_COLORS: Record<string, string> = { Graphics: '#2f77b8', Science: '#123e88', Math: '#5f7a3a', Physics: '#cf6a4a', Games: '#d1462f' }
const catColor = (c: string) => CAT_COLORS[c] || '#8a8574'

// Draw a CUBIST FRUIT (Picasso + frutas) from fruta primitives — 6 kinds cycled by index, each fragmented with a
// bold ink outline + a shaded facet. This is the examples menu's icon; on-brand for "fruta".
function drawFruit(f: any, i: number, x: number, y: number, r: number, rot: number, ink: string) {
  f.push({ x, y, rotate: rot })
  const k = i % 6
  if (k === 0) {                                              // cherries (🍒)
    f.line({ x1: 0, y1: -r * 1.3, x2: -r * 0.5, y2: -r * 0.1, stroke: ink, strokeWidth: 2, cap: 'round' })
    f.line({ x1: 0, y1: -r * 1.3, x2: r * 0.55, y2: -r * 0.1, stroke: ink, strokeWidth: 2, cap: 'round' })
    f.polygon({ points: [{ x: 0, y: -r * 1.35 }, { x: r * 0.85, y: -r * 1.95 }, { x: r * 0.55, y: -r * 1.05 }], fill: '#5f7a3a', stroke: ink, strokeWidth: 1.5 })
    f.circle({ x: -r * 0.5, y: r * 0.4, r: r * 0.62, fill: '#cf3b25', stroke: ink, strokeWidth: 2 })
    f.circle({ x: r * 0.55, y: r * 0.55, r: r * 0.55, fill: '#df728c', stroke: ink, strokeWidth: 2 })
  } else if (k === 1) {                                       // lemon
    f.ngon({ x: 0, y: 0, r, sides: 7, rotation: 18, fill: '#e2a636', stroke: ink, strokeWidth: 2 })
    f.polygon({ points: [{ x: -r, y: 0 }, { x: 0, y: -r * 0.9 }, { x: 0, y: r * 0.9 }], fill: 'rgba(0,0,0,0.13)' })
    f.circle({ x: r * 0.95, y: 0, r: r * 0.14, fill: '#c98a1e', stroke: ink, strokeWidth: 1 })
  } else if (k === 2) {                                       // grapes
    const g: [number, number][] = [[-r * 0.5, r * 0.1], [r * 0.5, r * 0.1], [0, r * 0.55], [-r * 0.25, -r * 0.4], [r * 0.25, -r * 0.4], [0, r * 1.05]]
    f.polygon({ points: [{ x: -r * 0.1, y: -r * 0.9 }, { x: r * 0.7, y: -r * 1.35 }, { x: r * 0.35, y: -r * 0.6 }], fill: '#5f7a3a', stroke: ink, strokeWidth: 1.5 })
    for (const [gx, gy] of g) f.circle({ x: gx, y: gy, r: r * 0.42, fill: '#6b3fa0', stroke: ink, strokeWidth: 1.5 })
  } else if (k === 3) {                                       // pear
    f.circle({ x: 0, y: r * 0.45, r: r * 0.82, fill: '#8fae3a', stroke: ink, strokeWidth: 2 })
    f.circle({ x: 0, y: -r * 0.45, r: r * 0.5, fill: '#a7c24e', stroke: ink, strokeWidth: 2 })
    f.polygon({ points: [{ x: -r, y: r * 0.55 }, { x: 0, y: -r * 0.2 }, { x: 0, y: r * 1.2 }], fill: 'rgba(0,0,0,0.1)' })
    f.line({ x1: 0, y1: -r * 0.95, x2: r * 0.2, y2: -r * 1.4, stroke: ink, strokeWidth: 2, cap: 'round' })
  } else if (k === 4) {                                       // orange
    f.circle({ x: 0, y: 0, r: r * 0.95, fill: '#e07b39', stroke: ink, strokeWidth: 2 })
    f.polygon({ points: [{ x: 0, y: -r * 0.95 }, { x: r * 0.95, y: 0 }, { x: 0, y: 0 }], fill: 'rgba(0,0,0,0.11)' })
    f.polygon({ points: [{ x: -r * 0.1, y: -r * 0.85 }, { x: r * 0.5, y: -r * 1.25 }, { x: r * 0.25, y: -r * 0.65 }], fill: '#5f7a3a', stroke: ink, strokeWidth: 1.5 })
  } else {                                                    // plum
    f.circle({ x: 0, y: 0, r: r * 0.95, fill: '#7a3f6b', stroke: ink, strokeWidth: 2 })
    f.polygon({ points: [{ x: 0, y: -r * 0.95 }, { x: 0, y: r * 0.95 }, { x: r * 0.95, y: 0 }], fill: 'rgba(0,0,0,0.15)' })
    f.circle({ x: -r * 0.3, y: -r * 0.3, r: r * 0.16, fill: 'rgba(255,255,255,0.45)' })
  }
  f.pop()
}

export function paintExamples(el: HTMLElement): Instance {
  ensureFonts()
  const p = PERIODS.blue
  el.style.cssText = 'position:fixed; inset:0; z-index:40; overflow:hidden; background:' + p.bg
  let f: any = null, alive = true
  let sel = EXAMPLES[0].name, tab: 'preview' | 'code' = 'preview'
  let listScroll = 0, codeScroll = 0, listH = 0, codeH = 0
  let hits: { x: number; y: number; w: number; h: number; fn: () => void }[] = []
  const navMenu = { open: false }; let navHits: NavHit[] = []
  const preview = document.createElement('div')
  preview.style.cssText = 'position:absolute; overflow:hidden; border-radius:12px; display:flex; align-items:center; justify-content:center; background:#0b0f17'

  let frame = { x: 0, y: 0, w: 0, h: 0 }, B = 14, lastPlace = '', lastFit = ''
  const place = () => {                                       // position the overlay INSET by the fruta frame band
    const l = frame.x + B, tp = frame.y + B, w = Math.max(0, frame.w - B * 2), h = Math.max(0, frame.h - B * 2)
    const key = l + '|' + tp + '|' + w + '|' + h; if (key === lastPlace) return; lastPlace = key
    preview.style.left = l + 'px'; preview.style.top = tp + 'px'; preview.style.width = w + 'px'; preview.style.height = h + 'px'
  }
  // Fit the example (rendered dpr-crisp by runCode's dpr:true) INTO the frame, aspect kept, NEVER upscaled beyond
  // its logical size — so the ×dpr backing only ever downsamples → sharp. Logical size = backing / frutaDpr.
  const fit = () => {
    const c = (preview as any).querySelector ? (preview as any).querySelector('canvas') : null; if (!c) return
    const r = (c.dataset && parseFloat(c.dataset.frutaDpr)) || 1
    const lw = c.width / r, lh = c.height / r
    const iw = Math.max(1, frame.w - B * 2), ih = Math.max(1, frame.h - B * 2)
    const s = Math.min(iw / lw, ih / lh, 1), w = Math.max(1, Math.round(lw * s)), h = Math.max(1, Math.round(lh * s))
    const key = w + 'x' + h; if (key === lastFit) return; lastFit = key
    c.style.cssText = 'display:block; margin:auto; width:' + w + 'px; height:' + h + 'px'   // margin:auto centers within the flex frame
  }
  const showPreview = () => { preview.style.display = tab === 'preview' ? 'flex' : 'none'; preview.style.pointerEvents = tab === 'preview' ? 'auto' : 'none' }   // flex → the canvas stays centred on BOTH axes
  const runSel = () => { runExample(preview, sel); lastFit = ''; showPreview() }

  const build = () => {
    if (f) f.destroy()
    const W = Math.max(320, window.innerWidth), H = Math.max(400, window.innerHeight)
    f = Fruta({ width: W, height: H, background: p.bg, mount: el, dpr: true })
    if (f.canvas) f.canvas.style.cssText = 'display:block; width:100vw; height:100vh'
    el.appendChild(preview)                                   // keep overlay above the chrome canvas
    const cx: CanvasRenderingContext2D = f.context, T = textKit(cx), S = Math.min(W, H)
    B = Math.max(12, Math.round(S * 0.016)); lastPlace = ''; lastFit = ''   // fruta frame band; force re-place/fit after rebuild
    const NAVH = Math.max(56, S * 0.075)
    const listW = Math.max(200, Math.min(300, W * 0.26))
    const wide = W > 720

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
      const fs = Math.max(13, Math.round(S * 0.018))

      // ── left list: a cubist FRUIT menu (scrolls, clipped to the panel) ──
      if (wide) {
        f.rect({ x: 0, y: NAVH, w: listW, h: H - NAVH, fill: 'rgba(255,255,255,0.5)' })
        f.rect({ x: listW - 1, y: NAVH, w: 1, h: H - NAVH, fill: 'rgba(0,0,0,0.08)' })
        cx.save(); cx.beginPath(); cx.rect(0, NAVH, listW, H - NAVH); cx.clip()
        const lx = 24, iconR = fs * 0.92, rowH = fs * 3.15
        let ly = NAVH + 34 - listScroll, lastCat = '', idx = 0
        for (const ex of EXAMPLES) {
          if (ex.cat !== lastCat) {
            lastCat = ex.cat
            ly += fs * 2.6
            if (ly + fs * 1.9 > NAVH && ly < H) {
              f.push({ x: 12, y: ly, rotate: -2.5 })
              f.polygon({ points: [{ x: 0, y: -fs * 0.2 }, { x: listW - 34, y: -fs * 0.6 }, { x: listW - 40, y: fs * 1.5 }, { x: -4, y: fs * 1.7 }], fill: catColor(ex.cat), stroke: p.ink, strokeWidth: 1.5 })
              f.pop()
              T.line(ex.cat.toUpperCase(), 24, ly + fs * 0.95, fs * 0.82, '#fff', '800')
            }
            ly += fs * 3.7
          }
          const ry = ly, on = ex.name === sel, hover = mx < listW && my > NAVH && my >= ry - rowH * 0.5 && my <= ry + rowH * 0.5
          if (ry + rowH > NAVH && ry - rowH < H) {
            if (on) { f.push({ x: 0, y: ry, rotate: -1 }); f.polygon({ points: [{ x: 6, y: -rowH * 0.42 }, { x: listW - 8, y: -rowH * 0.5 }, { x: listW - 4, y: rowH * 0.44 }, { x: 10, y: rowH * 0.48 }], fill: p.accent, stroke: p.ink, strokeWidth: 1.5 }); f.pop() }
            else if (hover) f.rect({ x: 6, y: ry - rowH * 0.44, w: listW - 14, h: rowH * 0.9, radius: 8, fill: 'rgba(18,62,136,0.09)' })
            drawFruit(f, idx, lx + iconR, ry, iconR * (on ? 1.2 : hover ? 1.12 : 1), (on ? 8 : 0) + Math.sin(t * 2 + idx) * (on || hover ? 7 : 2), p.ink)
            T.line(ex.title, lx + iconR * 2 + 12, ry + fs * 0.35, fs, on ? '#fff' : p.text, on ? '800' : '600')
          }
          const cap = ex.name
          hits.push({ x: 0, y: ry - rowH * 0.5, w: listW, h: rowH, fn: () => { sel = cap; tab = 'preview'; codeScroll = 0; runSel() } })
          ly += rowH; idx++
        }
        listH = ly + listScroll - NAVH + 60
        cx.restore()
      }

      // ── right pane: header + toggle + frame ──
      const rx0 = wide ? listW + 20 : 14, rw = W - rx0 - 20
      const cur = EXAMPLES.find((e) => e.name === sel) || EXAMPLES[0]
      let hy = NAVH + 24
      T.line(cur.title, rx0, hy + fs * 1.4, Math.round(fs * 1.7), p.ink, '800', 'left', FONT.display); hy += fs * 1.9
      T.line(cur.cat + ' · ' + cur.hint, rx0, hy + fs, fs * 0.9, p.muted, '500'); hy += fs * 1.8

      // toggle
      for (const tb of ['preview', 'code'] as const) {
        const label = tb === 'preview' ? 'Preview' : 'Code'
        const w = T.measure(label, fs, '700') + fs * 1.6, bx = tb === 'preview' ? rx0 : rx0 + T.measure('Preview', fs, '700') + fs * 1.6 + 8
        const on = tab === tb
        f.rect({ x: bx, y: hy, w, h: fs * 2.2, radius: fs * 1.1, fill: on ? p.ink : 'rgba(0,0,0,0)', stroke: p.ink, strokeWidth: 1.5 })
        T.line(label, bx + w / 2, hy + fs * 1.45, fs, on ? '#fff' : p.ink, '700', 'center')
        hits.push({ x: bx, y: hy, w, h: fs * 2.2, fn: () => { tab = tb; showPreview() } })
      }
      hy += fs * 3.4

      // ── cubist fruta frame around the live preview / code ──
      frame = { x: rx0, y: hy, w: Math.max(160, rw), h: Math.max(200, H - hy - 20) }
      const fr = frame
      f.rect({ x: fr.x, y: fr.y, w: fr.w, h: fr.h, radius: 18, fill: tab === 'code' ? p.code : '#0b0f17' })
      f.rect({ x: fr.x - 5, y: fr.y - 5, w: fr.w, h: fr.h, radius: 18, fill: 'rgba(0,0,0,0)', stroke: p.accent, strokeWidth: 2 })   // vermilion cubist echo
      f.rect({ x: fr.x, y: fr.y, w: fr.w, h: fr.h, radius: 18, fill: 'rgba(0,0,0,0)', stroke: p.ink, strokeWidth: 5 })              // bold ink border
      f.polygon({ points: [{ x: fr.x - 3, y: fr.y + B * 1.9 }, { x: fr.x - 3, y: fr.y - 3 }, { x: fr.x + B * 1.9, y: fr.y - 3 }], fill: '#e2a636', stroke: p.ink, strokeWidth: 2 })                                   // TL corner shard
      f.polygon({ points: [{ x: fr.x + fr.w + 3, y: fr.y + fr.h - B * 1.9 }, { x: fr.x + fr.w + 3, y: fr.y + fr.h + 3 }, { x: fr.x + fr.w - B * 1.9, y: fr.y + fr.h + 3 }], fill: p.accent, stroke: p.ink, strokeWidth: 2 })   // BR corner shard
      place(); if (tab === 'preview') fit()

      if (tab === 'code') {
        preview.style.display = 'none'
        const lines = cur.code.split('\n'), cs = Math.max(12, Math.round(fs * 0.82)), lh = cs * 1.5, pad = cs * 1.3
        codeH = lines.length * lh + pad * 2
        cx.save(); cx.beginPath(); cx.rect(frame.x, frame.y, frame.w, frame.h); cx.clip()
        let cy = frame.y + pad + cs - codeScroll
        for (const ln of lines) { if (cy > frame.y - lh && cy < frame.y + frame.h + lh) T.line(ln, frame.x + pad, cy, cs, p.codeInk, '500', 'left', FONT.mono); cy += lh }
        cx.restore()
      }

      // ── responsive nav (links wide, hamburger + dropdown narrow) ──
      navHits = []
      drawNavBar({ f, cx, W, H, S, navH: NAVH, ink: p.ink, accent: p.accent, bg: p.bg, path: typeof location !== 'undefined' ? location.pathname : '', menu: navMenu, hits: navHits, onNav: (to, ext) => go(to, ext) })

      if (f.canvas) f.canvas.style.cursor = navHits.some((r) => mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) || hits.some((r) => mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h && my > NAVH - 1) ? 'pointer' : 'default'
      preview.style.display = tab === 'preview' && !navMenu.open ? 'flex' : 'none'   // flex keeps it centred; hide when the menu is on top
    })
    runSel()
  }

  const onWheel = (e: WheelEvent) => {
    const listW = Math.max(200, Math.min(300, window.innerWidth * 0.26))
    if (window.innerWidth > 720 && e.clientX < listW) { listScroll = Math.min(Math.max(0, listH - window.innerHeight + 120), Math.max(0, listScroll + e.deltaY)) }
    else if (tab === 'code') { codeScroll = Math.min(Math.max(0, codeH - frame.h + 40), Math.max(0, codeScroll + e.deltaY)) }
  }
  el.addEventListener('wheel', onWheel, { passive: true })
  let rz: any
  const onResize = () => { clearTimeout(rz); rz = setTimeout(() => { if (alive) build() }, 160) }
  window.addEventListener('resize', onResize)
  build()
  return { destroy() { alive = false; el.removeEventListener('wheel', onWheel); window.removeEventListener('resize', onResize); if (f) f.destroy(); preview.remove() } }
}
