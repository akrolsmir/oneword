import firebase from 'firebase/app'
import { updateRoom } from './network'

const db = firebase.firestore()

// Q: Should ingot be built as:
// 1. a Vue composition? 2. Firebase extension? 3. Pure JS library?

/* Structure of an ingot: {
  changes: {
    // Single change object:
    100000: {
      timestamp: 100000,
      author: 'Alpha',
      diff: {},
    },
    200000: {
      timestamp: 200000,
      author: 'Beta',
      // Diffs are updates that work in Firestore
      diff: { title: 'initial', a: 'b' },
    },
    ...
  }
  // Which of the changes is currently selected
  active: 100000,
  // Timestamp of the latest change to include in history
  branch: 400000,
}
*/

export async function updateIngot(path, change) {
  // TODO: what if we're not up to date (active != branch)?
  await db.doc(path).update({
    [`changes.${change.timestamp}`]: change,
  })
}

export function ingot() {}

// Return the array of changes, from the start to the current branch pointer
function history(ingot) {
  const linear = Object.keys(ingot.changes)
    .map(Number)
    .sort((c1, c2) => c1 - c2)

  let timestamp = ingot.branch
  const result = []
  while (timestamp) {
    const change = ingot.changes[timestamp]
    result.unshift(change)
    // If parent is not explicitly set, we reconcile with the previous time
    const prevTimestamp = linear[linear.indexOf(timestamp) - 1]
    timestamp = change.parent || prevTimestamp
  }
  return result
}

// TODO potential issues:
// 1. Date.now() may not be the best hash/identifier
// 2. Arrays are very space-inefficient
// 3. Lacking some kind of compression mechanism?
