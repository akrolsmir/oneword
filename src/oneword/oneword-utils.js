import { wordsMatch } from '../utils.js'
import { randomWord } from '../words/lists'

// Returns whether a round's guess is correct.
export function correct(round) {
  return wordsMatch(round.guess, round.word) || round.markedCorrect
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
    .sort()
  const conflicts = Object.entries(cluesToPlayers)
    .filter(([clue, cluers]) => cluers.length > 1)
    .map(
      ([clue, cluers]) =>
        cluers.join(' & ') + (showCollisions ? ` - ${clue}` : '')
    )
    .sort()
  let result = showCollisions ? '' : this.$t('onewordUtil.collisionLuck')
  if (deduped.length > 0) {
    result = `${deduped.join('\n')}`
  }
  if (conflicts.length > 0) {
    result += `\n\n${this.$t('onewordUtil.collision')}\n${conflicts.join('\n')}`
  }
  return result
}

export function nextGuesser(lastGuesser, players) {
  const nextIndex =
    (players.indexOf(lastGuesser) + 1 + players.length) % players.length
  return players[nextIndex]
}

export function nextWord(
  history,
  category = 'nouns',
  customWordList = [],
  t = null
) {
  let word
  let loops = 0
  do {
    if (loops > 10000) {
      return t('onewordUtil.outOfWord')
    }
    // After the initial (0th) loop, keep updating seed to create new words
    const seed = seedFromHistory(history) + (loops || '')
    word = randomWord(category, customWordList, seed)
    loops++
  } while (history.map((round) => round.word).includes(word))
  return word
}

// Generate a deterministic seed string for a particular game history
// Returns '' if history is empty
function seedFromHistory(history) {
  return history
    .flatMap((round) => Object.values(round.clues).concat(round.word))
    .sort()
    .join(', ')
}

export function capitalize(str) {
  return str ? str[0].toLocaleUpperCase() + str.substring(1) : ''
}

export function listPlayers(room) {
  const fromPeople = Object.entries(room.people || {})
    .filter(([_name, person]) => person.state !== 'WATCHING')
    .map(([name, _person]) => name)
  // Backfill with room.players; TODO remove after 2021-04-09
  const deduped = [...new Set(fromPeople.concat(room.players || []))]
  return deduped.sort()
}
