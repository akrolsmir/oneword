<template>
  <AnimatedModal :visible="visible">
    <div
      class="modal-card box"
      style="max-width: 400px"
      :class="
        guestMode
          ? 'animate__animated animate__flipInY animate__faster'
          : 'animate__animated animate__flipInX animate__faster'
      "
    >
      <div class="has-text-centered" v-show="!guestMode">
        <h2 class="fancy title mb-1">Sign in to get started!</h2>
        <div id="firebaseui-auth-container"></div>
        <a class="is-size-7" @click="guestMode = true"
          >Or play without an account</a
        >
      </div>
      <div v-show="guestMode">
        <h2 class="fancy title has-text-centered">Play without an account</h2>
        <h3 class="subtitle has-text-centered">
          (Your game history will be lost!)
        </h3>
        <div class="px-6">
          <input class="input" placeholder="Name" v-model="user.name" />
          <div class="buttons my-3">
            <button class="button is-info is-light" @click="backToFirebase">
              Back
            </button>
            <button
              class="button"
              :disabled="!user.name"
              @click="continueAsGuest"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  </AnimatedModal>
</template>

<script>
import { inject } from 'vue'

import firebase from 'firebase/app'
import * as firebaseui from 'firebaseui'
import 'firebaseui/dist/firebaseui.css'

import AnimatedModal from './AnimatedModal.vue'
import 'animate.css'

function injectFirebaseUi() {
  // FirebaseUI config.
  const uiConfig = {
    // Url to redirect to after a successful sign-in.
    signInSuccessUrl: '/',
    callbacks: {
      signInSuccess: function (user, credential, redirectUrl) {
        if (window.opener) {
          // The widget has been opened in a popup, so close the window
          // and return false to not redirect the opener.
          // TODO: close window
          return false
        } else {
          // The widget has been used in redirect mode, so we redirect to the signInSuccessUrl.
          return true
        }
      },
    },
    signInOptions: [
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      firebase.auth.EmailAuthProvider.PROVIDER_ID,
    ],
  }
  // Initialize the FirebaseUI Widget using Firebase.
  const ui =
    firebaseui.auth.AuthUI.getInstance() ||
    new firebaseui.auth.AuthUI(firebase.auth())
  // The start method will wait until the DOM is loaded to include the FirebaseUI sign-in widget
  // within the element corresponding to the selector specified.
  ui.start('#firebaseui-auth-container', uiConfig)
}

export default {
  components: { AnimatedModal },
  emits: ['hide'],
  props: {
    visible: false,
  },
  data() {
    return {
      guestMode: false,
    }
  },
  setup() {
    return {
      user: inject('currentUser'),
    }
  },
  mounted() {
    injectFirebaseUi()
  },
  methods: {
    injectFirebaseUi,
    backToFirebase() {
      injectFirebaseUi()
      this.guestMode = false
    },
    continueAsGuest() {
      this.user.guest = true
      this.$emit('hide')
    },
  },
}
</script>
