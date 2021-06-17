<template>
  <input class="input" :placeholder="label" />
</template>

<script>
export default {
  props: {
    label: String,
  },
  craft: {
    tag: 'Input',
    defaultProps: {
      label: 'Write something...',
    },
  },
}
</script>
