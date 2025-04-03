import React, { memo, Component } from "react"
import { View, Alert, Text, StyleSheet, Linking, Platform } from "react-native"
import LinearGradient from 'react-native-linear-gradient'
import { ProgressBar } from "react-native-paper"
import RNFS from 'react-native-fs'
import firebase, { auth, db, remoteConfig } from '../../firebase'
import notifee, { EventType } from '@notifee/react-native'
import { connect } from 'react-redux'
import _ from 'lodash'
import NetInfo from "@react-native-community/netinfo"
import compareVersions from "compare-versions"

import Button from "../../components/Button"
import Background from "../../components/NewBackground"
import Loading from "../../components/Loading"
import AppVersion from "../../components/AppVersion"

import { uploadFileNew } from '../../api/storage-api'
import * as theme from "../../core/theme"
import { setRole, setPermissions, userLoggedOut, resetState, setCurrentUser, setNetwork, setProcessModel } from '../../core/redux'
import { appVersion, constants, errorMessages } from "../../core/constants"
import { privilleges } from "../../core/privillegesConfig"
import { displayError } from "../../core/utils"

import moment from 'moment';
import 'moment/locale/fr'
moment.locale('fr')

const roles = [
  { id: 'admin', value: 'Admin', level: 3, isHighRole: true, isLowRole: false, isClient: false },
  { id: 'backoffice', value: 'Back office', level: 3, isHighRole: true, isLowRole: false, isClient: false },
  { id: 'dircom', value: 'Service commercial', level: 2, isHighRole: true, isLowRole: false, isClient: false },
  { id: 'com', value: "Chargé d'affaires", level: 1, isHighRole: false, isLowRole: true, isClient: false },
  { id: 'poseur', value: 'Équipe technique', level: 1, isHighRole: false, isLowRole: true, isClient: false },
  { id: 'tech', value: 'Service technique', level: 2, isHighRole: true, isLowRole: false, isClient: false },
  { id: 'client', value: 'Client', level: 0, isHighRole: false, isLowRole: false, isClient: true },
  { id: 'designoffice', value: "Bureau d'étude", level: 0, isHighRole: false, isLowRole: false, isClient: false }
]




class AuthLoadingScreen extends Component {



  constructor(props) {
    super(props)
    this.booted = false
    this.alertDisplayed = false

    this.uploadFileNew = uploadFileNew.bind(this)

    this.state = {
      initialNotification: false,
      routeName: '',
      routeParams: {},
      progress: 0,
      requiresUpdate: false,
      latestVersionDownloadLink: "",
      loading: true,
    }
  }

  async componentDidMount() {
    //auth.signOut()
    //1. Notification action listeners
    const { isUpToDate, latestVersionDownloadLink } = await this.checkAppVersion()
    if (!isUpToDate) {
      Alert.alert('Mise à jour', "L'application n'est pas à jour. Veuillez installer la version la plus récente.")
      this.setState({
        requiresUpdate: true,
        loading: false,
        latestVersionDownloadLink
      })
      return
    }

    console.log("2")

    await this.bootstrapNotifications()
    this.forgroundNotificationListener()
    this.backgroundNotificationListener()
    console.log("3")


    //2. Auth listener: Privileges setting, fcm token setting, Navigation rooter
    this.unsububscribe = this.onAuthStateChanged()
    console.log("4")

  }

  async checkAppVersion() {
    await remoteConfig.setDefaults({ minAppVersion: '1.2.0', latestVersionDownloadLink: "" })
    const fetchedRemotely = await remoteConfig.fetchAndActivate().catch((e) => console.log(e))
    await remoteConfig.fetch(60).catch((e) => console.log(e))

    if (fetchedRemotely) {
      console.log('Configs were retrieved from the backend and activated.');
    }
    else {
      console.log('No configs were fetched from the backend, and the local configs were already activated',)
    }

    const remoteMinAppVersion = Platform.OS === "android" ? "minAppVersionAndroid" : "minAppVersionIos"
    const remoteLatestVersionDownloadLink = Platform.OS === "android" ? "latestVersionDownloadLinkAndroid" : "latestVersionDownloadLinkIos"
    const minAppVersion = remoteConfig.getValue(remoteMinAppVersion).asString() //exp: 1.3.0
    const latestVersionDownloadLink = remoteConfig.getValue(remoteLatestVersionDownloadLink).asString()
    const isUpToDate = compareVersions.compare(appVersion, minAppVersion, '>=');
    return { isUpToDate, latestVersionDownloadLink }
  }

