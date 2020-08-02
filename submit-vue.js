Vue.component('Submit', {
  data() {
    return {
      contents: '',
    };
  },
  props: {
    buttonText: String,
    placeholder: String,
    // Should take in the contents as the sole parameter
    invalid: Function,
    onSubmit: Function,
  },
  methods: {
    submit() {
      if (!this.invalid(this.contents)) {
        this.onSubmit(this.contents);
        this.contents = '';
      }
    },
  },
  template: `
  <div class="field has-addons">
    <div class="control is-expanded">
      <input class="input" :placeholder="placeholder" v-model="contents" @keyup.enter="submit"
        :class="{'is-danger': invalid(contents)}">
    </div>
    <div class="control">
      <button class="button" @click="submit" :disabled="invalid(contents)">
        {{ buttonText }}
      </button>
    </div>
  </div>
  `,
});
