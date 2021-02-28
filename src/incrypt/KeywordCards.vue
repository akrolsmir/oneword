<template>
  <div class="columns words">
    <div class="column" v-for="(word, i) in room[team].words">
      <div
        class="notification words"
        :class="team === 'redTeam' ? 'is-danger' : 'is-info'"
      >
        <small>Keyword {{ i + 1 }}</small>
        <!-- Show the word, or '???' if previewing the other team. -->
        <h2 v-if="myTeamId && myTeamId !== team">???</h2>
        <h2 v-else>{{ word }}</h2>
        <!-- Show past guesses for this word -->
        <ul>
          <li v-for="(entry, e) in room.history">
            <span v-if="entry[team].round.key.includes(i + 1)">
              {{
                entry[team].round.encode[entry[team].round.key.indexOf(i + 1)]
              }}
            </span>
            &nbsp;
          </li>
        </ul>
        <!-- If previewing guesses, also show what your teammates think -->
        <div v-if="!(myTeamId && myTeamId === team)">
          <br />
          <div v-for="(guesses, player) in room[team].wordGuesses">
            <div v-if="guesses[i]">{{ player }}: {{ guesses[i] }}</div>
          </div>
        </div>
        <ul>
          <li v-for="(entry, e) in room.history"></li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    // Which team's cards to show
    team: String,
    room: Object,
    // If provided, we're still in-game; hide info as appropriate
    myTeamId: String,
  },
}
</script>

<style scoped>
/* TODO: Dedupe styles with Incrypt.vue */
h1,
h2,
h3 {
  font-family: 'Merienda One', cursive;
}

h1 {
  font-size: 40px;
}

h2 {
  margin-top: 16px;
  font-size: 24px;
}

/* Narrow the gap between words */
.words.columns {
  margin: -0.25rem;
}

.words.columns > .column {
  padding: 0.25rem;
}

.words.notification {
  padding: 1rem 1.25rem 1rem 1.25rem;
}
</style>
