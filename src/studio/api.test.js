import { expect } from '@esm-bundle/chai'
import { assignRole, lookup } from './api'

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
