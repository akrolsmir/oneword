<template>
  <div>
    <input class="input" v-model="label" />
  </div>
</template>

<script>
import settingMixin from '../v-craft/components/settingMixin'

export default {
  mixins: [settingMixin],
  computed: {
    label: {
      get() {
        return this.elementProps.label
      },
      set(value) {
        this.updateLabel(value)
      },
    },
  },
  methods: {
    updateLabel(label) {
      this.elementPropsSetter({ label })
    },
  },
}
</script>
