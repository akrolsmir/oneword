Vue.component('sharelink', {
  data: () => ({
    isCopied: false,
  }),
  props: {
    link: String,
  },
  methods: {
    copy() {
      this.$refs.input.select();
      document.execCommand('copy');
      this.$refs.input.setSelectionRange(0, 0);
      this.$refs.input.blur();
      if (!this.isCopied) {
        this.isCopied = true;
        setTimeout(() => { this.isCopied = false }, 1500)
      }
    },
  },
  template: `
<div class="field has-addons">
  <div class="control is-expanded">
    <input
      class="input"
      :class="isCopied ? 'is-success' : 'is-info'"
      style="transition: all 0.1s ease"
      type="text"
      :value=link
      @focus="$event.target.select();"
      ref="input"
      readonly
    />
  </div>
  <div class="control">
    <button 
      class="button" 
      :class="isCopied ? 'is-success' : 'is-info'"
      style="transition: background 0.1s ease"
      @click="copy"
    >
      {{ isCopied ? 'Copied!' : 'Copy' }}
    </button>
  </div>
</div>
  `,
});
  