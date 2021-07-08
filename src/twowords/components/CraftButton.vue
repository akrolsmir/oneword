<template>
  <button class="button" @click="onClick">{{ label }}</button>
</template>

<script>
import LabelSetting from './LabelSetting.vue'

export default {
  props: {
    label: String,
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
    },
    settings: {
      LabelSetting,
    },
  },
}
</script>
