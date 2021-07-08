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
  inject: ['$roomx', '$updatex'],
  methods: {
    onClick(event) {
      // path is like: $roomx.'round.DRAWING.Austin.Heyo'
      // TODO: get name from injected curentuser (or player name?)
      this.$updatex({
        [`round.${this.$roomx.state}.Austin.${this.label}`]: true,
      })
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
