<template>
  <div class="box m-6">
    Type a string to find the winning
    <a href="https://en.wikipedia.org/wiki/Ghost_%28game%29">Superghost</a>
    word: <br />

    <input v-model="typed" />
    <br /><br />

    <h1>
      Final word for "{{ typed }}": <b>{{ winner }}</b
      >. {{ parityWinner }}
    </h1>
    <h2>
      Valid continuations: {{ Array.from(graph[typed] || []).join(', ') }}
    </h2>

    <br /><br /><br />
    <i
      >Wordlist from <a href="https://github.com/dolph/dictionary">here</a>;
      excluded 'ne'</i
    >
  </div>
</template>

<script>
import { popularWords } from './popular'

// const words = ['happy', 'birthday', 'day', 'hap']
// const words = nouns
const wordsSet = new Set(popularWords)
wordsSet.delete('ne')

const graph = {
  '': new Set('abcdefghijklmnopqrstuvwxyz'.split('')),
  // subword : valid continuations
  // e.g. 'a': {'ha', 'ap'},
}

// Given a particular window e.g. 3, make subwords ["cle", "lea"], etc,
// and connect them to the next level up in graph
function connect(word, window) {
  for (let start = 0; start + window <= word.length; start++) {
    const subword = word.slice(start, start + window)

    if (!graph[subword]) {
      graph[subword] = new Set()
    }

    if (start > 0) {
      const parent = word.slice(start - 1, start + window)
      graph[subword].add(parent)
    }

    if (start + window < word.length) {
      const parent = word.slice(start, start + window + 1)
      graph[subword].add(parent)
    }
  }
}

function connectAll(word) {
  for (let w = word.length - 1; w > 0; w--) {
    connect(word, w)
  }
}

Array.from(wordsSet).map(connectAll)

const winners = {
  // subword : winning word
  // e.g. 'lear': 'lear', 'ear': 'ear', 'ar': 'ear', 'r', 'ear'
  // Then use parity to decide who wins
}

function checkWinner(subword) {
  if (winners[subword]) {
    return winners[subword]
  }
  if (wordsSet.has(subword)) {
    winners[subword] = subword
    return subword
  }

  if (!graph[subword]) {
    winners[subword] = ''
    return ''
  }

  // MINIMAX!
  const parents = Array.from(graph[subword]).map(checkWinner)
  const winner =
    // Try to find a word that doesn't lose
    parents.find((winner) => winner.length % 2 == subword.length % 2) ||
    // Or else just give up
    parents[0]
  winners[subword] = winner
  return winner
}

// e.g. "clear" = P2 win. So from "le", if "lea" only leads to "clear",
// then P1 would not pick "lea".
// But if "le" leads to "lead" and "clear", then:
// P1: l, P2: le, P1: lea, p2: lear/lead
export default {
  data() {
    return {
      graph,
      winners,
      typed: '',
    }
  },
  computed: {
    superwords() {
      return dfsWords(this.typed)
    },
    winner() {
      return checkWinner(this.typed)
    },
    parityWinner() {
      if (this.winner.length == 0) {
        return 'Invalid word!'
      }
      const num = this.winner.length % 2 ? '2' : '1'
      return `P${num} wins!`
    },
  },
}
</script>
