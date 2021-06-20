import { createI18n } from 'vue-i18n'
import en_US from './locales/en.json'
import zh_TW from './locales/zh_TW.json'
import { formatDistanceToNow } from 'date-fns'
import { en, zhTW } from 'date-fns/locale'

const messages = {
  en: en_US,
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

export function timeSince(millis) {
  let setLocale = en
  if (i18n.global.locale) {
    if (i18n.global.locale == 'zh_TW') {
      setLocale = zhTW
    }
  }
  return formatDistanceToNow(new Date(millis), {
    addSuffix: true,
    locale: setLocale,
  })
}

export const i18n = createI18n({
  locale: getStartingLocale(),
  fallbackLocale: 'en',
  messages,
})
