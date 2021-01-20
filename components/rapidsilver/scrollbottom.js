Vue.component('ScrollToBottom', {
  props: {
    // How close user must be to the bottom to count as being at the bottom (in pixels)
    leeway: {
      type: Number,
      default: 15,
      validator: (value) => value > 0,
    },
  },
  data: () => ({
    atBottom: false,
  }),
  mounted() {
    // wait for childeren to finish rendering, then go to bottom
    setTimeout(this.toBottom, 100);
  },
  methods: {
    height() {
      return this.$refs.feed.scrollHeight - this.$refs.feed.clientHeight;
    },
    toBottom() {
      // TODO: smooth scrolling in Safari
      this.$refs.feed.scroll({ top: this.height(), left: 0, behavior: 'smooth' });
    },
    stickToBottom() {
      if (this.atBottom) {
        this.toBottom();
      }
    },
    onScroll() {
      // TODO: throttle this
      this.atBottom = Math.abs(this.height() - this.$refs.feed.scrollTop) <= this.leeway;
    },
  },
  template: `
    <div style="display: flex; position: relative">
      <div style="overflow: auto; flex-grow: 1" ref="feed" @scroll='onScroll'>
        <slot></slot>
      </div>
      <div v-if="!atBottom" style="position: absolute; bottom: 3rem; margin: 0 auto; left: 0; right: 0; z-index: 3;" class="has-text-centered">
        <b-button type="is-link is-rounded" @click="toBottom">Scroll to Bottom</b-button>
      </div>
    </div>
  `,
});
