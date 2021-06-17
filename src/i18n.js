import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import zh_TW from './locales/zh_TW.json'

const messages = {
  en: en,
  zh_TW: zh_TW,
}

// Locale detection taken from:
// https://phrase.com/blog/posts/ultimate-guide-to-vue-localization-with-vue-i18n/#Detecting_the_Users_Preferred_Locale_in_the_Browser
function getBrowserLocale(options = {}) {
  const defaultOptions = { countryCodeOnly: false }
  const opt = { ...defaultOptions, ...options }
  const navigatorLocale =
    navigator.languages !== undefined
      ? navigator.languages[0]
      : navigator.language
  if (!navigatorLocale) {
    return undefined
  }
  const trimmedLocale = opt.countryCodeOnly
    ? navigatorLocale.trim().split(/-|_/)[0]
    : navigatorLocale.trim()
  return trimmedLocale
}

function getStartingLocale() {
  const browserLocale = getBrowserLocale({ countryCodeOnly: true })
  if (browserLocale == 'zh') {
    return 'zh_TW'
  } else {
    return 'en'
  }
}

export const i18n = createI18n({
  locale: getStartingLocale(),
  fallbackLocale: 'en',
  messages,
})
