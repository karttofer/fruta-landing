// Smoke test for the DOM playground editor. Stubs the DOM + Fruta (no document.head → Monaco resolves null →
// textarea fallback path, which runs starterCode). Ensures build + run + destroy don't throw. Run:
// `bun test src/lib/editor.smoke.test.ts`.
import { mock, test, expect } from 'bun:test'

const ctx = new Proxy({ measureText: () => ({ width: 42 }) } as any, { get: (t, k) => (k in t ? (t as any)[k] : () => {}), set: () => true })
const app: any = new Proxy({ mouse: { x: 0, y: 0 }, mouseDown: false, canvas: { style: {}, dataset: {} }, context: ctx, loop: () => app, onPress: () => app, onRelease: () => app, destroy() {} }, { get: (t, k) => (k in t ? (t as any)[k] : () => app) })

const node = (): any => new Proxy({ style: {}, dataset: {}, checked: true, value: '', childElementCount: 0, clientWidth: 800, clientHeight: 400, firstChild: null } as any, {
  get(t, k) {
    if (k in t) return (t as any)[k]
    if (k === 'querySelector') return () => null
    if (k === 'isConnected') return true
    return () => {}                                            // append/appendChild/addEventListener/onclick(call)/etc.
  },
  set(t, k, v) { (t as any)[k] = v; return true },
})
;(globalThis as any).window = { innerWidth: 1200, innerHeight: 800, addEventListener() {}, removeEventListener() {}, open() {} }
;(globalThis as any).document = { createElement: () => node(), createTextNode: () => node(), body: node() }   // no `head` → Monaco skipped

mock.module('../../../../src/core/fruta', () => ({ default: () => app }))

test('mountEditor: builds the editor, runs the starter, destroys — no throw', async () => {
  const { mountEditor } = await import('./editor')
  const el = node()
  const inst = mountEditor(el)
  await new Promise((r) => setTimeout(r, 5))                   // let loadMonaco().then (resolve null → fallback + run) fire
  inst.destroy()
  expect(true).toBe(true)
})
