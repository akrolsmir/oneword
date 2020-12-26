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
const KEY_LENGTH = 3;
const WORDS_SHOWN = 4; // TODO: Call these "keywords"?
// Initialize to empty strings, since Firebase won't handle 'undefined'
function emptyKey() {
  // TODO: Rename to emptyEncode?
  return Array(KEY_LENGTH).fill('');
}
function emptyGuesses() {
  return Array(WORDS_SHOWN).fill('');
}

/**
Room: {
  name: 'apple',
  state: 'ENCODING', // or 'NOT_STARTED'/'RED_DECODE'/'BLUE_DECODE'/'BOTH_DECODE/'DONE'
  redTeam: {
    // Red team goes first on intercepts (TODO alternate?)
    // TODO name: 'Ugliest Carriages', emoji: '🤦‍♀️', color: '#FF4422'
    players: ['alice', 'bob'], // First player is team lead aka mod
    words: ['student', 'bible', 'catholic', 'eraser'],
    wordGuesses: {
      alice: ['dumb', 'dict', 'deacon', 'deer'],
      ...
    },
    round: {
      spy: 'alice',
      key: [4, 1, 2], // sometimes referred to as "message"
      encode: ['gone', 'lazy', 'book'],
      interceptVotes: {
        carol: [2, 3, 1],
        dave: [2, 4, 1],
      },
      decodeVotes: {
        bob: [3, 1, 2],
      }
  },
  blueTeam: ...
  history: [{
    redTeam: { round: {...} }
    blueTeam: { round: {...} }
  }, ...]
}
*/
const vueApp = new Vue({
  el: '#vue',
  data: {
    player: {
      name: '',
      // Local values & UI controls, before they get uploaded
      encode: emptyKey(),
      wordGuesses: emptyGuesses(),
      timerLength: 120,
    },
    room: {
      // See below in created()
      name: randomWord('adjectives') + '-' + randomWord('nouns'),
    },
    user: {},
    allRooms: [],
    showRules: false,
    previewTeam: '',
    KEY_LENGTH,
    WORDS_SHOWN,
  },
  async created() {
    const parsedUrl = new URL(window.location.href);
    const roomName = parsedUrl.searchParams.get('room');
    const playerName = parsedUrl.searchParams.get('player');
    if (playerName) {
      this.player.name = playerName;
    }
    if (roomName) {
      this.room.name = roomName;
    }
    if (roomName && playerName) {
      await this.enterRoom();
    }
  },
  async mounted() {
    this.allRooms = await listRooms();
  },
  watch: {
    'room.state'(state) {
      this.$emit('reset-timer');
      // Clean up past inputs on each new round.
      if (state === 'DONE') {
        this.player.encode = emptyKey();
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
        this.room = room;
      } else {
        // Create a new room
        await this.resetRoom();
      }
      listenRoom(this);
    },
    async resetRoom() {
      this.room = {
        name: this.room.name,
        state: 'NOT_STARTED',
        redTeam: {
          name: 'Red',
          players: [],
          words: randomWords(4),
          wordGuesses: {},
          // Current round
          round: {},
        },
        blueTeam: {
          name: 'Blue',
          players: [],
          words: randomWords(4),
          wordGuesses: {},
          round: {},
        },
        history: [],
        timerLength: 120,
        public: true,
        lastUpdateTime: Date.now(),
      };
      await setRoom(this.room);
    },
    async nextState() {
      // Figure out what the next state should be, then go there.
      const toUpdate = ['state'];
      const next = {
        ENCODING: this.room.history.length > 0 ? 'RED_DECODE' : 'BOTH_DECODE',
        RED_DECODE: 'BLUE_DECODE',
        // TODO RED_DONE?
        BLUE_DECODE: 'DONE',
        BOTH_DECODE: 'DONE',
        DONE: 'ENCODING',
      };
      this.room.state = next[this.room.state];
      if (this.room.state === 'DONE') {
        // Add current round to history on DONE, to update victory conditions
        this.room.history.push({
          redTeam: {
            round: this.room.redTeam.round,
          },
          blueTeam: {
            round: this.room.blueTeam.round,
          },
        });
        toUpdate.push('history');
      }
      await this.saveRoom(...toUpdate);
    },
    async joinTeam(team) {
      this.room[team].players.push(this.player.name);
      // Also remove from existing team
      unpush(this.room[other(team)].players, this.player.name);
      await this.saveRoom('redTeam.players', 'blueTeam.players');
    },
    async prefillEncode() {
      this.myTeam.round.encode = this.player.encode;
      await this.saveRoom(`${this.myTeamId}.round.encode`);
    },
    async submitEncode() {
      await this.prefillEncode;
      // Once both spies are done, move to intercepting (or straight to decoding in round 1)
      if (finishedEncoding(this.myTeam.round) && finishedEncoding(this.otherTeam.round)) {
        await this.nextState();
      }
    },
    async prefillGuesses() {
      this.otherTeam.wordGuesses[this.player.name] = this.player.wordGuesses;
      await this.saveRoom(`${other(this.myTeamId)}.wordGuesses.${this.player.name}`);
    },
    async checkIfDecrypted() {
      if (!['RED_DECODE', 'BLUE_DECODE', 'BOTH_DECODE'].includes(this.room.state)) {
        console.error('intercept or decode called from invalid round!');
        return;
      }

      const team = this.smugglersId;
      if (this.room.state === 'BOTH_DECODE') {
        if (
          !finishedVoting(this.myTeam.round.decodeVotes, this.decrypters(this.myTeamId)) ||
          !finishedVoting(this.otherTeam.round.decodeVotes, this.decrypters(other(this.myTeamId)))
        ) {
          // Only move forward when both teams are finished decoding
          return;
        }
      } else if (
        !finishedVoting(this.room[team].round.decodeVotes, this.decrypters(team)) ||
        !finishedVoting(this.room[team].round.interceptVotes, this.room[other(team)].players)
      ) {
        // Only move forward when decoding and intercepting are both finished
        return;
      }
      await this.nextState();
    },
    async newRound() {
      this.room.state = 'ENCODING';
      this.room.redTeam.round = {
        spy: nextSpy(this.room.redTeam.round.spy, this.room.redTeam.players),
        key: randomKey(this.KEY_LENGTH, this.WORDS_SHOWN),
        encode: emptyKey(),
        interceptVotes: {},
        decodeVotes: {},
      };
      this.room.blueTeam.round = {
        spy: nextSpy(this.room.blueTeam.round.spy, this.room.blueTeam.players),
        key: randomKey(this.KEY_LENGTH, this.WORDS_SHOWN),
        encode: emptyKey(),
        interceptVotes: {},
        decodeVotes: {},
      };
      // TODO when we're tracking separate rooms
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
    async vote(voteType /* decodeVotes or interceptVotes */, name, keyIndex, wordIndex) {
      const team = voteType === 'decodeVotes' ? this.myTeamId : other(this.myTeamId);
      if (!this.room[team].round[voteType][name]) {
        // Need to fill in a dummy value so Firestore is happy
        this.room[team].round[voteType][name] = Array(this.KEY_LENGTH).fill(NO_VOTE);
      }
      this.room[team].round[voteType][name][keyIndex] = wordIndex;
      await this.saveRoom(`${team}.round.${voteType}.${name}`);
      await this.checkIfDecrypted();
    },
    voters(voteType, keyIndex, wordIndex) {
      const team = voteType === 'decodeVotes' ? this.myTeamId : other(this.myTeamId);
      return Object.entries(this.room[team].round[voteType] || {})
        .map(([player, vote]) => {
          return vote[keyIndex] === wordIndex ? player : null;
        })
        .filter((player) => player);
    },
    other,
    keysEqual,
    finishedEncoding,
    intercepted,
    dropped,
    moment,
    points(team) {
      return intercepted(other(team), this.room.history) - dropped(team, this.room.history);
    },
    decrypters(team) {
      // Exclude the spy, as the are not decoding
      const decrypters = this.room[team].players.slice();
      unpush(decrypters, this.room[team].round.spy);
      return decrypters;
    },
    allPlayers(room) {
      return room.redTeam.players.concat(room.blueTeam.players).join(', ');
    },
  },
  computed: {
    isMod() {
      // For now, the first red team player is always the mod. Also me.
      return this.room.redTeam.players.indexOf(this.player.name) === 0 || this.player.name === 'Austin';
    },
    isRed() {
      return this.room.redTeam.players.includes(this.player.name);
    },
    isPlaying() {
      return this.isRed || this.room.blueTeam.players.includes(this.player.name);
    },
    myTeamId() {
      return this.isRed ? 'redTeam' : 'blueTeam';
    },
    // Which team's cards the player is looking at
    previewTeamId: {
      get() {
        return this.previewTeam || this.myTeamId;
      },
      set(id) {
        this.previewTeam = id;
      },
    },
    myTeam() {
      return this.room[this.myTeamId];
    },
    otherTeam() {
      return this.room[other(this.myTeamId)];
    },
    smugglersId() {
      // AKA interceptees
      const map = {
        RED_DECODE: 'redTeam',
        BLUE_DECODE: 'blueTeam',
        BOTH_DECODE: this.myTeamId,
      };
      return map[this.room.state];
    },
    gameOver() {
      return (
        // Game is over when every player on a team has (on average) intercepted
        // twice, or dropped two messages
        // TODO: could extract 2 to a constant
        intercepted('redTeam', this.room.history) >= 2 * this.room.blueTeam.players.length ||
        dropped('redTeam', this.room.history) >= 2 * this.room.blueTeam.players.length - 2 ||
        intercepted('blueTeam', this.room.history) >= 2 * this.room.redTeam.players.length ||
        dropped('blueTeam', this.room.history) >= 2 * this.room.redTeam.players.length - 2
      );
    },
  },
});

listenForLogin(vueApp);

function unpush(array, value) {
  const index = array.indexOf(value);
  if (index !== -1) {
    array.splice(index, 1);
  }
}

function other(team) {
  return team === 'redTeam' ? 'blueTeam' : 'redTeam';
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

function shuffleArray(array) {
  // From https://stackoverflow.com/a/12646864/1222351
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Random word for a category, copied from index.html
function randomWord(category = 'nouns', customWords = '') {
  const custom = customWords.split(/\s/);
  const categories = { nouns, compounds, verbs, adjectives, custom };
  const words = categories[category];
  return words[Math.floor(Math.random() * words.length)];
}

// Unique list of random words e.g. randomWords(4) => ['at', 'lol', 'cat', 'yo']
function randomWords(length) {
  // For now, take out nouns longer than 8 letters; ~758 of 825 nouns left
  const filteredNouns = nouns.filter((word) => word.length <= 8);
  // Assumes nouns has no duplicates.
  return shuffleArray(filteredNouns).slice(0, length);
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

function nextSpy(lastSpy, players) {
  const nextIndex = (players.indexOf(lastSpy) + 1 + players.length) % players.length;
  return players[nextIndex];
}

function finishedEncoding(round) {
  // If any element is not true (aka empty string), still not done.
  return !round.encode.some((e) => !e);
}

// votes = { alice: [1, 2, 3], ...}; players = ['alice', ...]
function finishedVoting(votes, players) {
  // Not done if any player has not yet voted
  if (!arrayContentsEqual(players, Object.keys(votes))) {
    return false;
  }
  // Done when every vote is not the default value of NO_VOTE
  return Object.values(votes)
    .flat()
    .every((v) => v !== NO_VOTE);
}

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
