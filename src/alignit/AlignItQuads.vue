<script setup>
const props = defineProps({
  round: Object,
  state: String,
  playerName: String,
  submitVote: Function,
  index: {
    type: Number,
    default: 0,
  },
})

function classify(quadrant) {
  // Use 'voted' and 'done' classes to make square text visible
  switch (props.state) {
    case 'CLUING':
      return ''
    case 'VOTING':
      return props.round.votes[props.playerName] === quadrant ? 'voted' : ''
    case 'DONE':
      return 'done'
  }
}

function quadText(quadrant) {
  // At the end of a round, show who clicked on the quadrant
  if (props.state === 'DONE') {
    return Object.entries(props.round.votes)
      .filter(([voter, vote]) => vote === quadrant)
      .map(([voter, vote]) => voter)
      .sort()
      .join(', ')
  }
  // Otherwise, show the intersection e.g. 'Good & Old'
  return wordify(quadrant, props.round.xAxis, props.round.yAxis)
}

// E.g. wordify('A', ['Good', 'Bad'], ['Old, 'New']) => 'Good & Old'
function wordify(quandrant, xAxis, yAxis) {
  const [x, y] = { A: [0, 0], B: [1, 0], C: [0, 1], D: [1, 1] }[quandrant]
  return `${xAxis[x]} & ${yAxis[y]}`
}

function gradientSrc(quadrant) {
  const corners = {
    A: 'TL',
    B: 'TR',
    C: 'BL',
    D: 'BR',
  }
  const letter = ['A', 'B', 'C', 'D', 'E'][props.index % 5]
  return `/images/illustrations/alignit/Gradient${letter}${corners[quadrant]}.png`
}
</script>

<style>
.square {
  background-color: transparent;
  border: none;
  font-size: 1rem;
  text-align: center;
  padding: 0.25rem;
  line-height: 0;

  filter: opacity(100%);
  color: transparent;

  position: relative;
}

.square.done,
.square.voted {
  color: black;
}

.square:hover {
  cursor: pointer;
  filter: opacity(80%);
  color: black;
}

.square.done:hover {
  cursor: default;
  filter: opacity(100%);
}

.axis-label {
  font-size: 2rem;
  font-family: 'Grand Slang';
  text-align: center;
  letter-spacing: 4px;
  text-transform: uppercase;
}

.x-axis {
  writing-mode: vertical-rl;
  transform: rotate(180deg);

  display: flex;
  justify-content: center;
  align-items: center;
  min-height: min-content;
  min-height: 13em;
}

.end {
  transform: rotate(0deg);
}

.quad-voters {
  line-height: normal;
  position: absolute;
  left: 0;
  right: 0;
  top: 45%;
  padding: 0 1rem;
  text-align: center;
}
</style>

<template>
  <table style="margin: auto">
    <tr>
      <td></td>
      <td colspan="2">
        <div class="axis-label">{{ round.yAxis?.[0] }}</div>
      </td>
      <td></td>
    </tr>
    <tr>
      <td rowspan="2" style="min-width: 3rem">
        <div class="axis-label x-axis">{{ round.xAxis?.[0] }}</div>
      </td>
      <td>
        <button class="square" :class="classify('A')" @click="submitVote('A')">
          <img :src="gradientSrc('A')" />
          <p class="quad-voters">{{ quadText('A') }}</p>
        </button>
      </td>
      <td>
        <button class="square" :class="classify('B')" @click="submitVote('B')">
          <img :src="gradientSrc('B')" />
          <p class="quad-voters">{{ quadText('B') }}</p>
        </button>
      </td>
      <td rowspan="2">
        <div class="axis-label x-axis end">{{ round.xAxis?.[1] }}</div>
      </td>
    </tr>
    <tr>
      <td>
        <button class="square" :class="classify('C')" @click="submitVote('C')">
          <img :src="gradientSrc('C')" />
          <p class="quad-voters">{{ quadText('C') }}</p>
        </button>
      </td>
      <td>
        <button class="square" :class="classify('D')" @click="submitVote('D')">
          <img :src="gradientSrc('D')" />
          <p class="quad-voters">{{ quadText('D') }}</p>
        </button>
      </td>
    </tr>
    <tr>
      <td></td>
      <td colspan="2">
        <div class="axis-label">{{ round.yAxis?.[1] }}</div>
      </td>
      <td></td>
    </tr>
  </table>
</template>
