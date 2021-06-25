<template>
  <button class="button">{{ label }}</button>
</template>

<script>
import LabelSetting from './LabelSetting.vue'

export default {
  props: {
    label: String,
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
