import React, { Component } from "react";
import { Text, StyleSheet, View, TouchableOpacity, ActivityIndicator } from "react-native";
import LinearGradient from 'react-native-linear-gradient';
import { connect } from 'react-redux';

import NewBackground from "../../components/NewBackground";
import Appbar from "../../components/Appbar";
import Logo from "../../components/Logo";
import TextInput from "../../components/TextInput";
import Toast from "../../components/Toast";

import { sendEmailWithPassword } from "../../api/auth-api";
import { updateField, emailValidator, load } from "../../core/utils";
import * as theme from "../../core/theme";
import { constants } from "../../core/constants";
import { setAppToast } from "../../core/redux";

class ForgotPasswordScreen extends Component {
  constructor(props) {
    super(props);
    this.handleSendEmail = this.handleSendEmail.bind(this);
    this.state = {
      email: { value: "", error: "" },
      loading: false,
      errorMessage: "", // Message d'erreur
      successMessage: "", // Message de succès
    };
  }

  validateInputs() {
    const { email } = this.state;
    const emailError = emailValidator(email.value);

    if (emailError) {
      this.setState({ email: { ...email, error: emailError }, errorMessage: emailError });
      return false;
    }

    return true;
  }

  async handleSendEmail() {
    const { email, loading } = this.state;

    if (loading) return;

    this.setState({ loading: true, errorMessage: "", successMessage: "" }); // Réinitialiser les messages

    // Validation des entrées
    const isValid = this.validateInputs();
    if (!isValid) {
      this.setState({ loading: false });
      return;
    }

    try {
      const response = await sendEmailWithPassword(email.value);

      if (response.error) {
        this.setState({ errorMessage: response.error });
      } else {
        this.setState({
          successMessage: "Un email pour modifier le mot de passe a été envoyé. Veuillez vérifier votre boîte de réception.",
        });
      }
    } catch (error) {
      this.setState({ errorMessage: "Une erreur inconnue s'est produite. Veuillez réessayer." });
    }

    this.setState({ loading: false });
  }

  render() {
    const { email, loading, errorMessage, successMessage } = this.state;

    return (
      <NewBackground>
        <Appbar back title titleText="Mot de passe oublié" />

        <View style={styles.container}>
          <Logo />

          {/* Affichage du message de succès en tant qu'alerte */}
          {successMessage ? (
            <View style={styles.successAlert}>
              <Text style={styles.successText}>{successMessage}</Text>
            </View>
          ) : null}

          {/* Affichage du champ email */}
          <TextInput
            style={{ zIndex: 1, backgroundColor: theme.colors.background }}
            label="Adresse email"
            returnKeyType="done"
            value={email.value}
            onChangeText={text => this.setState({ email: { value: text, error: "" }, errorMessage: "" })}
            error={!!email.error}
            errorText={email.error}
            autoCapitalize="none"
            autoCompleteType="email"
            textContentType="emailAddress"
            keyboardType="email-address"
          />

          {/* Affichage du message d'erreur sous l'input */}
          {errorMessage ? (
            <Text style={styles.errorMessage}>{errorMessage}</Text>
          ) : null}

          {/* Bouton d'envoi */}
          <TouchableOpacity
            style={{ justifyContent: 'center', alignItems: 'center', marginTop: 30, zIndex: 500 }}
            onPress={this.handleSendEmail}
          >
            <LinearGradient
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              colors={['#33a979', '#58cb7e', '#6edd81']}
              style={styles.linearGradient}
            >
              {loading && <ActivityIndicator size="small" color={theme.colors.white} style={{ marginRight: 10 }} />}
              <Text style={[theme.customFontMSmedium.header, { color: '#fff', letterSpacing: 1, marginLeft: 10 }]}>
                Envoyer un email
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </NewBackground>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: constants.ScreenWidth * 0.1,
  },
  linearGradient: {
    flexDirection: "row",
    width: constants.ScreenWidth * 0.8,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
  },
  errorMessage: {
    color: theme.colors.error, // Assurez-vous que `theme.colors.error` est défini
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  successAlert: {
    backgroundColor: "#d4edda",
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  successText: {
    color: "#155724",
    fontSize: 14,
    textAlign: "center",
  },
});

const mapStateToProps = (state) => ({
  toast: state.toast,
});

export default connect(mapStateToProps)(ForgotPasswordScreen);
