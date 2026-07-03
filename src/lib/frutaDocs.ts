// Docs — drawn 100% in fruta (ink / analytic-cubism period), a friendly guided TOUR of the whole API: every
// system gets a playful blurb, a code snippet, its method chips, and — for the visual ones — a LIVE mini-demo
// (real fruta running, mounted only while on-screen). Content blocks feed the frutaPage engine.
import { frutaPage, type Instance } from './frutaPage'

const DEMO_DRAW = `const f = Fruta({ width: 560, height: 180, background: '#12101a' })
f.loop((dt, t) => {
  f.background('#12101a')
  f.circle({ x: 90 + Math.sin(t) * 45, y: 90, r: 30, fill: '#fb6f92' })
  f.rect({ x: 220, y: 55, w: 70, h: 70, radius: 12, fill: '#67d4ff' })
  f.push({ x: 430, y: 90, rotate: t * 80 })
  f.ngon({ x: 0, y: 0, r: 42, sides: 5, fill: '#ffd24a', stroke: '#0b0f17', strokeWidth: 3 })
  f.pop()
})`

const DEMO_TRANSFORMS = `const f = Fruta({ width: 560, height: 180, background: '#0e1226' })
f.loop((dt, t) => {
  f.background('#0e1226')
  for (let i = 0; i < 8; i++) {
    f.push({ x: 280, y: 90, rotate: t * 40 + i * 45 })
    f.rect({ x: 60, y: -10, w: 60, h: 20, radius: 6, fill: 'hsl(' + (i * 45) + ',70%,62%)' })
    f.pop()
  }
})`

const DEMO_GRADIENT = `const f = Fruta({ width: 560, height: 180, background: '#0b0f17' })
f.loop((dt, t) => {
  f.background('#0b0f17')
  const g = f.radialGradient(280, 90, 62, [[0, '#ffd24a'], [0.6, '#fb6f92'], [1, '#123e88']])
  f.circle({ x: 280, y: 90, r: 55 + Math.sin(t * 2) * 8, fill: g })
})`

const DEMO_PARTICLES = `const f = Fruta({ width: 560, height: 180, background: '#0d0f17' })
f.loop((dt, t) => {
  f.background('#0d0f17')
  f.burst({ x: 280 + Math.cos(t * 1.5) * 130, y: 90, count: 4, color: ['#ff5a8a', '#ffd24a', '#67d4ff'], speed: [30, 170], life: 1, size: 3, gravity: 30 })
  f.drawParticles()
})`

const DEMO_TWEEN = `const f = Fruta({ width: 560, height: 180, background: '#101822' })
const box = { x: 70, fill: '#e8425a' }
f.tween(box, { to: { x: 490, fill: '#67d4ff' }, duration: 1.3, ease: 'bounce', repeat: 9999, yoyo: true })
f.loop(() => {
  f.background('#101822')
  f.rect({ x: box.x - 26, y: 64, w: 52, h: 52, radius: 12, fill: box.fill })
})`

