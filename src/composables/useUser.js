import { computed, reactive } from 'vue'
import { listenForLogin } from '../firebase/network'
import ColorHash from '../vendor/color-hash-esm'
import { md5 } from '../vendor/md5'

export function useUser() {
  const colorHash = new ColorHash({ lightness: 0.5, saturation: 1 })

  const user = reactive({
    // If user.id is not filled in, then user is not logged in
    id: '',
    name: '',
    email: '',
    createTime: 0,
    lastUpdateTime: 0,
    supporter: '',

    // NOTE: The following properties are not pulled from Firestore
    // Callback to display the sign in popup
    signIn: () => {},
    // Display only the first name
    displayName: computed(() => user.name.split(' ')[0]),
    guest: false,
    canPlay: computed(() => user.id || (user.guest && user.displayName)),
    supporterString: computed(() => SUPPORTER_TITLES[user.supporter]),
    // Grant supporter benefits for conference pages.
    // TODO: Remove after 2021-04-30
    isConference: computed(() =>
      window.location.pathname.startsWith('/asplos-2021')
    ),
    // Note: Higher tiers qualify for lower tiers (Eg champions are supporters)
    isSupporter: computed(() => Boolean(user.supporter) || user.isConference),
    isChampion: computed(
      () =>
        ['CHAMPION', 'SPONSOR', 'ADMIN'].includes(user.supporter) ||
        user.isConference
    ),
    isAdmin: computed(() => user.supporter === 'ADMIN'),
    avatarUrl: computed(() => {
      if (user.email && user.isSupporter) {
        return `https://www.gravatar.com/avatar/${md5(user.email)}?size=48`
      }
      return buildAvatarSvg(user.guest ? '#aaa' : colorHash.hex(user.name))
    }),
  })

  const SUPPORTER_TITLES = {
    BASE: 'Supporter',
    CHAMPION: 'Champion',
    SPONSOR: 'Sponsor',
    ADMIN: 'Admin',
  }

  listenForLogin((newUser) => {
    Object.assign(user, newUser)
    user.guest = false
  })

  return { user }
}

function buildAvatarSvg(color) {
  // SVG icon from https://remixicon.com/
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-8 -8 40 40" fill="${color}" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M4 22a8 8 0 1 1 16 0H4zm8-9c-3.315 0-6-2.685-6-6s2.685-6 6-6 6 2.685 6 6-2.685 6-6 6z"/></svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}
