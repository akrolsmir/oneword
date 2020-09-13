## One Word
Just One, online! Available at http://oneword.games

## Tech stack

One Word is built on top of:
- VueJS on the frontend
- Bulma for CSS
- Netlify for hosting
- Firestore on the backend
- Firebase Auth for login
- Stripe for payments

The site is entirely static (there's no build process!)
To test the site locally, just clone the code, then spin up a local server.
E.g.:
```
git clone https://github.com/akrolsmir/oneword.git
cd oneword
python -m http.server 8020
```
And then open http://localhost:8020.

While developing: Prettier is mandatory, VSCode is recommended.

To deploy: just push to master, and Netlify will update the site!

## Code structure
- One Word is basically a single page app, and that page is index.html.
- Each player always has a full local copy of the room, which is kept in sync with Firestore.
- Each room obeys this structure:
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
- Players are uniquely identified by the string they chose for their name.
