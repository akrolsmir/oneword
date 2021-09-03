<template>
  <h1 class="title mt-6">Game setup</h1>
  <label class="label"
    >Game ID (preview:
    <a :href="`/preview/${local.name}`"
      >https://boardless.games/{{ local.name }}</a
    >)</label
  >
  <div class="field has-addons">
    <div class="control">
      <input
        type="text"
        class="input"
        placeholder="One Word"
        v-model="local.name"
      />
    </div>
    <div class="control">
      <button class="button" @click="duplicate(local.name)">Change ID</button>
    </div>
  </div>

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

  <h1 class="title mt-6">Publish game</h1>

  <div class="columns">
    <div class="column is-one-third">
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

      <label class="label">Creator</label>
      <input
        type="text"
        class="input"
        v-model="metadata.creatorName"
        disabled
        placeholder="Albert Einstein"
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
</template>

<style scoped>
.label {
  margin-top: 1rem;
  margin-bottom: 0rem;
}
</style>

<script>
import { cloneDeep, isEmpty } from 'lodash'
import { setRoom } from '../firebase/network'
import { getRuleset } from '../firebase/rulesets'
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
    this.local.name = this.room.name
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
      this.room.metadata = { ...this.metadata, status: 'PUBLISHED' }
      // TODO: Could suppport 'IN_REVIEW' status too
      alert('Successfully published!')
    },
    async duplicate(duplicateName) {
      // Ensure game doesn't already exist
      const existing = await getRuleset(duplicateName)
      if (!isEmpty(existing)) {
        alert(`Game with ID "${duplicateName}" already exists!`)
        return
      }

      const newRoom = cloneDeep(this.room)
      newRoom.metadata.status = 'DRAFT'
      newRoom.name = duplicateName
      await setRoom(newRoom)

      // Force a reload to the new room
      alert(`Successfully duplicated as ${duplicateName}!`)
      window.location = `/studio/${duplicateName}`
    },
  },
}
</script>
