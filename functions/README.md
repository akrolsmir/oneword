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

## Developing locally

1. `$ yarn dev` to spin up the emulators
   The Emulator UI is at http://localhost:4000; the functions are hosted on :5001.
   Note: You have to kill and restart emulators when you change code; no hot reload =(

## Debugging

- Find local logs from your shell
- Find deployed logs [here](https://console.firebase.google.com/project/oneword-cf74a/functions/logs?search=&&severity=DEBUG)

## Deploying

1. `$ yarn deploy` to push your changes live!
   (It's the best way to test Stripe atm, since that has a config secret;
   [TODO set up local secrets](https://firebase.google.com/docs/functions/local-emulator#set_up_functions_configuration_optional))

## Why are these Typescript (.ts) files? Do I need to use types?

These are .ts so we can ask the Typescript compiler (tsc) to take our standard way of writing code, and get it to work on the Node server environment. [Main benefits](https://firebase.google.com/docs/functions/typescript):

- ES5 import syntax
- async/await syntax
- Code checking on compile

No typing needed! You can pretend it's just Javascript.

## TODOs

- [x] How to test onCall locally? => functions.useEmulator('localhost', 5001)
- [x] How to test onRequest locally? => set CORS
- [x] Integrate Stripe customer portal
- [ ] Try to get functions on a schedule
- [ ] One-click upload CSV to Mailjet
- [ ] Put it all together!
- [ ] Write that drip campaign
- [ ] Move admin.html to oruga to get Vite goodness
- [ ] Add a way to sudo in as a user
