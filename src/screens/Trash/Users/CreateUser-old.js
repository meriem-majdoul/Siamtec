import React, { Component } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from "react-native";
import firebase from '@react-native-firebase/app';
import TextInputMask from 'react-native-text-input-mask';

import Appbar from "../../components/Appbar";
import Picker from "../../components/Picker";
import RadioButton from "../../components/RadioButton";
import TextInput from "../../components/TextInput";
import Toast from "../../components/Toast";

import * as theme from "../../core/theme";
import { constants } from "../../core/constants";
import { generateId, updateField } from "../../core/utils";
import { emailValidator, passwordValidator, nameValidator } from "../../core/utils";
import { signInUser, createUserDocument } from "../../api/auth-api";

const roles = [
  { label: 'Directeur commercial', value: 'Directeur commercial' },
  { label: 'Commercial', value: 'Commercial' },
  { label: 'Responsable technique', value: 'Responsable technique' },
  { label: 'Poseur', value: 'Poseur' },
  { label: 'Client', value: 'Client' }
]

const db = firebase.firestore()

class CreateUser extends Component {
  constructor(props) {
    super(props)
    this.addUser = this.addUser.bind(this)
    this.refreshAddress = this.refreshAddress.bind(this)

    this.state = {
      userId: { value: '', error: '' }, //Not editable
      role: 'Directeur commercial',
      nom: { value: '', error: '' },
      prenom: { value: '', error: '' },
      address: { description: 'a', place_id: 'b' },
      email: { value: "", error: "" },
      phone: { value: '', error: '' },
      password: { value: "", error: "" },

      denominationSociale: { value: "", error: "" },
      siret: { value: "", error: "" },

      loading: false,
      checked: 'first',
      isPro: false,
      error: "",

      idCount: 0
    }
  }

  async componentDidMount() {
    //Generate user id (should handle unicity in case of multiple admins / multiple users added same time)
    await generateId(this, this.state.userId, 'users', 'users', 'Synergys-utilisateur-')
  }

  componentWillUnmount() {
    this.unsubscribe()
  }

  // validateInputs() {
  // //1. INPUTS VALIDATION
  // let nomError = ''
  // let prenomError = ''
  // let denominationSocialeError = ''
  // let siretError = ''

  // //Inputs validation (particulier)
  // if (!isPro) {
  //   nomError = nameValidator(nom.value, 'Nom')
  //   prenomError = nameValidator(prenom.value, 'Prénom')
  // }

  // //Inputs validation (pro)
  // else {
  //   denominationSocialeError = nameValidator(denominationSociale.value, 'Dénomination sociale')
  //   siretError = nameValidator(siret.value, 'Siret')
  // }

  // //Inputs validation (both)
  // const addressError = nameValidator(address.description, 'Adresse')
  // const phoneError = nameValidator(phone.value, 'Téléphone')
  // const emailError = emailValidator(email.value)
  // // const passwordError = passwordValidator(password.value)

  // if (nomError || prenomError || denominationSocialeError || siretError || addressError || phoneError || emailError) {
  //   this.setState({ ...nom, error: nomError })
  //   this.setState({ ...prenom, error: prenomError })
  //   this.setState({ ...denominationSociale, error: denominationSocialeError })
  //   this.setState({ ...siret, error: siretError })
  //   this.setState({ ...address, error: addressError })
  //   this.setState({ ...phone, error: phoneError })
  //   this.setState({ ...email, error: emailError })
  //   return;
  // }

  // this.setState({ loading: true });
  // }

  addUser = async () => {
    let { role, isPro, error, loading } = this.state
    let { idCount, userId, nom, prenom, address, phone, email, password } = this.state
    let { denominationSociale, siret } = this.state

    if (loading) return

    //1. Validate inputs
    //this.validateInputs()

    //2. ADDING USER DOCUMENT
    let user = {
      address: address,
      phone: phone.value,
      email: email.value.toLowerCase(),
      role: role,
      hasTeam: false
    }

    if (isPro) {
      user.denom = denominationSociale.value
      user.siret = siret.value
      user.isPro = true
    }

    else if (!isPro) {
      user.nom = nom.value
      user.prenom = prenom.value
      user.isPro = false
    }

    console.log('Ready to add user...')

    db.collection('Users').doc(userId.value).set(user)
      .then(() => {
        db.collection('IdCounter').doc('users').update({ users: idCount }).then(() => {
          db.collection('AuthorizedUsers').doc().set({ email: email.value }).then(() =>
            this.props.navigation.goBack()
          )
        })
          .catch((e) => this.setState({ error: e }))
      })
      .catch((e) => this.setState({ error: e }))
      .finally(() => this.setState({ loading: false }))
  }

