<template>
  <div ref="sketchpad"></div>
  <button class="button" @click="sketchpad.clear()">Clear</button>
  <button class="button" @click="toDataUrl">Print to console</button>
</template>

<script>
import Sketchpad from 'responsive-sketchpad'

export default {
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
    toDataUrl() {
      // TODO: instead serialize as sketchpad.toJSON, sketchpad.loadJSON ?
      // Pros: More compact, cons: need to convert again to PNG
      const dataUrl = this.sketchpad.canvas.toDataURL('image/png')
      this.$store.commit({
        type: 'input', // This is a player-entered diff, vs game-generated
        path: 'round.DRAWING.Austin', // combination of game round, player name, and input label
        // Skip input label in v0
        // player: '...', ''', // Or could be split out.
        value: dataUrl, // The actual value getting written to Firebase
      })
      return dataUrl
    },
  },
}
</script>
