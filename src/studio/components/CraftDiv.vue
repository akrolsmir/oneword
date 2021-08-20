<template>
  <div :style="{ 'background-color': color }">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
div {
  padding: 30px;
  outline: 1px solid gray;
}
</style>

<script>
import ColorSetting from './ColorSetting.vue'

export default {
  props: {
    color: String,
  },
  craft: {
    tag: 'Div',
    defaultProps: {
      color: '#e5e7eb',
    },
    settings: {
      ColorSetting,
    },
  },
}
</script>
