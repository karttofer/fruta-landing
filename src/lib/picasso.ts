// The home, drawn in fruta — a colourful PROUN (El Lissitzky) of FRUIT, ALIVE: a floating isometric cube with
// vivid fruit-coloured faces, sweeping arcs, a perspective mesh, planet-circles and a central bar. It bobs,
// parallaxes toward the cursor, shimmers, and eases in on load. Curated: each piece is a fruta feature you hover
// to name and click to read (plaque + code). Painterly (gradients + soft shadows). Responsive: side-by-side on
// wide screens, text-over-art stacked on narrow. Click-drag on empty space paints your own shards.
// Desktop renderer (the Proun). paintLanding (bottom) routes to the mobile design below 820px.
import Fruta from 'fruta'
import { PAL, shade, FEATURES } from './picassoShared'
import { paintMobile } from './picassoMobile'
import { FONT, ensureFonts } from './fonts'
import { drawNavBar, type NavHit } from './nav'
import { drawCodeLine } from './codeHighlight'

type Instance = { destroy(): void }
type Pt = { x: number; y: number }

const SHARD_COLORS = [PAL.blue, PAL.cobalt, PAL.ochre, PAL.verm, PAL.olive, PAL.rose, PAL.teal, PAL.plum]
const inPoly = (pts: Pt[], x: number, y: number) => { let c = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const a = pts[i], b = pts[j]; if (((a.y > y) !== (b.y > y)) && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x) c = !c } return c }
const seg = (cx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, col: string, w: number) => { cx.save(); cx.strokeStyle = col; cx.lineWidth = w; cx.lineCap = 'round'; cx.beginPath(); cx.moveTo(x1, y1); cx.lineTo(x2, y2); cx.stroke(); cx.restore() }

// The public entry — routes to a dedicated MOBILE design under 820px, the desktop Proun above it. Re-picks when
// the width crosses the breakpoint (each renderer handles same-mode resizes itself).
export function paintLanding(el: HTMLElement): Instance {
  let inst: Instance | null = null, mode = ''
  const pick = () => { const m = window.innerWidth < 820 ? 'm' : 'd'; if (m === mode) return; mode = m; if (inst) inst.destroy(); inst = (m === 'm' ? paintMobile : desktop)(el) }
  pick()
  const onR = () => pick()
  window.addEventListener('resize', onR)
  return { destroy() { window.removeEventListener('resize', onR); if (inst) inst.destroy() } }
}

