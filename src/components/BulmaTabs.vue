<template>
  <div class="tabs">
    <ul>
      <li
        v-for="title in titles"
        :class="{ 'is-active': modelValue == title }"
        :key="title"
      >
        <a @click="select(title)">{{ title }}</a>
      </li>
    </ul>
  </div>
</template>

<script>
/** Usage: <BulmaTabs v-model="choice" :titles="['Tab1', 'Tab2', ...]" /> */
export default {
  props: ['modelValue', 'titles'],
  emits: ['update:modelValue'],
  methods: {
    select(title) {
      this.$emit('update:modelValue', title)
    },
  },
}
</script>
