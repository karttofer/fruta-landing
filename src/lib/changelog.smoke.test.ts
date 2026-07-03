// Verifies the Persona-5 changelog is responsive + scrollable: at a phone size the content is taller than the
// viewport (so the scroll indicator draws), a wheel listener is wired, and it repaints on both widths. Stubs
// Fruta + DOM and spies on the scroll-indicator rect (drawn at x = W-7, w = 4). Run: `bun test src/lib/changelog.smoke.test.ts`.
import { mock, test, expect } from 'bun:test'

let W = 390, H = 780
let indicator = false, wheelFn: any = null, loopFn: any = null
const ctx: any = new Proxy({ measureText: () => ({ width: 24 }) } as any, { get: (t, k) => (k in t ? (t as any)[k] : () => {}), set: () => true })
const node = (): any => new Proxy({ style: {} } as any, {
  get: (t, k) => (k in t ? (t as any)[k] : k === 'addEventListener' ? (ev: string, fn: any) => { if (ev === 'wheel') wheelFn = fn } : () => {}),
  set: (t, k, v) => { (t as any)[k] = v; return true },
})
const app: any = new Proxy(
  {
    canvas: node(), context: ctx, mouse: { x: 5, y: 5 }, mouseDown: false,
    linearGradient: () => ({ addColorStop() {} }),
    rect: (o: any) => { if (o && Math.abs(o.x - (W - 7)) < 1 && o.w === 4) indicator = true },
    loop: (fn: any) => { loopFn = fn; return app },
  },
  { get: (t, k) => (k in t ? (t as any)[k] : () => app) },
)
;(globalThis as any).window = { get innerWidth() { return W }, get innerHeight() { return H }, addEventListener() {}, removeEventListener() {}, open() {} }
;(globalThis as any).document = { createElement: () => node(), body: node() }
;(globalThis as any).location = { pathname: '/changelog' }
mock.module('fruta', () => ({ default: () => app }))

test('changelog paints at phone + desktop, shows a scroll indicator (content > viewport), wires wheel', async () => {
  const { paintChangelog } = await import('./frutaChangelog')

  // phone
  W = 390; H = 780; indicator = false; wheelFn = null; loopFn = null
  const el = node()
  const inst = paintChangelog(el)
  expect(loopFn).toBeTypeOf('function')
  for (let i = 0; i < 8; i++) loopFn(0.016, i * 0.2)
  expect(indicator).toBe(true)                 // v0.1.5 has 12 entries → taller than a phone → scrollable
  expect(wheelFn).toBeTypeOf('function')       // wheel scroll wired
  expect(() => wheelFn({ deltaY: 400, preventDefault() {} })).not.toThrow()
  for (let i = 0; i < 3; i++) loopFn(0.016, 2 + i * 0.2)
  inst.destroy()

  // desktop — repaints clean at a very different width (responsive)
  W = 1440; H = 820; indicator = false
  const el2 = node()
  const inst2 = paintChangelog(el2)
  for (let i = 0; i < 6; i++) loopFn(0.016, i * 0.2)
  expect(indicator).toBe(true)
  inst2.destroy()
})
