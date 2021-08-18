import { expect } from '@esm-bundle/chai'
import { flattenPaths, objectDiff } from './utils'

it('flattens paths', () => {
  expect(flattenPaths({ a: { b: 3 } })).to.deep.equal({ 'a.b': 3 })
  // Empty objects should show up in paths
  expect(flattenPaths({ a: {} })).to.deep.equal({ a: {} })
  // Arrays should not further flatten
  expect(flattenPaths({ a: [1] })).to.deep.equal({ a: [1] })
  expect(flattenPaths({ a: [{ b: 3 }, 1] })).to.deep.equal({ a: [{ b: 3 }, 1] })
})

it('diffs objects', () => {
  const o1 = { a: 1, c: 3 }
  const o2 = { a: 1, b: { c: 2 } }
  expect(objectDiff(o1, o2)).to.deep.equal({ b: { c: 2 }, c: undefined })
})

it('identifies the smallest possible diff', () => {
  const o1 = { a: { b: 1 } }
  const o2 = { a: { b: 1, c: 2 } }
  expect(objectDiff(o1, o2)).to.deep.equal({ a: { c: 2 } })
})

it('handles array diffs by always overwriting', () => {
  const o1 = { a: [1, 2], b: {} }
  const o2 = { a: [1], b: [3] }
  expect(objectDiff(o1, o2)).to.deep.equal({ a: [1], b: [3] })
})

it('marks deleted items as undefined', () => {
  const o1 = { a: { b: 1 } }
  const o2 = { a: {} }
  expect(objectDiff(o1, o2)).to.deep.equal({ a: { b: undefined } })
})

it('marks more deleted items as undefined', () => {
  const o1 = { a: { b: { b: 1 }, c: 2, d: 3 } }
  const o2 = { a: { e: 4 } }
  expect(objectDiff(o1, o2)).to.deep.equal({
    a: { b: undefined, c: undefined, d: undefined, e: 4 },
  })
})