  //User action on a notification has caused app to open
  async bootstrapNotifications() {
    const initialNotification = await notifee.getInitialNotification()

    if (initialNotification) {
      const { data } = initialNotification.notification
      const routeName = data['screen']
      delete data.screen //keep only params
      const routeParams = data
      Object.entries(routeParams).forEach(([key, value]) => {
        if (value === 'true') routeParams[key] = true
        if (value === 'false') routeParams[key] = false
      })
      this.setState({ initialNotification: true, routeName, routeParams })
    }

    return initialNotification
  }

  forgroundNotificationListener() {
    notifee.onForegroundEvent(({ type, detail }) => {
      switch (type) {
        case EventType.DISMISSED:
          console.log('User dismissed notification', detail.notification)
          break
        case EventType.PRESS: {
          const { notification } = detail
          const { screen } = notification.data
          const params = notification.data
          this.props.navigation.navigate(screen, params)
          console.log('User pressed notification', detail.notification)
        }
          break
      }
    })
  }

  backgroundNotificationListener() {
    notifee.onBackgroundEvent(async ({ type, detail }) => {
      //const { pressAction } = notification.android
      const { currentUser } = firebase.auth()
      const { notification } = detail
      const { data } = notification
      const screen = data['screen']
      delete data.screen //keep only params
      const params = data

      Object.entries(params).forEach(([key, value]) => {
        if (value === 'true') params[key] = true
        if (value === 'false') params[key] = false
      })

      switch (type) {
        case EventType.PRESS:
          if (currentUser)
            this.props.navigation.navigate(screen, params)
          else this.props.navigation.navigate("Guest")
          await notifee.cancelNotification(notification.id)
          break
      }
    })
  }

  //Auth Listener & Navigation Rooter
  onAuthStateChanged() {

    firebase.auth().onAuthStateChanged(async user => {

      try {

        const { type, isConnected } = await NetInfo.fetch()

        if (user) {
          if (isConnected) {

            //0. Get idTokenResult
            const idTokenResult = await user.getIdTokenResult()
            console.log(".......", idTokenResult.claims)

            if (!idTokenResult) {
              throw new Error("ID Token Invalide, veuillez contacter un admin.")
            }

            console.log("erreur !!....", idTokenResult.claims)

            //1. Set role
            for (const r of roles) {
              if (idTokenResult.claims[r.id]) {
                var role = r
                var roleValue = role.value
                console.log("5", roleValue)
              }
            }


            //2. Set currentUser
            const currentUser = {
              id: user.uid,
              fullName: user.displayName,
              email: user.email,
              role: roleValue,
            }

            //3. Set fcm token
            const enabled = await this.requestUserPermission() //iOS only
            await this.configureFcmToken()

            //4. Set role/permissions/currentUser on redux:
            const action1 = { type: "ROLE", value: role }
            const action2 = { type: "SET_PERMISSIONS", value: privilleges[roleValue] }
            const action3 = { type: "CURRENTUSER", value: currentUser }

            this.props.dispatch(action1)
            this.props.dispatch(action2)
            this.props.dispatch(action3)
          }


          //5. Navigation
          const { initialNotification } = this.state //Notification
          const { params } = this.props.navigation.state //Dynamic link

          //Dynamic link (email)
          if (params && params.routeName) {
            var { routeName, ...routeParams } = params
          }

          //Dynamic link (notification)
          else if (initialNotification) {
            var { routeName, routeParams } = this.state
          }

          //Default
          else {
            const isExternalEntity = roleValue === 'Client' || roleValue === "Équipe technique" || roleValue === "Bureau d'étude"
            var routeName = isExternalEntity ? "ProjectsStack" : "App"
            var routeParams = {}
          }
        }

        else {
          resetState(this)
          const network = { type, isConnected }
          setNetwork(this, network)
          var routeName = "Guest"
          var routeParams = {}
        }

        this.props.navigation.navigate(routeName, routeParams)
      }

      catch (e) {
        displayError({ message: e.message })
      }

    })
  }

