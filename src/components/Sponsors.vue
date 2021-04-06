<template>
  <div>
    <h2 class="fancy">Sponsors</h2>
    We're grateful to be
    <a href="./supporter" @click.prevent="referSupporter('sponsors')">
      sponsored by</a
    >:
    <div class="m-2 field is-grouped is-grouped-multiline">
      <a href="https://asplos-conference.org/"
        ><img src="/images/asplos-2021.png" width="85" class="mr-2"
      /></a>
      <Nametag
        name="Coleman T."
        :user="{ email: 'colemanotoole@gmail.com ', supporter: 'SPONSOR' }"
      />
      <Nametag
        name="Tory N."
        :user="{ email: 'telarian@gmail.com', supporter: 'SPONSOR' }"
      />
    </div>
    Thanks for supporting One Word!
  </div>
</template>
<script>
import { referSupporter } from '../firebase/network'
import Nametag from './Nametag.vue'

export default {
  components: {
    Nametag,
  },
  methods: {
    referSupporter,
  },
}
</script>
