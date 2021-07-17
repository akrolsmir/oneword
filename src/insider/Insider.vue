<!-- Rules: https://geekmom.com/2019/11/listography/ -->
<!-- Buy: https://www.amazon.com/Listography-Game-May-Best-List/dp/1452151776 -->

<template>
  <BigColumn>
    <button @click="resetRoom">Reset room</button>
    <h2>Playing as: {{ player.name }}</h2>
    <div v-if="player.name == room.round.spy">(You are the spy!)</div>
    <h2>Wordmaster is: {{ room.round.wordmaster }}</h2>

    <!-- Show wordmaster & spy the word -->
    <div
      v-if="
        player.name == room.round.wordmaster || player.name == room.round.spy
      "
    >
      <h2 class="subtitle">The secret word is: {{ room.round.word }}</h2>
    </div>
    <br />

    <!-- Guessers in GUESSING round -->
    <div v-if="room.state == 'GUESSING'">
      <div v-if="player.name != room.round.wordmaster">
        <input
          class="input"
          v-model="player.question"
          placeholder="Type your question!"
        />
        <button class="button" @click="submitQuestion">Submit question</button>
        <br /><br />
      </div>
    </div>

    <!-- Screen where everyone votes for a player -->
    <div v-if="room.state == 'VOTING'">
      <h2 class="subtitle">Vote for who you think is the spy:</h2>
      <template v-for="p in room.players">
        <button
          class="button"
          v-if="p != room.round.wordmaster"
          @click="submitVote(p)"
        >
          {{ p }}
        </button>
      </template>
      <div v-if="iVoted">Your vote has been recorded!</div>
    </div>

    <!-- History of asked questions -->
    <div>
      <h2 class="subtitle">Questions Asked</h2>
      <div
        class="card m-2 p-2"
        v-for="(question, index) in room.round.questions"
      >
        {{ question.asker }} asks: "{{ question.q }}". <br />
        <div v-if="question.a">
          Wordmaster answers: "{{ question.a }}" <br />
        </div>
        <div v-else-if="player.name == room.round.wordmaster">
          <button class="button" @click="submitAnswer(index, 'YES')">
            Yes
          </button>
          <button class="button" @click="submitAnswer(index, 'NO')">No</button>
          <button class="button" @click="submitAnswer(index, 'MAYBE')">
            Maybe
          </button>
        </div>
      </div>
    </div>
  </BigColumn>
</template>

<style>
.background {
  background-color: #e0e7ff;
}
</style>

<script>
import { inject } from 'vue'
import BigColumn from '../components/BigColumn.vue'
import Chatbox from '../components/Chatbox.vue'
import Timer from '../components/Timer.vue'
import Nametag from '../components/Nametag.vue'
import ShareLink from '../components/ShareLink.vue'
import { useRoom } from '../composables/useRoom.js'
import {
  debounce,
  listIncludes,
  pickRandom,
  sanitize,
  orderedEntries,
  pickFromBag,
} from '../utils'

function makeNewRoom(name) {
  return {
    name,
    state: 'GUESSING', // "GUESSING", "VOTING", "DONE"
    people: {},
    round: {
      wordmaster: 'A',
      spy: 'B',
      // C and D are the guessers
      word: 'shark',
      questions: [
        { asker: 'B', q: 'Is it an animal?', a: 'YES' },
        { asker: 'C', q: 'Can you pet it?', a: 'NO' },
      ],
      votes: [
        //   // { voter: 'Austin', vote: 'A' },
        //   // { voter: 'B', vote: 'A' },
        //   // { voter: 'A', vote: 'Austin' },
      ],
    },
    history: [],
    timerLength: 90,
    public: true,
    lastUpdateTime: Date.now(),
  }
}

export default {
  components: {
    BigColumn,
    Chatbox,
    Timer,
    Nametag,
    ShareLink,
  },
  setup() {
    const user = inject('currentUser')
    const roomHelpers = useRoom(user, makeNewRoom)
    roomHelpers.player.timerLength = 90
    return Object.assign(roomHelpers, { user })
  },
  methods: {
    submitQuestion() {
      this.room.round.questions.push({
        asker: this.player.name,
        q: this.player.question,
      })
      const toSave = ['round.questions']

      if (this.player.question == this.room.round.word) {
        // Move on to the voting phase
        this.room.state = 'VOTING'
        toSave.push('state')
      }

      this.saveRoom(...toSave)
    },
    submitAnswer(index, a) {
      const lastQuestion = this.room.round.questions[index]
      lastQuestion.a = a
      this.saveRoom('round.questions')
    },
    submitVote(vote) {
      console.log('vote', vote)
      console.log('iVoted', this.iVoted)

      // Only allow people to vote once
      if (this.iVoted) {
        return
      }

      console.log('proceeding to upload new vote')

      this.room.round.votes.push({
        voter: this.player.name,
        vote: vote,
      })
      const toSave = ['round.votes']

      if (this.room.round.votes.length >= this.room.players.length) {
        this.room.state = 'DONE'
        toSave.push('state')
      }

      this.saveRoom(...toSave)
    },
  },
  computed: {
    iVoted() {
      for (const vote of this.room.round.votes) {
        console.log('inside iVoted', vote, 'player.name', this.player.name)
        if (this.player.name == vote.voter) {
          return true
        }
      }
      return false
    },
  },
}
</script>
