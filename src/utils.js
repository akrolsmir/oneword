import { singular, plural as pluralur } from 'pluralize'
import { seededRandom } from './vendor/rng'
import { isEmpty, isEqual } from 'lodash'

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

// Extracts a node from an object tree by its path, like "redTeam.players"
// Returns null/undefined when the node is missing.
export function getIn(object, path) {
  let node = object
  for (const part of path.split('.')) {
    node = node && node[part]
  }
  return node
}

// Writes a value to a particular spot in the object, creating empty obj as necessary
// Assumes object is defined
export function setIn(object, path, value) {
  // Base case
  if (!path.includes('.')) {
    object[path] = value
    return
  }

  // Create the next child obj if necessary
  const [next, ...rest] = path.split('.')
  object[next] = object[next] || {}
  // Recurse!
  setIn(object[next], rest.join('.'), value)
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

// Find the deep properties of o2 that are new/changed from o1
// e.g. diffs({a: 1, c: 3}, {a: 1, b: {c: 2}}) => {b: {c: 2}}
// Adapted from https://stackoverflow.com/a/37396358/1222351
export function objectDiff(o1, o2) {
  const result = {}
  for (const key of Object.keys(o2)) {
    const v1 = o1?.[key] // Allow o1 to be undefined
    const v2 = o2[key]
    if (!isEqual(v1, v2)) {
      result[key] = typeof value === 'object' ? objectDiff(v1, v2) : v2
    }
  }
  return result
}

// Consolidate a nested object into a single flat object, for Firestore update
// e.g. {a: {b: 3}} => {'a.b': 3}
export function flattenPaths(object) {
  const result = {}
  for (const [key, value] of Object.entries(object)) {
    if (typeof value === 'object' && !isEmpty(value) && !Array.isArray(value)) {
      // Recurse on non-array, non-empty objects
      for (const [k, v] of Object.entries(flattenPaths(value))) {
        result[`${key}.${k}`] = v
      }
    } else {
      // Base case
      result[key] = value
    }
  }
  return result
}
