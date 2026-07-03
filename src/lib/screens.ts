// One entry the FrutaScreen Custom calls: routes a page name → its fruta painter. Each page is drawn 100% in
// fruta (docs static; examples + playground frame their unavoidable DOM bits — example canvas, textarea).
import { paintDocs } from './frutaDocs'
import { paintExamples } from './frutaExamples'
import { paintPlayground } from './frutaPlayground'
import { paintChangelog } from './frutaChangelog'
import { paintArticles } from './frutaArticles'
import type { Instance } from './frutaPage'

export function paintScreen(el: HTMLElement, name: string): Instance {
  if (name === 'examples') return paintExamples(el)
  if (name === 'playground') return paintPlayground(el)
  if (name === 'changelog') return paintChangelog(el)
  if (name === 'articles') return paintArticles(el)
  return paintDocs(el)
}
