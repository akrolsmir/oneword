import { updateRoom } from './network' // Imported to config Firestore
import firebase from 'firebase/app'
import 'firebase/firestore'

const db = firebase.firestore()

/** Grab all rulesets from Firestore, and return them as a list */
export async function listRulesets() {
  const rulesets = await db.collection('rulesets-v0').get()
  return rulesets.docs
    .map((doc) => doc.data())
    .slice()
    .reverse()
}
// TODO: Once rulesets get weighty, return only metadata?

/** List the last 20 updated games from the 'games-v0' table, with a matching rulesetId */
export async function listActiveGames(rulesetId) {
  const games = await db
    .collection('games-v0')
    .where('rulesetId', '==', rulesetId)
    .orderBy('lastUpdatedAt', 'desc')
    .limit(20)
    .get()
  return games.docs.map((doc) => doc.data())
}
