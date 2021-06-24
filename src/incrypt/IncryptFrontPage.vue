<template>
  <BigColumn>
    <div>
      <h2 class="subtitle fancy">Welcome to Incrypt!</h2>
      Incrypt is a word game for two teams, based on
      <a
        target="_blank"
        rel="noopener noreferrer"
        href="https://amzn.to/384qWYi"
        >Decrypto</a
      >.<br />
      Each spy incrypts three words by writing down three clues...<br />
      Too complex? Your own team won't get the message 🤦‍♀️<br />
      Too simple? The other team will intercept it! 👻<br />
    </div>
    <GamesList
      roomDirectory="/incrypt/"
      :activeFunc="notStarted"
      gameName="Incrypt"
    />
    <Sponsors />
    <br /><br />
  </BigColumn>
</template>

<script>
import BigColumn from '../components/BigColumn.vue'
import GamesList from '../components/GamesList.vue'
import Sponsors from '../components/Sponsors.vue'

export default {
  components: {
    BigColumn,
    GamesList,
    Sponsors,
  },
  methods: {
    notStarted(room) {
      return room.state === 'NOT_STARTED'
    },
  },
}
</script>
<style scoped>
.background {
  background-color: #d8d4d5;
}
</style>
