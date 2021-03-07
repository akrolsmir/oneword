import { db } from './network'

// Free public STUN servers provided by Google.
// ICE = Interactive Connectivity Establishment, a way to coordinate between two devices
// https://en.wikipedia.org/wiki/Interactive_Connectivity_Establishment
export const RTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
  ],
}

// An offer is... info about what kind of video streaming options are supported?
// Like, "hey, I'm gonna use the mp4 codec!". The caller is making a proposal.
export async function offerCall(callId, peerConnection) {
  registerPeerConnectionListeners(peerConnection)
  const offer = await peerConnection.createOffer()

  await peerConnection.setLocalDescription(offer)

  const callWithOffer = {
    offer: {
      type: offer.type,
      // SDP = Session Description Protocol, with codec, source, and timing
      // https://developer.mozilla.org/en-US/docs/Glossary/SDP
      sdp: offer.sdp,
    },
  }

  // This autogenerates a new call id
  const callRef = db.collection('calls').doc(callId)
  await callRef.set(callWithOffer)

  // Now, wait for when a response gets put up
  callRef.onSnapshot(async (snapshot) => {
    const data = snapshot.data()
    if (!peerConnection.currentRemoteDescription && data.answer) {
      // if no remote connection has been set yet, but we just got an answer, then connect!
      const answer = new RTCSessionDescription(data.answer)
      await peerConnection.setRemoteDescription(answer)
    }
  })
}

// Responds with which media codecs we're going to use to connect
export async function answerCall(callId) {
  const peerConnection = new RTCPeerConnection(rtcConfig)

  const callDoc = await db.collection('calls').doc(callId).get()
  const offer = callDoc.data().offer
  await peerConnection.setRemoteDescription(offer)
  const answer = await peerConnection.createAnswer()
  await peerConnection.setLocalDescription(answer)

  const callRef = db.collection('calls').doc(callId)
  await callRef.update({
    answer: {
      type: answer.type,
      sdp: answer.sdp,
    },
  })
}

// Just used for debugging, for now
function registerPeerConnectionListeners(peerConnection) {
  peerConnection.addEventListener('icegatheringstatechange', () => {
    console.log(
      `ICE gathering state changed: ${peerConnection.iceGatheringState}`
    )
  })

  peerConnection.addEventListener('connectionstatechange', () => {
    console.log(`Connection state change: ${peerConnection.connectionState}`)
  })

  peerConnection.addEventListener('signalingstatechange', () => {
    console.log(`Signaling state change: ${peerConnection.signalingState}`)
  })

  peerConnection.addEventListener('iceconnectionstatechange ', () => {
    console.log(
      `ICE connection state change: ${peerConnection.iceConnectionState}`
    )
  })
}

// Now, figure out which network connections (ports, etc) we can use
// These are called ICE candidates. The STUN (Session Traversal Utilities for NAT)
// server helps us match up on a good connection (?)
// We use Google's free STUN servers
async function addIceCandidates(
  callId,
  peerConnection,
  localName,
  remoteName
) {}

// Also: more boilerplate around every connecting
