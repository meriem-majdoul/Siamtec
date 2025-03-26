import React, { Component } from "react";
import { TouchableOpacity, StyleSheet, Text, View, Keyboard, ActivityIndicator, SafeAreaView } from "react-native";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { TextInput as paperInput } from 'react-native-paper'
import LinearGradient from 'react-native-linear-gradient'
import { connect } from 'react-redux'

import moment from 'moment';
import 'moment/locale/fr'
moment.locale('fr')

import Appbar from "../../components/Appbar"
import NewBackground from "../../components/NewBackground"
import Logo from "../../components/Logo"
import Button from "../../components/Button"
import TextInput from "../../components/TextInput"

import * as theme from "../../core/theme";
import { emailValidator, passwordValidator, updateField, load } from "../../core/utils";
import { constants } from '../../core/constants'
import { loginUser } from "../../api/auth-api";
import Toast from "../../components/Toast";
import { setAppToast } from "../../core/redux";

class LoginScreen extends Component {
  constructor(props) {
    super(props)
    this.handleLogin = this.handleLogin.bind(this)
    this.forgotPassword = this.forgotPassword.bind(this)

    this.state = {
      email: { value: "", error: "" },
      password: { value: "", error: "", show: false },
      loading: false,
      error: ""
    }
  }

  //Re-initialize inputs
  reinitializeInputs() {
    let { email, password } = this.state
    email = { value: "", error: "" }
    password = { value: "", error: "", show: false }
    this.setState({ email, password }, () => Keyboard.dismiss())
  }

  validateInputs() {
    const { email, password } = this.state
    const emailError = emailValidator(email.value)
    const passwordError = passwordValidator(password.value)


    if (emailError) {
      this.setState({ ...email, error: emailError })
      return false
    }

    if (passwordError) {
      this.setState({ ...password, error: passwordError })
      return false
    }

    return true
  }

  handleLogin = async () => {
    Keyboard.dismiss()

    let { loading, email, password, error } = this.state
    if (loading) return
    load(this, true)

    //Inputs validation
    const isValid = this.validateInputs()
    if (!isValid) {
      load(this, false)
      return
    }

    console.log("Starting logging...", moment().format('HH:mm:ss'))
    const response = await loginUser({ email: email.value, password: password.value })

    if (response.error) {
      this.setState({ loading: false })
      const toast = { message: response.error, type: "error" }
      setAppToast(this, toast)
    }

    else console.log("Logged in at", moment().format('HH:mm:ss'))
  }

  forgotPassword() {
    if (this.state.loading) return
    this.props.navigation.navigate("ForgotPasswordScreen")
  }

  render() {
    let { loading, email, password, error } = this.state
    const ratio = 332 / 925
    const width = constants.ScreenWidth * 0.5
    const height = width * ratio

    return (

      <NewBackground>

        <View style={styles.container}>

          <Logo />

          <View>
            <TextInput
              style={styles.credInput}
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
              editable={!loading}
            />

            <TextInput
              style={styles.credInput}
              label="Mot de passe"
              returnKeyType="done"
              value={password.value}
              onChangeText={text => updateField(this, password, text)}
              error={!!password.error}
              errorText={password.error}
              secureTextEntry={!password.show}
              autoCapitalize="none"
              editable={!loading}
              right={<paperInput.Icon name={password.show ? 'eye-off' : 'eye'} color={theme.colors.secondary} onPress={() => {
                password.show = !password.show
                this.setState({ password })
              }} />}
            />

          </View>

          <View style={styles.forgotPassword}>
            <TouchableOpacity onPress={this.forgotPassword}>
              <Text style={[theme.customFontMSregular.caption, styles.forgetPasswordLink]}>Mot de passe oublié ?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.loginButton} onPress={this.handleLogin}>
            <LinearGradient start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} colors={['#33a979', '#58cb7e', '#6edd81']} style={styles.linearGradient}>
              {loading && <ActivityIndicator size='small' color={theme.colors.white} style={{ marginRight: 10 }} />}
              <Text style={[theme.customFontMSmedium.header, { color: '#fff', letterSpacing: 1, marginRight: 10 }]}>Se connecter</Text>
            </LinearGradient>
          </TouchableOpacity>

        </View>

      </NewBackground >

    )

  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: constants.ScreenWidth * 0.1,
    paddingTop: constants.ScreenWidth * 0.1,
  },
  credInput: {
    marginVertical: 0,
    zIndex: 1,
    backgroundColor: theme.colors.background
  },
  synergys: {
    textAlign: 'center',
    color: '#fff',
    marginVertical: 15,
    letterSpacing: 2
  },
  forgotPassword: {
    width: "100%",
    alignItems: "flex-end",
    marginTop: theme.padding,
  },
  row: {
    flexDirection: "row",
    marginTop: 4
  },
  label: {
    color: theme.colors.secondary
  },
  link: {
    fontWeight: "bold",
    color: theme.colors.primary
  },
  linearGradient: {
    flexDirection: 'row',
    height: 50,
    width: constants.ScreenWidth * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5
  },
  forgetPasswordLink: {
    color: theme.colors.gray_dark,
    zIndex: 1,
  },
  loginButton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    zIndex: 1
  }
})


const mapStateToProps = (state) => {

  return {
    role: state.roles.role,
    network: state.network,
    currentUser: state.currentUser
    //fcmToken: state.fcmtoken
  }
}

export default connect(mapStateToProps)(LoginScreen)
