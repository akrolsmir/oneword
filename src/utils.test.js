import { expect } from '@esm-bundle/chai'
import { flattenPaths, objectDiff } from './utils'

it('flattens paths', () => {
  expect(flattenPaths({ a: { b: 3 } })).to.deep.equal({ 'a.b': 3 })
})

it('diffs objects', () => {
  const o1 = { a: 1, c: 3 }
  const o2 = { a: 1, b: { c: 2 } }
  expect(objectDiff(o1, o2)).to.deep.equal({ b: { c: 2 } })
})
