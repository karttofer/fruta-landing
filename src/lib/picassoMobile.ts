// The MOBILE home, drawn in fruta — a vertical, touch-scrollable design built for phones (the desktop Proun is a
// separate renderer). A sticky nav, a hero (wordmark + a bobbing cubist cube + big stacked CTAs), then the 8
// features as colourful cubist cards you scroll through. Drag to scroll, tap the nav/CTAs to navigate. Painterly
// (gradients + soft shadows) and dpr-crisp.
import Fruta from 'fruta'
import { PAL, shade, FEATURES } from './picassoShared'
import { FONT, ensureFonts } from './fonts'
import { drawNavBar, type NavHit } from './nav'

type Instance = { destroy(): void }

export function paintMobile(el: HTMLElement): Instance {
  ensureFonts()
  el.style.cssText = 'position:fixed; inset:0; z-index:40; overflow:hidden; background:' + PAL.cream + '; touch-action:none'
  let f: any = null, alive = true, scroll = 0, contentH = 0
  let taps: { x: number; y: number; w: number; h: number; to: string; ext?: boolean }[] = []
  let dragY0 = 0, dragS0 = 0, moved = false, down = false
  const navMenu = { open: false }; let navHits: NavHit[] = []

  const go = (to: string, ext?: boolean) => { if (ext) { window.open(to, '_blank', 'noopener'); return } const a = document.createElement('a'); a.href = to; document.body.appendChild(a); a.click(); a.remove() }
  const clamp = (v: number) => Math.max(0, Math.min(Math.max(0, contentH - window.innerHeight), v))

  const build = () => {
    if (f) f.destroy()
    const W = Math.max(320, window.innerWidth), H = Math.max(480, window.innerHeight)
    f = Fruta({ width: W, height: H, background: PAL.cream, mount: el, dpr: true })
    if (f.canvas) f.canvas.style.cssText = 'display:block; width:100vw; height:100vh'
    const cx: CanvasRenderingContext2D = f.context, S = Math.min(W, H)

    const label = (s: string, x: number, y: number, size: number, col: string, weight = '600', align: CanvasTextAlign = 'left', font = FONT.sans) => { cx.save(); cx.font = `${weight} ${size}px ${font}`; cx.textAlign = align; cx.textBaseline = 'alphabetic'; cx.fillStyle = col; cx.fillText(s, x, y); cx.restore() }
    const measure = (s: string, size: number, weight = '600', font = FONT.sans) => { cx.save(); cx.font = `${weight} ${size}px ${font}`; const w = cx.measureText(s).width; cx.restore(); return w }
    const wrap = (s: string, maxW: number, size: number, weight = '500') => { cx.save(); cx.font = `${weight} ${size}px ${FONT.sans}`; const words = s.split(' '), lines: string[] = []; let cur = ''; for (const w of words) { const tt = cur ? cur + ' ' + w : w; if (cx.measureText(tt).width > maxW && cur) { lines.push(cur); cur = w } else cur = tt } if (cur) lines.push(cur); cx.restore(); return lines }
    const glyph = (kind: number, x: number, y: number, r: number, col: string, rot: number) => {
      cx.save(); cx.shadowColor = 'rgba(20,12,6,0.22)'; cx.shadowBlur = r * 0.4; cx.shadowOffsetY = r * 0.2
      f.push({ x, y, rotate: rot })
      const g = cx.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.05, 0, 0, r * 1.3); g.addColorStop(0, shade(col, 0.3)); g.addColorStop(1, shade(col, -0.12))
      if (kind % 8 === 6) f.circle({ x: 0, y: 0, r, fill: g, stroke: PAL.ink, strokeWidth: 2.5 })
      else f.ngon({ x: 0, y: 0, r, sides: 3 + (kind % 5), fill: g, stroke: PAL.ink, strokeWidth: 2.5 })
      f.pop(); cx.restore()
    }
    const mbtn = (s: string, x: number, y: number, w: number, h: number, to: string, filled: boolean, ext?: boolean) => {
      cx.save(); cx.shadowColor = 'rgba(30,15,8,0.2)'; cx.shadowBlur = 8; cx.shadowOffsetY = 4; f.rect({ x, y, w, h, radius: h / 2, fill: filled ? PAL.verm : PAL.cream, stroke: PAL.ink, strokeWidth: 2 }); cx.restore()
      const size = Math.max(16, Math.round(h * 0.34)); label(s, x + w / 2, y + h / 2 + size * 0.35, size, filled ? '#fff' : PAL.ink, '700', 'center'); taps.push({ x, y, w, h, to, ext })
    }
    const heroCube = (px: number, py: number, e: number) => {
      const w = e, dp = e * 0.5, hh = e * 0.72, eh = e * 1.25
      const T = { x: px, y: py - hh }, R = { x: px + w, y: py - hh + dp }, Bm = { x: px, y: py - hh + 2 * dp }, L = { x: px - w, y: py - hh + dp }, Bd = { x: px, y: py - hh + 2 * dp + eh }, Ld = { x: px - w, y: py - hh + dp + eh }, Rd = { x: px + w, y: py - hh + dp + eh }
      const face = (pts: { x: number; y: number }[], c0: string, c1: string) => { const g = cx.createLinearGradient(pts[0].x, pts[0].y, pts[2].x, pts[2].y); g.addColorStop(0, c0); g.addColorStop(1, c1); f.polygon({ points: pts, fill: g, stroke: PAL.ink, strokeWidth: 2.5 }) }
      cx.save(); cx.shadowColor = 'rgba(20,12,6,0.3)'; cx.shadowBlur = e * 0.3; cx.shadowOffsetY = e * 0.16; face([L, Bm, Bd, Ld], shade(PAL.blue, 0.05), shade(PAL.blue, -0.35)); cx.restore()
      face([R, Bm, Bd, Rd], shade(PAL.rose, 0.34), shade(PAL.rose, -0.02)); face([T, R, Bm, L], shade(PAL.ochre, 0.4), shade(PAL.ochre, 0.02))
    }

    f.onPress((p: { x: number; y: number }) => { down = true; dragY0 = p.y; dragS0 = scroll; moved = false })
    f.onRelease((p: { x: number; y: number }) => {
      if (!moved) {
        const nb = navHits.find((r) => p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h); if (nb) { nb.fn(); down = false; return }
        if (navMenu.open) { navMenu.open = false; down = false; return }
        const tp = taps.find((r) => p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h); if (tp) go(tp.to, tp.ext)
      }
      down = false
    })

    f.loop((_dt: number, t: number) => {
      const bg = cx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, PAL.g0); bg.addColorStop(1, PAL.cream)
      cx.save(); cx.fillStyle = bg; cx.fillRect(0, 0, W, H); cx.restore()
      if (f.mouseDown && down) { const dy = f.mouse.y - dragY0; if (Math.abs(dy) > 6) moved = true; scroll = clamp(dragS0 - dy) }
      taps = []
      const navH = Math.max(52, Math.round(S * 0.14)), cw = Math.min(W - 32, 460), x0 = (W - cw) / 2
      const ts = Math.max(15, Math.round(S * 0.021)), mS = Math.max(12, Math.round(S * 0.016))
      let y = navH + 26 - scroll

      // ── hero ──
      const wm = Math.round(Math.min(W * 0.2, S * 0.16))
      label('Fruta', W / 2 + wm * 0.05, y + wm + wm * 0.05, wm, PAL.verm, '800', 'center', FONT.display)
      cx.save(); cx.shadowColor = 'rgba(30,16,8,0.25)'; cx.shadowBlur = wm * 0.08; cx.shadowOffsetY = wm * 0.03; label('Fruta', W / 2, y + wm, wm, PAL.ink, '800', 'center', FONT.display); cx.restore()
      y += wm * 1.52                                                   // extra breathing room below the wordmark
      for (const ln of wrap('A tiny, friendly 2D engine for the web — and this page is itself a fruta painting.', cw, ts, '500')) { label(ln, W / 2, y, ts, 'rgba(20,20,20,0.74)', '500', 'center'); y += ts * 1.42 }
      y += S * 0.03
      heroCube(W / 2, y + S * 0.2 + Math.sin(t * 0.9) * S * 0.012, S * 0.12); y += S * 0.42
      const bH = Math.max(50, Math.round(S * 0.14))
      mbtn('Start coding  ▶', x0, y, cw, bH, '/playground', true); y += bH + 12
      mbtn('See examples', x0, y, cw, bH, '/examples', false); y += bH + 14
      label('npm i fruta', W / 2, y + ts, ts * 0.95, 'rgba(20,20,20,0.55)', '600', 'center', FONT.mono); y += ts * 2.4

      // ── section heading ──
      label("What's inside", W / 2, y + ts, Math.round(ts * 1.15), PAL.ink, '800', 'center', FONT.display); y += ts * 2.6

      // ── feature cards ──
      const pad = 16, icR = Math.max(20, Math.round(S * 0.05)), titleS = Math.max(17, Math.round(S * 0.024)), dS = Math.max(14, Math.round(S * 0.019))
      FEATURES.forEach((ft, idx) => {
        const dl = wrap(ft.d, cw - pad * 2, dS), codeH = mS * 2.4
        const h = pad + Math.max(icR * 2, titleS * 2.2) + dl.length * dS * 1.4 + 12 + codeH + pad
        if (y + h > navH && y < H) {
          cx.save(); cx.shadowColor = 'rgba(20,12,6,0.13)'; cx.shadowBlur = 14; cx.shadowOffsetY = 6; f.rect({ x: x0, y, w: cw, h, radius: 16, fill: PAL.cream, stroke: 'rgba(20,15,10,0.12)', strokeWidth: 1 }); cx.restore()
          f.rect({ x: x0 + 7, y: y + pad, w: 5, h: h - pad * 2, radius: 3, fill: ft.col })
          glyph(ft.icon, x0 + pad + 12 + icR, y + pad + icR, icR, ft.col, Math.sin(t * 0.8 + idx) * 7)
          const tx = x0 + pad + 12 + icR * 2 + 14
          label(ft.t, tx, y + pad + titleS, titleS, PAL.ink, '800', 'left', FONT.display)
          label('EXHIBIT ' + (idx + 1) + ' / 8', tx, y + pad + titleS + dS * 1.05, mS * 0.82, ft.col, '800')
          let dy = y + pad + Math.max(icR * 2, titleS * 2.2) + dS * 0.9
          for (const ln of dl) { label(ln, x0 + pad, dy, dS, 'rgba(20,20,20,0.78)', '500'); dy += dS * 1.4 }
          dy += 8
          f.rect({ x: x0 + pad, y: dy, w: cw - pad * 2, h: codeH, radius: 8, fill: '#0d1117' })
          label(ft.c, x0 + pad + mS * 0.7, dy + mS * 1.5, mS, '#c9d1d9', '500', 'left', FONT.mono)
        }
        y += h + 14
      })

      // ── footer ──
      label('MIT · built with fruta and muten', W / 2, y + ts, ts * 0.85, 'rgba(20,20,20,0.5)', '500', 'center'); y += ts * 2.4
      contentH = y + scroll + 10
      scroll = clamp(scroll)

      // ── responsive sticky nav: logo (two cherries + "fruta") + hamburger menu ──
      navHits = []
      drawNavBar({ f, cx, W, H, S, navH, ink: PAL.ink, accent: PAL.verm, bg: PAL.cream, path: typeof location !== 'undefined' ? location.pathname : '', menu: navMenu, hits: navHits, onNav: (to, ext) => go(to, ext) })

      // ── scrollbar ──
      const maxS = Math.max(0, contentH - H)
      if (maxS > 4) { const th = Math.max(30, (H / contentH) * H), ty = navH + (scroll / maxS) * (H - th - navH); f.rect({ x: W - 5, y: ty, w: 3, h: th, radius: 2, fill: 'rgba(0,0,0,0.2)' }) }
    })
  }

  const onWheel = (e: WheelEvent) => { scroll = clamp(scroll + e.deltaY) }
  el.addEventListener('wheel', onWheel, { passive: true })
  let rz: any
  const onResize = () => { clearTimeout(rz); rz = setTimeout(() => { if (alive) build() }, 160) }
  window.addEventListener('resize', onResize)
  build()
  return { destroy() { alive = false; el.removeEventListener('wheel', onWheel); window.removeEventListener('resize', onResize); if (f) f.destroy() } }
}
