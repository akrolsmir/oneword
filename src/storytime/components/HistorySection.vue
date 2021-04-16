<script>
import { h } from 'vue'

export default {
  props: {
    response: {
      type: Object, // { story: String, words: Array }
    },
  },
  render() {
    let elements = []
    let rest = this.response?.story
    const words = [...new Set(this.response.words)].sort(
      (a, b) =>
        this.response.story.toLowerCase().indexOf(a) -
        this.response.story.toLowerCase().indexOf(b)
    )
    for (const word of words) {
      const i = rest.toLowerCase().indexOf(word)
      elements.push(
        rest.substring(0, i),
        h(
          'span',
          { class: { 'has-text-weight-semibold has-text-info': true } },
          rest.substring(i, i + word.length)
        )
      )
      rest = rest.substring(i + word.length)
    }
    elements.push(rest)
    return h('p', elements)
  },
}
</script>
