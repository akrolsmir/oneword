import { formatDistanceToNow } from 'date-fns'
import { nouns, verbs, adjectives, compounds } from './words/parts-of-speech'
import {
  pokemonGen1,
  lolChampions,
  dotaHeroes,
  ssbCharacters,
  countries,
} from './words/themes'
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

export function randomWord(category = 'nouns', customWordList = []) {
  const words =
    category === 'custom' ? customWordList : WORD_LISTS[category].words
  return pickRandom(words) || 'Random word generator broke =('
}

export function pickRandom(array) {
  return array[Math.floor(Math.random() * array.length)]
}

export const WORD_LISTS = {
  nouns: { name: 'Nouns', inline: 'word', words: nouns },
  verbs: { name: 'Verbs', inline: 'verb', words: verbs },
  adjectives: { name: 'Adjectives', inline: 'adjective', words: adjectives },
  compounds: { name: 'Compounds', inline: 'compound word', words: compounds },
  pokemonGen1: {
    name: 'Pokémon: Gen 1',
    inline: 'Pokémon',
    words: pokemonGen1,
  },
  lolChampions: {
    name: 'LoL Champions',
    inline: 'champion',
    words: lolChampions,
  },
  dotaHeroes: { name: 'DotA Heroes', inline: 'hero', words: dotaHeroes },
  ssbCharacters: {
    name: 'SSB Fighters',
    inline: 'SSB fighter',
    words: ssbCharacters,
  },
  countries: { name: 'Countries', inline: 'country', words: countries },
  // Filler so `WORD_LISTS['custom'].name` doesn't break
  custom: { name: 'Custom', inline: 'custom word', words: [] },
}

export const BASIC_LISTS = [
  'nouns',
  'verbs',
  'adjectives',
  'compounds',
  'countries',
  'custom',
]
export const VIDEO_GAME_LISTS = [
  'pokemonGen1',
  'lolChampions',
  'dotaHeroes',
  'ssbCharacters',
]

export function defaultCategories() {
  const categories = Object.fromEntries(
    Object.keys(WORD_LISTS).map((name) => [name, false])
  )
  categories['nouns'] = true
  return categories
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
