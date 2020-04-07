const firebaseConfig = {
  apiKey: "AIzaSyBMQKaakJbv0H1D-vNj1aA8ebS0IcsQemA",
  authDomain: "runetiera.firebaseapp.com",
  databaseURL: "https://runetiera.firebaseio.com",
  projectId: "runetiera",
  storageBucket: "runetiera.appspot.com",
  messagingSenderId: "533615885683",
  appId: "1:533615885683:web:a39e1fe7c2a5754827d906",
  measurementId: "G-28YZE23KHB"
};
// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
  firebase.analytics();
}
const db = firebase.firestore();

// User structure: {id: xxx, runs: [{expedition}... ]}
// May return null.
async function getUser(userId) {
  const doc = await db.collection("users").doc(userId).get();
  return doc.data();
}

export async function updateUsername(userId, username) {
  return await db.collection("users").doc(userId).update({ username });
}

export async function getAllUsers() {
  const usersQuery = await db.collection("users").get();
  const users = [];
  usersQuery.forEach(user => users.push(user.data()));
  return users;
}

// Returns whether the run was successfully saved.
export async function saveRun(expedition, user) {
  if (expedition.userId && expedition.userId != user.id) {
    swal('Huh.', 'That expedition already belongs to someone else!', 'error');
    return false;
  }

  const runIndex = user.runs.findIndex(e => e.id == expedition.id);
  if (runIndex >= 0) {
    const oldExpedition = user.runs[runIndex];
    // Copy over old metadata, if found.
    expedition.time = oldExpedition.time ? oldExpedition.time : Date.now();
    expedition.userId = oldExpedition.userId ? oldExpedition.userId : user.id;
    // Reactive equivalent of: user.runs[runIndex] = expedition;
    Vue.set(user.runs, runIndex, expedition);
  } else {
    // New run for this user; save run metadata.
    expedition.time = Date.now();
    expedition.userId = user.id;
    user.runs.push(expedition);
  }

  // Denormalize project id & name to Users table
  // TODO: If there are too many runs for a user, migrate to subcollections.
  user.lastUpdateTime = Date.now();
  await db.collection("users").doc(user.id).set(user);

  // Save the run itself
  await db.collection("runs").doc(expedition.id).set(expedition);

  return true;
}

export async function loadRun(id) {
  const doc = await db.collection("runs").doc(id).get();
  return doc.data();
}

export async function getCollection(userId) {
  const doc = await db.collection("collections").doc(userId).get();
  return doc.data();
}

// A collection is a map of {cardId: cardCount, ...}
export async function saveCollection(userId, collection) {
  await db.collection("users").doc(userId).update({ lastUpdateTime: Date.now() });
  collection.lastUpdateTime = Date.now();
  return await db.collection("collections").doc(userId).set(collection);
}

export async function getAllCollections() {
  const usersQuery = await db.collection("collections").get();
  const collections = {};
  usersQuery.forEach(doc => collections[doc.id] = doc.data());
  return collections;
}

export function listenForLogin(vueApp) {
  firebase.auth().onAuthStateChanged(async function (user) {
    if (user) {
      let fetchedUser = await getUser(user.uid);
      if (!fetchedUser) {
        // User just created an account; save them to our database.
        fetchedUser = {
          id: user.uid,
          runs: [],
          name: user.displayName,
          email: user.email,
          createTime: Date.now(),
          lastUpdateTime: Date.now(),
        };
        await db.collection("users").doc(fetchedUser.id).set(fetchedUser);
      } else {
        // Just update the email and name provided by Firebase Auth.
        fetchedUser.name = user.displayName;
        fetchedUser.email = user.email;
      }
      vueApp.user = fetchedUser;
    }
  });
}

export function runUrl(runId) {
  const parsedUrl = new URL(window.location.href);
  return `${parsedUrl.origin}/draft-viewer?run=${runId}`
}

export function sendMail(to, subject, text, html, live=false) {
  const email = {
    to,
    message: {
      subject,
      text,
      html,
    }
  }
  if (live) {

    db.collection('mail').add(email);  
  }
  return email;
}