export function paintDocs(el: HTMLElement): Instance {
  return frutaPage(el, {
    style: 'ink',
    title: 'The whole tour',
    subtitle: 'Everything fruta can do — from your first circle to a shipped game — in one friendly scroll. Every visual bit below is real fruta, running as you read. Make it, mount it, loop it.',
    blocks: [
      { t: 'h', s: '① Install' },
      { t: 'p', s: 'One package, zero dependencies, types bundled. ESM-only and tree-shakeable — works in React, Vue, Svelte or plain HTML.' },
      { t: 'code', code: 'npm i fruta' },

      { t: 'h', s: '② Make it, mount it, loop it' },
      { t: 'p', s: 'Fruta(config) returns one friendly object — the whole surface. Give it a size, mount the canvas, and drive a frame loop. That is the entire mental model.' },
      { t: 'code', code: "import Fruta from 'fruta'\n\nconst f = Fruta({ width: 500, height: 500, background: '#111' }).mount()\n\nf.loop((dt, t) => {\n  f.circle({ x: f.mouse.x, y: f.mouse.y, r: 24, fill: 'tomato' })\n})" },
      { t: 'demo', code: DEMO_DRAW },
      { t: 'p', s: 'config: width, height, background (auto-repainted each frame — opt out with clear: false for trails), mount, fps, dpr (crisp HiDPI), renderer: "canvas" | "webgl".' },
      { t: 'chips', items: ['Fruta(config)', '.mount()', '.loop(dt,t)', '.background', '.destroy()'] },

      { t: 'h', s: '③ The delta-time loop' },
      { t: 'p', s: 'loop(fn) runs every frame. dt is seconds since the last frame — multiply movement by it and speed is identical on any screen. t is seconds since start. dt is clamped, so a tab-out can never blow up your physics.' },
      { t: 'code', code: "let x = 0\nf.loop((dt, t) => {\n  f.background('#0e0e14')             // (or set background in config)\n  x += 200 * dt                       // 200 px/second, identical on any monitor\n  if (x > f.canvas.width) x = 0\n  f.circle({ x, y: 100, r: 20, fill: 'deepskyblue' })\n  f.text('t = ' + t.toFixed(1) + 's', { x: 12, y: 24, fill: '#888', size: 14 })\n})" },

      { t: 'h', s: '④ Drawing' },
      { t: 'p', s: 'Intent-named shapes, each a typed options object with sensible defaults (no fill + no stroke = black fill; rotation in degrees). Chain them; most calls return the app.' },
      { t: 'code', code: "f.rect({ x, y, w, h, fill, stroke, radius, rotation })\nf.circle({ x, y, r, fill })\nf.ellipse({ x, y, rx, ry, fill })\nf.line({ x1, y1, x2, y2, stroke, strokeWidth, cap })\nf.polygon({ points: [{ x, y }, ...], fill })\nf.ngon({ x, y, r, sides, rotation })   // regular polygon\nf.text('Hi', { x, y, fill, size, align, baseline })\nf.image(name, { x, y }); f.sprite(name, { frame })" },
      { t: 'chips', items: ['rect', 'circle', 'ellipse', 'line', 'polygon', 'ngon', 'text', 'image', 'sprite'] },

      { t: 'h', s: '⑤ Transforms — push / pop' },
      { t: 'p', s: 'push() wraps save + translate/rotate/scale/alpha; pop() restores. Alpha multiplies, so nested pushes compose. This is how you spin, orbit and fade anything.' },
      { t: 'code', code: "f.push({ x: 200, y: 200, rotate: 45, scale: 1.5, alpha: 0.8 })\nf.rect({ x: -20, y: -20, w: 40, h: 40, fill: 'gold' })\nf.pop()" },
      { t: 'demo', code: DEMO_TRANSFORMS },
      { t: 'chips', items: ['push({x,y,rotate,scale,alpha})', 'pop()'] },

      { t: 'h', s: '⑥ Colour & gradients' },
      { t: 'p', s: 'Any fill/stroke takes a CSS colour, a CanvasGradient or a CanvasPattern. Build gradients with two friendly helpers and use them anywhere a colour goes.' },
      { t: 'code', code: "const g = f.radialGradient(280, 90, 62, [[0, '#ffd24a'], [1, '#cf3b25']])\nf.circle({ x: 280, y: 90, r: 55, fill: g })\n\nf.linearGradient(x1, y1, x2, y2, [[0, 'red'], [1, 'blue']])" },
      { t: 'demo', code: DEMO_GRADIENT },
      { t: 'chips', items: ['linearGradient(x1,y1,x2,y2,stops)', 'radialGradient(x,y,r,stops)'] },

      { t: 'h', s: '⑦ Input' },
      { t: 'p', s: 'Held keys, one-shot presses, a normalised movement axis, and pointer events (mouse + touch + pen, one path). Plus gamepads that map game ACTIONS to buttons.' },
      { t: 'code', code: "f.keyDown('ArrowRight')      // held?\nf.keyPressed('Space')        // one-shot, this frame only\nf.axis()                     // { x, y } from WASD + arrows, normalised\nf.mouse                      // { x, y } in canvas coords\nf.onPress(p => shoot(p)); f.onRelease(p => {})\nconst pad = f.gamepad({ buttons: { jump: 'A' } })" },
      { t: 'p', s: 'A complete top-down mover — WASD/arrows to move, Space to spark:' },
      { t: 'code', code: "const p = { x: 200, y: 200, speed: 260 }\nf.loop((dt) => {\n  const move = f.axis()\n  p.x += move.x * p.speed * dt\n  p.y += move.y * p.speed * dt\n  if (f.keyPressed('Space')) f.burst({ x: p.x, y: p.y, count: 20, color: 'gold' })\n  f.circle({ x: p.x, y: p.y, r: 16, fill: '#fb6f92' })\n  f.drawParticles()\n})" },
      { t: 'chips', items: ['keyDown', 'keyPressed', 'axis', 'mouse', 'onPress', 'onRelease', 'onClick', 'onMove', 'gamepad'] },

      { t: 'h', s: '⑧ Maths & collision' },
      { t: 'p', s: 'The little helpers you always end up writing — already here, pure and unit-tested. No more copy-pasting lerp for the hundredth time.' },
      { t: 'code', code: 'f.lerp(a, b, t); f.clamp(v, min, max); f.map(v, a1, b1, a2, b2)\nf.rand(min, max); f.dist(ax, ay, bx, by); f.angle(ax, ay, bx, by)\nf.hits(a, b)          // AABB overlap\nf.inside(point, box)  // point-in-box\nf.overlap(a, b, onHit)' },
      { t: 'chips', items: ['lerp', 'clamp', 'map', 'rand', 'dist', 'angle', 'hits', 'inside', 'overlap'] },

      { t: 'h', s: '⑨ Particles' },
      { t: 'p', s: 'Bursts and continuous emitters with colour, gravity, speed range and life — one call, no bookkeeping. Call drawParticles() each frame to render them.' },
      { t: 'code', code: "f.burst({ x, y, count: 30, color: ['#ff5a8a', 'gold'], speed: [30, 170], life: 1, size: 3, gravity: 30 })\nf.emit({ x, y, rate: 20, color: 'cyan' })   // continuous\nf.drawParticles()" },
      { t: 'demo', code: DEMO_PARTICLES },
      { t: 'chips', items: ['burst', 'emit', 'drawParticles'] },

      { t: 'h', s: '⑩ Animation — tween, timeline, stagger' },
      { t: 'p', s: '30+ named easings, colour tweens (fill: "red" interpolates via RGBA), repeat/yoyo, timelines (sequential, or { at } for absolute placement) and stagger — all driven by one pure engine.' },
      { t: 'code', code: "f.tween(box, { to: { x: 300, fill: 'gold' }, duration: 0.8, ease: 'bounce', yoyo: true, repeat: 3 })\nf.timeline().to(a, { to: { x: 100 }, duration: 1 }).to(b, { to: { y: 50 }, duration: 0.5 })\nf.stagger(cards, { to: { y: 0 }, duration: 0.4, each: 0.08 })" },
      { t: 'demo', code: DEMO_TWEEN },
      { t: 'chips', items: ['tween', 'timeline', 'stagger', 'anim(states)'] },

      { t: 'h', s: '⑪ Camera & scenes' },
      { t: 'p', s: 'A scrolling/zooming camera that can follow a target and shake for impact, plus a scene stack with fades — the scaffolding of a real game. Draw your world between camera.begin()/end().' },
      { t: 'code', code: "f.camera.follow(hero)\nf.camera.shake(12, 0.3)\n\nf.scene('play', { draw: (f) => { /* ... */ } })\nf.start('play', 0.5)   // switch with a 0.5s fade" },
      { t: 'chips', items: ['camera.follow', 'camera.shake', 'camera.begin/end', 'scene', 'start'] },

      { t: 'h', s: '⑫ Entities (retained mode)' },
      { t: 'p', s: 'Opt-in: hand the engine objects and it moves them each frame (velocity, gravity, canvas bounds: "bounce" | "wrap"). Draw them all with one call. Immediate mode still works alongside.' },
      { t: 'code', code: "const ball = f.add({ x: 100, y: 0, vy: 0, gravity: 600, bounds: 'bounce', shape: { r: 12, fill: 'tomato' } })\nf.loop(() => f.drawEntities())\nf.all           // the live list\nball.remove()" },
      { t: 'chips', items: ['add', 'drawEntities', 'all', 'entity.remove()'] },

      { t: 'h', s: '⑬ Tilemaps & arcade physics' },
      { t: 'p', s: 'Build a tilemap from an ASCII string, then map.move(body, dt) resolves collisions against solid tiles and tells you when a body is onGround. Platformers without the pain.' },
      { t: 'code', code: "const map = f.tilemap(['....', '#..#', '####'], { size: 32, solids: '#' })\nmap.move(player, dt)\nif (player.onGround) canJump = true" },
      { t: 'chips', items: ['tilemap', 'map.move(body, dt)', 'body.onGround'] },

      { t: 'h', s: '⑭ Timers' },
      { t: 'p', s: 'Schedule work in game-time (paused with the loop, not wall-clock). after() runs once; every() repeats.' },
      { t: 'code', code: 'f.after(2, () => spawnBoss())\nf.every(0.5, () => blink = !blink)' },
      { t: 'chips', items: ['after(s, fn)', 'every(s, fn)'] },

      { t: 'h', s: '⑮ Audio — samples, synthesis & audio-reactive' },
      { t: 'p', s: 'Web Audio, auto-resumed on the first input. Play samples, synth notes and drones, add reverb / delay / filters to the whole mix, and tap an analyser (or the mic) to drive visuals off the sound.' },
      { t: 'code', code: "f.beep({ freq: 660, time: 0.08 })\nf.play('jump')\nf.tone({ note: 'C4', duration: 0.4 })      // a note with an envelope\nconst drone = f.osc({ freq: 110, type: 'sawtooth' })  // drone.freq(..) / amp(..) / stop()\nf.reverb(0.35); f.delay({ time: 0.25, feedback: 0.4 }); f.lowpass(1200)\nconst a = f.analyser()                      // or: await f.mic()\nf.loop(() => a.freqs().forEach((v, i) => f.rect({ x: i * 3, y: 400, w: 2, h: -v, fill: 'aqua' })))" },
      { t: 'chips', items: ['play', 'beep', 'tone', 'osc', 'analyser', 'mic', 'reverb', 'delay', 'lowpass', 'volume', 'mute'] },

      { t: 'h', s: '⑯ Load, export & p5-parity' },
      { t: 'p', s: 'Coming from p5? Load JSON / CSV, export a PNG, measure and wrap text, and reach for the pixel filters — the same conveniences, in fruta’s options style.' },
      { t: 'code', code: "const cfg = await loadJSON('/level.json')   // + loadText, loadCSV (→ row objects)\nf.paragraph(story, { x: 40, y: 60, w: 300, leading: 22 })\nf.filter('sepia')   // invert · grayscale · threshold · posterize · blur · sepia · erode · dilate\nf.screenshot('art.png')   // download the canvas\nconst cam = await f.webcam()   // live webcam as a drawable source\nconst size = f.createSlider({ min: 4, max: 60, value: 20 })  // quick sketch knobs (read .valueAsNumber)" },
      { t: 'p', s: 'And p5-style DOM controls for throwaway knobs — createSlider / Button / Input / Checkbox / Select (for real app UI, pair fruta with a framework).' },
      { t: 'chips', items: ['loadJSON', 'loadCSV', 'paragraph', 'textWidth', 'filter', 'screenshot', 'webcam', 'createSlider', 'createButton'] },

      { t: 'h', s: '⑰ Sprites & assets' },
      { t: 'p', s: 'load() returns a Promise (perfect for a loading screen). Register generated sheets, draw a frame from a sheet, and loop frame animations by time.' },
      { t: 'code', code: "await f.load({ hero: '/hero.png' })\nf.sprite('hero', { frame: f.frameAt(t, 8, 6), frameW: 32, cols: 6 })\nf.addImage('gen', myCanvas)" },
      { t: 'chips', items: ['load', 'addImage', 'sprite', 'frameAt'] },

      { t: 'h', s: '⑱ One-call charts' },
      { t: 'p', s: 'Pass data (numbers or { label, value, color }) and fruta hides the scales, axes and legend. Animate a reveal by passing progress 0..1 (tween it), or by tweening your data.' },
      { t: 'code', code: "f.barChart({ data: [4, 8, 15, 16, 23], progress })\nf.lineChart({ series: [{ name: 'A', data: [...] }], points: true })\nf.pieChart({ data: [...] }); f.radar({ ... }); f.legend({ ... })" },
      { t: 'chips', items: ['barChart', 'lineChart', 'pieChart', 'radar', 'legend'] },

      { t: 'h', s: '⑲ WebGL, same friendly API' },
      { t: 'p', s: 'Flip a flag for the GPU-batched backend — tens of thousands of sprites in a few draw calls, the same sugar. Plus generative shaders and a curated post-FX library (crt, bloom, chromatic, vignette…).' },
      { t: 'code', code: "const gl = Fruta({ renderer: 'webgl', width: 800, height: 600 })\ngl.effect('crt')                 // full-frame post-processing\ngl.shader(fragSrc).draw()        // generative, time auto" },
      { t: 'chips', items: ["renderer: 'webgl'", 'gl.effect(name)', 'gl.shader(frag)', 'gl.camera'] },

      { t: 'h', s: '⑳ Save & debug' },
      { t: 'p', s: 'One-liner localStorage persistence, plus a live on-screen overlay for the values you are chasing. Ship faster, guess less.' },
      { t: 'code', code: "f.store('best', score); const best = f.stored('best', 0)\nf.debug(); f.watch('speed', player.vx)" },
      { t: 'chips', items: ['store', 'stored', 'debug', 'watch'] },

      { t: 'h', s: '㉑ Escape hatches' },
      { t: 'p', s: 'The friendly facade never traps you. Drop to the raw Canvas 2D context any time, or use the chainable low-level wrappers. Progressive disclosure — beginners never see this, power users always can.' },
      { t: 'code', code: 'f.context   // the raw CanvasRenderingContext2D\nf.shapes    // chainable low-level shape wrappers\nf.fonts     // chainable text wrappers\nf.canvas    // the <canvas> element' },
      { t: 'chips', items: ['context', 'shapes', 'fonts', 'canvas', 'state'] },

      { t: 'h', s: '㉒ A whole game, end to end' },
      { t: 'p', s: 'It all composes. Here is a complete little game — move the paddle with your mouse and catch the falling dots — using the loop, mouse input, a timer, maths, drawing and audio together. Paste it straight into the playground.' },
      { t: 'code', code: "// A tiny collector — catch the falling dots.\nconst player = { x: 300, y: 560 }\nlet dots = [], score = 0\nf.every(0.6, () => dots.push({ x: f.rand(20, 580), y: -10, vy: f.rand(120, 240) }))\nf.loop((dt) => {\n  f.background('#0d1020')\n  player.x = f.mouse.x\n  for (const d of dots) {\n    d.y += d.vy * dt\n    f.circle({ x: d.x, y: d.y, r: 8, fill: '#ffd24a' })\n    if (f.dist(d.x, d.y, player.x, player.y) < 32) { d.y = 999; score++; f.beep({ freq: 880, time: 0.05 }) }\n  }\n  dots = dots.filter(d => d.y < 620)\n  f.rect({ x: player.x - 30, y: player.y, w: 60, h: 14, radius: 7, fill: '#fb6f92' })\n  f.text('score ' + score, { x: 12, y: 28, fill: '#fff', size: 18 })\n})" },
      { t: 'btns', items: [{ label: 'Try this in the playground  ▶', to: '/playground', primary: true }] },

      { t: 'gap', h: 12 },
      { t: 'h', s: 'That is the whole engine' },
      { t: 'p', s: 'Draw, loop, input, maths, particles, animation, camera, scenes, tilemaps, physics, timers, audio, sprites, charts, WebGL, save and debug — from one object. Go make something; the playground has autocomplete for all of it.' },
      { t: 'btns', items: [{ label: 'Open the playground  ▶', to: '/playground', primary: true }, { label: 'See it in the examples', to: '/examples' }, { label: 'Full API on GitHub  ↗', to: 'https://github.com/karttofer/Fruta#readme', ext: true }] },
    ],
  })
}
