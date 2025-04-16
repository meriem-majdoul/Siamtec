
import { Alert, Keyboard } from 'react-native'
import { auth, db } from '../firebase'
import { checkEmailExistance } from './auth-api'
import { sortMonths, nameValidator, emailValidator, passwordValidator, phoneValidator, generateId, updateField, setToast, load, myAlert, navigateToScreen, displayError } from "../core/utils"
import moment from 'moment'
import 'moment/locale/fr'
import { errorMessages } from '../core/constants'
moment.locale('fr')

//#FETCH DOS BY QUERY
export function fetchDocs(query, MyList, MyCount, MyCallBack) {

  this.unsubscribe = query.onSnapshot((querysnapshot) => {
    var List = []
    var Count = 0

    if (querysnapshot)
      querysnapshot.forEach((doc) => {
        var hasPendingWrites = doc.metadata.hasPendingWrites ? true : false

        let document = doc.data()
        document.id = doc.id
        document.hasPendingWrites = hasPendingWrites

        List.push(document)
        Count = Count + 1
      })

    const update1 = {}
    update1[MyList] = List
    this.setState(update1)

    if (MyCount) {
      const update2 = {}
      update2[MyCount] = Count
      this.setState(update2, () => MyCallBack())
    }
  })
}

export function fetchDocuments(query) {
  console.log('33333333333333333333333333333333', query)
  return query.get()
    .then((querySnapshot) => {
      let documents = []
      if (querySnapshot.empty) return documents
      for (const doc of querySnapshot.docs) {
        let data = doc.data()
        data.id = doc.id
        documents.push(data)
      }
      return documents
    })
    .catch((e) => { throw new Error(e) })
} 

export function fetchDocument(collection, id, subCollection, subId) {
  let query = db.collection(collection).doc(id)
  if (subCollection) query = query.collection(subCollection).doc(subId)
  return query.get()
    .then((doc) => {
      if (!doc.exists) return null
      let data = doc.data()
      data.id = doc.id
      return data
    })
    .catch((e) => { throw new Error('Erreur lors de la connection avec la base de données. Veuillez réessayer plus tard.') })
}

//#TEAMS
export const deleteTeam = async (team) => {
  // Get a new write batch
  const batch = db.batch()
  const members = team.members

  //1. Update users belonging to this team (detach them from it)
  if (members.length > 0)
    for (const memberId of members) {
      const memberRef = db.collection('Users').doc(memberId)
      batch.update(memberRef, { hasTeam: false, teamId: '' })
    }

  const teamRef = db.collection('Teams').doc(team.id)
  batch.update(teamRef, { deleted: true })

  // Commit the batch
  return await batch.commit()
}

//#USERS/CLIENTS
export const validateUserInputs = function validateUserInputs(thisState, checkPassword = true) {

  let { isPro, denom, siret, nom, prenom, phone, email, email2, password, address } = thisState

  if (isPro) {
    var denomError = nameValidator(denom.value, '"Dénomination sociale"')
    var siretError = nameValidator(siret.value, 'Siret')
  }

  else {
    var nomError = nameValidator(nom.value, '"Nom"')
    var prenomError = nameValidator(prenom.value, '"Prénom"')
  }

  const phoneError = nameValidator(phone.value, '"Téléphone"')
  const addressError = nameValidator(address.description, '"Adresse"')
  const emailError = emailValidator(email.value)

  const emailError2 = email2 && email2.value !== "" ? emailValidator(email2.value) : "" //#create
  const passwordError = checkPassword ? passwordValidator(password.value) : "" //#create

  if (denomError || siretError || nomError || prenomError || phoneError || emailError || addressError || emailError2 || passwordError) {

    phone.error = phoneError
    email.error = emailError
    password.error = passwordError
    email2.error = emailError2

    if (isPro) {
      denom.error = denomError
      siret.error = siretError
      var updateErrors = { denom, siret, phone, email, email2, password, addressError, loadingDialog: false }
    }

    else {
      nom.error = nomError
      prenom.error = prenomError
      var updateErrors = { nom, prenom, phone, email, email2, password, addressError, loadingDialog: false }
    }

    return { isValid: false, updateErrors }
  }

  return { isValid: true }
}

