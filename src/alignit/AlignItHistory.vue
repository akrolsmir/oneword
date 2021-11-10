<script setup>
import AlignItQuads from './AlignItQuads.vue'
const props = defineProps({
  history: {
    type: Array,
    required: true,
  },
})

// E.g. wordify('A', ['Good', 'Bad'], ['Old, 'New']) => 'Good & Old'
function wordify(quandrant, xAxis, yAxis) {
  const [x, y] = { A: [0, 0], B: [1, 0], C: [0, 1], D: [1, 1] }[quandrant]
  return `${xAxis[x]} & ${yAxis[y]}`
}

function voters(quadrant, round) {
  return Object.entries(round.votes)
    .filter(([voter, vote]) => vote === quadrant)
    .map(([voter, vote]) => voter)
    .join(', ')
}
</script>

<style>
/* Position round marker in the upper-right, using absolute positioning */
.round-marker {
  position: absolute;
  top: 1rem;
  right: 1rem;
}
</style>

<template>
  <!-- One Bulma card for each item in history -->
  <h2 class="subtitle mt-4">History</h2>
  <div
    class="box p-4 mb-4 has-background-grey-lighter"
    v-for="(round, i) in history.slice().reverse()"
    style="position: relative"
  >
    <h3 class="is-size-4 mb-4">{{ round.cluer }}'s clue: "{{ round.clue }}"</h3>
    <div class="round-marker">Round {{ history.length - i }}</div>
    <AlignItQuads :round="round" state="DONE" />
  </div>
</template>
