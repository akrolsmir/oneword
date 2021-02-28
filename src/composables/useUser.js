import { computed, reactive } from 'vue'
import { listenForLogin } from '../firebase/network'

export function useUser() {
  const user = reactive({
    // If user.id is not filled in, then user is not logged in
    id: '',
    name: '',
    email: '',
    createTime: 0,
    lastUpdateTime: 0,

    // NOTE: The following properties are not pulled from Firestore
    // Callback to display the sign in popup
    signIn: () => {},
    // Display only the first name
    displayName: computed(() => user.name.split(' ')[0]),
    guest: false,
    canPlay: computed(() => user.id || (user.guest && user.displayName)),
    // Note: Higher tiers qualify for lower tiers (Eg champions are supporters)
    isSupporter: computed(() => Boolean(user.supporter)),
    isChampion: computed(() =>
      ['CHAMPION', 'SPONSOR', 'ADMIN'].includes(user.supporter)
    ),
    isAdmin: computed(() => user.supporter === 'ADMIN'),
  })

  listenForLogin((newUser) => {
    Object.assign(user, newUser)
    user.guest = false
  })

  return { user }
}