export const formatNewUser = function formatNewUser(thisState) {

  const { isPro, nom, prenom, denom, siret, address, phone, phone2, email, email2, password, role, userType, ClientId, userId, isProspect } = thisState

  let user = {
    isPro,//
    address,//
    phone: phone.value, //
    email: email.value.toLowerCase(),
    password: password.value,

    createdBy: {
      id: auth.currentUser.uid,
      fullName: auth.currentUser.displayName
    },
    createdAt: moment().format(),
    userType,
    deleted: false
  }

  if (isPro) {
    user.denom = denom.value//
    user.siret = siret.value//
    user.fullName = denom.value//
  }

  else if (!isPro) {
    user.nom = nom.value//
    user.prenom = prenom.value//
    user.fullName = `${prenom.value} ${nom.value}` //
  }


  if (userType === "client") {
    user.ClientId = ClientId
    user.isProspect = isProspect
    user.status = "pending"
    user.email2 = email2.value.toLowerCase()
    user.phone2 = phone2.value
    if (!isProspect)
      user.role = 'Client'
  }

  else if (userType === "utilisateur") {
    user.userId = userId
    user.role = role
    user.hasTeam = false
  }

  return user
}

export const createUser = async function createUser(user, isConnected) {

  const { email, isProspect, ClientId, userId, userType } = user

  //1. Check if email has an account (works only ONLINE)
  const emailExist = await checkEmailExistance(email, isConnected)
  if (emailExist.error) {
    return { error: emailExist.error }
  }

  //2. Set collection
  if (userType === "client") {
    var collection = "Clients"
    var id = ClientId
  }
  else if (userType === "utilisateur") {
    var collection = "Users"
    var id = userId
  }

  //2'. CREATE PROSPECT (document only)
  if (isProspect) {
    db.collection('Clients').doc(ClientId).set(user)
  }

  //2". CREATE USER/CLIENT (document only) + TF will create account for the user
  else {
    const batch = db.batch()
    const userRef = db.collection(collection).doc(id)
    const newUserRef = db.collection('newUsers').doc(id)
    batch.set(userRef, user)
    batch.set(newUserRef, user)
    batch.commit()
  }

  return true
}

//#DASHBOARD
export const fetchTurnoverData = async function fetchTurnoverData(query, turnoverObjects, userId) {
  try {

    const querySnapshot = await query.get().catch((e) => { throw new Error(errorMessages.firestore.get) })
    for (const doc of querySnapshot.docs) {

      const monthsTurnovers = doc.data()
      delete monthsTurnovers.target
      delete monthsTurnovers.current

      for (const month in monthsTurnovers) {
        //Update user income for "month"
        let currentIncome = turnoverObjects[month] ? turnoverObjects[month].current : 0
        const projectsIncome = monthsTurnovers[month].projectsIncome || {}
        for (var projectId in projectsIncome) {
          currentIncome += Number(projectsIncome[projectId].amount)
        }

        //Update Income sources
        let sources = turnoverObjects[month] && turnoverObjects[month].sources || []
        for (var projectId in projectsIncome) {
          let source = {}
          source.projectId = projectId
          source.amount = projectsIncome[projectId].amount
          sources.push(source)
        }

        const year = moment(month, 'MM-YYYY').format('YYYY')
        const monthLowerCase = moment(month, 'MM-YYYY').format('MMM')
        const monthUpperCase = monthLowerCase.charAt(0).toUpperCase() + monthLowerCase.slice(1)
        // const { target } = monthsTurnovers[month]

        const monthTurnover = {
          id: year,
          month: monthUpperCase,
          year,
          monthYear: month,
          //target,
          isCurrent: month === moment().format('MM-YYYY'),
          current: currentIncome,
          sources,
        }

        turnoverObjects[month] = monthTurnover
      }
    }

    //Each user has his target (DC's monthly target is the global turnover of month) (Com's monthly target is his own turnover)
    const querySnapshotUsers = await db
      .collection('Users')
      .doc(userId)
      .collection('Turnover')
      .get()
      .catch((e) => { throw new Error(errorMessages.firestore.get) })

    for (const doc of querySnapshotUsers.docs) {
      const monthsTurnovers = doc.data()
      delete monthsTurnovers.target
      delete monthsTurnovers.current

      for (const month in monthsTurnovers) {
        turnoverObjects[month].target = monthsTurnovers[month].target
      }
    }

    return turnoverObjects
  }

  catch (e) {
    throw new Error(e)
  }
}
