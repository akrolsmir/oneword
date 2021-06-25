<template>
  <input class="input" :placeholder="label" />
</template>

<script>
import LabelSetting from './LabelSetting.vue'

export default {
  props: {
    label: String,
  },
  craft: {
    tag: 'Input',
    defaultProps: {
      label: 'Write something...',
    },
    settings: {
      LabelSetting,
    },
  },
}
</script>
