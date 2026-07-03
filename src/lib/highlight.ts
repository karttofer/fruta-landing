// TypeScript syntax highlighting for the showcase code panels. Core + the TS grammar only (small), themed
// by the .hljs-* CSS in styles.css. Returns the highlighted inner HTML (escaped) for a <code> element.
import hljs from 'highlight.js/lib/core'
import typescript from 'highlight.js/lib/languages/typescript'

hljs.registerLanguage('typescript', typescript)

export const highlightTS = (code: string): string => hljs.highlight(code, { language: 'typescript' }).value
