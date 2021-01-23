Vue.component('link-footer', {
  props: {
    amazon: {
      type: String,
      default: 'https://amzn.to/3bbSpZn',
    },
  },
  template: `
  <div class="content has-text-centered mt-6 mb-4">
    <p>
      <span class="nowrap"><a target="_blank" rel="noopener noreferrer" href="about.html" >
        👋 About us
      </a></span> •
      <span class="nowrap"><a target="_blank" rel="noopener noreferrer" href="https://discord.gg/AP7ssVPPCr" >
      💬 Join us on Discord
      </a></span> •
      <span class="nowrap"><a target="_blank" rel="noopener noreferrer" :href="amazon" >
        🎲 Buy the board game
      </a></span>
    </p>
  </div>`,
});
