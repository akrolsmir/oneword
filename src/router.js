import FrontPage from './components/FrontPage.vue'
import Profile from './components/Profile.vue'
import About from './components/About.vue'
import Privacy from './components/Privacy.vue'
import Supporter from './components/Supporter.vue'
import Thanks from './components/Thanks.vue'
import OneWord from './oneword/OneWord.vue'
import Asplos2021 from './oneword/conferences/Asplos2021.vue'
import ListoramaFrontPage from './listorama/ListoramaFrontPage.vue'
import Listorama from './listorama/Listorama.vue'
import StorytimeFrontPage from './storytime/components/StorytimeFrontPage.vue'
import Storytime from './storytime/Storytime.vue'
import IncryptFrontPage from './incrypt/IncryptFrontPage.vue'
import Incrypt from './incrypt/Incrypt.vue'
import PairwiseFrontPage from './pairwise/PairwiseFrontPage.vue'
import Pairwise from './pairwise/Pairwise.vue'
import Multiplay from './admin/Multiplay.vue'
import SketchmatchFrontPage from './sketchmatch/SketchmatchFrontPage.vue'
import Sketchmatch from './sketchmatch/Sketchmatch.vue'
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', component: FrontPage },
  { path: '/room/:id', component: OneWord },
  { path: '/profile', component: Profile, meta: { title: 'Profile' } },
  { path: '/about', component: About, meta: { title: 'About Us' } },
  { path: '/privacy', component: Privacy, meta: { title: 'Privacy Policy' } },
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
  {
    path: '/listorama',
    component: ListoramaFrontPage,
    meta: { title: 'Listorama' },
  },
  {
    path: '/listorama/:id',
    component: Listorama,
    meta: { title: 'Listorama' },
  },
  { path: '/incrypt', component: IncryptFrontPage, meta: { title: 'Incrypt' } },
  { path: '/incrypt/:id', component: Incrypt, meta: { title: 'Incrypt' } },
  {
    path: '/pairwise',
    component: PairwiseFrontPage,
    meta: { title: 'Pairwise' },
  },
  { path: '/pairwise/:id', component: Pairwise, meta: { title: 'Pairwise' } },
  {
    path: '/asplos-2021',
    component: Asplos2021,
    meta: { title: 'ASPLOS 2021' },
  },
  {
    path: '/asplos-2021/:id',
    component: OneWord,
    meta: { title: 'ASPLOS 2021' },
  },
  {
    path: '/multiplay/:game/:id',
    component: Multiplay,
    meta: { title: 'Multiplay' },
  },
  {
    path: '/sketchmatch',
    component: SketchmatchFrontPage,
    meta: { title: 'sketchmatch' },
  },
  {
    path: '/sketchmatch/:id',
    component: Sketchmatch,
    meta: { title: 'Sketchmatch' },
  },
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
