<template>
  <div class="select">
    <select v-model="modelValue">
      <option v-for="option in options" :key="option">{{ option }}</option>
    </select>
  </div>
</template>

<script>
/** Usage: <BulmaDropdown v-model="choice" :options="['Opt1', 'Opt2', ...]" /> */
export default {
  props: ['modelValue', 'options'],
  emits: ['update:modelValue'],
  watch: {
    modelValue() {
      this.$emit('update:modelValue', this.modelValue)
    },
  },
}
</script>
