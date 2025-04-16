import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { TextInput } from 'react-native-paper';
import TextInputMask from 'react-native-text-input-mask';
import { connect } from 'react-redux';
import _ from 'lodash';

import moment from 'moment';
import 'moment/locale/fr';
moment.locale('fr');

import Appbar from '../../components/Appbar';
import Loading from '../../components/Loading';
import LoadDialog from '../../components/LoadDialog';
import RadioButton from '../../components/RadioButton';
import MyInput from '../../components/TextInput';
import AddressInput from '../../components/AddressInput';
import Button from '../../components/Button';
import Toast from '../../components/Toast';
import { CustomIcon } from '../../components';

import { auth } from '../../firebase';
import * as theme from '../../core/theme';
import { constants } from '../../core/constants';
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
import { faMagic } from 'react-native-vector-icons/FontAwesome5';

class CreateClient extends Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.refreshAddress = this.refreshAddress.bind(this);
    this.setAddress = setAddress.bind(this);
    const { route } = this.props;

    // Accès aux paramètres via route?.params
    this.prevScreen = route?.params?.prevScreen ?? 'UsersManagement';
    this.ClientId = generateId('GS-CL-');
    this.isProspect = route?.params?.isProspect ?? false;
    this.userType = this.isProspect ? 'prospect' : 'client';
    this.titleText = `${this.userType
      .charAt(0)
      .toUpperCase()}${this.userType.slice(1)}`;
    this.titleText = this.isProspect
      ? this.titleText
      : `${this.titleText} en cours`;

    this.state = {
      isProspect: this.isProspect,
      ClientId: this.ClientId,
      checked: 'first', //professional/Particular
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

      userType: 'client',

      loading: true,
      loadingDialog: false,
    };
  }

  componentDidMount() {
    this.initialState = _.cloneDeep(this.state);
    load(this, false);
  }

  handleSubmit = async () => {
    Keyboard.dismiss();
  
    this.setState({ loadingDialog: true });
  
    //1. Verify
    const { isValid, updateErrors } = validateUserInputs(this.state); //#readyToExternalize
    if (!isValid) {
      this.setState(updateErrors);
      setToast(this, 'e', 'Erreur de saisie, veuillez vérifier les champs.');
      return;
    }
  
    //2. Format user
    const user = formatNewUser(this.state); //#readyToExternalize
    const { isConnected } = this.props.network;
  
    //3. Create user doc
    const response = await createUser(user, isConnected); //#readyToExternalize
    const { error } = response;
  
    if (error) {
      this.setState({ loadingDialog: false });
      displayError(error);
    } else {
      const { navigation, route } = this.props; // Utilisation de `route` pour accéder aux paramètres
      const onGoBack = route?.params?.onGoBack; // Vérification de l'existence de `onGoBack`
  
      if (onGoBack) {
        onGoBack(user); // Appel de la fonction de rappel avec les données utilisateur
      }
  
      const navScreen =
        this.prevScreen === 'CreateProject' ? this.prevScreen : 'Profile';
        const drawer = this.prevScreen === 'CreateProject' ? 'ProjectsStack' : 'ProfileStack';

      const navParams =
        this.prevScreen === 'CreateProject'
          ? {}
          : {
            user: { id: this.ClientId, roleId: 'client' },
            isClient: true,
            isEdit: false,
          };
  
      this.setState({ loadingDialog: false }, () => {
        navigation.replace(drawer,{navScreen, navParams}); // Utilisation de `replace` pour naviguer
      });
    }
  };
  

  refreshAddress(address) {
    this.setState({ address, addressError: '' });
  }

  render() {
    let { isPro, error, loading, loadingDialog } = this.state;
    let {
      nom,
      prenom,
      address,
      addressError,
      phone,
      phone2,
      email,
      email2,
      password,
    } = this.state;
    let { denom, siret } = this.state;
    const { isConnected } = this.props.network;
    const loadingMessage = `Création du ${this.userType} en cours...`;

    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.white }}>
        <Appbar close={!loading} title titleText={this.titleText} />

        {loading ? (
          <Loading size="large" />
        ) : (
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : null}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}>
            <ScrollView
              keyboardShouldPersistTaps="never"
              style={styles.container}
              contentContainerStyle={styles.scrollview}>
              <MyInput
                label="Identifiant client"
                value={this.ClientId}
                editable={false}
                disabled
              />

              <RadioButton
                checked={this.state.checked}
                firstChoice={{ title: 'Particulier', value: 'Particulier' }}
                secondChoice={{ title: 'Professionnel', value: 'Professionnel' }}
                onPress1={() => this.setState({ checked: 'first', isPro: false })}
                onPress2={() => this.setState({ checked: 'second', isPro: true })}
                style={{ justifyContent: 'space-between', marginTop: 20 }}
              />

              {!isPro && (
                <MyInput
                  label="Prénom *"
                  returnKeyType="done"
                  value={prenom.value}
                  onChangeText={(text) => updateField(this, prenom, text)}
                  error={!!prenom.error}
                  errorText={prenom.error}
                />
              )}

              <MyInput
                label={isPro ? 'Dénomination sociale *' : 'Nom *'}
                returnKeyType="next"
                value={isPro ? denom.value : nom.value}
                onChangeText={(text) => {
                  const name = isPro ? denom : nom;
                  updateField(this, name, text);
                }}
                error={isPro ? !!denom.error : !!nom.error}
                errorText={isPro ? denom.error : nom.error}
              />

              {isPro && (
                <MyInput
                  label="Numéro siret *"
                  returnKeyType="next"
                  value={siret.value}
                  onChangeText={(text) => updateField(this, siret, text)}
                  error={!!siret.error}
                  errorText={siret.error}
                  render={(props) => (
                    <TextInputMask
                      {...props}
                      mask="[000] [000] [000] [00000]"
                    />
                  )}
                />
              )}

              <AddressInput
                offLine={!isConnected}
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

              <MyInput
                label="Téléphone 2 (optionnel)"
                returnKeyType="done"
                value={phone2.value}
                onChangeText={text => updateField(this, phone2, text)}
                error={!!phone2.error}
                errorText={phone2.error}
                textContentType='telephoneNumber'
                keyboardType='phone-pad'
                dataDetectorTypes='phoneNumber'
                render={props => <TextInputMask {...props} mask="+33 [0] [00] [00] [00] [00]" />} />

              <MyInput
                label="Email *"
                returnKeyType="next"
                value={email.value}
                onChangeText={(text) => updateField(this, email, text)}
                error={!!email.error}
                errorText={email.error}
                autoCapitalize="none"
                autoCorrect={false}
                autoCompleteType="email"
                textContentType="emailAddress"
                keyboardType="email-address"
              />

              <MyInput
                label="Email 2 (optionnel)"
                returnKeyType="next"
                value={email2.value}
                onChangeText={(text) => updateField(this, email2, text)}
                error={!!email2.error}
                errorText={email2.error}
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
                onChangeText={(text) => updateField(this, password, text)}
                error={!!password.error}
                errorText={password.error}
                // secureTextEntry={!password.show}
                autoCapitalize="none"
                right={
                  <TextInput.Icon
                    name={
                      <CustomIcon
                        icon={faMagic}
                        color={theme.colors.inpuIcon}
                      />
                    }
                    color={theme.colors.secondary}
                    onPress={() => {
                      const password = { value: generateId('', 6), error: '' };
                      this.setState({ password });
                    }}
                  />
                }
                // editable={false}
              />

              <Toast
                message={error}
                onDismiss={() => this.setState({ error: '' })}
              />
              <LoadDialog loading={loadingDialog} message={loadingMessage} />
            </ScrollView>
          </KeyboardAvoidingView>
        )}

        <Button
          mode="contained"
          onPress={this.handleSubmit}
          backgroundColor={theme.colors.primary}
          containerStyle={styles.confirmButton}>
          Valider
        </Button>
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    role: state.roles.role,
    network: state.network,
    //fcmToken: state.fcmtoken
  };
};

export default connect(mapStateToProps)(CreateClient);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  scrollview: {
    backgroundColor: '#fff',
    padding: constants.ScreenWidth * 0.05,
  },
  confirmButton: {
    alignSelf: 'flex-end',
    marginTop: 25,
    marginRight: theme.padding,
  },
});
