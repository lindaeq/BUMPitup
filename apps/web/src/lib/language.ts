/**
 * Languages offered in the You tab. Codes are BCP 47 (e.g. 'es') so they can
 * be used by a future translation layer. The app UI is not translated yet.
 */
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

export function savedLanguage(): string {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (saved && LANGUAGES.some(l => l.code === saved)) return saved
  } catch { /* storage unavailable (private mode, tests) */ }
  return 'en'
}

export function saveLanguage(code: string): void {
  try { window.localStorage.setItem(STORAGE_KEY, code) } catch { /* ignore */ }
}
