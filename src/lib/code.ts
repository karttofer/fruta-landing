// Code snippets returned as strings — they contain { } which the muten lexer would treat as interpolation,
// so they live here (a .ts file) and are interpolated into the page as runtime values, never re-lexed.
export const heroCode = (): string => `import Fruta from 'fruta'

const fruta = Fruta({ width: 500, height: 500 }).mount()

fruta.loop((dt, t) => {
  fruta.background('#111')
  fruta.circle({
    x: fruta.mouse.x,
    y: fruta.mouse.y,
    r: 24, fill: 'tomato',
  })
})`

export const installCmd = (): string => 'npm i fruta'

export const loopCode = (): string => `fruta.loop((dt, t) => {
  // dt = seconds since last frame, t = seconds since start
  x += 200 * dt          // 200 px/second on any screen
  fruta.rect({ x, y: 100, w: 40, h: 40, fill: 'deepskyblue' })
})`

export const drawCode = (): string => `fruta.rect({ x, y, w, h, fill, stroke, radius, rotation })
fruta.circle({ x, y, r, fill })
fruta.line({ x1, y1, x2, y2, stroke, strokeWidth, cap })
fruta.polygon({ points: [{ x, y }, ...], fill })
fruta.ngon({ x, y, r, sides, rotation })          // regular polygon
fruta.text('Hi', { x, y, fill, size, align })
fruta.push({ x, y, rotate, scale }); /* ... */ fruta.pop()`

// Keyed accessor for the shadcn <Code> Custom. muten can't pass a use-fn result into a Custom input, so the
// Custom takes a NAME and resolves the raw snippet here (mirrors ExCode's exampleHtml-by-name).
export const codeSnippet = (name: string): string =>
  ({ hero: heroCode(), loop: loopCode(), draw: drawCode(), input: inputCode() } as Record<string, string>)[name] ?? ''

export const inputCode = (): string => `fruta.keyDown('ArrowRight')      // held?
fruta.keyPressed('Space')        // one-shot, this frame only
fruta.axis()                     // { x, y } from WASD + arrows
fruta.mouse                      // { x, y } in canvas coords
fruta.onClick(p => { ... })

const map = fruta.fsm('menu', { menu: {...}, play: {...}, over: {...} })
const jump = fruta.cooldown()    // coyote time / jump buffer`
