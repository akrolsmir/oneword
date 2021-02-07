import { nouns, compounds, verbs, adjectives } from './many-words.js'
import pluralize from 'pluralize'

export function referSupporter(source) {
  // TODO: Reinstate analytics
  // firebase.analytics().logEvent('view_promotion', {
  //   source: source,
  // })
  window.open('./supporter.html', '_blank')
}

// Returns whether a round's guess is correct.
export function correct(round) {
  const guessMatches =
    pluralize.singular(round.guess) === round.word ||
    pluralize.plural(round.guess) == round.word
  return guessMatches || round.markedCorrect
}
export function totalRounds(room) {
  return room.roundsInGame == 'Unlimited' ? 1024 : room.roundsInGame
}
export function isEnd(room) {
  return (room.history.length + 1) % totalRounds(room) == 0
}
export function score(room) {
  return [...room.history, room.currentRound]
    .slice(-totalRounds(room))
    .filter(correct).length
}

// "ha" and "ha" are dupes, as are "gold" and "golden", but not "hahahaha" and "hah".
export function dupes(clue1, clue2) {
  if (clue1 == clue2) {
    return true
  }
  if (
    clue1.length >= 3 &&
    clue2.length >= 3 &&
    (clue1.includes(clue2) || clue2.includes(clue1))
  ) {
    return true
  }
  return false
}

// Return whether the candidate is a dupe of any of the existing clues.
export function anyDupes(clues, candidate) {
  return clues.some((c) => dupes(c, candidate))
}

export function dedupe(clues, showCollisions = true) {
  const cluesToPlayers = {}
  for (const [player, clue] of Object.entries(clues)) {
    let foundDupe = false
    for (const existingClue of Object.keys(cluesToPlayers)) {
      // If an existing dupe is found, join the strings into the new clue
      if (anyDupes(existingClue.split(' / '), clue)) {
        foundDupe = true
        cluesToPlayers[existingClue].push(player)
        cluesToPlayers[existingClue + ' / ' + clue] =
          cluesToPlayers[existingClue]
        delete cluesToPlayers[existingClue]
        break
      }
    }
    // Otherwise, create a new array for this clue.
    if (!foundDupe) {
      cluesToPlayers[clue] = [player]
    }
  }
  const deduped = Object.entries(cluesToPlayers)
    .filter(([clue, cluers]) => cluers.length == 1)
    .map(([clue, cluers]) => `${cluers[0]} - ${clue}`)
  const conflicts = Object.entries(cluesToPlayers)
    .filter(([clue, cluers]) => cluers.length > 1)
    .map(
      ([clue, cluers]) =>
        cluers.join(' & ') + (showCollisions ? ` - ${clue}` : '')
    )
  let result = showCollisions ? '' : '(Uh, good luck.)'
  if (deduped.length > 0) {
    result = `${deduped.join('\n')}`
  }
  if (conflicts.length > 0) {
    result += `\n\nCollisions:\n${conflicts.join('\n')}`
  }
  return result
}

export function nextGuesser(lastGuesser, players) {
  const nextIndex =
    (players.indexOf(lastGuesser) + 1 + players.length) % players.length
  return players[nextIndex]
}

export function randomWord(category = 'nouns', customWordList = []) {
  const categories = {
    nouns,
    compounds,
    verbs,
    adjectives,
    custom: customWordList,
  }
  const words = categories[category]
  return words[Math.floor(Math.random() * words.length)].toLowerCase()
}

export function nextWord(history, category = 'nouns', customWordList = []) {
  let word
  let loops = 0
  do {
    loops++
    if (loops > 10000) {
      return "You're out of custom words..."
    }
    // TODO: consider generating a stable next word using seeded RNG.
    word = randomWord(category, customWordList)
  } while (history.map((round) => round.word).includes(word))
  return word
}

export function nextCategory(categories) {
  const enabled = Object.keys(categories).filter((c) => categories[c])
  return enabled[Math.floor(Math.random() * enabled.length)]
}

export function capitalize(str) {
  return str ? str[0].toLocaleUpperCase() + str.substring(1) : ''
}
