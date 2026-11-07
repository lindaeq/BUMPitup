import { loadTranslations, type Translations } from './language'

type TextSource = { original: string; displayed: string }
const textSources = new WeakMap<Text, TextSource>()
const attributeSources = new WeakMap<Element, Map<string, TextSource>>()
const attributes = ['placeholder', 'title', 'aria-label']

function translated(value: string, dictionary: Translations | null): string {
  if (!dictionary) return value
  const match = value.match(/^(\s*)([\s\S]*?)(\s*)$/)
  if (!match) return value
  const key = match[2].replace(/\s+/g, ' ').trim()
  return dictionary[key] ? `${match[1]}${dictionary[key]}${match[3]}` : value
}

export function translateUi(root: HTMLElement, code: string): () => void {
  const dictionary = code === 'en' ? null : loadTranslations(code)
  root.lang = code
  root.dir = code === 'ar' ? 'rtl' : 'ltr'

  const apply = () => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
    let node: Node | null
    while ((node = walker.nextNode())) {
      const text = node as Text
      if (text.parentElement?.closest('.msg, #language, textarea, [contenteditable="true"]')) continue
      const current = text.nodeValue ?? ''
      const prior = textSources.get(text)
      const original = prior && current === prior.displayed ? prior.original : current
      const displayed = translated(original, dictionary)
      textSources.set(text, { original, displayed })
      if (current !== displayed) text.nodeValue = displayed
    }

    for (const element of [root, ...root.querySelectorAll('*')]) {
      if (element.closest('.msg, #language, [contenteditable="true"]')) continue
      let sources = attributeSources.get(element)
      if (!sources) { sources = new Map(); attributeSources.set(element, sources) }
      for (const attribute of attributes) {
        const current = element.getAttribute(attribute)
        if (current == null) continue
        const prior = sources.get(attribute)
        const original = prior && current === prior.displayed ? prior.original : current
        const displayed = translated(original, dictionary)
        sources.set(attribute, { original, displayed })
        if (current !== displayed) element.setAttribute(attribute, displayed)
      }
    }
  }

  apply()
  const observer = new MutationObserver(apply)
  observer.observe(root, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: attributes })
  return () => observer.disconnect()
}
