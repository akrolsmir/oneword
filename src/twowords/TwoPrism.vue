<!-- Note: vue-prism-editor throws out a lot of warnings like:
Component emitted event "update:modelValue" but it is neither declared in the emits option nor as an "onUpdate:modelValue" prop.
Could fix upstream to silence them... -->

<template>
  <div>
    <prism-editor
      class="my-editor"
      :model-value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      :highlight="highlighter"
      line-numbers
      :readonly="readonly"
    ></prism-editor>
  </div>
</template>

<style>
/* required class for vue-prism-editor */
.my-editor {
  /* we dont use `language-` classes anymore so thats why we need to add background and text color manually */
  background: #ffffff;
  color: #2d2d2d;

  /* you must provide font-family font-size line-height. Example: */
  font-family: Fira code, Fira Mono, Consolas, Menlo, Courier, monospace;
  font-size: 14px;
  line-height: 1.5;
  padding: 5px;
}

/* optional class for removing the outline */
.prism-editor__textarea:focus {
  outline: none;
}
</style>

<script>
// import Prism Editor
import { PrismEditor } from 'vue-prism-editor'
import 'vue-prism-editor/dist/prismeditor.min.css' // import the styles somewhere

// import highlighting library (you can use any library you want just return html string)
import { highlight, languages } from 'prismjs/components/prism-core'
import 'prismjs/components/prism-clike'
import 'prismjs/components/prism-javascript'
import 'prismjs/themes/prism-coy.css' // import syntax highlighting styles

export default {
  components: {
    PrismEditor,
  },
  props: ['modelValue', 'readonly'],
  emits: ['update:modelValue'],
  methods: {
    highlighter(code) {
      return highlight(code, languages.js) // languages.<insert language> to return html with markup
    },
  },
}
</script>
