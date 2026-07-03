// Smoke test for the full-canvas fruta pages. Stubs Fruta + DOM and drives each screen: frames, a nav press,
// destroy. Catches runtime throws / typos before the browser. Run: `bun test src/lib/screens.smoke.test.ts`.
import { mock, test, expect } from 'bun:test'

const node = (): any => new Proxy({ style: {}, value: '', spellcheck: false } as any, {
  get: (t, k) => (k in t ? (t as any)[k] : k === 'isConnected' ? true : () => {}),
  set: (t, k, v) => { (t as any)[k] = v; return true },
})
const ctx = new Proxy({ measureText: () => ({ width: 42 }) } as any, { get: (t, k) => (k in t ? (t as any)[k] : () => {}), set: () => true })
let loopFn: any = null, pressCb: any = null
const app: any = new Proxy(
  { mouse: { x: 100, y: 100 }, mouseDown: false, canvas: node(), context: ctx, loop: (fn: any) => { loopFn = fn; return app }, onPress: (cb: any) => { pressCb = cb; return app }, destroy() {} },
  { get: (t, k) => (k in t ? (t as any)[k] : () => app) },
)
;(globalThis as any).window = { innerWidth: 1280, innerHeight: 800, addEventListener() {}, removeEventListener() {}, open() {} }
;(globalThis as any).document = { createElement: () => node(), body: node() }
;(globalThis as any).MutationObserver = class { observe() {} disconnect() {} }
try { (globalThis as any).location = { pathname: '/docs' } } catch {}

mock.module('fruta', () => ({ default: () => app, noise: () => 0, hsl: () => '#fff', hsla: () => '#fff' }))

test('docs + examples + playground + changelog + articles paint + nav-press + destroy without throwing', async () => {
  const { paintScreen } = await import('./screens')
  for (const name of ['docs', 'examples', 'playground', 'changelog', 'articles']) {
    const el = node()
    const inst = paintScreen(el, name)
    expect(loopFn).toBeTypeOf('function')
    for (let i = 0; i < 6; i++) loopFn(0.016, i * 0.12)
    if (pressCb) pressCb({ x: 1150, y: 30 })
    inst.destroy()
  }
  expect(true).toBe(true)
})
