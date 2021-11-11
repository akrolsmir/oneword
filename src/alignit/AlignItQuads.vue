<script setup>
const props = defineProps({
  round: Object,
  state: String,
  playerName: String,
  submitVote: Function,
})

function colored(quadrant) {
  // While CLUING, all quadrants are grayscale.
  // While VOTING, only the quadrant that the player voted for is colored.
  // While DONE, all voted quadrants are colored.
  switch (props.state) {
    case 'CLUING':
      return false
    case 'VOTING':
      return props.round.votes[props.playerName] === quadrant
    case 'DONE':
      return Object.values(props.round.votes).includes(quadrant)
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
  const g = 'E' // One of A-E. TODO: generate based on the index
  return `/images/illustrations/alignit/Gradient${g}${corners[quadrant]}.png`
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

  filter: grayscale(75%);
  color: transparent;

  position: relative;
}

.square.colored {
  filter: grayscale(0%);
  color: black;
}

.square:hover {
  cursor: pointer;
  filter: grayscale(0%);
  color: black;
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
        <button
          class="square"
          :class="{ colored: colored('A') }"
          @click="submitVote('A')"
        >
          <img :src="gradientSrc('A')" />
          <p class="quad-voters">{{ quadText('A') }}</p>
        </button>
      </td>
      <td>
        <button
          class="square"
          :class="{ colored: colored('B') }"
          @click="submitVote('B')"
        >
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
        <button
          class="square"
          :class="{ colored: colored('C') }"
          @click="submitVote('C')"
        >
          <img :src="gradientSrc('C')" />
          <p class="quad-voters">{{ quadText('C') }}</p>
        </button>
      </td>
      <td>
        <button
          class="square"
          :class="{ colored: colored('D') }"
          @click="submitVote('D')"
        >
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
