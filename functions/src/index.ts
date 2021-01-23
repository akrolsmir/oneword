// const functions = require("firebase-functions");
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
admin.initializeApp();

import Stripe from 'stripe';
// Configured with https://firebase.google.com/docs/functions/config-env
const stripe = new Stripe(functions.config().stripe.test_secret, {
  apiVersion: '2020-08-27',
});

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

export const helloWorld = functions.https.onCall(async (data, context) => {
  functions.logger.info(`Hello World ${data}, ${context.auth?.uid}`);
  return context.auth?.uid;
});

export const customerPortal = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'This function must be called while authenticated.');
  }

  const user = await admin.auth().getUser(context.auth.uid);
  if (!user.email) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'This function must be called by an authenticated user with email.'
    );
  }

  const customerResponse = await stripe.customers.list({ email: user.email });
  if (!customerResponse.data.length) {
    throw new functions.https.HttpsError('not-found', `A subscription with email ${user.email} was not found.`);
  }

  const portalResponse = await stripe.billingPortal.sessions.create({
    customer: customerResponse.data[0].id,
    return_url: data.returnUrl,
  });
  return portalResponse.url;
});
