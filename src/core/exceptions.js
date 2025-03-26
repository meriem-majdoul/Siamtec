import { Alert } from 'react-native'

//Firestore:
export const handleFirestoreError = (e) => {

    let errorMessage = ''
    let title = ''

    switch (e.code) {
        // case "firestore/aborted":
        //     title = 'Permission refusée'
        //     errorMessage = "L'opération a été annulée."
        //     break;

        case "firestore/already-exists":
            //title = 'Permission refusée'
            errorMessage = "Ces données existent déjà dans le serveur."
            break;

        // case "firestore/canceled":
        //     title = 'Permission refusée'
        //     errorMessage = "Vous n'avez pas l'accès à ce type d'opérations."
        //     break;

        case "firestore/data-loss":
            title = 'Erreur'
            errorMessage = "Données corrompues. Veuillez réessayer"
            break

        case "firestore/deadline-exceeded":
            title = 'Erreur'
            errorMessage = "La requête a expirée. Veuillez réessayer"
            break

        case "firestore/failed-precondition":
            title = 'Permission refusée'
            errorMessage = "Vous n'avez pas l'accès à ce type d'opérations."
            break

        case "firestore/internal":
            title = 'Erreur'
            errorMessage = "Serveur inaccessible. Veuillez réessayer dans quelques instants."
            break

        case "firestore/invalid-argument":
            title = 'Erreur'
            errorMessage = "Arguments de la requête invalides."
            break

        case "firestore/not-found":
            title = 'Erreur'
            errorMessage = "Données introuvable dans le serveur. Veuillez réessayer plus tard."
            break

        // case "firestore/ok":
        //     title = 'Permission refusée'
        //     errorMessage = "Vous n'avez pas l'accès à ce type d'opérations."
        //     break

        // case "firestore/out-of-range":
        //     title = 'Permission refusée'
        //     errorMessage = "Vous n'avez pas l'accès à ce type d'opérations."
        //     break

        case "firestore/permission-denied":
            title = 'Permission refusée'
            errorMessage = "Vous n'avez pas l'accès à ce type d'opérations."
            break

        case "firestore/ressource-exhausted":
            title = 'Erreur'
            errorMessage = "Mémoire de votre appareil insuffisante ou bien serveur saturé."
            break

        case "firestore/unauthenticated":
            title = 'Permission refusée'
            errorMessage = "Veuillez vous authentifier."
            break

        case "firestore/unavailable":
            title = 'Serveur inaccessible'
            errorMessage = "Le serveur est inaccessible pour le moment. Veuillez réessayer plus tard"
            break

        case "firestore/unimplemented":
            title = 'Permission refusée'
            errorMessage = "Vous n'avez pas l'accès à ce type d'opérations."
            break

        case "firestore/unknown":
            title = 'Permission refusée'
            errorMessage = "Vous n'avez pas l'accès à ce type d'opérations."
            break

        default:
            title = 'Erreur de connection'
            errorMessage = "Le serveur est inaccessible, veuilez réessayer dans quelques instants..."
            break
    }

    Alert.alert(title, errorMessage, [{ text: 'OK', style: 'cancel' }], { cancelable: false })
}

//Firebase auth: reauthenticate
export const handleReauthenticateError = (e) => {

    let errorMessage = ''
    let title = ''

    switch (e.code) {
        case "auth/user-mismatch":
            title = ""
            errorMessage = "Erreur d'authentification, veuillez réessayer."
            break

        case "auth/user-not-found":
            title = 'Utilisateur introuvable'
            errorMessage = "Erreur d'authentification, veuillez réessayer."
            break

        case "auth/invalid-credential":
            title = ''
            errorMessage = "Erreur d'authentification, veuillez réessayer."
            break

        case "auth/invalid-email":
            title = ''
            errorMessage = "Erreur d'authentification, veuillez réessayer.."
            break

        case "auth/wrong-password":
            title = 'Ancien mot de passe invalide'
            errorMessage = "Erreur d'authentification, veuillez réessayer."
            break

        case "auth/invalid-verification-code":
            title = ''
            errorMessage = "Erreur d'authentification, veuillez réessayer."
            break

        case "auth/invalid-verification-id":
            title = ''
            errorMessage = "Erreur d'authentification, veuillez réessayer."
            break

        default:
            title = 'Erreur de connection'
            errorMessage = "La base de données est inaccessible, veuilez réessayer dans quelques instants..."
            break
    }

    return errorMessage
}

//Firebase auth: update password
export const handleUpdatePasswordError = (e) => {

    let errorMessage = ''
    let title = ''

    switch (e.code) {
        case "auth/weak-password":
            title = ""
            errorMessage = "Nouveau mot de passe faible."
            break

        case "auth/requires-recent-login":
            title = ""
            errorMessage = "Veuillez vous réauthentifier avant de modifier votre mot de passe."
            break

        default:
            title = 'Erreur de connection'
            errorMessage = "La base de données est inaccessible, veuilez réessayer dans quelques instants..."
            break
    }

    return errorMessage
}

//Firebase auth: update email
export const handleUpdateEmailError = (e) => {

    let errorMessage = ''
    // let title = ''

    switch (e.code) {
        case "auth/email-already-in-use":
            // title = ""
            errorMessage = "Cette adresse email est déjà utilisée."
            break

        case "auth/requires-recent-login":
            // title = ""
            errorMessage = "Veuillez vous réauthentifier avant d'essayer de modifier votre adresse email."
            break

        case "auth/invalid-email":
            // title = 'Mot de passe faible'
            errorMessage = "Le format de l'adresse email est invalide."
            break

        default:
            // title = 'Erreur de connection'
            errorMessage = "Le serveur est inaccessible, veuilez réessayer dans quelques instants."
            break
    }

    return errorMessage
    // Alert.alert(title, errorMessage, [{ text: 'OK', style: 'cancel' }], { cancelable: false })
}

//Offline
export const notAvailableOffline = (message) => {
    Alert.alert('', message, [{ text: 'OK', style: 'cancel' }], { cancelable: false })
}