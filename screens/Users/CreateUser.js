import React, { Component } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Keyboard } from "react-native";
import { TextInput } from 'react-native-paper'
import firebase from '@react-native-firebase/app';
import TextInputMask from 'react-native-text-input-mask';
import { connect } from 'react-redux'

import Appbar from "../../components/Appbar"
import Loading from "../../components/Loading"
import Picker from "../../components/Picker"
import RadioButton from "../../components/RadioButton"
import MyInput from "../../components/TextInput"
import Toast from "../../components/Toast"

import * as theme from "../../core/theme";
import { constants, rolesRedux } from "../../core/constants";
import { nameValidator, emailValidator, passwordValidator, phoneValidator, generatetId, updateField, setToast, load } from "../../core/utils"
import { handleFirestoreError } from "../../core/exceptions";

const roles_l1 = [ //level1: Admin
  { label: 'Admin', value: 'Admin' },
  { label: 'Directeur commercial', value: 'Directeur commercial' },
  { label: 'Commercial', value: 'Commercial' },
  { label: 'Responsable technique', value: 'Responsable technique' },
  { label: 'Poseur', value: 'Poseur' },
  { label: 'Client', value: 'Client' },
  { label: 'Back office', value: 'Back office' },
]

const roles_l2 = [ //level2: Directeur commercial & Responsable technique
  { label: 'Directeur commercial', value: 'Directeur commercial' },
  { label: 'Commercial', value: 'Commercial' },
  { label: 'Responsable technique', value: 'Responsable technique' },
  { label: 'Poseur', value: 'Poseur' },
  { label: 'Client', value: 'Client' }
]

const roles_l3 = [ //level3: Commercial & Poseur
  { label: 'Commercial', value: 'Commercial' },
  { label: 'Responsable technique', value: 'Responsable technique' },
  { label: 'Poseur', value: 'Poseur' },
  { label: 'Client', value: 'Client' }
]

const roles_l4 = [ //level4:: Client
  { label: 'Client', value: 'Client' }
]

const db = firebase.firestore()

class CreateUser extends Component {
  constructor(props) {
    super(props)
    // this.isUserArchived = this.isUserArchived.bind(this)
    this.addUser = this.addUser.bind(this)
    this.refreshAddress = this.refreshAddress.bind(this)

    this.prevScreen = this.props.navigation.getParam('prevScreen', 'UsersManagement')
    this.title = 'Créer un utilisateur'
    this.role = this.props.role.id

    this.state = {
      userId: '', //Not editable
      role: 'Client',

      checked: 'first', //professional/Particular
      isPro: false,
      nom: { value: '', error: '' },
      prenom: { value: '', error: '' },
      denom: { value: "", error: "" },
      siret: { value: "", error: "" },

      address: { description: '', place_id: '', marker: { latitude: '', longitude: '' } },
      addressError: '',
      email: { value: "", error: "" },
      phone: { value: "", error: '' },

      password: { value: '', error: '', show: false },

      loading: false,
      error: "",
    }
  }

  async componentDidMount() {
    this.setRoleBasedPermissions()
    const userId = generatetId('GS-US-')
    this.setState({ userId })
  }

  //#PERMISSIONS:  (exp: isAdmin = true, isDirCom = false, isCom = false, isTech = false, isPoseur = false)
  setRoleBasedPermissions() {
    rolesRedux.forEach((role, key) => {
      const update = {}

      if (role.id === this.role)
        update[role.bool] = true

      else
        update[role.bool] = false

      this.setState(update)
    })
  }

  //#PERMISSIONS: config role picker items (depending on user's role)
  configRolesPicker() {
    let { isAdmin, isBackOffice, isDirCom, isCom, isTech, isPoseur } = this.state
    if (isAdmin)
      return roles_l1

    else if (isDirCom)
      return roles_l2

    else if (isCom)
      return roles_l3

    else if (isTech || isPoseur)
      return roles_l4
  }

  async validateInputs() {
    let denomError = ''
    let siretError = ''

    let nomError = ''
    let prenomError = ''

    let { isPro, denom, siret, nom, prenom, phone, email, password } = this.state

    if (isPro) {
      denomError = nameValidator(denom.value, '"Dénomination sociale"')
      siretError = nameValidator(siret.value, 'Siret')
    }

    else {
      nomError = nameValidator(nom.value, '"Nom"')
      prenomError = nameValidator(prenom.value, '"Prénom"')
    }

    const phoneError = nameValidator(this.state.phone.value, '"Téléphone"')
    const addressError = nameValidator(this.state.address.description, '"Adresse"')
    const emailError = emailValidator(email.value)
    const passwordError = passwordValidator(password.value)

    if (denomError || siretError || nomError || prenomError || phoneError || addressError || emailError || passwordError) {

      phone.error = phoneError
      email.error = emailError
      password.error = passwordError

      if (isPro) {
        denom.error = denomError
        siret.error = siretError
        this.setState({ denom, siret, phone, addressError, email, password, loading: false })
      }

      else {
        nom.error = nomError
        prenom.error = prenomError
        this.setState({ nom, prenom, phone, addressError, email, password, loading: false })
      }

      Keyboard.dismiss()

      setToast(this, 'e', 'Erreur de saisie, veuillez verifier les champs.')

      return false
    }

    return true
  }

