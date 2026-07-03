// The examples catalogue — a small, growing set of CONCISE, well-crafted fruta sketches (graphics, science,
// games). Each example IS its code string: the source you read is exactly what runs (no snapshot step).
// Add one = push an entry here + an ExLink in examples.muten.
import { highlightTS } from './highlight'
import { runCode } from './run'

export interface Example { name: string; title: string; cat: string; hint: string; code: string }

export const EXAMPLES: Example[] = [
  {
    name: 'spectrum', title: 'Audio Spectrum', cat: 'Audio', hint: 'A synth drives a live FFT — click to start',
    code: `const f = Fruta({ width: 600, height: 400, background: '#0a0b16' })

// a synth arpeggio feeds the analyser — no mic, no assets (click once to start the sound)
const notes = ['C4', 'E4', 'G4', 'B4', 'C5', 'B4', 'G4', 'E4']
const a = f.analyser()
let ni = 0, next = 0

f.loop((dt, t) => {
  if (t > next) { next = t + 0.26; f.tone({ note: notes[ni % notes.length], duration: 0.3, type: 'triangle', volume: 0.28 }); ni++ }
  f.background('#0a0b16')

  const bins = a.freqs(), N = 72
  for (let i = 0; i < N; i++) {
    const v = bins[i * 3] / 255
    f.rect({ x: i * (600 / N), y: 400, w: 600 / N - 2, h: -v * 300, fill: 'hsl(' + (190 + i * 2.2) + ',85%,' + (45 + v * 30) + '%)' })
  }

  const wave = a.wave(), pts = []
  for (let i = 0; i < wave.length; i += 6) pts.push({ x: i / wave.length * 600, y: 130 + (wave[i] - 128) / 128 * 80 })
  f.polygon({ points: pts, stroke: 'rgba(255,255,255,0.85)', strokeWidth: 2, close: false })

  f.text('audio-reactive — a synth drives f.analyser()  ·  click to start', { x: 300, y: 28, fill: 'rgba(255,255,255,0.55)', size: 13, align: 'center' })
})`,
  },
  {
    name: 'theremin', title: 'Theremin', cat: 'Audio', hint: 'Hold + move the mouse — osc + reverb + analyser',
    code: `const f = Fruta({ width: 600, height: 400, background: '#100a18' })
f.reverb(0.4)
const o = f.osc({ freq: 220, type: 'sine', volume: 0 })
const a = f.analyser()

f.loop(() => {
  const freq = f.map(f.mouse.x, 0, 600, 110, 880)
  const amp = f.mouseDown ? f.map(f.mouse.y, 400, 0, 0, 0.3) : 0
  o.freq(freq); o.amp(amp)                    // hold the mouse to play

  f.background('#100a18')
  const wave = a.wave(), pts = []
  for (let i = 0; i < wave.length; i += 5) pts.push({ x: i / wave.length * 600, y: 210 + (wave[i] - 128) / 128 * 130 })
  f.polygon({ points: pts, stroke: 'hsl(' + (freq / 880 * 280) + ',90%,66%)', strokeWidth: 3, close: false })

  f.circle({ x: f.mouse.x, y: f.mouse.y, r: 9, fill: 'rgba(255,255,255,0.6)' })
  f.text('theremin — hold + move the mouse  ·  f.osc + f.reverb + f.analyser', { x: 300, y: 28, fill: 'rgba(255,255,255,0.5)', size: 12, align: 'center' })
})`,
  },
  {
    name: 'piano', title: 'Piano', cat: 'Audio', hint: 'Click the keys — f.tone({ note }) + reverb',
    code: `const f = Fruta({ width: 600, height: 400, background: '#171320' })
f.reverb(0.3)

// one octave: 7 white keys + 5 black. Click a key and f.tone plays that note.
const whites = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4']
const blacks = [{ after: 0, note: 'C#4' }, { after: 1, note: 'D#4' }, { after: 3, note: 'F#4' }, { after: 4, note: 'G#4' }, { after: 5, note: 'A#4' }]
const kw = 600 / 7
let lit = '', litT = 0

const play = (note) => { f.tone({ note, duration: 0.6, type: 'triangle', volume: 0.3 }); lit = note; litT = 0.25 }

f.onPress((p) => {
  for (const b of blacks) { const bx = (b.after + 1) * kw - kw * 0.3; if (p.y < 265 && p.x > bx && p.x < bx + kw * 0.6) { play(b.note); return } }
  play(whites[Math.min(6, Math.floor(p.x / kw))])
})

f.loop((dt) => {
  litT = Math.max(0, litT - dt)
  f.background('#171320')
  for (let i = 0; i < 7; i++) { const on = lit === whites[i] && litT > 0; f.rect({ x: i * kw + 2, y: 70, w: kw - 4, h: 310, radius: 6, fill: on ? '#ff5470' : '#f2ece3', stroke: '#0c0a12', strokeWidth: 1.5 }) }
  for (const b of blacks) { const on = lit === b.note && litT > 0; f.rect({ x: (b.after + 1) * kw - kw * 0.3, y: 70, w: kw * 0.6, h: 195, radius: 4, fill: on ? '#ff5470' : '#191521', stroke: '#000', strokeWidth: 1 }) }
  f.text('piano — click the keys  ·  f.tone({ note }) + f.reverb', { x: 300, y: 40, fill: 'rgba(255,255,255,0.6)', size: 13, align: 'center' })
})`,
  },
  {
    name: 'sequencer', title: 'Step Sequencer', cat: 'Audio', hint: 'Click cells — a drum-machine grid on a clock',
    code: `const f = Fruta({ width: 600, height: 400, background: '#0b0e1a' })
const STEPS = 16, ROWS = 4
const notes = ['C5', 'G4', 'E4', 'C4']              // one pitch per row, high to low
const cols = ['#ff5470', '#ffd23f', '#3ddc97', '#4cc9ff']
const grid = [
  [1,0,0,0, 1,0,0,0, 1,0,1,0, 1,0,0,0],
  [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,1],
  [1,0,0,1, 0,1,0,0, 1,0,0,1, 0,1,0,0],
  [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,1,0],
]
const cw = 600 / STEPS, top = 92, ch = 260 / ROWS
let step = -1, next = 0

f.onPress((p) => { const c = Math.floor(p.x / cw), r = Math.floor((p.y - top) / ch); if (r >= 0 && r < ROWS && c >= 0 && c < STEPS) grid[r][c] = grid[r][c] ? 0 : 1 })

f.loop((dt, t) => {
  if (t > next) { next = t + 0.135; step = (step + 1) % STEPS; for (let r = 0; r < ROWS; r++) if (grid[r][step]) f.tone({ note: notes[r], duration: 0.16, type: r === 3 ? 'sine' : 'square', volume: 0.22 }) }
  f.background('#0b0e1a')
  f.rect({ x: step * cw, y: top, w: cw, h: ch * ROWS, fill: 'rgba(255,255,255,0.07)' })
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < STEPS; c++) {
    const on = grid[r][c], hot = on && c === step
    f.rect({ x: c * cw + 3, y: top + r * ch + 3, w: cw - 6, h: ch - 6, radius: 5, fill: on ? cols[r] : 'rgba(255,255,255,0.06)', stroke: hot ? '#fff' : 'rgba(0,0,0,0)', strokeWidth: 2 })
  }
  f.text('step sequencer — click cells to toggle  ·  f.tone on a clock', { x: 300, y: 46, fill: 'rgba(255,255,255,0.6)', size: 13, align: 'center' })
})`,
  },
  {
    name: 'musicbox', title: 'Music Box', cat: 'Audio', hint: 'Generative pentatonic rain — click once to start',
    code: `const f = Fruta({ width: 600, height: 400 })
f.reverb(0.55); f.delay({ time: 0.3, feedback: 0.3, wet: 0.22 })
const scale = ['C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'D5', 'E5']   // pentatonic — always pretty together
const LINE = 320
let drops = [], ripples = [], spawn = 0

f.loop((dt, t) => {
  if (t > spawn) { spawn = t + 0.22 + Math.random() * 0.4; drops.push({ x: 40 + Math.random() * 520, y: -10, s: Math.floor(Math.random() * scale.length), hit: false }) }
  f.background('rgba(9,13,26,0.26)')                 // fade instead of clear → soft trails
  f.line({ x1: 0, y1: LINE, x2: 600, y2: LINE, stroke: 'rgba(120,180,255,0.35)', strokeWidth: 2 })
  drops = drops.filter((d) => d.y < 430)
  for (const d of drops) {
    d.y += 130 * dt
    if (!d.hit && d.y >= LINE) { d.hit = true; f.tone({ note: scale[d.s], duration: 0.9, type: 'sine', volume: 0.2 }); ripples.push({ x: d.x, r: 0 }) }
    f.circle({ x: d.x, y: d.y, r: 6, fill: 'hsl(' + (200 + d.s * 15) + ',85%,68%)' })
  }
  ripples = ripples.filter((r) => r.r < 70)
  for (const r of ripples) { r.r += 95 * dt; f.circle({ x: r.x, y: LINE, r: r.r, stroke: 'hsla(210,90%,72%,' + (1 - r.r / 70) + ')', strokeWidth: 2 }) }
  f.text('music box — generative pentatonic  ·  f.tone + reverb + delay  ·  click to start', { x: 300, y: 28, fill: 'rgba(255,255,255,0.55)', size: 12, align: 'center' })
})`,
  },
  {
    name: 'chordpads', title: 'Chord Pads', cat: 'Audio', hint: 'Click a pad to strum a chord — lush reverb',
    code: `const f = Fruta({ width: 600, height: 400, background: '#130f1d' })
f.reverb(0.6)
const pads = [
  { n: 'C',  notes: ['C4', 'E4', 'G4'], c: '#ff6b8a' },
  { n: 'Am', notes: ['A3', 'C4', 'E4'], c: '#c77dff' },
  { n: 'F',  notes: ['F3', 'A3', 'C4'], c: '#5ec8ff' },
  { n: 'G',  notes: ['G3', 'B3', 'D4'], c: '#5effa8' },
]
const pw = 300, ph = 200
let lit = -1, litT = 0

f.onPress((p) => {
  const i = (p.y < ph ? 0 : 2) + (p.x < pw ? 0 : 1)
  pads[i].notes.forEach((note) => f.tone({ note, duration: 1.6, type: 'triangle', volume: 0.16 }))
  lit = i; litT = 0.5
})

f.loop((dt) => {
  litT = Math.max(0, litT - dt)
  f.background('#130f1d')
  pads.forEach((pad, i) => {
    const x = (i % 2) * pw, y = (i < 2 ? 0 : 1) * ph, k = lit === i ? litT / 0.5 : 0
    f.rect({ x: x + 6, y: y + 6, w: pw - 12, h: ph - 12, radius: 16, fill: pad.c, stroke: 'rgba(255,255,255,' + (0.18 + k * 0.7) + ')', strokeWidth: 2 + k * 5 })
    f.text(pad.n, { x: x + pw / 2, y: y + ph / 2 + 16, fill: 'rgba(18,10,24,0.85)', size: 48, align: 'center' })
  })
  f.text('chord pads — click to strum  ·  three f.tone notes + f.reverb', { x: 300, y: 386, fill: 'rgba(255,255,255,0.5)', size: 12, align: 'center' })
})`,
  },
  {
    name: 'orbits', title: 'Orbits', cat: 'Graphics', hint: 'Parametric motion + the loop',
    code: `const f = Fruta({ width: 480, height: 480, background: '#0f1018' })

f.loop((dt, t) => {
  f.background('#0f1018')
  for (let i = 0; i < 70; i++) {
    const a = t + i * 0.14
    f.circle({
      x: 240 + Math.cos(a) * (26 + i * 2.9),
      y: 240 + Math.sin(a * 1.3) * (26 + i * 2.9),
      r: 4,
      fill: 'hsl(' + ((i * 5 + t * 50) % 360) + ',82%,64%)',
    })
  }
})`,
  },
  {
    name: 'spiro', title: 'Spirograph', cat: 'Graphics', hint: 'A moving parametric curve',
    code: `const f = Fruta({ width: 480, height: 480, background: '#0b0d14' })

f.loop((dt, t) => {
  f.background('#0b0d14')
  let px = 240, py = 240
  for (let i = 0; i < 420; i++) {
    const a = i * 0.1 + t
    const r = 70 + Math.sin(i * 0.05 + t) * 100
    const x = 240 + Math.cos(a) * r
    const y = 240 + Math.sin(a * 1.02) * r
    f.line({ x1: px, y1: py, x2: x, y2: y, stroke: 'hsl(' + ((i + t * 40) % 360) + ',80%,62%)', strokeWidth: 1 })
    px = x; py = y
  }
})`,
  },
  {
    name: 'bouncing', title: 'Bouncing Balls', cat: 'Graphics', hint: 'Velocity, gravity, walls',
    code: `const f = Fruta({ width: 520, height: 400, background: '#101522' })

const balls = []
for (let i = 0; i < 18; i++) balls.push({
  x: f.rand(40, 480), y: f.rand(40, 200),
  vx: f.rand(-150, 150), vy: 0, r: f.rand(11, 24),
  c: 'hsl(' + f.rand(180, 340) + ',75%,62%)',
})

f.loop((dt) => {
  f.background('#101522')
  for (const b of balls) {
    b.vy += 760 * dt
    b.x += b.vx * dt; b.y += b.vy * dt
    if (b.x < b.r || b.x > 520 - b.r) b.vx *= -1
    if (b.y > 400 - b.r) { b.y = 400 - b.r; b.vy *= -0.82 }
    f.circle({ x: b.x, y: b.y, r: b.r, fill: b.c })
  }
})`,
  },
  {
    name: 'starfield', title: 'Starfield', cat: 'Graphics', hint: 'Fake-3D stars rushing past',
    code: `const f = Fruta({ width: 520, height: 400, background: '#05060c' })

const stars = []
for (let i = 0; i < 280; i++) stars.push({ x: f.rand(-260, 260), y: f.rand(-200, 200), z: f.rand(1, 520) })

f.loop((dt) => {
  f.background('#05060c')
  for (const s of stars) {
    s.z -= 200 * dt
    if (s.z < 1) { s.z = 520; s.x = f.rand(-260, 260); s.y = f.rand(-200, 200) }
    const k = 260 / s.z
    f.circle({ x: 260 + s.x * k, y: 200 + s.y * k, r: (1 - s.z / 520) * 2.8, fill: '#ffffff' })
  }
})`,
  },
  {
    name: 'blackhole', title: 'Black Hole', cat: 'Science', hint: 'Real gravity sim — orbits, event horizon, accretion',
    code: `const f = Fruta({ width: 600, height: 600, background: '#000000' })
const cx = 300, cy = 300, GM = 1900000, EH = 32, tilt = 0.28
const ps = []

// seed a particle on a near-circular orbit (tangential velocity v = sqrt(GM / r))
function seed(p) {
  const ang = Math.random() * 6.283, r = 55 + Math.random() * 200
  const v = Math.sqrt(GM / r) * (0.92 + Math.random() * 0.16)
  p.x = Math.cos(ang) * r; p.y = Math.sin(ang) * r
  p.vx = -Math.sin(ang) * v; p.vy = Math.cos(ang) * v
}
for (let i = 0; i < 2300; i++) { const p = {}; seed(p); ps.push(p) }
f.onPress((c) => { for (let k = 0; k < 90; k++) { const p = ps[(Math.random() * ps.length) | 0]; p.x = c.x - cx + f.rand(-12, 12); p.y = (c.y - cy) / tilt + f.rand(-12, 12); const ang = Math.random() * 6.283, v = f.rand(30, 120); p.vx = Math.cos(ang) * v; p.vy = Math.sin(ang) * v } })

function dot(p) {
  const r = Math.hypot(p.x, p.y), sp = Math.hypot(p.vx, p.vy)
  const heat = Math.min(1, 230 / r)
  const dop = 0.4 + 0.6 * (0.5 - 0.5 * (p.vy / (sp + 0.1)))   // relativistic beaming — brighter coming at us
  const li = Math.min(95, (24 + heat * 50) * (0.4 + dop))
  f.circle({ x: cx + p.x, y: cy + p.y * tilt, r: 1.3, fill: 'hsl(' + ((36 - heat * 28) | 0) + ',96%,' + (li | 0) + '%)' })
}

f.loop((dt) => {
  const d = Math.min(dt, 0.016)
  for (const p of ps) {
    const r2 = p.x * p.x + p.y * p.y, r = Math.sqrt(r2), a = GM / r2   // F = GM / r^2
    p.vx -= (p.x / r) * a * d; p.vy -= (p.y / r) * a * d                // accelerate toward the centre
    p.x += p.vx * d; p.y += p.vy * d                                    // (semi-implicit Euler = stable orbits)
    if (r < EH) seed(p)                                                 // event horizon: absorbed → reborn at the edge
  }
  f.background('#000000')
  for (const p of ps) if (p.y < 0) dot(p)                              // far side of the disk — behind the hole
  f.circle({ x: cx, y: cy, r: EH + 14, stroke: 'rgba(255,150,70,0.16)', strokeWidth: 18 })   // lensed halo
  f.circle({ x: cx, y: cy, r: EH, fill: '#000000' })                   // the event-horizon shadow
  f.circle({ x: cx, y: cy, r: EH + 1, stroke: 'rgba(255,225,160,0.95)', strokeWidth: 2.5 })  // photon ring
  for (const p of ps) if (p.y >= 0) dot(p)                             // near side — in front
})`,
  },
  {
    name: 'cern', title: 'Hadron Collider', cat: 'Science', hint: 'Beams circle the ring + collide at the detector',
    code: `const f = Fruta({ width: 600, height: 600, background: '#04060c' })
const cx = 300, cy = 300, R = 232, sp = 2.1, IP = Math.PI / 2
const ix = cx + Math.cos(IP) * R, iy = cy + Math.sin(IP) * R   // the interaction point (detector)
let beamA = 0, lastLap = 0, tracks = [], age = 99

// a collision EVENT: a spray of secondary tracks, curving by charge in the magnetic field
function collide() {
  tracks = []; age = 0
  const n = 16 + (Math.random() * 16 | 0)
  for (let i = 0; i < n; i++) {
    const curv = f.rand(-0.06, 0.06), step = f.rand(4, 6.5), pts = [{ x: ix, y: iy }]
    let x = ix, y = iy, dir = Math.random() * 6.283
    for (let s = 0; s < 54; s++) { dir += curv; x += Math.cos(dir) * step; y += Math.sin(dir) * step; pts.push({ x, y }); if (x < 4 || x > 596 || y < 4 || y > 596) break }
    tracks.push({ pts, c: curv > 0 ? '#ff6f91' : '#67c7ff' })
  }
  f.burst({ x: ix, y: iy, count: 60, color: ['#ffffff', '#ffd24a', '#67c7ff'], speed: [90, 360], life: 0.7, size: 2 })
}
function bunch(ang, c) {
  for (let i = 0; i < 6; i++) { const a = ang - i * 0.045; f.circle({ x: cx + Math.cos(a) * R, y: cy + Math.sin(a) * R, r: 4.6 - i * 0.62, fill: c }) }
}

f.loop((dt) => {
  beamA += sp * dt; age += dt
  const lap = Math.floor((beamA - IP) / (2 * Math.PI))
  if (lap > lastLap) { lastLap = lap; collide() }              // the two bunches meet at the detector each lap

  f.background('#04060c')
  f.circle({ x: cx, y: cy, r: R, stroke: 'rgba(120,150,210,0.1)', strokeWidth: 28 })   // beam pipe
  f.circle({ x: cx, y: cy, r: R, stroke: 'rgba(150,175,235,0.45)', strokeWidth: 3 })
  f.circle({ x: ix, y: iy, r: 34, stroke: 'rgba(255,255,255,0.18)', strokeWidth: 2 })  // detector
  f.circle({ x: ix, y: iy, r: 22, stroke: 'rgba(255,255,255,0.12)', strokeWidth: 2 })
  bunch(beamA, '#67c7ff')                                       // clockwise beam
  bunch(2 * IP - beamA, '#ff6f91')                              // counter-rotating beam (meets A at IP)
  f.push({ alpha: Math.max(0, 1 - age / 2.2) })
  for (const tr of tracks) for (let i = 1; i < tr.pts.length; i++) f.line({ x1: tr.pts[i - 1].x, y1: tr.pts[i - 1].y, x2: tr.pts[i].x, y2: tr.pts[i].y, stroke: tr.c, strokeWidth: 1.5, cap: 'round' })
  f.pop()
  f.drawParticles()
})`,
  },
  {
    name: 'pendulum', title: 'Double Pendulum', cat: 'Science', hint: 'Deterministic chaos + a trail',
    code: `const f = Fruta({ width: 600, height: 600, background: '#0a0b12' })
const m1 = 1, m2 = 1, L1 = 1, L2 = 1, g = 1
let a1 = Math.PI / 2 + 0.4, a2 = Math.PI / 2 + 0.42, v1 = 0, v2 = 0
const PX = 165, ox = 300, oy = 215, trail = []
f.onPress(() => { a1 = Math.PI / 2 + (Math.random() - 0.5) * 2; a2 = Math.PI / 2 + (Math.random() - 0.5) * 2; v1 = 0; v2 = 0; trail.length = 0 })

f.loop(() => {
  for (let s = 0; s < 6; s++) {
    const dt = 0.012, c = Math.cos(a1 - a2), si = Math.sin(a1 - a2)
    const den = 2 * m1 + m2 - m2 * Math.cos(2 * a1 - 2 * a2)
    const a1a = (-g * (2 * m1 + m2) * Math.sin(a1) - m2 * g * Math.sin(a1 - 2 * a2) - 2 * si * m2 * (v2 * v2 * L2 + v1 * v1 * L1 * c)) / (L1 * den)
    const a2a = (2 * si * (v1 * v1 * L1 * (m1 + m2) + g * (m1 + m2) * Math.cos(a1) + v2 * v2 * L2 * m2 * c)) / (L2 * den)
    v1 += a1a * dt; v2 += a2a * dt; a1 += v1 * dt; a2 += v2 * dt
  }
  const x1 = ox + Math.sin(a1) * L1 * PX, y1 = oy + Math.cos(a1) * L1 * PX
  const x2 = x1 + Math.sin(a2) * L2 * PX, y2 = y1 + Math.cos(a2) * L2 * PX
  trail.push({ x: x2, y: y2 }); if (trail.length > 260) trail.shift()

  f.background('#0a0b12')
  for (let i = 1; i < trail.length; i++) f.line({ x1: trail[i - 1].x, y1: trail[i - 1].y, x2: trail[i].x, y2: trail[i].y, stroke: 'hsl(' + (200 + i * 0.35 | 0) + ',80%,62%)', strokeWidth: 1.5 })
  f.line({ x1: ox, y1: oy, x2: x1, y2: y1, stroke: '#8898b0', strokeWidth: 3 })
  f.line({ x1: x1, y1: y1, x2: x2, y2: y2, stroke: '#8898b0', strokeWidth: 3 })
  f.circle({ x: x1, y: y1, r: 10, fill: '#67d4ff' })
  f.circle({ x: x2, y: y2, r: 10, fill: '#ff6f91' })
})`,
  },
  {
    name: 'nbody', title: 'N-body Gravity', cat: 'Science', hint: 'Click to add a star — mutual gravity',
    code: `const f = Fruta({ width: 600, height: 600 })
f.rect({ x: 0, y: 0, w: 600, h: 600, fill: '#03040a' })
const bodies = []
for (let i = 0; i < 100; i++) bodies.push({ x: f.rand(80, 520), y: f.rand(80, 520), vx: f.rand(-6, 6), vy: f.rand(-6, 6), m: f.rand(1, 4) })
f.onPress((p) => bodies.push({ x: p.x, y: p.y, vx: 0, vy: 0, m: 10 }))   // click drops a heavy star

f.loop((dt) => {
  const d = Math.min(dt, 0.03), n = bodies.length
  for (let i = 0; i < n; i++) {
    const a = bodies[i]
    for (let j = i + 1; j < n; j++) {
      const b = bodies[j], dx = b.x - a.x, dy = b.y - a.y, d2 = dx * dx + dy * dy + 90
      const fr = 95 / (d2 * Math.sqrt(d2))
      a.vx += dx * fr * b.m * d; a.vy += dy * fr * b.m * d
      b.vx -= dx * fr * a.m * d; b.vy -= dy * fr * a.m * d
    }
  }
  f.rect({ x: 0, y: 0, w: 600, h: 600, fill: 'rgba(3,4,10,0.3)' })
  for (const b of bodies) {
    b.x += b.vx * d; b.y += b.vy * d
    if (b.x < 0 || b.x > 600) b.vx *= -0.9
    if (b.y < 0 || b.y > 600) b.vy *= -0.9
    f.circle({ x: b.x, y: b.y, r: 1 + b.m, fill: 'hsl(' + (208 + b.m * 12 | 0) + ',82%,70%)' })
  }
  f.text('click to add a star', { x: 300, y: 584, fill: 'rgba(255,255,255,0.35)', size: 13, align: 'center' })
})`,
  },
  {
    name: 'lorenz', title: 'Lorenz Attractor', cat: 'Science', hint: 'A strange attractor — chaos in 3D',
    code: `const f = Fruta({ width: 600, height: 600, background: '#04060c' })
let x = 0.1, y = 0, z = 0
const sigma = 10, rho = 28, beta = 8 / 3, pts = []

f.loop((dt, t) => {
  for (let i = 0; i < 6; i++) {
    const h = 0.006                                   // integrate the Lorenz system
    const dx = sigma * (y - x), dy = x * (rho - z) - y, dz = x * y - beta * z
    x += dx * h; y += dy * h; z += dz * h
    pts.push({ x, y, z })
  }
  if (pts.length > 2800) pts.splice(0, pts.length - 2800)
  f.background('#04060c')
  const ca = Math.cos(t * 0.25), sa = Math.sin(t * 0.25)   // slowly rotate the 3D view
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i], q = pts[i - 1]
    f.line({
      x1: 300 + (q.x * ca - q.y * sa) * 8, y1: 470 - q.z * 8,
      x2: 300 + (p.x * ca - p.y * sa) * 8, y2: 470 - p.z * 8,
      stroke: 'hsl(' + (190 + i * 0.05 | 0) + ',82%,62%)', strokeWidth: 1,
    })
  }
})`,
  },
  {
    name: 'boids', title: 'Flocking (Boids)', cat: 'Science', hint: 'Move the mouse to scatter the flock',
    code: `const f = Fruta({ width: 600, height: 600, background: '#0a0d16' })
const boids = []
for (let i = 0; i < 130; i++) boids.push({ x: f.rand(0, 600), y: f.rand(0, 600), vx: f.rand(-40, 40), vy: f.rand(-40, 40) })

f.loop((dt) => {
  const d = Math.min(dt, 0.03)
  for (const b of boids) {
    let cx = 0, cy = 0, ax = 0, ay = 0, sx = 0, sy = 0, n = 0
    for (const o of boids) {                          // cohesion + alignment + separation
      if (o === b) continue
      const dx = o.x - b.x, dy = o.y - b.y, dd = dx * dx + dy * dy
      if (dd < 4000) { cx += o.x; cy += o.y; ax += o.vx; ay += o.vy; n++; if (dd < 500) { sx -= dx; sy -= dy } }
    }
    if (n) {
      b.vx += (cx / n - b.x) * 0.5 * d + (ax / n - b.vx) * 0.8 * d + sx * 1.4 * d
      b.vy += (cy / n - b.y) * 0.5 * d + (ay / n - b.vy) * 0.8 * d + sy * 1.4 * d
    }
    const mdx = b.x - f.mouse.x, mdy = b.y - f.mouse.y, md = Math.hypot(mdx, mdy) + 1
    if (md < 120) { b.vx += (mdx / md) * 500 * d; b.vy += (mdy / md) * 500 * d }   // flee the mouse
    const sp = Math.hypot(b.vx, b.vy)
    if (sp > 130) { b.vx = b.vx / sp * 130; b.vy = b.vy / sp * 130 }
    b.x = (b.x + b.vx * d + 600) % 600; b.y = (b.y + b.vy * d + 600) % 600
  }
  f.background('#0a0d16')
  for (const b of boids) {
    f.push({ x: b.x, y: b.y, rotate: Math.atan2(b.vy, b.vx) * 180 / Math.PI })
    f.polygon({ points: [{ x: 8, y: 0 }, { x: -5, y: 4 }, { x: -5, y: -4 }], fill: '#67d4ff' })
    f.pop()
  }
})`,
  },
  {
    name: 'solar', title: 'Solar System', cat: 'Science', hint: 'Keplerian orbits — inner planets run faster',
    code: `const f = Fruta({ width: 600, height: 600, background: '#03040a' })
const planets = [
  { r: 52, s: 1.6, sz: 3, c: '#b6b6b6' }, { r: 80, s: 1.17, sz: 6, c: '#e8b87a' },
  { r: 112, s: 1.0, sz: 6.5, c: '#5b9bd5', moon: 16 }, { r: 146, s: 0.81, sz: 5, c: '#d56b4a' },
  { r: 205, s: 0.44, sz: 14, c: '#d8b88a', ring: 1 }, { r: 258, s: 0.32, sz: 12, c: '#e0c89a' },
]
f.loop((dt, t) => {
  f.background('#03040a')
  for (const p of planets) f.circle({ x: 300, y: 300, r: p.r, stroke: 'rgba(120,140,180,0.1)', strokeWidth: 1 })
  f.circle({ x: 300, y: 300, r: 30, stroke: 'rgba(255,200,80,0.18)', strokeWidth: 14 })
  f.circle({ x: 300, y: 300, r: 18, fill: '#ffd24a' })
  for (const p of planets) {
    const a = t * p.s, x = 300 + Math.cos(a) * p.r, y = 300 + Math.sin(a) * p.r
    if (p.ring) f.circle({ x, y, r: p.sz + 8, stroke: 'rgba(216,184,138,0.5)', strokeWidth: 3 })
    f.circle({ x, y, r: p.sz, fill: p.c })
    if (p.moon) f.circle({ x: x + Math.cos(t * 4) * p.moon, y: y + Math.sin(t * 4) * p.moon, r: 2, fill: '#ccc' })
  }
})`,
  },
  {
    name: 'waves', title: 'Wave Interference', cat: 'Science', hint: 'Click to add a wave source',
    code: `const f = Fruta({ width: 480, height: 480, background: '#000000' })
const ctx = f.context, W = 480, H = 480, img = ctx.createImageData(W, H), data = img.data
for (let i = 3; i < data.length; i += 4) data[i] = 255
let sources = [{ x: 180, y: 240 }, { x: 300, y: 240 }]
f.onPress((p) => { if (sources.length >= 6) sources = []; sources.push({ x: p.x, y: p.y }) })

f.loop((dt, t) => {
  for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2) {
    let s = 0
    for (const src of sources) s += Math.sin(Math.hypot(x - src.x, y - src.y) * 0.3 - t * 7)
    const v = s / sources.length * 0.5 + 0.5
    const r = (v * 70) | 0, g = (v * 140) | 0, b = (70 + v * 185) | 0
    for (let q = 0; q < 4; q++) { const i = ((y + (q >> 1)) * W + x + (q & 1)) * 4; data[i] = r; data[i + 1] = g; data[i + 2] = b }
  }
  ctx.putImageData(img, 0, 0)
  for (const src of sources) f.circle({ x: src.x, y: src.y, r: 3, fill: '#ffffff' })
})`,
  },
  {
    name: 'life', title: 'Game of Life', cat: 'Science', hint: 'Click to draw cells — Conway automaton',
    code: `const f = Fruta({ width: 600, height: 600, background: '#0a0d14' })
const N = 60, S = 600 / N
let grid = new Uint8Array(N * N)
for (let i = 0; i < grid.length; i++) grid[i] = Math.random() < 0.22 ? 1 : 0
f.onPress((p) => { grid[((p.y / S) | 0) * N + ((p.x / S) | 0)] ^= 1 })
let acc = 0

f.loop((dt) => {
  acc += dt
  if (acc > 0.09) {
    acc = 0
    const next = new Uint8Array(N * N)
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      let n = 0
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { if (dx || dy) n += grid[((y + dy + N) % N) * N + (x + dx + N) % N] }
      const a = grid[y * N + x]
      next[y * N + x] = (a && (n === 2 || n === 3)) || (!a && n === 3) ? 1 : 0
    }
    grid = next
  }
  f.background('#0a0d14')
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (grid[y * N + x]) f.rect({ x: x * S, y: y * S, w: S - 1, h: S - 1, radius: 2, fill: '#67d4ff' })
})`,
  },
  {
    name: 'julia', title: 'Julia Set', cat: 'Science', hint: 'A fractal morphing in real time',
    code: `const f = Fruta({ width: 440, height: 440, background: '#000000' })
const ctx = f.context, W = 440, H = 440, img = ctx.createImageData(W, H), data = img.data

f.loop((dt, t) => {
  const cre = 0.7885 * Math.cos(t * 0.25), cim = 0.7885 * Math.sin(t * 0.25)
  for (let py = 0; py < H; py++) for (let px = 0; px < W; px++) {
    let zx = px / W * 3 - 1.5, zy = py / H * 3 - 1.5, i = 0
    for (; i < 40; i++) { const x2 = zx * zx, y2 = zy * zy; if (x2 + y2 > 4) break; zy = 2 * zx * zy + cim; zx = x2 - y2 + cre }
    const m = i / 40, k = (py * W + px) * 4
    data[k] = 9 * (1 - m) * m * m * m * 255
    data[k + 1] = 15 * (1 - m) * (1 - m) * m * m * 255
    data[k + 2] = 8.5 * (1 - m) * (1 - m) * (1 - m) * m * 255
    data[k + 3] = 255
  }
  ctx.putImageData(img, 0, 0)
})`,
  },
  {
    name: 'dla', title: 'Dendrite Growth', cat: 'Science', hint: 'Diffusion-limited aggregation — a crystal grows',
    code: `const f = Fruta({ width: 500, height: 500, background: '#05060c' })
const cx = 250, cy = 250, occ = new Set(), stuck = [{ x: cx, y: cy, c: 0 }]
const key = (x, y) => x + ',' + y
occ.add(key(cx, cy))
let radius = 4

function walk() {
  const a = Math.random() * 6.283, sr = radius + 6
  let x = Math.round(cx + Math.cos(a) * sr), y = Math.round(cy + Math.sin(a) * sr)
  for (let s = 0; s < 800; s++) {
    if (occ.has(key(x + 1, y)) || occ.has(key(x - 1, y)) || occ.has(key(x, y + 1)) || occ.has(key(x, y - 1))) {
      occ.add(key(x, y)); const d = Math.hypot(x - cx, y - cy); if (d > radius) radius = d
      stuck.push({ x, y, c: d }); return
    }
    x += (Math.random() * 3 | 0) - 1; y += (Math.random() * 3 | 0) - 1
    if (Math.hypot(x - cx, y - cy) > sr + 40) return
  }
}

f.loop(() => {
  for (let k = 0; k < 30; k++) if (radius < 235) walk()
  f.background('#05060c')
  for (const s of stuck) f.rect({ x: s.x - 1, y: s.y - 1, w: 2.6, h: 2.6, fill: 'hsl(' + (200 + s.c * 0.55 | 0) + ',82%,' + (48 + s.c * 0.1 | 0) + '%)' })
})`,
  },
  {
    name: 'fourier', title: 'Fourier Series', cat: 'Science', hint: 'Epicycles draw a square wave',
    code: `const f = Fruta({ width: 600, height: 400, background: '#0a0d16' })
const trail = []

f.loop((dt, t) => {
  f.background('#0a0d16')
  let x = 150, y = 200
  for (let k = 0; k < 9; k++) {
    const n = 2 * k + 1, r = 85 * (4 / (n * Math.PI)), px = x, py = y
    x += r * Math.cos(n * t); y += r * Math.sin(n * t)
    f.circle({ x: px, y: py, r: Math.abs(r), stroke: 'rgba(120,150,220,0.22)', strokeWidth: 1 })
    f.line({ x1: px, y1: py, x2: x, y2: y, stroke: 'rgba(190,210,255,0.7)', strokeWidth: 1.5 })
  }
  trail.unshift(y)
  if (trail.length > 320) trail.pop()
  f.line({ x1: x, y1: y, x2: 360, y2: trail[0], stroke: 'rgba(255,255,255,0.25)', strokeWidth: 1 })
  for (let i = 1; i < trail.length; i++) f.line({ x1: 360 + i, y1: trail[i - 1], x2: 361 + i, y2: trail[i], stroke: '#67d4ff', strokeWidth: 1.5 })
})`,
  },
  {
    name: 'cloth', title: 'Cloth Simulation', cat: 'Science', hint: 'Drag it — Verlet springs + gravity',
    code: `const f = Fruta({ width: 600, height: 600, background: '#0a0d16' })
const COLS = 24, ROWS = 17, sp = 21, ox = 300 - (COLS - 1) * sp / 2
const pts = [], links = []
for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) { const px = ox + x * sp, py = 30 + y * sp; pts.push({ x: px, y: py, ox: px, oy: py, pin: y === 0 && x % 4 === 0 }) }
for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) { const i = y * COLS + x; if (x < COLS - 1) links.push([i, i + 1]); if (y < ROWS - 1) links.push([i, i + COLS]) }
let drag = null
f.onPress((p) => { let bd = 35; for (const pt of pts) { const d = Math.hypot(pt.x - p.x, pt.y - p.y); if (d < bd) { bd = d; drag = pt } } })
f.onRelease(() => { drag = null })

f.loop(() => {
  if (drag) { drag.x = f.mouse.x; drag.y = f.mouse.y; drag.ox = drag.x; drag.oy = drag.y }
  for (const p of pts) { if (p.pin || p === drag) continue; const vx = (p.x - p.ox) * 0.99, vy = (p.y - p.oy) * 0.99; p.ox = p.x; p.oy = p.y; p.x += vx; p.y += vy + 0.45 }
  for (let k = 0; k < 4; k++) for (const [a, b] of links) {
    const pa = pts[a], pb = pts[b], dx = pb.x - pa.x, dy = pb.y - pa.y, d = Math.hypot(dx, dy) || 1, m = (sp - d) / d * 0.5
    if (!pa.pin && pa !== drag) { pa.x -= dx * m; pa.y -= dy * m }
    if (!pb.pin && pb !== drag) { pb.x += dx * m; pb.y += dy * m }
  }
  f.background('#0a0d16')
  for (const [a, b] of links) f.line({ x1: pts[a].x, y1: pts[a].y, x2: pts[b].x, y2: pts[b].y, stroke: 'rgba(120,180,255,0.45)', strokeWidth: 1 })
})`,
  },
  {
    name: 'efield', title: 'Electric Field', cat: 'Science', hint: 'Drag the charges around · click empty space to add one',
    code: `const f = Fruta({ width: 600, height: 600, background: '#06070d' })
const charges = [{ x: 220, y: 300, q: 1 }, { x: 380, y: 300, q: -1 }]
let drag = null
f.onPress((p) => {
  for (const c of charges) if (Math.hypot(c.x - p.x, c.y - p.y) < 22) { drag = c; return }   // grab a nearby charge…
  charges.push({ x: p.x, y: p.y, q: charges.length % 2 ? -1 : 1 })                            // …or drop a new one
})
f.onRelease(() => { drag = null })

function field(x, y) {
  let ex = 0, ey = 0
  for (const c of charges) { const dx = x - c.x, dy = y - c.y, d2 = dx * dx + dy * dy + 36, d = Math.sqrt(d2), k = c.q * 9000 / (d2 * d); ex += dx * k; ey += dy * k }
  return { ex, ey }
}

f.loop(() => {
  if (drag) { drag.x = f.mouse.x; drag.y = f.mouse.y }
  f.background('#06070d')
  for (const c of charges) {
    if (c.q < 0) continue
    for (let a = 0; a < 12; a++) {
      let x = c.x + Math.cos(a / 12 * 6.283) * 13, y = c.y + Math.sin(a / 12 * 6.283) * 13
      for (let s = 0; s < 110; s++) {
        const e = field(x, y), m = Math.hypot(e.ex, e.ey) || 1, nx = x + e.ex / m * 4.5, ny = y + e.ey / m * 4.5
        f.line({ x1: x, y1: y, x2: nx, y2: ny, stroke: 'rgba(120,160,255,0.4)', strokeWidth: 1 })
        x = nx; y = ny
        if (x < 0 || x > 600 || y < 0 || y > 600) break
      }
    }
  }
  for (const c of charges) {
    if (c === drag) f.circle({ x: c.x, y: c.y, r: 16, stroke: '#fff', strokeWidth: 2 })
    f.circle({ x: c.x, y: c.y, r: 12, fill: c.q > 0 ? '#ff6f91' : '#67c7ff' })
    f.text(c.q > 0 ? '+' : '-', { x: c.x, y: c.y + 5, fill: '#fff', size: 16, align: 'center' })
  }
  f.text('drag the charges · click to add', { x: 300, y: 585, fill: 'rgba(255,255,255,0.4)', size: 13, align: 'center' })
})`,
  },
  {
    name: 'chladni', title: 'Chladni Patterns', cat: 'Science', hint: 'Sand on a vibrating plate finds the nodes',
    code: `const f = Fruta({ width: 600, height: 600, background: '#0c0d12' })
const ps = []
for (let i = 0; i < 3200; i++) ps.push({ x: f.rand(0, 600), y: f.rand(0, 600) })
let m = 3, n = 2, timer = 0
const disp = (x, y) => { const a = x / 600 * Math.PI, b = y / 600 * Math.PI; return Math.sin(m * a) * Math.sin(n * b) - Math.sin(n * a) * Math.sin(m * b) }

f.loop((dt) => {
  timer += dt
  if (timer > 4) { timer = 0; m = 1 + (Math.random() * 5 | 0); n = 1 + (Math.random() * 5 | 0) }
  for (const p of ps) {
    const jig = Math.abs(disp(p.x, p.y)) * 6 + 0.4
    p.x = f.clamp(p.x + (Math.random() - 0.5) * jig * 2, 1, 599)
    p.y = f.clamp(p.y + (Math.random() - 0.5) * jig * 2, 1, 599)
  }
  f.background('#0c0d12')
  for (const p of ps) f.circle({ x: p.x, y: p.y, r: 1, fill: '#e8d8b0' })
  f.text('m=' + m + '  n=' + n, { x: 300, y: 585, fill: 'rgba(255,255,255,0.4)', size: 13, align: 'center' })
})`,
  },
  {
    name: 'mandelbrot', title: 'Mandelbrot Set', cat: 'Science', hint: 'Zooming into the seahorse valley',
    code: `const f = Fruta({ width: 420, height: 420, background: '#000000' })
const ctx = f.context, W = 420, H = 420, img = ctx.createImageData(W, H), data = img.data
const tx = -0.745, ty = 0.1135                                         // zoom target
let zoom = 1

f.loop(() => {
  zoom *= 1.012
  if (zoom > 9000) zoom = 1
  const sc = 3 / zoom
  for (let py = 0; py < H; py++) for (let px = 0; px < W; px++) {
    const x0 = tx + (px / W - 0.5) * sc, y0 = ty + (py / H - 0.5) * sc
    let x = 0, y = 0, i = 0
    for (; i < 90; i++) { const x2 = x * x, y2 = y * y; if (x2 + y2 > 4) break; y = 2 * x * y + y0; x = x2 - y2 + x0 }
    const m = i / 90, k = (py * W + px) * 4
    data[k] = 9 * (1 - m) * m * m * m * 255
    data[k + 1] = 15 * (1 - m) * (1 - m) * m * m * 255
    data[k + 2] = 8.5 * (1 - m) * (1 - m) * (1 - m) * m * 255
    data[k + 3] = 255
  }
  ctx.putImageData(img, 0, 0)
})`,
  },
  {
    name: 'tree', title: 'Recursive Tree', cat: 'Math', hint: 'A fractal tree swaying in the wind',
    code: `const f = Fruta({ width: 600, height: 600, background: '#0c1018' })

f.loop((dt, t) => {
  f.background('#0c1018')
  const sway = Math.sin(t * 0.8) * 0.12
  function branch(x, y, len, ang, depth) {
    if (depth === 0 || len < 2) return
    const ex = x + Math.cos(ang) * len, ey = y + Math.sin(ang) * len
    f.line({ x1: x, y1: y, x2: ex, y2: ey, stroke: 'hsl(' + (100 - depth * 6) + ',' + (25 + depth * 7) + '%,' + (28 + depth * 4) + '%)', strokeWidth: depth })
    branch(ex, ey, len * 0.76, ang - 0.5 + sway, depth - 1)
    branch(ex, ey, len * 0.76, ang + 0.5 + sway, depth - 1)
  }
  branch(300, 570, 115, -Math.PI / 2, 10)
})`,
  },
  {
    name: 'kaleidoscope', title: 'Kaleidoscope', cat: 'Math', hint: 'Move the mouse to paint with symmetry',
    code: `const f = Fruta({ width: 600, height: 600 })
f.rect({ x: 0, y: 0, w: 600, h: 600, fill: '#000000' })
const trail = []
f.onMove((p) => { trail.push({ x: p.x - 300, y: p.y - 300 }); if (trail.length > 70) trail.shift() })

f.loop((dt, t) => {
  f.rect({ x: 0, y: 0, w: 600, h: 600, fill: 'rgba(0,0,0,0.07)' })
  const seg = 8
  for (let i = 0; i < trail.length; i++) {
    const pt = trail[i], hue = (i * 4 + t * 50) % 360
    for (let s = 0; s < seg; s++) {
      f.push({ x: 300, y: 300, rotate: s * 360 / seg })
      f.circle({ x: pt.x, y: pt.y, r: 4, fill: 'hsl(' + hue + ',80%,62%)' })
      f.circle({ x: pt.x, y: -pt.y, r: 4, fill: 'hsl(' + hue + ',80%,62%)' })
      f.pop()
    }
  }
})`,
  },
  {
    name: 'bezier', title: 'Bezier Curve', cat: 'Math', hint: 'A cubic curve with moving control points',
    code: `const f = Fruta({ width: 600, height: 420, background: '#0a0d16' })

f.loop((dt, t) => {
  f.background('#0a0d16')
  const p0 = { x: 70, y: 210 }, p3 = { x: 530, y: 210 }
  const p1 = { x: 210, y: 210 + Math.sin(t) * 150 }, p2 = { x: 390, y: 210 + Math.cos(t * 1.3) * 150 }
  f.line({ x1: p0.x, y1: p0.y, x2: p1.x, y2: p1.y, stroke: 'rgba(120,140,180,0.3)', strokeWidth: 1 })
  f.line({ x1: p2.x, y1: p2.y, x2: p3.x, y2: p3.y, stroke: 'rgba(120,140,180,0.3)', strokeWidth: 1 })
  let px = p0.x, py = p0.y
  for (let i = 1; i <= 64; i++) {
    const u = i / 64, v = 1 - u
    const x = v * v * v * p0.x + 3 * v * v * u * p1.x + 3 * v * u * u * p2.x + u * u * u * p3.x
    const y = v * v * v * p0.y + 3 * v * v * u * p1.y + 3 * v * u * u * p2.y + u * u * u * p3.y
    f.line({ x1: px, y1: py, x2: x, y2: y, stroke: 'hsl(' + ((i * 4 + t * 40 | 0) % 360) + ',80%,62%)', strokeWidth: 3 })
    px = x; py = y
  }
  for (const p of [p0, p1, p2, p3]) f.circle({ x: p.x, y: p.y, r: 5, fill: '#ffffff' })
})`,
  },
  {
    name: 'noise', title: 'Noise Flow Field', cat: 'Math', hint: 'Particles ride an invisible vector field',
    code: `const f = Fruta({ width: 600, height: 600 })
f.rect({ x: 0, y: 0, w: 600, h: 600, fill: '#0a0b12' })
const ps = []
for (let i = 0; i < 900; i++) ps.push({ x: f.rand(0, 600), y: f.rand(0, 600) })
const flow = (x, y, t) => (Math.sin(x * 0.008 + t * 0.2) + Math.cos(y * 0.008 - t * 0.15) + Math.sin((x + y) * 0.006)) * 1.7

f.loop((dt, t) => {
  f.rect({ x: 0, y: 0, w: 600, h: 600, fill: 'rgba(10,11,18,0.05)' })
  for (const p of ps) {
    const a = flow(p.x, p.y, t)
    p.x += Math.cos(a) * 1.5; p.y += Math.sin(a) * 1.5
    if (p.x < 0 || p.x > 600 || p.y < 0 || p.y > 600) { p.x = f.rand(0, 600); p.y = f.rand(0, 600) }
    f.circle({ x: p.x, y: p.y, r: 1, fill: 'hsl(' + (200 + a * 28 | 0) + ',70%,66%)' })
  }
})`,
  },
  {
    name: 'anglemotion', title: 'Angular Motion', cat: 'Math', hint: 'A chain of arms driven by sine waves',
    code: `const f = Fruta({ width: 600, height: 600, background: '#0b0d16' })

f.loop((dt, t) => {
  f.background('#0b0d16')
  let x = 300, y = 300, ang = 0
  for (let i = 0; i < 6; i++) {
    ang += Math.sin(t * (0.5 + i * 0.35) + i) * 1.2
    const len = 95 - i * 11, nx = x + Math.cos(ang) * len, ny = y + Math.sin(ang) * len
    f.line({ x1: x, y1: y, x2: nx, y2: ny, stroke: 'hsl(' + (i * 50) + ',75%,62%)', strokeWidth: 7 - i })
    f.circle({ x: nx, y: ny, r: 6 - i * 0.5, fill: '#ffffff' })
    x = nx; y = ny
  }
})`,
  },
  {
    name: 'reflection', title: 'Non-Orthogonal Reflection', cat: 'Physics', hint: 'Click to aim the tilted wall — the rain bounces off it',
    code: `const f = Fruta({ width: 600, height: 600, background: '#0c1018' })
const wall = { x1: 120, y1: 300, x2: 480, y2: 430 }     // a tilted wall, pivoting on (x1, y1)
f.onPress((p) => { wall.x2 = p.x; wall.y2 = p.y })       // click sets the far end → aim the wall
const balls = []
let spawn = 0

// reflect a ball off the wall SEGMENT: mirror its velocity about the surface normal, then lift it clear
function reflect(b) {
  const wx = wall.x2 - wall.x1, wy = wall.y2 - wall.y1, wl2 = wx * wx + wy * wy
  const t = ((b.x - wall.x1) * wx + (b.y - wall.y1) * wy) / wl2
  if (t < 0 || t > 1) return                             // past the ends of the segment
  const cx = wall.x1 + wx * t, cy = wall.y1 + wy * t      // closest point on the wall
  const dx = b.x - cx, dy = b.y - cy, dist = Math.hypot(dx, dy) || 1
  if (dist > 9) return
  const nx = dx / dist, ny = dy / dist, vn = b.vx * nx + b.vy * ny
  if (vn < 0) { b.vx -= 2 * vn * nx; b.vy -= 2 * vn * ny; b.vx *= 0.92; b.vy *= 0.92; b.x = cx + nx * 9; b.y = cy + ny * 9 }
}

f.loop((dt) => {
  const d = Math.min(dt, 0.03)
  spawn += d
  if (spawn > 0.16 && balls.length < 90) { spawn = 0; balls.push({ x: f.rand(120, 480), y: -10, vx: f.rand(-30, 30), vy: 0 }) }
  f.background('#0c1018')
  f.line({ x1: wall.x1, y1: wall.y1, x2: wall.x2, y2: wall.y2, stroke: '#ffd24a', strokeWidth: 6, cap: 'round' })
  for (let i = balls.length - 1; i >= 0; i--) {
    const b = balls[i]
    for (let s = 0; s < 2; s++) { const hd = d / 2; b.vy += 520 * hd; b.x += b.vx * hd; b.y += b.vy * hd; reflect(b) }   // 2 sub-steps → no tunnelling
    if (b.y > 620 || b.x < -30 || b.x > 630) { balls.splice(i, 1); continue }
    f.circle({ x: b.x, y: b.y, r: 6, fill: '#67d4ff' })
  }
  f.circle({ x: wall.x1, y: wall.y1, r: 5, fill: '#ff8f5a' })
  f.text('click to aim the wall', { x: 300, y: 580, fill: 'rgba(255,255,255,0.4)', size: 13, align: 'center' })
})`,
  },
  {
    name: 'softbody', title: 'Soft Body', cat: 'Physics', hint: 'Move the mouse — the jelly chases it',
    code: `const f = Fruta({ width: 600, height: 600, background: '#0b0d16' })
const N = 16, R = 72, c = { x: 300, y: 300, vx: 0, vy: 0 }
const pts = []
for (let i = 0; i < N; i++) pts.push({ a: i / N * 6.283, x: 300, y: 300, vx: 0, vy: 0 })

f.loop((dt) => {
  const d = Math.min(dt, 0.03)
  c.vx += (f.mouse.x - c.x) * 9 * d; c.vy += (f.mouse.y - c.y) * 9 * d
  c.vx *= 0.9; c.vy *= 0.9; c.x += c.vx; c.y += c.vy
  for (const p of pts) {
    const rx = c.x + Math.cos(p.a) * R, ry = c.y + Math.sin(p.a) * R         // rest point rides the centre
    p.vx += (rx - p.x) * 16 * d; p.vy += (ry - p.y) * 16 * d
    p.vx *= 0.85; p.vy *= 0.85; p.x += p.vx; p.y += p.vy
  }
  f.background('#0b0d16')
  f.polygon({ points: pts.map((p) => ({ x: p.x, y: p.y })), fill: '#ffd24a' })
  f.text('move the mouse', { x: 300, y: 28, fill: 'rgba(255,255,255,0.4)', size: 13, align: 'center' })
})`,
  },
  {
    name: 'forces', title: 'Water & Buoyancy', cat: 'Physics', hint: 'Click the water — waves ripple, bodies float',
    code: `const f = Fruta({ width: 600, height: 600, background: '#0a1020' })
const C = 90, CW = 600 / C, baseY = 340
const h = new Float32Array(C), v = new Float32Array(C)               // surface height + velocity per column
const bodies = []
for (let i = 0; i < 7; i++) { const r = f.rand(12, 26); bodies.push({ x: 60 + i * 80, y: f.rand(-120, 40), vy: 0, r, sub: false }) }
f.onPress((p) => { const c = (p.x / CW) | 0; if (c >= 0 && c < C) v[c] -= 70 })

f.loop((dt) => {
  const d = Math.min(dt, 0.02)
  for (let i = 0; i < C; i++) v[i] -= h[i] * 22 * d                  // spring back to rest
  for (let k = 0; k < 2; k++) for (let i = 0; i < C; i++) {          // couple to neighbours → waves travel
    const l = i > 0 ? h[i - 1] : h[i], r = i < C - 1 ? h[i + 1] : h[i]
    v[i] += (l + r - 2 * h[i]) * 36 * d
  }
  for (let i = 0; i < C; i++) { h[i] += v[i] * d * 6; v[i] *= 0.992 }
  for (const b of bodies) {
    b.vy += 540 * d
    const c = Math.max(0, Math.min(C - 1, (b.x / CW) | 0)), surf = baseY + h[c]
    if (b.y + b.r > surf) { if (!b.sub) { v[c] -= b.r * 2; b.sub = true } b.vy -= (820 - b.r * 12) * d; b.vy *= 1 - Math.min(0.9, 3 * d) } else b.sub = false
    b.y += b.vy * d
    if (b.y > 588) { b.y = 588; b.vy *= -0.4 }
  }
  f.background('#0a1020')
  const pts = [{ x: 0, y: 600 }]
  for (let i = 0; i < C; i++) pts.push({ x: i * CW, y: baseY + h[i] })
  pts.push({ x: 600, y: baseY + h[C - 1] }, { x: 600, y: 600 })
  f.polygon({ points: pts, fill: 'rgba(70,135,215,0.55)' })          // the wavy water body
  for (const b of bodies) f.circle({ x: b.x, y: b.y, r: b.r, fill: 'hsl(' + (b.r * 11 | 0) + ',70%,62%)' })
  f.text('click the water', { x: 300, y: 26, fill: 'rgba(255,255,255,0.4)', size: 13, align: 'center' })
})`,
  },
  {
    name: 'smoke', title: 'Smoke Particles', cat: 'Physics', hint: 'Move the mouse — a particle-system chimney',
    code: `const f = Fruta({ width: 600, height: 600, background: '#08090e' })
const smoke = f.emit({ x: 300, y: 540, rate: 90, color: ['#cfd2d8', '#9aa0aa'], endColor: '#15171d', direction: -90, spread: 26, speed: [30, 75], life: 2.8, size: 5, sizeEnd: 50, gravity: -16, drag: 0.4 })
f.onMove((p) => { smoke.x = p.x; smoke.y = p.y })

f.loop(() => {
  f.background('#08090e')
  f.drawParticles()
})`,
  },
  {
    name: 'newton', title: "Newton's Cradle", cat: 'Physics', hint: 'Momentum passes straight through the line',
    code: `const f = Fruta({ width: 600, height: 400, background: '#0e1220' })
const N = 5, gap = 41, topY = 70, len = 230, ox = 300 - (N - 1) * gap / 2
const balls = []
for (let i = 0; i < N; i++) balls.push({ px: ox + i * gap, a: 0, v: 0 })
balls[0].a = -0.7

f.loop((dt) => {
  const sub = 8, h = Math.min(dt, 0.02) / sub                                     // split the frame — substeps advance dt/8, not dt
  for (let s = 0; s < sub; s++) {
    for (const b of balls) { b.v -= Math.sin(b.a) * 9 * h; b.a += b.v * h }        // pendulum gravity
    for (let i = 0; i < N - 1; i++) {                                              // equal-mass collision = swap velocities
      const A = balls[i], B = balls[i + 1]
      if (B.px + Math.sin(B.a) * len - (A.px + Math.sin(A.a) * len) < 40 && A.v > B.v) { const t = A.v; A.v = B.v; B.v = t }
    }
  }
  f.background('#0e1220')
  f.line({ x1: ox - 40, y1: topY, x2: ox + (N - 1) * gap + 40, y2: topY, stroke: '#8a93a8', strokeWidth: 4 })
  for (const b of balls) {
    const bx = b.px + Math.sin(b.a) * len, by = topY + Math.cos(b.a) * len
    f.line({ x1: b.px, y1: topY, x2: bx, y2: by, stroke: 'rgba(200,210,230,0.5)', strokeWidth: 1.5 })
    f.circle({ x: bx, y: by, r: 19, fill: '#cdd6e6' })
  }
})`,
  },
  {
    name: 'collisions', title: 'Elastic Collisions', cat: 'Physics', hint: 'Click for a shockwave — momentum is conserved',
    code: `const f = Fruta({ width: 600, height: 600, background: '#0c1018' })
const balls = []
for (let i = 0; i < 16; i++) { const r = f.rand(12, 24); balls.push({ x: f.rand(40, 560), y: f.rand(40, 560), vx: f.rand(-120, 120), vy: f.rand(-120, 120), r, m: r * r }) }
f.onPress((p) => { for (const b of balls) { const dx = b.x - p.x, dy = b.y - p.y, d = Math.hypot(dx, dy) + 1; if (d < 150) { b.vx += dx / d * 320; b.vy += dy / d * 320 } } })

f.loop((dt) => {
  const d = Math.min(dt, 0.02)
  for (const b of balls) {
    b.x += b.vx * d; b.y += b.vy * d
    if (b.x < b.r) { b.x = b.r; b.vx *= -1 } if (b.x > 600 - b.r) { b.x = 600 - b.r; b.vx *= -1 }
    if (b.y < b.r) { b.y = b.r; b.vy *= -1 } if (b.y > 600 - b.r) { b.y = 600 - b.r; b.vy *= -1 }
  }
  for (let i = 0; i < balls.length; i++) for (let j = i + 1; j < balls.length; j++) {
    const a = balls[i], b = balls[j], dx = b.x - a.x, dy = b.y - a.y, dist = Math.hypot(dx, dy)
    if (dist < a.r + b.r && dist > 0.1) {
      const nx = dx / dist, ny = dy / dist, p = 2 * ((a.vx - b.vx) * nx + (a.vy - b.vy) * ny) / (a.m + b.m)
      a.vx -= p * b.m * nx; a.vy -= p * b.m * ny; b.vx += p * a.m * nx; b.vy += p * a.m * ny
      const ov = (a.r + b.r - dist) / 2; a.x -= nx * ov; a.y -= ny * ov; b.x += nx * ov; b.y += ny * ov
    }
  }
  f.background('#0c1018')
  for (const b of balls) f.circle({ x: b.x, y: b.y, r: b.r, fill: 'hsl(' + ((Math.hypot(b.vx, b.vy) * 1.3 | 0) % 360) + ',72%,62%)' })
})`,
  },
  {
    name: 'rope', title: 'Verlet Rope', cat: 'Physics', hint: 'Drag it — distance constraints + gravity',
    code: `const f = Fruta({ width: 600, height: 600, background: '#0b0d16' })
const N = 26, seg = 15, pts = []
for (let i = 0; i < N; i++) pts.push({ x: 300, y: 50 + i * seg, ox: 300, oy: 50 + i * seg, pin: i === 0 })
let drag = null
f.onPress((p) => { let bd = 30; for (const pt of pts) { const dd = Math.hypot(pt.x - p.x, pt.y - p.y); if (dd < bd) { bd = dd; drag = pt } } })
f.onRelease(() => { drag = null })

f.loop(() => {
  if (drag) { drag.x = f.mouse.x; drag.y = f.mouse.y; drag.ox = drag.x; drag.oy = drag.y }
  for (const p of pts) { if (p.pin || p === drag) continue; const vx = (p.x - p.ox) * 0.99, vy = (p.y - p.oy) * 0.99; p.ox = p.x; p.oy = p.y; p.x += vx; p.y += vy + 0.6 }
  for (let k = 0; k < 14; k++) for (let i = 0; i < N - 1; i++) {
    const a = pts[i], b = pts[i + 1], dx = b.x - a.x, dy = b.y - a.y, dd = Math.hypot(dx, dy) || 1, m = (seg - dd) / dd * 0.5
    if (!a.pin && a !== drag) { a.x -= dx * m; a.y -= dy * m }
    if (!b.pin && b !== drag) { b.x += dx * m; b.y += dy * m }
  }
  f.background('#0b0d16')
  for (let i = 1; i < N; i++) f.line({ x1: pts[i - 1].x, y1: pts[i - 1].y, x2: pts[i].x, y2: pts[i].y, stroke: '#c9b08a', strokeWidth: 4, cap: 'round' })
  f.circle({ x: pts[N - 1].x, y: pts[N - 1].y, r: 9, fill: '#ffd24a' })
  f.text('drag the rope', { x: 300, y: 585, fill: 'rgba(255,255,255,0.4)', size: 13, align: 'center' })
})`,
  },
  {
    name: 'magpend', title: 'Magnetic Pendulum', cat: 'Physics', hint: 'Click to release — 3 magnets, pure chaos',
    code: `const f = Fruta({ width: 600, height: 600 })
f.rect({ x: 0, y: 0, w: 600, h: 600, fill: '#0a0b12' })
const mags = [{ x: 300, y: 235, c: '#ff6f91' }, { x: 245, y: 335, c: '#67d4ff' }, { x: 355, y: 335, c: '#7ee787' }]
let bob = { x: 180, y: 140, vx: 0, vy: 0 }, trail = []
f.onPress((p) => { bob = { x: p.x, y: p.y, vx: 0, vy: 0 }; trail = [] })

f.loop((dt) => {
  const d = Math.min(dt, 0.016)
  for (let s = 0; s < 3; s++) {
    let ax = (300 - bob.x) * 6, ay = (310 - bob.y) * 6                  // spring back to centre
    for (const m of mags) { const dx = m.x - bob.x, dy = m.y - bob.y, r = Math.hypot(dx, dy) + 8, g = 11000 / (r * r * r); ax += dx * g; ay += dy * g }
    bob.vx = (bob.vx + ax * d) * 0.99; bob.vy = (bob.vy + ay * d) * 0.99
    bob.x += bob.vx * d; bob.y += bob.vy * d
  }
  trail.push({ x: bob.x, y: bob.y }); if (trail.length > 700) trail.shift()
  f.rect({ x: 0, y: 0, w: 600, h: 600, fill: 'rgba(10,11,18,0.07)' })
  for (let i = 1; i < trail.length; i++) f.line({ x1: trail[i - 1].x, y1: trail[i - 1].y, x2: trail[i].x, y2: trail[i].y, stroke: 'rgba(180,200,255,0.5)', strokeWidth: 1 })
  for (const m of mags) f.circle({ x: m.x, y: m.y, r: 10, fill: m.c })
  f.circle({ x: bob.x, y: bob.y, r: 7, fill: '#ffffff' })
})`,
  },
  {
    name: 'sand', title: 'Falling Sand', cat: 'Physics', hint: 'Hold the mouse to pour sand (it auto-pours a demo stream first)',
    code: `const f = Fruta({ width: 480, height: 480, background: '#0a0a0e' })
const N = 80, S = 480 / N, grid = new Int16Array(N * N)
let hue = 20

f.loop((dt, t) => {
  // pour where you hold the mouse — and, for the first few seconds, auto-demo a swaying stream
  const pouring = f.mouseDown || t < 3
  const px = f.mouseDown ? f.mouse.x : 240 + Math.sin(t * 2) * 120
  const py = f.mouseDown ? f.mouse.y : 40
  if (pouring) {
    const gx = (px / S) | 0, gy = (py / S) | 0
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const x = gx + dx, y = gy + dy; if (x >= 0 && x < N && y >= 0 && y < N && !grid[y * N + x]) grid[y * N + x] = (hue | 0) % 60 + 1 }
    hue += 1.5
  }
  for (let y = N - 2; y >= 0; y--) for (let x = 0; x < N; x++) {           // gravity, bottom-up
    const i = y * N + x
    if (!grid[i]) continue
    if (!grid[i + N]) { grid[i + N] = grid[i]; grid[i] = 0 }
    else { const dir = Math.random() < 0.5 ? -1 : 1; if (x + dir >= 0 && x + dir < N && !grid[i + N + dir]) { grid[i + N + dir] = grid[i]; grid[i] = 0 } }
  }
  f.background('#0a0a0e')
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const g = grid[y * N + x]; if (g) f.rect({ x: x * S, y: y * S, w: S, h: S, fill: 'hsl(' + (g * 6 + 20) + ',70%,58%)' }) }
  f.text('hold the mouse to pour sand', { x: 240, y: 466, fill: 'rgba(255,255,255,0.45)', size: 13, align: 'center' })
})`,
  },
  {
    name: 'fluid', title: 'Fluid Particles', cat: 'Physics', hint: 'Move the mouse to stir the liquid',
    code: `const f = Fruta({ width: 500, height: 500, background: '#06080f' })
const ps = []
for (let i = 0; i < 170; i++) ps.push({ x: f.rand(30, 470), y: f.rand(30, 220), vx: 0, vy: 0 })

f.loop(() => {
  for (let i = 0; i < ps.length; i++) {
    const a = ps[i]
    for (let j = i + 1; j < ps.length; j++) {
      const b = ps[j], dx = b.x - a.x, dy = b.y - a.y, d2 = dx * dx + dy * dy
      if (d2 < 484 && d2 > 0.5) { const dd = Math.sqrt(d2), fr = (22 - dd) * 0.04, nx = dx / dd, ny = dy / dd; a.vx -= nx * fr; a.vy -= ny * fr; b.vx += nx * fr; b.vy += ny * fr }
    }
  }
  for (const p of ps) {
    const mdx = p.x - f.mouse.x, mdy = p.y - f.mouse.y, md = Math.hypot(mdx, mdy) + 1
    if (md < 90) { p.vx += mdx / md * 4; p.vy += mdy / md * 4 }
    p.vy += 0.35; p.vx *= 0.97; p.vy *= 0.97; p.x += p.vx; p.y += p.vy
    if (p.x < 8) { p.x = 8; p.vx *= -0.3 } if (p.x > 492) { p.x = 492; p.vx *= -0.3 }
    if (p.y < 8) { p.y = 8; p.vy *= -0.3 } if (p.y > 492) { p.y = 492; p.vy *= -0.3 }
  }
  f.background('#06080f')
  for (const p of ps) f.circle({ x: p.x, y: p.y, r: 8, fill: 'rgba(80,160,240,0.8)' })
})`,
  },
  {
    name: 'gears', title: 'Gears', cat: 'Physics', hint: 'Meshing gears — smaller ones spin faster',
    code: `const f = Fruta({ width: 600, height: 600, background: '#0e1018' })
const gears = [
  { x: 220, y: 320, r: 92, teeth: 18, dir: 1, c: '#ffd24a' },
  { x: 220 + 92 + 60 + 10, y: 320, r: 60, teeth: 12, dir: -1, c: '#67d4ff' },
  { x: 220 + 92 + 60 + 10, y: 320 - 60 - 44 - 10, r: 44, teeth: 9, dir: 1, c: '#ff6f91' },
]
function gear(g, ang) {
  f.push({ x: g.x, y: g.y, rotate: ang })
  const tip = g.r + 7, root = g.r - 4, a = 6.283 / g.teeth, pts = [{ x: 0, y: 0 }]   // centre first → fan fills the concave teeth
  for (let i = 0; i < g.teeth; i++) {
    const u = i * a
    pts.push({ x: Math.cos(u) * root, y: Math.sin(u) * root })
    pts.push({ x: Math.cos(u + a * 0.4) * tip, y: Math.sin(u + a * 0.4) * tip })
    pts.push({ x: Math.cos(u + a * 0.6) * tip, y: Math.sin(u + a * 0.6) * tip })
    pts.push({ x: Math.cos(u + a) * root, y: Math.sin(u + a) * root })
  }
  f.polygon({ points: pts, fill: g.c })
  f.circle({ x: 0, y: 0, r: g.r * 0.34, fill: '#0e1018' })
  for (let s = 0; s < 6; s++) { const sa = s / 6 * 6.283; f.line({ x1: Math.cos(sa) * 8, y1: Math.sin(sa) * 8, x2: Math.cos(sa) * g.r * 0.58, y2: Math.sin(sa) * g.r * 0.58, stroke: g.c, strokeWidth: 4 }) }
  f.circle({ x: 0, y: 0, r: 8, fill: g.c })
  f.pop()
}
f.loop((dt, t) => {
  f.background('#0e1018')
  for (const g of gears) gear(g, g.dir * t * 42 * (92 / g.r))   // speed inverse to radius → teeth keep pace
})`,
  },
  {
    name: 'flag', title: 'Wind Flag', cat: 'Physics', hint: 'Cloth blowing in a gusting wind',
    code: `const f = Fruta({ width: 600, height: 420, background: '#0c1018' })
const COLS = 26, ROWS = 16, sp = 14, ox = 95, oy = 70, pts = [], links = []
for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) { const px = ox + x * sp, py = oy + y * sp; pts.push({ x: px, y: py, ox: px, oy: py, gx: x, pin: x === 0 }) }
for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) { const i = y * COLS + x; if (x < COLS - 1) links.push([i, i + 1]); if (y < ROWS - 1) links.push([i, i + COLS]) }

f.loop((dt, t) => {
  const gust = 0.5 + 0.35 * Math.sin(t * 1.1) + 0.18 * Math.sin(t * 2.9 + 1)   // wind strength rises and falls in gusts
  for (const p of pts) {
    if (p.pin) continue
    const vx = (p.x - p.ox) * 0.97, vy = (p.y - p.oy) * 0.97
    p.ox = p.x; p.oy = p.y
    const edge = p.gx / COLS                                              // 0 at the pole → 1 at the free end
    const ripple = Math.sin(p.gx * 0.5 - t * (4 + gust * 6)) * edge * (0.6 + gust * 2.2)   // flutter — faster + bigger in stronger wind
    p.x += vx + gust * (0.3 + edge * 1.6)                                 // the wind billows the flag downwind, free end most
    p.y += vy + ripple + 0.05                                            // flutter + a little gravity
  }
  for (let k = 0; k < 6; k++) for (const [a, b] of links) { const pa = pts[a], pb = pts[b], dx = pb.x - pa.x, dy = pb.y - pa.y, dd = Math.hypot(dx, dy) || 1, m = (sp - dd) / dd * 0.5; if (!pa.pin) { pa.x -= dx * m; pa.y -= dy * m } if (!pb.pin) { pb.x += dx * m; pb.y += dy * m } }
  f.background('#0c1018')
  for (let y = 0; y < ROWS - 1; y++) for (let x = 0; x < COLS - 1; x++) {
    const a = pts[y * COLS + x], b = pts[y * COLS + x + 1], c = pts[(y + 1) * COLS + x + 1], e = pts[(y + 1) * COLS + x]
    f.polygon({ points: [a, b, c, e], fill: (x % 6 < 3) ? '#d8425a' : '#eef0f4' })
  }
  f.line({ x1: ox, y1: oy - 16, x2: ox, y2: oy + ROWS * sp + 16, stroke: '#8a93a8', strokeWidth: 5 })
  f.circle({ x: ox, y: oy - 16, r: 5, fill: '#ffd24a' })
})`,
  },
  {
    name: 'neonvortex', title: 'Neon Vortex', cat: 'Games', hint: 'WASD move · mouse aim & shoot — a WebGL twin-stick',
    code: `const gl = Fruta.gl({ width: 640, height: 640, background: '#05060d' })
const BLOOM = 'uniform float amount;void main(){vec3 c=texture2D(uScene,vUV).rgb;vec3 b=vec3(0.0);float w=0.0;for(int i=-3;i<=3;i++)for(int j=-3;j<=3;j++){float k=exp(-float(i*i+j*j)*0.16);vec3 s=texture2D(uScene,vUV+vec2(float(i),float(j))*2.5/uResolution).rgb;b+=max(s-0.3,0.0)*k;w+=k;}gl_FragColor=vec4(c+b/w*amount*1.5,1.0);}'
gl.effect(BLOOM, { amount: 1.6 })                                  // neon glow over the whole scene (WebGL post-FX)
let curFx = BLOOM
const setFx = (n) => { if (n !== curFx) { curFx = n; gl.effect(n, { amount: 1.6 }) } }

const W = 640, GRID = 24, GS = W / GRID
let player, bullets, enemies, shocks, score, hp, spawnT, fireT, shake, hitFlash, state
function reset() { player = { x: 320, y: 320 }; bullets = []; enemies = []; shocks = []; score = 0; hp = 100; spawnT = 0; fireT = 0; shake = 0; hitFlash = 0; state = 'play' }
reset()
gl.onPress(() => { if (state === 'over') reset() })

function boom(x, y, color, n) { gl.burst({ x, y, count: n, color, speed: [80, 360], life: 0.7, size: 3 }); shocks.push({ x, y, age: 0 }); if (shocks.length > 12) shocks.shift(); shake = Math.min(16, shake + 7) }
function warp(x, y) {                                // grid nodes ripple outward from every explosion
  let dx = 0, dy = 0
  for (const s of shocks) { const ax = x - s.x, ay = y - s.y, r = Math.hypot(ax, ay) + 1, wv = Math.sin(r * 0.045 - s.age * 9) * Math.exp(-r * 0.006) * Math.exp(-s.age * 2.2) * 24; dx += ax / r * wv; dy += ay / r * wv }
  return { x: x + dx, y: y + dy }
}

gl.loop((dt, t) => {
  const d = Math.min(dt, 0.033)
  if (state === 'play') {
    let mx = 0, my = 0
    if (gl.keyDown('a') || gl.keyDown('ArrowLeft')) mx -= 1
    if (gl.keyDown('d') || gl.keyDown('ArrowRight')) mx += 1
    if (gl.keyDown('w') || gl.keyDown('ArrowUp')) my -= 1
    if (gl.keyDown('s') || gl.keyDown('ArrowDown')) my += 1
    const ml = Math.hypot(mx, my) || 1
    player.x = Math.max(16, Math.min(624, player.x + mx / ml * 270 * d))
    player.y = Math.max(16, Math.min(624, player.y + my / ml * 270 * d))
    fireT -= d
    if (gl.mouseDown && fireT <= 0) { fireT = 0.08; const a = Math.atan2(gl.mouse.y - player.y, gl.mouse.x - player.x); bullets.push({ x: player.x, y: player.y, vx: Math.cos(a) * 660, vy: Math.sin(a) * 660, life: 1.1 }) }
    spawnT -= d
    if (spawnT <= 0) {
      spawnT = Math.max(0.2, 0.85 - t * 0.012)
      const edge = Math.random() * 4 | 0
      const ex = edge === 0 ? 4 : edge === 1 ? 636 : Math.random() * 640
      const ey = edge === 2 ? 4 : edge === 3 ? 636 : Math.random() * 640
      const kind = Math.random() < 0.4 ? 1 : 0
      enemies.push({ x: ex, y: ey, vx: 0, vy: 0, r: kind ? 13 : 11, kind, hp: kind ? 2 : 1 })
    }
  }
  for (let i = bullets.length - 1; i >= 0; i--) { const b = bullets[i]; b.x += b.vx * d; b.y += b.vy * d; b.life -= d; if (b.life <= 0 || b.x < 0 || b.x > 640 || b.y < 0 || b.y > 640) bullets.splice(i, 1) }
  for (const e of enemies) {
    const a = Math.atan2(player.y - e.y, player.x - e.x), spd = e.kind ? 72 : 112
    e.vx += (Math.cos(a) * spd - e.vx) * 2 * d; e.vy += (Math.sin(a) * spd - e.vy) * 2 * d
    if (e.kind) { e.vx += Math.cos(t * 3 + e.x) * 26 * d; e.vy += Math.sin(t * 3) * 26 * d }
    e.x += e.vx * d; e.y += e.vy * d
  }
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i]
    for (let j = bullets.length - 1; j >= 0; j--) { const b = bullets[j]; if ((b.x - e.x) * (b.x - e.x) + (b.y - e.y) * (b.y - e.y) < (e.r + 4) * (e.r + 4)) { bullets.splice(j, 1); e.hp -= 1; if (e.hp <= 0) { boom(e.x, e.y, e.kind ? ['#ff6f91', '#ffd24a'] : ['#67d4ff', '#7ee787'], 26); enemies.splice(i, 1); score += e.kind ? 25 : 10 } break } }
  }
  if (state === 'play') for (let i = enemies.length - 1; i >= 0; i--) { const e = enemies[i]; if ((player.x - e.x) * (player.x - e.x) + (player.y - e.y) * (player.y - e.y) < (e.r + 12) * (e.r + 12)) { enemies.splice(i, 1); hp -= 22; hitFlash = 0.35; shake = 18; boom(player.x, player.y, ['#ff3b5c', '#ffffff'], 28); if (hp <= 0) { state = 'over'; boom(player.x, player.y, ['#ff3b5c', '#ffd24a', '#ffffff'], 90) } } }
  for (let i = shocks.length - 1; i >= 0; i--) { shocks[i].age += d; if (shocks[i].age > 1.6) shocks.splice(i, 1) }
  shake *= 0.86; hitFlash = Math.max(0, hitFlash - d)
  setFx(hitFlash > 0 ? 'chromatic' : BLOOM)        // glitch the screen the instant you take a hit

  gl.background('#05060d')
  gl.push({ x: (Math.random() - 0.5) * shake, y: (Math.random() - 0.5) * shake })
  for (let gy = 0; gy <= GRID; gy++) for (let gx = 0; gx < GRID; gx++) { const a = warp(gx * GS, gy * GS), b = warp((gx + 1) * GS, gy * GS); gl.line({ x1: a.x, y1: a.y, x2: b.x, y2: b.y, stroke: '#1b3a7a', strokeWidth: 1, alpha: 0.85 }) }
  for (let gx = 0; gx <= GRID; gx++) for (let gy = 0; gy < GRID; gy++) { const a = warp(gx * GS, gy * GS), b = warp(gx * GS, (gy + 1) * GS); gl.line({ x1: a.x, y1: a.y, x2: b.x, y2: b.y, stroke: '#1b3a7a', strokeWidth: 1, alpha: 0.85 }) }
  for (const b of bullets) gl.circle({ x: b.x, y: b.y, r: 3.5, fill: '#fff3b0' })
  for (const e of enemies) { gl.push({ x: e.x, y: e.y, rotate: t * 120 * (e.kind ? -1 : 1) }); if (e.kind) gl.polygon({ points: [{ x: 0, y: -e.r }, { x: e.r, y: 0 }, { x: 0, y: e.r }, { x: -e.r, y: 0 }], fill: '#ff6f91' }); else gl.rect({ x: -e.r, y: -e.r, w: e.r * 2, h: e.r * 2, fill: '#67d4ff' }); gl.pop() }
  gl.drawParticles()
  if (state === 'play') { const aim = Math.atan2(gl.mouse.y - player.y, gl.mouse.x - player.x); gl.push({ x: player.x, y: player.y, rotate: aim * 180 / Math.PI }); gl.polygon({ points: [{ x: 16, y: 0 }, { x: -11, y: 10 }, { x: -11, y: -10 }], fill: '#86ecff' }); gl.pop() }
  gl.pop()
  gl.rect({ x: 16, y: 16, w: 170, h: 10, fill: '#22304e' })
  gl.rect({ x: 16, y: 16, w: 170 * Math.max(0, hp) / 100, h: 10, fill: '#ff5c7a' })
  gl.text('SCORE ' + score, { x: 624, y: 32, fill: '#cfe0ff', size: 18, align: 'right' })
  if (state === 'over') { gl.text('GAME OVER', { x: 320, y: 300, fill: '#ffffff', size: 46, align: 'center' }); gl.text('click to restart', { x: 320, y: 344, fill: '#9fb3d8', size: 16, align: 'center' }) }
})`,
  },
  {
    name: 'neonbreaker', title: 'Neon Breaker', cat: 'Games', hint: 'Mouse moves the paddle — break every brick',
    code: `const gl = Fruta.gl({ width: 640, height: 640, background: '#070812' })
const BLOOM = 'uniform float amount;void main(){vec3 c=texture2D(uScene,vUV).rgb;vec3 b=vec3(0.0);float w=0.0;for(int i=-3;i<=3;i++)for(int j=-3;j<=3;j++){float k=exp(-float(i*i+j*j)*0.16);vec3 s=texture2D(uScene,vUV+vec2(float(i),float(j))*2.5/uResolution).rgb;b+=max(s-0.3,0.0)*k;w+=k;}gl_FragColor=vec4(c+b/w*amount*1.5,1.0);}'
gl.effect(BLOOM, { amount: 1.6 })
const COLS = 9, ROWS = 6, BW = 60, BH = 22, BX = (640 - COLS * BW) / 2, BY = 70
const HUE = ['#ff5c7a', '#ffb14a', '#ffe14a', '#7ee787', '#67d4ff', '#b48cff']
let bricks, balls, powers, paddle, pw, wideT, lives, score, combo, shake, state, wave
function newBricks() { bricks = []; for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) bricks.push({ x: BX + c * BW, y: BY + r * 29, hp: r < 2 ? 2 : 1, c: HUE[r] }) }
function launch() { balls = [{ x: 320, y: 560, vx: (Math.random() < 0.5 ? -1 : 1) * 200, vy: -320 }] }
function reset() { newBricks(); launch(); powers = []; paddle = 320; pw = 110; wideT = 0; lives = 3; score = 0; combo = 0; shake = 0; state = 'play'; wave = 1 }
reset()
gl.onMove((p) => { paddle = p.x })
gl.onPress(() => { if (state !== 'play') reset() })

gl.loop((dt) => {
  const d = Math.min(dt, 0.03)
  pw = wideT > 0 ? 170 : 110
  if (state === 'play') {
    paddle = Math.max(pw / 2, Math.min(640 - pw / 2, paddle))
    wideT = Math.max(0, wideT - d)
    for (let bi = balls.length - 1; bi >= 0; bi--) {
      const ball = balls[bi], r = 8
      ball.x += ball.vx * d; ball.y += ball.vy * d
      if (ball.x < r) { ball.x = r; ball.vx = Math.abs(ball.vx) }
      if (ball.x > 640 - r) { ball.x = 640 - r; ball.vx = -Math.abs(ball.vx) }
      if (ball.y < r) { ball.y = r; ball.vy = Math.abs(ball.vy) }
      if (ball.vy > 0 && ball.y + r > 600 && ball.y < 616 && ball.x > paddle - pw / 2 - r && ball.x < paddle + pw / 2 + r) {
        const off = (ball.x - paddle) / (pw / 2); ball.vx = off * 300; ball.vy = -Math.abs(ball.vy); combo = 0
        const sp = Math.hypot(ball.vx, ball.vy) || 1; ball.vx = ball.vx / sp * 380; ball.vy = ball.vy / sp * 380
      }
      for (let i = 0; i < bricks.length; i++) {
        const bk = bricks[i]
        if (ball.x + r > bk.x && ball.x - r < bk.x + BW && ball.y + r > bk.y && ball.y - r < bk.y + BH) {
          const ox = Math.min(ball.x + r - bk.x, bk.x + BW - (ball.x - r)), oy = Math.min(ball.y + r - bk.y, bk.y + BH - (ball.y - r))
          if (ox < oy) ball.vx *= -1; else ball.vy *= -1
          bk.hp -= 1; combo += 1; score += 10 * combo
          gl.burst({ x: bk.x + BW / 2, y: bk.y + BH / 2, count: 14, color: [bk.c, '#ffffff'], speed: [60, 240], life: 0.5, size: 2.5 })
          shake = Math.min(12, shake + 3)
          if (bk.hp <= 0) { if (Math.random() < 0.12) powers.push({ x: bk.x + BW / 2, y: bk.y + BH / 2, type: Math.random() < 0.5 ? 'M' : 'W' }); bricks.splice(i, 1) }
          break
        }
      }
      if (ball.y > 660) balls.splice(bi, 1)
    }
    if (balls.length === 0) { lives -= 1; if (lives <= 0) state = 'over'; else launch() }
    if (bricks.length === 0) { wave += 1; newBricks(); launch() }
    for (let i = powers.length - 1; i >= 0; i--) {
      const p = powers[i]; p.y += 170 * d
      if (p.y > 600 && p.y < 618 && p.x > paddle - pw / 2 && p.x < paddle + pw / 2) {
        if (p.type === 'M') { const base = balls[0] || { x: paddle, y: 580 }; for (let k = 0; k < 2; k++) balls.push({ x: base.x, y: base.y, vx: (k ? 1 : -1) * 220, vy: -340 }) } else wideT = 8
        powers.splice(i, 1)
      } else if (p.y > 660) powers.splice(i, 1)
    }
  }
  shake *= 0.85
  gl.background('#070812')
  gl.push({ x: (Math.random() - 0.5) * shake, y: (Math.random() - 0.5) * shake })
  for (const bk of bricks) gl.rect({ x: bk.x + 2, y: bk.y + 2, w: BW - 4, h: BH - 4, fill: bk.c, alpha: bk.hp > 1 ? 1 : 0.72 })
  for (const p of powers) { gl.rect({ x: p.x - 11, y: p.y - 9, w: 22, h: 18, fill: p.type === 'M' ? '#ffd24a' : '#7ee787' }); gl.text(p.type, { x: p.x, y: p.y + 5, fill: '#0a0a12', size: 13, align: 'center' }) }
  gl.drawParticles()
  for (const ball of balls) gl.circle({ x: ball.x, y: ball.y, r: 8, fill: '#ffffff' })
  gl.rect({ x: paddle - pw / 2, y: 600, w: pw, h: 14, fill: '#67d4ff' })
  gl.pop()
  gl.text('SCORE ' + score, { x: 16, y: 30, fill: '#cfe0ff', size: 18, align: 'left' })
  gl.text('LIVES ' + lives + '   WAVE ' + wave, { x: 624, y: 30, fill: '#cfe0ff', size: 18, align: 'right' })
  if (combo > 1) gl.text('x' + combo, { x: 320, y: 44, fill: '#ffd24a', size: 22, align: 'center' })
  if (state === 'over') { gl.text('GAME OVER', { x: 320, y: 300, fill: '#ffffff', size: 46, align: 'center' }); gl.text('click to restart', { x: 320, y: 344, fill: '#9fb3d8', size: 16, align: 'center' }) }
})`,
  },
  {
    name: 'bullethell', title: 'Neon Bullet Hell', cat: 'Games', hint: 'Move with the mouse — thread the patterns',
    code: `const gl = Fruta.gl({ width: 640, height: 640, background: '#080611' })
const BLOOM = 'uniform float amount;void main(){vec3 c=texture2D(uScene,vUV).rgb;vec3 b=vec3(0.0);float w=0.0;for(int i=-3;i<=3;i++)for(int j=-3;j<=3;j++){float k=exp(-float(i*i+j*j)*0.16);vec3 s=texture2D(uScene,vUV+vec2(float(i),float(j))*2.5/uResolution).rgb;b+=max(s-0.3,0.0)*k;w+=k;}gl_FragColor=vec4(c+b/w*amount*1.5,1.0);}'
gl.effect(BLOOM, { amount: 1.6 })
let curFx = BLOOM; const setFx = (n) => { if (n !== curFx) { curFx = n; gl.effect(n, { amount: 1.6 }) } }
const BX = 320, BY = 130
let player, bullets, pbullets, boss, lives, score, shake, hitFlash, pattern, patternT, emitT, spiral, fireT, state
function reset() { player = { x: 320, y: 520 }; bullets = []; pbullets = []; boss = { hp: 400, max: 400 }; lives = 3; score = 0; shake = 0; hitFlash = 0; pattern = 0; patternT = 2.5; emitT = 0; spiral = 0; fireT = 0; state = 'play' }
reset()
gl.onMove((p) => { if (state === 'play') { player.x = Math.max(12, Math.min(628, p.x)); player.y = Math.max(12, Math.min(628, p.y)) } })
gl.onPress(() => { if (state !== 'play') reset() })
function spawn(a, sp, c) { bullets.push({ x: BX, y: BY, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, c }) }

gl.loop((dt, t) => {
  const d = Math.min(dt, 0.03)
  if (state === 'play') {
    const ph = 1 - boss.hp / boss.max
    patternT -= d
    if (patternT <= 0) { pattern = (pattern + 1) % 3; patternT = 3 }
    emitT -= d
    if (emitT <= 0) {
      if (pattern === 0) { emitT = 0.07 - ph * 0.035; spiral += 0.35; const arms = 3 + (ph * 3 | 0); for (let k = 0; k < arms; k++) spawn(spiral + k * 6.283 / arms, 120 + ph * 70, '#ff6f91') }
      else if (pattern === 1) { emitT = 0.55 - ph * 0.18; const n = 16 + (ph * 18 | 0); for (let k = 0; k < n; k++) spawn(k / n * 6.283 + t, 105 + ph * 75, '#ffb14a') }
      else { emitT = 0.42 - ph * 0.16; const base = Math.atan2(player.y - BY, player.x - BX); for (let k = -2; k <= 2; k++) spawn(base + k * 0.17, 150 + ph * 80, '#b48cff') }
    }
    fireT -= d
    if (fireT <= 0) { fireT = 0.08; pbullets.push({ x: player.x - 6, y: player.y }, { x: player.x + 6, y: player.y }) }
    for (let i = bullets.length - 1; i >= 0; i--) { const b = bullets[i]; b.x += b.vx * d; b.y += b.vy * d; if (b.x < -20 || b.x > 660 || b.y < -20 || b.y > 660) bullets.splice(i, 1) }
    if (bullets.length > 520) bullets.splice(0, bullets.length - 520)
    for (let i = pbullets.length - 1; i >= 0; i--) {
      const p = pbullets[i]; p.y -= 720 * d
      if (p.y < -10) { pbullets.splice(i, 1); continue }
      if ((p.x - BX) * (p.x - BX) + (p.y - BY) * (p.y - BY) < 38 * 38) {
        pbullets.splice(i, 1); boss.hp -= 1; score += 5
        gl.burst({ x: p.x, y: p.y, count: 4, color: ['#ffffff', '#67d4ff'], speed: [40, 120], life: 0.3, size: 2 })
        if (boss.hp <= 0) { state = 'win'; shake = 24; gl.burst({ x: BX, y: BY, count: 120, color: ['#ff6f91', '#ffd24a', '#ffffff'], speed: [60, 420], life: 1.1, size: 4 }) }
      }
    }
    for (const b of bullets) {
      const dx = b.x - player.x, dy = b.y - player.y, q = dx * dx + dy * dy
      if (q < 81) { lives -= 1; hitFlash = 0.4; shake = 20; bullets.length = 0; gl.burst({ x: player.x, y: player.y, count: 40, color: ['#ff3b5c', '#ffffff'], speed: [60, 320], life: 0.7, size: 3 }); if (lives <= 0) state = 'over'; break }
      else if (q < 600 && Math.random() < 0.04) score += 1     // grazing
    }
  }
  shake *= 0.85; hitFlash = Math.max(0, hitFlash - dt)
  setFx(hitFlash > 0 ? 'chromatic' : BLOOM)

  gl.background('#080611')
  gl.push({ x: (Math.random() - 0.5) * shake, y: (Math.random() - 0.5) * shake })
  gl.push({ x: BX, y: BY, rotate: t * 30, scale: 1 + Math.sin(t * 4) * 0.06 })
  gl.polygon({ points: [{ x: 0, y: -34 }, { x: 30, y: -10 }, { x: 20, y: 28 }, { x: -20, y: 28 }, { x: -30, y: -10 }], fill: '#ff4d6d' })
  gl.pop()
  gl.circle({ x: BX, y: BY, r: 12, fill: '#ffe14a' })
  for (const b of bullets) gl.circle({ x: b.x, y: b.y, r: 6, fill: b.c })
  for (const p of pbullets) gl.circle({ x: p.x, y: p.y, r: 3, fill: '#9ff0ff' })
  gl.drawParticles()
  if (state === 'play') {
    gl.push({ x: player.x, y: player.y })
    gl.polygon({ points: [{ x: 0, y: -12 }, { x: 9, y: 10 }, { x: -9, y: 10 }], fill: '#86ecff' })
    gl.pop()
    gl.circle({ x: player.x, y: player.y, r: 3, fill: '#ffffff' })    // the tiny hit-box
  }
  gl.pop()
  gl.rect({ x: 120, y: 24, w: 400, h: 8, fill: '#33203a' })
  gl.rect({ x: 120, y: 24, w: 400 * Math.max(0, boss.hp) / boss.max, h: 8, fill: '#ff4d6d' })
  gl.text('LIVES ' + lives, { x: 16, y: 30, fill: '#cfe0ff', size: 16, align: 'left' })
  gl.text('SCORE ' + score, { x: 624, y: 30, fill: '#cfe0ff', size: 16, align: 'right' })
  if (state === 'over') { gl.text('DEFEATED', { x: 320, y: 320, fill: '#ff6f91', size: 46, align: 'center' }); gl.text('click to retry', { x: 320, y: 364, fill: '#9fb3d8', size: 16, align: 'center' }) }
  if (state === 'win') { gl.text('VICTORY', { x: 320, y: 320, fill: '#ffd24a', size: 50, align: 'center' }); gl.text('click to replay', { x: 320, y: 364, fill: '#9fb3d8', size: 16, align: 'center' }) }
})`,
  },
  {
    name: 'asteroids', title: 'Neon Asteroids', cat: 'Games', hint: 'A/D turn · W thrust · Space fire — inertia + wrap',
    code: `const gl = Fruta.gl({ width: 640, height: 640, background: '#05060e' })
const BLOOM = 'uniform float amount;void main(){vec3 c=texture2D(uScene,vUV).rgb;vec3 b=vec3(0.0);float w=0.0;for(int i=-3;i<=3;i++)for(int j=-3;j<=3;j++){float k=exp(-float(i*i+j*j)*0.16);vec3 s=texture2D(uScene,vUV+vec2(float(i),float(j))*2.5/uResolution).rgb;b+=max(s-0.3,0.0)*k;w+=k;}gl_FragColor=vec4(c+b/w*amount*1.5,1.0);}'
gl.effect(BLOOM, { amount: 1.6 })
const W = 640
let ship, rocks, bullets, lives, score, wave, shake, fireT, invuln, state
function mkRock(x, y, size) {
  const r = size * 18, verts = []
  for (let i = 0; i < 10; i++) verts.push({ a: i / 10 * 6.283, d: r * (0.7 + Math.random() * 0.5) })
  const s = 40 + (3 - size) * 30
  return { x, y, vx: (Math.random() - 0.5) * s, vy: (Math.random() - 0.5) * s, r, size, ang: Math.random() * 6.283, spin: (Math.random() - 0.5) * 1.6, verts }
}
function newWave() { rocks = []; for (let i = 0; i < 3 + wave; i++) rocks.push(mkRock(Math.random() < 0.5 ? 0 : 640, Math.random() * 640, 3)) }
function reset() { ship = { x: 320, y: 320, vx: 0, vy: 0, ang: -Math.PI / 2 }; bullets = []; lives = 3; score = 0; wave = 1; shake = 0; fireT = 0; invuln = 2; state = 'play'; newWave() }
reset()
gl.onPress(() => { if (state !== 'play') reset() })
const wrap = (v) => (v % W + W) % W

gl.loop((dt, t) => {
  const d = Math.min(dt, 0.03)
  if (state === 'play') {
    if (gl.keyDown('a') || gl.keyDown('ArrowLeft')) ship.ang -= 3.4 * d
    if (gl.keyDown('d') || gl.keyDown('ArrowRight')) ship.ang += 3.4 * d
    if (gl.keyDown('w') || gl.keyDown('ArrowUp')) {
      ship.vx += Math.cos(ship.ang) * 320 * d; ship.vy += Math.sin(ship.ang) * 320 * d
      if (Math.random() < 0.6) gl.burst({ x: ship.x - Math.cos(ship.ang) * 12, y: ship.y - Math.sin(ship.ang) * 12, count: 2, color: ['#ffb14a', '#ff6f91'], speed: [30, 90], life: 0.35, size: 2, direction: (ship.ang + Math.PI) * 180 / Math.PI, spread: 40 })
    }
    ship.vx *= 0.992; ship.vy *= 0.992
    ship.x = wrap(ship.x + ship.vx * d); ship.y = wrap(ship.y + ship.vy * d)
    fireT -= d; invuln = Math.max(0, invuln - d)
    if ((gl.keyDown(' ') || gl.mouseDown) && fireT <= 0) { fireT = 0.18; bullets.push({ x: ship.x + Math.cos(ship.ang) * 14, y: ship.y + Math.sin(ship.ang) * 14, vx: ship.vx + Math.cos(ship.ang) * 480, vy: ship.vy + Math.sin(ship.ang) * 480, life: 1 }) }
  }
  for (let i = bullets.length - 1; i >= 0; i--) { const b = bullets[i]; b.x = wrap(b.x + b.vx * d); b.y = wrap(b.y + b.vy * d); b.life -= d; if (b.life <= 0) bullets.splice(i, 1) }
  for (const r of rocks) { r.x = wrap(r.x + r.vx * d); r.y = wrap(r.y + r.vy * d); r.ang += r.spin * d }
  for (let i = rocks.length - 1; i >= 0; i--) {
    const r = rocks[i]
    for (let j = bullets.length - 1; j >= 0; j--) {
      const b = bullets[j]
      if ((b.x - r.x) * (b.x - r.x) + (b.y - r.y) * (b.y - r.y) < r.r * r.r) {
        bullets.splice(j, 1); rocks.splice(i, 1); score += (4 - r.size) * 20; shake = Math.min(12, shake + 4)
        gl.burst({ x: r.x, y: r.y, count: 18, color: ['#cfe0ff', '#67d4ff', '#ffffff'], speed: [50, 240], life: 0.6, size: 2.5 })
        if (r.size > 1) for (let k = 0; k < 2; k++) rocks.push(mkRock(r.x, r.y, r.size - 1))
        break
      }
    }
  }
  if (state === 'play' && invuln <= 0) for (const r of rocks) {
    if ((ship.x - r.x) * (ship.x - r.x) + (ship.y - r.y) * (ship.y - r.y) < (r.r + 9) * (r.r + 9)) {
      lives -= 1; invuln = 2.2; shake = 18; gl.burst({ x: ship.x, y: ship.y, count: 36, color: ['#ff3b5c', '#ffd24a', '#ffffff'], speed: [60, 300], life: 0.8, size: 3 })
      ship.x = 320; ship.y = 320; ship.vx = 0; ship.vy = 0
      if (lives <= 0) state = 'over'
      break
    }
  }
  if (state === 'play' && rocks.length === 0) { wave += 1; newWave() }
  shake *= 0.85

  gl.background('#05060e')
  gl.push({ x: (Math.random() - 0.5) * shake, y: (Math.random() - 0.5) * shake })
  for (const r of rocks) {
    gl.push({ x: r.x, y: r.y })
    for (let i = 0; i < r.verts.length; i++) {
      const a = r.verts[i], b = r.verts[(i + 1) % r.verts.length]
      gl.line({ x1: Math.cos(a.a + r.ang) * a.d, y1: Math.sin(a.a + r.ang) * a.d, x2: Math.cos(b.a + r.ang) * b.d, y2: Math.sin(b.a + r.ang) * b.d, stroke: '#9fc0ff', strokeWidth: 1.5 })
    }
    gl.pop()
  }
  for (const b of bullets) gl.circle({ x: b.x, y: b.y, r: 2.5, fill: '#fff3b0' })
  gl.drawParticles()
  if (state === 'play' && (invuln <= 0 || Math.sin(t * 30) > 0)) {
    gl.push({ x: ship.x, y: ship.y, rotate: ship.ang * 180 / Math.PI })
    gl.polygon({ points: [{ x: 15, y: 0 }, { x: -10, y: 9 }, { x: -10, y: -9 }], fill: '#86ecff' })
    gl.pop()
  }
  gl.pop()
  gl.text('SCORE ' + score, { x: 16, y: 30, fill: '#cfe0ff', size: 18, align: 'left' })
  gl.text('LIVES ' + lives + '   WAVE ' + wave, { x: 624, y: 30, fill: '#cfe0ff', size: 18, align: 'right' })
  if (state === 'over') { gl.text('GAME OVER', { x: 320, y: 320, fill: '#ffffff', size: 46, align: 'center' }); gl.text('click to restart', { x: 320, y: 364, fill: '#9fb3d8', size: 16, align: 'center' }) }
})`,
  },
  {
    name: 'survivor', title: 'Neon Survivor', cat: 'Games', hint: 'WASD to kite — auto-attack the horde, level up',
    code: `const gl = Fruta.gl({ width: 640, height: 640, background: '#06070f' })
const BLOOM = 'uniform float amount;void main(){vec3 c=texture2D(uScene,vUV).rgb;vec3 b=vec3(0.0);float w=0.0;for(int i=-3;i<=3;i++)for(int j=-3;j<=3;j++){float k=exp(-float(i*i+j*j)*0.16);vec3 s=texture2D(uScene,vUV+vec2(float(i),float(j))*2.5/uResolution).rgb;b+=max(s-0.3,0.0)*k;w+=k;}gl_FragColor=vec4(c+b/w*amount*1.5,1.0);}'
gl.effect(BLOOM, { amount: 1.6 })
let player, enemies, bolts, gems, orbs, spawnT, fireT, time, shake, state
function reset() { player = { x: 320, y: 320, hp: 100, xp: 0, need: 5, level: 1 }; enemies = []; bolts = []; gems = []; orbs = 1; spawnT = 0; fireT = 0; time = 0; shake = 0; state = 'play' }
reset()
gl.onPress(() => { if (state !== 'play') reset() })

gl.loop((dt, t) => {
  const d = Math.min(dt, 0.03)
  if (state === 'play') {
    time += d
    let mx = 0, my = 0
    if (gl.keyDown('a') || gl.keyDown('ArrowLeft')) mx -= 1
    if (gl.keyDown('d') || gl.keyDown('ArrowRight')) mx += 1
    if (gl.keyDown('w') || gl.keyDown('ArrowUp')) my -= 1
    if (gl.keyDown('s') || gl.keyDown('ArrowDown')) my += 1
    const ml = Math.hypot(mx, my) || 1
    player.x = Math.max(12, Math.min(628, player.x + mx / ml * 205 * d))
    player.y = Math.max(12, Math.min(628, player.y + my / ml * 205 * d))
    spawnT -= d
    if (spawnT <= 0 && enemies.length < 400) { spawnT = Math.max(0.07, 0.6 - time * 0.01); const a = Math.random() * 6.283; enemies.push({ x: 320 + Math.cos(a) * 400, y: 320 + Math.sin(a) * 400, hp: 2 + (time * 0.05 | 0), spd: 48 + Math.random() * 40, r: 9 }) }
    fireT -= d
    if (fireT <= 0 && enemies.length) {
      fireT = Math.max(0.1, 0.42 - player.level * 0.03)
      let best = null, bd = 1e12
      for (const e of enemies) { const q = (e.x - player.x) * (e.x - player.x) + (e.y - player.y) * (e.y - player.y); if (q < bd) { bd = q; best = e } }
      if (best) { const a = Math.atan2(best.y - player.y, best.x - player.x); bolts.push({ x: player.x, y: player.y, vx: Math.cos(a) * 430, vy: Math.sin(a) * 430, life: 1.4 }) }
    }
  }
  for (const e of enemies) { const a = Math.atan2(player.y - e.y, player.x - e.x); e.x += Math.cos(a) * e.spd * d; e.y += Math.sin(a) * e.spd * d }
  for (let i = bolts.length - 1; i >= 0; i--) {
    const b = bolts[i]; b.x += b.vx * d; b.y += b.vy * d; b.life -= d
    if (b.life <= 0) { bolts.splice(i, 1); continue }
    for (let j = enemies.length - 1; j >= 0; j--) { const e = enemies[j]; if ((b.x - e.x) * (b.x - e.x) + (b.y - e.y) * (b.y - e.y) < (e.r + 3) * (e.r + 3)) { e.hp -= 1; bolts.splice(i, 1); if (e.hp <= 0) { gems.push({ x: e.x, y: e.y }); gl.burst({ x: e.x, y: e.y, count: 8, color: ['#ff6f91', '#ffd24a'], speed: [40, 160], life: 0.4, size: 2 }); enemies.splice(j, 1) } break } }
  }
  for (let o = 0; o < orbs; o++) {
    const oa = t * 2.4 + o / orbs * 6.283, ox = player.x + Math.cos(oa) * 48, oy = player.y + Math.sin(oa) * 48
    for (let j = enemies.length - 1; j >= 0; j--) { const e = enemies[j]; if ((ox - e.x) * (ox - e.x) + (oy - e.y) * (oy - e.y) < (e.r + 8) * (e.r + 8)) { e.hp -= 1; if (e.hp <= 0) { gems.push({ x: e.x, y: e.y }); enemies.splice(j, 1) } } }
  }
  if (state === 'play') for (const e of enemies) { if ((e.x - player.x) * (e.x - player.x) + (e.y - player.y) * (e.y - player.y) < (e.r + 10) * (e.r + 10)) { player.hp -= 28 * d; shake = Math.min(7, shake + 0.4); if (player.hp <= 0) { state = 'over'; gl.burst({ x: player.x, y: player.y, count: 60, color: ['#ff3b5c', '#ffffff'], speed: [60, 320], life: 0.9, size: 3 }) } } }
  for (let i = gems.length - 1; i >= 0; i--) {
    const g = gems[i], dx = player.x - g.x, dy = player.y - g.y, q = dx * dx + dy * dy
    if (q < 6400) { g.x += dx * 0.12; g.y += dy * 0.12 }
    if (q < 256) { gems.splice(i, 1); player.xp += 1; if (player.xp >= player.need) { player.xp = 0; player.level += 1; player.need = 5 + player.level * 3; player.hp = Math.min(100, player.hp + 20); if (player.level % 2 === 0) orbs += 1 } }
  }
  shake *= 0.85

  gl.background('#06070f')
  gl.push({ x: (Math.random() - 0.5) * shake, y: (Math.random() - 0.5) * shake })
  for (const g of gems) gl.circle({ x: g.x, y: g.y, r: 3, fill: '#7ee787' })
  for (const e of enemies) gl.rect({ x: e.x - e.r, y: e.y - e.r, w: e.r * 2, h: e.r * 2, fill: '#ff5c7a' })
  for (const b of bolts) gl.circle({ x: b.x, y: b.y, r: 3, fill: '#9ff0ff' })
  gl.drawParticles()
  for (let o = 0; o < orbs; o++) { const oa = t * 2.4 + o / orbs * 6.283; gl.circle({ x: player.x + Math.cos(oa) * 48, y: player.y + Math.sin(oa) * 48, r: 6, fill: '#ffd24a' }) }
  if (state === 'play') gl.circle({ x: player.x, y: player.y, r: 9, fill: '#67d4ff' })
  gl.pop()
  gl.rect({ x: 16, y: 16, w: 200, h: 9, fill: '#33203a' }); gl.rect({ x: 16, y: 16, w: 200 * Math.max(0, player.hp) / 100, h: 9, fill: '#ff5c7a' })
  gl.rect({ x: 16, y: 30, w: 200, h: 6, fill: '#1e2a44' }); gl.rect({ x: 16, y: 30, w: 200 * player.xp / player.need, h: 6, fill: '#7ee787' })
  gl.text('LV ' + player.level, { x: 16, y: 58, fill: '#cfe0ff', size: 15, align: 'left' })
  gl.text(time.toFixed(0) + 's', { x: 624, y: 30, fill: '#cfe0ff', size: 18, align: 'right' })
  if (state === 'over') { gl.text('YOU DIED', { x: 320, y: 320, fill: '#ff6f91', size: 46, align: 'center' }); gl.text('survived ' + time.toFixed(0) + 's — click to retry', { x: 320, y: 364, fill: '#9fb3d8', size: 15, align: 'center' }) }
})`,
  },
  {
    name: 'neonsnake', title: 'Neon Snake', cat: 'Games', hint: 'Arrows / WASD — eat, grow, glow',
    code: `const gl = Fruta.gl({ width: 600, height: 600, background: '#070a12' })
const BLOOM = 'uniform float amount;void main(){vec3 c=texture2D(uScene,vUV).rgb;vec3 b=vec3(0.0);float w=0.0;for(int i=-3;i<=3;i++)for(int j=-3;j<=3;j++){float k=exp(-float(i*i+j*j)*0.16);vec3 s=texture2D(uScene,vUV+vec2(float(i),float(j))*2.5/uResolution).rgb;b+=max(s-0.3,0.0)*k;w+=k;}gl_FragColor=vec4(c+b/w*amount*1.5,1.0);}'
gl.effect(BLOOM, { amount: 1.6 })
const N = 24, S = 600 / N
let snake, dir, ndir, food, acc, score, shake, state
function place() { food = { x: Math.random() * N | 0, y: Math.random() * N | 0 } }
function reset() { snake = [{ x: 12, y: 12 }]; dir = { x: 1, y: 0 }; ndir = { x: 1, y: 0 }; place(); acc = 0; score = 0; shake = 0; state = 'play' }
reset()
gl.onPress(() => { if (state !== 'play') reset() })

gl.loop((dt) => {
  if ((gl.keyPressed('ArrowUp') || gl.keyPressed('w')) && dir.y === 0) ndir = { x: 0, y: -1 }
  if ((gl.keyPressed('ArrowDown') || gl.keyPressed('s')) && dir.y === 0) ndir = { x: 0, y: 1 }
  if ((gl.keyPressed('ArrowLeft') || gl.keyPressed('a')) && dir.x === 0) ndir = { x: -1, y: 0 }
  if ((gl.keyPressed('ArrowRight') || gl.keyPressed('d')) && dir.x === 0) ndir = { x: 1, y: 0 }
  acc += dt
  if (state === 'play' && acc > 0.11) {
    acc = 0; dir = ndir
    const h = { x: (snake[0].x + dir.x + N) % N, y: (snake[0].y + dir.y + N) % N }
    if (snake.some((s) => s.x === h.x && s.y === h.y)) { state = 'over'; shake = 16; gl.burst({ x: h.x * S + S / 2, y: h.y * S + S / 2, count: 30, color: ['#ff3b5c', '#ffffff'], speed: [60, 260], life: 0.7, size: 3 }) }
    else { snake.unshift(h); if (h.x === food.x && h.y === food.y) { score += 1; gl.burst({ x: food.x * S + S / 2, y: food.y * S + S / 2, count: 14, color: ['#ffd24a', '#7ee787'], speed: [40, 180], life: 0.5, size: 2.5 }); shake = 5; place() } else snake.pop() }
  }
  shake *= 0.84
  gl.background('#070a12')
  gl.push({ x: (Math.random() - 0.5) * shake, y: (Math.random() - 0.5) * shake })
  gl.circle({ x: food.x * S + S / 2, y: food.y * S + S / 2, r: S / 2 - 2, fill: '#ff5c7a' })
  for (let i = 0; i < snake.length; i++) { const s = snake[i]; gl.rect({ x: s.x * S + 2, y: s.y * S + 2, w: S - 4, h: S - 4, fill: i === 0 ? '#9ff0ff' : '#67d4ff', alpha: Math.max(0.4, 1 - i * 0.02) }) }
  gl.drawParticles()
  gl.pop()
  gl.text('SCORE ' + score, { x: 300, y: 32, fill: '#cfe0ff', size: 18, align: 'center' })
  if (state === 'over') { gl.text('GAME OVER', { x: 300, y: 290, fill: '#ff6f91', size: 40, align: 'center' }); gl.text('click to restart', { x: 300, y: 330, fill: '#9fb3d8', size: 15, align: 'center' }) }
})`,
  },
  {
    name: 'runner', title: 'Neon Runner', cat: 'Games', hint: 'Space / click to jump (double-jump) — endless',
    code: `const gl = Fruta.gl({ width: 720, height: 480, background: '#0a0612' })
const BLOOM = 'uniform float amount;void main(){vec3 c=texture2D(uScene,vUV).rgb;vec3 b=vec3(0.0);float w=0.0;for(int i=-3;i<=3;i++)for(int j=-3;j<=3;j++){float k=exp(-float(i*i+j*j)*0.16);vec3 s=texture2D(uScene,vUV+vec2(float(i),float(j))*2.5/uResolution).rgb;b+=max(s-0.3,0.0)*k;w+=k;}gl_FragColor=vec4(c+b/w*amount*1.5,1.0);}'
gl.effect(BLOOM, { amount: 1.6 })
const GROUND = 420, PX = 90
let py, vy, jumps, obstacles, spawnT, speed, dist, shake, state
function reset() { py = GROUND; vy = 0; jumps = 0; obstacles = []; spawnT = 1; speed = 280; dist = 0; shake = 0; state = 'play' }
reset()
function jump() { if (state !== 'play') { reset(); return } if (jumps < 2) { vy = -640; jumps += 1 } }
gl.onPress(() => jump())

gl.loop((dt, t) => {
  const d = Math.min(dt, 0.03)
  if (gl.keyPressed(' ') || gl.keyPressed('w') || gl.keyPressed('ArrowUp')) jump()
  if (state === 'play') {
    speed += d * 7; dist += speed * d
    vy += 1900 * d; py += vy * d
    if (py >= GROUND) { py = GROUND; vy = 0; jumps = 0 }
    spawnT -= d
    if (spawnT <= 0) { spawnT = Math.max(0.45, 1.1 - dist * 0.00004) + Math.random() * 0.35; obstacles.push({ x: 740, h: 26 + Math.random() * 46 }) }
    for (let i = obstacles.length - 1; i >= 0; i--) {
      const o = obstacles[i]; o.x -= speed * d
      if (o.x < -40) obstacles.splice(i, 1)
      else if (o.x < PX + 16 && o.x + 28 > PX - 16 && py > GROUND - o.h) { state = 'over'; shake = 18; gl.burst({ x: PX, y: py - 14, count: 44, color: ['#ff3b5c', '#ffd24a', '#ffffff'], speed: [60, 340], life: 0.8, size: 3 }) }
    }
  }
  shake *= 0.85
  gl.background('#0a0612')
  gl.push({ x: (Math.random() - 0.5) * shake, y: (Math.random() - 0.5) * shake })
  for (let i = 0; i < 16; i++) { const x = ((i * 70 - dist * 0.15) % 1120 + 1120) % 1120 - 200; gl.line({ x1: x, y1: 0, x2: x + 60, y2: 480, stroke: '#1a1030', strokeWidth: 1, alpha: 0.5 }) }
  gl.rect({ x: 0, y: GROUND, w: 720, h: 60, fill: '#160d28' })
  gl.line({ x1: 0, y1: GROUND, x2: 720, y2: GROUND, stroke: '#b48cff', strokeWidth: 2 })
  for (const o of obstacles) gl.rect({ x: o.x, y: GROUND - o.h, w: 28, h: o.h, fill: '#ff5c7a' })
  gl.drawParticles()
  if (state === 'play' || Math.sin(t * 22) > 0) gl.polygon({ points: [{ x: PX, y: py - 30 }, { x: PX + 15, y: py }, { x: PX - 15, y: py }], fill: '#67d4ff' })
  gl.pop()
  gl.text('DIST ' + (dist / 10 | 0), { x: 700, y: 32, fill: '#cfe0ff', size: 18, align: 'right' })
  if (state === 'over') { gl.text('CRASHED', { x: 360, y: 210, fill: '#ff6f91', size: 42, align: 'center' }); gl.text('click / space to retry', { x: 360, y: 252, fill: '#9fb3d8', size: 15, align: 'center' }) }
})`,
  },
  {
    name: 'flappy', title: 'Neon Flappy', cat: 'Games', hint: 'Space / click to flap through the gaps',
    code: `const gl = Fruta.gl({ width: 480, height: 640, background: '#0a0816' })
const BLOOM = 'uniform float amount;void main(){vec3 c=texture2D(uScene,vUV).rgb;vec3 b=vec3(0.0);float w=0.0;for(int i=-3;i<=3;i++)for(int j=-3;j<=3;j++){float k=exp(-float(i*i+j*j)*0.16);vec3 s=texture2D(uScene,vUV+vec2(float(i),float(j))*2.5/uResolution).rgb;b+=max(s-0.3,0.0)*k;w+=k;}gl_FragColor=vec4(c+b/w*amount*1.5,1.0);}'
gl.effect(BLOOM, { amount: 1.6 })
const BX = 150
let by, vy, pipes, spawnT, score, shake, state
function reset() { by = 280; vy = 0; pipes = []; spawnT = 0; score = 0; shake = 0; state = 'play' }
reset()
function flap() { if (state !== 'play') { reset(); return } vy = -340; gl.burst({ x: BX - 10, y: by + 6, count: 4, color: ['#67d4ff', '#ffffff'], speed: [20, 80], life: 0.3, size: 2 }) }
gl.onPress(() => flap())

gl.loop((dt, t) => {
  const d = Math.min(dt, 0.03)
  if (gl.keyPressed(' ') || gl.keyPressed('w') || gl.keyPressed('ArrowUp')) flap()
  if (state === 'play') {
    vy += 1100 * d; by += vy * d
    spawnT -= d
    if (spawnT <= 0) { spawnT = 1.5; pipes.push({ x: 500, gapY: 150 + Math.random() * 300, gap: 155, scored: false }) }
    for (let i = pipes.length - 1; i >= 0; i--) {
      const p = pipes[i]; p.x -= 175 * d
      if (!p.scored && p.x + 52 < BX) { p.scored = true; score += 1; shake = 4 }
      if (p.x < -60) pipes.splice(i, 1)
      else if (BX + 13 > p.x && BX - 13 < p.x + 52 && (by - 13 < p.gapY - p.gap / 2 || by + 13 > p.gapY + p.gap / 2)) { state = 'over'; shake = 16; gl.burst({ x: BX, y: by, count: 36, color: ['#ff3b5c', '#ffd24a'], speed: [60, 280], life: 0.7, size: 3 }) }
    }
    if (by > 628 || by < -8) { state = 'over'; shake = 16 }
  }
  shake *= 0.85
  gl.background('#0a0816')
  gl.push({ x: (Math.random() - 0.5) * shake, y: (Math.random() - 0.5) * shake })
  for (const p of pipes) { gl.rect({ x: p.x, y: 0, w: 52, h: p.gapY - p.gap / 2, fill: '#7ee787' }); gl.rect({ x: p.x, y: p.gapY + p.gap / 2, w: 52, h: 640 - (p.gapY + p.gap / 2), fill: '#7ee787' }) }
  gl.drawParticles()
  if (state === 'play' || Math.sin(t * 22) > 0) { gl.push({ x: BX, y: by, rotate: Math.max(-30, Math.min(70, vy * 0.12)) }); gl.polygon({ points: [{ x: 14, y: 0 }, { x: -10, y: 9 }, { x: -10, y: -9 }], fill: '#67d4ff' }); gl.pop() }
  gl.pop()
  gl.text(score + '', { x: 240, y: 70, fill: '#ffffff', size: 40, align: 'center' })
  if (state === 'over') { gl.text('GAME OVER', { x: 240, y: 320, fill: '#ff6f91', size: 36, align: 'center' }); gl.text('click / space', { x: 240, y: 356, fill: '#9fb3d8', size: 15, align: 'center' }) }
})`,
  },
  {
    name: 'tron', title: 'Neon Tron', cat: 'Games', hint: 'Arrows / WASD — outlast the AI light cycle',
    code: `const gl = Fruta.gl({ width: 600, height: 600, background: '#05070f' })
const BLOOM = 'uniform float amount;void main(){vec3 c=texture2D(uScene,vUV).rgb;vec3 b=vec3(0.0);float w=0.0;for(int i=-3;i<=3;i++)for(int j=-3;j<=3;j++){float k=exp(-float(i*i+j*j)*0.16);vec3 s=texture2D(uScene,vUV+vec2(float(i),float(j))*2.5/uResolution).rgb;b+=max(s-0.3,0.0)*k;w+=k;}gl_FragColor=vec4(c+b/w*amount*1.5,1.0);}'
gl.effect(BLOOM, { amount: 1.6 })
const N = 48, S = 600 / N
let grid, p1, p2, acc, msg, shake, state
function cell(x, y) { return x >= 0 && x < N && y >= 0 && y < N ? grid[y * N + x] : 9 }
function reset() { grid = new Int8Array(N * N); p1 = { x: 8, y: 24, dx: 1, dy: 0, nd: null }; p2 = { x: 39, y: 24, dx: -1, dy: 0 }; grid[24 * N + 8] = 1; grid[24 * N + 39] = 2; acc = 0; msg = ''; shake = 0; state = 'play' }
reset()
gl.onPress(() => { if (state !== 'play') reset() })

gl.loop((dt) => {
  if (state === 'play') {
    if ((gl.keyPressed('ArrowUp') || gl.keyPressed('w')) && p1.dy === 0) p1.nd = { dx: 0, dy: -1 }
    if ((gl.keyPressed('ArrowDown') || gl.keyPressed('s')) && p1.dy === 0) p1.nd = { dx: 0, dy: 1 }
    if ((gl.keyPressed('ArrowLeft') || gl.keyPressed('a')) && p1.dx === 0) p1.nd = { dx: -1, dy: 0 }
    if ((gl.keyPressed('ArrowRight') || gl.keyPressed('d')) && p1.dx === 0) p1.nd = { dx: 1, dy: 0 }
    acc += dt
    if (acc > 0.055) {
      acc = 0
      if (p1.nd) { p1.dx = p1.nd.dx; p1.dy = p1.nd.dy; p1.nd = null }
      const opts = [{ dx: p2.dx, dy: p2.dy }, { dx: -p2.dy, dy: p2.dx }, { dx: p2.dy, dy: -p2.dx }]
      let ch = opts[0]
      if (cell(p2.x + opts[0].dx, p2.y + opts[0].dy) !== 0 || Math.random() < 0.04) { const free = opts.slice(1).filter((o) => cell(p2.x + o.dx, p2.y + o.dy) === 0); if (free.length) ch = free[Math.random() * free.length | 0] }
      p2.dx = ch.dx; p2.dy = ch.dy
      const a1 = cell(p1.x + p1.dx, p1.y + p1.dy) !== 0, a2 = cell(p2.x + p2.dx, p2.y + p2.dy) !== 0
      if (a1 && a2) { state = 'over'; msg = 'DRAW' }
      else if (a1) { state = 'over'; msg = 'AI WINS' }
      else if (a2) { state = 'over'; msg = 'YOU WIN' }
      else { p1.x += p1.dx; p1.y += p1.dy; grid[p1.y * N + p1.x] = 1; p2.x += p2.dx; p2.y += p2.dy; grid[p2.y * N + p2.x] = 2 }
      if (state === 'over') { shake = 14; gl.burst({ x: p1.x * S + S / 2, y: p1.y * S + S / 2, count: 24, color: ['#ff3b5c', '#ffffff'], speed: [50, 240], life: 0.6, size: 3 }) }
    }
  }
  shake *= 0.85
  gl.background('#05070f')
  gl.push({ x: (Math.random() - 0.5) * shake, y: (Math.random() - 0.5) * shake })
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const g = grid[y * N + x]; if (g) gl.rect({ x: x * S, y: y * S, w: S - 1, h: S - 1, fill: g === 1 ? '#67d4ff' : '#ff6f91' }) }
  gl.circle({ x: p1.x * S + S / 2, y: p1.y * S + S / 2, r: S * 0.7, fill: '#9ff0ff' })
  gl.circle({ x: p2.x * S + S / 2, y: p2.y * S + S / 2, r: S * 0.7, fill: '#ffb0c4' })
  gl.drawParticles()
  gl.pop()
  if (state === 'over') { gl.text(msg, { x: 300, y: 288, fill: '#ffffff', size: 42, align: 'center' }); gl.text('click to restart', { x: 300, y: 328, fill: '#9fb3d8', size: 15, align: 'center' }) }
})`,
  },
  {
    name: 'defense', title: 'Neon Defense', cat: 'Games', hint: 'Click to build towers — hold the line',
    code: `const gl = Fruta.gl({ width: 640, height: 640, background: '#0a0d14' })
const BLOOM = 'uniform float amount;void main(){vec3 c=texture2D(uScene,vUV).rgb;vec3 b=vec3(0.0);float w=0.0;for(int i=-3;i<=3;i++)for(int j=-3;j<=3;j++){float k=exp(-float(i*i+j*j)*0.16);vec3 s=texture2D(uScene,vUV+vec2(float(i),float(j))*2.5/uResolution).rgb;b+=max(s-0.3,0.0)*k;w+=k;}gl_FragColor=vec4(c+b/w*amount*1.5,1.0);}'
gl.effect(BLOOM, { amount: 1.6 })
const path = [{ x: -20, y: 110 }, { x: 520, y: 110 }, { x: 520, y: 310 }, { x: 120, y: 310 }, { x: 120, y: 510 }, { x: 660, y: 510 }]
let towers, enemies, bolts, money, lives, wave, spawnLeft, spawnT, shake, state
function reset() { towers = []; enemies = []; bolts = []; money = 120; lives = 12; wave = 1; spawnLeft = 6; spawnT = 0; shake = 0; state = 'play' }
reset()
function segDist(px, py, a, b) { const dx = b.x - a.x, dy = b.y - a.y, l2 = dx * dx + dy * dy || 1; let tt = ((px - a.x) * dx + (py - a.y) * dy) / l2; tt = Math.max(0, Math.min(1, tt)); return Math.hypot(px - (a.x + dx * tt), py - (a.y + dy * tt)) }
gl.onPress((p) => {
  if (state !== 'play') { reset(); return }
  if (money < 40) return
  for (let i = 0; i < path.length - 1; i++) if (segDist(p.x, p.y, path[i], path[i + 1]) < 34) return
  for (const tw of towers) if (Math.hypot(tw.x - p.x, tw.y - p.y) < 40) return
  towers.push({ x: p.x, y: p.y, cd: 0 }); money -= 40
})

gl.loop((dt) => {
  const d = Math.min(dt, 0.03)
  if (state === 'play') {
    spawnT -= d
    if (spawnLeft > 0 && spawnT <= 0) { spawnT = 0.8; spawnLeft -= 1; enemies.push({ x: path[0].x, y: path[0].y, seg: 0, hp: 3 + wave, max: 3 + wave, spd: 55 + wave * 3 }) }
    if (spawnLeft === 0 && enemies.length === 0) { wave += 1; spawnLeft = 5 + wave; money += 30 }
    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i], tg = path[e.seg + 1], dx = tg.x - e.x, dy = tg.y - e.y, dl = Math.hypot(dx, dy) || 1
      e.x += dx / dl * e.spd * d; e.y += dy / dl * e.spd * d
      if (dl < 4) { e.seg += 1; if (e.seg >= path.length - 1) { enemies.splice(i, 1); lives -= 1; shake = 8; if (lives <= 0) state = 'over' } }
    }
    for (const tw of towers) {
      tw.cd -= d
      if (tw.cd <= 0) { let best = null, bd = 16900; for (const e of enemies) { const q = (e.x - tw.x) * (e.x - tw.x) + (e.y - tw.y) * (e.y - tw.y); if (q < bd) { bd = q; best = e } } if (best) { tw.cd = 0.4; const a = Math.atan2(best.y - tw.y, best.x - tw.x); bolts.push({ x: tw.x, y: tw.y, vx: Math.cos(a) * 360, vy: Math.sin(a) * 360, life: 0.6 }) } }
    }
    for (let i = bolts.length - 1; i >= 0; i--) {
      const b = bolts[i]; b.x += b.vx * d; b.y += b.vy * d; b.life -= d
      if (b.life <= 0) { bolts.splice(i, 1); continue }
      for (let j = enemies.length - 1; j >= 0; j--) { const e = enemies[j]; if ((b.x - e.x) * (b.x - e.x) + (b.y - e.y) * (b.y - e.y) < 196) { e.hp -= 1; bolts.splice(i, 1); if (e.hp <= 0) { money += 6; gl.burst({ x: e.x, y: e.y, count: 10, color: ['#ff6f91', '#ffd24a'], speed: [40, 180], life: 0.4, size: 2 }); enemies.splice(j, 1) } break } }
    }
  }
  shake *= 0.85
  gl.background('#0a0d14')
  gl.push({ x: (Math.random() - 0.5) * shake, y: (Math.random() - 0.5) * shake })
  for (let i = 0; i < path.length - 1; i++) gl.line({ x1: path[i].x, y1: path[i].y, x2: path[i + 1].x, y2: path[i + 1].y, stroke: '#243150', strokeWidth: 26 })
  for (let i = 0; i < path.length - 1; i++) gl.line({ x1: path[i].x, y1: path[i].y, x2: path[i + 1].x, y2: path[i + 1].y, stroke: '#3a4f7a', strokeWidth: 2 })
  for (const tw of towers) { gl.circle({ x: tw.x, y: tw.y, r: 14, fill: '#67d4ff' }); gl.circle({ x: tw.x, y: tw.y, r: 6, fill: '#cfe9ff' }) }
  for (const e of enemies) { gl.rect({ x: e.x - 9, y: e.y - 9, w: 18, h: 18, fill: '#ff5c7a' }); gl.rect({ x: e.x - 9, y: e.y - 15, w: 18 * Math.max(0, e.hp) / e.max, h: 3, fill: '#7ee787' }) }
  for (const b of bolts) gl.circle({ x: b.x, y: b.y, r: 3, fill: '#9ff0ff' })
  gl.drawParticles()
  gl.pop()
  gl.text('$' + money + '   LIVES ' + lives + '   WAVE ' + wave, { x: 320, y: 30, fill: '#cfe0ff', size: 16, align: 'center' })
  gl.text('click to build a tower ($40)', { x: 320, y: 616, fill: 'rgba(207,224,255,0.5)', size: 13, align: 'center' })
  if (state === 'over') { gl.text('OVERRUN', { x: 320, y: 320, fill: '#ff6f91', size: 44, align: 'center' }); gl.text('click to restart', { x: 320, y: 360, fill: '#9fb3d8', size: 15, align: 'center' }) }
})`,
  },
  {
    name: 'g2048', title: '2048', cat: 'Games', hint: 'Arrows / WASD / swipe — slide and merge to 2048',
    code: `const f = Fruta({ width: 480, height: 560, background: '#faf8ef' })
const STEP = 107, CELL = 95, OX = 32, OY = 112
const COL = { 2: '#eee4da', 4: '#ede0c8', 8: '#f2b179', 16: '#f59563', 32: '#f67c5f', 64: '#f65e3b', 128: '#edcf72', 256: '#edcc61', 512: '#edc850', 1024: '#edc53f', 2048: '#edc22e' }
let grid, score, over
function add() { const e = []; for (let i = 0; i < 16; i++) if (!grid[i]) e.push(i); if (e.length) grid[e[Math.random() * e.length | 0]] = Math.random() < 0.9 ? 2 : 4 }
function reset() { grid = new Array(16).fill(0); score = 0; over = false; add(); add() }
reset()
let sx = null, sy = null
f.onPress((p) => { if (over) { reset(); return } sx = p.x; sy = p.y })
f.onRelease(() => { if (sx === null) return; const dx = f.mouse.x - sx, dy = f.mouse.y - sy; sx = null; if (Math.hypot(dx, dy) < 24) return; if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? 1 : 0); else move(dy > 0 ? 3 : 2) })
function slide(line) { const a = line.filter((v) => v); for (let i = 0; i < a.length - 1; i++) if (a[i] === a[i + 1]) { a[i] *= 2; score += a[i]; a.splice(i + 1, 1) } while (a.length < 4) a.push(0); return a }
function canMove() { for (let i = 0; i < 16; i++) { if (!grid[i]) return true; const x = i % 4, y = i / 4 | 0; if (x < 3 && grid[i] === grid[i + 1]) return true; if (y < 3 && grid[i] === grid[i + 4]) return true } return false }
function move(dir) {
  let moved = false
  for (let k = 0; k < 4; k++) {
    const line = []
    for (let i = 0; i < 4; i++) line.push(dir < 2 ? grid[k * 4 + i] : grid[i * 4 + k])
    if (dir === 1 || dir === 3) line.reverse()
    const res = slide(line)
    if (dir === 1 || dir === 3) res.reverse()
    for (let i = 0; i < 4; i++) { const idx = dir < 2 ? k * 4 + i : i * 4 + k; if (grid[idx] !== res[i]) moved = true; grid[idx] = res[i] }
  }
  if (moved) { add(); if (!canMove()) over = true }
}
let prev = { l: false, r: false, u: false, d: false }
f.loop(() => {
  if (!over) {
    const c = { l: f.keyDown('ArrowLeft') || f.keyDown('a'), r: f.keyDown('ArrowRight') || f.keyDown('d'), u: f.keyDown('ArrowUp') || f.keyDown('w'), d: f.keyDown('ArrowDown') || f.keyDown('s') }
    if (c.l && !prev.l) move(0)
    if (c.r && !prev.r) move(1)
    if (c.u && !prev.u) move(2)
    if (c.d && !prev.d) move(3)
    prev = c
  }
  f.background('#faf8ef')
  f.text('2048', { x: 20, y: 50, fill: '#776e65', size: 40, align: 'left', baseline: 'middle' })
  f.text('SCORE  ' + score, { x: 460, y: 50, fill: '#9c8a7d', size: 18, align: 'right', baseline: 'middle' })
  f.rect({ x: 20, y: 100, w: 440, h: 440, radius: 10, fill: '#bbada0' })
  for (let i = 0; i < 16; i++) {
    const x = OX + (i % 4) * STEP, y = OY + (i / 4 | 0) * STEP, v = grid[i]
    f.rect({ x, y, w: CELL, h: CELL, radius: 6, fill: v ? (COL[v] || '#3c3a32') : 'rgba(238,228,218,0.35)' })
    if (v) f.text('' + v, { x: x + CELL / 2, y: y + CELL / 2, fill: v <= 4 ? '#776e65' : '#f9f6f2', size: v < 100 ? 40 : v < 1000 ? 30 : 24, align: 'center', baseline: 'middle' })
  }
  if (over) { f.rect({ x: 20, y: 100, w: 440, h: 440, radius: 10, fill: 'rgba(238,228,218,0.73)' }); f.text('Game Over', { x: 240, y: 290, fill: '#776e65', size: 38, align: 'center', baseline: 'middle' }); f.text('click to restart', { x: 240, y: 334, fill: '#776e65', size: 16, align: 'center', baseline: 'middle' }) }
})`,
  },
  {
    name: 'tetris', title: 'Tetris', cat: 'Games', hint: 'Arrows move/rotate · Down soft-drop · Space hard-drop',
    code: `const f = Fruta({ width: 300, height: 600, background: '#15171f' })
const COLS = 10, ROWS = 20, CELL = 26, OX = 20, OY = 56
const P = [
  { c: '#5ec3ff', n: 4, cells: [[0, 1], [1, 1], [2, 1], [3, 1]] },
  { c: '#ffd24a', n: 2, cells: [[0, 0], [1, 0], [0, 1], [1, 1]] },
  { c: '#b48cff', n: 3, cells: [[1, 0], [0, 1], [1, 1], [2, 1]] },
  { c: '#7ee787', n: 3, cells: [[1, 0], [2, 0], [0, 1], [1, 1]] },
  { c: '#ff6f91', n: 3, cells: [[0, 0], [1, 0], [1, 1], [2, 1]] },
  { c: '#67d4ff', n: 3, cells: [[0, 0], [0, 1], [1, 1], [2, 1]] },
  { c: '#ffb14a', n: 3, cells: [[2, 0], [0, 1], [1, 1], [2, 1]] },
]
let grid, cur, dropT, score, over
function rot(p, r) { let cs = p.cells.map((c) => [c[0], c[1]]); for (let k = 0; k < r; k++) cs = cs.map((c) => [p.n - 1 - c[1], c[0]]); return cs }
function cellsOf(c) { return rot(P[c.t], c.r).map((o) => [c.x + o[0], c.y + o[1]]) }
function hit(c) { for (const o of cellsOf(c)) { const x = o[0], y = o[1]; if (x < 0 || x >= COLS || y >= ROWS) return true; if (y >= 0 && grid[y * COLS + x]) return true } return false }
function spawn() { cur = { t: Math.random() * 7 | 0, r: 0, x: 3, y: -1 }; if (hit(cur)) over = true }
function reset() { grid = new Int8Array(COLS * ROWS); score = 0; dropT = 0; over = false; spawn() }
reset()
f.onPress(() => { if (over) reset() })
function tryMove(dx, dy) { cur.x += dx; cur.y += dy; if (hit(cur)) { cur.x -= dx; cur.y -= dy; return false } return true }
function tryRot() { const pr = cur.r; cur.r = (cur.r + 1) % 4; if (hit(cur)) { if (!tryMove(-1, 0) && !tryMove(1, 0)) cur.r = pr } }
function lock() {
  for (const o of cellsOf(cur)) if (o[1] >= 0) grid[o[1] * COLS + o[0]] = cur.t + 1
  let cleared = 0
  for (let y = ROWS - 1; y >= 0; y--) { let full = true; for (let x = 0; x < COLS; x++) if (!grid[y * COLS + x]) full = false; if (full) { cleared++; for (let yy = y; yy > 0; yy--) for (let x = 0; x < COLS; x++) grid[yy * COLS + x] = grid[(yy - 1) * COLS + x]; for (let x = 0; x < COLS; x++) grid[x] = 0; y++ } }
  score += [0, 100, 300, 500, 800][cleared]
  spawn()
}
f.loop((dt) => {
  if (!over) {
    if (f.keyPressed('ArrowLeft') || f.keyPressed('a')) tryMove(-1, 0)
    if (f.keyPressed('ArrowRight') || f.keyPressed('d')) tryMove(1, 0)
    if (f.keyPressed('ArrowUp') || f.keyPressed('w')) tryRot()
    if (f.keyPressed(' ')) { while (tryMove(0, 1)) {} lock() }
    dropT += dt
    const speed = (f.keyDown('ArrowDown') || f.keyDown('s')) ? 0.05 : 0.5
    if (dropT > speed) { dropT = 0; if (!tryMove(0, 1)) lock() }
  }
  f.background('#15171f')
  f.text('SCORE ' + score, { x: 20, y: 30, fill: '#cfd6e6', size: 18, align: 'left', baseline: 'middle' })
  f.rect({ x: OX - 2, y: OY - 2, w: COLS * CELL + 4, h: ROWS * CELL + 4, fill: '#0c0e15' })
  for (let i = 0; i < grid.length; i++) if (grid[i]) f.rect({ x: OX + (i % COLS) * CELL, y: OY + (i / COLS | 0) * CELL, w: CELL - 1, h: CELL - 1, radius: 3, fill: P[grid[i] - 1].c })
  if (!over) for (const o of cellsOf(cur)) if (o[1] >= 0) f.rect({ x: OX + o[0] * CELL, y: OY + o[1] * CELL, w: CELL - 1, h: CELL - 1, radius: 3, fill: P[cur.t].c })
  if (over) { f.rect({ x: OX - 2, y: OY - 2, w: COLS * CELL + 4, h: ROWS * CELL + 4, fill: 'rgba(10,12,20,0.7)' }); f.text('GAME OVER', { x: 150, y: 290, fill: '#ff6f91', size: 30, align: 'center', baseline: 'middle' }); f.text('click to restart', { x: 150, y: 326, fill: '#9fb3d8', size: 14, align: 'center', baseline: 'middle' }) }
})`,
  },
  {
    name: 'minesweeper', title: 'Minesweeper', cat: 'Games', hint: 'Click to dig · F / space toggles flag mode',
    code: `const f = Fruta({ width: 480, height: 540, background: '#2b2d3a' })
const N = 12, CELL = 36, OX = 24, OY = 84, MINES = 22
const NC = ['', '#67d4ff', '#7ee787', '#ffd24a', '#b48cff', '#ffb14a', '#ff6f91', '#ff6f91', '#cfd6e6']
let mines, revealed, counts, flags, lost, won, left, flagMode
function neighbors(i, fn) { const x = i % N, y = i / N | 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { if (!dx && !dy) continue; const nx = x + dx, ny = y + dy; if (nx >= 0 && nx < N && ny >= 0 && ny < N) fn(ny * N + nx) } }
function reset() {
  mines = new Uint8Array(N * N); revealed = new Uint8Array(N * N); counts = new Int8Array(N * N); flags = new Uint8Array(N * N)
  lost = false; won = false; flagMode = false; left = N * N - MINES
  let placed = 0; while (placed < MINES) { const i = Math.random() * N * N | 0; if (!mines[i]) { mines[i] = 1; placed++ } }
  for (let i = 0; i < N * N; i++) if (!mines[i]) { let c = 0; neighbors(i, (j) => { if (mines[j]) c++ }); counts[i] = c }
}
reset()
function reveal(i) {
  if (revealed[i] || flags[i]) return
  revealed[i] = 1
  if (mines[i]) { lost = true; for (let k = 0; k < N * N; k++) if (mines[k]) revealed[k] = 1; return }
  left--; if (left <= 0) won = true
  if (counts[i] === 0) neighbors(i, reveal)
}
f.onPress((p) => {
  if (lost || won) { reset(); return }
  if (p.x < OX || p.y < OY) return
  const x = (p.x - OX) / CELL | 0, y = (p.y - OY) / CELL | 0
  if (x < 0 || x >= N || y < 0 || y >= N) return
  const i = y * N + x
  if (flagMode) { if (!revealed[i]) flags[i] ^= 1 } else reveal(i)
})
f.loop(() => {
  if (f.keyPressed('f') || f.keyPressed(' ')) flagMode = !flagMode
  f.background('#2b2d3a')
  f.text('MINESWEEPER', { x: 24, y: 38, fill: '#cfd6e6', size: 22, align: 'left', baseline: 'middle' })
  f.text(flagMode ? 'FLAG' : 'DIG', { x: 456, y: 38, fill: flagMode ? '#ffd24a' : '#7ee787', size: 18, align: 'right', baseline: 'middle' })
  for (let i = 0; i < N * N; i++) {
    const x = OX + (i % N) * CELL, y = OY + (i / N | 0) * CELL
    if (revealed[i]) {
      f.rect({ x, y, w: CELL - 2, h: CELL - 2, radius: 4, fill: mines[i] ? '#ff5c7a' : '#3a3d4e' })
      if (!mines[i] && counts[i] > 0) f.text('' + counts[i], { x: x + CELL / 2 - 1, y: y + CELL / 2 - 1, fill: NC[counts[i]], size: 18, align: 'center', baseline: 'middle' })
    } else {
      f.rect({ x, y, w: CELL - 2, h: CELL - 2, radius: 4, fill: '#4a4e63' })
      if (flags[i]) f.circle({ x: x + CELL / 2 - 1, y: y + CELL / 2 - 1, r: 6, fill: '#ffd24a' })
    }
  }
  if (lost) f.text('BOOM — click to retry', { x: 240, y: 522, fill: '#ff6f91', size: 18, align: 'center', baseline: 'middle' })
  else if (won) f.text('CLEARED! — click to retry', { x: 240, y: 522, fill: '#7ee787', size: 18, align: 'center', baseline: 'middle' })
  else f.text('F / space = toggle flag', { x: 240, y: 522, fill: 'rgba(207,214,230,0.5)', size: 13, align: 'center', baseline: 'middle' })
})`,
  },
  {
    name: 'pong', title: 'Pong', cat: 'Games', hint: 'Mouse or W/S to move · click to serve',
    code: `const f = Fruta({ width: 600, height: 400, background: '#0c0e14' })
const PH = 74, W = 600, H = 400
let py = 163, ay = 163, bx, by, bvx, bvy, ps = 0, as = 0, live = false
function serve(dir) { bx = W / 2; by = H / 2; const a = Math.random() * 0.5 - 0.25; bvx = dir * 300 * Math.cos(a); bvy = 300 * Math.sin(a) }
serve(Math.random() < 0.5 ? 1 : -1)
f.onPress(() => { live = true })
f.loop((dt) => {
  if (f.mouse.y > 4) py += ((f.mouse.y - PH / 2) - py) * Math.min(1, dt * 16)
  if (f.keyDown('w') || f.keyDown('ArrowUp')) py -= 340 * dt
  if (f.keyDown('s') || f.keyDown('ArrowDown')) py += 340 * dt
  py = Math.max(0, Math.min(H - PH, py))
  if (live) {
    ay += Math.max(-230 * dt, Math.min(230 * dt, (by - PH / 2) - ay)); ay = Math.max(0, Math.min(H - PH, ay))
    bx += bvx * dt; by += bvy * dt
    if (by < 8) { by = 8; bvy = Math.abs(bvy) }
    if (by > H - 8) { by = H - 8; bvy = -Math.abs(bvy) }
    if (bvx < 0 && bx < 44 && bx > 26 && by > py - 8 && by < py + PH + 8) { bx = 44; bvx = Math.abs(bvx) * 1.05; bvy += (by - (py + PH / 2)) * 3 }
    if (bvx > 0 && bx > W - 44 && bx < W - 26 && by > ay - 8 && by < ay + PH + 8) { bx = W - 44; bvx = -Math.abs(bvx) * 1.05; bvy += (by - (ay + PH / 2)) * 3 }
    if (bx < -6) { as++; live = false; serve(1) }
    if (bx > W + 6) { ps++; live = false; serve(-1) }
  }
  f.background('#0c0e14')
  for (let y = 6; y < H; y += 26) f.rect({ x: W / 2 - 3, y, w: 6, h: 14, fill: 'rgba(255,255,255,0.1)' })
  f.rect({ x: 30, y: py, w: 12, h: PH, radius: 4, fill: '#5ec3ff' })
  f.rect({ x: W - 42, y: ay, w: 12, h: PH, radius: 4, fill: '#ff6f91' })
  f.circle({ x: bx, y: by, r: 8, fill: '#fafafa' })
  f.text('' + ps, { x: W / 2 - 60, y: 42, fill: '#5ec3ff', size: 34, align: 'center', baseline: 'middle' })
  f.text('' + as, { x: W / 2 + 60, y: 42, fill: '#ff6f91', size: 34, align: 'center', baseline: 'middle' })
  if (!live) f.text('mouse / W · S — click to serve', { x: W / 2, y: H - 26, fill: 'rgba(255,255,255,0.5)', size: 14, align: 'center', baseline: 'middle' })
})`,
  },
  {
    name: 'invaders', title: 'Space Invaders', cat: 'Games', hint: '←/→ or A/D move · Space or click to shoot',
    code: `const f = Fruta({ width: 520, height: 560, background: '#080b12' })
const COLS = 8, ROWS = 4
let px, bullets, aliens, adir, atick, ebul, score, lives, over, win
function reset() {
  px = 242; bullets = []; ebul = []; adir = 1; atick = 0; score = 0; lives = 3; over = false; win = false
  aliens = []
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) aliens.push({ x: 56 + c * 52, y: 70 + r * 44, alive: true })
}
reset()
function shoot() { if (bullets.length < 3) bullets.push({ x: px + 18, y: 500 }) }
f.onPress(() => { if (over || win) reset(); else shoot() })
f.loop((dt) => {
  if (!over && !win) {
    if (f.keyDown('ArrowLeft') || f.keyDown('a')) px -= 300 * dt
    if (f.keyDown('ArrowRight') || f.keyDown('d')) px += 300 * dt
    px = Math.max(0, Math.min(520 - 36, px))
    if (f.keyPressed(' ')) shoot()
    atick += dt
    if (atick > 0.55) {
      atick = 0; let edge = false
      for (const a of aliens) if (a.alive) { a.x += adir * 14; if (a.x < 8 || a.x > 480) edge = true }
      if (edge) { adir *= -1; for (const a of aliens) a.y += 20 }
      const alv = aliens.filter((a) => a.alive)
      if (alv.length && Math.random() < 0.55) { const s = alv[Math.random() * alv.length | 0]; ebul.push({ x: s.x + 16, y: s.y + 22 }) }
    }
    for (const b of bullets) b.y -= 520 * dt
    for (const b of bullets) for (const a of aliens) if (a.alive && Math.abs(b.x - (a.x + 16)) < 18 && Math.abs(b.y - (a.y + 11)) < 15) { a.alive = false; b.y = -99; score += 10 }
    bullets = bullets.filter((b) => b.y > -10)
    for (const e of ebul) e.y += 250 * dt
    for (const e of ebul) if (e.y > 500 && e.y < 522 && e.x > px && e.x < px + 36) { e.y = 999; lives--; if (lives <= 0) over = true }
    ebul = ebul.filter((e) => e.y < 570)
    if (aliens.every((a) => !a.alive)) win = true
    if (aliens.some((a) => a.alive && a.y > 470)) over = true
  }
  f.background('#080b12')
  f.text('SCORE ' + score, { x: 20, y: 26, fill: '#7ee787', size: 16, align: 'left', baseline: 'middle' })
  f.text('LIVES ' + Math.max(0, lives), { x: 500, y: 26, fill: '#ff6f91', size: 16, align: 'right', baseline: 'middle' })
  for (const a of aliens) if (a.alive) { f.rect({ x: a.x, y: a.y, w: 32, h: 22, radius: 5, fill: '#67d4ff' }); f.rect({ x: a.x + 7, y: a.y + 7, w: 5, h: 5, fill: '#080b12' }); f.rect({ x: a.x + 20, y: a.y + 7, w: 5, h: 5, fill: '#080b12' }) }
  f.rect({ x: px, y: 508, w: 36, h: 16, radius: 4, fill: '#ffd24a' }); f.rect({ x: px + 15, y: 500, w: 6, h: 10, fill: '#ffd24a' })
  for (const b of bullets) f.rect({ x: b.x - 2, y: b.y, w: 4, h: 12, fill: '#fafafa' })
  for (const e of ebul) f.rect({ x: e.x - 2, y: e.y, w: 4, h: 12, fill: '#ff6f91' })
  if (over) { f.text('GAME OVER', { x: 260, y: 280, fill: '#ff6f91', size: 40, align: 'center', baseline: 'middle' }); f.text('click to restart', { x: 260, y: 322, fill: '#9fb3d8', size: 15, align: 'center', baseline: 'middle' }) }
  if (win) { f.text('YOU WIN!', { x: 260, y: 280, fill: '#7ee787', size: 40, align: 'center', baseline: 'middle' }); f.text('click to play again', { x: 260, y: 322, fill: '#9fb3d8', size: 15, align: 'center', baseline: 'middle' }) }
})`,
  },
  {
    name: 'breakout', title: 'Breakout', cat: 'Games', hint: 'Move the mouse · click to launch — clear every brick',
    code: `const f = Fruta({ width: 520, height: 560, background: '#10131c' })
const COLS = 9, BW = 50, BH = 22, GAP = 4
const COLORS = ['#ff6f91', '#ffb14a', '#ffd24a', '#7ee787', '#67d4ff', '#b48cff']
let px, bx, by, bvx, bvy, bricks, score, lives, live, over, won
function layout() { bricks = []; for (let r = 0; r < 6; r++) for (let c = 0; c < COLS; c++) bricks.push({ x: 20 + c * (BW + GAP), y: 60 + r * (BH + GAP), col: COLORS[r], alive: true }) }
function launch() { bx = px + 50; by = 486; bvx = 190 * (Math.random() < 0.5 ? -1 : 1); bvy = -260; live = false }
function reset() { px = 210; score = 0; lives = 3; over = false; won = false; layout(); launch() }
reset()
f.onPress(() => { if (over || won) reset(); else live = true })
f.loop((dt) => {
  px = Math.max(0, Math.min(520 - 100, f.mouse.x - 50))
  if (!live) { bx = px + 50; by = 486 }
  if (live && !over && !won) {
    bx += bvx * dt; by += bvy * dt
    if (bx < 8) { bx = 8; bvx = Math.abs(bvx) }
    if (bx > 512) { bx = 512; bvx = -Math.abs(bvx) }
    if (by < 8) { by = 8; bvy = Math.abs(bvy) }
    if (by > 494 && by < 514 && bx > px && bx < px + 100 && bvy > 0) { bvy = -Math.abs(bvy); bvx += (bx - (px + 50)) * 3.5 }
    for (const br of bricks) if (br.alive && bx > br.x - 8 && bx < br.x + BW + 8 && by > br.y - 8 && by < br.y + BH + 8) { br.alive = false; bvy = -bvy; score += 10; break }
    if (by > 560) { lives--; if (lives <= 0) over = true; else launch() }
    if (bricks.every((b) => !b.alive)) won = true
  }
  f.background('#10131c')
  f.text('SCORE ' + score, { x: 20, y: 28, fill: '#cfd6e6', size: 16, align: 'left', baseline: 'middle' })
  f.text('BALLS ' + Math.max(0, lives), { x: 500, y: 28, fill: '#cfd6e6', size: 16, align: 'right', baseline: 'middle' })
  for (const br of bricks) if (br.alive) f.rect({ x: br.x, y: br.y, w: BW, h: BH, radius: 4, fill: br.col })
  f.rect({ x: px, y: 508, w: 100, h: 12, radius: 6, fill: '#e8edf2' })
  f.circle({ x: bx, y: by, r: 8, fill: '#ffd24a' })
  if (!live && !over && !won) f.text('click to launch', { x: 260, y: 300, fill: 'rgba(255,255,255,0.5)', size: 15, align: 'center', baseline: 'middle' })
  if (over) f.text('GAME OVER — click to restart', { x: 260, y: 300, fill: '#ff6f91', size: 22, align: 'center', baseline: 'middle' })
  if (won) f.text('CLEARED! — click to replay', { x: 260, y: 300, fill: '#7ee787', size: 22, align: 'center', baseline: 'middle' })
})`,
  },
  {
    name: 'rpg', title: 'Dungeon RPG', cat: 'Games', hint: 'WASD move · Space attack · I inventory — loot & level up',
    code: `const f = Fruta({ width: 720, height: 540 })
const TS = 36, MW = 20, MH = 15
const ITEMS = { potion: { n: 'Potion', c: '#ff6f91' }, sword: { n: 'Sword', c: '#cfd6e6' }, shield: { n: 'Shield', c: '#7ee787' } }
let map, player, enemies, loot, spawnT, invOpen, msg, msgT, prevI
function genMap() { map = new Uint8Array(MW * MH); for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) map[y * MW + x] = (x === 0 || y === 0 || x === MW - 1 || y === MH - 1) ? 1 : (Math.random() < 0.07 ? 1 : 0); for (let y = 6; y <= 8; y++) for (let x = 9; x <= 11; x++) map[y * MW + x] = 0 }
function solid(px, py) { const tx = px / TS | 0, ty = py / TS | 0; return tx < 0 || tx >= MW || ty < 0 || ty >= MH || map[ty * MW + tx] === 1 }
function freeTile() { for (let t = 0; t < 60; t++) { const x = 1 + (Math.random() * (MW - 2) | 0), y = 1 + (Math.random() * (MH - 2) | 0); if (!map[y * MW + x]) { const cx = x * TS + 18, cy = y * TS + 18; if (Math.hypot(cx - player.x, cy - player.y) > 140) return { x: cx, y: cy } } } return { x: 360, y: 120 } }
function reset() { genMap(); player = { x: 360, y: 270, fx: 1, fy: 0, hp: 100, max: 100, lvl: 1, xp: 0, need: 20, gold: 0, dmg: 9, def: 0, atk: 0, hurt: 0, inv: {}, dead: false }; enemies = []; loot = []; spawnT = 0; invOpen = false; msg = ''; msgT = 0; prevI = false }
reset()
function flash(t) { msg = t; msgT = 1.6 }
function attack() {
  if (player.atk > 0 || player.dead || invOpen) return
  player.atk = 0.3
  for (const e of enemies) { const dx = e.x - player.x, dy = e.y - player.y, dd = Math.hypot(dx, dy); if (dd < 56 && dx * player.fx + dy * player.fy > -10) { e.hp -= player.dmg; e.kx = dx / (dd || 1) * 200; e.ky = dy / (dd || 1) * 200; f.burst({ x: e.x, y: e.y, count: 8, color: ['#ffffff', '#ffd24a'], speed: [40, 160], life: 0.3, size: 2 }) } }
}
function useItem(k) { if (!player.inv[k]) return; if (k === 'potion') { player.hp = Math.min(player.max, player.hp + 40); flash('Healed +40') } else if (k === 'sword') { player.dmg += 4; flash('Damage up!') } else if (k === 'shield') { player.def += 3; flash('Defense up!') } player.inv[k]--; if (player.inv[k] <= 0) delete player.inv[k] }
f.onPress((p) => {
  if (player.dead) { reset(); return }
  if (invOpen) { const keys = Object.keys(player.inv); for (let i = 0; i < keys.length; i++) { const sx = 232 + (i % 4) * 66, sy = 232 + (i / 4 | 0) * 66; if (p.x > sx && p.x < sx + 60 && p.y > sy && p.y < sy + 60) { useItem(keys[i]); break } } }
  else attack()
})
f.loop((dt) => {
  const d = Math.min(dt, 0.03)
  const ki = f.keyDown('i')
  if (ki && !prevI) invOpen = !invOpen
  prevI = ki
  if (f.keyPressed(' ')) attack()
  if (!player.dead && !invOpen) {
    let mx = 0, my = 0
    if (f.keyDown('a') || f.keyDown('ArrowLeft')) mx -= 1
    if (f.keyDown('d') || f.keyDown('ArrowRight')) mx += 1
    if (f.keyDown('w') || f.keyDown('ArrowUp')) my -= 1
    if (f.keyDown('s') || f.keyDown('ArrowDown')) my += 1
    if (mx || my) {
      const l = Math.hypot(mx, my); player.fx = mx / l; player.fy = my / l
      const nx = player.x + mx / l * 152 * d; if (!solid(nx - 10, player.y - 10) && !solid(nx + 10, player.y - 10) && !solid(nx - 10, player.y + 10) && !solid(nx + 10, player.y + 10)) player.x = nx
      const ny = player.y + my / l * 152 * d; if (!solid(player.x - 10, ny - 10) && !solid(player.x + 10, ny - 10) && !solid(player.x - 10, ny + 10) && !solid(player.x + 10, ny + 10)) player.y = ny
    }
    player.atk = Math.max(0, player.atk - d); player.hurt = Math.max(0, player.hurt - d); msgT = Math.max(0, msgT - d)
    spawnT -= d
    if (spawnT <= 0 && enemies.length < 8) { spawnT = 1.8; const t = freeTile(); enemies.push({ x: t.x, y: t.y, hp: 12 + player.lvl * 3, max: 12 + player.lvl * 3, kx: 0, ky: 0 }) }
    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i], dx = player.x - e.x, dy = player.y - e.y, dl = Math.hypot(dx, dy) || 1
      e.x += (dx / dl * 66 + e.kx) * d; e.y += (dy / dl * 66 + e.ky) * d; e.kx *= 0.86; e.ky *= 0.86
      if (dl < 24 && player.hurt <= 0) { player.hp -= Math.max(2, 8 - player.def); player.hurt = 0.7; if (player.hp <= 0) player.dead = true }
      if (e.hp <= 0) {
        player.xp += 8; player.gold += 3 + (Math.random() * 4 | 0)
        f.burst({ x: e.x, y: e.y, count: 16, color: ['#ff6f91', '#ffd24a'], speed: [40, 200], life: 0.5, size: 2.5 })
        if (Math.random() < 0.55) { const ty = ['potion', 'sword', 'shield']; loot.push({ x: e.x, y: e.y, type: ty[Math.random() * 3 | 0] }) }
        enemies.splice(i, 1)
        if (player.xp >= player.need) { player.lvl++; player.xp = 0; player.need += 12; player.max += 20; player.hp = player.max; player.dmg += 1; flash('Level ' + player.lvl + '!') }
      }
    }
    for (let i = loot.length - 1; i >= 0; i--) { const lt = loot[i]; if (Math.hypot(lt.x - player.x, lt.y - player.y) < 22) { player.inv[lt.type] = (player.inv[lt.type] || 0) + 1; flash('Picked up ' + ITEMS[lt.type].n); loot.splice(i, 1) } }
  }
  f.background('#1a1d2e')
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) { if (map[y * MW + x]) f.rect({ x: x * TS, y: y * TS, w: TS, h: TS, fill: '#39405e' }); else if ((x + y) % 2 === 0) f.rect({ x: x * TS, y: y * TS, w: TS, h: TS, fill: '#20243a' }) }
  for (const lt of loot) f.circle({ x: lt.x, y: lt.y, r: 8, fill: ITEMS[lt.type].c })
  for (const e of enemies) { f.rect({ x: e.x - 12, y: e.y - 12, w: 24, h: 24, radius: 5, fill: '#ff5c7a' }); f.rect({ x: e.x - 12, y: e.y - 18, w: 24 * Math.max(0, e.hp) / e.max, h: 3, fill: '#7ee787' }) }
  if (player.atk > 0) f.circle({ x: player.x + player.fx * 30, y: player.y + player.fy * 30, r: 22, fill: 'rgba(255,255,255,0.18)' })
  f.circle({ x: player.x, y: player.y, r: 11, fill: player.hurt > 0 ? '#ffffff' : '#67d4ff' })
  f.circle({ x: player.x + player.fx * 8, y: player.y + player.fy * 8, r: 4, fill: '#0a0d18' })
  f.drawParticles()
  f.rect({ x: 14, y: 14, w: 180, h: 14, radius: 4, fill: '#33203a' }); f.rect({ x: 14, y: 14, w: 180 * Math.max(0, player.hp) / player.max, h: 14, radius: 4, fill: '#ff5c7a' })
  f.text('LV ' + player.lvl + '   XP ' + player.xp + '/' + player.need + '   GOLD ' + player.gold + '   DMG ' + player.dmg + '   DEF ' + player.def, { x: 14, y: 42, fill: '#cfd6e6', size: 13, align: 'left', baseline: 'middle' })
  f.text('I inventory · SPACE attack', { x: 706, y: 24, fill: 'rgba(207,214,230,0.5)', size: 12, align: 'right', baseline: 'middle' })
  if (msgT > 0) f.text(msg, { x: 360, y: 72, fill: '#ffd24a', size: 18, align: 'center', baseline: 'middle' })
  if (invOpen) {
    f.rect({ x: 0, y: 0, w: 720, h: 540, fill: 'rgba(10,12,22,0.72)' })
    f.rect({ x: 200, y: 150, w: 320, h: 240, radius: 12, fill: '#222a44' })
    f.text('INVENTORY', { x: 360, y: 186, fill: '#cfe0ff', size: 22, align: 'center', baseline: 'middle' })
    const keys = Object.keys(player.inv)
    if (!keys.length) f.text('(empty — kill enemies for loot)', { x: 360, y: 270, fill: 'rgba(207,214,230,0.5)', size: 14, align: 'center', baseline: 'middle' })
    for (let i = 0; i < keys.length; i++) { const k = keys[i], sx = 232 + (i % 4) * 66, sy = 232 + (i / 4 | 0) * 66; f.rect({ x: sx, y: sy, w: 60, h: 60, radius: 8, fill: '#161c30' }); f.circle({ x: sx + 30, y: sy + 23, r: 13, fill: ITEMS[k].c }); f.text('x' + player.inv[k], { x: sx + 30, y: sy + 48, fill: '#cfd6e6', size: 12, align: 'center', baseline: 'middle' }) }
    f.text('click an item to use it · I to close', { x: 360, y: 368, fill: 'rgba(207,214,230,0.55)', size: 12, align: 'center', baseline: 'middle' })
  }
  if (player.dead) { f.rect({ x: 0, y: 0, w: 720, h: 540, fill: 'rgba(12,0,8,0.62)' }); f.text('YOU DIED', { x: 360, y: 250, fill: '#ff6f91', size: 46, align: 'center', baseline: 'middle' }); f.text('reached level ' + player.lvl + ' — click to restart', { x: 360, y: 296, fill: '#cfd6e6', size: 16, align: 'center', baseline: 'middle' }) }
})`,
  },
]

const MAP: Record<string, Example> = Object.fromEntries(EXAMPLES.map((e) => [e.name, e]))

const cur = new WeakMap<HTMLElement, string>()
export function runExample(el: HTMLElement, name: string): void {
  if (cur.get(el) === name) return                 // dedup the updater's same-input re-call
  cur.set(el, name)
  const ex = MAP[name]
  if (ex) runCode(el, ex.code)
}

export const exampleCode = (name: string): string => MAP[name]?.code ?? ''
export const exampleHtml = (name: string): string => highlightTS(MAP[name]?.code ?? '')
export const exampleTitle = (name: string): string => MAP[name]?.title ?? name
export const exampleHint = (name: string): string => MAP[name]?.hint ?? ''
export const exampleCat = (name: string): string => MAP[name]?.cat ?? ''
