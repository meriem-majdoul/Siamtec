import React, { Component } from "react";
import { View, StyleSheet, ScrollView, Keyboard, KeyboardAvoidingView, Platform } from "react-native";
import { TextInput } from 'react-native-paper'
import TextInputMask from 'react-native-text-input-mask';
import { connect } from 'react-redux'

import moment from 'moment'
import 'moment/locale/fr'
moment.locale('fr')

import Appbar from "../../components/Appbar"
import AddressInput from "../../components/AddressInput"
import Loading from "../../components/Loading"
import Picker from "../../components/Picker"
import RadioButton from "../../components/RadioButton"
import MyInput from "../../components/TextInput"
import Toast from "../../components/Toast"
import LoadDialog from "../../components/LoadDialog"
import { Button, CustomIcon } from "../../components";

import { auth, db } from '../../firebase'
import * as theme from "../../core/theme";
import { constants, errorMessages, roles as allRoles } from "../../core/constants";
import { nameValidator, emailValidator, passwordValidator, generateId, updateField, setToast, load, setAddress, displayError } from "../../core/utils"
import { checkEmailExistance } from "../../api/auth-api";
import { faMagic } from "react-native-vector-icons/FontAwesome5";
import { validateUserInputs, formatNewUser, createUser } from "../../api/firestore-api";
import { setAppToast } from "../../core/redux";

const rolesPicker = {
  3: [
    { label: 'Admin', value: 'Admin' },
    { label: 'Service commercial', value: 'Service commercial' },
    { label: "Chargé d'affaires", value: "Chargé d'affaires" },
    { label: 'Service technique', value: 'Service technique' },
    { label: 'Équipe technique', value: 'Équipe technique' },
    { label: 'Back office', value: 'Back office' },
    //{ label: "Bureau d'étude", value: "Bureau d'étude" },
  ],
  2: [
    { label: "Chargé d'affaires", value: "Chargé d'affaires" },
    { label: 'Équipe technique', value: 'Équipe technique' },
  ],
  1: [], 
  0: []
}

class CreateUser extends Component {
  constructor(props) {
    super(props)

    this.handleSubmit = this.handleSubmit.bind(this)
    this.refreshAddress = this.refreshAddress.bind(this)
    this.setAddress = setAddress.bind(this)

    const { route } = this.props;
    const { prevScreen } = route.params || {};

    // Assignation de prevScreen avec une valeur par défaut
    this.prevScreen = prevScreen || 'UsersManagement';
    this.title = 'Créer un utilisateur'
    this.role = this.props.role.id
    this.userId = generateId('GS-US-')

    this.state = {
      userId: this.userId,
      role: "Chargé d'affaires",
      checked: 'first', //professional/Particular
      isPro: false,
      nom: { value: '', error: '' },
      prenom: { value: '', error: '' },
      denom: { value: "", error: "" },
      siret: { value: "", error: "" },
      address: { description: '', place_id: '', marker: { latitude: '', longitude: '' } },
      addressError: '',
      email: { value: "", error: "" },
      email2: { value: "", error: "" },
      //"poseur123456@eqx-software.com"
      phone: { value: "", error: '' },
      password: { value: '', error: '', show: false },

      userType: "utilisateur",

      loading: false,
      loadingDialog: false,
      error: "",
      toastType: '',
      toastMessage: '',
    }
  }

  validateInputs() {
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
        this.setState({ denom, siret, phone, email, password, addressError })
      }