  //#task
  //check commented code on bottom of this page
  //should handle the following case: adding a user which has been previously deleted.
  //users are not deleted but only deleted field is set to false
  addUser = async (uid, overWrite) => {
    let { role, isPro, error, loading } = this.state
    let { userId, nom, prenom, address, phone, email, password } = this.state
    let { denom, siret } = this.state
    
    const { isConnected } = this.props.network

    //1. Validate inputs
    const isValid = await this.validateInputs()
    if (!isValid) return

    // if (overWrite) {
    //   var accountDeleted = await this.deleteUserAccount(uid)
    //   if (!accountDeleted) {
    //     setToast(this, 'e', "Erreur lors de l'écrasement de l'ancien utilisateur...")
    //     return
    //   }
    // }

    load(this, true)
    this.title = "Création de l'utilisateur"
    //2. ADDING USER DOCUMENT
    let user = {
      address: address,
      phone: phone.value,
      email: email.value.toLowerCase(),
      role: role,
      hasTeam: false,
      password: password.value,
      deleted: false
    }

    if (isPro) {
      user.denom = denom.value
      user.siret = siret.value
      user.isPro = true
      user.fullName = denom.value
    }

    else if (!isPro) {
      user.nom = nom.value
      user.prenom = prenom.value
      user.isPro = false
      user.fullName = prenom.value + ' ' + nom.value
    }

    if (role === 'Client')
      user.isClient = true
    else
      user.isClient = false

    if (!isConnected) this.props.navigation.navigate(this.prevScreen)

    console.log('Ready to add user...')
    await db.collection('newUsers').doc(userId).set(user).catch(e => handleFirestoreError(e))
    setTimeout(() => { //wait for a triggered cloud function to end (creating user...)
      load(this, false)
      this.title = "Créer un utilisateur"
      this.props.navigation.navigate(this.prevScreen)
    }
      , 6000) //We can reduce this timeout later on...


  }

  refreshAddress(address) {
    this.setState({ address, addressError: '' })
  }

