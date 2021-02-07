<template>
  <div class="modal" :class="{ 'is-active': visible }">
    <div class="modal-background"></div>
    <div class="modal-content">
      <div class="box">
        <h2 class="title">Sign up or log in</h2>
        <div id="firebaseui-auth-container"></div>
      </div>
    </div>
    <button
      class="modal-close is-large"
      aria-label="close"
      @click="toggleVisible"
    ></button>
  </div>
</template>

<script>
import firebase from 'firebase/app'
import * as firebaseui from 'firebaseui'
// Note: FirebaseUI CSS is messed up, probably because Bulma CSS is imported?
// Or it's not just getting imported. Could try:
// 1. iframing the modal
// 2. Implementing login as a real popup again
// 3. Styling the modal with Bulma?
// 4. Implementing our own login instead of firebaseUI??
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
          // TODO: close window, toggleVisible()
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
  data() {
    return {
      visible: false,
    }
  },
  mounted() {
    injectFirebaseUi()
  },
  methods: {
    toggleVisible() {
      this.visible = !this.visible
    },
  },
}
</script>