function desktop(el: HTMLElement): Instance {
  ensureFonts()
  el.style.cssText = 'position:fixed; inset:0; z-index:40; overflow:hidden; cursor:crosshair; touch-action:none'

  let painted: { x: number; y: number; vx: number; vy: number; rot: number; vr: number; s: number; col: string; sides: number; life: number; max: number }[] = []
  let buttons: { x: number; y: number; w: number; h: number; to: string; ext?: boolean }[] = []
  let exhibits: { i: number; cx: number; cy: number; r: number; poly?: Pt[] }[] = []
  let hoverEx = -1, openF = -1, paintAcc = 0
  const navMenu = { open: false }; let navHits: NavHit[] = []
  let f: any = null, alive = true

  const go = (to: string, ext?: boolean) => { if (ext) { window.open(to, '_blank', 'noopener'); return } const a = document.createElement('a'); a.href = to; document.body.appendChild(a); a.click(); a.remove() }
  const hit = (x: number, y: number) => buttons.find((b) => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h)
  const exAt = (x: number, y: number) => { for (const e of exhibits) { if (e.poly ? inPoly(e.poly, x, y) : Math.hypot(x - e.cx, y - e.cy) < e.r) return e.i } return -1 }

  const build = () => {
    if (f) f.destroy()
    const W = Math.max(320, window.innerWidth), H = Math.max(480, window.innerHeight)
    f = Fruta({ width: W, height: H, background: PAL.cream, mount: el, dpr: true })
    if (f.canvas) f.canvas.style.cssText = 'display:block; width:100vw; height:100vh'
    const cx: CanvasRenderingContext2D = f.context, S = Math.min(W, H)

    f.onPress((p: { x: number; y: number }) => {
      const nb = navHits.find((r) => p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h); if (nb) { nb.fn(); return }
      const b = hit(p.x, p.y); if (b) { go(b.to, b.ext); return }
      const si = exAt(p.x, p.y); if (si >= 0) { openF = openF === si ? -1 : si; return }
      if (openF >= 0) openF = -1
    })

    const label = (s: string, x: number, y: number, size: number, col: string, weight = '600', align: CanvasTextAlign = 'left', font = FONT.sans) => { cx.save(); cx.font = `${weight} ${size}px ${font}`; cx.textAlign = align; cx.textBaseline = 'alphabetic'; cx.fillStyle = col; cx.fillText(s, x, y); cx.restore(); return cx.measureText(s).width }
    const measure = (s: string, size: number, weight = '600', font = FONT.sans) => { cx.save(); cx.font = `${weight} ${size}px ${font}`; const w = cx.measureText(s).width; cx.restore(); return w }
    const wrap = (s: string, maxW: number, size: number, weight = '500') => { cx.save(); cx.font = `${weight} ${size}px ${FONT.sans}`; const words = s.split(' '), lines: string[] = []; let cur = ''; for (const w of words) { const tt = cur ? cur + ' ' + w : w; if (cx.measureText(tt).width > maxW && cur) { lines.push(cur); cur = w } else cur = tt } if (cur) lines.push(cur); cx.restore(); return lines }
    const faceGrad = (pts: Pt[], c0: string, c1: string) => { const g = cx.createLinearGradient(pts[0].x, pts[0].y, pts[2].x, pts[2].y); g.addColorStop(0, c0); g.addColorStop(1, c1); return g }
    const face = (pts: Pt[], c0: string, c1: string, lit: boolean) => { f.polygon({ points: pts, fill: faceGrad(pts, c0, c1), stroke: PAL.ink, strokeWidth: lit ? 4 : 2.5 }); if (lit) f.polygon({ points: pts, fill: 'rgba(255,255,255,0.14)' }) }
    const arc = (x1: number, y1: number, cxp: number, cyp: number, x2: number, y2: number, col: string, w: number) => { cx.save(); cx.strokeStyle = col; cx.lineWidth = w; cx.lineCap = 'round'; cx.beginPath(); cx.moveTo(x1, y1); cx.quadraticCurveTo(cxp, cyp, x2, y2); cx.stroke(); cx.restore() }
    const gg = (c: string, rad: number) => { const g = cx.createRadialGradient(-rad * 0.35, -rad * 0.4, rad * 0.05, 0, 0, rad * 1.3); g.addColorStop(0, shade(c, 0.3)); g.addColorStop(1, shade(c, -0.12)); return g }
    const fruit = (kind: number, x: number, y: number, r: number, rot: number, lit: boolean) => {
      cx.save(); cx.shadowColor = 'rgba(30,16,8,0.3)'; cx.shadowBlur = r * (lit ? 0.7 : 0.5); cx.shadowOffsetY = r * 0.28
      f.push({ x, y, rotate: rot, scale: lit ? 1.12 : 1 })
      if (kind === 0) { f.line({ x1: 0, y1: -r * 1.3, x2: -r * 0.5, y2: -r * 0.1, stroke: PAL.ink, strokeWidth: 2, cap: 'round' }); f.line({ x1: 0, y1: -r * 1.3, x2: r * 0.55, y2: -r * 0.1, stroke: PAL.ink, strokeWidth: 2, cap: 'round' }); f.polygon({ points: [{ x: 0, y: -r * 1.35 }, { x: r * 0.85, y: -r * 1.95 }, { x: r * 0.55, y: -r * 1.05 }], fill: PAL.olive, stroke: PAL.ink, strokeWidth: 1.5 }); f.circle({ x: -r * 0.5, y: r * 0.4, r: r * 0.62, fill: gg(PAL.verm, r * 0.62), stroke: PAL.ink, strokeWidth: 2 }); f.circle({ x: r * 0.55, y: r * 0.55, r: r * 0.55, fill: gg(PAL.rose, r * 0.55), stroke: PAL.ink, strokeWidth: 2 }) }
      else if (kind === 1) { f.ngon({ x: 0, y: 0, r, sides: 7, rotation: 18, fill: gg(PAL.ochre, r), stroke: PAL.ink, strokeWidth: 2 }); f.circle({ x: r * 0.95, y: 0, r: r * 0.14, fill: shade(PAL.ochre, -0.25), stroke: PAL.ink, strokeWidth: 1 }) }
      else { const g: [number, number][] = [[-r * 0.5, r * 0.1], [r * 0.5, r * 0.1], [0, r * 0.55], [-r * 0.25, -r * 0.4], [r * 0.25, -r * 0.4], [0, r * 1.05]]; f.polygon({ points: [{ x: -r * 0.1, y: -r * 0.9 }, { x: r * 0.7, y: -r * 1.35 }, { x: r * 0.35, y: -r * 0.6 }], fill: PAL.olive, stroke: PAL.ink, strokeWidth: 1.5 }); for (const [gx, gy] of g) f.circle({ x: gx, y: gy, r: r * 0.42, fill: gg(PAL.plum, r * 0.42), stroke: PAL.ink, strokeWidth: 1.5 }) }
      f.pop(); cx.restore()
    }
    const button = (s: string, x: number, y: number, to: string, filled: boolean, ext?: boolean) => { const size = Math.max(14, Math.round(S * 0.019)), padX = size * 0.9, h = size * 2.2, w = measure(s, size, '700') + padX * 2; cx.save(); cx.shadowColor = 'rgba(30,15,8,0.22)'; cx.shadowBlur = size * 0.5; cx.shadowOffsetY = size * 0.14; f.rect({ x, y, w, h, radius: h / 2, fill: filled ? PAL.verm : PAL.cream, stroke: PAL.ink, strokeWidth: 2 }); cx.restore(); label(s, x + w / 2, y + h / 2 + size * 0.35, size, filled ? '#fff' : PAL.ink, '700', 'center'); buttons.push({ x, y, w, h, to, ext }); return w }
    const btnW = (s: string) => { const size = Math.max(14, Math.round(S * 0.019)); return measure(s, size, '700') + size * 0.9 * 2 }

    f.loop((dt: number, t: number) => {
      // painterly ground
      const bg = cx.createRadialGradient(W * 0.6, H * 0.4, 0, W * 0.6, H * 0.5, Math.max(W, H) * 0.75); bg.addColorStop(0, PAL.g0); bg.addColorStop(1, PAL.g1)
      cx.save(); cx.fillStyle = bg; cx.fillRect(0, 0, W, H); cx.restore()
      buttons = []; exhibits = []
      const mx = f.mouse.x, my = f.mouse.y, d = Math.min(dt, 1 / 30)

      // ── responsive layout + animation drivers ──
      const narrow = W < 820
      const P = narrow ? Math.min(H * 0.49, W * 0.82) : S
      const ax = narrow ? W * 0.5 : W * 0.66
      const intro = 1 - Math.pow(1 - Math.min(1, t / 0.8), 3)            // easeOutCubic entrance
      const rise = (1 - intro) * H * 0.06
      // narrow: art sits in the bottom band starting at H*0.46 (topmost circle), leaving the top for text.
      const ccy = (narrow ? H * 0.46 + P * 0.42 : H * 0.42) + rise
      const ox = mx / W - 0.5, oy = my / H - 0.5, par = (dep: number) => P * dep   // mouse parallax
      const bob = Math.sin(t * 0.8) * P * 0.018

      // cube (bob + parallax)
      const cax = ax + ox * par(0.05), ccyc = ccy + bob + oy * par(0.05)
      const w = P * 0.2, dp = P * 0.1, hh = P * 0.15, eh = P * 0.26
      const T = { x: cax, y: ccyc - hh }, R = { x: cax + w, y: ccyc - hh + dp }, Bm = { x: cax, y: ccyc - hh + 2 * dp }, L = { x: cax - w, y: ccyc - hh + dp }
      const Bd = { x: cax, y: Bm.y + eh }, Ld = { x: cax - w, y: L.y + eh }, Rd = { x: cax + w, y: R.y + eh }
      const topF = [T, R, Bm, L], leftF = [L, Bm, Bd, Ld], rightF = [R, Bm, Bd, Rd]
      const topCircle = { x: ax + ox * par(0.03), y: ccy - P * 0.29 + oy * par(0.03) + Math.sin(t * 0.7) * P * 0.012, r: P * 0.13 }
      const botCircle = { x: ax + ox * par(0.03), y: ccy + P * 0.52 + oy * par(0.03), r: P * 0.16 }
      const cherry = { x: cax - w * 1.15 + ox * par(0.08), y: ccyc - hh * 0.2 + oy * par(0.08) + Math.sin(t * 1.1) * P * 0.01, r: P * 0.05 }
      const lemon = { x: cax + w * 1.15 + ox * par(0.08), y: ccyc + eh * 0.5 + oy * par(0.08) + Math.cos(t * 1.3) * P * 0.01, r: P * 0.052 }
      const grapes = { x: cax + w * 0.2 + ox * par(0.04), y: Bd.y + P * 0.06, r: P * 0.05 }
      const meshY = ccy + P * 0.2 + oy * par(0.02), meshVP = { x: ax + ox * par(0.02), y: ccy + P * 0.48 }, meshHW = P * 0.46
      exhibits = [
        { i: 0, cx: (T.x + Bm.x) / 2, cy: (T.y + Bm.y) / 2, r: 0, poly: topF }, { i: 1, cx: (L.x + Bd.x) / 2, cy: (L.y + Bd.y) / 2, r: 0, poly: leftF }, { i: 2, cx: (R.x + Bd.x) / 2, cy: (R.y + Bd.y) / 2, r: 0, poly: rightF },
        { i: 6, cx: topCircle.x, cy: topCircle.y, r: topCircle.r }, { i: 7, cx: botCircle.x, cy: botCircle.y, r: botCircle.r },
        { i: 3, cx: ax, cy: meshY + P * 0.1, r: P * 0.24 }, { i: 4, cx: cherry.x, cy: cherry.y, r: cherry.r * 1.6 }, { i: 5, cx: lemon.x, cy: lemon.y, r: lemon.r * 1.5 },
      ]
      hoverEx = openF < 0 ? exAt(mx, my) : -1
      const isLit = (i: number) => hoverEx === i || openF === i

      // ── the Proun art (eases in via globalAlpha) ──
      cx.save(); cx.globalAlpha = intro
      // central bar — full height on wide (text is off to the left); on narrow it starts at the art band so it
      // never runs through the top text (which would make the subtitle dark-on-dark / unreadable).
      const barX = ax - P * 0.07 + ox * par(0.01), barTop = narrow ? Math.max(0, topCircle.y - topCircle.r - P * 0.08) : 0
      const barG = cx.createLinearGradient(barX, 0, barX + P * 0.14, 0); barG.addColorStop(0, shade(PAL.ink, 0.06)); barG.addColorStop(1, PAL.ink)
      cx.save(); cx.fillStyle = barG; cx.fillRect(barX, barTop, P * 0.14, H - barTop); cx.restore()
      // planet circles
      cx.save(); cx.shadowColor = 'rgba(20,12,6,0.3)'; cx.shadowBlur = P * 0.03; cx.shadowOffsetY = P * 0.01
      const tcg = cx.createRadialGradient(topCircle.x - topCircle.r * 0.3, topCircle.y - topCircle.r * 0.3, 0, topCircle.x, topCircle.y, topCircle.r); tcg.addColorStop(0, shade(PAL.plum, 0.2)); tcg.addColorStop(1, shade(PAL.plum, -0.2))
      f.circle({ x: topCircle.x, y: topCircle.y, r: topCircle.r, fill: tcg, stroke: PAL.ink, strokeWidth: isLit(6) ? 4 : 2.5 }); if (isLit(6)) f.circle({ x: topCircle.x, y: topCircle.y, r: topCircle.r, fill: 'rgba(255,255,255,0.14)' })
      const bcg = cx.createRadialGradient(botCircle.x - botCircle.r * 0.3, botCircle.y - botCircle.r * 0.3, 0, botCircle.x, botCircle.y, botCircle.r); bcg.addColorStop(0, shade(PAL.ochre, 0.28)); bcg.addColorStop(1, shade(PAL.ochre, -0.08))
      f.circle({ x: botCircle.x, y: botCircle.y, r: botCircle.r, fill: bcg, stroke: PAL.ink, strokeWidth: isLit(7) ? 4 : 2.5 }); if (isLit(7)) f.circle({ x: botCircle.x, y: botCircle.y, r: botCircle.r, fill: 'rgba(255,255,255,0.16)' })
      cx.restore()
      // perspective mesh (animated shimmer)
      const litMesh = isLit(3), N = 15
      for (let i = 0; i <= N; i++) { const tx = ax - meshHW + (2 * meshHW * i) / N + ox * par(0.02), sh = Math.sin(t * 1.4 + i * 0.5) * P * 0.005; seg(cx, tx, meshY + sh, meshVP.x, meshVP.y, i % 2 ? PAL.verm : PAL.ochre, litMesh ? 1.8 : 1.2) }
      for (let k = 1; k <= 5; k++) { const tt = k / 6, ly = meshY + (meshVP.y - meshY) * tt, lw = meshHW * (1 - tt); seg(cx, ax - lw, ly, ax + lw, ly, 'rgba(207,59,37,0.5)', litMesh ? 1.6 : 1) }
      // sweeping arcs (animated)
      arc(ax - P * 0.58, H * 0.05, ax - P * 0.8 + Math.sin(t * 0.4) * P * 0.03, H * 0.5, ax - P * 0.02, ccy + P * 0.32, PAL.verm, 2.5)
      arc(ax + P * 0.05, ccy - P * 0.1, ax + P * 0.62 + Math.cos(t * 0.5) * P * 0.03, H * 0.08, ax + P * 0.5, ccy + P * 0.1, '#f4eede', 2)
      arc(ax + P * 0.02, ccy - P * 0.25, ax + P * 0.22, ccy + P * 0.1, ax - P * 0.06, ccy + P * 0.34, PAL.ink, 1.4)
      // the cube
      cx.save(); cx.shadowColor = 'rgba(20,12,6,0.34)'; cx.shadowBlur = P * 0.05; cx.shadowOffsetX = P * 0.01; cx.shadowOffsetY = P * 0.02; face(leftF, shade(PAL.blue, 0.05), shade(PAL.blue, -0.35), isLit(1)); cx.restore()
      face(rightF, shade(PAL.rose, 0.34), shade(PAL.rose, -0.02), isLit(2))
      face(topF, shade(PAL.ochre, 0.4), shade(PAL.ochre, 0.02), isLit(0))
      // fruits
      fruit(0, cherry.x, cherry.y, cherry.r, -12 + Math.sin(t * 0.9) * 4 + (isLit(4) ? Math.sin(t * 5) * 8 : 0), isLit(4))
      fruit(1, lemon.x, lemon.y, lemon.r, 14 + Math.cos(t * 0.8) * 4 + (isLit(5) ? Math.sin(t * 5) * 8 : 0), isLit(5))
      fruit(2, grapes.x, grapes.y, grapes.r, Math.sin(t * 0.7) * 3, false)
      cx.restore()   // end intro alpha

      // ── painted shards (click-drag on empty space) ──
      if (f.mouseDown && openF < 0 && !hit(mx, my) && exAt(mx, my) < 0) { paintAcc += d; if (paintAcc > 0.012) { paintAcc = 0; const col = SHARD_COLORS[(Math.random() * SHARD_COLORS.length) | 0], a = Math.random() * Math.PI * 2, sp = 40 + Math.random() * 160; painted.push({ x: mx, y: my, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 40, rot: Math.random() * 360, vr: (Math.random() - 0.5) * 300, s: S * (0.014 + Math.random() * 0.02), col, sides: 3 + ((Math.random() * 3) | 0), life: 0, max: 2.2 + Math.random() }); if (painted.length > 160) painted.shift() } }
      for (let i = painted.length - 1; i >= 0; i--) { const p = painted[i]; p.life += d; if (p.life >= p.max) { painted.splice(i, 1); continue } p.vy += 220 * d; p.vx *= 0.98; p.vy *= 0.98; p.x += p.vx * d; p.y += p.vy * d; p.rot += p.vr * d; f.push({ x: p.x, y: p.y, rotate: p.rot, alpha: Math.min(1, (1 - p.life / p.max) * 1.6) }); f.ngon({ x: 0, y: 0, r: p.s, sides: p.sides, fill: p.col, stroke: PAL.ink, strokeWidth: 1.5 }); f.pop() }

      // ── wordmark + copy + CTAs — a FLOW layout that wraps to fit any width (mobile-safe) ── eases in
      const tAlpha = Math.min(1, t / 0.7), al: CanvasTextAlign = narrow ? 'center' : 'left'
      const anchor = narrow ? W * 0.5 : W * 0.06 + 4
      const wm = narrow ? Math.round(Math.min(W * 0.12, H * 0.07)) : Math.round(Math.min(S * 0.19, W * 0.14))
      const ts = Math.max(14, Math.round(S * 0.02)), cs = Math.max(11, Math.round(S * 0.015))
      const wy = narrow ? H * 0.16 : H * 0.4                             // pushed below the top nav bar
      const tagMaxW = narrow ? W * 0.92 : Math.min(W * 0.42, 470)
      cx.save(); cx.globalAlpha = tAlpha
      const wmw = Math.round(Math.min(wm, wm * (narrow ? W * 0.8 : Math.min(W * 0.42, 470)) / Math.max(1, measure('fruta.ts', wm, '800', FONT.mono))))
      cx.save(); cx.shadowColor = 'rgba(30,16,8,0.22)'; cx.shadowBlur = wmw * 0.06; cx.shadowOffsetY = wmw * 0.025; label('fruta.ts', anchor, wy, wmw, PAL.ink, '800', al, FONT.mono); cx.restore()
      let ty = wy + wmw * 0.45 + ts * 0.9                              // extra breathing room below the wordmark
      for (const ln of wrap('A tiny, friendly 2D engine for the web — this page is a fruta painting. Hover a piece to explore.', tagMaxW, ts, '500')) { label(ln, anchor, ty, ts, 'rgba(20,20,20,0.74)', '500', al); ty += ts * 1.42 }
      ty += cs * 1.2
      // chips — pack into rows so they never overflow (centred rows on narrow)
      const chips = ['~35 KB', '0 deps', 'Canvas2D + WebGL', 'TypeScript-first'], cwid = chips.map((c) => measure(c, cs, '700') + cs * 1.4)
      const rowMax = narrow ? W * 0.94 : 99999, rows: number[][] = [[]]; let rw = 0
      chips.forEach((c, i) => { if (rw + cwid[i] > rowMax && rows[rows.length - 1].length) { rows.push([]); rw = 0 } rows[rows.length - 1].push(i); rw += cwid[i] + cs * 0.7 })
      for (const row of rows) { const rt = row.reduce((a, i) => a + cwid[i], 0) + cs * 0.7 * (row.length - 1); let x = narrow ? W * 0.5 - rt / 2 : anchor; for (const i of row) { f.rect({ x, y: ty, w: cwid[i], h: cs * 2, radius: cs, fill: 'rgba(0,0,0,0)', stroke: PAL.ink, strokeWidth: 1.5 }); label(chips[i], x + cwid[i] / 2, ty + cs * 1.35, cs, PAL.ink, '700', 'center'); x += cwid[i] + cs * 0.7 } ty += cs * 2.7 }
      ty += cs * 0.7
      // CTAs — side by side, or stacked if they don't fit one narrow row
      const w1 = btnW('Start coding  ▶'), w2 = btnW('See examples'), gap = 14, bh = Math.max(14, Math.round(S * 0.019)) * 2.2
      if (narrow && w1 + gap + w2 > W * 0.94) { button('Start coding  ▶', W * 0.5 - w1 / 2, ty, '/playground', true); ty += bh + 12; button('See examples', W * 0.5 - w2 / 2, ty, '/examples', false) }
      else { let bx = narrow ? W * 0.5 - (w1 + gap + w2) / 2 : anchor; button('Start coding  ▶', bx, ty, '/playground', true); bx += w1 + gap; button('See examples', bx, ty, '/examples', false) }
      cx.restore()

      // ── responsive nav: logo (two cherries + "fruta") + links, floating over the art (no opaque strip) ──
      navHits = []
      drawNavBar({ f, cx, W, H, S, navH: Math.max(52, S * 0.075), ink: PAL.ink, accent: PAL.verm, bg: PAL.g0, strip: false, path: typeof location !== 'undefined' ? location.pathname : '', menu: navMenu, hits: navHits, onNav: (to, ext) => go(to, ext) })

      // ── hover label ──
      if (hoverEx >= 0 && openF < 0) { const e = exhibits.find((x) => x.i === hoverEx)!, ft = FEATURES[hoverEx], size = Math.max(13, Math.round(S * 0.017)), cw = measure(ft.t, size, '700') + size * 1.4; f.rect({ x: e.cx - cw / 2, y: e.cy - e.r - size * 2.2, w: cw, h: size * 2, radius: size, fill: PAL.ink }); label(ft.t, e.cx, e.cy - e.r - size * 0.9, size, '#fff', '700', 'center') }

      // ── plaque (curator) ──
      if (openF >= 0) {
        cx.save(); cx.fillStyle = 'rgba(18,14,10,0.4)'; cx.fillRect(0, 0, W, H); cx.restore()
        const ft = FEATURES[openF], cw = Math.min(480, W * 0.86), pad2 = Math.max(22, S * 0.032), tS = Math.max(22, Math.round(S * 0.032)), dS = Math.max(15, Math.round(S * 0.021)), mS = Math.max(13, Math.round(S * 0.017))
        const dl = wrap(ft.d, cw - pad2 * 2, dS), ch = tS + dl.length * dS * 1.45 + mS * 3.4 + pad2 * 2.4, cxp2 = (W - cw) / 2, cyp = (H - ch) / 2
        cx.save(); cx.shadowColor = 'rgba(20,12,6,0.4)'; cx.shadowBlur = S * 0.06; cx.shadowOffsetY = S * 0.02; f.rect({ x: cxp2, y: cyp, w: cw, h: ch, radius: 16, fill: PAL.cream, stroke: PAL.ink, strokeWidth: 3 }); cx.restore()
        f.rect({ x: cxp2, y: cyp, w: cw, h: 8, fill: SHARD_COLORS[openF] })
        f.polygon({ points: [{ x: cxp2 + cw, y: cyp + 26 }, { x: cxp2 + cw, y: cyp }, { x: cxp2 + cw - 26, y: cyp }], fill: PAL.verm, stroke: PAL.ink, strokeWidth: 2 })
        let yy = cyp + pad2 + tS
        label('EXHIBIT ' + (openF + 1) + ' / 8', cxp2 + pad2, yy - tS * 0.9, mS * 0.8, PAL.verm, '800')
        label(ft.t, cxp2 + pad2, yy + mS * 0.4, tS, PAL.ink, '800', 'left', FONT.display); yy += tS * 0.8 + dS
        for (const ln of dl) { label(ln, cxp2 + pad2, yy, dS, 'rgba(20,20,20,0.8)', '500'); yy += dS * 1.45 }
        yy += mS * 0.6; f.rect({ x: cxp2 + pad2, y: yy, w: cw - pad2 * 2, h: mS * 2.4, radius: 8, fill: '#0d1117' })
        cx.save(); cx.font = `500 ${mS}px ${FONT.mono}`; cx.textBaseline = 'alphabetic'; drawCodeLine(cx, ft.c, cxp2 + pad2 + mS * 0.7, yy + mS * 1.55); cx.restore()
        label('click anywhere to close', cxp2 + cw - pad2, cyp + ch - pad2 * 0.5, mS * 0.85, 'rgba(20,20,20,0.45)', '500', 'right')
      } else label('🖱 hover & click the pieces — each is a fruta feature', narrow ? W * 0.5 : W * 0.06 + 4, H - Math.max(18, S * 0.028), Math.max(12, Math.round(S * 0.015)), 'rgba(20,20,20,0.5)', '600', narrow ? 'center' : 'left')

      if (f.canvas) f.canvas.style.cursor = hit(mx, my) || exAt(mx, my) >= 0 || navHits.some((r) => mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) ? 'pointer' : 'crosshair'
    })
  }

  let rz: any
  const onResize = () => { clearTimeout(rz); rz = setTimeout(() => { if (alive) { buttons = []; painted = []; build() } }, 160) }
  window.addEventListener('resize', onResize)
  build()
  return { destroy() { alive = false; window.removeEventListener('resize', onResize); if (f) f.destroy() } }
}
