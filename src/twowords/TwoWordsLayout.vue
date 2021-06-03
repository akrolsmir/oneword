<template>
  <div class="box m-6">
    <div id="gjs">
      <h1>Hello World Component!</h1>
      <ul>
        <li>One</li>
        <li>Two</li>
        <li>Three</li>
      </ul>
    </div>
    <div id="blocks"></div>

    <button @click="shuffle">Shuffle</button>
  </div>
</template>

<style>
.gjs-block {
  width: auto;
  height: auto;
  min-height: auto;
}
</style>

<script>
import 'grapesjs/dist/css/grapes.min.css'
import grapesjs from 'grapesjs'

const blocks = [
  {
    id: 'section', // id is mandatory
    label: '<b>Section</b>', // You can use HTML/SVG inside labels
    attributes: { class: 'gjs-block-section' },
    content: `<section>
  <h1>This is a simple title</h1>
  <div>This is just a Lorem text: Lorem ipsum dolor sit amet</div>
</section>`,
  },
  {
    id: 'text',
    label: 'Text',
    content: '<div data-gjs-type="text">Insert your text here</div>',
  },
  {
    id: 'image',
    label: 'Image',
    // Select the component once it's dropped
    select: true,
    // You can pass components as a JSON instead of a simple HTML string,
    // in this case we also use a defined component type `image`
    content: { type: 'image' },
    // This triggers `active` event on dropped components and the `image`
    // reacts by opening the AssetManager
    activate: true,
  },
]

const interpolatedText = (editor) => {
  editor.DomComponents.addType('interpolated-text', {
    isComponent: (el) => el.tagName === 'H3',

    // This controls what HTML gets exported
    model: {
      defaults: {
        tagName: 'h3',
        attributes: {
          type: 'text',
          name: 'interpolated-name',
        },
        traits: ['namez'],
        components: (model) =>
          `<h3>This is neat: ${JSON.stringify(model)}</h3>`,
      },
    },

    // This controls what's shown in the UI
    view: {
      // Ugh, onrender seems to be called once only...?
      onRender({ el, model }) {
        /** @type {HTMLElement} */ const e = el
        console.log('rendering: ', el)
        e.replaceChildren(`${JSON.stringify(model)}`)

        // el(`<h2>Na na na replacement banana</h2>`)
        /** @type {Document} */ const d = document
        const btn = document.createElement('button')
        btn.textContent = 'PLUS!'
        // This is just an example, AVOID adding events on inner elements,
        // use `events` for these cases
        btn.addEventListener('click', () => {
          alert('clicky!')
        })

        el.appendChild(btn)
      },
    },
  })
}

export default {
  data() {
    return {
      diceRoll: 1,
    }
  },
  mounted() {
    console.log('mounted')
    const editor = grapesjs.init({
      // Indicate where to init the editor. You can also pass an HTMLElement
      container: '#gjs',
      // Get the content for the canvas directly from the element
      // As an alternative we could use: `components: '<h1>Hello World Component!</h1>'`,
      fromElement: true,
      // Size of the editor
      height: '600px',
      width: 'auto',
      // Disable the storage manager for the moment
      storageManager: false,
      // Avoid any default panel
      // panels: { defaults: [] },
      // Show an alert before unload the page with unsaved changes
      noticeOnUnload: false,
      // Show more blocks that can be inserted
      blockManager: {
        appendTo: '#blocks',
        blocks,
      },
      plugins: [interpolatedText],
    })

    editor.addComponents(`<h3>Hello again</h3>`)

    // editor.BlockManager.add('my-block-id', {
    //   // ...
    //   content: {
    //     tagName: 'div',
    //     // draggable: false,
    //     attributes: { 'some-attribute': 'some-value' },
    //     components: [
    //       {
    //         tagName: 'span',
    //         content: '<b>Some static content</b>',
    //       },
    //       {
    //         tagName: 'div',
    //         // use `content` for static strings, `components` string will be parsed
    //         // and transformed in Components
    //         components: (model) => {
    //           return `<h1>Header test: ${JSON.stringify(
    //             model.get('type')
    //           )}</h1>`
    //         },
    //       },
    //     ],
    //   },
    // })

    /*
    [ ] QUESTION: How to transfer dynamic content into a block/component?
    - 1: On some hook (button press? layout change?), rewrite template code
    - 2: Is this built into GrapesJS...?

    QUESTION: How to use an input?
    - See tutorial

    [x] QUESTION: How to disable the lines?
      - Hm... seems to be coming from the panel default "sw-visiblility"
    */

    // The wrapper is the root Component
    // const wrapper = editor.DomComponents.getWrapper()
    // const myComponent = wrapper.find('')[0]
    // myComponent.components().forEach(component => /* ... do something ... */);
    // myComponent.components('<div>New content</div>')
  },
  methods: {
    shuffle() {
      this.diceRoll = Math.floor(Math.random() * 6) + 1
    },
  },
}
</script>
