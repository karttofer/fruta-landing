// Smoke test for the full-page cubist landing. Canvas can't render headlessly, so we stub Fruta + the DOM and
// drive the loop: 125 frames incl. click-drag painting (pool must stay capped) + a nav press + destroy. Catches
// runtime throws / typos in picasso.ts before it hits the browser. Run: `bun test src/lib/picasso.smoke.test.ts`.
import { mock, test, expect } from 'bun:test'

const grad = { addColorStop: () => {} }
const ctx = new Proxy({ measureText: () => ({ width: 42 }), createRadialGradient: () => grad, createLinearGradient: () => grad } as any, { get: (t, k) => (k in t ? t[k] : () => {}), set: () => true })
let loopFn: ((dt: number, t: number) => void) | null = null
let pressCb: ((p: { x: number; y: number }) => void) | null = null
const app: any = new Proxy(
  { mouse: { x: 100, y: 100 }, mouseDown: false, canvas: { style: {}, clientWidth: 1200 }, context: ctx, loop: (fn: any) => { loopFn = fn; return app }, onPress: (cb: any) => { pressCb = cb; return app }, destroy() {} },
  { get: (t, k) => (k in t ? (t as any)[k] : () => app) },
)

;(globalThis as any).window = { innerWidth: 1200, innerHeight: 800, addEventListener() {}, removeEventListener() {}, open() {} }
;(globalThis as any).document = { createElement: () => ({ href: '', style: {}, appendChild() {}, click() {}, remove() {} }), body: { appendChild() {}, removeChild() {} } }

mock.module('fruta', () => ({ default: () => app }))

test('cubist landing: 125 frames + paint + nav press without throwing', async () => {
  const { paintLanding } = await import('./picasso')
  const el: any = { style: {}, isConnected: true }
  const inst = paintLanding(el)
  expect(loopFn).toBeTypeOf('function')

  for (let i = 0; i < 5; i++) loopFn!(0.016, i * 0.016)            // idle frames (build exhibits)
  pressCb!({ x: 1200 * 0.66, y: 800 * 0.13 })                      // press the top planet-circle → open the curator plaque
  for (let i = 0; i < 4; i++) loopFn!(0.016, 0.2 + i * 0.05)       // draw the plaque (wrap + code box)
  pressCb!({ x: 20, y: 700 })                                      // click empty → close
  app.mouseDown = true; app.mouse = { x: 600, y: 400 }
  for (let i = 0; i < 120; i++) loopFn!(0.016, 1 + i * 0.016)      // painting (pool caps at 160 via shift)
  app.mouseDown = false
  pressCb!({ x: 1150, y: 40 })                                     // press the top-right nav area
  inst.destroy()
  expect(true).toBe(true)
})
