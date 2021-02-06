// Remember to import animate.css, eg:
// <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/animate.css@4.1.1/animate.min.css" />

// Emits: 'cancel', 'background-click'.
// NOTE: It's kind of weird to use both callbacks and emitted events...
Vue.component('animated-modal', {
  props: {
    visible: Boolean,
    /* content: { title, text, buttons: {okay: '', cancel: ''}, callbacks: {okay: ...} } */
    content: Object,
  },
  template: `
<div class="modal" :class="{'is-active': visible}">
  <!-- Modal creators should add @background-click="visible=false" -->
  <!-- TODO: Figure out how animate the fadeOut too. May be hard, as Bulma modals toggle 'display'...-->
  <div
    class="modal-background animate__animated animate__fadeIn animate__faster"
    @click="$emit('background-click')"
  ></div>
  <div class="modal-content animate__animated animate__pulse animate__faster">
    <div v-if="content" class="modal-card" style="max-width: 500px">
      <header class="modal-card-head has-text-centered">
        <p class="modal-card-title">{{ content.title }}</p>
      </header>
      <section class="modal-card-body px-6" style="white-space: pre-wrap"
      >{{ content.text }}</section>
      <footer class="modal-card-foot px-6">
        <button class="button is-warning" @click="content.callbacks.okay">{{ content.buttons.okay }}</button>
        <button class="button" @click="$emit('cancel')">{{ content.buttons.cancel }}</button>
      </footer>
    </div>
    <!-- If content is undefined, use the component slot instead -->
    <div v-else>
      <slot></slot>
    </div>
  </div>
</div>
  `,
});
