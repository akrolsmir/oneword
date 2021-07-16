import { pickRandom } from '../utils'
import { nouns, verbs, adjectives, compounds } from './parts-of-speech'
import { nouns_zh } from './words_zh'
import {
  pokemonGen1,
  lolChampions,
  dotaHeroes,
  ssbCharacters,
  countries,
} from './themes'

export function randomWord(category = 'nouns', customWordList = [], seed = '') {
  const words =
    category === 'custom' ? customWordList : WORD_LISTS[category].words
  return pickRandom(words, seed) || 'Random word generator broke =('
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
  nouns_zh: { name: '名詞', inline: '詞', words: nouns_zh, tag: 'zh' },
}

export const BASIC_LISTS = [
  'nouns',
  'verbs',
  'adjectives',
  'compounds',
  'countries',
  'custom',
  'nouns_zh',
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
