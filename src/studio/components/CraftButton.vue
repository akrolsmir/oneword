<template>
  <button
    class="button"
    @click="onClick"
    :style="{ 'background-color': color, 'font-size': fontSize }"
  >
    {{ label }}
  </button>
</template>

<script>
import LabelSetting from './LabelSetting.vue'
import ColorSetting from './ColorSetting.vue'
import FontSizeSetting from './FontSizeSetting.vue'

export default {
  props: {
    label: String,
    color: String,
    fontSize: String,
    modelValue: Boolean,
  },
  inject: ['$inputx'],
  methods: {
    onClick() {
      this.$inputx(this.label, true)
    },
  },
  craft: {
    tag: 'Button',
    defaultProps: {
      label: 'Press me!',
      color: '#FFFFFF',
      fontSize: '12pt',
    },
    settings: {
      LabelSetting,
      ColorSetting,
      FontSizeSetting,
    },
  },
}
</script>
