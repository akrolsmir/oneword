import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import fetch from 'node-fetch'
import Stripe from 'stripe'
import { listUsersNewest, usersToContacts } from './users'

admin.initializeApp()
const db = admin.firestore()

const STRIPE_SECRET = functions.config().stripe.prod_secret
const stripe = new Stripe(STRIPE_SECRET, { apiVersion: '2020-08-27' })

// onCall = callable from JS directly. See https://firebase.google.com/docs/functions/callable
export const helloWorld = functions.https.onCall(async (data, context) => {
  functions.logger.info(`Hello World ${data}, ${context.auth?.uid}`)
  return context.auth?.uid
})

// onRequest = callable from HTTP. See https://firebase.google.com/docs/functions/http-events
export const helloMars = functions.https.onRequest(async (req, res) => {
  const text = req.query.text
  // Set CORS so other URLs can read the result
  res.set('Access-Control-Allow-Origin', '*')
  // Send back a message that we've successfully written the message
  res.json({ result: `Hello Mars text ${text}` })
})

// Adapted from Set With Friends's Stripe integration:
// https://github.com/ekzhang/setwithfriends/blob/af5d2c12b98446be8b97a3c33e82f960ead2edec/functions/src/index.ts#L186
export const customerPortal = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'This function must be called while authenticated.'
    )
  }

  const user = await admin.auth().getUser(context.auth.uid)
  if (!user.email) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'This function must be called by an authenticated user with email.'
    )
  }

  const customerResponse = await stripe.customers.list({ email: user.email })
  if (!customerResponse.data.length) {
    throw new functions.https.HttpsError(
      'not-found',
      `A subscription with email ${user.email} was not found.`
    )
  }

  // QOL: Could throw HttpsError when data or returnUrl is missing
  const portalResponse = await stripe.billingPortal.sessions.create({
    customer: customerResponse.data[0].id,
    return_url: data.returnUrl,
  })
  return portalResponse.url
})

const LIST_ID = '2484740' // TODO: Change
const MAILJET_PUBLIC = functions.config().mailjet.public_key
const MAILJET_PRIVATE = functions.config().mailjet.private_key

export const addContactsToMailjet = functions.https.onCall(
  async (data, context) => {
    return await uploadContacts()
  }
)

async function uploadContacts() {
  const users = await listUsersNewest(db)
  const contacts = usersToContacts(users)
  console.log(`Got ${contacts.length} contacts, here's the first:`, contacts[0])

  const url = `https://api.mailjet.com/v3/REST/contactslist/${LIST_ID}/managemanycontacts`
  const MAILJET_KEY = `${MAILJET_PUBLIC}:${MAILJET_PRIVATE}`

  const body = {
    Action: 'addnoforce',
    Contacts: contacts,
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${bufferToA(MAILJET_KEY)}`,
    },
    body: JSON.stringify(body),
  })

  return await response.json()
}

// Nodejs polyfill for btoa()
function bufferToA(input: string) {
  return Buffer.from(input, 'utf-8').toString('base64')
}

// TODO unimplemented
export const syncUsersToMailjet = functions.pubsub
  .schedule('every 5 minutes')
  .onRun(async (context) => {
    console.log('Running syncUsersToMailjet')
    const resp = await uploadContacts()
    console.log('Done syncing, Mailjet response:', resp)
    return resp
  })

// Watches for room.people changes; logs to serverlogs if anomalies are detected
// Helps pinpoint whether room.people gets wiped from client-side calls, or from a potential cloud firestore bug
export const watchRoomUpdateForPeopleChange = functions.firestore
  .document('rooms/{roomId}')
  // onUpdate triggers when a document already exists and has any value changed.
  .onUpdate(async (change, context) => {
    const roomId = context.params.roomId

    const previousRoomState = change.before.data()
    const newRoomState = change.after.data()

    let loggableActionName = ''
    const loggableRoomStatePair = {
      previousRoomState,
      newRoomState,
    }

    // People should always exist since the function calls onUpdate (room already exists)
    if (typeof newRoomState.people === 'undefined') {
      functions.logger.info(`Room ${roomId}, people field is undefined`)
      loggableActionName = 'cloud_updateRoom_peopleIsUndefined'
    }
    // People should always be an object, not an array, string etc.
    else if (
      typeof newRoomState.people !== 'object' ||
      newRoomState.people.constructor !== Object
    ) {
      functions.logger.info(`Room ${roomId}, people field is not an object`)
      loggableActionName = 'cloud_updateRoom_peopleIsNotObject'
    }
    // People object should never be erased unless it's a call from admin resetRoom
    else if (Object.keys(newRoomState.people).length === 0) {
      const logString = `Room ${roomId}, people object was completely wiped`
      functions.logger.info(logString)
      loggableActionName = 'cloud_updateRoom_peopleObjectCompletelyWiped'
    }
    // People object should never see items removed unless it's a call from admin resetRoom
    else if (
      Object.keys(newRoomState.people).length <
      Object.keys(previousRoomState.people).length
    ) {
      const logstring = `Room ${roomId}, people object was not empty but had entries removed`
      functions.logger.info(logstring)
      loggableActionName = 'cloud_updateRoom_peopleObjectHasEntriesRemoved'
    }

    // Only log if one of the above conditions were met
    if (loggableActionName !== '') {
      await serverLogFromCloud(
        context.params.roomId /* roomName */,
        loggableActionName /* action */,
        loggableRoomStatePair
      )
    }
  })

// Need a new serverlog function (diff from network.js/serverLog) since this log is emitted from "server-side"
async function serverLogFromCloud(
  roomName = 'undef_room_name',
  action = 'cloud_undef_action_name',
  extraFields = {}
) {
  try {
    await db
      .collection('serverlogs')
      .doc()
      .set({
        timestamp: admin.database.ServerValue.TIMESTAMP,
        roomName,
        action,
        ...extraFields,
      })
  } catch (error) {
    // standard Cloud Function logger https://firebase.google.com/docs/functions/writing-and-viewing-logs
    functions.logger.error('serverLog error:', error)
  }
}

// NEXT TODO:
// Test out pubsub locally => annoying, apparently
