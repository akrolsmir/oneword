<template>
  <BigColumn>
    <div>
      <!-- <span v-if="todayIsMonday">
        <div class="notification is-info py-2 has-text-centered">
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://discord.gg/AP7ssVPPCr"
            >{{ $t('frontPage.joinUs') }}</a
          >
          {{ $t('frontPage.joinUsTime') }}
        </div>
      </span> -->
      <div class="fancy big">{{ $t('frontPage.welcome') }}</div>
      {{ $t('frontPage.intro.justoneIntro0') }}
      <a
        target="_blank"
        rel="noopener noreferrer"
        href="https://amzn.to/2xV5lUm"
      >
        {{ $t('frontPage.intro.justoneIntro1') }}</a
      >{{ $t('frontPage.intro.justoneIntro2') }}<br />
      {{ $t('frontPage.intro.justoneIntro3') }}<br />
      {{ $t('frontPage.intro.justoneIntro4') }}<br />
    </div>
    <GamesList roomDirectory="/room/" gameName="One Word" />
    <br /><br />
  </BigColumn>
</template>

<style>
.background {
  background-color: #fffbeb;
}
</style>

<script>
import BigColumn from './BigColumn.vue'
import GamesList from './GamesList.vue'
import Sponsors from './Sponsors.vue'

export default {
  components: {
    BigColumn,
    GamesList,
    Sponsors,
  },
  computed: {
    todayIsMonday() {
      const today = new Date()
      return today.getDay() == 1
    },
  },
}
</script>
