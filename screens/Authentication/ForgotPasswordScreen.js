import React, { memo, Component } from "react";
import { Text, StyleSheet, View } from "react-native";
import Appbar from "../../components/Appbar";
import Logo from "../../components/Logo"
import TextInput from "../../components/TextInput"
import Button from "../../components/Button"
import Toast from "../../components/Toast"

import { sendEmailWithPassword } from "../../api/auth-api"
import { updateField, emailValidator, load, setToast } from "../../core/utils"
import * as theme from "../../core/theme"
import { constants } from "../../core/constants"

class ForgotPasswordScreen extends Component {

  constructor(props) {
    super(props)
    this.handleSendEmail = this.handleSendEmail.bind(this)
    this.state = {
      email: { value: "", error: "" },
      toastType: '',
      toastMessage: '',
      loading: false,
    }
  }

  handleSendEmail = async () => {
    let { loading, email, toast } = this.state

    if (loading) return
    load(this, true)

    const emailError = emailValidator(email.value)

    if (emailError) {
      setToast(this, 'e', emailError)
      load(this, false)
      return
    }

    const response = await sendEmailWithPassword(email.value);
    load(this, false)

    if (response.error)
      setToast(this, 'e', response.error)

    else
      setToast(this, 'i', 'Un email pour modifier le mot de passe a été envoyé.')
  }

  render() {
    let { loading, email, toastType, toastMessage } = this.state

    return (
      <View style={{ flex: 1 }}>
        <Appbar back title titleText='Mot de passe oublié' />

        <View style={styles.container}>
          <Logo style={{ alignSelf: 'center' }} />

          <TextInput
            label="Adresse email"
            returnKeyType="done"
            value={email.value}
            onChangeText={text => updateField(this, email, text)}
            error={!!email.error}
            errorText={email.error}
            autoCapitalize="none"
            autoCompleteType="email"
            textContentType="emailAddress"
            keyboardType="email-address"
          />

          <Button
            loading={loading}
            mode="contained"
            onPress={this.handleSendEmail}
            style={styles.button}
          >
            Envoyer un email
          </Button>

          <Toast
            type={toastType}
            message={toastMessage}
            onDismiss={() => this.setState({ toastType: '', toastMessage: '' })}
          />
        </View>

      </View>
    )
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: constants.ScreenHeight * 0.1,
    paddingHorizontal: constants.ScreenWidth * 0.1
  },
  button: {
    marginTop: 12
  },
});

export default memo(ForgotPasswordScreen);
