<template>
  <div v-if="state" class="box">
    <div class="fancy has-text-centered">
      <h1>Score History</h1>
    </div>
    <br />
    <div v-bind:key="index" v-for="(scoresThisRound, index) in scoreHistories">
      <div class="has-text-centered">
        <strong>Round {{ scoreHistories.length - index }}</strong>
      </div>
      <br />
      <div v-bind:key="scores" v-for="scores in scoresThisRound">
        <div class="has-text-centered">{{ scores }}</div>
        <br />
      </div>
      <br />
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {}
  },
  props: {
    scoreHistories: Array,
    state: String,
  },
}
</script>
