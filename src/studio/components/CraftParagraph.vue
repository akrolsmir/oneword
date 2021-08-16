<template>
  <p>{{ $interpolatex(content) }}</p>
</template>

<script>
import ParagraphSetting from './ParagraphSetting.vue'

export default {
  props: {
    content: String,
  },
  inject: ['$interpolatex'],
  // We introduce a craft config attribute in vue's component option,
  // that can define the default props of our page element.
  craft: {
    tag: 'Paragraph',
    defaultProps: {
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    },
    settings: {
      ParagraphSetting,
    },
  },
}
</script>
