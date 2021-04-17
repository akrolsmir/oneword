<template>
  <BigColumn>
    <div>
      Spectrum -- inspired by
      <a
        target="_blank"
        rel="noopener noreferrer"
        href="https://amzn.to/3t8gNmA"
        >Wavelength</a
      >, a party game for 3+ players.<br />
    </div>
    <GamesList roomDirectory="/spectrum/" />
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
}
</script>
<style scoped>
.background {
  background-color: #e0e7ff;
}
</style>
