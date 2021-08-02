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
  expect(objectDiff(o1, o2)).to.deep.equal({ b: { c: 2 } })
})

it('correctly sets diffs for an object that is overwritten', () => {
  const o1 = { a: { b: 1 } }
  const o2 = { a: {} }
  expect(objectDiff(o1, o2)).to.deep.equal({ a: {} })
})