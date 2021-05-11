<script>
import { h } from 'vue'
import TextInput from './TextInput.vue'
import Button from './Button.vue'

export default {
  components: {
    TextInput,
    Button,
  },
  // Array of JSON elements to convert to a working <div>,
  // automatically tracking input values in the prop
  props: ['elements', 'inputs'],
  render() {
    return this.renderElements(this.elements)
  },
  methods: {
    renderElements(elements) {
      return h('div', elements.map(this.renderElement))
    },

    renderElement(element) {
      switch (element.type) {
        case 'TEXT_INPUT':
          return h(TextInput, {
            label: element.label,
            // TODO: Combined key using both element type and input?
            modelValue: this.inputs[element.label],
            'onUpdate:modelValue': (event) => {
              this.inputs[element.label] = event
            },
          })
        case 'BUTTON':
          return h(Button, {
            label: element.label,
            modelValue: this.inputs[element.label],
            'onUpdate:modelValue': (event) => {
              this.inputs[element.label] = true
            },
          })
        case 'BREAK':
          return h('br')
      }
    },
  },
}
</script>
