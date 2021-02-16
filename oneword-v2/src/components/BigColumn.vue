// A big centered column that responsively becomes full-width on small devices.
// Most pages should be wrapped by this.

<template>
  <div class="background">
    <div class="main-column" :style="{ width: width + 'px' }">
      <slot />
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
