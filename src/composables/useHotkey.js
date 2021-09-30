import { onMounted, onUnmounted } from '@vue/runtime-core'

/**
 * Vue3 component for listening for keyboard shortcuts like Ctrl + S
 * Usage in created(): useHotkey({'ctrl+s': this.save})
 *
 * @param {*} config a mapping of a string shortcut to a callback to invoke
 * Example config: {'ctrl+s': save, 'ctrl+shift+z': redo, 'ctrl+z': undo}
 * - shortcuts are matched in order, so you should put 'ctrl+shift+s' before 'ctrl+s'
 * - 'c+s' supports 'ctrl+s' and 'cmd+s'
 */
export function useHotkey(config) {
  // Mapping of modifier key names to KeyboardEvent properties
  const modifierLists = {
    c: ['ctrlKey', 'metaKey'], // True if either ctrl or cmd key is pressed
    ctrl: ['ctrlKey'],
    alt: ['altKey'],
    shift: ['shiftKey'],
    meta: ['metaKey'],
    cmd: ['metaKey'],
  }

  // Create a mapping of lowercase letters to KeyboardEvent.code values
  // E.g. {a: 'KeyA', s: 'KeyS', ...}
  // See https://javascript.info/keyboard-events#event-code-and-event-key
  const codes = {}
  const alphabet = 'abcdefghijklmnopqrstuvwxyz'
  for (const char of alphabet) {
    codes[char] = `Key${char.toUpperCase()}`
  }

  // Example condition: {key: 's', modifiers: ['ctrl', 'shift'], action: save}
  const conditions = Object.keys(config).map((shortcut) => {
    const [key, ...modifiers] = shortcut.split('+').reverse()
    return {
      key,
      modifiers,
      action: config[shortcut],
    }
  })

  function checkModifier(modifier, event) {
    return modifierLists[modifier].some((prop) => event[prop])
  }

  // Parse config into a list of keycodes, modifiers, and functions
  let listener
  onMounted(() => {
    listener = window.addEventListener('keydown', (event) => {
      for (const condition of conditions) {
        const modifiersPressed = condition.modifiers.every((modifier) =>
          checkModifier(modifier, event)
        )
        if (codes[condition.key] === event.code && modifiersPressed) {
          condition.action()
          event.preventDefault()
          // Exit after the first match
          return
        }
      }
    })
  })
  // Tear down when composable is unmounted
  onUnmounted(() => {
    window.removeEventListener('keydown', listener)
  })
}
