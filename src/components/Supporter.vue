<template>
  <BigColumn>
    <h1>{{ $t('supporter.welcomeTitle') }}</h1>
    <article class="message container">
      <div class="message-header">{{ $t('supporter.cantstophere') }}</div>
      <div class="message-body">
        {{ $t('supporter.austinSayingHi') }}<br />
        <br />
        {{ $t('supporter.explainCoverFee') }}<br />
        <br />
        <h2>{{ $t('supporter.supporter.name') }}</h2>
        {{ $t('supporter.supporter.description') }} &mdash;{{
          $t('supporter.supporter.afterDescription')
        }}<br />
        <div class="promo-img">
          <img
            class="border"
            src="https://i.imgur.com/An4biWa.png"
            alt="Dropdown menu that Mods see when they are in a room. It has two options, Public and Private, and Private is selected."
          />
        </div>
        <div class="caption">{{ $t('supporter.supporter.noRando') }}</div>
        <br />
        {{ $t('supporter.supporter.unlockAvatar') }}<br />
        <div class="promo-img">
          <img
            class="border"
            src="https://i.imgur.com/vrTBWpd.png"
            alt="Austin's profile picture and username in the the list of players in a room, but Austin's name looks better than the rest."
          />
        </div>
        <div class="caption">
          {{ $t('supporter.supporter.configureAvatar') }}
          <a href="https://en.gravatar.com/">Gravatar</a>
          {{ $t('supporter.supporter.afterGravatar') }}
        </div>
        {{ $t('supporter.supporter.addfree') }}<br />
        <br />
        <div class="has-text-centered">
          <button
            class="button is-medium is-warning"
            @click="checkout('supporter')"
          >
            {{ $t('supporter.supporter.becomeone') }}
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
                alt="An example game round, where Amey guessed 'speckled' but the word was 'spot'."
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
                alt="The same game round, but now 'speckled' is marked as correct."
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
            alt="Some different word lists to play with, like Countries and Pokemon."
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
            alt="Frontpage listing of our sponsors"
          />
        </div>
        <div class="caption">{{ $t('supporter.sponsor.youthebest') }}</div>
        <br />
        {{ $t('supporter.sponsor.purpleBorder') }}<br />
        <div class="promo-img">
          <img
            class="border"
            src="https://i.imgur.com/cK90MQ0.png"
            alt="Austin's profile picture and username, but it looks so divine that the other names pale in comparison"
          />
        </div>
        <div class="caption">
          {{ $t('supporter.sponsor.purple') }}
        </div>
        <br />
        {{ $t('supporter.sponsor.getallPrivelge') }}<br />
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
        {{ $t('supporter.testies.fansays') }}
        <br />
        <br />
        <div class="notification is-warning is-light">
          "As a totally blind person I've been looking for games that I can
          play... Last Sunday, I had a play test with Sinclair, and those
          changes were made incredibly quickly. I played a few rounds this
          morning, and it was a much more enjoyable experience, and I believe in
          supporting developers who help their players. Thank you again."
          -Harrison
        </div>
        <div class="notification is-warning is-light">
          "We’ve been doing weekly Zoom game nights with extended family and
          this will be a great addition. It’s great for our large age range and
          really nice for older relatives who appreciate that you can play at
          your own pace." -Sandy
        </div>
        <div class="notification is-warning is-light">
          "I'm a 5th/6th grade Language Arts teacher in Ohio, and have been
          using the game/your site as a reward for students who get all their
          virtual assignments done... Thanks for your time and effort on this
          awesome project." -Eric
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
          "Our team at work loved playing One Word earlier this week in our
          weekly coffee social over zoom! I had played this game before in real
          life and I found your virtual version to be even easier to use because
          the words come up automatically and there's less transition time...
          You have fans on our team and we can't wait to play again!"<br />
          -Emily
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
          >{{ $t('supporter.permonth') }}
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
            {{ $t('supporter.supporter.addfreeExp') }}
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
          >{{ $t('supporter.permonth') }}
        </div>
        <div class="plan-items">
          <div class="plan-item">
            <b>{{ $t('supporter.champion.themed') }}</b>
          </div>
          <div class="plan-item">
            <b>{{ $t('supporter.champion.markas') }}</b>
          </div>
          <div class="plan-item">
            {{ $t('supporter.champion.privateRoom') }}
          </div>
          <div class="plan-item">{{ $t('supporter.supporter.priority') }}</div>
          <div class="plan-item">
            {{ $t('supporter.supporter.addfreeExp') }}
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
          >{{ $t('supporter.permonth') }}
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
            {{ $t('supporter.supporter.addfreeExp') }}
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
