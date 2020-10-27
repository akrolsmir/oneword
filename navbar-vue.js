Vue.component('avatar', {
  props: {
    name: String,
    user: Object, // email and sponsor status
    submitted: Boolean,
    index: Number,
  },
  data() {
    return {
      md5,
    };
  },
  computed: {
    attr() {
      if (!this.user) {
        return { title: 'guest' };
      }
      if (this.user.supporter == 'BASE') {
        return {
          title: 'supporter',
          style: 'box-shadow: 0 0 0 2px gold',
        };
      }
      if (this.user.supporter == 'SPONSOR') {
        return {
          title: 'sponsor',
          style: 'box-shadow: 0 0 0 2px #b181e4',
        };
      }
      if (this.user.supporter == 'ADMIN') {
        return {
          title: 'developer',
          style: {
            outline: "1px dashed #33ff00",
            boxShadow: "0 0 0 2px #0a0a0a"
          },
        };
      }
      return { title: 'member' };
    },
  },
  template: `
<div class="tag is-white" :class="{ 'is-primary is-light' : submitted }" v-bind="attr">
  <img
    v-if="user && user.email && user.supporter"
    style="border-radius: 4px; margin-left: -9px"
    class="mr-1"
    :src="'https://www.gravatar.com/avatar/' + md5(user.email) + '?size=48'"
    height="24"
    width="24">
  {{ name }}
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
      return ['BASE', 'SPONSOR', 'ADMIN'].includes(this.value.supporter);
    }
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
