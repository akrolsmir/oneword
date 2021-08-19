import { expect } from '@esm-bundle/chai'
import {
  applyDiff,
  flattenPaths,
  objectDiff,
  replaceValues,
  stripUndefined,
} from './utils'

function applyNestedDiff(object, diff) {
  return stripUndefined(applyDiff(object, flattenPaths(diff)))
}

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
  const diff = { b: { c: 2 }, c: undefined }
  expect(objectDiff(o1, o2)).to.deep.equal(diff)
  expect(applyNestedDiff(o1, diff)).to.deep.equal(o2)
})

it('identifies the smallest possible diff', () => {
  const o1 = { a: { b: 1 } }
  const o2 = { a: { b: 1, c: 2 } }
  const diff = { a: { c: 2 } }
  expect(objectDiff(o1, o2)).to.deep.equal(diff)
  expect(applyNestedDiff(o1, diff)).to.deep.equal(o2)
})

it('handles array diffs by always overwriting', () => {
  const o1 = { a: [1, 2], b: {} }
  const o2 = { a: [1], b: [3] }
  const diff = { a: [1], b: [3] }
  expect(objectDiff(o1, o2)).to.deep.equal(diff)
  expect(applyNestedDiff(o1, diff)).to.deep.equal(o2)
})

it('marks deleted items as undefined', () => {
  const o1 = { a: { b: 1 } }
  const o2 = { a: {} }
  const diff = { a: { b: undefined } }
  expect(objectDiff(o1, o2)).to.deep.equal(diff)
  expect(applyNestedDiff(o1, diff)).to.deep.equal(o2)
})

it('marks more deleted items as undefined', () => {
  const o1 = { a: { b: { b: 1 }, c: 2, d: 3 } }
  const o2 = { a: { e: 4 } }
  const diff = {
    a: { b: undefined, c: undefined, d: undefined, e: 4 },
  }
  expect(objectDiff(o1, o2)).to.deep.equal(diff)
  expect(applyNestedDiff(o1, diff)).to.deep.equal(o2)
})

it('strips out undefined', () => {
  expect(stripUndefined('blah')).to.equal('blah')
  expect(stripUndefined(undefined)).to.equal(undefined)
  expect(stripUndefined({ a: undefined, b: 3 })).to.deep.equal({ b: 3 })
  expect(stripUndefined([1, undefined, 3, undefined])).to.deep.equal([1, 3])
  expect(
    stripUndefined([{ a: undefined, b: 3, c: [undefined] }, undefined])
  ).to.deep.equal([{ b: 3, c: [] }])
})

it('replaces values', () => {
  expect(replaceValues('blah')).to.equal('blah')
  expect(replaceValues(undefined, undefined, 'new')).to.equal('new')
  expect(
    replaceValues(
      [{ a: undefined, b: 3, c: [undefined] }, undefined],
      /* target = */ undefined,
      /* newValue = */ 'new'
    )
  ).to.deep.equal([{ a: 'new', b: 3, c: ['new'] }, 'new'])
})
