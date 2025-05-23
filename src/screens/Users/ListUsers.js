import React, { useState, useEffect } from 'react'
import { StyleSheet, View, FlatList, Alert, RefreshControl } from 'react-native'
import { faUserPlus, faUserFriends } from '@fortawesome/free-solid-svg-icons'
import { useNavigation } from '@react-navigation/native'
import SearchInput, { createFilter } from 'react-native-search-filter'

import firebase, { db } from '../../firebase'
import * as theme from '../../core/theme'
import { constants } from '../../core/constants'
import { load, myAlert, getRoleIdFromValue, countDown } from '../../core/utils'
import { fetchDocs, fetchDocuments } from '../../api/firestore-api'

import UserItem from '../../components/UserItem'
import EmptyList from '../../components/EmptyList'
import MyFAB from '../../components/MyFAB'
import Loading from '../../components/Loading'
import ListSubHeader from '../../components/ListSubHeader'

const KEYS_TO_FILTERS = ['id', 'fullName', 'nom', 'prenom', 'denom', 'role']

const ListUsers = (props) => {
  const navigation = useNavigation()

  const [usersList, setUsersList] = useState([])
  const [usersCount, setUsersCount] = useState(3)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchInput, setSearchInput] = useState('') // État pour la recherche

  const fetchUsers = async (count) => {
    setRefreshing(true)

    if (count) {
      await countDown(count)
    }

    const query = props.query

    const usersList = await fetchDocuments(query)
    setUsersList(usersList)
    setUsersCount(usersList.length)
    setLoading(false)
    setRefreshing(false)
  }

useEffect(() => {
  const loadUsers = async () => {
    try {
      await fetchUsers(); // Appel initial pour charger les utilisateurs
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs :", error);
    }
  };

  loadUsers(); // Exécution au montage du composant

  const willFocusSubscription = navigation.addListener('focus', async () => {
    try {
      await fetchUsers(); // Rechargement lors du focus sur l'écran
    } catch (error) {
      console.error("Erreur lors du rechargement des utilisateurs :", error);
    }
  });

  return () => willFocusSubscription.remove(); // Nettoyage de l'abonnement au démontage
}, [navigation]);



  

  const alertDeleteUser = (user) => {
    const title = "Supprimer l'utilisateur"
    const message = 'Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette opération est irreversible.'
    const handleConfirm = () => deleteUser(user)
    myAlert(title, message, handleConfirm)
  }

  const deleteUser = (user) => {
    const batch = db.batch()
    const { userType } = props

    if (userType === 'utilisateur') {
      if (user.hasTeam) {
        const teamRef = db.collection('Teams').doc(user.teamId)
        batch.update(teamRef, { members: firebase.firestore.FieldValue.arrayRemove(user.id) })
      }

      const userRef = db.collection('Users').doc(user.id)
      batch.update(userRef, { deleted: true, hasTeam: false })
    } else if (userType === 'client' || userType === 'prospect') {
      const userRef = db.collection('Clients').doc(user.id)
      batch.update(userRef, { deleted: true })
    }

    batch.commit()
    fetchUsers(3000)
  }

  const renderUser = (user) => {
    const { userType, permissions, offLine } = props
    const { canRead, canUpdate, canDelete } = permissions
    const isClient = userType === 'client' || userType === 'prospect'

    var roleId = getRoleIdFromValue(user.role)

    const viewProfile = (isEdit) => {
      navigation.navigate('ProfileStack', {
        screen: 'Profile',
        params: {
          user: { id: user.id, roleId },
          isClient,
          isEdit
        }
      })
    }

    const viewUser = () => viewProfile(false)
    const editUser = () => viewProfile(true)
    const deleteUser = () => {
      if (offLine) Alert.alert('', 'Impossible de supprimer un utilisateur en mode hors-ligne')
      else alertDeleteUser(user)
    }

    let functions = []
    let options = []

    if (canRead) {
      functions.push(viewUser); options.push({ id: 0, title: 'Voir le profil' })
    }

    if (canUpdate) {
      functions.push(editUser); options.push({ id: 1, title: "Modifier" })
    }

    if (canDelete) {
      functions.push(deleteUser); options.push({ id: 2, title: 'Supprimer' })
    }

    return (
      <UserItem
        userType={props.userType}
        item={user}
        onPress={() => props.onPress(user)}
        options={options}
        functions={functions}
      />
    )
  }

  const customOnGoBack = (user) => {
    if (props.onGoBack) props.onGoBack(user)
    fetchUsers(2000)
  }

  const onPressFAB = () => {
    const { prevScreen, userType, onGoBack } = props
    const nextScreen = userType === 'utilisateur' ? 'CreateUser' : 'CreateClient'
    const isProspect = userType === 'prospect'
    navigation.navigate(nextScreen, { prevScreen, isProspect, onGoBack: (user) => customOnGoBack(user) })
  }

  const filteredUsers = usersList.filter(createFilter(props.searchInput, KEYS_TO_FILTERS))

  const { canCreate } = props

  return (
    <View style={styles.container}>
      {loading ?
        <View style={styles.container}>
          <Loading />
        </View>
        :
        <View style={styles.container}>
       
          {filteredUsers.length > 0 && <ListSubHeader style={{ backgroundColor: theme.colors.background }}>{filteredUsers.length} {props.userType}{filteredUsers.length > 1 ? 's' : ''}</ListSubHeader>}
          {filteredUsers.length > 0 ?
            <FlatList
              enableEmptySections={true}
              data={filteredUsers}
              keyExtractor={item => item.id.toString()}
              renderItem={({ item }) => renderUser(item)}
              style={{ paddingHorizontal: theme.padding }}
              contentContainerStyle={{ paddingBottom: 75 }}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={fetchUsers}
                />
              }
            />
            :
            <EmptyList
              icon={props.emptyListIcon || faUserFriends}
              iconColor={theme.colors.miUsers}
              header={props.emptyListHeader}
              description={props.emptyListDesc}
              offLine={props.offLine}
            />
          }

          {canCreate && props.showButton && !props.offLine &&
            <MyFAB icon={faUserPlus} onPress={onPressFAB} />
          }
        </View>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background
  },
  searchInput: {
    margin: 10,
    padding: 10,
    backgroundColor: theme.colors.searchInputBackground,
    borderRadius: 5
  },
  usersCount: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: constants.ScreenWidth * 0.04,
    paddingLeft: constants.ScreenWidth * 0.05
  }
})

export default ListUsers
