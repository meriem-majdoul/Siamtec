import firebase from '@react-native-firebase/app';
import '@react-native-firebase/auth'
import '@react-native-firebase/firestore'
import '@react-native-firebase/storage'
import '@react-native-firebase/functions'

const functions = firebase.functions()

//#note: Currently.. all users are admins
const setAdminClaims = (synuid, email) => {
  const setAdminClaims = functions.httpsCallable('setAdminClaims')
  setAdminClaims({ synuid: synuid, email: email })
    .then(async result => {
      console.log(result)
      await firebase.auth().currentUser.getIdToken(true).then(() => console.log('TOKEN REFRESHED !!!!!!!!!!!!!!!!!!!!!!!!!!'))
    })
    .catch(err => console.error(err))
}

export const signUpUser = async ({ synuid, email, password }) => {

  try {
    let userObject = await firebase.auth().createUserWithEmailAndPassword(email, password)
    setAdminClaims(synuid, userObject.user.email)
    return {}
  }

  catch (error) {
    switch (error.code) {
      case "auth/email-already-in-use":
        return {
          error: "Cette addresse email a déjà un compte."
        };
      case "auth/invalid-email":
        return {
          error: "Adresse email invalide."
        };
      case "auth/weak-password":
        return {
          error: "Mot de passe très faible."
        };
      case "auth/too-many-requests":
        return {
          error: "Excès de requêtes d'inscription. Veuillez réessayer dans quelques instants."
        };
      default:
        return {
          error: "Vérifiez votre connection internet."
        };
    }
  }

}

// export const createUserDocument = async ({ name, email }) => {
//   await firebase.firestore().collection('Users').doc(firebase.auth().currentUser.uid).set({
//     name: name,
//     email: email,
//   })
//     .catch(e => console.error(e))
// }

export const loginUser = async ({ email, password }) => {
  try {
    await firebase.auth().signInWithEmailAndPassword(email, password)
    return {}
  }

  catch (error) {
    switch (error.code) {
      case "auth/invalid-email":
        return {
          error: "Le format de l'adresse email est invalide."
        };
      case "auth/user-not-found":
        return {
          error: "Aucun utilisateur associé à cette adresse email n'a été trouvé"
        };
      case "auth/wrong-password":
        return {
          error: "Email ou mot de passe invalide."
        };
      case "auth/too-many-requests":
        return {
          error: "Excès de requêtes d'authentification. Veuillez réessayer dans quelques instants."
        };
      default:
        return {
          error: "Veuillez vérifier votre connection internet."
        };
    }
  }
}

export const logoutUser = () => {
  firebase.auth().signOut();
}

export const sendEmailWithPassword = async email => {
  try {
    await firebase.auth().sendPasswordResetEmail(email)
    return {}
  }
  catch (error) {
    switch (error.code) {
      case "auth/invalid-email":
        return {
          error: "Le format de l'adresse email est invalide"
        };
      case "auth/user-not-found":
        return {
          error: "Aucun utilisateur associé à cette adresse email n'a été trouvé"
        };
      case "auth/too-many-requests":
        return {
          error: "Excès de requêtes. Veuillez réessayer dans quelques instants."
        };
      default:
        return {
          error: "Veuillez vérifier votre connection internet."
        };
    }
  }
}
