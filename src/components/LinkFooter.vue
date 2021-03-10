<template>
  <div class="content has-text-centered mt-6 mb-4">
    <p>
      <span
        ><router-link to="/about">
          &thinsp; 👋&thinsp; About us
        </router-link></span
      >

      <span
        ><a
          target="_blank"
          rel="noopener noreferrer"
          href="https://discord.gg/AP7ssVPPCr"
        >
          &thinsp; 💬&thinsp; Join us on Discord
        </a></span
      >

      <span
        ><a target="_blank" rel="noopener noreferrer" :href="amazon">
          &thinsp; 🎲&thinsp; Buy the board game
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
