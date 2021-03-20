import FrontPage from './components/FrontPage.vue'
import Profile from './components/Profile.vue'
import About from './components/About.vue'
import Supporter from './components/Supporter.vue'
import Thanks from './components/Thanks.vue'
import OneWord from './oneword/OneWord.vue'
import ListoramaFrontPage from './listorama/ListoramaFrontPage.vue'
import Listorama from './listorama/Listorama.vue'
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
  { path: '/profile', component: Profile, meta: { title: 'Profile' } },
  { path: '/about', component: About, meta: { title: 'About Us' } },
  {
    path: '/supporter',
    component: Supporter,
    meta: { title: 'Support One Word' },
  },
  {
    path: '/thanks',
    component: Thanks,
    meta: { title: 'Thanks for your support!' },
  },
  {
    path: '/storytime',
    component: StorytimeFrontPage,
    meta: { title: 'Storytime' },
  },
  {
    path: '/storytime/:id',
    component: Storytime,
    meta: { title: 'Storytime' },
  },
  { path: '/listorama', component: ListoramaFrontPage },
  { path: '/listorama/:id', component: Listorama },
  { path: '/incrypt', component: IncryptFrontPage, meta: { title: 'Incrypt' } },
  { path: '/incrypt/:id', component: Incrypt, meta: { title: 'Incrypt' } },
  {
    path: '/pairwise',
    component: PairwiseFrontPage,
    meta: { title: 'Pairwise' },
  },
  { path: '/pairwise/:id', component: Pairwise, meta: { title: 'Pairwise' } },
]

export const router = createRouter({
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

// Change title from route meta. For more advanced meta tags, try @vueuse/head, or
// https://www.digitalocean.com/community/tutorials/vuejs-vue-router-modify-head
router.beforeEach((to, from) => {
  document.title = to.meta.title || 'One Word'
})
