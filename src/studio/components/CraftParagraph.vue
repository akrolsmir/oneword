<template>
  <p :style="{ color, 'font-size': fontSize, 'font-family': fontFamily }">
    {{ $interpolatex(content) }}
  </p>
</template>

<style scoped>
p {
  line-height: 1.3;
  padding-bottom: 0.5rem;
}
</style>

<script>
import ParagraphSetting from './ParagraphSetting.vue'
import ColorSetting from './ColorSetting.vue'
import FontSizeSetting from './FontSizeSetting.vue'
import FontFamilySetting from './FontFamilySetting.vue'

export default {
  props: {
    content: String,
    color: String,
    fontSize: String,
    fontFamily: String,
  },
  inject: ['$interpolatex'],
  // We introduce a craft config attribute in vue's component option,
  // that can define the default props of our page element.
  craft: {
    tag: 'Paragraph',
    defaultProps: {
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      color: '#000000',
      fontSize: '12pt',
      fontFamily: 'Lato',
    },
    settings: {
      ParagraphSetting,
      ColorSetting,
      FontSizeSetting,
      FontFamilySetting,
    },
  },
}
</script>
