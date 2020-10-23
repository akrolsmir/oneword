Vue.component('avatar', {
  props: {
    name: String,
    email: String,
    submitted: Boolean,
    index: Number,
  },
  data() {
    return {
      md5,
    };
  },
  computed: {
    modStyle() {
      return {
        border: this.email ? '2px solid gold' : '',
      };
    },
    supporterMargin() {
      const style = { margin: '4px' };
      if (this.email) {
        style['margin-left'] = 0;
      }
      return style;
    },
  },
  template: `
<div class="card" style="display: inline-block;" :style="modStyle">
  <img
    style="margin-bottom: -6px;"
    v-if="email"
    :src="'https://www.gravatar.com/avatar/' + md5(email) + '?size=24'"
    height="24"
    width="24">
  <span :class="{ 'has-text-primary has-text-weight-bold': submitted }" :style="supporterMargin">
    {{ name }}
  </span>
</div>
  `,
});

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
    async logOut() {
      firebase.analytics().logEvent('logout');
      await firebase.auth().signOut();
      // Reset user id to indicate logged out.
      this.value.id = '';
    },
    referAmazon() {
      firebase.analytics().logEvent('view_amazon', {
        source: 'navbar',
      });
      window.open('https://amzn.to/3bbSpZn', '_blank');
    },
    referPremium() {
      firebase.analytics().logEvent('view_promotion', {
        source: 'navbar',
      });
      window.open('./supporter.html', '_blank');
    },
  },
  computed: {
    isSupporter() {
      return (
        this.value.supporter == 'BASE' || this.value.supporter == 'SPONSOR'
      );
    },
    isSponsor() {
      return this.value.supporter == 'SPONSOR';
    },
  },
  template: `
<nav class="navbar has-shadow is-fixed-top"
  style="font-weight: 500">
  <div class="navbar-brand">
    <a class="navbar-item" href="./">
      <h3 style="font-size: 24px; color:  #4a4a4a">One Word</h3>
    </a>
    <a role="button" class="navbar-burger burger" :class= "{'is-active':burgerOpen}" aria-label="menu"
        data-target="navbuttons" @click="burgerOpen = !burgerOpen;">
      <!-- burger/x icon: -->
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
    </a>
  </div>
  <div id="navbuttons" class="navbar-menu" :class = "{'is-active': burgerOpen}">
    <div class="navbar-end">
      <a class="navbar-item" @click="referAmazon">Buy the original</a>
      <a v-if="value.id" class="navbar-item" @click="logOut">
        Sign out, {{ value.name.split(' ')[0] }}?
      </a>
      <a v-else-if="!value.hideLogin" class="navbar-item" @click="logIn">
        Sign in
      </a>
      <div v-if="!isSupporter" class="navbar-item">
        <div class="buttons">
          <a class="button is-warning" @click="referPremium">
            <strong>Become a supporter!</strong>
          </a>
        </div>
      </div>
    </div>
  </div>
</nav>
  `,
});
