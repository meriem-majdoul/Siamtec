import React, { memo, Component } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Background from "../../../components/Background";
import Logo from "../../../components/Logo";
import Header from "../../../components/Header";
import Button from "../../../components/Button";
import TextInput from "../../../components/TextInput";
import * as theme from "../../../core/theme";
import { constants } from "../../../core/constants";
import { emailValidator, passwordValidator, updateField, myAlert } from "../../../core/utils";
import { signUpUser, createUserDocument } from "../../../api/auth-api";
import Toast from "../../../components/Toast";
import firebase from '@react-native-firebase/app';

import Appbar from "../../../components/Appbar"

const initialState = {
  email: { value: "", error: "" },
  password: { value: "", error: "" },
  loading: false,
  error: ""
}

class RegisterScreen extends Component {
  constructor(props) {
    super(props)
    this.signUp = this.signUp.bind(this)
    this.checkAuthorization = this.checkAuthorization.bind(this)
    this.myAlert = myAlert.bind(this)

    this.state = {
      synuid: '',
      email: { value: "", error: "" },
      password: { value: "", error: "" },
      loading: false,
      error: ""
    }
  }


  async fetchSynUid() {
    await firebase.firestore().collection('Users').where('email', '==', this.state.email.value.toLowerCase()).get()
      .then((querysnapshot) => {
        if (!querysnapshot.empty) {
          let synuid = querysnapshot.docs[0].id
          this.setState({ synuid }, () => console.log("3"))
        }
      })
  }

  checkAuthorization() {
    const db = firebase.firestore()
    console.log('checking authorization')

    db.collection('AuthorizedUsers').where('email', '==', this.state.email.value.toLowerCase()).get().then(async (querysnapshot) => {
      if (!querysnapshot.empty) {
        console.log('sign up...')
        await this.fetchSynUid()
        await this.signUp()
      }

      else {
        const title = "Email non autorisé"
        const message = "Votre adresse email ne semble pas être autorisée à créer un compte. Veuillez contacter l'administrateur"
        const handleConfirm = () => this.setState(initialState)

        this.myAlert(title, message, handleConfirm)
      }
    })
  }

  signUp = async () => {
    let { loading, synuid, email, password, error } = this.state

    if (loading) return;

    console.log(this.state.synuid)
    console.log(this.state.email)
    console.log(this.state.password)

    const emailError = emailValidator(email.value);
    const passwordError = passwordValidator(password.value);

    if (emailError || passwordError) {
      this.setState({ ...email, error: emailError });
      this.setState({ ...password, error: passwordError });
      return;
    }

    this.setState({ loading: true });

    const response1 = await signUpUser({
      synuid: synuid,
      email: email.value,
      password: password.value
    })

    // console.log(response1)
    // console.log(response1)

    if (response1.error) {
      console.log('!!!!!!!!!!!!')
      this.setState({ error: response1.error });
    }

    //Link to the existing document created by admin
    // else {
    //   const response2 = await createUserDocument({
    //     email: email.value,
    //     docId: response1.id
    //   })

    //   if (response2.error) {
    //     this.setState({ error: response2.error });
    //   }
    // }

    this.setState({ loading: false })
  }

  render() {
    let { loading, email, password, error } = this.state
    const ratio = 332 / 925
    const width = constants.ScreenWidth * 0.5
    const height = width * ratio

    return (
      <View style={{ flex: 1 }}>
        <Appbar white />
        <View style={styles.container}>
          <Logo style={{ width: width, height: height, marginBottom: 0 }} />

          <TextInput
            label="Email"
            returnKeyType="next"
            value={email.value}
            onChangeText={text => updateField(this, email, text)}
            error={!!email.error}
            errorText={email.error}
            autoCapitalize="none"
            autoCompleteType="email"
            textContentType="emailAddress"
            keyboardType="email-address"
          />

          <TextInput
            label="Mot de passe"
            returnKeyType="done"
            value={password.value}
            onChangeText={text => updateField(this, password, text)}
            error={!!password.error}
            errorText={password.error}
            secureTextEntry
            autoCapitalize="none"
          />

          <Button
            loading={loading}
            mode="contained"
            onPress={this.checkAuthorization}
            style={styles.button}
          >
            S'inscrire
        </Button>

          <View style={styles.row}>
            <Text style={styles.label}>Vous avez déjà un compte? </Text>
            <TouchableOpacity onPress={() => this.props.navigation.navigate("LoginScreen")}>
              <Text style={styles.link}>Se connecter</Text>
            </TouchableOpacity>
          </View>

          <Toast message={error} onDismiss={() => this.setState({ error: '' })} />
        </View >

      </View>

    )
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingLeft: constants.ScreenWidth * 0.07,
    paddingRight: constants.ScreenWidth * 0.07,
    //justifyContent: 'center',
    alignItems: 'center'
  },
  label: {
    color: theme.colors.secondary
  },
  button: {
    marginTop: 24
  },
  row: {
    flexDirection: "row",
    marginTop: 4
  },
  link: {
    fontWeight: "bold",
    color: theme.colors.primary
  }
});

export default memo(RegisterScreen);
