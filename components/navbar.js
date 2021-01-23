Vue.component('navbar', {
  props: {
    value: {
      type: Object, // Should be a user object
      // Only show login button on pages that use it.
      default() {
        return { hideLogin: false };
      },
    },
  },
  data: () => ({
    burgerOpen: false,
  }),
  methods: {
    logIn() {
      firebase.analytics().logEvent('login');
      window.open('login-widget.html', 'Sign In', 'width=400,height=600');
    },
    referPremium() {
      firebase.analytics().logEvent('view_promotion', {
        source: 'navbar',
      });
    },
    referIncrypt() {
      firebase.analytics().logEvent('view_promotion', {
        source: 'navbar',
      });
    },
  },
  computed: {
    isSupporter() {
      return ['BASE', 'SPONSOR', 'ADMIN'].includes(this.value.supporter);
    },
  },
  template: `
<nav class="navbar has-shadow is-fixed-top"
  style="font-weight: 500">
  <div class="navbar-brand">
    <a class="navbar-item" href="./">
      <img src="./images/oneword-logo.png" width="80" style="max-height: none">
    </a>
    <a class="navbar-item" href="./incrypt.html" target="_blank" @click="referIncrypt">
      Play Incrypt
    </a>
    <a role="button" class="navbar-burger burger" :class= "{'is-active': burgerOpen}" aria-label="menu"
        data-target="navbuttons" @click="burgerOpen = !burgerOpen;">
      <!-- burger/x icon: -->
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
    </a>
  </div>
  <div id="navbuttons" class="navbar-menu" :class = "{'is-active': burgerOpen}">

    <div class="navbar-end">
      <a v-if="value.id" class="navbar-item" href="./profile.html">
        Signed in as {{ value.name.split(' ')[0] }}
      </a>
      <a v-else-if="!value.hideLogin" class="navbar-item" href="#" @click.prevent="logIn">
        Sign in
      </a>
      <div class="navbar-item">
        <a class="button is-warning" href="./supporter.html" target="_blank" @click="referPremium">
          <strong>{{ isSupporter ? 'Supporter' : 'Become a supporter!' }}</strong>
        </a>
      </div>
    </div>
  </div>
</nav>
  `,
});
