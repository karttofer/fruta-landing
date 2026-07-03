// Google Fonts used across the canvas UI. IMPORTANT: canvas text does NOT trigger a webfont download on its own
// (only DOM text does), so after the <link> in index.html defines the @font-faces we must kick the loads off
// here. The render loops pick the fonts up automatically on the next frame once they're ready.
export const FONT = {
  display: '"Fraunces", Georgia, serif',              // wordmark + headings (characterful serif)
  sans: '"Space Grotesk", system-ui, sans-serif',     // body + UI (geometric grotesk, fits the constructivist art)
  mono: '"JetBrains Mono", ui-monospace, Menlo, monospace', // code
}

const FACES = ['700 1em "Fraunces"', '800 1em "Fraunces"', '900 1em "Fraunces"', '500 1em "Space Grotesk"', '600 1em "Space Grotesk"', '700 1em "Space Grotesk"', '800 1em "Space Grotesk"', '400 1em "JetBrains Mono"', '500 1em "JetBrains Mono"']
export function ensureFonts() {
  try { const d: any = (globalThis as any).document; if (d && d.fonts && d.fonts.load) FACES.forEach((f) => d.fonts.load(f).catch(() => {})) } catch { /* non-DOM (tests) */ }
}
