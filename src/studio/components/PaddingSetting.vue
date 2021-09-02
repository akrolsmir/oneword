<template>
  <BulmaDropdown
    class="m-2"
    :options="['0px', '8px', '16px', '24px', '32px']"
    v-model="padding"
  />
</template>

<script>
import settingMixin from '../v-craft/components/settingMixin'
import BulmaDropdown from '../../components/BulmaDropdown.vue'

export default {
  mixins: [settingMixin],
  components: { BulmaDropdown },
  computed: {
    padding: {
      get() {
        return this.elementProps.padding
      },
      set(value) {
        this.updateContent(value)
      },
    },
  },
  methods: {
    updateContent(padding) {
      this.elementPropsSetter({ padding })
    },
  },
}
</script>
