// A reusable FULL-CANVAS cubist page engine — every landing page is drawn in fruta (foreground, z-40), same
// design language as the home. Handles: a cubist scene, a drawn top nav, a scrollable content column of blocks
// (heading / paragraph / code / chips / buttons), text wrapping, wheel scroll, and hit-tested navigation. Static
// pages (docs) use frutaPage() directly; interactive pages (examples/playground) reuse the exported helpers.
import Fruta from '../../../../src/core/fruta'
import { FONT, ensureFonts } from './fonts'
import { drawNavBar, type NavHit } from './nav'
import { runCode, stopCode } from './run'

export type Instance = { destroy(): void }
export type FrutaHandle = any

export const NAV = [
  { s: 'Home', to: '/' }, { s: 'Examples', to: '/examples' }, { s: 'Playground', to: '/playground' }, { s: 'Docs', to: '/docs' },
  { s: 'GitHub ↗', to: 'https://github.com/karttofer/Fruta', ext: true },
]

// A tiny TS/JS tokenizer for drawing SYNTAX-HIGHLIGHTED code straight into the canvas (GitHub-Dark palette, which
// reads well on every period's dark code box). First matching rule wins; the gaps are default-coloured.
const CODE_COL = { def: '#c9d1d9', com: '#8b949e', str: '#a5d6ff', kw: '#ff7b72', num: '#79c0ff', fn: '#d2a8ff' }
const CODE_RULES: [RegExp, string][] = [
  [/\/\/[^\n]*/, CODE_COL.com],
  [/'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"/, CODE_COL.str],
  [/\b(?:const|let|var|function|return|if|else|for|while|of|in|new|import|from|export|default|await|async|class|extends|typeof|instanceof|null|undefined|this|true|false)\b/, CODE_COL.kw],
  [/\b\d+(?:\.\d+)?\b/, CODE_COL.num],
  [/[A-Za-z_$][\w$]*(?=\s*\()/, CODE_COL.fn],
]
const CODE_MASTER = new RegExp(CODE_RULES.map((r) => '(' + r[0].source + ')').join('|'), 'g')
function tokenizeCode(line: string): { t: string; c: string }[] {
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

export type Period = { bg: string; ink: string; text: string; muted: string; accent: string; pal: string[]; code: string; codeInk: string }
export const PERIODS: Record<string, Period> = {
  ink:  { bg: '#f1e8d5', ink: '#1a1613', text: '#1a1613', muted: 'rgba(26,22,19,0.62)', accent: '#cf3b25', pal: ['#e2a636', '#b9b09a', '#8a8574', '#5f7a3a', '#123e88'], code: '#0d1117', codeInk: '#c9d1d9' },
  blue: { bg: '#e9edf5', ink: '#0e2a5e', text: '#12203a', muted: 'rgba(14,42,94,0.6)', accent: '#123e88', pal: ['#123e88', '#2f77b8', '#2c8c7c', '#4a5a92', '#8fa8d4'], code: '#0b1a33', codeInk: '#cfe0ff' },
  rose: { bg: '#fbeadf', ink: '#7a2f2a', text: '#3a2420', muted: 'rgba(58,36,32,0.62)', accent: '#cf3b25', pal: ['#df728c', '#e2a636', '#cf6a4a', '#d1462f', '#e6b98f'], code: '#241210', codeInk: '#ffd9c9' },
}

export const go = (to: string, ext?: boolean) => {
  if (ext || /^https?:/.test(to)) { window.open(to, '_blank', 'noopener'); return }
  const a = document.createElement('a'); a.href = to; document.body.appendChild(a); a.click(); a.remove() // let muten intercept → SPA
}

const FIELD = [
  { fx: 0.1, fy: 0.22, s: 0.1, c: 0, k: 4, rot: -8, spin: 2 }, { fx: 0.86, fy: 0.16, s: 0.12, c: 1, k: 0, rot: 10, spin: -3 },
  { fx: 0.28, fy: 0.74, s: 0.11, c: 2, k: 3, rot: 4, spin: 4 }, { fx: 0.7, fy: 0.66, s: 0.09, c: 3, k: 5, rot: -14, spin: -2 },
  { fx: 0.92, fy: 0.82, s: 0.08, c: 0, k: 3, rot: 20, spin: -4 }, { fx: 0.05, fy: 0.6, s: 0.09, c: 1, k: 0, rot: 0, spin: 5 },
  { fx: 0.46, fy: 0.92, s: 0.07, c: 2, k: 4, rot: -10, spin: 3 }, { fx: 0.78, fy: 0.4, s: 0.09, c: 3, k: 3, rot: 14, spin: -3 },
  { fx: 0.94, fy: 0.32, s: 0.07, c: 2, k: 5, rot: -6, spin: 4 }, { fx: 0.14, fy: 0.42, s: 0.08, c: 4, k: 0, rot: 0, spin: 2 },
]
const polyPts = (k: number, r: number) => { const n = Math.max(3, k), p: { x: number; y: number }[] = []; for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 - 0.3, rr = r * (0.7 + (0.5 * ((i * 7) % 5)) / 5); p.push({ x: Math.cos(a) * rr, y: Math.sin(a) * rr }) } return p }

export function drawScene(f: FrutaHandle, W: number, H: number, S: number, t: number, p: Period, alpha = 0.16) {
  f.push({ x: W * 0.5, y: H * 0.4, rotate: 7 + Math.sin(t * 0.12) * 2 })
  f.rect({ x: -W * 0.7, y: -H * 0.3, w: W * 1.4, h: H * 0.14, fill: 'rgba(0,0,0,0.03)' })
  f.pop()
  for (let i = 0; i < FIELD.length; i++) {
    const sh = FIELD[i]
    const x = sh.fx * W + Math.sin(t * 0.35 + i) * S * 0.008, y = sh.fy * H + Math.cos(t * 0.3 + i) * S * 0.01, r = sh.s * S
    f.push({ x, y, rotate: sh.rot + sh.spin * t * 0.4, alpha })
    if (sh.k === 0) f.circle({ x: 0, y: 0, r, fill: p.pal[sh.c] })
    else f.polygon({ points: polyPts(sh.k, r), fill: p.pal[sh.c], stroke: p.ink, strokeWidth: 1.5 })
    f.pop()
  }
}

// text helpers over the raw 2D context (full control of font + measuring for wrap/hit-test)
export function textKit(cx: CanvasRenderingContext2D) {
  const font = (size: number, weight: string, family: string) => { cx.font = `${weight} ${size}px ${family}` }
  return {
    measure(s: string, size: number, weight = '600', family = FONT.sans) { cx.save(); font(size, weight, family); const w = cx.measureText(s).width; cx.restore(); return w },
    line(s: string, x: number, y: number, size: number, col: string, weight = '600', align: CanvasTextAlign = 'left', family = FONT.sans) {
      cx.save(); font(size, weight, family); cx.textAlign = align; cx.textBaseline = 'alphabetic'; cx.fillStyle = col; cx.fillText(s, x, y); cx.restore()
    },
    wrap(s: string, maxW: number, size: number, weight = '500', family = FONT.sans) {
      cx.save(); font(size, weight, family)
      const words = s.split(' '), lines: string[] = []; let cur = ''
      for (const w of words) { const test = cur ? cur + ' ' + w : w; if (cx.measureText(test).width > maxW && cur) { lines.push(cur); cur = w } else cur = test }
      if (cur) lines.push(cur); cx.restore(); return lines
    },
  }
}

// ── static block page (docs) ──
export type Block =
  | { t: 'h'; s: string; size?: number }
  | { t: 'p'; s: string }
  | { t: 'code'; code: string }
  | { t: 'chips'; items: string[] }
  | { t: 'btns'; items: { label: string; to: string; ext?: boolean; primary?: boolean }[] }
  | { t: 'gap'; h: number }
  | { t: 'demo'; code: string; h?: number }        // a LIVE fruta sketch, mounted only while on-screen
export type PageConfig = { style: string; title: string; subtitle?: string; blocks: Block[] }

export function frutaPage(el: HTMLElement, cfg: PageConfig): Instance {
  ensureFonts()
  const p = PERIODS[cfg.style] || PERIODS.ink
  el.style.cssText = 'position:fixed; inset:0; z-index:40; overflow:hidden; background:' + p.bg
  let f: FrutaHandle = null, alive = true, scroll = 0, contentH = 0
  let hits: { x: number; y: number; w: number; h: number; to: string; ext?: boolean }[] = []
  const navMenu = { open: false }; let navHits: NavHit[] = []
  let demoEls: HTMLElement[] = [], demoRunning: boolean[] = []
  let tocEntries: { label: string; absY: number }[] = []          // section list for the side summary (TOC)
  let tocHits: { x: number; y: number; w: number; h: number; i: number }[] = []
  let copyHits: { x: number; y: number; w: number; h: number; code: string; idx: number }[] = []
  let copiedIdx = -1, copiedAt = -10, lastT = 0                    // "copied ✓" feedback per code block

  const build = () => {
    if (f) f.destroy()
    for (const d of demoEls) { stopCode(d); d.remove() }              // fresh demo overlays per (re)build
    demoEls = []; demoRunning = []
    const W = Math.max(320, window.innerWidth), H = Math.max(400, window.innerHeight)
    f = Fruta({ width: W, height: H, background: p.bg, mount: el, dpr: true })
    if (f.canvas) f.canvas.style.cssText = 'display:block; width:100vw; height:100vh'
    for (const b of cfg.blocks) if (b.t === 'demo') { const d = document.createElement('div'); d.style.cssText = 'position:absolute; overflow:hidden; border-radius:12px; display:flex; align-items:center; justify-content:center; background:#0b0f17; pointer-events:none'; el.appendChild(d); demoEls.push(d); demoRunning.push(false) }
    const cx: CanvasRenderingContext2D = f.context, T = textKit(cx), S = Math.min(W, H)
    const NAVH = Math.max(56, S * 0.075)

    f.onPress((pt: { x: number; y: number }) => {
      const nb = navHits.find((r) => pt.x >= r.x && pt.x <= r.x + r.w && pt.y >= r.y && pt.y <= r.y + r.h); if (nb) { nb.fn(); return }
      if (navMenu.open) { navMenu.open = false; return }
      const th = tocHits.find((r) => pt.x >= r.x && pt.x <= r.x + r.w && pt.y >= r.y && pt.y <= r.y + r.h)
      if (th) { const target = tocEntries[th.i].absY - NAVH - 24; scroll = Math.max(0, Math.min(Math.max(0, contentH - window.innerHeight), target)); return }
      const cph = copyHits.find((r) => pt.x >= r.x && pt.x <= r.x + r.w && pt.y >= r.y && pt.y <= r.y + r.h)
      if (cph) { try { const n: any = navigator; if (n && n.clipboard) n.clipboard.writeText(cph.code) } catch { /* ignore */ } copiedIdx = cph.idx; copiedAt = lastT; return }
      const b = hits.find((r) => pt.x >= r.x && pt.x <= r.x + r.w && pt.y >= r.y && pt.y <= r.y + r.h); if (b) go(b.to, b.ext)
    })

    const TOC_W = 210, TOC_GAP = 64
    f.loop((_dt: number, t: number) => {
      lastT = t
      f.background(p.bg)
      drawScene(f, W, H, S, t, p, 0.14)
      hits = []; tocEntries = []; copyHits = []
      const mx = f.mouse.x, my = f.mouse.y
      const showToc = W >= 1024
      const colW = showToc ? Math.min(680, W - TOC_W - TOC_GAP - 120) : Math.min(720, W * 0.86)
      const groupW = showToc ? TOC_W + TOC_GAP + colW : colW
      const gx = (W - groupW) / 2                                  // centre the TOC+content group (not glued left)
      const x0 = showToc ? gx + TOC_W + TOC_GAP : (W - colW) / 2

      // ── content (scrolled), clipped below the nav ──
      let y = NAVH + Math.max(24, S * 0.04) - scroll
      const fs = Math.max(15, Math.round(S * 0.021))            // base font
      const title = Math.round(fs * 2.4)
      T.line(cfg.title, x0, y + title, title, p.ink, '800', 'left', FONT.display); y += title + fs * 0.6
      if (cfg.subtitle) { for (const ln of T.wrap(cfg.subtitle, colW, fs, '500')) { y += fs * 1.5; T.line(ln, x0, y, fs, p.muted, '500') } }
      y += fs * 1.6

      let demoIdx = 0, codeIdx = 0
      for (const b of cfg.blocks) {
        if (b.t === 'gap') { y += b.h * (fs / 16); continue }
        if (b.t === 'h') { const hs = Math.round((b.size || 1.5) * fs); tocEntries.push({ label: b.s.split(' — ')[0], absY: y + scroll }); y += hs * 1.1; T.line(b.s, x0, y, hs, p.ink, '700', 'left', FONT.display); y += fs * 0.4; continue }
        if (b.t === 'p') { for (const ln of T.wrap(b.s, colW, fs, '500')) { y += fs * 1.55; T.line(ln, x0, y, fs, p.text, '500') } y += fs * 0.5; continue }
        if (b.t === 'chips') { let cxp = x0; const cs = Math.round(fs * 0.82); y += cs * 2; for (const c of b.items) { const w = T.measure(c, cs, '700') + cs * 1.4; f.rect({ x: cxp, y: y - cs * 1.4, w, h: cs * 2, radius: cs, fill: 'rgba(0,0,0,0)', stroke: p.ink, strokeWidth: 1.5 }); T.line(c, cxp + w / 2, y, cs, p.ink, '700', 'center'); cxp += w + cs * 0.7 } y += cs * 1.2; continue }
        if (b.t === 'code') {
          const lines = b.code.split('\n')
          let cs = Math.max(11, Math.round(fs * 0.82))
          const avail = colW - cs * 2.4                           // room inside the padding
          cx.save(); cx.font = `500 ${cs}px ${FONT.mono}`; let maxW = 0; for (const ln of lines) { const w = cx.measureText(ln).width; if (w > maxW) maxW = w } cx.restore()
          if (maxW > avail) cs = Math.max(9, Math.floor(cs * (avail / maxW)))    // shrink so the LONGEST line fits
          const pad = cs * 1.2, lh = cs * 1.55, boxH = lines.length * lh + pad * 2
          y += fs * 0.4
          f.rect({ x: x0, y, w: colW, h: boxH, radius: 14, fill: p.code })
          if (y + boxH > NAVH && y < H) {                         // syntax-highlight, clipped to the box (first line leaves room for Copy)
            cx.save(); cx.beginPath(); cx.rect(x0, y, colW, boxH); cx.clip()
            cx.font = `500 ${cs}px ${FONT.mono}`; cx.textAlign = 'left'; cx.textBaseline = 'alphabetic'
            let ly = y + pad + cs
            for (const ln of lines) { let tx = x0 + pad; for (const tok of tokenizeCode(ln)) { cx.fillStyle = tok.c; cx.fillText(tok.t, tx, ly); tx += cx.measureText(tok.t).width } ly += lh }
            cx.restore()
            // Copy button (top-right) — uniform size across all blocks (based on fs, not the per-block cs)
            const cbfs = Math.max(11, Math.round(fs * 0.72)), cbw = cbfs * 5, cbh = cbfs * 2, cbx = x0 + colW - cbw - 10, cby = y + 9
            const copied = copiedIdx === codeIdx && t - copiedAt < 1.5
            f.rect({ x: cbx, y: cby, w: cbw, h: cbh, radius: 7, fill: 'rgba(255,255,255,0.05)', stroke: 'rgba(255,255,255,0.18)', strokeWidth: 1 })
            T.line(copied ? '✓ copied' : 'copy', cbx + cbw / 2, cby + cbh * 0.68, cbfs, copied ? '#7ee787' : 'rgba(255,255,255,0.62)', '700', 'center')
            copyHits.push({ x: cbx, y: cby, w: cbw, h: cbh, code: b.code, idx: codeIdx })
          }
          y += boxH + fs * 0.6; codeIdx++; continue
        }
        if (b.t === 'btns') {
          let bx = x0; const bs = Math.max(15, Math.round(fs * 0.95)), bh = bs * 2.6; y += bh
          for (const it of b.items) {
            const w = T.measure(it.label, bs, '700') + bs * 2
            const over = mx >= bx && mx <= bx + w && my >= y - bh && my <= y
            f.rect({ x: bx, y: y - bh, w, h: bh, radius: bh / 2, fill: it.primary ? p.accent : 'rgba(0,0,0,0)', stroke: p.ink, strokeWidth: 2 })
            T.line(it.label, bx + w / 2, y - bh / 2 + bs * 0.35, bs, it.primary ? '#fff' : p.ink, '700', 'center')
            hits.push({ x: bx, y: y - bh, w, h: bh, to: it.to, ext: it.ext })
            void over; bx += w + bs
          }
          y += fs * 0.6; continue
        }
        if (b.t === 'demo') {
          const demoH = b.h || Math.round(colW * 0.34)            // match the 560:180 demo aspect so it fills
          y += fs * 0.4
          f.rect({ x: x0, y, w: colW, h: demoH, radius: 14, fill: '#0b0f17', stroke: p.ink, strokeWidth: 2 })
          const d = demoEls[demoIdx], DB = 8, iw = colW - DB * 2, ih = demoH - DB * 2, onScreen = y + demoH > NAVH && y < H
          const top = y + DB
          d.style.left = x0 + DB + 'px'; d.style.top = top + 'px'; d.style.width = iw + 'px'; d.style.height = ih + 'px'
          d.style.clipPath = top < NAVH ? 'inset(' + Math.ceil(NAVH - top) + 'px 0 0 0)' : 'none'   // never draw over the nav
          if (onScreen && !demoRunning[demoIdx]) {
            runCode(d, b.code); demoRunning[demoIdx] = true
            const c: any = (d as any).querySelector('canvas')     // size the demo canvas to fill the box (aspect kept)
            if (c) { const r = (c.dataset && parseFloat(c.dataset.frutaDpr)) || 1, lw = c.width / r, lh2 = c.height / r, s = Math.min(iw / lw, ih / lh2); c.style.cssText = 'display:block; width:' + Math.round(lw * s) + 'px; height:' + Math.round(lh2 * s) + 'px' }
          } else if (!onScreen && demoRunning[demoIdx]) { stopCode(d); demoRunning[demoIdx] = false }
          d.style.display = onScreen && !navMenu.open ? 'flex' : 'none'
          y += demoH + fs * 0.6; demoIdx++; continue
        }
      }
      contentH = y + scroll + Math.max(H * 0.6, S * 0.04)   // absolute bottom + trailing pad so the LAST section can scroll up

      // ── side summary (sticky TOC): section list, current one highlighted, click to jump ──
      tocHits = []
      if (showToc && tocEntries.length) {
        const tx = gx, tfs = Math.max(12, Math.round(fs * 0.78)), ty0 = NAVH + 46
        let active = 0
        for (let i = 0; i < tocEntries.length; i++) if (tocEntries[i].absY - scroll <= NAVH + fs * 3.5) active = i
        // Measure the whole list; if it is taller than the space, scroll it IN SYNC with the page so the last
        // section is always reachable — even with 100 entries.
        const heights = tocEntries.map((e) => T.wrap(e.label, TOC_W - 6, tfs, '500').length * tfs * 1.4 + tfs * 0.7)
        const total = heights.reduce((a, b) => a + b, 0)
        const listTop = ty0 + tfs * 1.9, availH = H - listTop - 20, maxS = Math.max(0, contentH - H)
        if (maxS > 0 && scroll >= maxS - 40) active = tocEntries.length - 1   // at the very bottom → last section is current
        const tocScroll = total > availH && maxS > 0 ? (scroll / maxS) * (total - availH) : 0
        T.line('ON THIS PAGE', tx, ty0, tfs * 0.82, p.muted, '800')
        cx.save(); cx.beginPath(); cx.rect(tx - 16, listTop - tfs * 1.4, TOC_W + 26, H - listTop + tfs * 1.4); cx.clip()
        let ly = listTop - tocScroll
        for (let i = 0; i < tocEntries.length; i++) {
          const eh = heights[i], on = i === active
          if (ly + eh > listTop - tfs && ly < H) {                    // only draw + hit-test visible rows
            const wl = T.wrap(tocEntries[i].label, TOC_W - 6, tfs, on ? '700' : '500')
            const over = mx >= tx - 14 && mx < tx + TOC_W && my >= ly - tfs && my <= ly - tfs + eh
            if (on) f.rect({ x: tx - 12, y: ly - tfs, w: 3, h: Math.max(tfs, eh - tfs * 0.7), radius: 2, fill: p.accent })
            let lyy = ly; for (const wln of wl) { T.line(wln, tx, lyy, tfs, on ? p.accent : over ? p.text : p.muted, on ? '700' : '500'); lyy += tfs * 1.4 }
            tocHits.push({ x: tx - 14, y: ly - tfs * 1.2, w: TOC_W + 14, h: eh, i })
          }
          ly += eh
        }
        cx.restore()
      }

      // scrollbar hint
      const maxScroll = Math.max(0, contentH - H)
      if (maxScroll > 4) { const th = Math.max(30, (H / contentH) * H); const ty = (scroll / maxScroll) * (H - th - NAVH) + NAVH; f.rect({ x: W - 6, y: ty, w: 3, h: th, radius: 2, fill: 'rgba(0,0,0,0.18)' }) }

      // ── responsive nav bar (drawn on top): links wide, hamburger + dropdown narrow ──
      navHits = []
      drawNavBar({ f, cx, W, H, S, navH: NAVH, ink: p.ink, accent: p.accent, bg: p.bg, path: typeof location !== 'undefined' ? location.pathname : '', menu: navMenu, hits: navHits, onNav: (to, ext) => go(to, ext) })

      if (f.canvas) f.canvas.style.cursor = hits.some((r) => mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) || navHits.some((r) => mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) || tocHits.some((r) => mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) || copyHits.some((r) => mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) ? 'pointer' : 'default'
    })
  }

  const onWheel = (e: WheelEvent) => { const max = Math.max(0, contentH - window.innerHeight); scroll = Math.min(max, Math.max(0, scroll + e.deltaY)); }
  el.addEventListener('wheel', onWheel, { passive: true })
  let rz: any
  const onResize = () => { clearTimeout(rz); rz = setTimeout(() => { if (alive) build() }, 160) }
  window.addEventListener('resize', onResize)
  build()
  return { destroy() { alive = false; el.removeEventListener('wheel', onWheel); window.removeEventListener('resize', onResize); for (const d of demoEls) { stopCode(d); d.remove() }; if (f) f.destroy() } }
}