      else {
        nom.error = nomError
        prenom.error = prenomError
        this.setState({ nom, prenom, phone, email, password, addressError })
      }
      setToast(this, 'e', 'Erreur de saisie, veuillez verifier les champs.')
      return false
    }

    return true
  }

  async handleSubmit(uid, overWrite) {
    Keyboard.dismiss()

    this.setState({ loadingDialog: true })

    //1. Verify
    const { isValid, updateErrors } = validateUserInputs(this.state) //#readyToExternalize
    if (!isValid) {
      this.setState(updateErrors)
      setToast(this, 'e', 'Erreur de saisie, veuillez verifier les champs.')
      return
    }

    //2. Format user
    const user = formatNewUser(this.state)
    const { isConnected } = this.props.network

    //3. Create user doc
    const response = await createUser(user, isConnected) //#readyToExternalize
    const { error } = response

    if (error) {
      this.setState({ loadingDialog: false })
      displayError(error)
    }

    else {
      const { navigation } = this.props
      if (navigation.state.params && navigation.state.params.onGoBack) {
        navigation.state.params.onGoBack()
      }
      this.setState({ loadingDialog: false }, () => {
        const toast = { message: "L'utilisateur a été crée !", type: "info" }
        setAppToast(this, toast)
        navigation.navigate(this.prevScreen)
      })
    }
  }

  refreshAddress(address) {
    this.setState({ address, addressError: '' })
  }

  render() {
    let { role, isPro, error, loading, loadingDialog, toastType, toastMessage } = this.state
    let { nom, prenom, address, addressError, phone, email, password } = this.state
    let { denom, siret } = this.state
    const { isConnected } = this.props.network

    const showUserTypeRadio = (role === 'Équipe technique' || role === 'Client')
    const roleLevel = this.props.role.level
    const roles = rolesPicker[roleLevel]

    return (
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <Appbar
          close={!loading}
          title
          titleText={this.title}
        // check={!loading}
        // handleSubmit={this.handleSubmit}
        />

        {loading ?
          <Loading size='large' />
          :
          <ScrollView
            keyboardShouldPersistTaps="never"
            style={{ backgroundColor: theme.colors.white }}
            contentContainerStyle={{ backgroundColor: '#fff', padding: theme.padding }}
          >
            <KeyboardAvoidingView
              style={{ flex: 1 }}
              behavior={Platform.OS === "ios" ? 'padding' : null}
              keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
            >

              <MyInput
                label="Identifiant utilisateur"
                value={this.userId}
                editable={false}
                disabled
              />

              {roles &&
                <Picker
                  label="Rôle *"
                  returnKeyType="next"
                  value={this.state.role}
                  error={!!role.error}
                  errorText={role.error}
                  selectedValue={this.state.role}
                  onValueChange={(role) => this.setState({ role })}
                  title="Type d'utilisateur *"
                  elements={roles}
                />
              }

              {showUserTypeRadio &&
                <RadioButton
                  checked={this.state.checked}
                  firstChoice={{ title: 'Particulier', value: 'Particulier' }}
                  secondChoice={{ title: 'Professionnel', value: 'Professionnel' }}
                  onPress1={() => this.setState({ checked: 'first', isPro: false })}
                  onPress2={() => this.setState({ checked: 'second', isPro: true })}
                  style={{ justifyContent: 'space-between', marginTop: 20 }}
                />
              }

              {!isPro &&
                <MyInput
                  label="Prénom *"
                  returnKeyType="done"
                  value={prenom.value}
                  onChangeText={text => updateField(this, prenom, text)}
                  error={!!prenom.error}
                  errorText={prenom.error}
                />
              }

              <MyInput
                label={isPro ? 'Dénomination sociale *' : 'Nom *'}
                returnKeyType="next"
                value={isPro ? denom.value : nom.value}
                onChangeText={text => {
                  const name = isPro ? denom : nom
                  updateField(this, name, text)
                }}
                error={isPro ? !!denom.error : !!nom.error}
                errorText={isPro ? denom.error : nom.error}
              />

              <AddressInput
                label='Adresse postale'
                offLine={!isConnected}
                onPress={() => this.props.navigation.navigate('Address', { onGoBack: this.refreshAddress })}
                address={address}
                onChangeText={this.setAddress}
                clearAddress={() => this.setAddress('')}
                addressError={addressError}
                isEdit={false}
              />

              {isPro &&
                <MyInput
                  label='Numéro siret *'
                  returnKeyType="next"
                  value={siret.value}
                  onChangeText={text => updateField(this, siret, text)}
                  error={!!siret.error}
                  errorText={siret.error}
                  render={props => <TextInputMask {...props} mask="[000] [000] [000] [00000]" />}
                />}

              <MyInput
                label="Téléphone *"
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
                label="Email *"
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
                label="Mot de passe *"
                returnKeyType="done"
                value={password.value}
                onChangeText={text => updateField(this, password, text)}
                error={!!password.error}
                errorText={password.error}
                autoCapitalize="none"
                // secureTextEntry={!password.show}
                right={
                  <TextInput.Icon
                    name={<CustomIcon icon={faMagic} color={theme.colors.inpuIcon} />}
                    color={theme.colors.secondary}
                    onPress={() => {
                      const password = { value: generateId('', 6), error: "" }
                      this.setState({ password })
                    }}
                  />
                }
                editable={false}
              />

              <Toast
                message={toastMessage}
                type={toastType}
                onDismiss={() => this.setState({ toastMessage: '' })} />

              <LoadDialog loading={loadingDialog} message="Création de l'utilisateur en cours..." />

            </KeyboardAvoidingView>
          </ScrollView >
        }

        <Button
          mode="contained"
          onPress={this.handleSubmit}
          backgroundColor={theme.colors.primary}
          containerStyle={{ alignSelf: 'flex-end', marginTop: 25, marginRight: theme.padding }}>
          Valider
        </Button>
      </View>
    )
  }
}

const mapStateToProps = (state) => {

  return {
    role: state.roles.role,
    network: state.network,
    currentUser: state.currentUser
    //fcmToken: state.fcmtoken
  }
}

export default connect(mapStateToProps)(CreateUser)

const styles = StyleSheet.create({
})


