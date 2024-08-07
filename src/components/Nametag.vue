<template>
  <div class="control">
    <div class="tags has-addons">
      <div
        class="tag is-white"
        :class="{
          'is-primary is-light': submitted && !guessing,
          'is-info': guessing,
          'has-text-weight-semibold': submitted,
        }"
        v-bind="attr"
        v-tippy="{ content: attr.title }"
        style="z-index: 1"
      >
        <img
          v-if="avatarUrl"
          style="
            border-top-left-radius: 4px;
            border-bottom-left-radius: 4px;
            margin-left: -10.5px;
          "
          class="mr-1"
          :src="avatarUrl"
          loading="lazy"
          alt=""
          height="28"
          width="28"
        />
        <span v-if="modtag" class="mr-1">👑</span>
        {{ name }}
        <button
          v-if="mod || self"
          class="delete is-small"
          :title="'Kick ' + name"
          @click="kick"
        ></button>
      </div>
      <div v-if="score !== undefined" class="tag is-link is-light">
        {{ score }}
      </div>
    </div>
  </div>
</template>

<script>
import { md5 } from '../vendor/md5.js'

export default {
  emits: ['kick'],
  props: {
    name: String,
    user: Object, // email and sponsor status
    submitted: Boolean,
    guessing: Boolean,
    self: Boolean, // Whether the tag is for the current player
    mod: Boolean, // Whether the logged-in user is a mod
    modtag: Boolean, // Whether to append a mod tag to this tag
    score: Number,
  },
  methods: {
    kick() {
      this.$emit('kick')
    },
  },
  computed: {
    avatarUrl() {
      return (
        this.user.avatarUrl ||
        // Fallback for hardcoded emails (eg on the About page, or Sponsors)
        (this.user.email &&
          `https://www.gravatar.com/avatar/${md5(this.user.email)}?size=48`)
      )
    },
    attr() {
      if (!this.user || this.user.guest) {
        return { title: 'Guest' }
      }
      if (this.user.supporter == 'BASE') {
        return {
          title: 'Supporter',
          style: 'box-shadow: 0 0 0 2px gold',
        }
      }
      if (this.user.supporter == 'SPONSOR') {
        return {
          title: 'Sponsor',
          style: 'box-shadow: 0 0 0 2px #b181e4',
        }
      }
      if (this.user.supporter == 'ADMIN') {
        if (this.user.email === 'pang.alice@gmail.com') {
          return {
            title: 'Designer',
            style: {
              boxShadow:
                '-1px 1px 3px #5ec8e5, 1px 1px 3px #5ec8e5, -1px -1px 3px #ff48b0, 1px -1px 3px #ff48b0',
            },
          }
        }
        return {
          title: 'Developer',
          style: {
            outline: '1px dashed #33ff00',
            boxShadow: '0 0 0 2px #0a0a0a',
          },
        }
      }
      return { title: 'Member' }
    },
  },
}
</script>

<style scoped>
.tag {
  font-size: 0.875rem !important; /* Bulma's normal tag (0.75 rem) is too small and medium tag (1 rem) is too big */
}
</style>
