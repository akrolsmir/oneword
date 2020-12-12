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

/**
Room: {
  name: 'apple',
  state: 'ENCODING', // or 'NOT_STARTED'/'RED_DECODE'/'BLUE_DECODE'/'BOTH_DECODE/'DONE'
  redTeam: {
    // Red team goes first on intercepts (TODO alternate?)
    // TODO name: 'Ugliest Carriages', emoji: '🤦‍♀️', color: '#FF4422'
    players: ['alice', 'bob'], // First player is team lead aka mod
    words: ['student', 'bible', 'catholic', 'eraser'],
    intercepted: 0,
    dropped: 1,
    round: {
      spy: 'alice',
      key: [4, 1, 2], // sometimes referred to as "message"
      encode: ['gone', 'lazy', 'book'],
      // intercept and decode start like keys [3, 2, 4].
      // But TODO extension would be individualized voting:
      intercept: {
        // TODO: Spy breaks ties? or mod? or first submitted? or random?
        carol: [2, 3, 1],
        dave: [2, 4, 1],
      },
      decode: {
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
    nouns,
    player: {
      name: '',
      // Local values, before they get uploaded
      encode: [],
      intercept: [],
      decode: [],
    },
    room: {
      // See below in created()
      name: 'banana',
    },
  },
  async created() {
    this.KEY_LENGTH = 3;
    this.WORDS_SHOWN = 4;

    // For now, always start by listening to the 'banana' example room
    const room = await getRoom(this.room);
    if (room) {
      this.room = room;
    } else {
      // Create a new room
      await this.resetRoom();
    }
    listenRoom(this);
  },
  async mounted() {
    const parsedUrl = new URL(window.location.href);
    const roomName = parsedUrl.searchParams.get('room');
    const playerName = parsedUrl.searchParams.get('player');
    if (playerName) {
      this.player.name = playerName;
    }
    if (roomName) {
      this.room.name = roomName;
    }
  },
  watch: {
    'room.state'(state) {
      this.$emit('reset-timer');
      // Clean up past inputs on each new round.
      if (state === 'DONE') {
        this.player.encode = [];
        this.player.intercept = [];
        this.player.decode = [];
      }
    },
  },
  methods: {
    async resetRoom() {
      this.room = {
        name: this.room.name,
        state: 'NOT_STARTED',
        redTeam: {
          name: 'Red',
          players: [],
          words: randomWords(4),
          intercepted: 0,
          dropped: 0,
          // Current round
          round: {},
        },
        blueTeam: {
          name: 'Blue',
          players: [],
          words: randomWords(4),
          intercepted: 0,
          dropped: 0,
          round: {},
        },
        history: [],
        timerLength: 100,
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
    async submitEncode() {
      this.myTeam.round.encode = this.player.encode;
      await this.saveRoom(`${this.myTeamId}.round.encode`);

      // Once both spies are done, move to intercepting (or straight to decoding in round 1)
      if (this.otherTeam.round.encode.length === this.myTeam.round.encode.length) {
        await this.nextState();
      }
    },
    async submitIntercept() {
      this.otherTeam.round.intercept = this.player.intercept;
      await this.saveRoom(`${other(this.myTeamId)}.round.intercept`);
      await this.checkIfDecrypted();
    },
    async submitDecode() {
      this.myTeam.round.decode = this.player.decode;
      await this.saveRoom(`${this.myTeamId}.round.decode`);
      await this.checkIfDecrypted();
    },
    async checkIfDecrypted() {
      if (!['RED_DECODE', 'BLUE_DECODE', 'BOTH_DECODE'].includes(this.room.state)) {
        console.error('intercept or decode called from invalid round!');
        return;
      }

      const team = this.smugglers;
      if (this.room.state === 'BOTH_DECODE') {
        if (!finished('decode', this.myTeam.round) || !finished('decode', this.otherTeam.round)) {
          // Only move forward when both teams are finished decoding
          return;
        }
      } else if (!finished('decode', this.room[team].round) || !finished('intercept', this.room[team].round)) {
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
        encode: [],
        intercept: [],
        decode: [],
      };
      this.room.blueTeam.round = {
        spy: nextSpy(this.room.blueTeam.round.spy, this.room.blueTeam.players),
        key: randomKey(this.KEY_LENGTH, this.WORDS_SHOWN),
        encode: [],
        intercept: [],
        decode: [],
      };
      // TODO when we're tracking separate rooms
      // this.room.lastUpdateTime = Date.now();

      // Overwrite existing room;
      await setRoom(this.room);
    },
    // Sync any number of properties of this.room to firebase
    async saveRoom(...props) {
      await updateRoom(this.room, Object.fromEntries(props.map((prop) => [prop, getIn(this.room, prop)])));
    },
    other,
    keysEqual,
    finished,
    intercepted,
    dropped,
    points(team) {
      return intercepted(other(team), this.room.history) - dropped(team, this.room.history);
    },
  },
  computed: {
    isRed() {
      return this.room.redTeam.players.includes(this.player.name);
    },
    isPlaying() {
      return this.isRed || this.room.blueTeam.players.includes(this.player.name);
    },
    myTeamId() {
      return this.isRed ? 'redTeam' : 'blueTeam';
    },
    myTeam() {
      return this.room[this.myTeamId];
    },
    otherTeam() {
      return this.room[other(this.myTeamId)];
    },
    smugglers() {
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
        // TODO: could extract 2 to a constant
        intercepted('redTeam', this.room.history) >= 2 ||
        dropped('redTeam', this.room.history) >= 2 ||
        intercepted('blueTeam', this.room.history) >= 2 ||
        dropped('blueTeam', this.room.history) >= 2
      );
    },
  },
});

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

// keyType = 'encode', 'intercept', 'decode'
function finished(keyType, round) {
  return round[keyType].length === vueApp.KEY_LENGTH;
}

// Returns how many of <team>'s messages have been intercepted
function intercepted(team, history) {
  return history
    .map((entry) => keysEqual(entry[team].round.intercept, entry[team].round.key))
    .reduce((a, b) => a + b, 0);
}

// Returns how many of <team>'s messages have not been correctly decoded
function dropped(team, history) {
  return history.map((entry) => !keysEqual(entry[team].round.decode, entry[team].round.key)).reduce((a, b) => a + b, 0);
}
