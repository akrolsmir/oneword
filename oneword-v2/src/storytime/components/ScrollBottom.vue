<template>
  <div style="display: flex; position: relative">
    <!-- Note: Changed "overflow: auto" to "visible" for Vue3 Carousel buttons, so maybe broken... -->
    <div style="overflow: visible; flex-grow: 1" ref="feed" @scroll="onScroll">
      <slot></slot>
    </div>
    <div v-if="!atBottom" class="scroll-button has-text-centered">
      <button type="button" class="button is-link is-rounded" @click="toBottom">
        Scroll to Bottom
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    // How close user must be to the bottom to count as being at the bottom (in pixels)
    leeway: {
      type: Number,
      default: 15,
      validator: (value) => value > 0,
    },
  },
  data: () => ({
    atBottom: true,
  }),
  mounted() {
    // wait for childeren to finish rendering, then go to bottom
    setTimeout(this.toBottom, 100)
  },
  methods: {
    height() {
      return this.$refs.feed.scrollHeight - this.$refs.feed.clientHeight
    },
    toBottom() {
      // TODO: smooth scrolling in Safari
      this.$refs.feed.scroll({
        top: this.height(),
        left: 0,
        behavior: 'smooth',
      })
    },
    stickToBottom() {
      if (this.atBottom) {
        this.toBottom()
      }
    },
    onScroll() {
      // TODO: throttle this
      this.atBottom =
        Math.abs(this.height() - this.$refs.feed.scrollTop) <= this.leeway
    },
  },
}
</script>
<style scoped>
.scroll-button {
  position: absolute;
  bottom: 3rem;
  margin: 0 auto;
  left: 0;
  right: 0;
  z-index: 3;
}
</style>
