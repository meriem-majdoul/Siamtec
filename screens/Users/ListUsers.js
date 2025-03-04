

import React, { Component } from 'react'
import { StyleSheet, Text, View, FlatList, ScrollView, TouchableOpacity, Alert } from 'react-native'
import { List } from 'react-native-paper'
import firebase from '@react-native-firebase/app'

import * as theme from '../../core/theme'
import { constants } from '../../core/constants'
import { load, myAlert } from '../../core/utils'
import { fetchDocs } from '../../api/firestore-api'

import ListItem from '../../components/ListItem'
import EmptyList from '../../components/EmptyList'
import MyFAB from '../../components/MyFAB'

import { withNavigation } from 'react-navigation'

import SearchInput, { createFilter } from 'react-native-search-filter'
import Loading from '../../components/Loading'

const KEYS_TO_FILTERS = ['id', 'fullName', 'nom', 'prenom', 'denom', 'role']
const db = firebase.firestore()

class ListUsers extends Component {

  constructor(props) {
    super(props);
    this.myAlert = myAlert.bind(this)
    this.renderUser = this.renderUser.bind(this)
    this.renderCountLabel = this.renderCountLabel.bind(this)
    this.fetchDocs = fetchDocs.bind(this)

    this.state = {
      usersList: [],
      usersCount: 0,

      loading: false
    }
  }

  async componentDidMount() {
    load(this, true)
    const query = this.props.query
    this.fetchDocs(query, 'usersList', 'usersCount', () => load(this, false))
  }

  componentWillUnmount() {
    this.unsubscribe()
  }

  alertDeleteUser(user) {
    const title = "Supprimer l'utilisateur"
    const message = 'Etes-vous sûr de vouloir supprimer cet utilisateur ? Cette opération est irreversible.'
    const handleConfirm = () => this.deleteUser(user)
    this.myAlert(title, message, handleConfirm)
  }

  deleteUser(user) {

    const batch = db.batch()

    //1. Remove user from his team
    if (user.hasTeam) {
      const teamRef = db.collection('Teams').doc(user.teamId)
      batch.update(teamRef, { members: firebase.firestore.FieldValue.arrayRemove(user.id) })
    }

    //2. Update User (deleted = false)
    const userRef = db.collection('Users').doc(user.id)
    batch.update(userRef, { deleted: true, hasTeam: false }) //handle user reactivation..

    //3. Add user to DeletedUsers collection (OLD)
    // const dltUserRef = db.collection('DeletedUsers').doc(user.id)
    // batch.set(dltUserRef, user)

    // //3. Delete the User (OLD)
    // const userRef = db.collection('Users').doc(user.id)
    // batch.delete(userRef)

    // Commit the batch
    batch.commit()
      .then(() => console.log("Batch succeeded !"))
      .catch(e => console.error(e))
  }

  renderUser = (item) => {
    const { canDelete } = this.props.permissions

    return (
      <TouchableOpacity onPress={() => {
        if (item.isPro)
          this.props.onPress(item.isPro, item.id, item.denom, '', item.role)
        else
          this.props.onPress(item.isPro, item.id, item.nom, item.prenom, item.role)
      }}>
        <ListItem
          title={item.isPro ? item.denom : item.prenom + ' ' + item.nom}
          description={item.role}
          left={props => {
            if (item.role === 'Admin')
              return <List.Icon {...props} icon="account-cog" />

            else if (item.role === 'Back office')
              return <List.Icon {...props} icon="laptop-mac" />

            else if (item.isPro)
              return <List.Icon {...props} icon="briefcase" />

            else if (!item.isPro && item.role !== 'Admin')
              return <List.Icon {...props} icon="account" />
          }}

          //Right icon
          menu={this.props.menu}
          iconRightName='dots-horizontal'
          options={[
            { id: 0, title: 'Voir le profil' },
            { id: 1, title: "Modifier" },
            { id: 2, title: 'Supprimer' },
          ]}

          functions={[
            () => this.props.navigation.navigate('Profile', { userId: item.id }),
            () => this.props.navigation.navigate('Profile', { userId: item.id }),
            () => {
              if (this.props.offLine) Alert.alert('', 'Impossible de supprimer un utilisateur en mode hors-ligne')
              else if (!canDelete) Alert.alert('Action non autorisée', 'Seul un administrateur peut supprimer un utilisateur.')
              else this.alertDeleteUser(item)
            },
          ]}
        />
      </TouchableOpacity>
    )
  }

  renderCountLabel(usersCount) {
    let type = 'utilisateur'
    if (this.props.userType === 'client') type = 'client'
    let label = type
    if (usersCount > 1) label = `${label}s`

    return label
  }

  render() {
    let { usersCount, usersList, loading } = this.state
    let label = this.renderCountLabel(usersCount)

    const filteredUsers = usersList.filter(createFilter(this.props.searchInput, KEYS_TO_FILTERS))
    console.log('************', this.props.permissions)
    const { canCreate } = this.props.permissions

    return (
      <View style={styles.container}>
        {loading ?
          <View style={styles.container}>
            <Loading />
          </View>
          :
          <View style={[styles.container, { paddingHorizontal: constants.ScreenWidth * 0.015 }]}>

            {usersCount > 0 && <List.Subheader>{usersCount} {label}</List.Subheader>}
            {usersCount > 0 ?
              <FlatList
                enableEmptySections={true}
                data={filteredUsers}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => this.renderUser(item)}
                style={{ paddingHorizontal: 10 }}
                contentContainerStyle={{ paddingBottom: 75 }} />
              :
              <EmptyList iconName='account' header={this.props.emptyListHeader} description={this.props.emptyListDesc} offLine={this.props.offLine} />
            }

            {canCreate && this.props.showButton && !this.props.offLine &&
              <MyFAB icon='account-plus' onPress={() => this.props.navigation.navigate('CreateUser', { prevScreen: this.props.prevScreen })} />
            }

          </View>}
      </View>
    )
  }
}

export default withNavigation(ListUsers)

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  usersCount: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: constants.ScreenWidth * 0.04,
    paddingLeft: constants.ScreenWidth * 0.05
  }
})