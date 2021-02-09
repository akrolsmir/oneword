## Migration from One Word

- Install yarn, then:
  ```
  cd oneword-v2
  yarn # installs all dependencies
  ```
- Install VSCode extensions:

  - `Vetur` for Vue syntax highlighting
  - `Debugger for Chrome` for breakpoint debugging from inside VSCode
    - Then from the menu, `Run` > `Add configuration` > `Chrome (preview)`
      ![](https://i.imgur.com/uFJa9xS.png)
    - [In-depth setup instructions](https://www.freecodecamp.org/news/how-to-set-up-the-debugger-for-chrome-extension-in-visual-studio-code-c0b3e5937c01/)
  - `Prettier` for format-on-save

    - Then open VSCode `Preferences: Open Settings (JSON)`, and add

    ```
    "editor.formatOnSave": true,
    "[html]": {
      "editor.defaultFormatter": "esbenp.prettier-vscode"
    },
    "[javascript]": {
      "editor.defaultFormatter": "esbenp.prettier-vscode"
    },
    "[vue]": {
      "editor.defaultFormatter": "esbenp.prettier-vscode"
    },
    ```

    - [In-depth setup instructions](https://www.robinwieruch.de/how-to-use-prettier-vscode)

Running the code:

- `yarn start` to spin up a local server
  - When you save a file, the app will automatically reload!

## Best practices for working with Vue + Firestore

- Most important: keep your Firestore data structure simple and elegant.
  App logic and visuals are easy to change; backfilling data is annoying.
- Prefer local computed properties over putting more things into the Firestore room.
- When possible, your Firestore pushes should to be idempotent
  (ie can be called multiple times with the same effect), and free of race conditions
  (ie one client should not overwrite another's changes).
  - This is most important in frequent actions (eg submitting words); less important
    in rarer actions (eg joining rooms)
- Instead of pushing an array to Firestore, consider pushing an object.
  (Then make a computed array, eg with `Object.keys(foo)`). This prevents race
  conditions if multiple clients update the same array

## Other tips

- Constantly invest in faster dev velocity!
  - Build mod tools for yourself
  - If anything iteration cycle seems to take long, bother Austin about it
- Code should be as readable as possible
  - Self-documenting if possible, then comments
  - It's easier to read less code