  render() {
    let { role, isPro, error, loading } = this.state
    let { userId, nom, prenom, address, addressError, phone, email, password } = this.state
    let { denom, siret } = this.state

    const showUserTypeRadio = (role === 'Poseur' || role === 'Client')
    const roles = this.configRolesPicker()

    console.log('roles', roles)

    return (
      <View style={{ flex: 1 }}>
        <Appbar back={!loading} close title titleText={this.title} check={!loading} handleSubmit={this.addUser} />

        {loading ?
          <Loading size='large' />
          :
          <ScrollView style={styles.container} contentContainerStyle={{ backgroundColor: '#fff', padding: constants.ScreenWidth * 0.05 }}>
            <MyInput
              label="Identifiant utilisateur"
              value={userId}
              editable={false}
              style={{ marginBottom: 15 }}
              disabled
            />

            {roles &&
              <Picker
                label="Rôle"
                returnKeyType="next"
                value={this.state.role}
                error={!!role.error}
                errorText={role.error}
                selectedValue={this.state.role}
                onValueChange={(role) => this.setState({ role })}
                title="Type d'utilisateur"
                elements={roles}
              />
            }

            {showUserTypeRadio && <RadioButton checked={this.state.checked}
              firstChoice={{ title: 'Particulier', value: 'Particulier' }}
              secondChoice={{ title: 'Professionnel', value: 'Professionnel' }}
              onPress1={() => this.setState({ checked: 'first', isPro: false })}
              onPress2={() => this.setState({ checked: 'second', isPro: true })}
              style={{ justifyContent: 'space-between', marginVertical: 5 }} />}

            {!isPro &&
              <MyInput
                label="Prénom"
                returnKeyType="done"
                value={prenom.value}
                onChangeText={text => updateField(this, prenom, text)}
                error={!!prenom.error}
                errorText={prenom.error}
              />}

            <MyInput
              label={isPro ? 'Dénomination sociale' : 'Nom'}
              returnKeyType="next"
              value={isPro ? denom.value : nom.value}
              onChangeText={text => {
                if (isPro)
                  updateField(this, denom, text)
                else
                  updateField(this, nom, text)
              }}
              error={isPro ? !!denom.error : !!nom.error}
              errorText={isPro ? denom.error : nom.error}
            />

            {isPro &&
              <MyInput
                label='Numéro siret'
                returnKeyType="next"
                value={siret.value}
                onChangeText={text => updateField(this, siret, text)}
                error={!!siret.error}
                errorText={siret.error}
                render={props => <TextInputMask {...props} mask="[000] [000] [000] [00000]" />}
              />}

            <TouchableOpacity onPress={() => this.props.navigation.navigate('Address', { onGoBack: this.refreshAddress, title: "Adresse de l'utilisateur", currentAddress: this.state.address })}>
              <MyInput
                label="Adresse"
                returnKeyType="done"
                value={address.description}
                autoCapitalize="none"
                multiline={true}
                editable={false}
                error={!!addressError}
                errorText={addressError}
              />
            </TouchableOpacity>

            <MyInput
              label="Téléphone"
              returnKeyType="done"
              value={phone.value}
              onChangeText={text => updateField(this, phone, text)}
              error={!!phone.error}
              errorText={phone.error}
              textContentType='telephoneNumber'
              keyboardType='phone-pad'
              dataDetectorTypes='phoneNumber'
              render={props => <TextInputMask {...props} mask="+33 [0] [00] [00] [00] [00]" />} />

            <MyInput
              label="Email"
              returnKeyType="next"
              value={email.value}
              onChangeText={text => updateField(this, email, text)}
              error={!!email.error}
              errorText={email.error}
              autoCapitalize="none"
              autoCorrect={false}
              autoCompleteType="email"
              textContentType="emailAddress"
              keyboardType="email-address"
            />

            <MyInput
              label="Mot de passe"
              returnKeyType="done"
              value={password.value}
              onChangeText={text => updateField(this, password, text)}
              error={!!password.error}
              errorText={password.error}
              autoCapitalize="none"
              secureTextEntry={!password.show}
              right={<TextInput.Icon name={password.show ? 'eye-off' : 'eye'} color={theme.colors.placeholder} onPress={() => {
                password.show = !password.show
                this.setState({ password })
              }} />}
            />

            <Toast message={error} onDismiss={() => this.setState({ error: '' })} />

          </ScrollView >
        }
      </View>
    )
  }
}

const mapStateToProps = (state) => {

  return {
    role: state.roles.role,
    network: state.network
    //fcmToken: state.fcmtoken
  }
}

export default connect(mapStateToProps)(CreateUser)

const styles = StyleSheet.create({
})



  //#BETA
  // async isUserArchived() {
  //   const { email } = this.state
  //   let userId = ''
  //   const query = db.collection('DeletedUsers').where('email', '==', email.value)
  //   const userExists = await query.get().then((querysnapshot) => {
  //     if (querysnapshot.empty) {
  //       return false
  //     }

  //     else {
  //       querysnapshot.forEach((doc) => { userId = doc.id })
  //       return true
  //     }
  //   })

  //   if (userExists) {
  //     Alert.alert(
  //       "Restauration d'un utilisateur",
  //       `Un utilisateur associé à l'adresse email ${email.value} existe déjà parmi les utilisateurs supprimés (archivés). Voulez vous réactiver son compte ou bien créer un nouvel utilisateur ?`,
  //       [
  //         { text: "Créer un nouvel utilisateur", onPress: () => this.addUser(userId, true) }, //addUser(userId, overwrite)
  //         { text: "Restaurer l'ancien utilisateur", onPress: () => this.restoreUser(userId) },
  //         { text: 'Annuler', style: 'cancel' },
  //       ],
  //     )

  //     return true
  //   }

  //   else this.addUser('', false)
  // }

  // async deleteUserAccount(userId) {
  //   const deleteUserAccount = functions.httpsCallable('deleteUserAccount')
  //   const result = await deleteUserAccount({ userId: userId })
  //   if (result.err) return false
  //   return true
  // }

  // async restoreUser(userId) {
  //   load(this, true)

  //   const batch = db.batch()

  //   //2. Update User
  //   const userRef = db.collection('Users').doc(userId)
  //   batch.update(userRef, { deleted: false }) //handle user reactivation..

  //   //3. Set Deleted user
  //   const dltUserRef = db.collection('DeletedUsers').doc(userId)
  //   batch.delete(dltUserRef)

  //   await batch.commit()
  //   this.props.navigation.navigate(this.prevScreen)
  // }