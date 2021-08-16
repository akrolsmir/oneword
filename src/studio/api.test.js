import { expect } from '@esm-bundle/chai'
import { assignRole, inputs, lookup, powerset } from './api'

const makeRoom = () => ({
  round: { roles: {} },
  players: ['Alpha', 'Beta', 'Charlie'],
  history: [],
})

it('Assigns the correct roles', () => {
  const room = makeRoom()
  assignRole(room, 'EVERYONE', 'GUESSER')
  assignRole(room, 'Alpha', 'CLUER')
  expect(room.round.roles).to.deep.equal({
    Alpha: 'CLUER',
    Beta: 'GUESSER',
    Charlie: 'GUESSER',
  })
  expect(lookup(room, '@GUESSER')).to.deep.equal(['Beta', 'Charlie'])
})

it('Correctly uses NEXT_ALPHABETICAL with no history', () => {
  const room = makeRoom()
  assignRole(room, 'NEXT_ALPHABETICAL', 'FIRST')
  expect(room.round.roles).to.deep.equal({
    Alpha: 'FIRST',
  })
})

it('Correctly rotates the cluer with NEXT_ALPHABETICAL', () => {
  const room = makeRoom()
  assignRole(room, 'EVERYONE', 'GUESSER')
  assignRole(room, 'Alpha', 'CLUER')
  // Create a new round
  room.history.push(room.round)
  room.round = { roles: {} }

  assignRole(room, 'EVERYONE', 'GUESSER')
  assignRole(room, 'NEXT_ALPHABETICAL', 'CLUER')
  expect(room.round.roles).to.deep.equal({
    Alpha: 'GUESSER',
    Beta: 'CLUER',
    Charlie: 'GUESSER',
  })
})

it('Gets inputs from a room', () => {
  const room = makeRoom()
  assignRole(room, 'EVERYONE', 'GUESSER')
  room.round.GUESSING = {
    Alpha: { 'favorite-pet': 'dog' },
    Beta: { 'favorite-pet': 'cat' },
  }

  expect(inputs(room, 'GUESSING.@GUESSER.favorite-pet')).to.deep.equal([
    'dog',
    'cat',
    undefined,
  ])
})

it('Calculates powersets', () => {
  expect(powerset([[1], [2, 3], [4, 5]])).to.deep.equal([
    [1, 2, 4],
    [1, 2, 5],
    [1, 3, 4],
    [1, 3, 5],
  ])
})
