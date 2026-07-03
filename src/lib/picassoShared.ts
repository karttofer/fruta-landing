// Shared data for the two home renderers (desktop Proun + mobile scroll). Pure — no DOM.
export const PAL = {
  g0: '#eef1f0', g1: '#d7ddda', ink: '#141414', blue: '#123e88', cobalt: '#2f77b8',
  ochre: '#e2a636', verm: '#cf3b25', olive: '#5f7a3a', rose: '#df728c', teal: '#2c8c7c', cream: '#f4eede', plum: '#5a2a55',
}

// lighten (amt>0) / darken (amt<0) a #rrggbb toward white/black — for painterly gradient stops.
export const shade = (hex: string, amt: number) => {
  const n = parseInt(hex.slice(1), 16); let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255
  const t = amt < 0 ? 0 : 255, p = Math.abs(amt)
  r = Math.round(r + (t - r) * p); g = Math.round(g + (t - g) * p); b = Math.round(b + (t - b) * p)
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}

// the 8 library features — the desktop plaques + the mobile cards. col = accent, icon = glyph kind.
export const FEATURES = [
  { t: 'Semantic draw calls', d: 'Intent-named shapes with sensible defaults — no raw canvas plumbing to remember.', c: "f.circle({ x, y, r: 20, fill: 'tomato' })", col: PAL.verm, icon: 0 },
  { t: 'A delta-time loop', d: 'loop((dt, t) => …) runs every frame; multiply movement by dt so speed is identical on any screen.', c: 'f.loop((dt, t) => { x += 120 * dt })', col: PAL.blue, icon: 1 },
  { t: 'Particles', d: 'Bursts and continuous emitters with colour, gravity and life — one call, no bookkeeping.', c: "f.burst({ x, y, count: 30, color: 'gold' })", col: PAL.ochre, icon: 2 },
  { t: 'Camera & scenes', d: 'A follow camera with shake, a scene stack and fades — the scaffolding of a real game.', c: "f.camera.follow(hero); f.start('level1')", col: PAL.teal, icon: 3 },
  { t: 'Input, one line', d: 'Held keys, one-shot presses, a normalised move axis, pointer and gamepad — unified.', c: "if (f.keyPressed('Space')) jump()", col: PAL.rose, icon: 4 },
  { t: 'Tweening', d: '30+ easings, colour tweens, timelines and stagger, driven by one pure engine.', c: "f.tween(box, { to: { x: 300 }, ease: 'bounce' })", col: PAL.cobalt, icon: 5 },
  { t: 'Two backends', d: 'Canvas2D for the richest features, WebGL for tens of thousands of sprites — same API.', c: "Fruta({ renderer: 'webgl' })", col: PAL.olive, icon: 6 },
  { t: 'Tiny & typed', d: 'About 35 KB gzipped, zero dependencies, types bundled. ESM-only, tree-shakeable.', c: "import Fruta from 'fruta'", col: PAL.plum, icon: 7 },
]
