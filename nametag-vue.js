Vue.component('nametag', {
  props: {
    name: String,
    user: Object, // email and sponsor status
    submitted: Boolean,
    index: Number,
    guessing: Boolean,
    mod: Boolean,
  },
  data() {
    return {
      md5,
    };
  },
  methods: {
    kick() {
      this.$emit('kick');
    },
  },
  computed: {
    attr() {
      if (!this.user || this.user.guest) {
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
            outline: '1px dashed #33ff00',
            boxShadow: '0 0 0 2px #0a0a0a',
          },
        };
      }
      return { title: 'member' };
    },
  },
  template: `
  <div class="control">
    <div class="tags has-addons">
      <div 
        class="tag is-white" 
        :class="{ 'is-primary is-light': submitted && !guessing, 'is-info': guessing, 'has-text-weight-semibold': submitted }"
        v-bind="attr" 
        style="z-index: 1"
      >
        <img
          v-if="user && user.email && user.supporter"
          style="border-top-left-radius: 4px; border-bottom-left-radius: 4px; margin-left: -10.5px"
          class="mr-1"
          :src="'https://www.gravatar.com/avatar/' + md5(user.email) + '?size=48'"
          height="28"
          width="28">
        {{ name }}
      </div>
      <template v-if="index == 0">
        <div class="tag is-dark">
          Mod
        </div>
      </template>
      <a v-else-if="mod" class="tag is-delete is-danger is-light" :title="'kick ' + name" @click="kick()"></a>
    </div>
  </div>
    `,
});
