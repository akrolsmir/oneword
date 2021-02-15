<template>
  <div>
    <section class="hero is-primary is-bold">
      <div class="hero-body">
        <div class="container">
          <h1 class="title">Thanks for your support!</h1>
          <div class="subtitle">Seriously, you're the literal best.</div>
        </div>
      </div>
    </section>
    <article class="message">
      <div class="message-body">
        <transition name="fade">
          <div v-cloak v-if="finished" key="1">
            Your supporter benefits have just been granted!<br />
            It means the world to us, that you enjoyed One Word this much.<br />
            Again, from the bottom of my heart:<br />
            <img src="/images/shen-gg.png" />
          </div>
          <div v-else key="2">
            Now granting your benefits...
            <div class="loaderz">
              <div class="left"></div>
              <div class="mid"></div>
              <div class="right"></div>
            </div>
            (If this takes more than a minute, something broke. Sadface.<br />
            Ping austin@oneword.games and I'll get you sorted out.)
          </div>
        </transition>
      </div>
    </article>
  </div>
</template>

<script>
import { inject } from 'vue'
import { sendSupporterEmail, updateUser } from '../firebase/network'
export default {
  setup() {
    return { user: inject('currentUser') }
  },
  data() {
    return {
      finished: false,
      type: 'supporter',
    }
  },
  async mounted() {
    // Supporter tier is passed through URL param
    const parsedUrl = new URL(window.location.href)
    const planName = parsedUrl.searchParams.get('type')
    if (planName) {
      this.type = planName
    }

    if (this.user.id) {
      await this.makeSupporter()
    }
  },
  watch: {
    async 'user.id'(newId) {
      // We just registered the firebase login.
      await this.makeSupporter()
    },
  },
  methods: {
    async makeSupporter() {
      if (!this.user.supporter) {
        const typeToConstant = {
          supporter: 'BASE',
          champion: 'CHAMPION',
          sponsor: 'SPONSOR',
        }
        await updateUser(this.user.id, { supporter: typeToConstant[this.type] })
        await sendSupporterEmail(this.user, this.type)

        // Load for 4 more seconds to provide illusion of work.
        setTimeout(() => (this.finished = true), 4000)
      }
    },
  },
}
</script>

<style scoped>
/* Pure CSS loader animation, inspired by https://loading.io/css/ */
.loaderz {
  /* display: inline-block; */
  position: relative;
  width: 120px;
  height: 120px;
  margin: 20px auto;
  background: linear-gradient(-60deg, #a1c3db, #2b90e5);
  border-radius: 50%;
}
div.left,
div.mid,
div.right {
  display: inline-block;
  position: absolute;
  width: 16px;
  background: #fff;
  animation: loaderz 1.2s cubic-bezier(0, 0.5, 0.5, 1) infinite;
}
div.mid {
  animation: mid 1.2s cubic-bezier(0, 0.5, 0.5, 1) infinite;
}
.loaderz div.left {
  left: 28px;
  animation-delay: -0.24s;
}
.loaderz div.mid {
  left: 52px;
  animation-delay: -0.12s;
}
.loaderz div.right {
  left: 76px;
  animation-delay: 0;
}
@keyframes loaderz {
  0% {
    top: 44px;
    height: 48px;
  }
  50%,
  100% {
    top: 56px;
    height: 24px;
  }
}

@keyframes mid {
  0% {
    top: 20px;
    height: 72px;
  }
  50%,
  100% {
    top: 32px;
    height: 48px;
  }
}

/* Fade in the final message */
.fade-enter-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
