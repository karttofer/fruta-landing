// Ambient type declarations fed to Monaco so the playground autocompletes the fruta API (Fruta(...) and its
// methods) with hover docs. The playground runs code with `Fruta` and `el` injected as globals, so these are
// declared global. Curated to the surface a playground user actually writes — not the full generated .d.ts.
export const FRUTA_DTS = `
type Fill = string | CanvasGradient | CanvasPattern
interface Point { x: number; y: number }

interface FrutaConfig {
  /** Canvas width in px. */ width?: number
  /** Canvas height in px. */ height?: number
  /** Background colour, repainted each frame. */ background?: string
  /** Repaint background each frame (default true). false = trails. */ clear?: boolean
  /** 'canvas' (default) or 'webgl'. */ renderer?: 'canvas' | 'webgl'
  /** Cap frames/second (0 = uncapped). */ fps?: number
  /** Render at devicePixelRatio for crisp HiDPI. */ dpr?: boolean
}

interface RectOptions { x: number; y: number; w: number; h: number; fill?: Fill; stroke?: Fill; strokeWidth?: number; radius?: number; rotation?: number }
interface CircleOptions { x: number; y: number; r: number; fill?: Fill; stroke?: Fill; strokeWidth?: number }
interface EllipseOptions { x: number; y: number; rx: number; ry: number; fill?: Fill; stroke?: Fill; strokeWidth?: number; rotation?: number }
interface LineOptions { x1: number; y1: number; x2: number; y2: number; stroke?: Fill; strokeWidth?: number; cap?: 'butt' | 'round' | 'square' }
interface PolygonOptions { points: Point[]; fill?: Fill; stroke?: Fill; strokeWidth?: number; close?: boolean }
interface NgonOptions { x: number; y: number; r: number; sides: number; rotation?: number; fill?: Fill; stroke?: Fill; strokeWidth?: number }
interface TextOptions { x: number; y: number; fill?: Fill; size?: number; font?: string; align?: 'left' | 'center' | 'right'; baseline?: 'top' | 'middle' | 'bottom' | 'alphabetic'; rotation?: number }
interface SpriteOptions { x: number; y: number; frame?: number; frameW?: number; frameH?: number; cols?: number; rotation?: number; anchor?: Point; flipX?: boolean; scale?: number }
interface PushOptions { x?: number; y?: number; rotate?: number; scale?: number | Point; alpha?: number }
interface BurstOptions { x: number; y: number; count?: number; color?: string | string[]; speed?: number | [number, number]; life?: number; size?: number; gravity?: number }

interface FrutaApp {
  /** The raw Canvas 2D context (escape hatch). */ readonly context: CanvasRenderingContext2D
  /** The underlying <canvas>. */ readonly canvas: HTMLCanvasElement
  /** Pointer position in canvas coords. */ readonly mouse: Point
  /** True while the pointer is held. */ readonly mouseDown: boolean

  /** Add the canvas to the page (defaults to body). */ mount(parent?: HTMLElement): FrutaApp
  /** Run fn every frame. dt = seconds since last frame, t = seconds since start. */ loop(fn: (dt: number, t: number) => void): FrutaApp
  /** Fill the whole canvas with a colour. */ background(color: string): FrutaApp
  /** Clear the canvas. */ clear(): FrutaApp

  /** Draw a rectangle (optionally rounded/rotated). */ rect(o: RectOptions): FrutaApp
  /** Draw a circle. */ circle(o: CircleOptions): FrutaApp
  /** Draw an ellipse. */ ellipse(o: EllipseOptions): FrutaApp
  /** Draw a line. */ line(o: LineOptions): FrutaApp
  /** Draw a polygon from points. */ polygon(o: PolygonOptions): FrutaApp
  /** Draw a regular polygon (triangle, hexagon…). */ ngon(o: NgonOptions): FrutaApp
  /** Draw text. */ text(s: string, o: TextOptions): FrutaApp
  /** Draw a registered image. */ image(name: string, o: { x: number; y: number; w?: number; h?: number; rotation?: number }): FrutaApp
  /** Draw a sprite frame from a loaded sheet. */ sprite(name: string, o: SpriteOptions): FrutaApp

  /** Push a transform (translate/rotate/scale/alpha) onto the stack. */ push(t?: PushOptions): FrutaApp
  /** Pop the last transform. */ pop(): FrutaApp
  /** Make a linear gradient (usable as a fill/stroke). stops: [offset 0..1, color]. */ linearGradient(x1: number, y1: number, x2: number, y2: number, stops: [number, string][]): CanvasGradient
  /** Make a radial gradient (usable as a fill/stroke). stops: [offset 0..1, color]. */ radialGradient(x: number, y: number, r: number, stops: [number, string][], innerRadius?: number): CanvasGradient

  /** Draw an arc / pie slice. start/stop in DEGREES. mode: 'pie'(default) | 'chord' | 'open'. */ arc(o: { x: number; y: number; r: number; start: number; stop: number; mode?: 'pie' | 'chord' | 'open'; fill?: Fill; stroke?: Fill; strokeWidth?: number }): FrutaApp
  /** Begin a custom vertex shape (p5-style): add vertex/curveVertex/bezierVertex, then endShape(). */ beginShape(): FrutaApp
  /** Add a straight vertex to the current shape. */ vertex(x: number, y: number): FrutaApp
  /** Add a smooth (Catmull-Rom) vertex — the curve passes through it. */ curveVertex(x: number, y: number): FrutaApp
  /** Add a cubic-bezier segment through two control points to (x,y). */ bezierVertex(c1x: number, c1y: number, c2x: number, c2y: number, x: number, y: number): FrutaApp
  /** Finish the vertex shape and draw it. */ endShape(o?: { close?: boolean; fill?: Fill; stroke?: Fill; strokeWidth?: number }): FrutaApp

  /** Perlin noise in [0,1] — 1D, 2D or 3D. */ noise(x: number, y?: number, z?: number): number
  /** Seed the noise field so it is repeatable. */ noiseSeed(seed: number): FrutaApp
  /** Fractal (layered) noise. */ fbm(x: number, y?: number, octaves?: number): number
  /** A 2D vector with helpers (add/scale/len/normalize…). */ vec(x?: number, y?: number): any
  /** Build an hsl(a) colour string. */ hsl(h: number, s: number, l: number, a?: number): string

  /** RGBA pixel bytes after loadPixels() (4 per pixel). */ pixels: Uint8ClampedArray
  /** Read the canvas into pixels for image processing. */ loadPixels(): FrutaApp
  /** Write the edited pixels back to the canvas. */ updatePixels(): FrutaApp
  /** Read one pixel's [r,g,b,a]. */ get(x: number, y: number): [number, number, number, number]
  /** Set one pixel (into pixels; call updatePixels to show). */ set(x: number, y: number, color: number[]): FrutaApp
  /** Apply an image filter to the whole canvas. */ filter(type: 'invert' | 'grayscale' | 'threshold' | 'brightness' | 'posterize' | 'blur', amount?: number): FrutaApp

  /** Is a key held? e.g. keyDown('ArrowLeft'). */ keyDown(key: string): boolean
  /** Was a key pressed this frame (one-shot)? */ keyPressed(key: string): boolean
  /** Register a key handler. */ onKey(key: string, fn: () => void): FrutaApp
  /** Normalised movement axis from WASD/arrows: { x, y }. */ axis(): Point
  /** Pointer press handler. */ onPress(fn: (p: Point) => void): FrutaApp
  /** Pointer release handler. */ onRelease(fn: (p: Point) => void): FrutaApp
  /** Click handler. */ onClick(fn: (p: Point) => void): FrutaApp
  /** Pointer move handler. */ onMove(fn: (p: Point) => void): FrutaApp

  /** AABB overlap test. */ hits(a: any, b: any): boolean
  /** Is a point inside a box? */ inside(p: Point, box: any): boolean
  /** Linear interpolation. */ lerp(a: number, b: number, t: number): number
  /** Clamp a value to [min, max]. */ clamp(v: number, min: number, max: number): number
  /** Re-map a value between ranges. */ map(v: number, a1: number, b1: number, a2: number, b2: number): number
  /** Random number in [min, max). */ rand(min?: number, max?: number): number
  /** Distance between two points. */ dist(ax: number, ay: number, bx: number, by: number): number
  /** Angle (radians) from a→b. */ angle(ax: number, ay: number, bx: number, by: number): number

  /** Emit a one-off particle burst. */ burst(o: BurstOptions): FrutaApp
  /** Continuous emitter. */ emit(o: BurstOptions & { rate: number }): FrutaApp
  /** Draw the live particles (call each frame). */ drawParticles(): FrutaApp

  /** Tween properties on a target (numbers + colour strings). */ tween(target: any, o: { to: Record<string, any>; duration?: number; ease?: string; delay?: number; repeat?: number; yoyo?: boolean; onUpdate?: () => void; onComplete?: () => void }): any
  /** Sequence tweens: .to(target, opts) chains; { at } places absolutely. */ timeline(): any
  /** Tween many targets, each offset by 'each' seconds. */ stagger(targets: any[], o: { to: Record<string, any>; duration?: number; ease?: string; each?: number }): any[]
  /** Define a named scene (draw/update). */ scene(name: string, def: { draw?: (f: FrutaApp) => void; enter?: () => void }): FrutaApp
  /** Switch to a scene, optionally with a fade (seconds). */ start(name: string, fadeSeconds?: number): FrutaApp
  /** Add a retained entity the engine moves each frame. */ add(e: any): any
  /** Draw all retained entities. */ drawEntities(): FrutaApp
  /** Run a collision callback for overlapping bodies. */ overlap(a: any, b: any, onHit: (a: any, b: any) => void): FrutaApp
  /** Save a value to localStorage. */ store(key: string, value: any): FrutaApp
  /** Read a saved value. */ stored(key: string, fallback?: any): any
  /** Register images/sheets to load (returns a Promise). */ load(map: Record<string, string>): Promise<void>
  /** Wait, then run fn (seconds). */ after(seconds: number, fn: () => void): FrutaApp
  /** Run fn every N seconds. */ every(seconds: number, fn: () => void): FrutaApp

  /** Play a beep (Web Audio). */ beep(o?: { freq?: number; time?: number; type?: string; volume?: number }): FrutaApp
  /** Draw a live debug overlay. */ debug(): FrutaApp
  /** Watch a value in the debug overlay. */ watch(label: string, value: any): FrutaApp
  /** Tear everything down (listeners, loop). */ destroy(): void

  readonly camera: { follow(t: Point): void; shake(amount?: number, time?: number): void; begin(): void; end(): void }
}

/** Create a Fruta app. In the playground the canvas auto-mounts — no config needed. */
declare function Fruta(config?: FrutaConfig): FrutaApp
declare namespace Fruta { function gl(config?: FrutaConfig): FrutaApp }

/** The host element the playground mounts into (already handled for you). */
declare const el: HTMLElement
`
