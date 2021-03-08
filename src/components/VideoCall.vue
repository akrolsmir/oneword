<template>
  <BigColumn>
    <div class="buttons">
      <button class="button" @click="openUserMedia">Open camera and mic</button>
      <button class="button" @click="startCall">Start call</button>
      <button class="button" @click="joinCall">Join call</button>
      <button class="button" @click="hangUp">Hang up</button>
    </div>

    <div id="videos">
      <video ref="localVideo" muted autoplay playsinline></video>
      <video ref="remoteVideo" autoplay playsinline></video>
    </div>
  </BigColumn>
</template>

<script>
import BigColumn from './BigColumn.vue'
import { offerCall, RTC_CONFIG, collectIceCandidates } from '../firebase/webrtc'

// Used for the actual networking
let peerConnection
// Sources for the videos
let localStream
let remoteStream

export default {
  components: {
    BigColumn,
  },
  methods: {
    // Gets permission from the user, then hooks up to local camera & mic feed
    async openUserMedia() {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })
      localStream = stream
      remoteStream = new MediaStream()

      this.$refs.localVideo.srcObject = localStream
      this.$refs.remoteVideo.srcObject = remoteStream
    },
    async startCall() {
      const peerConnection = new RTCPeerConnection(RTC_CONFIG)

      // Attach user's webcam and audio to the webRTC connection, I think?
      localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream)
      })

      const callId = this.$route.params.id

      collectIceCandidates(
        callId,
        peerConnection,
        'callerCandidates',
        'calleeCandidates'
      )

      await offerCall(callId, peerConnection)

      // TODO: not sure what this does...
      peerConnection.addEventListener('track', (event) => {
        console.log('Got remote track:', event.streams[0])
        event.streams[0].getTracks().forEach((track) => {
          console.log('Add a track to the remoteStream:', track)
          remoteStream.addTrack(track)
        })
      })
    },
  },
}
</script>

<style scoped>
div#videos {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}

div#videos > video {
  background: black;
  width: 640px;
  height: 100%;
  display: block;
  margin: 1em;
}
</style>
