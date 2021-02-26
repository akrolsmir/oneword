import { createApp } from 'vue'
import App from './App.vue'

import './styles.scss'

import FrontPage from './components/FrontPage.vue'
import Profile from './components/Profile.vue'
import About from './components/About.vue'
import Supporter from './components/Supporter.vue'
import Thanks from './components/Thanks.vue'
import OneWord from './oneword/OneWord.vue'
import Listography from './listography/Listography.vue'
import StorytimeFrontPage from './storytime/components/StorytimeFrontPage.vue'
import Storytime from './storytime/Storytime.vue'
import IncryptFrontPage from './incrypt/IncryptFrontPage.vue'
import Incrypt from './incrypt/Incrypt.vue'
import PairwiseFrontPage from './pairwise/PairwiseFrontPage.vue'
import Pairwise from './pairwise/Pairwise.vue'
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', component: FrontPage },
  { path: '/room/:id', component: OneWord },
  { path: '/profile', component: Profile },
  { path: '/about', component: About },
  { path: '/supporter', component: Supporter },
  { path: '/thanks', component: Thanks },
  { path: '/storytime', component: StorytimeFrontPage },
  { path: '/storytime/:id', component: Storytime },
  { path: '/list', component: Listography },
  { path: '/incrypt', component: IncryptFrontPage },
  { path: '/incrypt/:id', component: Incrypt },
  { path: '/pairwise', component: PairwiseFrontPage },
  { path: '/pairwise/:id', component: Pairwise },
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

export const app = createApp(App).use(router)
const rootComponent = app.mount('#app')
app.config.globalProperties.$showModal = rootComponent.showModal
