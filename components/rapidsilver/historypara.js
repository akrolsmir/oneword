Vue.component('history-paragraph', {
  props: {
    response: {
      type: Object, // { story: String, words: Array }
    },
  },
  render(createElement) {
    let elements = [];
    let rest = this.response.story;
    const words = [...new Set(this.response.words)].sort(
      (a, b) => this.response.story.indexOf(a) - this.response.story.indexOf(b)
    );
    for (const word of words) {
      const i = rest.indexOf(word);
      elements.push(rest.substring(0, i), createElement('span', { class: { 'has-text-weight-semibold': true } }, word));
      rest = rest.substring(i + word.length);
    }
    elements.push(rest);
    return createElement('p', elements);
  },
});
