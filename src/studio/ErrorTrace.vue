<template>
  <div v-if="trace" class="notification is-danger is-light mt-2">
    <div class="error">
      <b>Error while running this code!</b><br />{{ trace }}
    </div>
  </div>
</template>

<style scoped>
.error {
  font-family: 'Courier New', Courier, monospace;
  font-size: 10pt;
  white-space: pre-wrap;
}
</style>

<script>
export default {
  name: 'ErrorTrace',
  props: {
    trace: String,
  },
}
</script>
