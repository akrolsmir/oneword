<template>
  <!-- A button that has modelValue true if it's ever been clicked -->
  <button class="button" @click="onClick">
    {{ label }}
  </button>
</template>

<script>
export default {
  props: ['label', 'modelValue'],
  emits: ['update:modelValue'],
  methods: {
    onClick(event) {
      this.$emit('update:modelValue', event.target.value)
    },
  },
}
</script>
