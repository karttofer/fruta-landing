// Articles — its own art direction: a genuine old NEWSPAPER. The index is a full-width front page laid out in
// columns you scan; clicking a headline turns to that story's page — masthead, a JUSTIFIED multi-column body with
// a rule under each sub-head, a drop-cap lede, and the fruta charts set as bordered "FIG." plates. New posts =
// another entry in ARTICLES. All drawn in fruta; text measured + justified by hand for even columns.
import Fruta from 'fruta'
import { FONT, ensureFonts } from './fonts'
import { drawNavBar, navHeight, type NavHit } from './nav'

type Instance = { destroy(): void }
type Block =
  | { t: 'p'; s: string }
  | { t: 'h'; s: string }
  | { t: 'code'; code: string }
  | { t: 'chart'; kind: 'bar' | 'line'; caption: string; h?: number; datums?: { label: string; value: number; color?: string }[]; series?: { name?: string; color?: string; data: number[] }[]; max?: number }
type Source = { label: string; url: string }
type Article = { kicker: string; title: string; date: string; deck: string; blocks: Block[]; sources?: Source[] }

const PAPER = '#e7ddc2', INK = '#201b12', FADE = '#6b6249', RULE = '#241f14', RED = '#9a3320', FIG = '#17130d'
const SERIF = 'Georgia, "Times New Roman", serif'
const TAU = Math.PI * 2
const ENG = ['swarm', 'morph', 'gears']   // the animated "photo" each story carries — a living-newspaper engraving

