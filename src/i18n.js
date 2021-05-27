import { createI18n } from 'vue-i18n'

const messages = {
  en: {
    message: {
      hello: 'hello world',
    },
  },
  zh: {
    message: {
      hello: '世界',
    },
  },
}

export const i18n = createI18n({
  locale: 'zh', // set locale
  fallbackLocale: 'en', // set fallback locale
  messages, // set locale messages
})
