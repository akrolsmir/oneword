Vue.component('timer', {
  data() {
    return {
      startMs: 0,
      secondsElapsed: 0,
      destroyed: false,
    };
  },
  props: {
    length: [Number, String],
    onFinish: Function,
  },
  mounted() {
    this.$parent.$on('reset-timer', () => (this.startMs = 0));
    const updateProgress = async (timestamp) => {
      if (!this.length) {
        this.startMs = 0;
      } else {
        if (!this.startMs) {
          this.startMs = timestamp;
        }
        this.secondsElapsed = (timestamp - this.startMs) / 1000;
        if (this.secondsElapsed >= this.length + 2 /* 2s padding*/) {
          // We're done! Run onFinish if the timer's still visible.
          if (!this.destroyed) {
            await this.onFinish();
          }
          this.startMs = 0;
        } else {
          // Continue updating the progress bar on next frame.
          window.requestAnimationFrame(updateProgress);
        }
      }
    };
    window.requestAnimationFrame(updateProgress);
  },
  beforeDestroy() {
    // Timer was removed from the DOM.
    this.destroyed = true;
  },
  template: `
<progress class="progress" :value="secondsElapsed" :max="length"
  v-if="this.length > 0"
  :class="{'is-warning': length - 10 < secondsElapsed && secondsElapsed < length - 3,
    'is-danger': secondsElapsed > length - 3}"></progress>
`,
});
