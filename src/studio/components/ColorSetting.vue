<template>
  <tippy interactive trigger="click" placement="auto" :arrow="false">
    <div class="preview-square" :style="{ background: color }"></div>
    <template #content>
      <Sketch v-model="color" />
    </template>
  </tippy>
</template>

<style scoped>
.preview-square {
  cursor: pointer;
  margin: 0.5rem;
  width: 32px;
  height: 32px;
  position: relative;
  border-radius: 4px;
  display: inline-block;
  box-shadow: inset 0 0 0 1px rgb(0 0 0 / 15%);
}
</style>

<script>
import settingMixin from '../v-craft/components/settingMixin'
import { Sketch } from '@ckpack/vue-color'

export default {
  mixins: [settingMixin],
  components: { Sketch },
  computed: {
    color: {
      get() {
        return this.elementProps.color || '#000000'
      },
      set(value) {
        this.updateContent(value.hex8)
      },
    },
  },
  methods: {
    updateContent(color) {
      this.elementPropsSetter({ color })
    },
  },
}
</script>
