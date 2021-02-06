// Remember to import animate.css, eg:
// <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/animate.css@4.1.1/animate.min.css" />

Vue.component('animated-modal', {
  props: {
    visible: Boolean,
  },
  methods: {
    backgroundClick() {
      // Modal creators should add `@background-click="visible=false"`
      this.$emit('background-click');
    },
  },
  template: `
<div class="modal" :class="{'is-active': visible}">
  <!-- TODO: Figure out how animate the fadeOut too. May be hard, as Bulma modals toggle 'display'...-->
  <div
    class="modal-background animate__animated animate__fadeIn animate__faster"
    @click="backgroundClick"
  ></div>
  <div class="modal-content animate__animated animate__pulse animate__faster">
    <slot></slot>
  </div>
</div>
  `,
});
