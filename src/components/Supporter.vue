<template>
  <BigColumn>
    <h1>{{ $t('supporter.welcomeTitle') }}</h1>
    <article class="message container">
      <div class="message-header">{{ $t('supporter.cantStopHere') }}</div>
      <div class="message-body">
        {{ $t('supporter.austinSayingHi') }}<br />
        <br />
        {{ $t('supporter.explainCoverFee') }}<br />
        <br />
        <h2>{{ $t('supporter.supporter.name') }}</h2>
        {{ $t('supporter.supporter.description.message0') }} &mdash;{{
          $t('supporter.supporter.description.message1')
        }}<br />
        <div class="promo-img">
          <img
            class="border"
            src="https://i.imgur.com/An4biWa.png"
            :alt="$t('supporter.supporter.img0')"
          />
        </div>
        <div class="caption">{{ $t('supporter.supporter.noRando') }}</div>
        <br />
        {{ $t('supporter.supporter.unlockAvatar') }}<br />
        <div class="promo-img">
          <img
            class="border"
            src="https://i.imgur.com/vrTBWpd.png"
            :alt="$t('supporter.supporter.img1')"
          />
        </div>
        <div class="caption">
          {{ $t('supporter.supporter.configureAvatar.message0') }}
          <a href="https://en.gravatar.com/">{{
            $t('supporter.supporter.configureAvatar.message1')
          }}</a>
          {{ $t('supporter.supporter.configureAvatar.message2') }}
        </div>
        {{ $t('supporter.supporter.adFree') }}<br />
        <br />
        <div class="has-text-centered">
          <button
            class="button is-medium is-warning"
            @click="checkout('supporter')"
          >
            {{ $t('supporter.supporter.becomeOne') }}
          </button>
        </div>
        <br />
        <br />

        <h2>{{ $t('supporter.champion.name') }}</h2>
        {{ $t('supporter.champion.description') }}
        <div class="columns">
          <div class="column">
            <div class="promo-img">
              <img
                class="border"
                src="/images/spot-bad.png"
                :alt="$t('supporter.champion.img0')"
              />
            </div>
            <div class="caption">
              {{ $t('supporter.champion.speckled') }}
            </div>
          </div>
          <div class="column">
            <div class="promo-img">
              <img
                class="border"
                src="/images/spot-good.png"
                :alt="$t('supporter.champion.img1')"
              />
            </div>
            <div class="caption">
              {{ $t('supporter.champion.markCorrect') }}
            </div>
          </div>
        </div>
        {{ $t('supporter.champion.unlockTheme') }}<br />
        <div class="promo-img">
          <img
            class="border"
            src="/images/themed-lists.png"
            :alt="$t('supporter.champion.img2')"
          />
        </div>
        <div class="caption">
          {{ $t('supporter.champion.tryThese') }}
        </div>
        <br />
        {{ $t('supporter.champion.getSupporter') }}<br />
        <br />
        <div class="has-text-centered">
          <button
            class="button is-medium is-primary"
            @click="checkout('champion')"
          >
            {{ $t('supporter.champion.becomeone') }}
          </button>
        </div>
        <br />
        <br />

        <h2>{{ $t('supporter.sponsor.name') }}</h2>
        {{ $t('supporter.sponsor.description') }}<br />
        <div class="promo-img">
          <img
            class="border"
            width="299"
            src="/images/sponsors.png"
            :alt="$t('supporter.sponsor.img0')"
          />
        </div>
        <div class="caption">{{ $t('supporter.sponsor.youTheBest') }}</div>
        <br />
        {{ $t('supporter.sponsor.purpleBorder') }}<br />
        <div class="promo-img">
          <img
            class="border"
            src="https://i.imgur.com/cK90MQ0.png"
            :alt="$t('supporter.sponsor.img1')"
          />
        </div>
        <div class="caption">
          {{ $t('supporter.sponsor.purple') }}
        </div>
        <br />
        {{ $t('supporter.sponsor.getAllPrivilege') }}<br />
        <br />
        <div class="has-text-centered">
          <button
            class="button is-medium is-danger"
            @click="checkout('sponsor')"
          >
            {{ $t('supporter.sponsor.becomeone') }}
          </button>
        </div>
        <br />
        <br />

        <h2>{{ $t('supporter.testies.name') }}</h2>
        {{ $t('supporter.testies.fanSays') }}
        <br />
        <br />
        <div class="notification is-warning is-light">
          {{ $t('supporter.testies.harrison') }}
        </div>
        <div class="notification is-warning is-light">
          {{ $t('supporter.testies.sandy') }}
        </div>
        <div class="notification is-warning is-light">
          {{ $t('supporter.testies.eric') }}
        </div>
        <!-- <div class="notification is-warning is-light">
          "I am over the moon that I can play one of my favorite games remotely, thanks to you!
          Makes the quarantine loads better."
          -Sarah
        </div> -->
        <!-- <div class="notification is-warning is-light">
          "Thanks for developing, such a fun party game... 
          I've had many fun games with friends on the website, I appreciate it!" -Renee
        </div> -->
        <!-- <div class="notification is-warning is-light">
          "Appreciate your prompt response! 
          And thanks for creating this game! Super fun :)" -Anita
        </div> -->
        <div class="notification is-warning is-light">
          {{ $t('supporter.testies.emily') }}
        </div>

        <br />
        <h2>{{ $t('supporter.ready') }}</h2>
        {{ $t('supporter.cancel') }}<br /><br />

        {{ $t('supporter.question') }}
        <a href="mailto:austin@oneword.games">austin@oneword.games</a
        ><br /><br />
        {{ $t('supporter.thankyou') }}<br />
      </div>
    </article>

    <div id="error-message"></div>

    <div class="pricing-table container">
      <div class="pricing-plan">
        <div class="plan-header">{{ $t('supporter.supporter.name') }}</div>
        <div class="plan-price">
          <span class="plan-price-amount"
            ><span class="plan-price-currency">$</span
            >{{ planValues['supporter'] }}</span
          >{{ $t('supporter.perMonth') }}
        </div>
        <div class="plan-items">
          <div class="plan-item">
            <b>{{ $t('supporter.supporter.privateRoom') }}</b>
          </div>
          <div class="plan-item">
            <b>{{ $t('supporter.supporter.customAvatar') }}</b>
          </div>
          <div class="plan-item">{{ $t('supporter.supporter.priority') }}</div>
          <div class="plan-item">
            {{ $t('supporter.supporter.adFreeExp') }}
          </div>
          <div class="plan-item">-</div>
          <div class="plan-item">-</div>
        </div>
        <div class="plan-footer">
          <button
            class="button is-fullwidth is-warning"
            @click="checkout('supporter')"
          >
            {{ $t('supporter.supporter.encourage') }}
          </button>
        </div>
      </div>

      <div class="pricing-plan is-active">
        <div class="plan-header">{{ $t('supporter.champion.name') }}</div>
        <div class="plan-price">
          <span class="plan-price-amount"
            ><span class="plan-price-currency">$</span
            >{{ planValues['champion'] }}</span
          >{{ $t('supporter.perMonth') }}
        </div>
        <div class="plan-items">
          <div class="plan-item">
            <b>{{ $t('supporter.champion.themed') }}</b>
          </div>
          <div class="plan-item">
            <b>{{ $t('supporter.champion.markAs') }}</b>
          </div>
          <div class="plan-item">
            {{ $t('supporter.champion.privateRoom') }}
          </div>
          <div class="plan-item">{{ $t('supporter.supporter.priority') }}</div>
          <div class="plan-item">
            {{ $t('supporter.supporter.adFreeExp') }}
          </div>
          <div class="plan-item">-</div>
        </div>
        <div class="plan-footer">
          <button class="button is-fullwidth" @click="checkout('champion')">
            {{ $t('supporter.champion.encourage') }}
          </button>
        </div>
      </div>

      <div class="pricing-plan is-danger">
        <div class="plan-header">{{ $t('supporter.sponsor.name') }}</div>
        <div class="plan-price">
          <span class="plan-price-amount"
            ><span class="plan-price-currency">$</span
            >{{ planValues['sponsor'] }}</span
          >{{ $t('supporter.perMonth') }}
        </div>
        <div class="plan-items">
          <div class="plan-item">
            <b>{{ $t('supporter.sponsor.frontpage') }}</b>
          </div>
          <div class="plan-item">
            <b>{{ $t('supporter.sponsor.custom') }}</b>
          </div>
          <div class="plan-item">{{ $t('supporter.sponsor.wordList') }}</div>
          <div class="plan-item">
            {{ $t('supporter.champion.privateRoom') }}
          </div>
          <div class="plan-item">{{ $t('supporter.supporter.priority') }}</div>
          <div class="plan-item">
            {{ $t('supporter.supporter.adFreeExp') }}
          </div>
        </div>
        <div class="plan-footer">
          <button class="button is-fullwidth" @click="checkout('sponsor')">
            {{ $t('supporter.sponsor.encourage') }}
          </button>
        </div>
      </div>
    </div>
  </BigColumn>