const ARTICLES: Article[] = [
  {
    kicker: 'ON PERFORMANCE', title: 'How the Engine Learned to Draw a Hundred Thousand Things', date: 'JULY 3, 2026',
    deck: 'It began with a single stuttering demonstration, and ended with fruta growing a second engine. The story of a frame budget broken, investigated, and won back.',
    blocks: [
      { t: 'p', s: 'It began, as these things so often do, with a demonstration that would not behave. A modest scene of a few thousand drifting embers, redrawn upon every frame, had run perfectly smooth on the Tuesday, and by the Thursday it crawled, the moment a colleague asked for ten thousand of them instead. The frame rate, which ought to have held steady at sixty, sank to six. fruta had walked straight into the wall that every 2D engine meets sooner or later: ask it to draw a great many things at once, and the whole picture falls to pieces.' },
      { t: 'h', s: 'The Night It Stuttered' },
      { t: 'p', s: 'The easy course was to blame the machine. The profiler would not permit it. Each small circle, it turned out, cost a great deal more than its ink: a fresh options object born and at once discarded, a fill colour set and set again, a path begun and closed, many thousands of times in a single frame, and all upon one lonely core of the processor. Canvas, for all its friendliness, was performing honest but ruinous book-keeping. The drawing itself was cheap; it was the ceremony around each drawing that was breaking the bank.' },
      { t: 'h', s: 'What a Single Call Can Fold Together' },
      { t: 'p', s: 'The first remedy asked a very plain question: why pay the whole ceremony ten thousand times over, when the shapes are all alike? So fruta was taught to draw an entire flock in one breath: one call, one colour set a single time, one path for the whole group, and, most telling of all, not a scrap of per-shape rubbish left behind for the collector to sweep. We then measured the very same scene three separate ways, upon a single laptop with a mid-range, RTX 2060-class graphics card. The figures below are representative of that machine, not a universal law.' },
      { t: 'chart', kind: 'bar', h: 250, caption: 'FIG. 1. Frames per second at fifty thousand particles: a draw call apiece, then one batched call, then that same batch set loose upon the graphics card.',
        datums: [{ label: 'A call each', value: 6 }, { label: 'Batched', value: 12 }, { label: 'On the card', value: 110 }] },
      { t: 'p', s: 'Batching doubled the Canvas figure at a single stroke, twelve frames where there had lately been six. And there, stubbornly, it stopped. For all our folding, the processor still painted each circle with its own hand, one after another, on the one lane of a one-lane road. We had made the book-keeping vanish; the rasterizing itself would not.' },
      { t: 'h', s: 'The Decision to Grow a Second Engine' },
      { t: 'p', s: 'It was here that fruta made its choice. That flat array of positions the batch had already produced was, we came slowly to see, precisely the shape a graphics card most longs for: thousands of tiny painters all working the very same instant, across a mere handful of instructions. The card had been sitting idle the whole while. So fruta grew a second engine behind the same friendly face. Ask for the WebGL renderer, and the identical calls now run upon the card. No new grammar to learn, no game to rewrite. A single word.' },
      { t: 'code', code: "const f = Fruta({ renderer: 'webgl' })\nf.loop(() => {\n  f.background('#0a0b12')\n  f.circles(xs, ys, 3, '#ffd24a')\n})" },
      { t: 'p', s: 'What followed was not an improvement so much as a different order of thing entirely. The self-same fifty thousand particles that had choked the processor at twelve frames now flew at a hundred and ten upon the card, nine times the throughput, wrung from the very same picture, and not one line of the game changed to get it.' },
      { t: 'h', s: 'How Far the Machine Will Go' },
      { t: 'chart', kind: 'line', h: 240, max: 130, caption: 'FIG. 2. WebGL frames per second at fifty, one hundred, and two hundred thousand particles.',
        series: [{ name: 'WebGL', data: [110, 65, 40] }] },
      { t: 'p', s: 'The card keeps a headroom the processor never once had. A hundred thousand particles hold a comfortable sixty to seventy; two hundred thousand remain entirely playable. What grows now is not the count but the overdraw, translucent pixels heaped upon translucent pixels, and a tighter blend, or a smaller sprite, buys those frames straight back again.' },
      { t: 'h', s: 'The Rule of Thumb' },
      { t: 'p', s: 'And so the wisdom bought that week is a simple one. Hundreds to a few thousand shapes belong upon Canvas, where the batched call hands you the ceiling for nothing at all. Tens of thousands and beyond, whether particle storms, bullet hell or marching swarms, belong upon the card. The sugar is precisely the same on either road. You change a single word, and never once your code.' },
    ],
    sources: [
      { label: 'fruta on npm: v0.1.5, zero dependencies, TypeScript', url: 'https://www.npmjs.com/package/fruta' },
      { label: 'Source and the WebGL benchmark demos, to run yourself', url: 'https://github.com/karttofer/Fruta' },
    ],
  },
  {
    kicker: 'ON DESIGN', title: 'The Ceremony Tax: What a Friendly API Actually Saves', date: 'JULY 3, 2026',
    deck: 'A pleasant library is easily praised and hard to prove. So we set fruta’s friendliness down as a claim to be tested, and counted, statement by statement, exactly what it spares you.',
    blocks: [
      { t: 'p', s: 'It is an easy thing to call a library "friendly" and a hard thing to demonstrate it. Praise proves nothing. So rather than admire fruta’s manner, we resolved to test it as one tests any claim: to state it precisely, contrive an experiment that could refute it, and count a quantity a reader may check for himself. The claim under trial was this. That naming what you WANT, rather than how the canvas draws it, cuts the work you do, and costs you no power in the cutting.' },
      { t: 'h', s: 'The Ritual of the Bare Canvas' },
      { t: 'p', s: 'First, the thing to be measured. The bare Canvas is a machine of ceremony. To set down a single filled circle one must begin a path, arc it through its full turn, choose a fill, fill it, and commonly save and restore the surrounding state. Five separate acts of book-keeping in the service of one plain intent. It is not that the power is lacking; it is that the ritual stands between you and it, and must be performed in full, every time, by hand.' },
      { t: 'h', s: 'The Experiment' },
      { t: 'p', s: 'Our method was deliberately dull, that it might be repeated. We took three ordinary tasks (a filled circle that follows the pointer, a rectangle turned a few degrees, a line of text centred upon the screen) and wrote each of them twice over: once in raw Canvas, and once in fruta. Then we counted the statements a person must actually type to make the picture appear. The pictures, we confirmed, were identical.' },
      { t: 'chart', kind: 'bar', h: 230, caption: 'FIG. 1. Statements in the idiomatic code for the three tasks (a pointer-following circle, a rotated rectangle, centred text): the bare Canvas against fruta. Count them yourself. The fruta side is printed just below; the Canvas side is the ordinary begin-path and save-restore form.',
        datums: [{ label: 'Bare Canvas', value: 14 }, { label: 'fruta', value: 3 }] },
      { t: 'p', s: 'The count leaves little room for argument. Where the bare Canvas asked for fourteen statements across the three tasks (begin-path and arc, save and translate and rotate, font and text-align, each set by hand) fruta asked for three, a single call to a task, naming only the shape and the options beside it. Four parts of the ceremony in five, near enough, simply gone, and not one pixel of the result gone with them.' },
      { t: 'h', s: 'And No Power Surrendered' },
      { t: 'p', s: 'A saving that cost you the ceiling would be no saving at all, so we tested that flank too. Ask for the WebGL renderer and those very same three statements run upon the graphics card, batched, with no new grammar learned. And the raw context is never sealed away. It waits one property along, at f.context, for the hour you truly want the metal in your hands. The friendliness is a floor you may always step below, not a wall.' },
      { t: 'code', code: "const f = Fruta({ width: 500, height: 500 }).mount()\nf.loop((dt, t) => {\n  f.circle({ x: f.mouse.x, y: f.mouse.y, r: 24, fill: 'tomato' })\n})" },
      { t: 'h', s: 'The Conclusion' },
      { t: 'p', s: 'The claim, then, survives its trial, and does so by number rather than by charm: fewer statements, fewer things to hold in the head, no loss of power, and a second engine granted for free. A low learning curve is revealed here not as a softness but as a measured result. The ritual struck out, the intent kept whole, TypeScript writing half the rest for you, at some forty kilobytes gzipped and not one dependency.' },
    ],
    sources: [
      { label: 'fruta on npm: size, zero dependencies, types bundled', url: 'https://www.npmjs.com/package/fruta' },
      { label: 'The API these examples use: fruta source and README', url: 'https://github.com/karttofer/Fruta' },
    ],
  },
  {
    kicker: 'ON GAMES', title: 'Can Forty Kilobytes Hold a Whole Game Engine?', date: 'JULY 3, 2026',
    deck: 'It is fashionable to call any drawing library a "game engine". We put the phrase on trial for fruta, by inventory and by weight, judged it fairly against two admired veterans, and came away holding that it is a genuinely strong choice for the games it is built for.',
    blocks: [
      { t: 'p', s: 'The phrase "game engine" is applied so freely that it has nearly ceased to mean anything, and we were unwilling to claim it for fruta without proof. So we framed the matter as a question that could be answered wrongly, which is the only kind worth asking. Can a library that installs in the tens of kilobytes truly carry the machinery a real 2D game leans upon, or is weight simply the toll one must always pay for capability?' },
      { t: 'h', s: 'A Word on the Company We Keep' },
      { t: 'p', s: 'Two names arise at once, and fairness asks that we place them correctly. PixiJS is first of all a renderer, and a formidable one, with a depth of text, filters, meshes and a modern WebGPU pipeline that fruta does not pretend to match. Phaser is a complete and long-proven game framework, tightly integrated and battle-tested across thousands of shipped titles. Neither is a heap of parts bolted together. When we speak of built-in beating bolted-on below, the bolted-on route we mean is the do-it-yourself one: a draw library here, a physics package there, a particle plugin beside it, each a stranger to the rest. That assembly is what fruta was built to spare you, not these two engines.' },
      { t: 'h', s: 'The Inventory' },
      { t: 'p', s: 'With the company placed, we tested fruta by census. We drew up the list a survivors-like or a bullet hell genuinely requires, and marked each item present and tested. Collision that not only detects but resolves, across rectangles, circles, a swept tile solver and an impulse world. Tilemaps with arcade physics and a grounded flag. Retained entities the engine moves for you. Scenes with fades. A camera that follows, clamps, shakes and zooms. Particle bursts and emitters. Pathfinding by A-star and by flow field. And, for the crowds, pools, generational handles and a spatial grid for the broadphase. Nothing on the list came back missing.' },
      { t: 'code', code: "map.move(player, dt)          // resolves vs tiles\nf.camera.follow(player)\nf.overlap(bullets, foes, hit)\nf.drawParticles()" },
      { t: 'h', s: 'The Weight' },
      { t: 'p', s: 'Then we weighed the three, not by opinion but by the figure a bundler prints without prejudice: the minified, gzipped size a visitor must fetch before a single frame can draw. fruta’s own we measured from its published package; the other two we took from an independent bundle-measurer, in their current editions. We set the three side by side and named every source, so that any reader may check the sum.' },
      { t: 'chart', kind: 'bar', h: 250, max: 390, caption: 'FIG. 1. Minified and gzipped delivery size, in kilobytes. PixiJS 8.19 and Phaser 4.2 as measured by bundlephobia.com; fruta 0.1.5 from its published npm bundle. Every source is linked below, so you may check it.',
        datums: [{ label: 'fruta', value: 42 }, { label: 'Pixi', value: 245 }, { label: 'Phaser', value: 347 }] },
      { t: 'p', s: 'fruta arrives at some forty-two kilobytes, a hundred and twenty-four before it is compressed, where the veterans arrive in the hundreds. But the honest reading of that gap is not that they are heavy and fruta is virtuous. Their size buys what fruta has not: years of hardening, a far broader rendering depth, a full WebGPU pipeline, and the confidence of countless shipped games. A part of their weight is simply reach, and reach fruta has not yet attempted. All three, moreover, can be pared by importing only what one uses. What the number does show is narrower, and still worth saying. A young and focused kit, built as a single piece, can carry a real game’s machinery in a remarkably small space.' },
      { t: 'h', s: 'The Conclusion' },
      { t: 'p', s: 'So the phrase survives its trial, and the verdict, while fair to the veterans, need not be a shy one. fruta is young, alpha, and plain about it, and it will not unseat Pixi’s rendering depth nor Phaser’s years of hardening. But for a great many real projects we hold that it is the better tool in hand: a game jam with a size budget, a game embedded in a page that must load at once, a prototype you want running this afternoon, a beginner meeting their first loop. There fruta wins on merits that can actually be measured. Some forty kilobytes and not one dependency. A single friendly object with a genuinely low learning curve. TypeScript from the first line. And one unchanged API that carries you from Canvas to the graphics card without a rewrite, with physics, tilemaps, entities, particles, cameras and pathfinding already in the box. Byte for byte, we judge fruta not a curiosity of small size but a genuinely good way to build a 2D game, and for the projects that value what it values, a first choice rather than a fallback.' },
    ],
    sources: [
      { label: 'PixiJS 8.19 minified plus gzipped size, on bundlephobia', url: 'https://bundlephobia.com/package/pixi.js' },
      { label: 'Phaser 4.2 minified plus gzipped size, on bundlephobia', url: 'https://bundlephobia.com/package/phaser' },
      { label: 'fruta on npm: v0.1.5, zero dependencies, size measured from its bundle', url: 'https://www.npmjs.com/package/fruta' },
    ],
  },
]

