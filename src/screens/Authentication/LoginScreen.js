import React, { Component } from "react";
import { TouchableOpacity, StyleSheet, Text, View, Keyboard, ActivityIndicator } from "react-native";
import { TextInput as PaperInput } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import { connect } from 'react-redux';

import moment from 'moment';
import 'moment/locale/fr';
moment.locale('fr');

import NewBackground from "../../components/NewBackground";
import Logo from "../../components/Logo";
import TextInput from "../../components/TextInput";

import * as theme from "../../core/theme";
import { emailValidator, passwordValidator } from "../../core/utils";
import { constants } from '../../core/constants';
import { loginUser } from "../../api/auth-api";
import { setAppToast } from "../../core/redux";

class LoginScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: { value: "", error: "" },
      password: { value: "", error: "", show: false },
      loading: false,
      globalError: "",  // Erreur globale à afficher au-dessus du champ email
    };
  }

  reinitializeInputs = () => {
    this.setState({
      email: { value: "", error: "" },
      password: { value: "", error: "", show: false },
      globalError: "",  // Réinitialiser l'erreur globale
    }, () => Keyboard.dismiss());
  };

  validateInputs = () => {
    const { email, password } = this.state;
    const emailError = emailValidator(email.value);
    const passwordError = passwordValidator(password.value);

    this.setState({
      email: { ...email, error: emailError },
      password: { ...password, error: passwordError }
    });

    return !emailError && !passwordError;
  };

  handleLogin = async () => {
    Keyboard.dismiss();
    const { email, password, loading } = this.state;
    
    if (loading) return;
    this.setState({ loading: true });

    if (!this.validateInputs()) {
      this.setState({ loading: false });
      return;
    }

    console.log("Starting login...", moment().format('HH:mm:ss'));
    const response = await loginUser({ email: email.value, password: password.value });

    if (response.error) {
      this.setState({ loading: false, globalError: response.error });  // Mettez à jour l'erreur globale
      setAppToast({ message: response.error, type: "error" });
      console.log('erreur11111', response.error);
    } else {
      console.log("Logged in at", moment().format('HH:mm:ss'));
      // Logic to handle successful login can be added here
    }
  };

  forgotPassword = () => {
    if (!this.state.loading) {
      this.props.navigation.navigate("ForgotPasswordScreen");
    }
  };

  render() {
    const { loading, email, password, globalError } = this.state;

    return (
      <NewBackground>
        <View style={styles.container}>
          <Logo />
          <View>
            {globalError ? (
              <Text style={styles.errorText}>{globalError}</Text>  // Affichez l'erreur globale
            ) : null}

            <TextInput
              style={styles.credInput}
              label="Email"
              returnKeyType="next"
              value={email.value}
              onChangeText={text => this.setState(prevState => ({
                email: { ...prevState.email, value: text, error: "" }
              }))}
              error={!!email.error}
              errorText={email.error}
              autoCapitalize="none"
              autoCorrect={false}
              autoCompleteType="email"
              textContentType="emailAddress"
              keyboardType="email-address"
              editable={!loading}
              theme={{ colors: { text: 'black' } }}
            />
            <TextInput
              style={styles.credInput}
              label="Mot de passe"
              returnKeyType="done"
              value={password.value}
              onChangeText={text => this.setState(prevState => ({
                password: { ...prevState.password, value: text, error: "" }
              }))}
              error={!!password.error}
              errorText={password.error}
              secureTextEntry={!password.show}
              autoCapitalize="none"
              editable={!loading}
              right={
                <PaperInput.Icon 
                  name={password.show ? 'eye-off' : 'eye'} 
                  color={theme.colors.secondary} 
                  onPress={() => this.setState(prevState => ({
                    password: { ...prevState.password, show: !prevState.password.show }
                  }))}
                />
              }
              theme={{ colors: { text: 'black' } }}
            />
          </View>
          <View style={styles.forgotPassword}>
            <TouchableOpacity onPress={this.forgotPassword}>
              <Text style={[theme.customFontMSregular.caption, styles.forgetPasswordLink]}>
                Mot de passe oublié ?
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity 
            style={styles.loginButton} 
            onPress={this.handleLogin} 
            disabled={loading}
          >
            <LinearGradient 
              start={{ x: 0, y: 0 }} 
              end={{ x: 1, y: 0 }} 
              colors={['#33a979', '#58cb7e', '#6edd81']} 
              style={styles.linearGradient}
            >
              {loading && <ActivityIndicator size="small" color={theme.colors.white} style={{ marginRight: 10 }} />}
              <Text style={[theme.customFontMSmedium.header, { color: '#fff', letterSpacing: 1 }]}>
                Se connecter
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
    paddingTop: constants.ScreenWidth * 0.1,
  },
  credInput: {
    marginVertical: 0,
    backgroundColor: theme.colors.background,
    color: theme.colors.gray_dark,
    text: '#000000',
  },
  forgotPassword: {
    width: "100%",
    alignItems: "flex-end",
    marginTop: theme.padding,
  },
  forgetPasswordLink: {
    color: theme.colors.gray_dark,
  },
  linearGradient: {
    flexDirection: 'row',
    height: 50,
    width: constants.ScreenWidth * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5
  },
  loginButton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  errorText: {  // Style pour l'affichage de l'erreur
    color: 'red',
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
  },
});

const mapStateToProps = (state) => ({
  role: state.roles.role,
  network: state.network,
  currentUser: state.currentUser
});

export default connect(mapStateToProps)(LoginScreen);

