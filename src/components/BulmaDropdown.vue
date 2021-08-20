<template>
  <div class="select">
    <select v-model="modelValue">
      <option v-for="(value, key) in values" :key="key" :value="value">
        {{ key }}
      </option>
    </select>
  </div>
</template>

<script>
/**
 * Usage: <BulmaDropdown
 *   v-model="choice"
 *   :options="['Opt1', 'Opt2', ...] OR { Opt1: Val1, Opt2: Val2, ...}"
 * />
 */
export default {
  props: ['modelValue', 'options'],
  emits: ['update:modelValue'],
  computed: {
    values() {
      if (Array.isArray(this.options)) {
        return Object.fromEntries(this.options.map((o) => [o, o]))
      }
      return this.options
    },
  },
  watch: {
    modelValue() {
      this.$emit('update:modelValue', this.modelValue)
    },
  },
}
</script>
