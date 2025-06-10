import React, { Component } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import TextInputMask from 'react-native-text-input-mask';
import Appbar from '../../components/Appbar';
import Loading from '../../components/Loading';
import LoadDialog from '../../components/LoadDialog';
import RadioButton from '../../components/RadioButton';
import MyInput from '../../components/TextInput';
import AddressInput from '../../components/AddressInput';
import Button from '../../components/Button';
import Toast from '../../components/Toast';
import * as theme from '../../core/theme';
import {
  validateUserInputs,
  formatNewUser,
  createUser,
} from '../../api/firestore-api';
import {
  generateId,
  updateField,
  load,
  navigateToScreen,
  setAddress,
  displayError,
  setToast,
} from '../../core/utils';

export default class RegisterScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ClientId: generateId('GS-CL-'),
      checked: 'first',
      isPro: false,
      nom: { value: '', error: '' },
      prenom: { value: '', error: '' },
      denom: { value: '', error: '' },
      siret: { value: '', error: '' },
      address: {
        description: '',
        place_id: '',
        marker: { latitude: '', longitude: '' },
      },
      addressError: '',
      email: { value: '', error: '' },
      email2: { value: '', error: '' },
      phone: { value: '', error: '' },
      phone2: { value: '', error: '' },
      password: { value: '', error: '', show: false },
      loading: true,
      loadingDialog: false,
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.refreshAddress = this.refreshAddress.bind(this);
    this.setAddress = setAddress.bind(this);
  }

  componentDidMount() {
    load(this, false);
  }

  handleSubmit = async () => {
    Keyboard.dismiss();
    this.setState({ loadingDialog: true });
    const { isValid, updateErrors } = validateUserInputs(this.state);

    if (!isValid) {
      this.setState(updateErrors);
      setToast(this, 'e', 'Erreur de saisie, veuillez vérifier les champs.');
      this.setState({ loadingDialog: false });
      return;
    }

    const user = formatNewUser(this.state);
    const response = await createUser(user);
    const { error } = response;

    if (error) {
      displayError(error);
      this.setState({ loadingDialog: false });
    } else {
      setToast(this, 's', 'Compte créé avec succès.');
      this.setState({ loadingDialog: false });
      this.props.navigation.navigate('LoginScreen');
    }
  };

  refreshAddress(address) {
    this.setState({ address, addressError: '' });
  }

  render() {
    const { isPro, loading, loadingDialog } = this.state;
    const { nom, prenom, address, addressError, phone, email, password, denom } = this.state;

    return (
      <View style={styles.container}>
        <Appbar title="Créer un compte" />
        {loading ? (
          <Loading size="large" />
        ) : (
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : null}
            style={styles.avoidingView}
          >
            <ScrollView contentContainerStyle={styles.scrollview}>
              <MyInput label="Identifiant" value={this.state.ClientId} editable={false} />

              <RadioButton
                checked={this.state.checked}
                firstChoice={{ title: 'Particulier', value: 'Particulier' }}
                secondChoice={{ title: 'Professionnel', value: 'Professionnel' }}
                onPress1={() => this.setState({ checked: 'first', isPro: false })}
                onPress2={() => this.setState({ checked: 'second', isPro: true })}
              />

              {isPro && (
                <MyInput
                  label="Dénomination sociale"
                  value={denom.value}
                  onChangeText={(text) => updateField(this, denom, text)}
                />
              )}

              <MyInput
                label="Nom"
                value={nom.value}
                onChangeText={(text) => updateField(this, nom, text)}
              />

              <MyInput
                label="Prénom"
                value={prenom.value}
                onChangeText={(text) => updateField(this, prenom, text)}
              />

            <AddressInput
                onPress={() =>
                  navigateToScreen(this, 'Address', {
                    onGoBack: this.refreshAddress,
                    currentAddress: address,
                  })
                }
                onChangeText={this.setAddress}
                clearAddress={() => this.setAddress('')}
                address={address}
                addressError={addressError}
              />

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
              <MyInput label="Email" value={email.value} onChangeText={(text) => updateField(this, email, text)} />

              <MyInput
                label="Mot de passe"
                value={password.value}
                onChangeText={(text) => updateField(this, password, text)}
              />

              <LoadDialog loading={loadingDialog} />
            </ScrollView>
          </KeyboardAvoidingView>
        )}

        <Button
          onPress={this.handleSubmit}
          mode="contained"
          backgroundColor={theme.colors.primary}
          containerStyle={styles.confirmButton}
        >
          S'inscrire
        </Button>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.white },
  avoidingView: { flex: 1 },
  scrollview: { padding: 20 },
  confirmButton: {
    alignSelf: 'flex-end',
    marginTop: 25,
    marginRight: theme.padding,
  },
});
