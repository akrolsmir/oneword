<template>
  <h1 class="title is-5 is-italic">(Not yet implemented)</h1>

  <label class="label"
    >Preview URL:
    <a :href="`/twopreview/${room.name}`">boardless.games/{{ room.name }}</a>
  </label>

  <label class="label">Game title</label>
  <input type="text" class="input" />

  <label class="label">Game description</label>
  <textarea name="test" class="textarea"></textarea>

  <label class="label">Tags</label>
  <input type="text" class="input" />

  <div class="columns">
    <div class="column">
      <label class="label">Min players</label>
      <input type="number" class="input" />
    </div>
    <div class="column">
      <label class="label">Max players</label>
      <input type="number" class="input" />
    </div>
    <div class="column">
      <label class="label">Playtime in minutes</label>
      <input type="number" class="input" />
    </div>
  </div>

  <button class="button is-success">Publish</button>

  <div class="columns">
    <div class="column" v-for="listName in ['states', 'roles', 'testers']">
      <label class="label">{{ listName }}</label>
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
export default {
  props: ['room'],
  data() {
    return {
      local: {
        state: '',
        role: '',
      },
    }
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
  },
}
</script>
