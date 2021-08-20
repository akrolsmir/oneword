<template>
  <BulmaDropdown class="m-2" :options="FONTS" v-model="fontFamily" />
</template>

<script>
import settingMixin from '../v-craft/components/settingMixin'
import BulmaDropdown from '../../components/BulmaDropdown.vue'

const FONTS = {
  'Sans Serif': 'Lato',
  Serif: 'Crimson Text',
  Display: 'Rampart One',
  Handwriting: 'Merienda',
  Monospace: 'Source Code Pro',
}

export default {
  mixins: [settingMixin],
  components: { BulmaDropdown },
  data() {
    return { FONTS }
  },
  computed: {
    fontFamily: {
      get() {
        return this.elementProps.fontFamily
      },
      set(value) {
        this.updateContent(value)
      },
    },
  },
  methods: {
    updateContent(fontFamily) {
      this.elementPropsSetter({ fontFamily })
    },
  },
}
</script>
