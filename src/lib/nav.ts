// The shared, responsive nav bar for every canvas page: the fruta logo (two cherries + "fruta" lowercase) on the
// left, and a menu on the right — inline links on wide screens, a hamburger + dropdown on narrow ones. It fills a
// `hits` array with {x,y,w,h,fn}; the page checks those first in its press handler and toggles `menu.open`.
import { FONT } from './fonts'
import { logoImage, LOGO_SIZE } from './logo'

export const NAV_LINKS = [
  { s: 'Examples', to: '/examples' }, { s: 'Playground', to: '/playground' }, { s: 'Docs', to: '/docs' }, { s: 'GitHub ↗', to: 'https://github.com/karttofer/Fruta', ext: true },
]
export type NavHit = { x: number; y: number; w: number; h: number; fn: () => void }

// The fruta cherry mark — drawn from the shared SVG (logo.ts) via drawImage; falls back to primitives for the
// first frame until the SVG decodes. x = left edge, yc = mark's vertical centre, s = square size (px). Returns width.
export function drawCherries(f: any, x: number, yc: number, s: number, ink: string) {
  const img = logoImage()
  if (img && img.complete && img.naturalWidth) { try { f.context.drawImage(img, x, yc - s * 0.72, s, s); return s } catch { /* not decoded yet */ } }
  const r = s / 3.5
  const c1x = x + r, c2x = x + r * 2.4, jx = (c1x + c2x) / 2, top = yc - r * 1.7, lw = Math.max(1.5, r * 0.16)
  f.line({ x1: c1x, y1: yc - r * 0.4, x2: jx - r * 0.15, y2: top, stroke: ink, strokeWidth: lw, cap: 'round' })
  f.line({ x1: c2x, y1: yc - r * 0.3, x2: jx + r * 0.15, y2: top, stroke: ink, strokeWidth: lw, cap: 'round' })
  f.polygon({ points: [{ x: jx, y: top }, { x: jx + r * 1.2, y: top - r * 0.75 }, { x: jx + r * 0.55, y: top + r * 0.15 }], fill: '#5f7a3a', stroke: ink, strokeWidth: Math.max(1, r * 0.11) })
  f.circle({ x: c1x, y: yc, r, fill: '#cf3b25', stroke: ink, strokeWidth: lw })
  f.circle({ x: c2x, y: yc + r * 0.18, r: r * 0.9, fill: '#df728c', stroke: ink, strokeWidth: lw })
  return s
}

export function drawNavBar(o: {
  f: any; cx: CanvasRenderingContext2D; W: number; H: number; S: number; navH: number
  ink: string; accent: string; bg: string; path: string; menu: { open: boolean }; hits: NavHit[]; onNav: (to: string, ext?: boolean) => void; strip?: boolean
}) {
  const { f, cx, W, H, S, navH, ink, accent, bg, path, menu, hits, onNav } = o
  const label = (s: string, x: number, y: number, size: number, col: string, weight = '600', align: CanvasTextAlign = 'left', font = FONT.sans) => { cx.save(); cx.font = `${weight} ${size}px ${font}`; cx.textAlign = align; cx.textBaseline = 'alphabetic'; cx.fillStyle = col; cx.fillText(s, x, y); cx.restore() }
  const measure = (s: string, size: number, weight = '600', font = FONT.sans) => { cx.save(); cx.font = `${weight} ${size}px ${font}`; const w = cx.measureText(s).width; cx.restore(); return w }

  if (o.strip !== false) { f.rect({ x: 0, y: 0, w: W, h: navH, fill: bg }); f.rect({ x: 0, y: navH - 1, w: W, h: 1, fill: 'rgba(0,0,0,0.08)' }) }

  // logo: the cherry mark only (no wordmark), one fixed size everywhere
  const pad = Math.max(18, S * 0.028)
  const mw = drawCherries(f, pad, navH / 2 + LOGO_SIZE * 0.1, LOGO_SIZE, ink)
  hits.push({ x: 0, y: 0, w: pad + mw + pad, h: navH, fn: () => onNav('/') })

  if (W >= 720) {
    let rx = W - pad; const ns = Math.max(14, Math.round(S * 0.02))
    for (let i = NAV_LINKS.length - 1; i >= 0; i--) { const it = NAV_LINKS[i], w = measure(it.s, ns, '600'); rx -= w; const active = it.to === path; label(it.s, rx, navH / 2 + ns * 0.35, ns, active ? accent : ink, active ? '800' : '600'); hits.push({ x: rx, y: 0, w, h: navH, fn: () => onNav(it.to, (it as any).ext) }); rx -= ns * 1.4 }
    return
  }

  // narrow: hamburger + dropdown
  const bs = Math.max(20, navH * 0.3), bx = W - pad - bs, by = navH / 2, bw = Math.max(2.5, bs * 0.13)
  for (let k = -1; k <= 1; k++) f.rect({ x: bx, y: by + k * bs * 0.34 - bw / 2, w: bs, h: bw, radius: 2, fill: ink })
  hits.push({ x: bx - 10, y: 0, w: bs + 20, h: navH, fn: () => { menu.open = !menu.open } })
  if (menu.open) {
    // dim everything below the bar so the menu clearly sits ON TOP.
    f.rect({ x: 0, y: navH, w: W, h: Math.max(0, H - navH), fill: 'rgba(18,14,10,0.4)' })
    const dw = Math.min(250, W * 0.62), dx = W - pad - dw, ns = Math.max(16, Math.round(S * 0.026)), rowH = ns * 2.5, dh = NAV_LINKS.length * rowH + 14
    cx.save(); cx.shadowColor = 'rgba(20,12,6,0.35)'; cx.shadowBlur = 22; cx.shadowOffsetY = 8; f.rect({ x: dx, y: navH + 8, w: dw, h: dh, radius: 14, fill: bg, stroke: 'rgba(0,0,0,0.12)', strokeWidth: 1 }); cx.restore()
    NAV_LINKS.forEach((it, i) => { const ry = navH + 8 + 7 + i * rowH, active = it.to === path; if (i > 0) f.rect({ x: dx + 16, y: ry, w: dw - 32, h: 1, fill: 'rgba(0,0,0,0.06)' }); label(it.s, dx + 20, ry + rowH / 2 + ns * 0.35, ns, active ? accent : ink, active ? '800' : '600'); hits.push({ x: dx, y: ry, w: dw, h: rowH, fn: () => { menu.open = false; onNav(it.to, (it as any).ext) } }) })
    // dim tap-to-close LAST → lower priority than the link rows above.
    hits.push({ x: 0, y: navH, w: W, h: Math.max(0, H - navH), fn: () => { menu.open = false } })
  }
}
