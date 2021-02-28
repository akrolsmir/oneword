<template>
  <div class="content has-text-centered mt-6 mb-4">
    <p>
      <span class="nowrap"
        ><router-link to="/about"> 👋 &nbsp; About us </router-link></span
      >
      •
      <span class="nowrap"
        ><a
          target="_blank"
          rel="noopener noreferrer"
          href="https://discord.gg/AP7ssVPPCr"
        >
          💬 &nbsp; Join us on Discord
        </a></span
      >
      •
      <span class="nowrap"
        ><a target="_blank" rel="noopener noreferrer" :href="amazon">
          🎲 &nbsp; Buy the board game
        </a></span
      >
    </p>
  </div>
</template>

<script>
export default {
  props: {
    amazon: {
      type: String,
      default: 'https://amzn.to/3bbSpZn',
    },
  },
}
</script>
