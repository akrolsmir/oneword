<template>
  <div>
    <textarea class="textarea" v-model="plainData"></textarea>
    <button class="button" @click="doExport">Export</button>
    <button class="button" @click="doImport">Import</button>
  </div>
</template>

<script>
export default {
  inject: ['editor'],
  data() {
    return {
      plainData: '',
    }
  },
  methods: {
    doExport() {
      const json = JSON.parse(this.editor.export())
      this.plainData = JSON.stringify(json, null, 2)
    },
    doImport() {
      this.editor.import(this.plainData)
    },
  },
}
</script>
