<script setup>
const props = defineProps({
  round: Object,
  state: String,
  playerName: String,
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
</script>

<style>
.square {
  width: 230px;
  height: 200px;
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

.y-axis {
  font-size: 2rem;
  font-family: 'Grand Slang';
  text-align: center;
  letter-spacing: 4px;
  text-transform: uppercase;
}

.x-axis {
  font-size: 2rem;
  font-family: 'Grand Slang';
  text-align: center;
  letter-spacing: 4px;
  text-transform: uppercase;

  writing-mode: vertical-rl;
  transform: rotate(180deg);

  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 14em;
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
  <table>
    <tr>
      <td></td>
      <td colspan="2">
        <div class="y-axis">{{ round.yAxis?.[0] }}</div>
      </td>
      <td></td>
    </tr>
    <tr>
      <td rowspan="2" style="min-width: 3rem">
        <div class="x-axis">{{ round.xAxis?.[0] }}</div>
      </td>
      <td
        class="square"
        :class="{ colored: colored('A') }"
        @click="submitVote('A')"
      >
        <img src="/images/illustrations/alignit/GradientTL.png" />
        <p class="quad-voters">{{ quadText('A') }}</p>
      </td>
      <td
        class="square"
        :class="{ colored: colored('B') }"
        @click="submitVote('B')"
      >
        <img src="/images/illustrations/alignit/GradientTR.png" />
        <p class="quad-voters">{{ quadText('B') }}</p>
      </td>
      <td rowspan="2">
        <div class="x-axis end">{{ round.xAxis?.[1] }}</div>
      </td>
    </tr>
    <tr>
      <td
        class="square"
        :class="{ colored: colored('C') }"
        @click="submitVote('C')"
      >
        <img src="/images/illustrations/alignit/GradientBL.png" />
        <p class="quad-voters">{{ quadText('C') }}</p>
      </td>
      <td
        class="square"
        :class="{ colored: colored('D') }"
        @click="submitVote('D')"
      >
        <img src="/images/illustrations/alignit/GradientBR.png" />
        <p class="quad-voters">{{ quadText('D') }}</p>
      </td>
    </tr>
    <tr>
      <td></td>
      <td colspan="2">
        <div class="y-axis">{{ round.yAxis?.[1] }}</div>
      </td>
      <td></td>
    </tr>
  </table>
</template>
