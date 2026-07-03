// Verifies the newspaper Articles page: the front page paints, clicking a headline turns to the story page, and
// that page actually renders its fruta charts (barChart / lineChart) — the drop-cap + chart + code paths. Stubs
// Fruta + DOM, captures onPress/onRelease, spies the chart calls. Run: `bun test src/lib/articles.smoke.test.ts`.
import { mock, test, expect } from 'bun:test'

const W = 1280, H = 820
let bar = 0, line = 0, pressCb: any = null, relCb: any = null, loopFn: any = null
const ctx: any = new Proxy({ measureText: () => ({ width: 40 }) } as any, { get: (t, k) => (k in t ? (t as any)[k] : () => {}), set: () => true })
const node = (): any => new Proxy({ style: {} } as any, { get: (t, k) => (k in t ? (t as any)[k] : () => {}), set: (t, k, v) => { (t as any)[k] = v; return true } })
const app: any = new Proxy(
  {
    canvas: node(), context: ctx, mouse: { x: 5, y: 5 }, mouseDown: false,
    linearGradient: () => ({ addColorStop() {} }), radialGradient: () => ({ addColorStop() {} }),
    barChart: () => { bar++; return app }, lineChart: () => { line++; return app },
    loop: (fn: any) => { loopFn = fn; return app }, onPress: (cb: any) => { pressCb = cb; return app }, onRelease: (cb: any) => { relCb = cb; return app },
  },
  { get: (t, k) => (k in t ? (t as any)[k] : () => app) },
)
;(globalThis as any).window = { innerWidth: W, innerHeight: H, addEventListener() {}, removeEventListener() {}, open() {} }
;(globalThis as any).document = { createElement: () => node(), body: node() }
;(globalThis as any).location = { pathname: '/articles' }
mock.module('fruta', () => ({ default: () => app }))

test('front page paints, a headline opens the story, the story renders its charts', async () => {
  const { paintArticles } = await import('./frutaArticles')
  const inst = paintArticles(node())
  expect(loopFn).toBeTypeOf('function')
  for (let i = 0; i < 4; i++) loopFn(0.016, i * 0.2)      // front page (builds the story hit region)
  bar = 0; line = 0
  pressCb({ x: W / 2, y: 320 }); relCb({ x: W / 2, y: 320 })   // click the lead headline → turn the page
  for (let i = 0; i < 6; i++) loopFn(0.016, 1 + i * 0.2)   // the story page
  expect(bar).toBeGreaterThan(0)                            // FIG. 1 (bar chart) drew
  expect(line).toBeGreaterThan(0)                           // FIG. 2 (line chart) drew
  inst.destroy()
})
