<template>
  <progress
    class="progress"
    :value="secondsElapsed"
    :max="intLength"
    :class="{
      'is-warning':
        intLength - 10 < secondsElapsed && secondsElapsed < intLength - 3,
      'is-danger': secondsElapsed > intLength - 3,
    }"
  ></progress>
</template>

<script>
export default {
  data() {
    return {
      startMs: 0,
      secondsElapsed: 0,
      destroyed: false,
    }
  },
  props: {
    length: [Number, String],
    onFinish: Function,
  },
  created() {
    this.reset()
  },
  mounted() {
    const updateProgress = async (timestamp) => {
      this.secondsElapsed = (timestamp - this.startMs) / 1000
      if (this.secondsElapsed >= this.intLength + 2 /* 2s padding*/) {
        // We're done! Run onFinish if the timer's still visible.
        if (!this.destroyed) {
          await this.onFinish()
        }
        this.startMs = timestamp
      } else {
        // Continue updating the progress bar on next frame.
        window.requestAnimationFrame(updateProgress)
      }
    }
    window.requestAnimationFrame(updateProgress)
  },
  computed: {
    intLength() {
      // Parses string values eg '60' as ints, too
      return typeof this.length === 'string'
        ? parseInt(this.length)
        : this.length
    },
  },
  methods: {
    reset() {
      this.startMs = performance.now()
    },
  },
  beforeUnmount() {
    // Timer was removed from the DOM.
    this.destroyed = true
  },
}
</script>
