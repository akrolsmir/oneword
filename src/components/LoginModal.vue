<template>
  <AnimatedModal :visible="visible" :width="400">
    <!-- Note: for some reason the card takes up 600px anyways,
    so there's a background click deadzone to the right/left -->
    <div class="box">
      <div class="has-text-centered" v-show="!guestMode">
        <h2 class="fancy title mb-1">Sign in to get started!</h2>
        <div
          id="android-google-signin"
          class="mt-4"
          v-if="['android', 'ios'].includes(capacitorPlatform)"
        >
          <!-- Copied the "Sign In with Google" button from FirebaseUI -->
          <button
            class="firebaseui-idp-button mdl-button mdl-js-button mdl-button--raised firebaseui-idp-google firebaseui-id-idp-button"
            data-provider-id="google.com"
            style="background-color: #ffffff"
            data-upgraded=",MaterialButton"
            @click="googleSignIn"
          >
            <span class="firebaseui-idp-icon-wrapper"
              ><img
                class="firebaseui-idp-icon"
                alt=""
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" /></span
            ><span class="firebaseui-idp-text firebaseui-idp-text-long"
              >Sign in with Google</span
            ><span class="firebaseui-idp-text firebaseui-idp-text-short"
              >Google</span
            >
          </button>
          <h3 class="m-2">OR</h3>
        </div>
        <!-- <button class="button">Sign in with Googlexyz</button> -->
        <div id="firebaseui-auth-container"></div>
        <button class="button is-ghost is-small" @click.prevent="toGuestMode">
          Or play without an account
        </button>
      </div>
      <div v-show="guestMode">
        <h2 class="fancy title has-text-centered">Play without an account</h2>
        <h3 class="subtitle has-text-centered">
          (Your game history will be lost!)
        </h3>
        <div class="px-6">
          <input
            ref="inputGuestName"
            class="input"
            placeholder="Name"
            v-model="user.name"
            @keyup.enter="continueAsGuest"
          />
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
import { cfaSignIn } from 'capacitor-firebase-auth'
import { Capacitor } from '@capacitor/core'

import firebase from 'firebase/app'
import 'firebaseui/dist/firebaseui.css'

import AnimatedModal from './AnimatedModal.vue'

async function injectFirebaseUi() {
  const firebaseui = await import('firebaseui')

  const successUrl = new URL(window.location.href)
  if (successUrl.pathname !== '/') {
    // Add `?authed=1` if signing in from any page but the homepage
    successUrl.searchParams.set('authed', '1')
  }

  const signInOptions = [firebase.auth.EmailAuthProvider.PROVIDER_ID]
  // On mobile, Google auth is handled by capacitor-firebase-auth
  if (!['android', 'ios'].includes(Capacitor.getPlatform())) {
    signInOptions.unshift(firebase.auth.GoogleAuthProvider.PROVIDER_ID)
  }

  // FirebaseUI config.
  const uiConfig = {
    // Redirect back to the same URL after a successful sign-in.
    signInSuccessUrl: successUrl.toString(),
    signInOptions,
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
    visible: Boolean,
    onGuestCallback: Function,
  },
  data() {
    return {
      guestMode: false,
      capacitorPlatform: Capacitor.getPlatform() /* "web", "ios", or "android" */,
    }
  },
  setup() {
    return {
      user: inject('currentUser'),
    }
  },
  mounted() {
    /* no await */ injectFirebaseUi()
  },
  methods: {
    toGuestMode() {
      this.guestMode = true
      // Wait for mount, then focus the input
      this.$nextTick(() => this.$refs.inputGuestName.focus())
    },
    backToFirebase() {
      injectFirebaseUi()
      this.guestMode = false
    },
    continueAsGuest() {
      this.user.guest = true
      this.guestMode = false
      // If onGuestCallback is not provided, it'll be sth like a MouseEvent
      this.onGuestCallback instanceof Function && this.onGuestCallback()
      this.$emit('hide')
    },
    googleSignIn() {
      cfaSignIn('google.com').subscribe((_user) => this.$emit('hide'))
    },
  },
}
</script>
