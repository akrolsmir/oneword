// From https://stackoverflow.com/a/47593316

// Takes a string and outputs a 32-bit seed generator
function xmur3(str) {
  for (var i = 0, h = 1779033703 ^ str.length; i < str.length; i++)
    (h = Math.imul(h ^ str.charCodeAt(i), 3432918353)),
      (h = (h << 13) | (h >>> 19))
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    return (h ^= h >>> 16) >>> 0
  }
}

// Takes a 32-bit seed and outputs a random generator from 0 to 1
function mulberry32(a) {
  return function () {
    var t = (a += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Outputs a random float from 0 to 1
export function seededRandom(str = '') {
  const seeder = xmur3(str)
  const rng = mulberry32(seeder())
  return rng()
}
