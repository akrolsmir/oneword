<template>
  <h1>Support One Word</h1>
  <article class="message container">
    <div class="message-header">Can't stop at just One Word?</div>
    <div class="message-body">
      Hi there! I'm Austin, the lead developer behind One Word. If you've been
      enjoying the game, consider becoming a supporter!<br />
      <br />
      You'll be helping cover our server and development costs, and we offer
      some neat perks as well!<br />
      <br />
      <h2>Supporter</h2>
      All supporters get the ability to create private rooms &mdash; those are
      rooms which are not visible from the home page, and are invite-only.<br />
      <div class="promo-img">
        <img
          class="border"
          src="https://i.imgur.com/An4biWa.png"
          alt="Dropdown menu that Mods see when they are in a room. It has two options, Public and Private, and Private is selected."
        />
      </div>
      <div class="caption">No more randos crashing your family game</div>
      <br />
      You'll also unlock a customizable user avatar with a shiny gold border.
      Rep your supporter status to all your friends!<br />
      <div class="promo-img">
        <img
          class="border"
          src="https://i.imgur.com/vrTBWpd.png"
          alt="Austin's profile picture and username in the the list of players in a room, but Austin's name looks better than the rest."
        />
      </div>
      <div class="caption">
        Configure your avatar on <a href="https://en.gravatar.com/">Gravatar</a>
      </div>
      Supporters also get priority support and an ad-free experience. Does that
      all sound good?<br />
      <br />
      <div class="has-text-centered">
        <button
          class="button is-medium is-warning"
          @click="checkout('supporter')"
        >
          Become a Supporter! ($2.99/month)
        </button>
      </div>
      <br />
      <br />

      <h2>Champion</h2>
      Become a Champion, and you'll get two new perks. First, you get the
      ability to override our scoring system and mark ANY guess as correct.
      <div class="columns">
        <div class="column">
          <div class="promo-img">
            <img
              class="border"
              width="377px"
              src="../assets/spot-bad.png"
              alt="An example game round, where Amey guessed 'speckled' but the word was 'spot'."
            />
          </div>
          <div class="caption">If you think "speckled" was close enough...</div>
        </div>
        <div class="column">
          <div class="promo-img">
            <img
              class="border"
              width="377px"
              src="../assets/spot-good.png"
              alt="The same game round, but now 'speckled' is marked as correct."
            />
          </div>
          <div class="caption">You can mark it as correct!</div>
        </div>
      </div>
      You'll also unlock a bunch of specially-themed word lists to play with:<br />
      <div class="promo-img">
        <img
          class="border"
          src="../assets/themed-lists.png"
          alt="Some different word lists to play with, like Countries and Pokemon."
        />
      </div>
      <div class="caption">
        Tired of nouns, verbs, and adjectives? Try these!
      </div>
      <br />
      And of course, you'll get all the benefits that Supporters get: private
      rooms and a custom user avatar!<br />
      <br />
      <div class="has-text-centered">
        <button
          class="button is-medium is-primary"
          @click="checkout('champion')"
        >
          Become a Champion! ($4.99/month)
        </button>
      </div>
      <br />
      <br />

      <h2>Sponsor</h2>
      As a Sponsor of One Word, you'll be credited on our home page for EVERYONE
      to see.<br />
      <div class="promo-img">
        <img
          class="border"
          width="299px"
          src="../assets/sponsors.png"
          alt="Frontpage listing of our sponsors"
        />
      </div>
      <div class="caption">Really, you're the best.</div>
      <br />
      Plus, you now get a *purple* border. One-up all the other supporters!<br />
      <div class="promo-img">
        <img
          class="border"
          src="https://i.imgur.com/cK90MQ0.png"
          alt="Austin's profile picture and username, but it looks so divine that the other names pale in comparison"
        />
      </div>
      <div class="caption">
        Purple, the color of royalty, emperors... and you!
      </div>
      <br />
      And naturally, all the Supporter and Champion perks are yours as well.
      Private rooms! Correct guesses! Themed word lists! What are you waiting
      for?<br />
      <br />
      <div class="has-text-centered">
        <button class="button is-medium is-danger" @click="checkout('sponsor')">
          Become a Sponsor! ($9.99/month)
        </button>
      </div>
      <br />
      <br />

      <h2>Testimonials</h2>
      Here's what our fans have to say:
      <br />
      <br />
      <div class="notification is-warning is-light">
        "As a totally blind person I've been looking for games that I can
        play... Last Sunday, I had a play test with Sinclair, and those changes
        were made incredibly quickly. I played a few rounds this morning, and it
        was a much more enjoyable experience, and I believe in supporting
        developers who help their players. Thank you again." -Harrison
      </div>
      <div class="notification is-warning is-light">
        "We’ve been doing weekly Zoom game nights with extended family and this
        will be a great addition. It’s great for our large age range and really
        nice for older relatives who appreciate that you can play at your own
        pace." -Sandy
      </div>
      <div class="notification is-warning is-light">
        "I'm a 5th/6th grade Language Arts teacher in Ohio, and have been using
        the game/your site as a reward for students who get all their virtual
        assignments done... Thanks for your time and effort on this awesome
        project." -Eric
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
        "Our team at work loved playing One Word earlier this week in our weekly
        coffee social over zoom! I had played this game before in real life and
        I found your virtual version to be even easier to use because the words
        come up automatically and there's less transition time... You have fans
        on our team and we can't wait to play again!"<br />
        -Emily
      </div>

      <br />
      <h2>Ready to support One Word?</h2>
      You can cancel your support at any time -- and if you're unhappy for any
      reason, let us know and we'll provide a full refund.<br /><br />

      As always, if you have any questions, or need help, get in touch at
      <a href="mailto:austin@oneword.games">austin@oneword.games</a
      >.<br /><br />
      Thanks, and happy cluing!<br />
    </div>
  </article>

  <div id="error-message"></div>

  <div class="pricing-table container">
    <div class="pricing-plan">
      <div class="plan-header">Supporter</div>
      <div class="plan-price">
        <span class="plan-price-amount"
          ><span class="plan-price-currency">$</span
          >{{ planValues['supporter'] }}</span
        >/month
      </div>
      <div class="plan-items">
        <div class="plan-item"><b>Private rooms!</b></div>
        <div class="plan-item"><b>Custom user avatar!</b></div>
        <div class="plan-item">Priority support</div>
        <div class="plan-item">Ad-free experience</div>
        <div class="plan-item">-</div>
        <div class="plan-item">-</div>
      </div>
      <div class="plan-footer">
        <button
          class="button is-fullwidth is-warning"
          @click="checkout('supporter')"
        >
          Support us!
        </button>
      </div>
    </div>

    <div class="pricing-plan is-active">
      <div class="plan-header">Champion</div>
      <div class="plan-price">
        <span class="plan-price-amount"
          ><span class="plan-price-currency">$</span
          >{{ planValues['champion'] }}</span
        >/month
      </div>
      <div class="plan-items">
        <div class="plan-item"><b>Themed word lists!</b></div>
        <div class="plan-item"><b>Mark guesses as correct!</b></div>
        <div class="plan-item">Private rooms!</div>
        <div class="plan-item">Priority support</div>
        <div class="plan-item">Ad-free experience</div>
        <div class="plan-item">-</div>
      </div>
      <div class="plan-footer">
        <button class="button is-fullwidth" @click="checkout('champion')">
          Champion One Word!
        </button>
      </div>
    </div>

    <div class="pricing-plan is-danger">
      <div class="plan-header">Sponsor</div>
      <div class="plan-price">
        <span class="plan-price-amount"
          ><span class="plan-price-currency">$</span
          >{{ planValues['sponsor'] }}</span
        >/month
      </div>
      <div class="plan-items">
        <div class="plan-item"><b>Frontpage Sponsor credit!</b></div>
        <div class="plan-item"><b>Custom cosmetics!</b></div>
        <div class="plan-item">Themed word lists</div>
        <div class="plan-item">Private rooms</div>
        <div class="plan-item">Priority support</div>
        <div class="plan-item">Ad-free experience</div>
      </div>
      <div class="plan-footer">
        <button class="button is-fullwidth" @click="checkout('sponsor')">
          Sponsor us!
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import 'bulma-pricingtable/dist/css/bulma-pricingtable.min.css'
import { loadStripe } from '@stripe/stripe-js'
import { firebaseLogEvent } from '../firebase/network'

export default {
  data() {
    return {
      planValues: { supporter: 3, champion: 6, sponsor: 10 },
    }
  },
  methods: {
    async checkout(planName) {
      firebaseLogEvent('purchase', {
        value: this.planValues[planName],
        currency: 'USD',
      })

      // Test APIs
      // const stripe = await loadStripe(
      //   'pk_test_TBbJ3UlK3uxu5fIiaFa1fEgq00F66fSFTg'
      // )
      // const plans = {
      //   supporter: 'plan_H44e4fQHCaUePD',
      //   sponsor: 'plan_H44fh9HqtqTb9B',
      // }

      // Prod APIs
      const stripe = await loadStripe(
        'pk_live_V662ekSpUVB7NK0YRz6mZRrg00VtBZqQ6k'
      )
      const plans = {
        supporter: 'plan_H3ICnHNAVRYziM',
        champion: 'price_1I9JRXCGj90UZkiJNKLtWiVe',
        sponsor: 'plan_H3IEHNqkNsWgXz',
      }

      // When the customer clicks on the button, redirect them to Checkout.
      stripe
        .redirectToCheckout({
          items: [{ plan: plans[planName], quantity: 1 }],

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
  font-family: 'Merienda One', cursive;
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
