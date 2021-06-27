<template>
  <div class="columns is-gapless" height="100vh">
    <div class="column" v-for="player in ['Alpha', 'Bravo', 'Charlie']">
      <iframe
        :src="`/${game}/${id}?player=${player}`"
        frameborder="0"
        scrolling="no"
      ></iframe>
    </div>
  </div>
</template>

<style>
html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
}

iframe {
  border: 2px solid rgb(0, 0, 0);
  width: 100%;
  height: 3000px;
}
</style>

<script setup>
import { inject, onMounted } from '@vue/runtime-core'
import { useRoute } from 'vue-router'

// Hide the Navbar since each multiplay window already has it
const showNavbar = inject('showNavbar')
onMounted(() => {
  showNavbar(false)
})

const route = useRoute()
const game = route.params.game
const id = route.params.id

// TODOs:
// - Automatically resize window height to iframe
</script>
