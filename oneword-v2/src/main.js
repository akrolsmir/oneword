import { createApp } from 'vue'
import App from './App.vue'

import 'bulma/css/bulma.css'
import './styles.css'

import GamesList from './components/GamesList.vue'
import OneWord from './oneword/OneWord.vue'
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', component: GamesList },
  { path: '/room/:id', component: OneWord },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export const app = createApp(App)
app.use(router).mount('#app')
