if (!room.round.red_prompt) {
  // Assign roles to players
  assignRole('EVERYONE', 'RED_GUESSER')
  assignRole('NEXT_ALPHABETICAL', 'RED_CLUER')

  // Pick out the original prompt
  const percent = pickRandom([10, 20, 30, 40, 50, 60, 70, 80, 90])
  const word1 = pickRandom(WORDLISTS.NOUNS)
  const word2 = pickRandom(WORDLISTS.NOUNS)
  room.round.red_prompt =
    `What word is ${percent}% ${word1} ` + `and ${100 - percent}% ${word2}?`
}

const red_cluer = getPlayers('RED_CLUING')[0]
const red_clue = inputy('red-team-clue')[red_cluer]
const submitted = inputy('submit')[red_cluer]
if (red_clue && submitted) {
  room.round.red_clue = red_clue
  room.state = 'RED_GUESSING'
}
