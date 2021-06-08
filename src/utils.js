import { formatDistanceToNow } from 'date-fns'
import { singular, plural as pluralur } from 'pluralize'
import { seededRandom } from './vendor/rng'

// Compile these regexes for performance
const RE_MATCH_LETTER_DASH = /[^\p{L}-]/gu // dash, or letter in any language
const RE_MATCH_WHITESPACE = /\s/g
const RE_MATCH_LETTER = /[^\p{L}]/gu

// Turns "This is @NOT okay" to "this-is-not-okay
// Good for making URLs from user input (TODO: try foreign chars)
export function sanitize(input) {
  return input
    .trim()
    .toLowerCase()
    .replace(RE_MATCH_WHITESPACE, '-')
    .replace(RE_MATCH_LETTER_DASH, '')
}

// Cache results from the pluralize lib, since each call is fairly expensive
const cache = { single: {}, plural: {} }

// "Dr. Mario" matches "dr mario", and "Dogs" matches "dog"
// Good for validating whether a user's input is correct
export function wordsMatch(word1, word2) {
  const w1 = word1.toLowerCase().replace(RE_MATCH_LETTER, '')
  const w2 = word2.toLowerCase().replace(RE_MATCH_LETTER, '')
  function single(word) {
    return cache.single[word] || (cache.single[word] = singular(word))
  }
  function plural(word) {
    return cache.plural[word] || (cache.plural[word] = pluralur(word))
  }
  // Need to check both directions, or else "birdie" => "birdies" => "birdy"
  return (
    single(w1) === w2 ||
    single(w2) === w1 ||
    plural(w1) === w2 ||
    plural(w2) === w1
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

export function pickRandom(array, seed = '') {
  const rand = seed ? seededRandom(seed) : Math.random()
  return array[Math.floor(rand * array.length)]
}

// Tetris-style bag; guarantee to cycle through each of the N options
export function pickFromBag(bag, history) {
  // I _think_ this works okay for increasing and decreasing bag sizes?
  const numDrawn = history.length % bag.length
  const drawnStart = Math.max(0, history.length - numDrawn)
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
