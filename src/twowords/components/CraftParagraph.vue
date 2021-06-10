<template>
  <p>{{ content }}</p>
</template>

<script>
export default {
  props: {
    content: String,
  },
  // We introduce a craft config attribute in vue's component option,
  // that can define the default props of our page element.
  craft: {
    defaultProps: {
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    },
  },
}
</script>