export function paintArticles(el: HTMLElement): Instance {
  ensureFonts()
  let f: any = null, alive = true, view = -1, scroll = 0, contentH = 0, enter = 0
  let down = false, dragY0 = 0, scroll0 = 0, moved = false
  const navMenu = { open: false }
  let navHits: NavHit[] = [], hits: { x: number; y: number; w: number; h: number; fn: () => void; id?: string }[] = []

  const go = (to: string, ext?: boolean) => { if (ext) { window.open(to, '_blank', 'noopener'); return } const a = document.createElement('a'); a.href = to; document.body.appendChild(a); a.click(); a.remove() }
  const open = (i: number) => { view = i; scroll = 0; enter = 0 }
  const home = () => { view = -1; scroll = 0; enter = 0 }

  const build = () => {
    if (f) f.destroy()
    const W = Math.max(340, window.innerWidth), H = Math.max(480, window.innerHeight)
    f = Fruta({ width: W, height: H, mount: el, dpr: true })
    if (f.canvas) f.canvas.style.cssText = 'display:block; width:100vw; height:100vh'
    const cx: CanvasRenderingContext2D = f.context, S = Math.min(W, H), navH = navHeight(S), narrow = W < 680
    const M = Math.max(12, Math.round(W * 0.02)), cW = Math.min(1320, W - M * 2), x0 = (W - cW) / 2   // near-full-width band
    const motes = Array.from({ length: 38 }, () => ({ x: Math.random() * W, y: Math.random() * H, r: 0.5 + Math.random() * 1.8, vx: Math.random() * 8 - 4, vy: -3 - Math.random() * 7, ph: Math.random() * TAU }))
    const barTop = navH + (view >= 0 ? Math.max(38, S * 0.05) : 0)
    let hoverId = ''   // which interactive region the pointer sat over last frame → drives the hover highlight
    const clampScroll = () => { scroll = Math.max(0, Math.min(scroll, Math.max(0, contentH - (H - barTop) + 60))) }

    const setFont = (size: number, weight: string, font: string, ls = 0) => { cx.font = weight + ' ' + size + 'px ' + font; try { (cx as any).letterSpacing = ls + 'px' } catch { /* older browsers */ } }
    const txt = (s: string, x: number, y: number, size: number, col: string, weight = '400', align: CanvasTextAlign = 'left', font = SERIF, italic = false, ls = 0) => { cx.save(); setFont(size, (italic ? 'italic ' : '') + weight, font, ls); cx.textAlign = align; cx.textBaseline = 'alphabetic'; cx.fillStyle = col; cx.fillText(s, x, y); cx.restore() }
    const meas = (s: string, size: number, weight: string, font: string) => { cx.save(); setFont(size, weight, font); const w = cx.measureText(s).width; cx.restore(); return w }
    const rule = (x: number, y: number, w: number, th = 1.3, col = RULE) => f.rect({ x, y, w, h: th, fill: col })
    const dbl = (x: number, y: number, w: number) => { rule(x, y, w, 2.6); rule(x, y + 5, w, 1) }
    const wrapW = (s: string, maxW: number, size: number, weight: string, font: string) => {
      cx.save(); setFont(size, weight, font); const words = s.split(' '), out: { w: string[]; last: boolean }[] = []; let line: string[] = []
      for (const w of words) { if (line.length && cx.measureText([...line, w].join(' ')).width > maxW) { out.push({ w: line, last: false }); line = [w] } else line.push(w) }
      if (line.length) out.push({ w: line, last: true }); cx.restore(); return out
    }
    const drawLine = (words: string[], last: boolean, x: number, y: number, targetW: number, size: number, weight: string, col: string, font = SERIF, indent = 0) => {
      cx.save(); setFont(size, weight, font); cx.textAlign = 'left'; cx.textBaseline = 'alphabetic'; cx.fillStyle = col
      const nat = cx.measureText(words.join(' ')).width + indent, extra = targetW - nat, sp = cx.measureText(' ').width
      if (last || words.length < 2 || extra <= 0 || extra > targetW * 0.4) cx.fillText(words.join(' '), x + indent, y)
      else { let tx = x + indent; const add = extra / (words.length - 1); for (const w of words) { cx.fillText(w, tx, y); tx += cx.measureText(w).width + sp + add } }
      cx.restore()
    }
    const texture = () => {
      f.rect({ x: 0, y: 0, w: W, h: H, fill: f.linearGradient(0, 0, 0, H, [[0, PAPER], [0.5, '#ebe1c7'], [1, '#ddd1b1']]) })
      cx.save(); cx.globalAlpha = 0.045; for (let y = 6; y < H; y += 17) for (let x = ((y / 17) | 0) % 2 * 8.5; x < W; x += 17) f.circle({ x, y, r: 1.5, fill: INK }); cx.restore()
      f.rect({ x: 0, y: 0, w: W, h: H, fill: f.radialGradient(W / 2, H / 2, Math.max(W, H) * 0.74, [[0.62, 'rgba(0,0,0,0)'], [1, 'rgba(55,40,15,0.15)']]) })
    }

    // an ANIMATED ink engraving — the living-newspaper "photo". Monochrome, halftoned, framed like an old plate.
    const engraving = (kind: string, ex: number, ey: number, ew: number, eh: number, tt: number) => {
      f.rect({ x: ex, y: ey, w: ew, h: eh, fill: '#e1d6ba', stroke: INK, strokeWidth: 2 })
      f.rect({ x: ex + 3, y: ey + 3, w: ew - 6, h: eh - 6, fill: 'rgba(0,0,0,0)', stroke: INK, strokeWidth: 0.7 })
      cx.save(); cx.beginPath(); cx.rect(ex + 4, ey + 4, ew - 8, eh - 8); cx.clip()
      const ccx = ex + ew / 2, ccy = ey + eh / 2, R = Math.min(ew, eh) * 0.34
      cx.globalAlpha = 0.05; for (let yy = ey + 6; yy < ey + eh; yy += 6) for (let xx = ex + 6 + ((yy / 6 | 0) % 2) * 3; xx < ex + ew; xx += 6) f.circle({ x: xx, y: yy, r: 1.1, fill: INK }); cx.globalAlpha = 1
      if (kind === 'swarm') {
        for (let i = 0; i < 9; i++) { const a = i / 9 * TAU; f.line({ x1: ccx + Math.cos(a) * R * 0.4, y1: ccy + Math.sin(a) * R * 0.4, x2: ccx + Math.cos(a) * R * 1.7, y2: ccy + Math.sin(a) * R * 1.7, stroke: 'rgba(32,27,18,0.22)', strokeWidth: 1 }) }
        for (let i = 0; i < 46; i++) { const a = tt * 0.9 + i * 0.62, rr = R * (0.32 + (i % 6) / 6 * 1.0); f.circle({ x: ccx + Math.cos(a) * rr * 1.35, y: ccy + Math.sin(a) * rr * 0.82, r: 1.5 + (i % 3) * 0.7, fill: INK }) }
        f.circle({ x: ccx, y: ccy, r: 4, fill: INK })
      } else if (kind === 'morph') {
        const m = 0.5 + 0.5 * Math.sin(tt * 1.2), N = 44, pts = []
        for (let i = 0; i < N; i++) { const a = i / N * TAU, c = Math.cos(a), s = Math.sin(a), sq = 1 / Math.max(Math.abs(c), Math.abs(s)), rr = R * ((1 - m) + sq * m); pts.push({ x: ccx + c * rr, y: ccy + s * rr }) }
        f.polygon({ points: pts, fill: 'rgba(0,0,0,0)', stroke: INK, strokeWidth: 2.6 })
        f.polygon({ points: pts.map((p) => ({ x: ccx + (p.x - ccx) * 0.58, y: ccy + (p.y - ccy) * 0.58 })), fill: 'rgba(0,0,0,0)', stroke: INK, strokeWidth: 1 })
        f.circle({ x: ccx, y: ccy, r: 3.2, fill: INK })
      } else {
        const gear = (gx: number, gy: number, rr: number, teeth: number, rot: number) => { const p = []; for (let i = 0; i < teeth * 2; i++) { const a = rot + i * Math.PI / teeth, rad = i % 2 ? rr : rr * 1.3; p.push({ x: gx + Math.cos(a) * rad, y: gy + Math.sin(a) * rad }) } f.polygon({ points: p, fill: 'rgba(0,0,0,0)', stroke: INK, strokeWidth: 2 }); f.circle({ x: gx, y: gy, r: rr * 0.34, fill: 'rgba(0,0,0,0)', stroke: INK, strokeWidth: 1.4 }) }
        gear(ccx - R * 0.55, ccy, R * 0.72, 9, tt * 1.1); gear(ccx + R * 0.72, ccy - R * 0.12, R * 0.52, 7, -tt * 1.1 * 9 / 7 + 0.35)
      }
      cx.restore()
    }

    f.onPress((p: { x: number; y: number }) => { down = true; dragY0 = p.y; scroll0 = scroll; moved = false })
    f.onRelease((p: { x: number; y: number }) => {
      if (!moved) { const nb = navHits.find((r) => p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h); if (nb) { nb.fn(); down = false; return } const h = hits.find((r) => p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h); if (h) h.fn() }
      down = false
    })

    // one front-page story column → returns its bottom y
    const drawStory = (a: Article, idx: number, sx: number, sy: number, sw: number, lead: boolean, tt: number) => {
      let cyy = sy
      txt(a.kicker, sx, cyy, Math.max(11, S * 0.0135), RED, '800'); cyy += 7; rule(sx, cyy, sw, 1); cyy += Math.max(16, S * 0.024)
      const hlS = lead ? Math.max(26, Math.round(S * 0.04)) : Math.max(19, Math.round(S * 0.027))
      for (const ln of wrapW(a.title, sw, hlS, '800', FONT.display)) { txt(ln.w.join(' '), sx, cyy + hlS * 0.8, hlS, INK, '800', 'left', FONT.display); cyy += hlS * 1.03 }
      cyy += 8
      const egH = Math.round(sw * (lead ? 0.5 : 0.6)); engraving(ENG[idx % 3], sx, cyy, sw, egH, tt); cyy += egH + 3
      txt('AN ARTIST’S IMPRESSION', sx, cyy + Math.max(10, S * 0.013), Math.max(9, S * 0.0108), FADE, '700'); cyy += Math.max(16, S * 0.022)
      if (lead) { const dS = Math.max(15, S * 0.02); for (const ln of wrapW(a.deck, sw, dS, '400', SERIF)) { txt(ln.w.join(' '), sx, cyy + dS, dS, '#463d2c', '400', 'left', SERIF, true); cyy += dS * 1.32 } cyy += 8; rule(sx, cyy, sw, 1); cyy += 12 }
      const teaser = (a.blocks.find((b) => b.t === 'p') as any)?.s ?? ''
      const bs = Math.max(13, Math.round(S * 0.0155)), lh = bs * 1.5
      const tl = wrapW(teaser, sw, bs, '400', SERIF), maxL = lead ? tl.length : Math.min(tl.length, 9)
      for (let i = 0; i < maxL; i++) { cyy += lh; drawLine(tl[i].w, tl[i].last || i === maxL - 1, sx, cyy, sw, bs, '400', INK) }
      cyy += lh * 0.7
      const hot = hoverId === 's' + idx, rS = Math.max(11, S * 0.014), rL = hot ? '»  READ THE FULL STORY  →' : '»  READ THE FULL STORY'
      txt(rL, sx, cyy, rS, RED, '800'); if (hot) rule(sx, cyy + 5, meas(rL, rS, '800', SERIF), 1.4, RED)
      cyy += Math.max(18, S * 0.026)
      if (hot) f.rect({ x: sx - Math.max(11, S * 0.016), y: sy - 4, w: Math.max(3, S * 0.004), h: cyy - sy - Math.max(10, S * 0.014), fill: RED })   // left accent marks the hovered story
      hits.push({ x: sx - 8, y: sy - 8, w: sw + 16, h: cyy - sy, fn: () => open(idx), id: 's' + idx })
      return cyy
    }

    f.loop((dt: number, t: number) => {
      enter = Math.min(1, enter + dt * 2.4)
      if (f.mouseDown && down) { const dy = f.mouse.y - dragY0; if (Math.abs(dy) > 6) moved = true; scroll = scroll0 - dy; clampScroll() }
      const mx = f.mouse.x, my = f.mouse.y
      hoverId = hits.find((r) => r.id && mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h)?.id ?? ''
      hits = []
      texture()
      const startY = barTop + Math.max(22, S * 0.036)

      cx.save(); cx.beginPath(); cx.rect(0, barTop, W, H - barTop); cx.clip(); cx.globalAlpha = enter
      let y = startY - scroll

      // ── shared masthead (full width) ──
      const mast = Math.max(38, Math.round(S * 0.066))
      dbl(x0, y, cW); y += 12
      const bxW = Math.min(cW * 0.16, 150), bxH = mast * 1.05
      f.rect({ x: x0, y: y - 2, w: bxW, h: bxH, fill: 'rgba(0,0,0,0)', stroke: RULE, strokeWidth: 1.2 })
      txt('PRICE 5¢', x0 + bxW / 2, y + bxH * 0.42, Math.max(11, S * 0.014), INK, '700', 'center'); txt('40 PAGES', x0 + bxW / 2, y + bxH * 0.78, Math.max(10, S * 0.012), FADE, '600', 'center')
      f.rect({ x: x0 + cW - bxW, y: y - 2, w: bxW, h: bxH, fill: 'rgba(0,0,0,0)', stroke: RULE, strokeWidth: 1.2 })
      txt('WEATHER', x0 + cW - bxW / 2, y + bxH * 0.42, Math.max(11, S * 0.014), INK, '700', 'center'); txt('fair · 14°', x0 + cW - bxW / 2, y + bxH * 0.78, Math.max(10, S * 0.012), FADE, '600', 'center')
      txt('The Fruta Times', W / 2, y + mast * 0.86, mast, INK, '800', 'center', FONT.display, false, 2); y += bxH + 6
      dbl(x0, y, cW); y += Math.max(15, S * 0.02)
      txt('No. ' + (ARTICLES.length + 230), x0, y, Math.max(11, S * 0.0135), FADE, '700')
      txt('FRIDAY, JULY 3RD, 2026', W / 2, y, Math.max(11, S * 0.0135), INK, '700', 'center')
      txt('OPEN SOURCE EDITION', x0 + cW, y, Math.max(11, S * 0.0135), FADE, '700', 'right')
      y += 10; rule(x0, y, cW, 2.4); y += Math.max(22, S * 0.032)

      if (view < 0) {
        // ══ FRONT PAGE — full-width banner + 3-column story grid ══
        txt('SENSATION: THE ENGINE HAS BROKEN 100,000', W / 2, y + Math.max(17, S * 0.023), Math.max(15, S * 0.02), INK, '800', 'center', FONT.display, true); y += Math.max(28, S * 0.042)
        rule(x0, y, cW, 1.6); y += Math.max(22, S * 0.032)
        const top = y
        let bottom = y
        if (narrow) {
          ARTICLES.forEach((a, i) => { bottom = drawStory(a, i, x0, y, cW, i === 0, t); y = bottom; rule(x0, y, cW, i < ARTICLES.length - 1 ? 2 : 1.4); y += Math.max(18, S * 0.026) })
        } else {
          const gap = Math.max(20, S * 0.028), avail = cW - gap * 2
          const lw = Math.round(avail * 0.27), ctrW = Math.round(avail * 0.46), rw = avail - lw - ctrW
          const lx = x0, cxc = lx + lw + gap, rx = cxc + ctrW + gap
          const bL = drawStory(ARTICLES[1] ?? ARTICLES[0], 1, lx, top, lw, false, t)
          const bC = drawStory(ARTICLES[0], 0, cxc, top, ctrW, true, t)
          const bR = drawStory(ARTICLES[2] ?? ARTICLES[0], 2, rx, top, rw, false, t)
          bottom = Math.max(bL, bC, bR)
          rule(lx + lw + gap / 2, top - 4, 1, bottom - top + 4); rule(cxc + ctrW + gap / 2, top - 4, 1, bottom - top + 4)
          y = bottom + Math.max(14, S * 0.02)
        }
        rule(x0, y, cW, 2); y += 22
        txt('· MORE DISPATCHES IN THE NEXT EDITION ·', W / 2, y, Math.max(12, S * 0.016), FADE, '700', 'center', SERIF, true); y += 34
      } else {
        // ══ STORY PAGE — headline + drop-cap lede + multi-column justified body + FIG plates ══
        const a = ARTICLES[view]
        const kS = Math.max(12, S * 0.016); txt(a.kicker, x0, y + kS, kS, RED, '800'); y += kS + Math.max(18, S * 0.028)
        const hlS = Math.max(30, Math.round(S * 0.05)); for (const ln of wrapW(a.title, cW, hlS, '800', FONT.display)) { txt(ln.w.join(' '), x0, y + hlS * 0.82, hlS, INK, '800', 'left', FONT.display); y += hlS * 1.06 }
        y += Math.max(20, S * 0.026)
        const byS = Math.max(13, S * 0.017); txt('By The Fruta Times    ·    ' + a.date, x0, y + byS, byS, FADE, '700'); y += byS + Math.max(20, S * 0.028)
        dbl(x0, y, cW); y += Math.max(22, S * 0.034)

        // the story's living plate
        const egW = Math.min(cW, Math.max(340, S * 0.5)), egH = Math.round(egW * 0.42), egX = x0 + (cW - egW) / 2
        engraving(ENG[view % 3], egX, y, egW, egH, t); y += egH + 4
        txt('FIG. · AN ARTIST’S IMPRESSION OF THE SUBJECT', egX, y + Math.max(12, S * 0.015), Math.max(11, S * 0.014), FADE, '700', 'left', SERIF, true); y += Math.max(22, S * 0.03)

        const bs = Math.max(15, Math.round(S * 0.019)), lh = bs * 1.58, headS = Math.max(18, Math.round(S * 0.026))
        const cols = narrow ? 1 : 2, gap = Math.max(32, S * 0.042), cw = (cW - gap * (cols - 1)) / cols

        // lede — full width, justified, drop cap
        const lede = a.blocks[0] as any
        const capS = bs * 3, capW = meas(lede.s[0], capS, '800', FONT.display) + 8
        txt(lede.s[0], x0, y + capS * 0.82, capS, INK, '800', 'left', FONT.display)
        wrapW(lede.s.slice(1), cW, bs, '400', SERIF).forEach((ln, li) => { y += lh; drawLine(ln.w, ln.last, li < 2 ? x0 + capW : x0, y, li < 2 ? cW - capW : cW, bs, '400', INK, SERIF) })
        y += lh * 0.7

        // Body structure = a real newspaper. Sub-heads and figures span the FULL width and act as dividers; the
        // paragraphs between them flow as equal, TOP-ALIGNED columns (read a column down, then the next one). No
        // heading ever lives inside a single column, so every column block starts on the same line — nothing ragged.
        type Ln = { w: string[]; last: boolean } | 'gap'
        let body: Ln[] = []
        const flushBody = () => {
          if (!body.length) return
          const per = Math.ceil(body.length / cols); let bottom = y
          for (let c = 0; c < cols; c++) {
            let cy = y; const cxx = x0 + c * (cw + gap)
            for (let i = c * per; i < Math.min((c + 1) * per, body.length); i++) { const it = body[i]; if (it === 'gap') { cy += lh * 0.5; continue } cy += lh; drawLine(it.w, it.last, cxx, cy, cw, bs, '400', INK, SERIF) }
            if (c < cols - 1) rule(x0 + (c + 1) * (cw + gap) - gap / 2, y + 4, 1, Math.max(0, cy - y - lh * 0.3))
            bottom = Math.max(bottom, cy)
          }
          y = bottom + lh * 0.7; body = []
        }
        for (let bi = 1; bi < a.blocks.length; bi++) {
          const b = a.blocks[bi]
          if (b.t === 'p') { wrapW(b.s, cw, bs, '400', SERIF).forEach((ln) => body.push({ w: ln.w, last: ln.last })); body.push('gap'); continue }
          flushBody()
          if (b.t === 'h') { y += headS * 0.95; txt(b.s, x0, y + headS * 0.82, headS, INK, '800', 'left', FONT.display); y += headS * 1.08; rule(x0, y, cW, 1.6); y += headS * 0.8; continue }
          if (b.t === 'chart') {
            const chH = Math.round((b.h ?? 240) * (bs / 16)); y += bs * 0.9
            const chW = Math.min(cW, Math.max(360, S * 0.6)), cX = x0 + (cW - chW) / 2
            f.rect({ x: cX, y, w: chW, h: chH, radius: 3, fill: FIG, stroke: INK, strokeWidth: 2 })
            const pd = Math.round(chH * 0.11)
            cx.save(); cx.beginPath(); cx.rect(cX, y, chW, chH); cx.clip()
            if (b.kind === 'bar') f.barChart({ x: cX + pd, y: y + pd, w: chW - pd * 2, h: chH - pd * 2, data: b.datums as never, max: b.max, showValues: true, progress: 1 })
            else f.lineChart({ x: cX + pd, y: y + pd, w: chW - pd * 2, h: chH - pd * 2, series: b.series, max: b.max, grid: true, points: true, progress: 1 })
            cx.restore()
            y += chH; const capS = Math.max(12, Math.round(S * 0.015))   // baseline-aware: advance BEFORE drawing so the caption never rides up into the plate
            for (const ln of wrapW(b.caption, chW, capS, '700', SERIF)) { y += capS * 1.4; txt(ln.w.join(' '), cX, y, capS, FADE, '700', 'left', SERIF, true) }
            y += bs * 1.7
          } else if (b.t === 'code') {
            const lines = b.code.split('\n'), cs = Math.max(12, Math.round(bs * 0.9)), clh = cs * 1.5, boxH = lines.length * clh + cs * 2
            const bw = Math.min(cW, Math.max(360, S * 0.6)), bX = x0 + (cW - bw) / 2; y += bs * 0.9
            f.rect({ x: bX, y, w: bw, h: boxH, radius: 4, fill: FIG, stroke: RULE, strokeWidth: 1 })
            cx.save(); setFont(cs, '500', FONT.mono); cx.textBaseline = 'alphabetic'; cx.fillStyle = '#d7cdb6'; let ly = y + cs * 1.6; for (const ln of lines) { cx.fillText(ln, bX + cs, ly); ly += clh } cx.restore()
            y += boxH + bs * 0.9
          }
        }
        flushBody()
        // SOURCES — real, tappable links. Every factual figure above traces to one of these; the URL is printed
        // in full so it can be checked even from a screenshot, and each row opens the page in a new tab.
        if (a.sources?.length) {
          y += Math.max(18, S * 0.024); dbl(x0, y, cW); y += Math.max(22, S * 0.03)
          txt('SOURCES · TAP ANY LINK TO CHECK IT YOURSELF', x0, y + Math.max(12, S * 0.015), Math.max(12, S * 0.015), FADE, '800'); y += Math.max(26, S * 0.036)
          const lS = Math.max(13, S * 0.017), uS = Math.max(11, S * 0.0135), ind = Math.max(16, S * 0.022)
          a.sources.forEach((s, si) => {
            const top = y, shot = hoverId === 'src' + si
            txt('›  ' + s.label, x0, y + lS, lS, INK, '700'); y += lS * 1.32
            const uw = meas(s.url, uS, '600', FONT.mono); txt(s.url, x0 + ind, y + uS, uS, RED, '600', 'left', FONT.mono)
            if (shot) rule(x0 + ind, y + uS + 3, uw, 1.2, RED)
            y += uS + Math.max(18, S * 0.026)
            hits.push({ x: x0 - 6, y: top - 4, w: cW, h: y - top, fn: () => go(s.url, true), id: 'src' + si })
          })
        }
        y += 16; rule(x0, y, cW, 2); y += 18; txt('· THE END ·', W / 2, y, Math.max(13, S * 0.017), FADE, '800', 'center', SERIF, true); y += 40
      }
      contentH = y + scroll - startY
      cx.restore()

      // floating dust — the page breathes
      cx.save()
      for (const mo of motes) { mo.x += (mo.vx + Math.sin(t * 0.7 + mo.ph) * 4) * dt; mo.y += mo.vy * dt; if (mo.y < -6) { mo.y = H + 6; mo.x = Math.random() * W } if (mo.x < -6) mo.x = W + 6; if (mo.x > W + 6) mo.x = -6; f.circle({ x: mo.x, y: mo.y, r: mo.r, fill: 'rgba(40,32,18,0.2)' }) }
      cx.restore()

      if (contentH > H - barTop) { const vis = H - barTop, th = Math.max(30, vis * vis / contentH), ty = barTop + (scroll / (contentH - vis)) * (vis - th); f.rect({ x: W - 6, y: ty, w: 3, h: th, radius: 2, fill: RED }) }

      if (view >= 0) { const rH = Math.max(38, S * 0.05), rS = Math.max(13, S * 0.017), bHot = hoverId === 'back'; f.rect({ x: 0, y: navH, w: W, h: rH, fill: PAPER }); rule(0, navH + rH - 1, W, 1); const rl = '‹  THE FRONT PAGE', rw = meas(rl, rS, '800', SERIF), ry = navH + rH * 0.66; txt(rl, x0, ry, rS, RED, '800'); if (bHot) rule(x0, ry + 5, rw, 1.4, RED); hits.push({ x: x0 - 8, y: navH, w: rw + 20, h: rH, fn: home, id: 'back' }) }

      navHits = []
      drawNavBar({ f, cx, W, H, S, navH, ink: INK, accent: RED, bg: PAPER, path: typeof location !== 'undefined' ? location.pathname : '', menu: navMenu, hits: navHits, onNav: (to, ext) => go(to, ext) })
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
