<template>
  <!-- Horizontal card mostly copied from https://stackoverflow.com/a/62174317/1222351 -->
  <div class="card is-horizontal clickable">
    <div class="card-image">
      <figure class="image is-square">
        <img
          :src="
            metadata.thumbnail || 'https://www.tibs.org.tw/images/default.jpg'
          "
          alt="Placeholder image"
        />
      </figure>
    </div>
    <div class="card-stacked">
      <div class="card-content">
        <div class="media-content">
          <div class="columns">
            <div class="column is-8">
              <p class="title is-4">{{ metadata.title }}</p>
            </div>
            <div class="column is-2">
              {{ metadata.minPlayers }}-{{ metadata.maxPlayers }} players
            </div>
            <div class="column is-2">{{ metadata.playtime }} minutes</div>
          </div>
          <p class="subtitle is-6">{{ metadata.description }}</p>

          <p>
            Made by Austin · Inspired by
            <a
              href="https://www.boardgamegeek.com/boardgame/2938/the-spyfall-game"
              >The Spyfall Game</a
            >
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
/* Crop images instead of stretching them. From:
https://github.com/jgthms/bulma/issues/2023#issuecomment-414129646 */
.image img {
  height: 100%;
  object-fit: cover;
}

.card.is-horizontal {
  display: flex;
}

.card.is-horizontal .card-image {
  width: 200px;
  height: 200px;
}

.card.is-horizontal .card-stacked {
  flex-direction: column;
  flex: 1 1 auto;
  display: flex;
  position: relative;
}

.card.is-horizontal .card-stacked .card-content {
  flex-grow: 1;
}
</style>

<script>
export default {
  props: ['ruleset'],
  computed: {
    metadata() {
      return this.ruleset.metadata || {}
    },
  },
}
</script>
