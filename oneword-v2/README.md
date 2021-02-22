# Migrating from One Word v1

v2 is an investment into dev velocity and best practices, adding:

- yarn for JS package management
- Vite for hot reloading, single file Vue components, bundling
- Vue3 for new language features

## Installing

1. Install [Node.js and npm](https://nodejs.org/en/)
2. Install yarn:

```
npm install --global yarn
```

3. Run these commands:

```
cd oneword-v2
yarn # installs all JS dependencies
```

4. [Get the Vue3 devtools](https://chrome.google.com/webstore/detail/vuejs-devtools/ljjemllljcmogpfapbkkighbhhppjdbg?hl=en) (and disable the Vue2 ones)

## Developing

- `yarn dev` to spin up a local server at http://localhost:3000

## Committing code

Merging code directly into `master` is okay, but if some work you're doing is:

- Risky (could break existing gameplay)
- Uncertain (not sure if we want this)
- Touches code that others are also modifying

... then consider opening up a Pull Request instead!

In Github, pull requests also create a deploy preview; perfect for getting quick feedback.
(TODO: Include screenshot)

## Deploying

Just push to `master`, and the site will update automatically!

# Appendix

### Productivity tips

- When you save a file, the app should automatically reload!
  - Note: Hot reload seems broken in Vue3 Carousel
- You can instantly join as guest by adding `?player=Holo` at the end of a room url.
  Useful for keeping 3 tabs open, for testing multiplayer interactions!
- Install these VSCode extensions:

  - `Vetur` for Vue syntax highlighting
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

  - **Optional** `Debugger for Chrome` for breakpoint debugging from inside VSCode
    - Then from the menu, `Run` > `Add configuration` > `Chrome (preview)`
      ![](https://i.imgur.com/uFJa9xS.png)
    - [In-depth setup instructions](https://www.freecodecamp.org/news/how-to-set-up-the-debugger-for-chrome-extension-in-visual-studio-code-c0b3e5937c01/)

### Best practices for working with Vue + Firestore

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

### Other tips

- Constantly invest in faster dev velocity!
  - Build mod tools for yourself
  - If anything iteration cycle seems to take long, bother Austin about it
- Code should be as readable as possible
  - Self-documenting if possible, then comments
  - It's easier to read less code

## Compiling locally

This is useful for testing the site for performance, in Chrome Devtool's Lighthouse.

```
$ yarn build
$ cd dist/
$ python -m http.server 8008
```

Then go to http://localhost:8008 and [run Lighthouse](https://developers.google.com/web/tools/lighthouse#devtools)!
