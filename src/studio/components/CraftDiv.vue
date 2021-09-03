<template>
  <div :style="{ 'background-color': color, padding }">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
div {
  outline: 1px solid gray;
}
</style>

<script>
import ColorSetting from './ColorSetting.vue'
import PaddingSetting from './PaddingSetting.vue'

export default {
  props: {
    color: String,
    padding: {
      type: String,
      default: '32px',
    },
  },
  craft: {
    tag: 'Div',
    defaultProps: {
      color: '#e5e7eb',
      padding: '32px',
    },
    settings: {
      ColorSetting,
      PaddingSetting,
    },
  },
}
</script>