  refreshAddress(address) {
    this.setState({ address })
  }


  render() {
    let { role, isPro, error, loading } = this.state
    let { userId, nom, prenom, address, phone, email, password } = this.state
    let { denominationSociale, siret } = this.state

    let showUserType = (role === 'Poseur' || role === 'Client')

    return (
      <View style={{ flex: 1 }}>
        <Appbar back close title titleText='Créer un utilisateur' check handleSubmit={this.addUser} />
        <ScrollView style={styles.container} contentContainerStyle={{ backgroundColor: '#fff', padding: constants.ScreenWidth * 0.09 }}>

          <TextInput
            label="Identifiant utilisateur"
            value={userId.value}
            editable={false}
            style={{ marginBottom: 15 }}
          />

          <Picker
            label="Rôle"
            returnKeyType="next"
            value={this.state.role}
            error={!!role.error}
            errorText={role.error}
            selectedValue={this.state.role}
            onValueChange={(role) => this.setState({ role }, () => console.log('ROLE: ' + this.state.role))}
            title="Type d'utilisateur"
            elements={roles}
          />

          {showUserType && <RadioButton checked={this.state.checked}
            onPress1={() => this.setState({ checked: 'first', isPro: false })}
            onPress2={() => this.setState({ checked: 'second', isPro: true })} />}

          <TextInput
            label={isPro ? 'Dénomination sociale' : 'Nom'}
            returnKeyType="next"
            value={isPro ? denominationSociale.value : nom.value}
            onChangeText={text => {
              if (isPro)
                updateField(this, denominationSociale, text)
              else
                updateField(this, nom, text)
            }}
            error={isPro ? !!denominationSociale.error : !!nom.error}
            errorText={isPro ? denominationSociale.error : nom.error}
          />

          {!isPro &&
            <TextInput
              label="Prénom"
              returnKeyType="done"
              value={prenom.value}
              onChangeText={text => updateField(this,prenom, text)}
              error={!!prenom.error}
              errorText={prenom.error}
            />}

          {isPro &&
            <TextInput
              label='Numéro siret'
              returnKeyType="next"
              value={siret.value}
              onChangeText={text => updateField(this, siret, text)}
              error={!!siret.error}
              errorText={siret.error}
              render={props =>
                <TextInputMask
                  {...props}
                  mask="[000] [000] [000] [00000]"
                />
              }
            />}

          <TextInput
            label="Adresse"
            returnKeyType="done"
            value={address.description}
            onFocus={() => this.props.navigation.navigate('Address', { onGoBack: this.refreshAddress, title: "Adresse de l'utilisateur" })}
            error={!!address.error}
            errorText={address.error}
            autoCapitalize="none"
          />

          <TextInput
            label="Téléphone"
            returnKeyType="done"
            value={phone.value}
            // onChangeText={(text) => this.onTextChange(text)}
            onChangeText={text => updateField(this, phone, text)}
            error={!!phone.error}
            errorText={phone.error}
            textContentType='telephoneNumber'
            keyboardType='phone-pad'
            dataDetectorTypes='phoneNumber'
            render={props =>
              <TextInputMask
                {...props}
                mask="+33 [0] [00] [00] [00] [00]"
              />
            } />

          <TextInput
            label="Email"
            returnKeyType="next"
            value={email.value}
            onChangeText={text => {
              email.value = text
              email.error = ""
              this.setState({ email })
            }}
            error={!!email.error}
            errorText={email.error}
            autoCompleteType="email"
            textContentType="emailAddress"
            keyboardType="email-address"
          />

          <Toast message={error} onDismiss={() => this.setState({ error: '' })} />
        </ScrollView >
      </View>
    )
  }
};

const styles = StyleSheet.create({
})

export default CreateUser