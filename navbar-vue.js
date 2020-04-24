Vue.component('navbar', {
  props: {
    value: {
      type: Object, // Should be a user object
      // Only show login button on pages that use it.
      default() { return { hideLogin: false } }
    }
  },
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
      window.open('https://amzn.to/2xV5lUm', '_blank');
    },
    referPremium() {
      firebase.analytics().logEvent('view_promotion', {
        source: 'navbar',
      });
      window.open('./supporter.html', '_blank');
    }
  },
  computed: {
    isSupporter() {
      return this.value.supporter == 'BASE' || this.value.supporter == 'SPONSOR';
    },
    isSponsor() {
      return this.value.supporter == 'SPONSOR';
    }
  },
  template: `
<nav class="navbar has-shadow is-fixed-top"
  style="font-weight: 500; height: 52px;">
  <div class="navbar-brand">
    <a href="./">
    <h3 style="font-size: 24px; margin: 8px; margin-left: 32px; margin-right: 32px; display: flex;">
      <div style="margin-left: 8px; color: #4a4a4a">One Word</div>
    </h3>
    </a>

    <a class="navbar-item" @click="referAmazon">Buy the original</a>

    <div class="navbar-item">
      <a v-if="value.id" class="button" @click="logOut">
        Sign out, {{ value.name.split(' ')[0] }}?
      </a>
      <a v-else-if="!value.hideLogin" class="button" @click="logIn">
        Sign in
      </a>
    </div>
    <div class="navbar-item">
      <div class="buttons">
        <a class="button is-warning" @click="referPremium">
          <strong>Become a supporter!</strong>
        </a>
      </div>
    </div>
  </div>
</nav>
  `
});