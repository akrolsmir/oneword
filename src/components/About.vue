<template>
  <BigColumn>
    <h1 class="title">{{ $t('aboutUs.title') }}</h1>
    <article class="message container">
      <div class="message-body" style="border: none">
        <div class="field">
          <Nametag
            name="Austin Chen"
            :user="{ email: 'akrolsmir@gmail.com', supporter: 'ADMIN' }"
          />
        </div>
        <p>
          I'm Austin, and I made One Word. It started in March of 2020 as my
          COVID side project, just for my friends and I; to my surprise, it's
          grown to what you see today! I work at
          <a href="https://www.streamlit.io/">Streamlit</a> by day, and host
          board game nights and hackathons in my free time.
        </p>
        <br />
        <p>
          Email: <a href="mailto:austin@oneword.games">austin@oneword.games</a>
        </p>
        <br /><br />

        <div class="field">
          <Nametag
            name="Sinclair Chen"
            :user="{ email: 'sinclair@oneword.games', supporter: 'ADMIN' }"
          />
        </div>
        <p>
          I'm Sinclair, Austin's sister, and I started working on One Word in
          July of 2020. Around that time, a lot of people started playing. I
          claim 120% credit for this.<br />
          I also built <router-link to="/storytime">Storytime</router-link>!
        </p>
        <br />
        <p>
          Email:
          <a href="mailto:sinclair@oneword.games">sinclair@oneword.games</a
          ><br />
          Website: <a href="https://sipec.github.io">sipec.github.io</a>
        </p>
        <br /><br />

        <div class="field">
          <Nametag
            name="Michael Liu"
            :user="{ email: 'liu.titin@gmail.com', supporter: 'ADMIN' }"
          />
        </div>
        <p>
          I'm Michael, Austin's longtime MtG buddy. I build the analytics
          pipeline for One Word, and program new features as well.
        </p>
        <br />
        <p>
          Email:
          <a href="mailto:michael@oneword.games">michael@oneword.games</a>
        </p>
        <br /><br />

        <div class="field">
          <Nametag
            name="Alice Pang"
            :user="{ email: 'pang.alice@gmail.com', supporter: 'ADMIN' }"
          />
        </div>
        <p>
          I'm Alice, Austin's high school friend. I design the pretty parts of
          One Word &mdash; the ugly parts were designed by the engineers.
        </p>
        <br />
        <p>
          Email: <a href="mailto:alice@oneword.games">alice@oneword.games</a>
        </p>
        <br /><br />

        <div class="field">
          <Nametag
            name="Shawn Xie"
            :user="{ email: 'shawn.y.xie@gmail.com', supporter: 'ADMIN' }"
          />
        </div>
        <p>
          I'm Shawn. I turned Austin into a morning person with our 8am jogs
          through Golden Gate Park; meanwhile, he roped me into building
          <router-link to="/pairwise">Pairwise</router-link>.
        </p>
        <br />
        <p>
          Email: <a href="mailto:shawn@oneword.games">shawn@oneword.games</a>
        </p>
        <br /><br />

        <div class="field">
          <Nametag
            name="Adrian Marple"
            :user="{ email: 'adrian@marplebot.com', supporter: 'ADMIN' }"
          />
        </div>
        <p>
          I'm Adrian, an indie game dev and thus One Word's resident expert. I
          built <router-link to="/listorama">Listorama</router-link> at a
          hackathon; my own games include
          <a href="https://store.steampowered.com/app/1102040/Obversion/">
            Obversion</a
          >
          and <a href="https://www.marplebot.com/blog/">Metasweeper</a> (work in
          progress!)
        </p>
        <br />
        <p>
          Email:
          <a href="mailto:adrian@marplebot.com">adrian@marplebot.com</a><br />
          Website:
          <a href="https://www.marplebot.com">https://www.marplebot.com</a>
        </p>

        <br /><br /><br />

        <div class="content">
          {{ $t('aboutUs.thank') }}
          <ul>
            <li>
              Alex Lien, Bryant Chang, and the rest of our Sat 5pm playtest
              group~
            </li>
            <li>Harrison Tu for accessibility playtesting and feedback</li>
            <li>
              Eric and Cynthia of
              <a href="https://setwithfriends.com/">Set with Friends</a>
            </li>
            <li>
              Raina and Phil of
              <a href="https://www.1minuteboardgames.com/"
                >1 Minute Board Games</a
              >
            </li>
          </ul>
        </div>
      </div>
    </article>
    <div style="height: 4em" class="has-text-centered">
      {{ $t('aboutUs.contribute') }}
      <a href="mailto:hello@oneword.games">hello@oneword.games</a><br />
      <router-link to="/privacy">{{ $t('aboutUs.privacy') }}</router-link>
    </div>
  </BigColumn>
</template>

<script>
import BigColumn from '../components/BigColumn.vue'
import Nametag from '../components/Nametag.vue'

export default {
  components: {
    BigColumn,
    Nametag,
  },
}
</script>
