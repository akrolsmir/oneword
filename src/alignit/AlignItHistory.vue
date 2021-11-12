<script setup>
import AlignItQuads from './AlignItQuads.vue'
import { ref } from '@vue/reactivity'

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

const visible = ref(true)
</script>

<style>
/* Position round marker in the upper-right, using absolute positioning */
.round-marker {
  position: absolute;
  top: 1rem;
  right: 1rem;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease-out;
}

.fade-enter-from,
.fade-leave-to {
  transform: translateY(20px);
  opacity: 0;
}
</style>

<template>
  <!-- One Bulma card for each item in history -->
  <p class="mt-6">
    <span class="is-size-4">History</span>
    <button class="button is-ghost" @click="visible = !visible">
      <span v-if="visible">(hide)</span>
      <span v-else>(show)</span>
    </button>
  </p>
  <transition name="fade">
    <div class="wrapper" v-if="visible">
      <div
        class="box p-4 mb-4 has-background-grey-lighter"
        v-for="(round, i) in history.slice().reverse()"
        style="position: relative"
      >
        <h3 class="mb-4 is-size-5">
          {{ round.cluer }}'s clue: "{{ round.clue }}"
        </h3>
        <div class="round-marker">Round {{ history.length - i }}</div>
        <AlignItQuads :round="round" state="DONE" :index="history.length - i" />
      </div>
    </div>
  </transition>
</template>
