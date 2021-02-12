import { nouns, compounds, verbs, adjectives } from '../many-words.js';
import prompts from './prompts.js';
import {
  setRoom,
  updateRoom,
  getRoom,
  listRooms,
  listenRoom,
  unlistenRoom,
  listenForLogin,
} from '../firebase-network.js';

/**
   Room: {
     name: apple,
     players: ['alice', 'bob', 'carol'],
     currentRound: {
       state: 'PROMPT' // or 'RESPONSE' or 'CHOOSING'
       chooser: 'alice',
       prompt: 'Eat cake'
       responses: {
         alice: { story: 'You fall into a hole and die', words: ['hole'], votes: ['bob', 'carol'] }
         bob: { story: 'A dragon appears in front of you', words: [], votes: []},
         carol: { story: 'You start to hear a creepy chant', words: ['chant', 'creepy'], votes: ['alice'] }
       }
     }
     history: [{round1}, ...]
   }
  */
const vueApp = new Vue({
  el: '#vue',
  data: {
    user: {},
    allRooms: [],
    room: {
      name: randomWord('adjectives') + '-' + randomWord('nouns'),
      history: [],
    },
    player: {
      name: '',
      response: '',
    },
    suggestions: {
      nouns: [randomWord('nouns'), randomWord('nouns'), randomWord('nouns')],
      verbs: [randomWord('verbs'), randomWord('verbs')],
      adjectives: [randomWord('adjectives'), randomWord('adjectives')],
    },
    alertIsShowing: false,
    newMod: '',
    prompts,
    prompt: 0,
    vote: '',
  },
  async mounted() {
    this.allRooms = (await listRooms()).filter((room) => room.players.length > 0);
    const parsedUrl = new URL(window.location.href);
    const roomName = parsedUrl.searchParams.get('room');
    const playerName = parsedUrl.searchParams.get('player');
    if (playerName) {
      this.player.name = playerName;
    }
    if (roomName) {
      this.room.name = roomName;
      await this.enterRoom();
    }
  },
  watch: {
    'room.currentRound.state'(state) {
      // Clean up past inputs and replace used words when the round moves forward.
      if (state == 'CHOOSING') {
        this.replaceSuggestions(this.player.response);
        this.player.response = '';
      }
      // reset vote
      if (state == 'PROMPT') {
        this.vote = '';
      }
    },
    'room.history'(history) {
      this.$refs.history.stickToBottom();
    },
    vote(vote) {
      this.chooseResponse();
    },
  },
  computed: {
    timerLength() {
      if (this.room.currentRound && this.room?.timers.running) {
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
    isChooser() {
      return this.player.name == this?.room?.currentRound.chooser;
    },
    prettyStatus() {
      if (this.room.currentRound.state == 'PROMPT') {
        return this.isChooser
          ? 'What do you do now?'
          : `${this.room.currentRound.chooser} is writing their next action`;
      } else if (this.room.currentRound.state == 'RESPONSE') {
        return 'Write the next paragraph of this story';
      } else if (this.room.currentRound.state == 'CHOOSING') {
        return 'Fate is in your hands.';
      }
    },
    prettySuggestions() {
      // put suggestions in optimal order for creativity
      return [
        this.suggestions['nouns'][0],
        this.suggestions['verbs'][0],
        this.suggestions['adjectives'][0],
        this.suggestions['nouns'][1],
        this.suggestions['verbs'][1],
        this.suggestions['adjectives'][1],
        this.suggestions['nouns'][2],
      ];
    },
    playersInScoreOrder() {
      return [...this.room.players].sort((a, b) => this.scores[b] - this.scores[a]);
    },
    charCount() {
      return this.player.response.length;
    },
    voted() {
      return Object.values(this.room.currentRound.responses).flatMap((r) => r.votes);
    },
    scores() {
      const scores = Object.fromEntries(this.room.players.map((player) => [player, 0]));
      for (let round of this.room.history) {
        const roundScores = this.score(round);
        for (let player in roundScores) {
          scores[player] += roundScores[player];
        }
      }
      return scores;
    },
  },
  methods: {
    md5,
    moment,
    randomWord,
    listRooms,
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
        while (
          room.players.includes(this.player.name) &&
          (this.user.guest || this.user.email != room.playerData[this.player.name].email)
        ) {
          this.player.name = capitalize(randomWord('adjectives')) + ' ' + this.player.name;
        }

        this.room = room;
        return await this.joinRoom();
      } else {
        // Create a new room
        listenRoom(this);
        return await this.resetRoom();
      }
    },
    async resetRoom() {
      this.room = {
        name: this.room.name,
        players: [this.player.name],
        currentRound: {
          state: 'PROMPT',
          chooser: this.player.name,
          responses: {},
        },
        history: [],
        public: true,
        lastUpdateTime: Date.now(),
        timers: { PROMPT: '', RESPONSE: '', CHOOSING: '', running: false },
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
    async submitPrompt() {
      await updateRoom(this.room, {
        'currentRound.prompt': this.room.currentRound.prompt,
        'currentRound.state': 'RESPONSE',
      });
    },
    async submitResponse() {
      const update = {};
      //this.room.currentRound.responses[this.player.name].story = this.player.response;
      update[`currentRound.responses.${this.player.name}.story`] = this.player.response;
      const bonus = [
        ...this.suggestions['nouns'],
        ...this.suggestions['verbs'],
        ...this.suggestions['adjectives'],
      ].filter((word) => this.player.response.toLowerCase().includes(word));
      update[`currentRound.responses.${this.player.name}.words`] = bonus;
      update[`currentRound.responses.${this.player.name}.votes`] = [];

      // If all responses are in, move to choosing
      const done = this.room.players.every((p) => this.room.currentRound.responses[p] || p == this.player.name);
      if (done) {
        update['currentRound.state'] = 'CHOOSING';
      }
      await updateRoom(this.room, update);
    },
    async chooseResponse() {
      // unvote if voted already
      Object.values(this.room.currentRound.responses).forEach((r) => {
        let i = r.votes.indexOf(this.player.name);
        if (i >= 0) {
          this.$delete(r.votes, i);
        }
      });
      // vote
      this.room.currentRound.responses[this.vote]?.votes?.push(this.player.name);
      await this.saveRoom('currentRound');
      // if all votes are in, go to next round
      if (this.room.players.every((p) => this.voted.includes(p))) {
        await this.nextStage();
      }
    },
    maxVotes(round) {
      return Math.max(...Object.values(round.responses).map((resp) => resp.votes.length));
    },
    score(round) {
      const maxVotes = this.maxVotes(round);
      return Object.fromEntries(
        Object.entries(round.responses).map((entry) => {
          const [name, resp] = entry;
          return [name, resp.votes.length * (5 + resp.words.length) + (resp.votes.length === maxVotes) * 5];
        })
      );
    },
    hasSubmitted(player) {
      return (
        (this.room.currentRound.state == 'RESPONSE' && !!this.room.currentRound.responses[player]) ||
        (this.room.currentRound.state == 'CHOOSING' && this.voted.includes(player))
      );
    },
    async nextStage() {
      if (this.room.currentRound.state == 'PROMPT') {
        return await updateRoom(this.room, { 'currentRound.state': 'RESPONSE' });
      } else if (this.room.currentRound.state == 'RESPONSE') {
        // submit current text as response if player has not yet submitted
        if (!this.room.currentRound.responses[this.player.name]) {
          await this.submitResponse();
        }
        return await updateRoom(this.room, { 'currentRound.state': 'CHOOSING' });
      } else if (this.room.currentRound.state == 'CHOOSING') {
        // Choose the story continuation
        const winners = Object.entries(this.room.currentRound.responses)
          .filter((entry) => entry[1].votes.length === this.maxVotes(this.room.currentRound))
          .map((entry) => entry[0]);
        return await this.newRound();
      }
    },
    async newRound() {
      this.room.history.push(this.room.currentRound);
      this.room.currentRound = {
        state: 'PROMPT',
        chooser: nextChooser(this.room.currentRound.chooser, this.room.players),
        responses: {},
      };
      this.room.lastUpdateTime = Date.now();

      // Overwrite existing room;
      await setRoom(this.room);
    },
    async toggleTimers() {
      this.room.timers.running = !this.room.timers.running;
      await this.saveRoom('timers');
    },
    // Sync any number of properties of this.room to firebase
    async saveRoom(...props) {
      await updateRoom(this.room, Object.fromEntries(props.map((prop) => [prop, this.room[prop]])));
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
          firebase.analytics().logEvent('view_promotion', {
            source: 'modtools',
          });
          window.open('./supporter.html', '_blank');
        }
        // Reset UI to non-supporter defaults
        this.room.public = true;
      }
    },
    // generate new suggestions to replace used words
    replaceSuggestions(response) {
      for (let category of ['verbs', 'nouns', 'adjectives']) {
        this.suggestions[category].forEach((word, i) => {
          if (response.toLowerCase().includes(word)) {
            this.$set(this.suggestions[category], i, randomWord(category));
          }
        });
      }
    },
    async chooseStartingPrompt() {
      this.room.history = [
        {
          chooser: 'Premise',
          responses: {
            ' ': {
              story: this.prompts[this.prompt],
              words: [],
              votes: [],
            },
          },
        },
      ];
      await this.saveRoom('history');
    },
  },
});
listenForLogin(vueApp);

function nextChooser(lastchooser, players) {
  const nextIndex = (players.indexOf(lastchooser) + 1 + players.length) % players.length;
  return players[nextIndex];
}

function randomWord(category = 'nouns', customWords = '') {
  const custom = customWords.split(/\s/);
  const categories = { nouns, compounds, verbs, adjectives, custom };
  const words = categories[category];
  return words[Math.floor(Math.random() * words.length)].toLowerCase();
}

function capitalize(str) {
  return str ? str[0].toLocaleUpperCase() + str.substring(1) : '';
}
