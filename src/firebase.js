import firebase from '@react-native-firebase/app'
// import '@react-native-firebase/crashlytics'
import '@react-native-firebase/firestore'
import '@react-native-firebase/auth'
import '@react-native-firebase/messaging'
import '@react-native-firebase/functions'
import '@react-native-firebase/storage'
import '@react-native-firebase/remote-config'

// exports
const dbTemp = firebase.firestore()
dbTemp.settings({
    cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED,
})

export default firebase
export const db = dbTemp
export const auth = firebase.auth()
export const messaging = firebase.messaging()
export const functions = firebase.functions()
//export const crashlytics = firebase.crashlytics()
export const remoteConfig = firebase.remoteConfig()

// in DEV env use emulators
// TODO: https://github.com/invertase/react-native-firebase/pull/3690/files (only android redirects 10.0.2.2 to localhost)
// if (__DEV__) {
//     functions.useFunctionsEmulator('http://localhost:5001')
//     db.settings({
//         persistence: false,
//         host: 'localhost:8080',
//         ssl: false,
//     })
// }