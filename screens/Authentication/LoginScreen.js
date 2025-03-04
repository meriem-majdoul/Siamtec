import React, { memo, Component } from "react";
import { TouchableOpacity, StyleSheet, Text, View, Keyboard } from "react-native";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { TextInput as paperInput } from 'react-native-paper'

import Appbar from "../../components/Appbar";
import Background from "../../components/Background";
import Logo from "../../components/Logo";
import Header from "../../components/Header";
import Button from "../../components/Button";
import TextInput from "../../components/TextInput";

import * as theme from "../../core/theme";
import { emailValidator, passwordValidator, updateField, load } from "../../core/utils";
import { constants } from '../../core/constants'
import { loginUser } from "../../api/auth-api";
import Toast from "../../components/Toast";

class LoginScreen extends Component {
  constructor(props) {
    super(props)
    this.handleLogin = this.handleLogin.bind(this)

    this.state = {
      email: { value: "", error: "" },
      password: { value: "", error: "", show: false },
      loading: false,
      error: ""
    }
  }

  //Re-initialize inputs
  componentWillUnmount() {
    let { email, password } = this.state
    email = { value: "", error: "" }
    password = { value: "", error: "", show: false }
    this.setState({ email, password }, () => Keyboard.dismiss())
  }

  handleLogin = async () => {
    let { loading, email, password, error } = this.state

    if (loading) return

    load(this, true)

    //Inputs validation
    const emailError = emailValidator(email.value)
    const passwordError = passwordValidator(password.value)

    if (emailError) {
      this.setState({ ...email, error: emailError })
      load(this, false)
      return
    }

    if (passwordError) {
      this.setState({ ...password, error: passwordError })
      load(this, false)
      return
    }

    const response = await loginUser({ email: email.value, password: password.value })

    if (response.error) {
      load(this, false)
      this.setState({ error: response.error })
    }
  }

  render() {
    let { loading, email, password, error } = this.state
    const ratio = 332 / 925
    const width = constants.ScreenWidth * 0.5
    const height = width * ratio

    return (
      <Background>
        <TouchableOpacity onPress={() => this.props.navigation.goBack()} style={{ position: 'absolute', top: 15, left: 20 }} >
          <Icon name="arrow-left" size={24} color='#fff' />
        </TouchableOpacity>

        <Text style={[theme.customFontMSregular.h1, styles.synergys]}>SYNERGYS</Text>

        <TextInput
          style={{ marginVertical: 0 }}
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
          whiteTheme
        />

        <TextInput
          style={{ marginVertical: 0 }}
          label="Mot de passe"
          returnKeyType="done"
          value={password.value}
          onChangeText={text => updateField(this, password, text)}
          error={!!password.error}
          errorText={password.error}
          secureTextEntry={!password.show}
          autoCapitalize="none"
          whiteTheme
          right={<paperInput.Icon name={password.show ? 'eye-off' : 'eye'} color='#fff' onPress={() => {
            password.show = !password.show
            this.setState({ password })
          }} />}
        />

        <View style={styles.forgotPassword}>
          <TouchableOpacity onPress={() => this.props.navigation.navigate("ForgotPasswordScreen")}>
            <Text style={[theme.customFontMSmedium.body, { color: '#fff' }]}>Mot de passe oublié?</Text>
          </TouchableOpacity>
        </View>

        <Button loading={loading} mode="outlined" onPress={this.handleLogin}>
          Se connecter
        </Button>

        {/* <View style={styles.row}>
            <Text style={styles.label}>Vous êtes nouveau? </Text>
            <TouchableOpacity onPress={() => this.props.navigation.navigate("RegisterScreen")}>
              <Text style={styles.link}>Inscrivez-vous</Text>
            </TouchableOpacity>
          </View> */}

        <Toast message={error} onDismiss={() => this.setState({ error: '' })} />
      </Background>

    )

  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingLeft: constants.ScreenWidth * 0.07,
    paddingRight: constants.ScreenWidth * 0.07,
    alignItems: 'center'
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
    marginVertical: 10
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
  }
});

export default memo(LoginScreen);
