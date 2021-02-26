<template>
  <div class="modal" :class="{ 'is-active': visible }">
    <!-- Modal creators should add @background-click="visible=false" -->
    <!-- TODO: Figure out how animate the fadeOut too. May be hard, as Bulma modals toggle 'display'...-->
    <div
      class="modal-background animate__animated animate__fadeIn animate__faster"
      @click="$emit('background-click')"
    ></div>
    <div class="modal-content animate__animated animate__pulse animate__faster">
      <div
        v-if="content"
        class="modal-card box has-text-centered p-6"
        style="max-width: 500px"
      >
        <div class="title">
          <h2>{{ content.title }}</h2>
        </div>

        <div class="mb-5">
          {{ content.text }}
        </div>

        <div class="buttons">
          <button
            class="button is-warning"
            v-if="content.buttons?.okay"
            @click="okayCallback"
          >
            {{ content.buttons?.okay }}
          </button>

          <button class="button" @click="$emit('cancel')">
            {{ content.buttons?.cancel || 'Close' }}
          </button>
        </div>
      </div>
      <!-- If content is undefined, use the component slot instead -->
      <slot v-else></slot>
    </div>
    <button
      class="modal-close is-large"
      aria-label="close"
      @click="$emit('background-click')"
    ></button>
  </div>
</template>

<script>
import 'animate.css'

export default {
  // NOTE: It's kind of weird to use both callbacks and emitted events...
  emits: ['cancel', 'background-click'],
  props: {
    visible: Boolean,
    /* content: { title, text, buttons: {okay: '', cancel: ''}, callbacks: {okay: ...} } */
    content: Object,
  },
  computed: {
    okayCallback() {
      return this.content.callbacks?.okay || (() => {})
    },
  },
}
</script>
