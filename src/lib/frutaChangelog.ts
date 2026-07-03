// Changelog — drawn 100% in fruta, cranked to an anime / Persona-5 comic: crimson + black + off-white, radial
// speed-lines, star-bursts, ink-bordered comic panels, bounce-in entries, a flash on version change, and real
// scroll (wheel + touch-drag) on any width. Route pattern: paint fn → screens.ts → FrutaScreen Custom.
import Fruta from 'fruta'
import { FONT, ensureFonts } from './fonts'
import { drawNavBar, navHeight, type NavHit } from './nav'

type Instance = { destroy(): void }

const RED = '#e6002b', BLACK = '#0c0a0b', PAPER = '#f6f0e6', GOLD = '#ffcf1a', CYAN = '#25c8ff', INKLINE = '#050404'
const TAU = Math.PI * 2

type Entry = { k: 'FEAT' | 'FIX' | 'PERF'; t: string }
type Ver = { v: string; date: string; tag: string; entries: Entry[] }
const VERSIONS: Ver[] = [
  { v: '0.1.5', date: 'JUL 2026', tag: 'TAKE YOUR TIME', entries: [
    { k: 'PERF', t: 'Batched draw — circles() / rects(): 100k particles @ 60–70 fps on WebGL' },
    { k: 'FEAT', t: 'Fixed timestep — fixedUpdate() for stable, deterministic physics' },
    { k: 'FEAT', t: 'Registry — generational handles, kill "this" entity from anywhere' },
    { k: 'FEAT', t: 'SpatialGrid — flat broadphase, no Map on the hot path' },
    { k: 'FEAT', t: 'Dynamic 2D lighting — light() / drawLights(): torches, day / night' },
    { k: 'FEAT', t: 'bounceCircles() — circle-vs-circle collision response' },
    { k: 'FEAT', t: 'Audio, full: tone · osc · analyser · mic · reverb · delay · filters' },
    { k: 'FEAT', t: 'Data & export — loadJSON / loadCSV · screenshot() · createImage' },
    { k: 'FEAT', t: 'Text — textWidth() to measure · paragraph() with word-wrap' },
    { k: 'FEAT', t: 'Pixel filters — sepia · erode · dilate (9 total)' },
    { k: 'FEAT', t: 'DOM controls — createSlider / Button / … · webcam · video' },
    { k: 'FIX', t: 'Case-insensitive keys — Shift + WASD no longer breaks a dash' },
  ] },
  { v: '0.1.4', date: 'JUN 2026', tag: 'GAME FEEL', entries: [
    { k: 'FEAT', t: 'approach() + input buffers — coyote time & jump buffering' },
    { k: 'FEAT', t: 'floatText — rising score / combo / damage popups' },
    { k: 'FEAT', t: 'Menu — keyboard & gamepad menu navigation' },
    { k: 'FEAT', t: 'History — generic undo / redo timeline' },
    { k: 'FEAT', t: 'moveAABB / moveRects — the tile-collision solver, built in' },
    { k: 'PERF', t: 'dt clamp built into the engine — one bad frame can’t explode physics' },
  ] },
  { v: '0.1.0', date: 'APR 2026', tag: 'FIRST BLOOD', entries: [
    { k: 'FEAT', t: 'The friendly facade — one object, intent-named draws, a dt loop' },
    { k: 'FEAT', t: 'Two backends — Canvas2D + WebGL behind one identical API' },
    { k: 'FEAT', t: 'The game kit — physics, particles, camera, scenes, tilemaps' },
    { k: 'FEAT', t: 'Tween engine — 30+ easings, colour tweens, timelines, stagger' },
  ] },
]
const KCOL: Record<string, string> = { FEAT: RED, FIX: GOLD, PERF: CYAN }

