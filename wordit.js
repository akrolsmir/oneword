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

const NO_VOTE = '?';

const vueApp = new Vue({
  el: '#vue',
  data: {
    user: {}, //stores authentication metadata (whether user is signed in or guest)
    numItemsPerPlayer: 7, // customizable
    room: {
      // bare bones room, to be overwritten from db if needed
      name:
        new URL(window.location.href).searchParams.get('room') || randomWord('adjectives') + '-' + randomWord('nouns'),
      currentRound: {},
      history: [],
    },
    player: {
      name: new URL(window.location.href).searchParams.get('player') || '',
      wordlist: [],
      currentRoom: new URL(window.location.href).searchParams.get('room'),
    },
    alertIsShowing: false,
    newMod: '',
    wordsSaved: false,
  },
  created() {
    this.generatePlayerWordlist();
  },
  // Should this code be in mounted?
  mounted() {
    //this.allRooms = (await listRooms()).filter((room) => room.players.length > 0);
    // const parsedUrl = new URL(window.location.href);
    // const roomName = parsedUrl.searchParams.get('room');
    // const playerName = parsedUrl.searchParams.get('player');
    // if (playerName) {
    //   this.player.name = playerName;
    // }
    // if (roomName) {
    //   this.room.name = roomName;
    //   this.player.currentRoom = roomName;
    // }
  },
  watch: {
    async 'room.currentRound.state'(state) {
      this.$emit('reset-timer');
    },
  },
  // computed: {
  //   // player's local view of overall score tally
  //   playerScoreboard: function () {
  //     // `this` points to the vm instance
  //     return this.message.split('').reverse().join('');
  //   },
  // },
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
        // If the player's name collides with another user's,
        // prepend adjectives until it is unique
        /* TODO(shawnx): UNCOMMENT THIS BEFORE COMMIT */
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
        return await this.resetRoom();
      }
    },
    /**
    Room: {
        name: 'apple',
        mod: 'shawn',
        theme: 'none', // 'celebs', 'disney', 'horror', 'kitchen'
        wordsPerPlayer: 7, // customizable
        players: {
          'alice': 0, // 0 points to start
          'bob': 0,
          'carol': 0
        },
        currentRound: {
            cluer: 'alice',
            state: 'CLUER_PICKING', // or 'NOT_STARTED'/'GUESSING'/'DONE'
            allWords: [xxx, xxx, xxx]
        },
        history: [{round1}, {round2}... etc]
    }
    */
    async resetRoom() {
      this.room = {
        name: this.room.name,
        // moderator of the room (One Word used to rely on index position in players list)
        mod: '',
        // players changed from list to object so it can also store each player's points
        players: [this.player.name],
        currentRound: {
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
      this.room.currentRound.word = w;
      await this.saveWordToAllWordsInRoom(w);
    },
    generatePlayerWordlist() {
      while (this.player.wordlist.length < this.numItemsPerPlayer) {
        this.player.wordlist.push(randomWord('adjectives') + '-' + randomWord('nouns'));
      }
    },
    async saveWordToAllWordsInRoom(w) {
      this.room.currentRound.allWords[this.player.name] = w;
      if (_.keys(this.room.currentRound.allWords).length == this.room.players.length) {
        this.room.currentRound.state = 'GUESSING';
      }
      await setRoom(this.room);
    },
    async submitClue() {
      if (_.keys(this.room.currentRound.allWords).length === 0) {
        return alert('Pick a phrase for your clue!');
      }
      if (this.room.currentRound.clue === '') {
        return alert('Write a clue for your phrase!');
      }
      //-- move block below to nextStage()
      const indexToRemove = this.player.wordlist.indexOf(this.room.currentRound.word);
      if (indexToRemove > -1) {
        this.player.wordlist.splice(indexToRemove, 1);
        this.player.wordlist.push(randomWord('adjectives') + '-' + randomWord('nouns'));
      }
      this.room.currentRound.state = 'TOSS_IN_DECOYS';
      // room.currentRound.clue should already be updated due to bi-di binding
      await setRoom(this.room);
    },
    async submitDecoy(decoy) {
      this.saveWordToAllWordsInRoom(decoy);
    },
    // vote is the word the guesser picked
    async submitVote(vote) {
      // Remove player's own decoy from their wordlist when they submit vote.
      const indexToRemove = this.player.wordlist.indexOf(this.room.currentRound.allWords[this.player.name]);
      if (indexToRemove > -1) {
        this.player.wordlist.splice(indexToRemove, 1);
        this.player.wordlist.push(randomWord('adjectives') + '-' + randomWord('nouns'));
      }
      this.room.currentRound.votes[this.player.name] = vote;
      // Total votes are players.length - 1 since clueGiver can't vote.
      if (_.keys(this.room.currentRound.votes).length >= this.room.players.length - 1) {
        this.room.currentRound.state = 'DONE';
        this.room.history.push(this.room.currentRound);
      }
      await setRoom(this.room);
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
    wordForWord(category) {
      return (
        {
          nouns: 'word',
          verbs: 'verb',
          adjectives: 'adjective',
          compounds: 'compound',
          custom: 'word',
        }[category] || 'word'
      );
    },
    hasSpecialCharacters(word) {
      return /[\s~`!@#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?()\._]/g.test(word);
    },
    dedupe(clues, showCollisions = true) {
      // const cluesToPlayers = {};
      // for (const [player, clue] of Object.entries(clues)) {
      //   let foundDupe = false;
      //   for (const existingClue of Object.keys(cluesToPlayers)) {
      //     // If an existing dupe is found, join the strings into the new clue
      //     if (anyDupes(existingClue.split(' / '), clue)) {
      //       foundDupe = true;
      //       cluesToPlayers[existingClue].push(player);
      //       cluesToPlayers[existingClue + ' / ' + clue] = cluesToPlayers[existingClue];
      //       delete cluesToPlayers[existingClue];
      //       break;
      //     }
      //   }
      //   // Otherwise, create a new array for this clue.
      //   if (!foundDupe) {
      //     cluesToPlayers[clue] = [player];
      //   }
      // }
      // const deduped = Object.entries(cluesToPlayers)
      //   .filter(([clue, cluers]) => cluers.length == 1)
      //   .map(([clue, cluers]) => `${cluers[0]} - ${clue}`);
      // const conflicts = Object.entries(cluesToPlayers)
      //   .filter(([clue, cluers]) => cluers.length > 1)
      //   .map(([clue, cluers]) => cluers.join(' & ') + (showCollisions ? ` - ${clue}` : ''));
      // let result = showCollisions ? '' : '(Uh, good luck.)';
      // if (deduped.length > 0) {
      //   result = `${deduped.join('\n')}`;
      // }
      // if (conflicts.length > 0) {
      //   result += `\n\nCollisions:\n${conflicts.join('\n')}`;
      // }
      // return result;
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
    keysEqual,
    finished,
    dropped,
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
    // Returns the set of open room names that matches the current `room.name`.
    // filteredRoomNameSet() {
    //   const filtered = new Set();
    //   const roomNameRe = new RegExp(this.room.name, 'i');
    //   for (const openRoom of this.allRooms) {
    //     if (openRoom.name.match(roomNameRe)) {
    //       filtered.add(openRoom.name);
    //     }
    //   }
    //   return filtered;
    // },
    customWordList() {
      // If there are any commas, parse as csv; else, parse with whitespace
      let words = this.room.customWords.split(',');
      if (words.length <= 1) {
        words = this.room.customWords.split(/\s/);
      }
      // Lowercase and trim out whitespace; take out empty words
      return words.map((w) => w.toLowerCase().trim()).filter((w) => w);
    },
  },
});

listenForLogin(vueApp);

function capitalize(str) {
  return str ? str[0].toLocaleUpperCase() + str.substring(1) : '';
}

function unpush(array, value) {
  const index = array.indexOf(value);
  if (index !== -1) {
    array.splice(index, 1);
  }
}

// Extracts a node from an object tree by its path, like "redTeam.players"
function getIn(object, path) {
  let node = object;
  for (const part of path.split('.')) {
    node = node[part];
  }
  return node;
}

// Keys are just arrays of ints
function keysEqual(key1, key2) {
  if (key1.length !== key2.length) {
    return false;
  }
  for (let i = 0; i < key1.length; i++) {
    if (key1[i] !== key2[i]) {
      return false;
    }
  }
  return true;
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

// Key elements will be unique e.g. randomKey(3, 4) => [2, 1, 4]
function randomKey(length, max) {
  if (length > max) {
    throw "Can't have a longer key than # of words shown!";
  }

  // Generate a list from [1...max], then shuffle, then slice.
  const sequential = [...Array(max).keys()].map((i) => i + 1);
  return shuffleArray(sequential).slice(0, length);
}

// keyType = 'encode', 'intercept', 'decode'
function finished(keyType, round) {
  return round[keyType].length === vueApp.KEY_LENGTH;
}

// votes = { alice: [1, 2, 3], ...}; players = ['alice', ...]
// function finishedVoting(votes, players) {
//   // Not done if any player has not yet voted
//   if (!arrayContentsEqual(players, Object.keys(votes))) {
//     return false;
//   }
//   // Done when every vote is not the default value of NO_VOTE
//   return Object.values(votes)
//     .flat()
//     .every((v) => v !== NO_VOTE);
// }

function arrayContentsEqual(a, b) {
  const bSet = new Set(b);
  return a.length === b.length && a.every((v) => bSet.has(v));
}

// Returns how many of <team>'s messages have been intercepted
function intercepted(team, history) {
  return history
    .flatMap((entry) =>
      Object.values(entry[team].round.interceptVotes).map((vote) => keysEqual(vote, entry[team].round.key))
    )
    .reduce((a, b) => a + b, 0);
}

// Returns how many of <team>'s messages have not been correctly decoded
function dropped(team, history) {
  const sum = (a, b) => a + b;
  // Abusing the fact that 0 + false + true = 1
  return history
    .flatMap((entry) =>
      Object.values(entry[team].round.decodeVotes).map((vote) => !keysEqual(vote, entry[team].round.key))
    )
    .reduce(sum, 0);
}
