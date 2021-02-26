import { nouns } from '../words/parts-of-speech.js'
import { wordsMatch } from '../utils.js'

export function unpush(array, value) {
  const index = array.indexOf(value)
  if (index !== -1) {
    array.splice(index, 1)
  }
}

export function other(team) {
  return team === 'redTeam' ? 'blueTeam' : 'redTeam'
}

// Keys are just arrays of ints
export function keysEqual(key1, key2) {
  if (key1.length !== key2.length) {
    return false
  }
  for (let i = 0; i < key1.length; i++) {
    if (key1[i] !== key2[i]) {
      return false
    }
  }
  return true
}

export function shuffleArray(array) {
  // From https://stackoverflow.com/a/12646864/1222351
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

// Unique list of random words e.g. randomWords(4) => ['at', 'lol', 'cat', 'yo']
export function randomWords(length) {
  // For now, take out nouns longer than 8 letters; ~758 of 825 nouns left
  const filteredNouns = nouns.filter((word) => word.length <= 8)
  // Assumes nouns has no duplicates.
  return shuffleArray(filteredNouns).slice(0, length)
}

// Key elements will be unique e.g. randomKey(3, 4) => [2, 1, 4]
export function randomKey(length, max) {
  if (length > max) {
    throw "Can't have a longer key than # of words shown!"
  }

  // Generate a list from [1...max], then shuffle, then slice.
  const sequential = [...Array(max).keys()].map((i) => i + 1)
  return shuffleArray(sequential).slice(0, length)
}

export function nextSpy(lastSpy, players) {
  const nextIndex =
    (players.indexOf(lastSpy) + 1 + players.length) % players.length
  return players[nextIndex]
}

// TODO: Duplicated constant
const NO_VOTE = '?'

// votes = { alice: [1, 2, 3], ...}; players = ['alice', ...]
export function finishedVoting(votes, players) {
  // Not done if any player has not yet voted
  if (!arrayContentsEqual(players, Object.keys(votes))) {
    return false
  }
  // Done when every vote is not the default value of NO_VOTE
  return Object.values(votes)
    .flat()
    .every((v) => v !== NO_VOTE)
}

export function arrayContentsEqual(a, b) {
  const bSet = new Set(b)
  return a.length === b.length && a.every((v) => bSet.has(v))
}

const SUM = (a, b) => a + b

// Returns how many of <team>'s messages have been intercepted
export function intercepted(team, history) {
  return history
    .flatMap((entry) =>
      Object.values(entry[team].round.interceptVotes).map((vote) =>
        keysEqual(vote, entry[team].round.key)
      )
    )
    .reduce(SUM, 0)
}

// Returns how many of <team>'s messages have not been correctly decoded
export function dropped(team, history) {
  // Abusing the fact that 0 + false + true = 1
  return history
    .flatMap((entry) =>
      Object.values(entry[team].round.decodeVotes).map(
        (vote) => !keysEqual(vote, entry[team].round.key)
      )
    )
    .reduce(SUM, 0)
}

// Return how many of these guesses match the words
export function checkGuesses(guesses, words) {
  if (guesses.length !== words.length) {
    throw `Guesses and words must be same length! Got ${guesses}, ${words}`
  }
  return guesses.map((guess, i) => wordsMatch(guess, words[i])).reduce(SUM, 0)
}

export function generateNextRoomName(name) {
  const idParts = name.split('-')
  const lastNum = Math.floor(Number(idParts[idParts.length - 1]))
  if (lastNum) {
    // 'aback-place-4' => 'aback-place-5'
    idParts[idParts.length - 1] = `${lastNum + 1}`
  } else {
    // 'aback-place' => 'aback-place-1'
    idParts.push('1')
  }
  return idParts.join('-')
}
