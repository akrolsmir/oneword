<template>
  <img :src="label" alt="TODO label" />
</template>

<script>
import LabelSetting from './LabelSetting.vue'

export default {
  props: {
    label: String,
    modelValue: Boolean,
  },
  craft: {
    tag: 'Image',
    defaultProps: {
      label: 'https://www.tibs.org.tw/images/default.jpg',
    },
    settings: {
      LabelSetting,
    },
  },
}
</script>
