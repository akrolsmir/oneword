# Firestore Cloud Functions

This is code that doesn't make sense on the frontend client, e.g.

- Long-running or slow operation (database)
- Tasks that need to be run every so often (syncing email list to Mailjet)
- Anything we should't trust to clients (secrets, auth)

If you want to make and test changes, you'll have to do a bit of setup...

## Installing

Adapted from https://firebase.google.com/docs/functions/get-started

0. `$ cd functions` to switch to this folder
1. `$ yarn global add firebase-tools` to install the Firebase CLI globally
2. `$ yarn` to install JS dependencies
3. `$ firebase functions:config:get > .runtimeconfig.json` to cache secrets for local dev

## Developing locally

1. `$ firebase login` if you aren't logged into Firebase via commandline yet. Ask Austin to give you access to OneWord firebase.
2. `$ yarn dev` to spin up the emulators
   The Emulator UI is at http://localhost:4000; the functions are hosted on :5001.
   Note: You have to kill and restart emulators when you change code; no hot reload =(
3. Connect to emulators by enabling `functions.useEmulator('localhost', 5001)`

## Debugging

- Find local logs directly in the shell that ran `$ yarn dev`
- Find deployed logs [here](https://console.firebase.google.com/project/oneword-cf74a/functions/logs?search=&&severity=DEBUG)

## Deploying

1. `$ yarn deploy` to push your changes live!
   (Future TODO: auto-deploy functions on Git push)

## Why are these Typescript (.ts) files? Do I need to use types?

These are .ts so we can ask the Typescript compiler (tsc) to take our standard way of writing code, and get it to work on the NodeJS environment. [Main benefits](https://firebase.google.com/docs/functions/typescript):

- ES5 import syntax
- async/await syntax
- Code checking on compile

No typing needed! You can pretend it's just Javascript, and use `// @ts-ignore` to work around TS compilation issues.

## Secrets management

Secrets are strings that shouldn't be checked into Git (eg API keys, passwords). We store these using [environment config on Firebase Functions](https://firebase.google.com/docs/functions/config-env). Some useful workflows:

- Set a secret: `$ firebase functions:config:set stripe.test_secret="THE-API-KEY"`
- Preview all secrets: `$ firebase functions:config:get`
- Cache for local dev:`$ firebase functions:config:get > .runtimeconfig.json`
