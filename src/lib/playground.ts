// The live playground reuses the same code runner as the examples (run.ts): your code runs with `Fruta`
// in scope and the canvas auto-mounts. starterCode seeds the editor.
export { runCode as runUserCode } from './run'

export const starterCode = (): string => `// 🎮 DUSKFALL — a Braid-inspired platformer, running LIVE as you type.
//   ←  →  move   ·   Space  jump (or stomp an enemy)   ·   hold  Shift  to REWIND time   ·   reach the portal
// The whole game is data + small named helpers. Add a LEVEL, retune a number, and it just works.

const WIDTH = 640, HEIGHT = 400
const f = Fruta({ width: WIDTH, height: HEIGHT })

// ── Tuning ── every gameplay knob, in one place
const HERO = { w: 16, h: 30 }
const ENEMY = { size: 24, speed: 58 }
const MOVE_SPEED = 168, JUMP_FORCE = 445, GRAVITY = 1200
const STOMP_BOUNCE = 300, STOMP_MIN_FALL = 60
const SPARK = { count: 14, life: 0.7, gravity: 420 }
const MAX_REWIND = 500

// ── Controls ── named keys instead of loose strings
const KEY = { left: 'ArrowLeft', right: 'ArrowRight', jump: ' ', rewind: 'Shift' }

// ── Palette ── named colours; the per-level sky gradients live in LEVELS.sky
const INK = '#241a2e'
const SUN = 'rgba(255,249,224,0.92)', SUN_GLOW = 'rgba(255,240,200,0.4)'
const PLATFORM_TOP = '#4a3a52', PLATFORM_BOTTOM = '#221826', PLATFORM_RIM = 'rgba(255,220,170,0.25)'
const PORTAL_RGB = '120,240,180', PORTAL_STAR = '#eafff2', PORTAL_EDGE = '#2c8c7c'
const ENEMY_FILL = '#b23a4a', ENEMY_LINE = '#241018', EYE = '#fff'
const SPARK_STOMP = '#ffd24a', SPARK_HURT = '#ff5a6a'
const HERO_RIM = 'rgba(255,210,150,0.14)', SHADOW = 'rgba(0,0,0,0.28)'
const HUD_INK = 'rgba(255,246,224,0.85)', HINT_INK = 'rgba(255,246,224,0.6)', REWIND_INK = 'rgba(255,240,210,0.95)'
const rgba = (rgb, alpha) => 'rgba(' + rgb + ',' + alpha + ')'

// ── Levels ── the entire game, described as plain data
const LEVELS = [
  {
    sky: ['#2e2450', '#7d4f6d', '#df8f66', '#f6cd7f'],
    spawn: { x: 40, y: 300 }, goal: { x: 590, y: 190 },
    plats: [{ x: 0, y: 360, w: 640, h: 40 }, { x: 210, y: 285, w: 130, h: 16 }, { x: 420, y: 220, w: 160, h: 16 }],
    foes:  [{ x: 260, y: 268, lo: 215, hi: 335 }, { x: 480, y: 203, lo: 425, hi: 575 }],
  },
  {
    sky: ['#1e2a44', '#3f5a7a', '#c98a6a', '#f0c88a'],
    spawn: { x: 30, y: 300 }, goal: { x: 600, y: 268 },
    plats: [{ x: 0, y: 360, w: 210, h: 40 }, { x: 250, y: 320, w: 130, h: 16 }, { x: 120, y: 245, w: 120, h: 16 }, { x: 420, y: 300, w: 220, h: 100 }],
    foes:  [{ x: 300, y: 304, lo: 255, hi: 375 }, { x: 520, y: 284, lo: 430, hi: 625 }],
  },
]

// ── State ──
let levelIndex = 0
let hero = { x: 0, y: 0, vx: 0, vy: 0, ground: false, face: 1 }
let enemies = []
let sparks = []
let timeline = []
let flash = 0

// ── Helpers ── maths, level setup, world snapshots and particle bursts
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))
const overlap = (ax, ay, aw, ah, bx, by, bw, bh) =>
  ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by

const loadLevel = (i) => {
  levelIndex = i
  const level = LEVELS[i]
  hero = { x: level.spawn.x, y: level.spawn.y, vx: 0, vy: 0, ground: false, face: 1 }
  enemies = level.foes.map((e) => ({ ...e, dir: 1, dead: false }))
  timeline = []
}

const snapshot = () => ({ hero: { ...hero }, enemies: enemies.map((e) => ({ ...e })) })
const restore = (s) => { Object.assign(hero, s.hero); enemies.forEach((e, i) => Object.assign(e, s.enemies[i])) }

const spawnBurst = (x, y, colour) => {
  for (let i = 0; i < SPARK.count; i++) {
    const angle = Math.random() * Math.PI * 2, speed = 40 + Math.random() * 150
    sparks.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 40, life: SPARK.life, colour })
  }
}

// ── Simulation ── one step of hero + enemies (skipped entirely while rewinding)
const stepWorld = (dt, level) => {
  const dir = (f.keyDown(KEY.right) ? 1 : 0) - (f.keyDown(KEY.left) ? 1 : 0)
  hero.vx = dir * MOVE_SPEED
  if (dir !== 0) hero.face = dir
  if (f.keyPressed(KEY.jump) && hero.ground) hero.vy = -JUMP_FORCE

  hero.vy += GRAVITY * dt
  hero.x = clamp(hero.x + hero.vx * dt, 0, WIDTH - HERO.w)
  hero.y += hero.vy * dt
  hero.ground = false

  for (const p of level.plats) {
    const landing = hero.vy > 0 && hero.y + HERO.h - hero.vy * dt <= p.y + 8
    if (landing && overlap(hero.x, hero.y, HERO.w, HERO.h, p.x, p.y, p.w, p.h)) {
      hero.y = p.y - HERO.h; hero.vy = 0; hero.ground = true
    }
  }
  if (hero.y > HEIGHT) return loadLevel(levelIndex)

  for (const e of enemies) {
    if (e.dead) continue
    e.x += e.dir * ENEMY.speed * dt
    if (e.x < e.lo) { e.x = e.lo; e.dir = 1 } else if (e.x > e.hi) { e.x = e.hi; e.dir = -1 }
    if (!overlap(hero.x, hero.y, HERO.w, HERO.h, e.x - ENEMY.size / 2, e.y - ENEMY.size / 2, ENEMY.size, ENEMY.size)) continue
    if (hero.vy > STOMP_MIN_FALL) { e.dead = true; hero.vy = -STOMP_BOUNCE; spawnBurst(e.x, e.y, SPARK_STOMP) }
    else { spawnBurst(hero.x + HERO.w / 2, hero.y, SPARK_HURT); return loadLevel(levelIndex) }
  }

  if (overlap(hero.x, hero.y, HERO.w, HERO.h, level.goal.x - 14, level.goal.y - 22, 28, 44)) {
    flash = 1
    return loadLevel((levelIndex + 1) % LEVELS.length)
  }

  timeline.push(snapshot())
  if (timeline.length > MAX_REWIND) timeline.shift()
}

const stepParticles = (dt) => {
  for (let i = sparks.length - 1; i >= 0; i--) {
    const p = sparks[i]
    p.life -= dt
    if (p.life <= 0) { sparks.splice(i, 1); continue }
    p.vy += SPARK.gravity * dt
    p.x += p.vx * dt; p.y += p.vy * dt
  }
}

// ── Rendering ── one small function per thing on screen
const paintScreen = (fill) => f.rect({ x: 0, y: 0, w: WIDTH, h: HEIGHT, fill })

const drawSky = (level) => {
  const [top, upper, lower, glow] = level.sky
  paintScreen(f.linearGradient(0, 0, 0, HEIGHT, [[0, top], [0.42, upper], [0.74, lower], [1, glow]]))
  paintScreen(f.radialGradient(WIDTH * 0.75, 110, 210, [[0, SUN_GLOW], [1, rgba('255,240,200', 0)]]))
  f.circle({ x: WIDTH * 0.75, y: 110, r: 28, fill: SUN })
}

const drawPlatform = (p) => {
  f.rect({ x: p.x, y: p.y, w: p.w, h: p.h, radius: 5, fill: f.linearGradient(0, p.y, 0, p.y + p.h, [[0, PLATFORM_TOP], [1, PLATFORM_BOTTOM]]) })
  f.rect({ x: p.x, y: p.y, w: p.w, h: 3, radius: 2, fill: PLATFORM_RIM })
}

const drawPortal = (goal, time) => {
  const pulse = 0.6 + Math.sin(time * 4) * 0.28
  f.circle({ x: goal.x, y: goal.y, r: 24, fill: f.radialGradient(goal.x, goal.y, 28, [[0, rgba(PORTAL_RGB, pulse)], [1, rgba(PORTAL_RGB, 0)]]) })
  f.ngon({ x: goal.x, y: goal.y, r: 10, sides: 5, rotation: time * 60, fill: PORTAL_STAR, stroke: PORTAL_EDGE, strokeWidth: 2 })
}

const drawEnemy = (e) => {
  if (e.dead) return
  f.push({ x: e.x, y: e.y })
  f.ngon({ x: 0, y: 0, r: ENEMY.size / 2, sides: 3, rotation: 180, fill: ENEMY_FILL, stroke: ENEMY_LINE, strokeWidth: 2 })
  f.circle({ x: -4, y: -1, r: 2.4, fill: EYE }); f.circle({ x: 4, y: -1, r: 2.4, fill: EYE })
  f.pop()
}

const drawSpark = (p) => f.circle({ x: p.x, y: p.y, r: 3, fill: p.colour })

const drawHero = () => {
  f.push({ x: hero.x + HERO.w / 2, y: hero.y + HERO.h / 2 })
  f.ellipse({ x: 0, y: HERO.h / 2 + 2, rx: 11, ry: 3.5, fill: SHADOW })
  f.rect({ x: -7, y: -5, w: 14, h: 22, radius: 6, fill: INK })
  f.circle({ x: 0, y: -9, r: 7.5, fill: INK })
  f.circle({ x: hero.face * 4, y: -10, r: 8, fill: HERO_RIM })
  f.pop()
}

const drawRewindMood = () => {
  paintScreen(rgba('120,80,40', 0.18))
  paintScreen(f.radialGradient(WIDTH / 2, HEIGHT / 2, WIDTH * 0.72, [[0.55, rgba('0,0,0', 0)], [1, rgba('20,8,0', 0.5)]]))
  f.text('⟲ rewinding', { x: WIDTH / 2, y: 40, fill: REWIND_INK, size: 20, align: 'center' })
}

const drawFlash = (dt) => {
  if (flash <= 0) return
  flash -= dt * 2
  paintScreen(rgba('255,255,255', Math.max(0, flash)))
}

const drawHud = () => {
  f.text('Level ' + (levelIndex + 1) + ' / ' + LEVELS.length, { x: 14, y: 26, fill: HUD_INK, size: 15 })
  f.text('←  →  move   ·   space  jump / stomp   ·   hold  Shift  rewind   ·   reach the portal', { x: WIDTH / 2, y: HEIGHT - 14, fill: HINT_INK, size: 12, align: 'center' })
}

// ── Main loop ── advance or rewind the world, then paint it back to front
loadLevel(0)

f.loop((dt, time) => {
  const step = Math.min(dt, 1 / 30)
  const level = LEVELS[levelIndex]
  const rewinding = f.keyDown(KEY.rewind)

  drawSky(level)

  if (rewinding && timeline.length > 1) restore(timeline.pop())
  else if (!rewinding) stepWorld(step, level)
  stepParticles(step)

  level.plats.forEach(drawPlatform)
  drawPortal(level.goal, time)
  enemies.forEach(drawEnemy)
  sparks.forEach(drawSpark)
  drawHero()

  if (rewinding) drawRewindMood()
  drawFlash(step)
  drawHud()
})`
