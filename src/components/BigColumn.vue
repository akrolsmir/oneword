// A big centered column that responsively becomes full-width on small devices.
// Most pages should be wrapped by this.

<template>
  <div class="background">
    <div class="main-column" :style="{ width: mainWidth + 'px' }">
      <div class="columns is-centered" v-if="showPanes">
        <!-- Left pane is only shown when width > 1216px -->
        <div class="column is-hidden-touch is-hidden-desktop-only">
          <slot name="left-pane" />
        </div>
        <!-- Center (main) pane. -->
        <div class="column is-two-thirds is-half-widescreen">
          <slot />
        </div>
        <div class="column">
          <slot name="right-pane" />
        </div>
      </div>
      <slot v-else />
    </div>
    <LinkFooter></LinkFooter>
  </div>
</template>
<script>
import LinkFooter from './LinkFooter.vue'

export default {
  components: {
    LinkFooter,
  },
  props: {
    width: {
      type: Number,
      default: 600,
    },
    // If set, then we double the width to have left and right panes
    showPanes: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    mainWidth() {
      return this.width * (this.showPanes ? 2 : 1)
    },
  },
}
</script>

<style scoped>
.background {
  margin: 0;
  height: 100%;
  position: relative;
  overflow: auto;
}

.main-column {
  margin: 48px auto;
  width: 600px;
  max-width: 95vw;
  /* Always keep footer at the bottom: https://stackoverflow.com/a/52779563/1222351 */
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
