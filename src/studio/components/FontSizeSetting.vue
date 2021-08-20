<template>
  <BulmaDropdown
    class="m-2"
    :options="['8pt', '12pt', '24pt', '36pt']"
    v-model="fontSize"
  />
</template>

<script>
import settingMixin from '../v-craft/components/settingMixin'
import BulmaDropdown from '../../components/BulmaDropdown.vue'

export default {
  mixins: [settingMixin],
  components: { BulmaDropdown },
  computed: {
    fontSize: {
      get() {
        return this.elementProps.fontSize
      },
      set(value) {
        this.updateContent(value)
      },
    },
  },
  methods: {
    updateContent(fontSize) {
      this.elementPropsSetter({ fontSize })
    },
  },
}
</script>
