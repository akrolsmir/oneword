import { createApp } from 'vue'
import App from './App.vue'
import VueTippy from 'vue-tippy'
import 'tippy.js/dist/tippy.css'

import './styles.scss'

import { router } from './router'
import { i18n } from './i18n'

export const app = createApp(App)
  .use(i18n)
  .use(router)
  .use(VueTippy, {
    directive: 'tippy',
    defaultProps: {
      appendTo: 'parent',
    },
  })
const rootComponent = app.mount('#app')
app.config.globalProperties.$showModal = rootComponent.showModal
