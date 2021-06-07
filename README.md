# One Word

This is the code behind http://oneword.games, a group of online games inspired
by party games like Just One and Decrypto.

## Installing

1. Install [Node.js and npm](https://nodejs.org/en/)
2. `$ npm install --global yarn ` to install [Yarn](https://yarnpkg.com/)
3. `$ yarn` to install JS dependencies

## Developing

1. `$ yarn dev` to spin up a local server at http://localhost:3000
2. Start editing code! See our [recommended tools.](#recommended-tools)

## Committing code

Merging code directly into `master` is okay, but if some work you're doing is:

- Risky (could break existing gameplay)
- Uncertain (not sure if we want this)
- Touches code that others are also modifying

... then consider opening up a Pull Request instead!

Every pull request will automatically get a separate preview URL; perfect for getting quick feedback.
![](https://i.imgur.com/K8ZaCYd.png)

## Deploying

Just push to `master`, and the site will update automatically.

## Android

We use [Capacitor](https://capacitorjs.com/docs/v3) to package our web apps into
mobile apps.

### Setup

1. Install [Android Studio](https://developer.android.com/studio)
2. Set up an Android emulator, or connect your phone in [developer mode](https://developer.android.com/studio/debug/dev-options#enable)

### Developing

1. `$ yarn build` to build Vue app for distribution
2. `$ npx cap run --list android` to check that your emulator/phone is connected
3. `$ yarn android` to run on Android
   - Or `$ npx cap open android` to edit project in Android Studio

OR for live reloading from your local server:

1. `$ yarn dev` to spin up a local Vue server
2. Copy the network url (e.g. `http://192.168.1.5:3001`)
3. Paste it into `capacitor.config.json`'s `server.url` field.
4. `$ yarn android` to run on Android

(TODO: would be cool to have `$ yarn android-dev` do all of the above)

### Deploying to Google Play Store

See also [this guide to Play Store deployment.](https://www.joshmorony.com/deploying-capacitor-applications-to-android-development-distribution/)

0. Get the keystore file (`oneword.jks`) and passwords from Austin
1. `$ npx cap open android` to open Android Studio
2. Build > Generate Signed APK
3. Find the generated app in `oneword/android/app/release/app-release.aab`

(TODO: Try out [Appflow](https://ionic.io/appflow) for automatic app deploys)

### Notes

- `$ yarn resources` to [generate app icons](https://capacitorjs.com/docs/v3/guides/splash-screens-and-icons)
  - For Android, we use [adaptive icons](https://developer.android.com/guide/practices/ui_guidelines/icon_design_adaptive)
- To crack the keystore password, see [this](https://github.com/floyd-fuh/JKS-private-key-cracker-hashcat)
  - To use Java JDK after Android Studio is installed: `export JAVA_HOME=/Applications/Android\ Studio.app/Contents/jre/jdk/Contents/Home`

## iOS

### Setup

You'll need:

- A Mac to develop on, with:
  - [Xcode](https://apps.apple.com/us/app/xcode/id497799835?mt=12)
  - CocoaPods (`sudo gem install cocoapods` to install)

### Developing

1. `$ yarn build` to build Vue app for distribution
2. `$ yarn ios` to run on iOS
   - Or `$ npx cap open ios` to edit project in Xcode

### iOS Misc

- While setting up, needed `sudo xcode-select -s /Applications/Xcode.app/Contents/Developer` (see [link](https://github.com/nodejs/node-gyp/issues/569))
- OAuth client ID: `340753176141-k38315g3fgbnfq3avasgq05dmg9evjj2.apps.googleusercontent.com` (see [reference](https://developers.google.com/identity/sign-in/ios/start-integrating#add_a_url_scheme_to_your_project))

# Appendix

## Tech stack

One Word is built on top of:

- [VueJS](https://v3.vuejs.org/guide/introduction.html) on the frontend
- [Bulma](https://bulma.io/) for CSS styling
- [Netlify](https://www.netlify.com/) for hosting
- [Firestore](https://firebase.google.com/docs/firestore) for the database
- [Firebase Auth](https://firebase.google.com/docs/auth) for login
- [Stripe](https://stripe.com/) for payments
- [Mailjet](https://www.mailjet.com/) for marketing & transactional emails

## Architecture

### The game state is a single JS object

One Word code is all on the client (aka [JAMStack](https://jamstack.org/)). We start
by defining the game's data: a single JS object to represent one game room. For example:

```
  Room: {
    name: apple,
    players: ['alice', 'bob', 'carol'],
    currentRound: {
      state: 'clueing' // or 'guessing', or 'done'
      guesser: 'alice',
      word: 'company'
      clues: {
        alice: 'corporation',
        bob: 'collected'
        carol: 'collected'
      }
    }
    history: [{round1}, ...]
  }
```

This has all the info needed to represent the entire state of the game,
at any point in time. It should be _complete_ (no info missing), but also _minimum_
(no additional information).

### Vue turns that into HTML

Based on what's in the room object, we then want to show the right HTML and CSS to users. The VueJS framework helps us express our JS object as HTML to show the user, and also
handles user inputs.

Here's a simple example of Vue code:

```
<template>
  <!-- JS expressions inside {{ these braces }} get rendered -->
  <p v-for="player in room.players">- {{ player }}</p>

  <!-- newPlayer automatically syncs when this input is edited -->
  <input v-model="newPlayer" />

  <!-- Call some Javascript code using @event notation -->
  <button @click="addPlayer">Add a player</button>
</template>

<script>
export default {
  data() {
    return {
      room: { players: ['Alice', 'Bob', 'Charlie'] },
      newPlayer: 'Eve',
    }
  },
  methods: {
    addPlayer() {
      this.room.players.push(this.newPlayer)
    },
  },
}
</script>

```

Which produces:

![](https://i.imgur.com/Z1aPc77.png)

The amazing thing is that Vue binds the HTML elements and forms to our JS data.
When we update the JS data, the HTML elements will re-render; and when the user clicks on or types in an HTML form, the underlying JS data stays in sync!

### Firestore keeps all players in sync

Now, how does one player's changes get sent to everyone else? A: Firestore. Each different game (One Word, Incrypt) has a different Firestore table, containing every room ever created and keyed by the room's name.

We use some Firestore logic to keep everyone's clients sync'd to the latest state. So your code can act as though its room is always up-to-date; you only think about when you need to _push_ a change to the Firestore database. Super convenient!

To prevent _race conditions_ (one client overwriting the changes of another), try
to scope down each change to be very narrow. Instead of pushing the entire room object each time, just push the path of the object that updated.

Continuing the example above:

```
async addPlayer() {
  this.room.players.push(this.newPlayer)
  // Only update the 'players' field of the room
  await saveRoom(room, 'players')
},
```

And... that's all you really need to get started with making your own game!

## Recommended tools

- [Get the Vue3 devtools](https://chrome.google.com/webstore/detail/vuejs-devtools/ljjemllljcmogpfapbkkighbhhppjdbg?hl=en) to easily debug and inspect your Vue logic
- We highly, highly, _highly_ recommend VSCode, along with these extensions:

  - `Vetur` for Vue syntax highlighting
  - `Prettier` for format-on-save
  - `i18n Ally` for text/translation display

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
    "i18n-ally.sortKeys": true,
    "i18n-ally.keepFulfilled": true,
    ```

    - [In-depth setup instructions](https://www.robinwieruch.de/how-to-use-prettier-vscode)

  - **Optional** `Debugger for Chrome` for breakpoint debugging from inside VSCode
    - Then from the menu, `Run` > `Add configuration` > `Chrome (preview)`
      ![](https://i.imgur.com/uFJa9xS.png)
    - [In-depth setup instructions](https://www.freecodecamp.org/news/how-to-set-up-the-debugger-for-chrome-extension-in-visual-studio-code-c0b3e5937c01/)

- You can instantly join as guest by adding `?player=Holo` at the end of a room url.
  Useful for keeping 3 tabs open, for testing multiplayer interactions!

## Best practices for working with Vue + Firestore

- Most important: keep your Firestore data structure simple and elegant.
  App logic and visuals are easy to change; backfilling data is annoying.
- Prefer local computed properties over putting more things into the Firestore room.
  - Declarative code (the WHAT) is better than imperative code (the HOW); for
    example, prefer array.map() over for loops.
- When possible, your Firestore pushes should to be idempotent
  (ie can be called multiple times with the same effect), and free of race conditions
  (ie one client should not overwrite another's changes).
- Instead of pushing an array to Firestore, consider pushing an object.
  (Then make a computed array, eg with `Object.keys(foo)`). This prevents race
  conditions if multiple clients update the same array

## Other tips

- Constantly invest in faster dev velocity!
  - Build mod tools for yourself
  - If anything in your iteration cycle seems slow, bother Austin about it
- Code should be as readable as possible
  - Self-documenting if possible, then comments
  - It's easier to read less code!

### Compiling locally

This is useful for testing the site for performance, in Chrome Devtool's Lighthouse.

```
$ yarn build
$ yarn serve
```

Then go to http://localhost:5000 and [run Lighthouse](https://developers.google.com/web/tools/lighthouse#devtools)!
