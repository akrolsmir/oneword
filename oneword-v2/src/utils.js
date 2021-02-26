import { formatDistanceToNow } from 'date-fns'
import { nouns, verbs, adjectives, compounds } from './words/parts-of-speech'
import {
  pokemonGen1,
  lolChampions,
  dotaHeroes,
  ssbCharacters,
  countries,
} from './words/themes'

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
  const words =
    category === 'custom' ? customWordList : WORD_LISTS[category].words
  return pickRandom(words)
}

export function pickRandom(array) {
  return array[Math.floor(Math.random() * array.length)]
}

export const WORD_LISTS = {
  nouns: { name: 'Nouns', words: nouns },
  verbs: { name: 'Verbs', words: verbs },
  adjectives: { name: 'Adjectives', words: adjectives },
  compounds: { name: 'Compound Words', words: compounds },
  pokemonGen1: { name: 'Pokemon Gen 1', words: pokemonGen1 },
  lolChampions: { name: 'League of Legends Champions', words: lolChampions },
  dotaHeroes: { name: 'Dota Heroes', words: dotaHeroes },
  ssbCharacters: { name: 'Super Smash Bros Fighters', words: ssbCharacters },
  countries: { name: 'Countries', words: countries },
}

export const BASIC_LISTS = [
  'nouns',
  'verbs',
  'adjectives',
  'compounds',
  'countries',
  'custom',
]
export const THEMED_LISTS = [
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
