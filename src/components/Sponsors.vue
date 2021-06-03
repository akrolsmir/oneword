<template>
  <div>
    <h2 class="fancy">{{ $t('sponsors.sponsors') }}</h2>
    {{ $t('sponsors.gratefulText') }}
    <a href="./supporter" @click.prevent="referSupporter('sponsors')">
      {{ $t('sponsors.sponsorBy') }}</a
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
        name="Sara O."
        :user="{ email: '	sarajolguin@gmail.com', supporter: 'SPONSOR' }"
      />
      <Nametag
        name="Tory N."
        :user="{ email: 'telarian@gmail.com', supporter: 'SPONSOR' }"
      />
    </div>
    {{ $t('sponsors.thankyouNote') }}
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
