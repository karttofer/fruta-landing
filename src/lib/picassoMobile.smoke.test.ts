// Smoke test for the mobile home. Stubs Fruta + DOM at a phone size and drives: frames, a drag-scroll, a nav
// tap, destroy. Catches runtime throws before the browser. Run: `bun test src/lib/picassoMobile.smoke.test.ts`.
import { mock, test, expect } from 'bun:test'

const grad = { addColorStop: () => {} }
const ctx = new Proxy({ measureText: () => ({ width: 42 }), createRadialGradient: () => grad, createLinearGradient: () => grad } as any, { get: (t, k) => (k in t ? (t as any)[k] : () => {}), set: () => true })
const node = (): any => new Proxy({ style: {} } as any, { get: (t, k) => (k in t ? (t as any)[k] : k === 'isConnected' ? true : () => {}), set: (t, k, v) => { (t as any)[k] = v; return true } })
let loopFn: any = null, pressCb: any = null, releaseCb: any = null
const app: any = new Proxy(
  { mouse: { x: 200, y: 400 }, mouseDown: false, canvas: { style: {} }, context: ctx, loop: (fn: any) => { loopFn = fn; return app }, onPress: (cb: any) => { pressCb = cb; return app }, onRelease: (cb: any) => { releaseCb = cb; return app }, destroy() {} },
  { get: (t, k) => (k in t ? (t as any)[k] : () => app) },
)
;(globalThis as any).window = { innerWidth: 390, innerHeight: 780, addEventListener() {}, removeEventListener() {}, open() {} }
;(globalThis as any).document = { createElement: () => node(), body: node() }

mock.module('../../../../src/core/fruta', () => ({ default: () => app }))

test('mobile home: frames + drag-scroll + nav tap + destroy without throwing', async () => {
  const { paintMobile } = await import('./picassoMobile')
  const el = node()
  const inst = paintMobile(el)
  expect(loopFn).toBeTypeOf('function')

  for (let i = 0; i < 4; i++) loopFn(0.016, i * 0.1)               // build content + contentH
  pressCb({ x: 200, y: 500 }); app.mouseDown = true; app.mouse = { x: 200, y: 420 }   // drag up 80px
  for (let i = 0; i < 4; i++) loopFn(0.016, 0.4 + i * 0.05)        // scroll
  releaseCb({ x: 200, y: 420 }); app.mouseDown = false             // moved → no tap
  pressCb({ x: 200, y: 26 }); releaseCb({ x: 200, y: 26 })         // tap the nav (no drag) → navigate
  inst.destroy()
  expect(true).toBe(true)
})
