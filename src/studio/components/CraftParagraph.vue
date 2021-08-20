<template>
  <p :style="{ color, 'font-size': fontSize }">
    {{ $interpolatex(content) }}
  </p>
</template>

<script>
import ParagraphSetting from './ParagraphSetting.vue'
import ColorSetting from './ColorSetting.vue'
import FontSizeSetting from './FontSizeSetting.vue'

export default {
  props: {
    content: String,
    color: String,
    fontSize: String,
  },
  inject: ['$interpolatex'],
  // We introduce a craft config attribute in vue's component option,
  // that can define the default props of our page element.
  craft: {
    tag: 'Paragraph',
    defaultProps: {
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      color: '#000000',
      fontSize: 12,
    },
    settings: {
      ParagraphSetting,
      ColorSetting,
      FontSizeSetting,
    },
  },
}
</script>
