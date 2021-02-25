import { formatDistanceToNow } from 'date-fns'
import { nouns, verbs, adjectives, compounds } from './words/parts-of-speech'

// Turns "This is @NOT okay" to "this-is-not-okay
// Good for URLs (TODO: try foreign chars)
export function sanitize(input) {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s/g, '-') // whitespace
    .replace(/[^\p{L}-]/gu, '') // not (dash or letter in any language)
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
