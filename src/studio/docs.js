export const docString = `// The "room" object has all game data needed to represent the game.
// When "room" is modified, all players automatically get the changes.
// Things stored in "room" will be saved between states & rounds:
room.foo = 'bar'


// Each round is made up of multiple states
// room.state controls which screen players see.
// To move to a different state:
room.state = 'GUESSING'


// room.history should track the past rounds of the game
// To add the previous round to history:
room.history.push(room.round)
// Then start a new round:
room.round = {}


// When a player interacts with an input (e.g. presses a button, or types
// in a text field), the player's changes are tracked in "room.round"
const typed = room.round.GUESSING.Charlie.type-here


// "inputs()" returns an array of all inputs for one role. 
// Usage: inputs('PHASE.@ROLE.input-label')
inputs('DRAWING.@CLUER.next-phase')
// returns:
[true, true, false]


// "assignRole()" sets the roles for a player or group.
// Same as "room.round.roles.Alice = 'SPY'":
assignRole('Alice', 'SPY')
// Sets everyone to the GUESSER role:
assignRole('EVERYONE', 'GUESSER')
// Rotates who is the next CLUER:
assignRole('NEXT_ALPHABETICAL', 'CLUER')
`
