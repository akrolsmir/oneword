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

const functions = firebase.functions();
export const helloWorld = functions.httpsCallable('helloWorld');
export const customerPortal = functions.httpsCallable('customerPortal');

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

export async function listRooms(limit = 20, publicRoom = true) {
  const db = firebase.firestore();
  const docs = await db
    .collection(COLLECTION)
    .where('public', '==', publicRoom)
    .orderBy('lastUpdateTime', 'desc')
    // TODO: limit to last 7 days instead.
    .limit(limit)
    .get();

  const rooms = [];
  docs.forEach((doc) => rooms.push(doc.data()));
  return rooms;
}

let unsubscribe;
export function listenRoom(vueApp) {
  // Detach listener before listening to a new room.
  unlistenRoom();
  unsubscribe = db
    .collection(COLLECTION)
    .doc(vueApp.room.name)
    .onSnapshot(function (doc) {
      // console.log('Current data: ', doc.data());
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

export async function updateUser(userId, user) {
  const db = firebase.firestore();
  await db.collection('users').doc(userId).update(user);
}

export async function updateUserGame(userId, roomId) {
  if (!userId) {
    // Do nothing for anonymous users
    return;
  }
  const timestamp = Date.now();
  const gameId = `${COLLECTION}:${roomId}`;
  await db
    .collection('users')
    .doc(userId)
    .update({
      lastUpdateTime: timestamp,
      [`games.${gameId}`]: {
        roomDb: COLLECTION,
        roomId,
        lastUpdateTime: timestamp,
      },
    });
}

const CACHED_USER_KEY = 'CACHED_USER_KEY';

/**
 * Example user:
 * user: {
 *   id: asjke63rlaj2
 *   name: Austin Chen
 *   email: akrolsmir@gmail.com
 *   createTime: 12321478197
 *   lastUpdateTime: 12321478197
 *   games: {
 *     'rooms:soggy-lunch': {
 *       roomDb: 'rooms', // or 'incrypt', 'rapid-silver' etc
 *       roomId: 'soggy-lunch',
 *       // Remember when the user last interacted
 *       lastInteraction: 1479159175,
 *     }
 *     ...
 *   }
 * }
 */
export function listenForLogin(vueApp) {
  // Immediately load any persisted user object from browser cache.
  const cachedUser = localStorage.getItem(CACHED_USER_KEY);
  if (cachedUser) {
    vueApp.user = JSON.parse(cachedUser);
  }

  // Then listen for any login changes (includes )
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
      if (!vueApp.player.name) {
        // Only overwrite player name if none previously provided.
        // This allows devs to use "?player=Zed" for multi-account testing.
        vueApp.player.name = fetchedUser.name.split(' ')[0];
      }

      // Persist to local storage, to reduce login blink next time.
      // Note: Cap on localStorage size is ~5mb
      localStorage.setItem(CACHED_USER_KEY, JSON.stringify(fetchedUser));
    }
  });
}

export async function firebaseLogout() {
  firebase.analytics().logEvent('logout');
  await firebase.auth().signOut();
  localStorage.removeItem(CACHED_USER_KEY);
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
  const firstName = user.name.split(' ')[0];
  await sendMail({
    from: 'Austin Chen <austin@oneword.games>',
    replyTo: 'Austin Chen <austin@oneword.games>',
    to: user.email,
    message: {
      subject: 'Welcome to One Word!',
      text: `Heyo ${firstName},

Welcome to One Word! Have a great time cluing and colliding with your comrades~
I'm Austin, and https://oneword.games was my COVID side-project that suddenly got popular.

If you've got a minute, I'd love to hear from you!
Like, how did you find out about us? Any issues, or feedback? We read and respond to every email.
Or come chat with us on Discord (https://discord.gg/AP7ssVPPCr).

But most of all: thanks for playing!
Austin
`,
    },
  });
}

export async function sendSupporterEmail(user, type = 'supporter') {
  const firstName = user.name.split(' ')[0];
  await sendMail({
    from: 'Austin Chen <austin@oneword.games>',
    replyTo: 'Austin Chen <austin@oneword.games>',
    to: user.email,
    bcc: 'Austin Chen <austin@oneword.games>',
    message: {
      subject: 'Thanks for supporting One Word!',
      text: `Hi ${firstName},

Just wanted to thank you for becoming a ${type} ☺. We're so glad you love our game!
Your benefits are now active; let me know if you have any issues (or any time you'd like to cancel).

Also, just curious: what led you to support us in the first place?
Austin
`,
    },
  });
}
