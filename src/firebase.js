// firebase.js
import firebase from '@react-native-firebase/app';
// import '@react-native-firebase/crashlytics'
import '@react-native-firebase/firestore';
import '@react-native-firebase/auth';
import '@react-native-firebase/messaging';
import '@react-native-firebase/functions';
import '@react-native-firebase/storage';
import '@react-native-firebase/remote-config';

// --- Firestore ---
const dbTemp = firebase.firestore();
dbTemp.settings({
  cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED,
});
export const db = dbTemp;

// --- Authentification ---
export const auth = firebase.auth();

// --- Messaging (FCM) ---
export const messaging = firebase.messaging();

// --- Cloud Functions (instance par défaut, us-central1) ---
export const functions = firebase.functions();

// --- Remote Config ---
export const remoteConfig = firebase.remoteConfig();

// --- (Optionnel) export du core pour d’autres usages ---
export default firebase;

// En DEV, si besoin d’émulateur, décommentez et ajustez :
// if (__DEV__) {
//   functions.useFunctionsEmulator('http://localhost:5001');
//   db.settings({
//     host: 'localhost:8080',
//     ssl: false,
//     persistence: false,
//   });
// }
