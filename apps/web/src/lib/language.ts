import catalog from './translationCatalog.json'

/** Languages offered in the You tab. */
export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español (Spanish)' },
  { code: 'fr', label: 'Français (French)' },
  { code: 'pt', label: 'Português (Portuguese)' },
  { code: 'zh', label: '中文 (Chinese)' },
  { code: 'hi', label: 'हिन्दी (Hindi)' },
  { code: 'ar', label: 'العربية (Arabic)' },
  { code: 'tl', label: 'Tagalog' },
  { code: 'vi', label: 'Tiếng Việt (Vietnamese)' },
  { code: 'ko', label: '한국어 (Korean)' },
] as const

const STORAGE_KEY = 'bumpbridge.language'
const cacheKey = (code: string) => `bumpbridge.translations.${code}.${JSON.stringify(catalog).length}`
export type Translations = Record<string, string>

export function loadTranslations(code: string): Translations | null {
  try {
    const raw = window.localStorage.getItem(cacheKey(code))
    const value: unknown = raw ? JSON.parse(raw) : null
    if (value && typeof value === 'object' && !Array.isArray(value)) return value as Translations
  } catch { /* storage unavailable */ }
  return null
}

export function saveTranslations(code: string, translations: Translations): void {
  try { window.localStorage.setItem(cacheKey(code), JSON.stringify(translations)) } catch { /* storage unavailable */ }
}

export function savedLanguage(): string {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (saved && LANGUAGES.some(l => l.code === saved) && (saved === 'en' || loadTranslations(saved))) return saved
  } catch { /* storage unavailable (private mode, tests) */ }
  return 'en'
}

export function saveLanguage(code: string): void {
  try { window.localStorage.setItem(STORAGE_KEY, code) } catch { /* ignore */ }
}
