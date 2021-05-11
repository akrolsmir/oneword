<script>
// BTW, no real reason this has to be a render function
import { h } from 'vue'

export default {
  props: ['modelValue', 'label'],
  emits: ['update:modelValue'],
  render() {
    return h('input', {
      class: { input: true },
      placeholder: this.label,
      value: this.modelValue,
      onInput: (event) => this.$emit('update:modelValue', event.target.value),
    })
  },
}
</script>
