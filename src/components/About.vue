<template>
  <BigColumn>
    <h1 class="title">About Us</h1>
    <article class="message container">
      <div class="message-body" style="border: none">
        <div class="field">
          <Nametag
            name="Austin Chen"
            :user="{ email: 'akrolsmir@gmail.com', supporter: 'ADMIN' }"
          />
        </div>
        <p>
          I'm Austin, and I made One Word. I created this in March of 2020 as my
          COVID side project just so I could play it with my friends; to my
          surprise and delight, it's grown to what you see today! By day, I'm a
          tech lead at
          <a href="https://www.streamlit.io/">Streamlit</a>. In my free time I
          like to host board game nights and hackathons with my friends.
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
          July. For some reason, right after I started and added a ton of site
          improvements, many more people started playing 🤔. Now, I continue to
          work on this site full time as well as run our official discord,
          though I am currently looking for a job as a software engineer.
        </p>
        <br />
        <p>
          Email:
          <a href="mailto:sinclair@oneword.games">sinclair@oneword.games</a
          ><br />
          Or contact me via my site:
          <a href="https://sipec.github.io">sipec.github.io</a>.
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
        <br /><br /><br />

        <div class="content">
          With additional thanks to:
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
      Want to contribute? Contact us at
      <a href="mailto:hello@oneword.games">hello@oneword.games</a>.<br />
      As always, feel free to contact us if you have any questions or need
      support.
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
