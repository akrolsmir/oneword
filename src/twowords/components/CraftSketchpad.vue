<template>
  <div ref="sketchpad"></div>
  <button class="button" @click="sketchpad.clear()">Clear</button>
  <button class="button" @click="submit">Submit</button>
</template>

<script>
import Sketchpad from 'responsive-sketchpad'
import { sanitize } from '../../utils'
import LabelSetting from './LabelSetting.vue'

export default {
  props: {
    label: String,
  },
  inject: ['$roomx', '$updatex'],
  mounted() {
    this.registerSketchPad()
  },
  methods: {
    registerSketchPad() {
      // $nextTick ensures code is executed after the next DOM update cycle.
      // https://stackoverflow.com/questions/53578419
      this.$nextTick(function () {
        if (this.$refs.sketchpad) {
          // register a new sketchpad
          this.sketchpad = new Sketchpad(this.$refs.sketchpad, {
            backgroundColor: '#FFFFFF',
            line: { size: 5 },
            width: 500,
            height: 350,
          })
        } else {
          console.log('sketchpad does not exist')
        }
      })
    },
    submit() {
      // TODO: instead serialize as sketchpad.toJSON, sketchpad.loadJSON ?
      // Pros: More compact, cons: need to convert again to PNG
      const dataUrl = this.sketchpad.canvas.toDataURL('image/png')
      this.$updatex({
        [`round.${this.$roomx.state}.Austin.${sanitize(this.label)}`]: dataUrl,
      })
    },
  },
  craft: {
    tag: 'Sketchpad',
    defaultProps: {
      label: 'Sketch here',
    },
    settings: {
      LabelSetting,
    },
  },
}
</script>
