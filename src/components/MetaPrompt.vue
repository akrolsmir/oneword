<template>
  <BigColumn>
    <h1 class="fancy big mb-4">MetaPrompt</h1>
    <div class="box prompt is-italic">
      {{ promptCard.text }}
    </div>
    <textarea
      class="textarea"
      v-model="text"
      placeholder="Respond here..."
      @keydown.enter="handleEnter"
    ></textarea>
    <div class="buttons mt-2">
      <button class="button is-info" @click="submitCard">
        Submit (Ctrl + Enter)
      </button>
      <button class="button" @click="shuffle">
        Shuffle (Ctrl + Shift + Enter)
      </button>
    </div>

    <!-- History -->
    <h2 class="fancy mb-2 mt-6">All Cards</h2>
    Filter: <input class="input mb-2" v-model="filter" />
    <div class="history" v-for="card in history" :key="cards.createTime">
      <p>{{ card.text }}</p>
      <br />
      <p style="color: #888">
        <i
          >{{ timeSince(card.createTime) }} • By {{ card.author }} •
          <a @click="deleteCard(card)">Delete</a>
        </i>
      </p>
    </div>

    <div class="is-italic has-text-centered">
      Inspired by
      <a
        href="https://www.lesswrong.com/posts/PNoyBBJ4c7pTKqpdh/metaprompt-a-tool-for-telling-yourself-what-to-do"
        >this post by abramdemski</a
      >
    </div>
  </BigColumn>
</template>

<script>
import { db } from '../firebase/network'
import { pickRandom, timeSince } from '../utils'
import BigColumn from './BigColumn.vue'

const DEFAULT_PROMPT = `Create a new #prompt.

Don't forget to tag it "#prompt" so that the shuffler can find it.
(Tag it "#prompt" whether or not it is a metaprompt; they're all prompts.)

If you're not sure what prompt to add, think about what your MetaPrompt is currently missing.
Are there any things you want to do with your MetaPrompt which you're not currently doing?
Any type of prompt which you wish was more common?
It's OK if your new prompt is just a slight variation of an old one; add a bit of extra inspiration or a slightly different take on the same question.
`

export default {
  components: {
    BigColumn,
  },
  data() {
    return {
      cards: [
        {
          text: DEFAULT_PROMPT,
          createTime: Date.now(),
          author: 'Austin',
        },
      ],
      promptCard: {},
      text: '',
      filter: '',
    }
  },
  async mounted() {
    const deck = await loadDeck('default-deck')
    this.cards = deck.cards
    this.shuffle()
  },
  methods: {
    timeSince,
    async handleEnter(event) {
      if (event.ctrlKey || event.metaKey) {
        if (event.shiftKey) {
          this.shuffle()
        } else {
          await this.submitCard()
        }
      }
    },
    async submitCard() {
      this.cards.push({
        text: this.text,
        createTime: Date.now(),
        author: 'Austin',
      })
      await saveCards('default-deck', this.cards)
      this.text = ''
      this.shuffle()
    },
    async deleteCard(card) {
      this.cards = without(this.cards, card)
      await saveCards('default-deck', this.cards)
    },
    // Try shuffling until we get a unique result.
    // TODO: Could try to write this functional-ly
    shuffle(iterationsUntilDupe = 100) {
      const nextCard = pickRandom(tagged(this.cards, '#prompt'))
      if (nextCard === this.promptCard && iterationsUntilDupe > 0) {
        this.shuffle(iterationsUntilDupe - 1)
      } else {
        this.promptCard = nextCard
      }
    },
  },
  computed: {
    history() {
      return this.cards
        .filter((card) => card.text.includes(this.filter))
        .reverse()
    },
  },
}

function without(array, item) {
  return array.filter((a) => a !== item)
}

async function saveCards(deckId, cards) {
  await db.doc(`metaprompt/${deckId}`).set({ cards: cards })
}

async function loadDeck(deckId) {
  const doc = await db.doc(`metaprompt/${deckId}`).get()
  return doc.data()
}

function tagged(cards, tag) {
  return cards.filter((card) => card.text.includes(tag))
}
</script>

<style scoped>
.background {
  background-color: #ecfdf5;
}
.prompt {
  white-space: pre-wrap;
}
.history {
  white-space: pre-wrap;
  border: 1px solid #aaa;
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 1rem;
}
</style>
