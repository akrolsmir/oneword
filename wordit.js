import './components/timer.js';
import { nouns, compounds, verbs, adjectives } from './many-words.js';
import {
  setRoom,
  updateRoom,
  getRoom,
  listRooms,
  listenRoom,
  unlistenRoom,
  listenForLogin,
} from './firebase-network.js';

const vueApp = new Vue({
  el: '#vue',
  data: {
    //stores authentication metadata (whether user is signed in or guest)
    user: {},
    // customizable
    numItemsPerPlayer: 7,
    // bare bones room, to be overwritten from db if needed
    room: {
      // get name from search params, or create a new one.
      name:
        new URL(window.location.href).searchParams.get('room') || randomWord('adjectives') + '-' + randomWord('nouns'),
      currentRound: {},
      history: [],
    },
    player: {
      name: new URL(window.location.href).searchParams.get('player') || '',
      choicesPerDecoyCategory: 7,
      // currentRoom is not used at the moment
      currentRoom: new URL(window.location.href).searchParams.get('room'),
      // wordlist for as future clue giver
      wordList: [],
      // decoy adj & list
      decoyAdj: '',
      decoyAdjList: [],
      // decoy noun & list
      decoyNoun: '',
      decoyNounList: [],
    },
    alertIsShowing: false,
    newMod: '',
    wordsSaved: false,
  },
  // created() {
  // },
  mounted() {
    // currently not used since public rooms are currently not shown
    //this.allRooms = (await listRooms()).filter((room) => room.players.length > 0);
  },
  watch: {
    // Timer currently not yet implemented for wordit
    'room.currentRound.state'(state) {
      console.log('state change: ' + state);
      this.$emit('reset-timer');
      if (state === 'TOSS_IN_DECOYS') {
        this.player.decoyAdjList = this.generateDecoyWordList('adjectives');
        this.player.decoyNounList = this.generateDecoyWordList('nouns');
      }
    },
  },
  methods: {
    // Somewhat copied from One Word's index.html. TODO: Dedupe?
    async enterRoom() {
      if (!this.player.name) {
        this.$refs.navbar.logIn();
        return;
      }
      // Sanitize room name
      this.room.name = this.room.name
        .trim()
        .toLowerCase()
        .replace(/\s/g, '-') // whitespace
        .replace(/[^\p{L}-]/gu, ''); // not (dash or letter in any language)

      const room = await getRoom(this.room);

      if (room) {
        /*
         * TODO(shawnx): UNCOMMENT THIS BEFORE COMMIT
         * If the player's name collides with another user's,
         * prepend adjectives until it is unique
         */
        // while (
        //   _.keys(room.players).includes(this.player.name) &&
        //   (this.user.guest || this.user.email != room.playerData[this.player.name].email)
        // ) {
        //   this.player.name = capitalize(randomWord('adjectives')) + ' ' + this.player.name;
        // }
        this.room = room;
        return await this.joinRoom();
      } else {
        // Create a new room
        listenRoom(this);
        this.generatePlayerWordList();
        return await this.resetRoom();
      }
    },
    async resetRoom() {
      this.room = {
        name: this.room.name,
        // moderator of the room (One Word used to rely on index position in players list)
        mod: '',
        // players changed from list to object so it can also store each player's points
        players: [this.player.name],
        // Each round has its own object.
        currentRound: {
          // states can be 'CLUER_PICKING' 'TOSS_IN_DECOYS' 'GUESSING' and 'DONE'
          state: 'CLUER_PICKING',
          // First player becomes the first one to pick a word and a clue
          clueGiver: this.player.name,
          // Stores the real word from the clue giver; resets every round.
          word: '',
          // Stores both the real word and all decoys from other players; resets every round.
          allWords: {},
          // Stores the clue from the clue giver
          clue: '',
          // Stores counts of votes for both the real word and the decoy; resets every round.
          votes: {},
          // category will be either default or a theme
          category: 'nouns',
        },
        history: [],
        public: true,
        roundsInGame: 13,
        lastUpdateTime: Date.now(),
        timers: { PICKING: '', GUESSING: '', DONE: '', running: false },
        categories: {
          nouns: true,
          verbs: false,
          adjectives: false,
          compounds: false,
          custom: false,
        },
        customWords: '',
        playerData: {
          [this.player.name]: {
            email: this.user.email || '',
            supporter: this.user.supporter || '',
          },
        },
      };
      await setRoom(this.room);
    },
    async cluerSelectsWord(w) {
      await updateRoom(this.room, { 'currentRound.word': w });
      await this.saveWordToAllWordsInRoom(w);
    },
    async saveWordToAllWordsInRoom(w) {
      const update = {};
      update[`currentRound.allWords.${this.player.name}`] = w;
      await updateRoom(this.room, update);
      if (_.keys(this.room.currentRound.allWords).length == this.room.players.length) {
        await updateRoom(this.room, { 'currentRound.state': 'GUESSING' });
      }
    },
    async submitClue() {
      if (_.keys(this.room.currentRound.allWords).length === 0) {
        return alert('Pick a phrase for your clue!');
      }
      if (this.room.currentRound.clue === '') {
        return alert('Write a clue for your phrase!');
      }
      const indexToRemove = this.player.wordList.indexOf(this.room.currentRound.word);
      if (indexToRemove > -1) {
        this.player.wordList.splice(indexToRemove, 1);
        this.player.wordList.push(randomWord('adjectives') + '-' + randomWord('nouns'));
      }
      this.room.currentRound.state = 'TOSS_IN_DECOYS';
      // room.currentRound.clue should already be updated due to bi-di binding
      await setRoom(this.room);
    },
    async submitDecoy() {
      if (!this.player.decoyAdj) {
        return alert('Pick the adjective for your decoy phrase!');
      }
      if (!this.player.decoyNoun) {
        return alert('Pick the noun for your decoy phrase!');
      }
      this.saveWordToAllWordsInRoom(this.player.decoyAdj + '-' + this.player.decoyNoun);
    },
    // vote is the word the guesser picked
    async submitVote(vote) {
      const update = {};
      update[`currentRound.votes.${this.player.name}`] = vote;
      await updateRoom(this.room, update);
      // Total votes are players.length - 1 since clueGiver can't vote.
      if (_.keys(this.room.currentRound.votes).length >= this.room.players.length - 1) {
        this.room.currentRound.state = 'DONE';
        this.room.history.push(this.room.currentRound);
        await setRoom(this.room);
      }
    },
    async nextStage() {
      if (this.room.currentRound.state == 'CLUER_PICKING') {
        return await updateRoom(this.room, { 'currentRound.state': 'GUESSING' });
      } else if (this.room.currentRound.state == 'GUESSING') {
        return await updateRoom(this.room, { 'currentRound.state': 'DONE' });
      } else {
        return await this.newRound();
      }
    },
    // Only call if room already exists.
    async joinRoom() {
      listenRoom(this);

      // migration
      if (!this.room.playerData) {
        this.room.playerData = {};
      }

      const { email = '', supporter = '' } = this.user;
      this.room.playerData[this.player.name] = { email, supporter };

      if (this.room.players.includes(this.player.name)) {
        await this.saveRoom('playerData');
      } else {
        this.room.players.push(this.player.name);
        await this.saveRoom('playerData', 'players');
      }
      // generate playerWordList so wordList keeps some state after page refresh.
      this.generatePlayerWordList();
    },
    generatePlayerWordList() {
      const allWordsThisRound = this.room.currentRound.allWords;
      // If the user refreshed their page, we preserve the word they had
      if (allWordsThisRound && allWordsThisRound[this.player.name]) {
        this.player.wordList.push(allWordsThisRound[this.player.name]);
      }
      while (this.player.wordList.length < this.numItemsPerPlayer) {
        this.player.wordList.push(randomWord('adjectives') + '-' + randomWord('nouns'));
      }
    },
    generateDecoyWordList(type) {
      const wordList = [];
      while (wordList.length < this.player.choicesPerDecoyCategory) {
        wordList.push(randomWord(type));
      }
      return wordList;
    },
    goHome() {
      unlistenRoom();
      this.room = { name: '' };
    },
    async kickPlayer(name) {
      if (this.room.players.includes(name)) {
        const index = this.room.players.indexOf(name);
        this.room.players.splice(index, 1);
        await this.saveRoom('players');
      }
    },
    async makeMod(name) {
      const index = this.room.players.indexOf(name);
      if (index >= 0) {
        // swap players[0] and players[index]
        [this.room.players[0], this.room.players[index]] = [this.room.players[index], this.room.players[0]];
        await this.saveRoom('players');
      }
    },
    async newRound(sameGuesser = false) {
      this.room.currentRound = {
        state: 'CLUER_PICKING',
        // Pick next guesser
        clueGiver: nextClueGiver(this.room.currentRound.clueGiver, this.room.players),
        // Stores the real word from the clue giver; resets every round.
        word: '',
        // Stores both the real word and all decoys from other players; resets every round.
        allWords: {},
        // Stores the clue from the clue giver
        clue: '',
        // Stores counts of votes for both the real word and the decoy; resets every round.
        votes: {},
        category: 'nouns', //remove this
      };
      this.room.lastUpdateTime = Date.now();
      // Overwrite existing room;
      await setRoom(this.room);
    },
    async updateTimer() {
      this.room.timerLength = this.player.timerLength;
      this.saveRoom('timerLength');
    },
    // Sync any number of properties of this.room to firebase
    async saveRoom(...props) {
      await updateRoom(this.room, Object.fromEntries(props.map((prop) => [prop, getIn(this.room, prop)])));
    },
    async toggleTimers() {
      this.room.timers.running = !this.room.timers.running;
      await this.saveRoom('timers');
    },
    async upsell(...props) {
      if (this.user.supporter) {
        await this.saveRoom(...props);
      } else {
        const result = await swal({
          title: 'Want private rooms?',
          text: 'Earn perks like private rooms, custom avatars, and more by becoming a supporter 😍',
          buttons: {
            cancel: 'Not now',
            support: 'Okay!',
          },
        });
        if (result === 'support') {
          referSupporter('modtools');
        }
        // Reset UI to non-supporter defaults
        this.room.public = true;
        this.room.roundsInGame = 13;
      }
    },
    moment,
  },
  computed: {
    timerLength() {
      if (this.room.currentRound && this.room.timers && this.room.timers.running) {
        return this.room.timers[this.room.currentRound.state];
      }
      return 0;
    },
    isMod() {
      if (this.user.supporter == 'ADMIN') {
        return true;
      }
      if (this.room && this.room.players) {
        return this.player.name == this.room.players[0];
      }
    },
  },
});

listenForLogin(vueApp);

function capitalize(str) {
  return str ? str[0].toLocaleUpperCase() + str.substring(1) : '';
}

// Extracts a node from an object tree by its path, like "redTeam.players"
function getIn(object, path) {
  let node = object;
  for (const part of path.split('.')) {
    node = node[part];
  }
  return node;
}

function nextClueGiver(lastGuesser, players) {
  // players is a map from name->points; we just need the names
  const nextIndex = (players.indexOf(lastGuesser) + 1 + players.length) % players.length;
  return players[nextIndex];
}

// Random word for a category, copied from index.html
function randomWord(category = 'nouns', customWords = '') {
  const custom = customWords.split(/\s/);
  const categories = { nouns, compounds, verbs, adjectives, custom };
  const words = categories[category];
  return words[Math.floor(Math.random() * words.length)];
}
