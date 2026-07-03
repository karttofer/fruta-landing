// The `use` facade: fruta is imported HERE (a real module — imports work) and exposed as run(el, name)
// for the inlined Custom to call. Each sketch is a small live fruta program that shows a capability on
// the site itself — the fruta site runs on fruta.
import Fruta, { noise, hsl } from 'fruta'

type Instance = { destroy(): void }
const live = new WeakMap<HTMLElement, Instance>()

const SKETCHES: Record<string, (el: HTMLElement) => Instance> = { hero, shapes, particles, chart }

export function run(el: HTMLElement, name: string): void {
  const prev = live.get(el); if (prev) prev.destroy()
  el.replaceChildren()
  const make = SKETCHES[name]
  if (make) live.set(el, make(el))
}

// home-page code snippets live here (home already imports this module) so `code.ts` stays docs-exclusive
// — that keeps fruta the ONLY module shared across routes, so muten-dev emits a single shared chunk.
export const heroCode = (): string => `import Fruta from 'fruta'

const fruta = Fruta({ width: 500, height: 500 }).mount()

fruta.loop((dt, t) => {
  fruta.background('#111')
  fruta.circle({
    x: fruta.mouse.x,
    y: fruta.mouse.y,
    r: 24, fill: 'tomato',
  })
})`
export const installCmd = (): string => 'npm i fruta'

// ── the sketches ──
function hero(el: HTMLElement): Instance {
  const W = 960, H = 460
  const f = Fruta({ width: W, height: H, background: '#fff4f4', mount: el })
  const N = 280
  const pts = Array.from({ length: N }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: 0, vy: 0, h: 335 + Math.random() * 55 }))
  f.loop((dt, t) => {
    f.background('#fff4f4')
    const d = Math.min(dt, 1 / 30), mx = f.mouse.x, my = f.mouse.y
    for (const p of pts) {
      const a = noise(p.x * 0.0016, p.y * 0.0016, t * 0.04) * Math.PI * 4
      p.vx += Math.cos(a) * 10 * d; p.vy += Math.sin(a) * 10 * d
      const dx = mx - p.x, dy = my - p.y, dd = Math.hypot(dx, dy) + 0.01
      if (dd < 170) { p.vx += (dx / dd) * 55 * d; p.vy += (dy / dd) * 55 * d }
      p.vx *= 0.95; p.vy *= 0.95; p.x += p.vx; p.y += p.vy
      if (p.x < 0) p.x += W; else if (p.x > W) p.x -= W; if (p.y < 0) p.y += H; else if (p.y > H) p.y -= H
      f.circle({ x: p.x, y: p.y, r: 3, fill: hsl(p.h, 82, 64) })
    }
  })
  return f
}

function shapes(el: HTMLElement): Instance {
  const W = 380, H = 240
  const f = Fruta({ width: W, height: H, background: '#16121f', mount: el })
  f.loop((_dt, t) => {
    f.background('#16121f')
    f.push({ x: W / 2, y: H / 2, rotate: t * 24 })
    f.ngon({ x: 0, y: 0, r: 64, sides: 6, stroke: '#ff6f91', strokeWidth: 3 })
    f.ngon({ x: 0, y: 0, r: 40, sides: 3, rotation: t * 80, stroke: '#ffd24a', strokeWidth: 3 })
    f.pop()
    f.circle({ x: W / 2 + Math.cos(t * 1.3) * 86, y: H / 2 + Math.sin(t * 1.3) * 54, r: 13, fill: '#67d4ff' })
    f.circle({ x: W / 2 + Math.cos(t * 1.3 + Math.PI) * 86, y: H / 2 + Math.sin(t * 1.3 + Math.PI) * 54, r: 9, fill: '#9be86b' })
    f.text('shapes + transforms', { x: W / 2, y: H - 16, fill: 'rgba(255,255,255,0.45)', size: 12, align: 'center' })
  })
  return f
}

function particles(el: HTMLElement): Instance {
  const W = 380, H = 240
  const f = Fruta({ width: W, height: H, background: '#0d0f17', mount: el })
  f.loop((_dt, t) => {
    f.background('#0d0f17')
    const cx = W / 2 + Math.cos(t * 1.1) * 116, cy = H / 2 + Math.sin(t * 1.6) * 66
    f.burst({ x: cx, y: cy, count: 4, color: ['#ff5a8a', '#ffd24a', '#67d4ff', '#9be86b'], speed: [20, 130], life: 0.95, size: 2.4, gravity: 22 })
    f.drawParticles()
    f.text('particles', { x: W / 2, y: H - 16, fill: 'rgba(255,255,255,0.45)', size: 12, align: 'center' })
  })
  return f
}

function chart(el: HTMLElement): Instance {
  const W = 380, H = 240
  const f = Fruta({ width: W, height: H, background: '#ffffff', mount: el })
  const vals = [0.5, 0.86, 0.62, 0.96, 0.7, 0.8], n = vals.length
  f.loop((_dt, t) => {
    f.background('#ffffff')
    const bw = (W - 70) / n, base = H - 38
    f.line({ x1: 30, y1: base, x2: W - 24, y2: base, stroke: '#ececec', strokeWidth: 2 })
    for (let i = 0; i < n; i++) {
      const h = vals[i] * (0.82 + 0.18 * Math.sin(t * 1.4 + i)) * (base - 34)
      f.rect({ x: 34 + i * bw + 5, y: base - h, w: bw - 14, h, radius: 5, fill: '#e8425a' })
    }
    f.text('one-call charts', { x: W / 2, y: H - 12, fill: 'rgba(20,20,30,0.4)', size: 12, align: 'center' })
  })
  return f
}
