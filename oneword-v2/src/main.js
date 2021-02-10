import { createApp } from 'vue'
import App from './App.vue'

import 'bulma/css/bulma.css'
import './styles.css'

import GamesList from './components/GamesList.vue'
import Profile from './components/Profile.vue'
import About from './components/About.vue'
import Supporter from './components/Supporter.vue'
import OneWord from './oneword/OneWord.vue'
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', component: GamesList },
  { path: '/room/:id', component: OneWord },
  { path: '/profile', component: Profile },
  { path: '/about', component: About },
  { path: '/supporter', component: Supporter },
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
