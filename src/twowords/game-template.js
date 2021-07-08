// Newer (v-craft) breakdown of layout
export const layouts = {
  GUESSING: {
    CLUER: '{...}',
  },
}

export const twoWordsRules = {
  states: ['GUESSING', 'CLUEING', 'DONE'],
  layouts,
  goal: {
    type: 'COLLAB',
    end: 'ROUNDS',
    target: 13,
  },
  roles: {
    CLUER: 1,
    GUESSER: 'REST',
  },
  // Rerun each time the inputs have changed
  code: {
    CLUEING: `if (inputs('CLUEING.@CLUER.Submit clue!').every(Boolean)) {
room.state = 'GUESSING'
changes.push('state')
// TODO: check for collisions, etc
}`,
    GUESSING: `if (inputs('GUESSING.@GUESSER.Submit guess!').every(Boolean)) {
room.state = 'DONE'
changes.push('state')
}`,
    DONE: `const anyone = inputs('DONE.@CLUER.Next round').concat(
inputs('DONE.@GUESSER.Next round')
)
if (anyone.some(Boolean)) {
room.state = 'CLUEING'
room.history.push(room.round)
room.round = {}
changes.pop() // Remove the original input change; it's already in history
changes.push('state', 'history', 'round')
}`,
  },
}

// Old (ElementList) breakdown of layout
export const views = {
  CLUEING: {
    CLUER: [
      { type: 'TEXT_INPUT', label: 'Enter your clue' },
      { type: 'BUTTON', label: 'Submit clue!' },
      { type: 'BREAK' },
      { type: 'BREAK' },
      { type: 'BUTTON', label: 'Skip' },
      { type: 'TEXT', label: `You typed in: [[Enter your clue]]` },
    ],
    GUESSER: [{ type: 'TEXT', label: 'Waiting for clues...' }],
  },
  GUESSING: {
    CLUER: [{ type: 'TEXT', label: 'Waiting for GUESSER to guess...' }],
    GUESSER: [
      { type: 'TEXT_INPUT', label: 'Enter your guess' },
      { type: 'BUTTON', label: 'Submit guess!' },
    ],
  },
  DONE: {
    CLUER: [
      { type: 'TEXT', label: 'CLUER, you are now done.' },
      { type: 'BUTTON', label: 'Next round' },
    ],
    GUESSER: [
      { type: 'TEXT', label: 'GUESSER, you are now done.' },
      { type: 'BUTTON', label: 'Next round' },
    ],
  },
}