  //FCM token configuration
  async requestUserPermission() {
    const authStatus = await firebase.messaging().requestPermission();
    const enabled = authStatus === firebase.messaging.AuthorizationStatus.AUTHORIZED || authStatus === firebase.messaging.AuthorizationStatus.PROVISIONAL
    return enabled
  }

  async configureFcmToken() {
    try {
      //Register the device with FCM 
      await firebase.messaging().registerDeviceForRemoteMessages() //iOS only

      //Get the token
      const token = await firebase.messaging().getToken()

      //Save the token
      const { uid } = firebase.auth().currentUser //user B
      const fcmTokensRef = db.collection('FcmTokens')
      const queryTokens = fcmTokensRef.where('tokens', 'array-contains', token)
      await queryTokens.get().then(async (querysnapshot) => {
        try {
          //OLD TOKEN: already belongs to a user
          if (!querysnapshot.empty) {
            const doc = querysnapshot.docs[0]
            //This device/token was used by user A
            if (doc.id !== uid) {
              //1. remove this token from user A
              const tokens = doc.data().tokens
              const index = tokens.indexOf(token)
              tokens.splice(index, 1)
              //2. update user A tokens
              await doc.ref.update({ tokens })
              //3. add this token to current user  
              await this.addTokenToCurrentUser(token, uid)
            }
          }
          //NEW TOKEN: add it to the current user
          else {
            await this.addTokenToCurrentUser(token, uid)
          }
        }

        catch (e) {
          throw new Error(e)
        }
      })
    }

    catch (e) {
      throw new Error(e)
    }
  }

  async addTokenToCurrentUser(token, uid) {
    try {
      var tokens = []
      const fcmTokensRef = db.collection('FcmTokens')
      const userDoc = await fcmTokensRef.doc(uid).get()
      if (userDoc.exists) {
        tokens = userDoc.data().tokens
      }
      tokens.push(token)
      await fcmTokensRef.doc(uid).set({ tokens }, { merge: true })
    }
    catch (e) {
      console.log('Error', e)
      throw new Error("Error while adding token to current user...")
    }
  }

  downloadApp(latestVersionDownloadLink) {
    Linking.openURL(latestVersionDownloadLink)
  }

  renderAppVersion() {
    return (
      <View style={styles.appVersionContainer}>
        <AppVersion />
      </View>
    )
  }

  render() {
    const { progress, requiresUpdate, latestVersionDownloadLink, loading } = this.state

    return (
      <Background>
        <Background style={styles.nestedBackground}>

          {loading &&
            <View style={styles.container}>
              <Loading />
            </View>
          }
        </Background>
        {requiresUpdate &&
          <Button
            mode="contained"
            onPress={() => this.downloadApp(latestVersionDownloadLink)}
            containerStyle={styles.updateButton}
            outlinedColor={theme.colors.primary}
          >
            Mettre à jour
          </Button>
        }
        {this.renderAppVersion()}
      </Background>
    )
  }
  
}

const mapStateToProps = (state) => {
  return {
    role: state.roles.role,
    permissions: state.permissions,
    network: state.network,
    state: state,
    //fcmToken: state.fcmtoken
  }
}

const styles = StyleSheet.create({
  nestedBackground: {
    transform: [{ scaleY: -1 }]
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    width: constants.ScreenWidth * 0.5,
    alignSelf: "center"
  },
  synergys: {
    textAlign: 'center',
    color: theme.colors.primary,
    marginVertical: 15,
    letterSpacing: 2,
    fontSize: 45
  },
  logo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.white
  },
  updateButton: {
    position: 'absolute',
    zIndex: 1,
    bottom: constants.ScreenHeight * 0.2,
    alignSelf: 'center'
  },
  appVersionContainer: {
    position: "absolute",
    bottom: theme.padding,
    right: theme.padding
  }
})

export default connect(mapStateToProps)(AuthLoadingScreen)