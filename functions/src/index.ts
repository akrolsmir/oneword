import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
admin.initializeApp()

import Stripe from 'stripe'
// Configured with https://firebase.google.com/docs/functions/config-env
// eg `$ firebase functions:config:set stripe.test_secret="THE-API-KEY"
// Preview with `$ firebase functions:config:get`
const stripe = new Stripe(functions.config().stripe.prod_secret, {
  apiVersion: '2020-08-27',
})

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
