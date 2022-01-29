import { createRouter, createWebHistory } from 'vue-router'

// Lazy-loaded to reduce page load time. See:
// https://next.router.vuejs.org/guide/advanced/lazy-loading.html
const FrontPage = () => import('./components/FrontPage.vue')
const Profile = () => import('./components/Profile.vue')
const About = () => import('./components/About.vue')
const Privacy = () => import('./components/Privacy.vue')
const Supporter = () => import('./components/Supporter.vue')
const Thanks = () => import('./components/Thanks.vue')
const OneWord = () => import('./oneword/OneWord.vue')
const Asplos2021 = () => import('./oneword/conferences/Asplos2021.vue')
const ListoramaFrontPage = () => import('./listorama/ListoramaFrontPage.vue')
const Listorama = () => import('./listorama/Listorama.vue')
const StorytimeFrontPage = () =>
  import('./storytime/components/StorytimeFrontPage.vue')
const Storytime = () => import('./storytime/Storytime.vue')
const IncryptFrontPage = () => import('./incrypt/IncryptFrontPage.vue')
const Incrypt = () => import('./incrypt/Incrypt.vue')
const PairwiseFrontPage = () => import('./pairwise/PairwiseFrontPage.vue')
const Pairwise = () => import('./pairwise/Pairwise.vue')
const AlignItFrontPage = () => import('./alignit/AlignItFrontPage.vue')
const AlignIt = () => import('./alignit/AlignIt.vue')
const Studio = () => import('./studio/Studio.vue')
const StudioPreview = () => import('./studio/StudioPreview.vue')
const Multiplay = () => import('./admin/Multiplay.vue')
const Undo = () => import('./studio/Undo.vue')
const Library = () => import('./library/Library.vue')
const GamesListing = () => import('./library/GamesListing.vue')
const Stats = () => import('./admin/Stats.vue')

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
    path: '/quadsquad',
    component: AlignItFrontPage,
    meta: { title: 'Quad Squad' },
  },
  { path: '/quadsquad/:id', component: AlignIt, meta: { title: 'Quad Squad' } },

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
  { path: '/studio', component: Studio, meta: { title: 'Studio' } },
  { path: '/studio/:id', component: Studio, meta: { title: 'Studio' } },
  { path: '/builder', component: Studio, meta: { title: 'Builder' } },
  { path: '/builder/:id', component: Studio, meta: { title: 'Builder' } },
  {
    path: '/preview/:id',
    component: StudioPreview,
    meta: { title: 'Preview' },
  },
  {
    path: '/multiplay/:game/:id',
    component: Multiplay,
    meta: { title: 'Multiplay' },
  },
  {
    path: '/undo',
    component: Undo,
    meta: { title: 'Undo' },
  },
  {
    path: '/library',
    component: Library,
    meta: { title: 'Library' },
  },
  {
    path: '/library/:rulesetId',
    component: GamesListing,
    meta: { title: 'Games Listing' },
  },
  {
    path: '/stats',
    component: Stats,
    meta: { title: 'Stats' },
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