</template>

<script>
import { inject } from 'vue'
import 'bulma-pricingtable/dist/css/bulma-pricingtable.min.css'
import { firebaseLogEvent } from '../firebase/network'
import BigColumn from './BigColumn.vue'

// Dynamically import Stripe to reduce bundle size
let loadStripe
async function importStripe() {
  loadStripe = (await import('@stripe/stripe-js/pure')).loadStripe
}

export default {
  components: { BigColumn },
  setup() {
    return { user: inject('currentUser') }
  },
  data() {
    return {
      planValues: { supporter: 3, champion: 6, sponsor: 10 },
    }
  },
  created() {
    /* no await */ importStripe()
  },
  methods: {
    async checkout(planName) {
      if (!(this.user && this.user.uid)) {
        alert('Sign in to become a supporter!')
        return
      }

      firebaseLogEvent('purchase', {
        value: this.planValues[planName],
        currency: 'USD',
      })

      // Test API keys
      // const stripe = await loadStripe(
      //   'pk_test_TBbJ3UlK3uxu5fIiaFa1fEgq00F66fSFTg'
      // )
      // const prices = {
      //   supporter: 'price_1IQ2WtCGj90UZkiJHP2cdy31',
      //   champion: 'price_1IQ2WtCGj90UZkiJHP2cdy31',
      //   sponsor: 'price_1IQ2WtCGj90UZkiJHP2cdy31',
      // }

      // Prod API keys
      const stripe = await loadStripe(
        'pk_live_V662ekSpUVB7NK0YRz6mZRrg00VtBZqQ6k'
      )
      const prices = {
        supporter: 'price_1IQ2NWCGj90UZkiJe5UnS3th',
        champion: 'price_1IQ2MaCGj90UZkiJN1p1jZxc',
        sponsor: 'price_1IAhI0CGj90UZkiJbHPpHjE5',
      }

      // When the customer clicks on the button, redirect them to Checkout.
      stripe
        .redirectToCheckout({
          lineItems: [{ price: prices[planName], quantity: 1 }],
          mode: 'subscription',
          // Do not rely on the redirect to the successUrl for fulfilling
          // purchases, customers may not always reach the success_url after
          // a successful payment.
          // Instead use one of the strategies described in
          // https://stripe.com/docs/payments/checkout/fulfillment
          successUrl: window.location.origin + `/thanks?type=${planName}`,
          cancelUrl: window.location.origin + '/supporter',
        })
        .then(function (result) {
          if (result.error) {
            // If `redirectToCheckout` fails due to a browser or network
            // error, display the localized error message to your customer.
            const displayError = document.getElementById('error-message')
            displayError.textContent = result.error.message
          }
        })
    },
  },
}
</script>

<style scoped>
h1,
h2,
h3 {
  font-family: 'Merienda', cursive;
}

h1 {
  text-align: center;
  margin-bottom: 10px;
  font-size: 60px;
}

h2 {
  margin-bottom: 6px;
  font-size: 24px;
}

.border {
  border: solid;
}

.promo-img {
  margin-top: 0.5rem;
  display: flex;
  justify-content: center;
}

.caption {
  margin: 6px;
  text-align: center;
  font-style: italic;
}

/* Make pricing table exceed the 600px column, and also center it. */
.pricing-table {
  width: 1000px;
  margin-left: -200px;
}
</style>
