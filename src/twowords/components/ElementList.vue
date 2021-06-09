<style>
.draggable {
  margin: 6px;
  transition: all 0.1s ease-in-out;
}

.draggable:hover {
  cursor: move;
  box-shadow: 0px 0px 6px 4px brown;
}

.draggable:focus {
  cursor: move;
  box-shadow: 0px 0px 6px 4px green;
}
</style>

<script>
import { h } from 'vue'
import TextInput from './TextInput.vue'
import Button from './Button.vue'

export default {
  components: {
    TextInput,
    Button,
  },
  props: {
    // Array of JSON elements to convert to a working <div>
    elements: Array,
    // Automatically tracks input models
    inputs: Object,
    // Callback to write changes to Firestore
    pushChanges: Function,
    // Whether to make this list editable
    editing: Boolean,
  },
  render() {
    return this.renderElements(this.elements)
  },
  methods: {
    renderElements(elements) {
      return h('div', elements.map(this.renderElement))
    },

    /*
      TODO:
      - Create a "selected" class like mmm.page, with a tooltip for modifying its attributes
      - OR add a pane to modify its attributes
      
      - Create a draggable interface
        - Just use Vue ondrag? no library? like v-craft
        - OR literally dragging wysiwyg like mmm.page; arbitrary positioning
    */
    renderElement(element) {
      switch (element.type) {
        case 'TEXT_INPUT':
          return h(TextInput, {
            class: { draggable: true },
            label: element.label,
            // TODO: Combined key using both element type and input?
            modelValue: this.inputs[element.label],
            'onUpdate:modelValue': async (event) => {
              this.inputs[element.label] = event
              await this.pushChanges()
            },
          })
        case 'BUTTON':
          return h(Button, {
            label: element.label,
            class: { draggable: true },
            modelValue: this.inputs[element.label],
            'onUpdate:modelValue': async (event) => {
              this.inputs[element.label] = true
              await this.pushChanges()
            },
          })
        case 'BREAK':
          return h('br')
        case 'TEXT':
          // return h('h2', {}, this.interpolate(element.label))
          return h(
            'h2',
            { class: { subtitle: true, draggable: true } },
            this.interpolate(element.label)
          )
      }
    },

    // Bind instances of [[label]] to the appropriate input
    interpolate(text) {
      const replacer = (match, label) => {
        return this.inputs[label]
      }

      return text.replace(/\[\[(.+?)\]\]/, replacer)
    },
  },
}
</script>
