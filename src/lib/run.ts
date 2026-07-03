// Run a fruta code STRING into a host element — the single mechanism behind both the examples (the code
// you read is the code that runs) and the playground (your own code). `Fruta` is injected; the canvas
// auto-mounts into the host (mount defaults to el). Previous instances on that host are destroyed first,
// so re-running never leaks a loop.
import Fruta from '../../../../src/core/fruta'

const reg = new WeakMap<HTMLElement, Array<{ destroy(): void }>>()

export function runCode(host: HTMLElement, code: string): void {
  const prev = reg.get(host)
  if (prev) for (const i of prev) { try { i.destroy() } catch { /* ignore */ } }
  host.replaceChildren()
  const created: Array<{ destroy(): void }> = []
  // dpr:true → crisp on retina; the example's own cfg still wins if it sets dpr explicitly.
  const make = (cfg: Record<string, unknown> = {}) => { const i = Fruta({ mount: host, dpr: true, ...cfg }); created.push(i as unknown as { destroy(): void }); return i }
  const F = Object.assign(make, { gl: (cfg: Record<string, unknown> = {}) => { const i = (Fruta as unknown as { gl: (c: Record<string, unknown>) => { destroy(): void } }).gl({ mount: host, ...cfg }); created.push(i); return i } })
  // eslint-disable-next-line no-new-func
  new Function('Fruta', 'el', code)(F, host)
  reg.set(host, created)
}

/** Stop + tear down whatever runCode mounted into a host (used to unmount off-screen doc demos). */
export function stopCode(host: HTMLElement): void {
  const prev = reg.get(host)
  if (prev) for (const i of prev) { try { i.destroy() } catch { /* ignore */ } }
  reg.delete(host)
  host.replaceChildren()
}
