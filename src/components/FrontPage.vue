<template>
  <BigColumn>
    <div>
      <!-- TODO: Make this show up automatically on Mondays -->
      <span v-if="todayIsMonday">
        <div class="notification is-info py-2 has-text-centered">
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://discord.gg/AP7ssVPPCr"
            >{{ $t('frontPage.joinUs') }}</a
          >
          {{ $t('frontPage.joinUsTime') }}
        </div>
      </span>
      <div class="fancy big">{{ $t('frontPage.welcome') }}</div>
      {{ $t('frontPage.introBeforeJustone') }}
      <a
        target="_blank"
        rel="noopener noreferrer"
        href="https://amzn.to/2xV5lUm"
      >
        Just One</a
      >{{ $t('frontPage.introAfterJustone') }}<br />
      {{ $t('frontPage.introForGame') }}<br />
      {{ $t('frontPage.introForHint') }}<br />
    </div>
    <GamesList roomDirectory="/room/" />
    <Sponsors />
    <br /><br />
  </BigColumn>
</template>

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
