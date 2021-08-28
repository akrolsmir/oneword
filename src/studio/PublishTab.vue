<template>
  <div class="columns">
    <div class="column is-one-third">
      <label class="label"
        >Preview URL:
        <a :href="`/preview/${room.name}`">boardless.games/{{ room.name }}</a>
      </label>
      <BulmaThumbnail :imageUrl="metadata.thumbnail" />
    </div>
    <div class="column">
      <label class="label">Game title</label>
      <input
        type="text"
        class="input"
        v-model="metadata.title"
        placeholder="One Word"
      />

      <label class="label">Thumbnail URL</label>
      <input
        type="text"
        class="input"
        v-model="metadata.thumbnail"
        placeholder="https://..."
      />

      <label class="label">Game description</label>
      <textarea
        name="test"
        class="textarea"
        v-model="metadata.description"
        placeholder="This is an online game based on Just One, a co-op word game for 3+ players.
In each of the 13 rounds, come up with a one-word hint for the guesser...
But beware: duplicate hints are discarded!"
      ></textarea>
    </div>
  </div>

  <label class="label">Tags</label>
  <input
    type="text"
    class="input"
    v-model="metadata.tagsString"
    placeholder="word, party, coop"
  />

  <div class="columns">
    <div class="column">
      <label class="label">Min players</label>
      <input
        type="number"
        class="input"
        v-model="metadata.minPlayers"
        placeholder="3"
      />
    </div>
    <div class="column">
      <label class="label">Max players</label>
      <input
        type="number"
        class="input"
        v-model="metadata.maxPlayers"
        placeholder="20"
      />
    </div>
    <div class="column">
      <label class="label">Playtime in minutes</label>
      <input
        type="number"
        class="input"
        v-model="metadata.playtime"
        placeholder="20"
      />
    </div>
  </div>

  <button class="button is-success" @click="publish">Publish</button>

  <h1 class="title mt-6 mb-0">Modify game rules</h1>

  <div class="columns">
    <div class="column" v-for="listName in ['states', 'roles', 'testers']">
      <label class="label">{{ listName.toLocaleUpperCase() }}</label>
      <div class="content">
        <ol>
          <li v-for="item in room.rules[listName]">
            {{ item }} <a @click="remove(listName, item)">❌</a>
          </li>
        </ol>
      </div>

      <div class="field has-addons">
        <div class="control">
          <input
            type="text"
            class="input"
            placeholder="New item"
            v-model="local[listName]"
          />
        </div>
        <div class="control">
          <button class="button" @click="add(listName, local[listName])">
            ➕
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.label {
  margin-top: 1rem;
  margin-bottom: 0rem;
}
</style>

<script>
import cloneDeep from 'lodash/cloneDeep'
import BulmaThumbnail from '../library/BulmaThumbnail.vue'

export default {
  components: { BulmaThumbnail },
  props: ['room'],
  data() {
    return {
      local: {},
      // Note: metadata is local, too =P
      metadata: {},
    }
  },
  created() {
    this.metadata = cloneDeep(this.room.metadata) || {}
  },
  methods: {
    // TODO: New states shouldn't null-ify
    add(listName, item) {
      this.room.rules[listName].push(item)
      this.local[listName] = ''
    },
    remove(listName, item) {
      const filtered = this.room.rules[listName].filter((i) => i != item)
      this.room.rules[listName] = filtered
    },
    publish() {
      this.room.metadata = cloneDeep(this.metadata)
      alert('Successfully published!')
    },
  },
}
</script>
