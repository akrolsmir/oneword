<template>
  <h2 class="fancy">Sponsors</h2>
  We're grateful to be <a href="./supporter.html">sponsored by</a>:
  <div class="m-2">
    <Nametag
      name="Tory N."
      :user="{ email: 'telarian@gmail.com', supporter: 'SPONSOR' }"
    />
  </div>
  Thanks for supporting One Word!
</template>
<script>
import Nametag from './Nametag.vue'

export default {
  components: {
    Nametag,
  },
}
</script>