export function paintChangelog(el: HTMLElement): Instance {
  ensureFonts()
  let f: any = null, alive = true, sel = 0, enter = 0, flash = 0, scroll = 0, contentH = 0, visH = 1
  let down = false, dragY0 = 0, scroll0 = 0, moved = false
  const navMenu = { open: false }
  let navHits: NavHit[] = [], hits: { x: number; y: number; w: number; h: number; fn: () => void }[] = []

  const go = (to: string, ext?: boolean) => { if (ext) { window.open(to, '_blank', 'noopener'); return } const a = document.createElement('a'); a.href = to; document.body.appendChild(a); a.click(); a.remove() }
  const pick = (i: number) => { if (i !== sel) { sel = i; enter = 0; scroll = 0; flash = 1 } }
  const clampScroll = () => { scroll = Math.max(0, Math.min(scroll, Math.max(0, contentH - visH + 40))) }

  const build = () => {
    if (f) f.destroy()
    const W = Math.max(340, window.innerWidth), H = Math.max(480, window.innerHeight)
    f = Fruta({ width: W, height: H, mount: el, dpr: true })
    if (f.canvas) f.canvas.style.cssText = 'display:block; width:100vw; height:100vh'
    const cx: CanvasRenderingContext2D = f.context, S = Math.min(W, H)

    const st = (str: string, x: number, y: number, size: number, col: string, weight = '800', skew = -0.2, align: CanvasTextAlign = 'left') => {
      cx.save(); cx.font = 'italic ' + weight + ' ' + size + 'px ' + FONT.sans; cx.textAlign = align; cx.textBaseline = 'alphabetic'; cx.fillStyle = col
      cx.transform(1, 0, skew, 1, 0, 0); cx.fillText(str, x - skew * y, y); cx.restore()
    }
    const label = (str: string, x: number, y: number, size: number, col: string, weight = '700', align: CanvasTextAlign = 'left') => { cx.save(); cx.font = weight + ' ' + size + 'px ' + FONT.sans; cx.textAlign = align; cx.textBaseline = 'alphabetic'; cx.fillStyle = col; cx.fillText(str, x, y); cx.restore() }
    const shard = (x: number, y: number, w: number, h: number, sk: number, fill: string, stroke?: string, sw = 0) => f.polygon({ points: [{ x: x + sk, y }, { x: x + w + sk, y }, { x: x + w, y: y + h }, { x, y: y + h }], fill, stroke, strokeWidth: sw })
    const star = (ccx: number, ccy: number, r: number, pts: number, rot: number, fill: string, stroke?: string, sw = 0) => {
      const p = []; for (let i = 0; i < pts * 2; i++) { const a = rot + i * Math.PI / pts, rr = i % 2 ? r * 0.42 : r; p.push({ x: ccx + Math.cos(a) * rr, y: ccy + Math.sin(a) * rr }) }
      f.polygon({ points: p, fill, stroke, strokeWidth: sw })
    }
    const speed = (ccx: number, ccy: number, n: number, t: number, col: string, a: number) => {
      cx.save(); cx.globalAlpha = a; const R = Math.max(W, H) * 1.5
      for (let i = 0; i < n; i++) { const ang = i / n * TAU + t * 0.06, w = 0.006 + (i % 4) * 0.004; f.polygon({ points: [{ x: ccx + Math.cos(ang - w) * 90, y: ccy + Math.sin(ang - w) * 90 }, { x: ccx + Math.cos(ang) * R, y: ccy + Math.sin(ang) * R }, { x: ccx + Math.cos(ang + w) * 90, y: ccy + Math.sin(ang + w) * 90 }], fill: col }) }
      cx.restore()
    }

    const navH = navHeight(S)

    f.onPress((p: { x: number; y: number }) => { down = true; dragY0 = p.y; scroll0 = scroll; moved = false })
    f.onRelease((p: { x: number; y: number }) => {
      if (!moved) {
        const nb = navHits.find((r) => p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h); if (nb) { nb.fn(); down = false; return }
        const h = hits.find((r) => p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h); if (h) h.fn()
      }
      down = false
    })
    f.onKey('ArrowDown', () => { if (sel < VERSIONS.length - 1) pick(sel + 1) })
    f.onKey('ArrowUp', () => { if (sel > 0) pick(sel - 1) })

    f.loop((dt: number, t: number) => {
      enter = Math.min(2.4, enter + dt); flash = Math.max(0, flash - dt * 2.2)
      if (f.mouseDown && down) { const dy = f.mouse.y - dragY0; if (Math.abs(dy) > 6) moved = true; scroll = scroll0 - dy; clampScroll() }
      hits = []

      // ── ground: black · halftone drift · red diagonal slabs · speed lines behind the hero ──
      f.background(BLACK)
      const heroCx = W * 0.5, heroCy = navH + S * 0.11
      speed(heroCx, heroCy, 60, t, 'rgba(230,0,43,0.10)', 1)
      cx.save(); cx.globalAlpha = 0.05; const gap = 24, ox = (t * 7) % gap
      for (let y = 0; y < H + gap; y += gap) for (let x = -gap; x < W + gap; x += gap) f.circle({ x: x + ox + (((y / gap) | 0) % 2) * gap / 2, y, r: 2.6, fill: PAPER })
      cx.restore()
      for (let i = -1; i < 5; i++) { const bx = W * 0.2 + i * 230 + Math.sin(t * 0.3 + i) * 14; f.polygon({ points: [{ x: bx, y: -20 }, { x: bx + 60, y: -20 }, { x: bx - 190, y: H + 20 }, { x: bx - 250, y: H + 20 }], fill: i % 2 ? 'rgba(230,0,43,0.04)' : 'rgba(255,255,255,0.02)' }) }

      // ── HERO: exploding CHANGELOG title ──
      star(W * 0.5, heroCy, S * 0.14, 12, t * 0.3, 'rgba(230,0,43,0.16)')
      const pulse = 1 + Math.sin(t * 3) * 0.02, tS = Math.max(40, Math.round(S * 0.085 * pulse))
      st('CHANGELOG', W / 2 + 5, heroCy + tS * 0.34 + 5, tS, INKLINE, '900', -0.2, 'center')   // ink shadow
      st('CHANGELOG', W / 2, heroCy + tS * 0.34, tS, PAPER, '900', -0.2, 'center')
      shard(W / 2 - 92, heroCy + tS * 0.5, 184, Math.max(22, S * 0.028), 16, RED)
      label('EVERY RELEASE · IN COLD BLOOD', W / 2, heroCy + tS * 0.5 + Math.max(15, S * 0.019), Math.max(10, Math.round(S * 0.014)), PAPER, '800', 'center')

      // ── VERSION TABS (fixed row, huge & slanted) ──
      const tabsY = heroCy + S * 0.11, tabH = Math.max(52, S * 0.08), pad = Math.max(16, W * 0.03)
      const tabW = Math.min((W - pad * 2 - 24) / VERSIONS.length, 240)
      VERSIONS.forEach((ver, i) => {
        const on = i === sel, tx = pad + i * (tabW + 12), slide = Math.max(0, Math.min(1, (enter - i * 0.09) / 0.4))
        const ease = 1 - Math.pow(1 - slide, 3), yoff = (1 - ease) * -60, pop = on ? -8 + Math.sin(t * 4) * 2 : 0
        cx.save(); cx.globalAlpha = ease
        shard(tx + 5, tabsY + yoff + pop + 5, tabW, tabH, 20, INKLINE)                          // ink drop
        shard(tx, tabsY + yoff + pop, tabW, tabH, 20, on ? RED : '#171214', PAPER, on ? 3 : 1.5)
        if (on) star(tx + tabW - 6, tabsY + yoff + pop + 8, 15, 5, t * 2, GOLD, INKLINE, 2)
        st('v' + ver.v, tx + 20, tabsY + yoff + pop + tabH * 0.5, Math.max(24, Math.round(S * 0.034)), on ? PAPER : '#c9beb2', '900')
        label(ver.tag, tx + 22, tabsY + yoff + pop + tabH * 0.78, Math.max(9, Math.round(S * 0.012)), on ? 'rgba(255,255,255,0.85)' : '#7d7369', '800')
        cx.restore()
        hits.push({ x: tx, y: tabsY + pop, w: tabW, h: tabH, fn: () => pick(i) })
      })

      // ── ENTRIES (scrollable comic panels) ──
      const listTop = tabsY + tabH + 34, ver = VERSIONS[sel]
      visH = H - listTop
      cx.save(); cx.beginPath(); cx.rect(0, listTop, W, H - listTop); cx.clip()
      const mX = pad, mW = W - pad * 2, eH = Math.max(58, S * 0.078), gapE = 14
      let y = listTop - scroll
      ver.entries.forEach((e, i) => {
        const a = Math.max(0, Math.min(1, (enter - 0.2 - i * 0.06) / 0.4))
        const bounce = a >= 1 ? 0 : (1 - a) * (1 - a) * Math.sin(a * 22) * 26   // overshoot bounce-in
        const ex = mX + (1 - Math.min(1, a * 1.4)) * -120 + bounce
        if (y + eH > listTop - 40 && y < H + 40) {
          cx.save(); cx.globalAlpha = Math.min(1, a * 1.5)
          shard(ex + 6, y + 6, mW, eH, 12, INKLINE)                              // thick ink shadow
          shard(ex, y, mW, eH, 12, '#161016', PAPER, 2)
          shard(ex - 3, y, 8, eH, 12, KCOL[e.k])                                 // colour spine
          // explosive category tag
          star(ex + 34, y + eH / 2, 22, 8, t * 1.5 + i, KCOL[e.k], INKLINE, 2)
          label(e.k, ex + 34, y + eH / 2 + 4, Math.max(9, Math.round(S * 0.0115)), e.k === 'FIX' ? BLACK : '#fff', '900', 'center')
          label('#' + String(i + 1).padStart(2, '0'), ex + mW - 14, y + 22, Math.max(11, Math.round(S * 0.016)), 'rgba(244,239,228,0.35)', '900', 'right')
          // wrapped text
          cx.save(); cx.font = '700 ' + Math.max(13, Math.round(S * 0.0185)) + 'px ' + FONT.sans; cx.fillStyle = '#efe7db'; cx.textBaseline = 'middle'
          const words = e.t.split(' '), maxW = mW - 130, tx = ex + 72; let line = '', lines: string[] = []
          for (const w of words) { const tt = line ? line + ' ' + w : w; if (cx.measureText(tt).width > maxW && line) { lines.push(line); line = w } else line = tt } if (line) lines.push(line)
          const startY = y + eH / 2 - (lines.length - 1) * 9.5
          lines.forEach((ln, li) => cx.fillText(ln, tx, startY + li * 19))
          cx.restore(); cx.restore()
        }
        y += eH + gapE
      })
      contentH = (y + scroll) - listTop + 30
      cx.restore()

      // scroll indicator
      if (contentH > visH) { const th = Math.max(30, visH * visH / contentH), ty = listTop + (scroll / (contentH - visH)) * (visH - th); f.rect({ x: W - 7, y: ty, w: 4, h: th, radius: 2, fill: RED }) }
      // fade at the top edge of the list so entries slide "under" the tabs
      const fade = f.linearGradient(0, listTop - 30, 0, listTop + 6, [[0, BLACK], [1, 'rgba(12,10,11,0)']]); f.rect({ x: 0, y: listTop - 30, w: W, h: 36, fill: fade })

      // ── nav + flash ──
      navHits = []
      drawNavBar({ f, cx, W, H, S, navH, ink: PAPER, accent: RED, bg: BLACK, path: typeof location !== 'undefined' ? location.pathname : '', menu: navMenu, hits: navHits, onNav: (to, ext) => go(to, ext), strip: false })
      if (flash > 0) { f.rect({ x: 0, y: 0, w: W, h: H, fill: 'rgba(255,255,255,' + (flash * 0.5) + ')' }); star(W * 0.5, H * 0.5, S * 0.4 * (1 - flash), 10, t, 'rgba(230,0,43,' + (flash * 0.4) + ')') }
      if (f.canvas) f.canvas.style.cursor = [...navHits, ...hits].some((r) => f.mouse.x >= r.x && f.mouse.x <= r.x + r.w && f.mouse.y >= r.y && f.mouse.y <= r.y + r.h) ? 'pointer' : 'default'
    })

    const onWheel = (e: WheelEvent) => { e.preventDefault(); scroll += e.deltaY; clampScroll() }
    el.addEventListener('wheel', onWheel, { passive: false })
    ;(f as any)._offWheel = () => el.removeEventListener('wheel', onWheel)
  }

  build()
  let rz: any
  const onResize = () => { clearTimeout(rz); rz = setTimeout(() => { if (alive) build() }, 160) }
  window.addEventListener('resize', onResize)
  return { destroy() { alive = false; window.removeEventListener('resize', onResize); if (f) { if (f._offWheel) f._offWheel(); f.destroy() } } }
}
