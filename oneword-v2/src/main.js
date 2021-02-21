import { createApp } from 'vue'
import App from './App.vue'

import 'bulma/css/bulma.css'
import './styles.css'

import FrontPage from './components/FrontPage.vue'
import Profile from './components/Profile.vue'
import About from './components/About.vue'
import Supporter from './components/Supporter.vue'
import Thanks from './components/Thanks.vue'
import OneWord from './oneword/OneWord.vue'
import Listography from './listography/Listography.vue'
import StorytimeFrontPage from './storytime/components/StorytimeFrontPage.vue'
import Storytime from './storytime/Storytime.vue'
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', component: FrontPage },
  { path: '/room/:id', component: OneWord },
  { path: '/profile', component: Profile },
  { path: '/about', component: About },
  { path: '/supporter', component: Supporter },
  { path: '/thanks', component: Thanks },
  { path: '/storytime/', component: StorytimeFrontPage },
  { path: '/storytime/:id', component: Storytime },
  { path: '/list/', component: Listography },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
})

export const app = createApp(App)
app.use(router).mount('#app')
