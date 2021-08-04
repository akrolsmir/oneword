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
    <div class="column">
      <label class="label">Phases</label>
      <div class="content">
        <ol>
          <li v-for="state in room.rules.states">{{ state }} (❌)</li>
        </ol>
      </div>

      <div class="field has-addons">
        <div class="control">
          <input type="text" class="input" placeholder="New Phase" />
        </div>
        <div class="control">
          <button class="button">➕</button>
        </div>
      </div>
    </div>

    <div class="column">
      <label class="label">Roles</label>
      <div class="content">
        <ol>
          <li v-for="role in room.rules.roles">{{ role }} (❌)</li>
        </ol>
      </div>

      <div class="field has-addons">
        <div class="control">
          <input type="text" class="input" placeholder="New Role" />
        </div>
        <div class="control">
          <button class="button">➕</button>
        </div>
      </div>
    </div>

    <!-- Placeholder column -->
    <div class="column"></div>
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
}
</script>
