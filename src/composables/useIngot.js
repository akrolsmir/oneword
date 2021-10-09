import { computed, reactive } from 'vue'
import { isEmpty } from 'lodash'
import { objectDiff, flattenPaths, applyDiff, stripUndefined } from '../utils'

export function useIngot(ingot) {
  const defaultIngot = {
    /* Diffs are updates that work in Firestore */
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
        diff: { title: 'initial', a: 'b' },
      },
      300000: {
        timestamp: 300000,
        author: 'Alpha',
        diff: { title: 'changed', 'foo.bar': 3 },
      },
      400000: {
        timestamp: 400000,
        author: 'Charlie',
        diff: { a: undefined },
      },
    },
    /* Which of the diffs is currently selected */
    active: 100000,
    /* Timestamp of the latest change to include in history */
    branch: 400000,
    /* TODO: could also add a reflog, if we have "click to set active/branch" */
  }

  const ingotx = reactive(ingot || defaultIngot)

  // COMPUTED
  const changesArray = computed(() => {
    const linear = Object.keys(ingotx.changes)
      .map(Number)
      .sort((c1, c2) => c1 - c2)

    let timestamp = ingotx.branch
    const result = []
    while (timestamp) {
      const change = ingotx.changes[timestamp]
      result.unshift(change)
      // If parent is not explicitly set, we reconcile with the previous time
      const prevTimestamp = linear[linear.indexOf(timestamp) - 1]
      timestamp = change.parent || prevTimestamp
    }
    return result
  })

  const diffs = computed(() => {
    return changesArray.value.map((change) => change.diff)
  })

  const current = computed(() => {
    return stateAt(ingotx.active)
  })

  // METHODS
  function index(timestamp) {
    return changesArray.value.indexOf(ingotx.changes[timestamp])
  }
  function stateAt(timestamp) {
    const reapplied = diffs.value
      .slice(0, index(timestamp) + 1)
      .reduce(applyDiff)
    return stripUndefined(reapplied)
  }
  function undo() {
    const newIndex = Math.max(0, index(ingotx.active) - 1)
    ingotx.active = changesArray.value[newIndex].timestamp
  }
  function redo() {
    const newIndex = Math.min(
      changesArray.value.length - 1,
      index(ingotx.active) + 1
    )
    ingotx.active = changesArray.value[newIndex].timestamp
  }
  function jump(timestamp) {
    ingotx.active = timestamp
    ingotx.branch = timestamp
    // Bug: After jumping, didn't expect to reconcile...
  }

  function apply(diff) {
    if (!isEmpty(diff)) {
      const timestamp = Date.now()
      ingotx.changes[timestamp] = {
        timestamp,
        author: 'Austin TODO',
        diff,
      }
      if (ingotx.active !== ingotx.branch) {
        // Start a new branch, rather than reconciling
        ingotx.changes[timestamp].parent = ingotx.active
      }
      jump(timestamp)
    }
  }

  function set(newValue) {
    const diff = flattenPaths(objectDiff(current.value, newValue))
    apply(diff)
  }

  function setIngot(newIngot) {
    ingotx.changes = newIngot.changes
    ingotx.active = newIngot.active
    ingotx.branch = newIngot.branch
  }

  return {
    ingotx,

    current,
    set,
    apply,
    undo,
    redo,
    jump,
    changesArray,
    setIngot,
  }
}
