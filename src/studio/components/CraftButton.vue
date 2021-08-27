<template>
  <button
    class="button"
    @click="onClick"
    :style="{
      'background-color': color,
      'font-size': fontSize,
      'font-family': fontFamily,
    }"
  >
    {{ label }}
  </button>
</template>

<script>
import LabelSetting from './LabelSetting.vue'
import ColorSetting from './ColorSetting.vue'
import FontSizeSetting from './FontSizeSetting.vue'
import FontFamilySetting from './FontFamilySetting.vue'

export default {
  props: {
    label: String,
    color: String,
    fontSize: String,
    fontFamily: String,
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
      fontFamily: 'Lato',
    },
    settings: {
      LabelSetting,
      ColorSetting,
      FontSizeSetting,
      FontFamilySetting,
    },
  },
}
</script>
