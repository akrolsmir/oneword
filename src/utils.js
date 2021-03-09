import { formatDistanceToNow } from 'date-fns'
import pluralize from 'pluralize'

// Turns "This is @NOT okay" to "this-is-not-okay
// Good for making URLs from user input (TODO: try foreign chars)
export function sanitize(input) {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s/g, '-') // whitespace
    .replace(/[^\p{L}-]/gu, '') // not (dash or letter in any language)
}

// "Dr. Mario" matches "dr mario", and "Dogs" matches "dog"
// Good for validating whether a user's input is correct
export function wordsMatch(word1, word2) {
  const w1 = word1.toLowerCase().replace(/[^a-z]/g, '')
  const w2 = word2.toLowerCase().replace(/[^a-z]/g, '')
  // Need to check both directions, or else "birdie" => "birdies" => "birdy"
  return (
    pluralize.singular(w1) === w2 ||
    pluralize.singular(w2) === w1 ||
    pluralize.plural(w1) === w2 ||
    pluralize.plural(w2) === w1
  )
}

export function listIncludes(list, word) {
  return list.some((w) => wordsMatch(w, word))
}

export function timeSince(millis) {
  return formatDistanceToNow(new Date(millis), { addSuffix: true })
}

// Extracts a node from an object tree by its path, like "redTeam.players"
export function getIn(object, path) {
  let node = object
  for (const part of path.split('.')) {
    node = node[part]
  }
  return node
}

export function pickRandom(array) {
  return array[Math.floor(Math.random() * array.length)]
}

// Tetris-style bag; guarantee to cycle through each of the N options
export function pickFromBag(bag, history) {
  // I _think_ this works okay for increasing and decreasing bag sizes?
  const numDrawn = history.length % bag.length
  const drawnStart = Math.max(0, history.length - numDrawn - 1)
  const drawn = history.slice(drawnStart)
  const undrawn = bag.filter((item) => !drawn.includes(item)) // warning: O(N^2)
  return pickRandom(undrawn.length > 0 ? undrawn : bag)
}

// Function wrapper that waits delayMs after the last call before firing.
// Good for grouping Firestore writes with a 300ms delay
// Courtesy of https://stackoverflow.com/a/53486112/1222351
export function debounce(func, delayMs) {
  let timeoutID
  // Note: needs to be `function` instead of `=>`, to use this & arguments
  return function () {
    clearTimeout(timeoutID)
    timeoutID = setTimeout(() => func.apply(this, arguments), delayMs)
  }
}

// Return a stable ordering of the object's [entries, keys]
// Good for keeping game state stable across Firestore pushes
export function orderedEntries(object) {
  return Object.entries(object)
    .sort(([k1, v1], [k2, v2]) => k1.localeCompare(k2))
    .map(([k, v]) => [v, k]) // Swap so entries come before keys
}
