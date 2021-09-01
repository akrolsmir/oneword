<template>
  <div id="root" ref="root" :style="style"></div>
</template>

<script>
import * as monaco from 'monaco-editor'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
import {
  defineComponent,
  ref,
  onMounted,
  onUnmounted,
  computed,
  watch,
} from 'vue'

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
    heightInVh: {
      type: Number,
      default: 40,
    },
    // E.g. options from https://microsoft.github.io/monaco-editor/playground.html#creating-the-editor-editor-basic-options
    options: Object,
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const root = ref()
    let editor
    onMounted(() => {
      editor = monaco.editor.create(root.value, {
        language: 'javascript',
        value: props.modelValue || '',
        automaticLayout: true,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        scrollbar: {
          alwaysConsumeMouseWheel: false,
        },
        ...props.options,
      })
      // On each local change, notify the Vue parent
      editor.onDidChangeModelContent((event) => {
        emit('update:modelValue', editor.getValue())
      })
    })
    watch(
      () => props.modelValue,
      (newValue) => {
        // Update the local editor when parent's props changed
        if (editor.getValue() != newValue) {
          editor.setValue(newValue)
        }
      }
    )
    onUnmounted(() => {
      editor.dispose()
    })
    const style = computed(() => ({
      height: `${props.heightInVh}vh`,
    }))

    return {
      root,
      style,
    }
  },
})
</script>
