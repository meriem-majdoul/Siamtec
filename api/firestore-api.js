
import firebase from '@react-native-firebase/app';
import '@react-native-firebase/auth'
import '@react-native-firebase/firestore'
import '@react-native-firebase/storage'
import '@react-native-firebase/functions'

const db = firebase.firestore()

//FIRESTORE CRUD
//USERS: GET

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
    this.setState(update1, () => MyCallBack())

    if (MyCount) {
      const update2 = {}
      update2[MyCount] = Count
      this.setState(update2)
    }
  })
}

export const fetchProjectName = async (project) => {
  const projectRef = await db.collection('Projects').doc(project.id).get()
  const fullName = projectRef.data().name
  project.fullName = fullName
  console.log(project)
  return project
}

export const fetchClientName = async (client) => {
  const user = await db.collection('Users').doc(client.id).get()
  const fullName = user.data().fullName
  client.fullName = fullName
  return client
}

export const fetchCreatedByName = async (createdBy) => {
  const user = await db.collection('Users').doc(createdBy.id).get()
  const fullName = user.data().fullName
  createdBy.fullName = fullName
  return createdBy
}

export const fetchEditedByName = async (editedBy) => {
  const user = await db.collection('Users').doc(editedBy.id).get()
  const fullName = user.data().fullName
  editedBy.fullName = fullName
  return editedBy
}

export const getUsers = async (main, query) => {

  await query.onSnapshot((querysnapshot) => {
    let usersList = []
    let usersCount = 0

    querysnapshot.forEach((doc) => {
      let id = doc.id
      let user = doc.data()
      user.id = id
      usersList.push(user)
      usersCount = usersCount + 1
    })

    main.setState({ usersList, usersCount })

  })
    .then(() => console.log('Users list retrieved'))
    .catch((err) => alert(err))
    .finally(() => main.setState({ loading: false }))
}

export const increaseCount = async (idCount, collection, document, update) => {
  await db.collection(collection).doc(document).set(update, { merge: true }).then(() => console.log('PRODUCTS COUNT UPDATED !'))
}

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

  // //2. Set Deleted team
  // const dltTeamRef = db.collection('DeletedTeams').doc(team.id)
  // batch.set(dltTeamRef, team)

  // //3. Delete the Team
  // const teamRef = db.collection('Teams').doc(team.id)
  // batch.delete(teamRef)

  // Commit the batch
  return await batch.commit()
  // .then(() => console.log('Batch succeeded !'))
  // .catch(e => console.error(e))
}