import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
admin.initializeApp()

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
