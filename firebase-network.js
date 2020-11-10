const firebaseConfig = {
  apiKey: 'AIzaSyA2JfA8ZGxT6pKV87TwhGfUGR1kAdcPMyU',
  authDomain: 'oneword-cf74a.firebaseapp.com',
  databaseURL: 'https://oneword-cf74a.firebaseio.com',
  projectId: 'oneword-cf74a',
  storageBucket: 'oneword-cf74a.appspot.com',
  messagingSenderId: '340753176141',
  appId: '1:340753176141:web:d51695ab8606909dda2e04',
  measurementId: 'G-3EQ36WVM0W',
};
// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
  try {
    firebase.analytics();
  } catch (e) {
    console.warn('Firebase analytics not enabled (probably got blocked.)');
    // Shim for firebase.analytics().logEvent(...)
    firebase.analytics = () => ({
      logEvent() {
        // Do nothing
      },
    });
  }
}

const COLLECTION = window.COLLECTION || 'rooms';

const db = firebase.firestore();
export async function setRoom(room) {
  await db.collection(COLLECTION).doc(room.name).set(room);
}

export async function updateRoom(room, update) {
  await db.collection(COLLECTION).doc(room.name).update(update);
}

export async function getRoom(room) {
  const doc = await db.collection(COLLECTION).doc(room.name).get();
  return doc.data();
}

export async function listRooms() {
  const db = firebase.firestore();
  const docs = await db
    .collection(COLLECTION)
    .where('public', '==', true)
    .orderBy('lastUpdateTime', 'desc')
    // TODO: limit to last 7 days instead.
    .limit(20)
    .get();

  const rooms = [];
  docs.forEach((doc) => rooms.push(doc.data()));
  return rooms.filter((room) => room.players.length > 0);
}

let unsubscribe;
export function listenRoom(vueApp) {
  // Detach listener before listening to a new room.
  unlistenRoom();
  unsubscribe = db
    .collection(COLLECTION)
    .doc(vueApp.room.name)
    .onSnapshot(function (doc) {
      console.log('Current data: ', doc.data());
      vueApp.room = doc.data();
    });
}

export function unlistenRoom() {
  if (unsubscribe) {
    unsubscribe();
  }
}

// May return null.
export async function getUser(userId) {
  const doc = await db.collection('users').doc(userId).get();
  return doc.data();
}

export function listenForLogin(vueApp) {
  firebase.auth().onAuthStateChanged(async function (user) {
    if (user) {
      let fetchedUser = await getUser(user.uid);
      if (!fetchedUser) {
        // User just created an account; save them to our database.
        fetchedUser = {
          id: user.uid,
          name: user.displayName,
          email: user.email,
          createTime: Date.now(),
          lastUpdateTime: Date.now(),
        };
        await db.collection('users').doc(fetchedUser.id).set(fetchedUser);
        await sendWelcomeEmail(fetchedUser);
      } else {
        // Just update the email and name provided by Firebase Auth.
        fetchedUser.name = user.displayName;
        fetchedUser.email = user.email;
      }
      vueApp.user = fetchedUser;
      vueApp.player.name = fetchedUser.name.split(' ')[0];
    }
  });
}

export function runUrl(runId) {
  const parsedUrl = new URL(window.location.href);
  return `${parsedUrl.origin}/draft-viewer?run=${runId}`;
}

/**
 * `email` should be formatted like: {
    from: 'Austin - 20 Chars <akrolsmir@gmail.com>'
    to: 'someone@gmail.com',
    bcc: 'abc.sinclair@gmail.com'
    replyTo: 'another@gmail.com',
    message: {
      subject: ...,
      text: ...,
      html: ...,
    }
  }
*/
export async function sendMail(email) {
  // Send with https://firebase.google.com/products/extensions/firestore-send-email
  await db.collection('mail').add(email);
}

async function sendWelcomeEmail(user) {
  const firstName = user.name.split(' ')[0]
  await sendMail({
    from: 'Austin Chen <austin@oneword.games>',
    replyTo: 'Austin Chen <austin@oneword.games>',
    to: user.email,
    message: {
      subject: 'Welcome to One Word!',
      text: `Heyo ${firstName},

Welcome to One Word! Have a great time cluing and colliding with your comrades~

I'm Austin, and https://oneword.games was my COVID side-project that suddenly got popular. If you've got a minute, I'd love to hear from you.
Like, how did you find out about us? Any issues, or feedback? (I read and respond to every email.)

But most of all: thanks for playing!
Austin
`
    }
  })
}