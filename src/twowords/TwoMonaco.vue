<template>
  <div id="root" ref="root"></div>
</template>

<style scoped>
#root {
  height: 40vh;
}
</style>

<script>
import * as monaco from 'monaco-editor'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
import { defineComponent, ref, onMounted, onUnmounted } from 'vue'

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'json') {
      return new jsonWorker()
    }
    if (label === 'css' || label === 'scss' || label === 'less') {
      return new cssWorker()
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return new htmlWorker()
    }
    if (label === 'typescript' || label === 'javascript') {
      return new tsWorker()
    }
    return new editorWorker()
  },
}

export default defineComponent({
  props: {
    modelValue: String,
    readonly: Boolean,
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const root = ref()
    let editor
    onMounted(() => {
      editor = monaco.editor.create(root.value, {
        language: 'javascript',
        value: props.modelValue,
        automaticLayout: true,
        minimap: { enabled: false },
        readOnly: props.readonly,
        scrollBeyondLastLine: false,
        scrollbar: {
          alwaysConsumeMouseWheel: false,
        },
      })
      // On each change, notify the Vue parent
      editor.onDidChangeModelContent((event) => {
        emit('update:modelValue', editor.getValue())
      })
    })
    onUnmounted(() => {
      editor.dispose()
    })
    return {
      root,
    }
  },
})
</script>
