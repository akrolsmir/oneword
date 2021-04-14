<template>
  <BigColumn>
    <div class="content">
      <h2 class="fancy mb-2">Storytime</h2>
      <div class="subtitle">Choose Your Friends' Adventure</div>
      You and your friends find yourself in a text adventure! Each turn is as
      follows:
      <ol>
        <li>
          One of you decides what the character does (like "run towards the
          dragon")
        </li>
        <li>
          You each write what happens next, with nothing but your own bonus
          words and your imagination to guide you.
        </li>
        <li>Vote for who wrote it the best!</li>
      </ol>
      You get a certain number of points per vote, depending on how many bonus
      words you used, such that getting lots of votes is rewarded more than
      using lots of words is.
      <br />
      <br />
      <div class="is-italic">
        Developer's note: This game is still in beta. It's rough visually, not
        fully game-designed, and bug infested. But my friends like it, so try it
        out anyways! Report any issues on discord or
        <a href="mailto:sinclair@oneword.games?Subject=Storytime">email me</a>
        directly. -Sinclair
      </div>
    </div>
    <GamesList roomDirectory="/storytime/" />
    <Sponsors />
    <br /><br />
  </BigColumn>
</template>

<script>
import BigColumn from '../../components/BigColumn.vue'
import GamesList from '../../components/GamesList.vue'
import Sponsors from '../../components/Sponsors.vue'

export default {
  components: {
    BigColumn,
    GamesList,
    Sponsors,
  },
}
</script>
<style scoped>
.background {
  background-color: #d6c6a2;
  background-image: linear-gradient(
    to right,
    rgb(245, 216, 178),
    rgb(181, 181, 255)
  );
}
</style>
