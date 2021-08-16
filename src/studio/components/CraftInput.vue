<template>
  <input
    class="input"
    v-model="value"
    @input="debouncedOnInput"
    :placeholder="label"
  />
</template>

<script>
import { debounce } from '../../utils'
import LabelSetting from './LabelSetting.vue'

export default {
  props: {
    label: String,
  },
  inject: ['$inputx'],
  data() {
    return { value: '' }
  },
  created() {
    this.debouncedOnInput = debounce(this.onInput, 300)
  },
  methods: {
    onInput() {
      this.$inputx(this.label, this.value)
    },
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
