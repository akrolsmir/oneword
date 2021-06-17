<template>
  <button class="button">{{ label }}</button>
</template>

<script>
export default {
  props: {
    label: String,
  },
  craft: {
    tag: 'Button',
    defaultProps: {
      label: 'Press me!',
    },
  },
}
</script>
