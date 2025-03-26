
import { errorMessages } from '../core/constants';
import firebase, { functions } from '../firebase'

export const loginUser = async ({ email, password }) => {
  try {
    await firebase.auth().signInWithEmailAndPassword(email, password)
    return { success: true }
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
    return { success: true }
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

export const checkEmailExistance = async (email, isConnected) => {
  if (!isConnected) {
    return { error: { message: errorMessages.network.newUser } }
  }

  const methods = await firebase.auth().fetchSignInMethodsForEmail(email)
  const emailExist = methods.length > 0

  if (emailExist) {
    return { error: { message: errorMessages.auth.emailExist } }
  }

  else return emailExist
}
