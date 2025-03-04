import React, { Component } from 'react'
import { StyleSheet, ScrollView, TouchableOpacity, View, Text, Keyboard } from 'react-native'
import { TextInput } from 'react-native-paper'
import TextInputMask from 'react-native-text-input-mask'
import firebase from '@react-native-firebase/app'
import NetInfo from "@react-native-community/netinfo"

import Appbar from '../../components/Appbar'
import AvatarText from '../../components/AvatarText'
import MyInput from '../../components/TextInput'
import AddressInput from '../../components/AddressInput'
import Button from "../../components/Button"
import Toast from "../../components/Toast"
import Loading from "../../components/Loading"

import * as theme from "../../core/theme"
import { constants } from '../../core/constants'
import { resetState, setNetwork } from '../../core/redux'
import { navigateToScreen, nameValidator, emailValidator, passwordValidator, phoneValidator, updateField, load, setToast } from "../../core/utils"
import { handleFirestoreError, handleReauthenticateError, handleUpdatePasswordError } from '../../core/exceptions'
import { connect } from 'react-redux'

const db = firebase.firestore()
const fields = ['denom', 'nom', 'prenom', 'email', 'phone']

class Profile extends Component {

    constructor(props) {
        super(props)
        this.handleSubmit = this.handleSubmit.bind(this)
        this.changePassword = this.changePassword.bind(this)
        this.passwordValidation = this.passwordValidation.bind(this)
        this.refreshToast = this.refreshToast.bind(this)
        this.handleReauthenticateError = this.handleReauthenticateError.bind(this)

        this.userId = this.props.navigation.getParam('userId', firebase.auth().currentUser.uid)
        this.role = this.props.role.id
        this.initialState = {}

        this.state = {
            id: this.userId, //Not editable
            currentUser: firebase.auth().currentUser,

            isPro: false,
            denom: { value: "", error: "" },
            siret: { value: "", error: "" },
            nom: { value: '', error: '' },
            prenom: { value: '', error: '' },

            role: '',

            email: { value: '', error: '' },
            phone: { value: '', error: '' },
            address: { description: '', place_id: '', marker: { latitude: '', longitude: '' } },
            addressError: '',

            currentPass: { value: '', error: '', show: false },
            newPass: { value: '', error: '', show: false },

            loading: true,
            loadingSignOut: false,
            error: '',
            toastMessage: '', //password change
            toastType: '',
        }
    }

    componentDidMount() {
        this.fetchData()
        load(this, false)
    }

    componentWillUnmount() {
        this.unsubscribe()
    }

    fetchData() {
        this.unsubscribe = db.collection('Users').doc(this.userId).onSnapshot((doc) => {
            const user = doc.data()

            let denom = ''
            let siret = ''
            let nom = ''
            let prenom = ''

            if (user.isPro) {
                denom = { value: user.denom, error: "" }
                siret = { value: user.siret, error: "" }
            }

            else {
                nom = { value: user.nom, error: '' }
                prenom = { value: user.prenom, error: '' }
            }

            let email = { value: user.email, error: '' }
            let phone = { value: user.phone, error: '' }
            let role = user.role
            let address = user.address
            let isPro = user.isPro

            this.setState({ isPro, denom, siret, nom, prenom, role, email, phone, address }, () => {
                this.initialState = this.state //keep the initial state to compare changes
            })
        })
    }

    validateInputs() {
        let denomError = ''
        let nomError = ''
        let prenomError = ''

        const { isPro, denom, nom, prenom, phone, address } = this.state

        if (isPro)
            denomError = nameValidator(denom.value, '"Dénomination sociale"')

        else {
            nomError = nameValidator(nom.value, '"Nom"')
            prenomError = nameValidator(prenom.value, '"Prénom"')
        }

        const phoneError = nameValidator(phone.value, '"Téléphone"')
        const addressError = nameValidator(address.description, '"Adresse"')

        if (denomError || nomError || prenomError || phoneError || addressError) {

            phone.error = phoneError

            if (isPro) {
                denom.error = denomError
                Keyboard.dismiss()
                this.setState({ denom, phone, addressError, loading: false })
            }

            else {
                nom.error = nomError
                prenom.error = prenomError
                Keyboard.dismiss()
                this.setState({ nom, prenom, phone, addressError, loading: false })
            }

            setToast(this, 'e', 'Erreur de saisie, veuillez verifier les champs.')

            return false
        }

        return true
    }

    async handleSubmit() {
        //Handle Loading or No edit done
        if (this.state.loading || this.state === this.initialState) return

        load(this, true)

        //Validation
        const isValid = this.validateInputs()
        if (!isValid) return

        //Format data
        let userData = []
        let { isPro, nom, prenom, denom, phone } = this.state
        const { isConnected } = this.props.network

        let user = {
            phone: phone.value
        }

        if (isConnected) {
            if (isPro) {
                user.denom = denom.value
                user.siret = siret.value
                user.fullName = denom.value
            }

            else if (!isPro) {
                user.nom = nom.value
                user.prenom = prenom.value
                user.fullName = `${prenom.value} ${nom.value}`
            }
        }

        //Persist data
        await db.collection('Users').doc(this.userId).set(user, { merge: true })
            .then(() => {

                if (!isConnected) return

                const nomChanged = nom !== this.initialState.nom
                const prenomChanged = prenom !== this.initialState.prenom
                const denomChanged = denom !== this.initialState.denom

                //A cloud function updating firebase auth displayName is triggered -> give it some time to finish...
                if (nomChanged || prenomChanged || denomChanged)
                    setTimeout(async () => {
                        await firebase.auth().currentUser.reload()
                        const currentUser = firebase.auth().currentUser
                        this.setState({ currentUser })
                    }, 5000)

                load(this, false)
                this.setState({ toastType: 'success', toastMessage: 'Modifications efféctuées !' })
            })
            .catch((e) => {
                load(this, false)
                handleFirestoreError(e)
            })
    }

    passwordValidation() {
        const { currentPass, newPass } = this.state
        const currentPassError = passwordValidator(currentPass.value)
        const newPassError = passwordValidator(newPass.value)

        if (currentPassError || newPassError) {
            currentPass.error = currentPassError
            newPass.error = newPassError

            this.setState({ currentPass, newPass, loading: false, toastType: 'error', toastMessage: 'Veuillez renseigner les champs mots de passe.' })
            return false
        }

        else return true
    }

    async changePassword() {
        load(this, true)

        //Validate passwords (old pass & new pass)
        const isPasswordValid = this.passwordValidation()
        if (!isPasswordValid) return

        let { currentPass, newPass, currentUser, email } = this.state
        const emailCred = firebase.auth.EmailAuthProvider.credential(currentUser.email, currentPass.value)

        //Re-authenticate user (for security)
        const userCredential = await currentUser.reauthenticateWithCredential(emailCred).catch(e => this.handleReauthenticateError(e))
        if (!userCredential) {
            load(this, false)
            return
        }

        //Update password
        await currentUser.updatePassword(newPass.value)
            .then(() => {
                setToast(this, 's', 'Mot de passe modifié avec succès')
                const init = { value: '', error: '' }
                this.setState({ currentPass: init, newPass: init })
            })
            .catch(e => handleUpdatePasswordError(e))
            .finally(() => load(this, false))
    }

    handleReauthenticateError(e) {
        handleReauthenticateError(e)
        const currentPass = { value: '', error: '' }
        const newPass = { value: '', error: '' }
        this.setState({ currentPass, newPass, loading: false })
    }

    refreshToast(toastType, toastMessage) {
        this.setState({ toastType, toastMessage })
    }

    handleSignout() {
        this.setState({ loadingSignOut: true })
        firebase.auth().signOut().then(async () => {
            resetState(this)
            const { type, isConnected } = await NetInfo.fetch()
            const network = { type, isConnected }
            setNetwork(this, network)
        })
    }

    render() {
        let { id, isPro, denom, siret, nom, prenom, email, phone, address, addressError, newPass, currentPass, role, toastMessage, error, loading, loadingSignOut } = this.state
        const { isConnected } = this.props.network
        const { displayName, uid } = firebase.auth().currentUser
        const isProfileOwner = this.userId === uid
        const isAdmin = this.role === 'admin'

        let { canUpdate } = this.props.permissions.users
        canUpdate = (canUpdate || isProfileOwner)

        return (
            <View style={{ flex: 1 }}>
                <Appbar back={!loading} title titleText='Profil' check={canUpdate} handleSubmit={this.handleSubmit} />
                <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>

                    {!loading ?
                        <View style={{ paddingHorizontal: constants.ScreenWidth * 0.075 }}>
                            <View style={{ height: constants.ScreenHeight * 0.27, flexDirection: 'row' }}>
                                <View style={{ flex: 0.3, justifyContent: 'center', alignItems: 'flex-start' }} >
                                    {displayName && <AvatarText label={displayName.charAt(0)} size={60} />}
                                </View>
                                <View style={{ flex: 0.7, justifyContent: 'center', alignItems: 'center' }} >

                                    {isPro ?
                                        < MyInput
                                            label="Dénomination sociale"
                                            returnKeyType="done"
                                            value={denom.value}
                                            onChangeText={text => updateField(this, denom, text)}
                                            error={!!denom.error}
                                            errorText={denom.error}
                                            editable={canUpdate}
                                        />
                                        :
                                        <MyInput
                                            label="Prénom"
                                            returnKeyType="done"
                                            value={prenom.value}
                                            onChangeText={text => updateField(this, prenom, text)}
                                            error={!!prenom.error}
                                            errorText={prenom.error}
                                            editable={canUpdate && isConnected}
                                            disabled={!isConnected}
                                        />
                                    }

                                    {isPro ?
                                        < MyInput
                                            label="Siret"
                                            returnKeyType="done"
                                            value={siret.value}
                                            onChangeText={text => updateField(this, siret, text)}
                                            error={!!siret.error}
                                            errorText={siret.error}
                                            editable={false}
                                        />
                                        :
                                        < MyInput
                                            label="Nom"
                                            returnKeyType="done"
                                            value={nom.value}
                                            onChangeText={text => updateField(this, nom, text)}
                                            error={!!nom.error}
                                            errorText={nom.error}
                                            editable={canUpdate && isConnected}
                                            disabled={!isConnected}
                                        />
                                    }

                                </View>
                            </View>

                            <View style={{ flex: 1 }}>
                                <MyInput
                                    label="Numéro utilisateur"
                                    returnKeyType="done"
                                    value={id}
                                    onChangeText={text => console.log(text)}
                                    error={!!id.error}
                                    errorText={id.error}
                                    autoCapitalize="none"
                                    editable={false}
                                    disabled
                                />

                                {/* <TouchableOpacity onPress={() => {
                                    if (isProfileOwner)
                                        this.props.navigation.navigate('EditEmail', { onGoBack: this.refreshToast, userId: this.userId })
                                }}> */}
                                <MyInput
                                    label="Email"
                                    returnKeyType="done"
                                    value={email.value}
                                    autoCapitalize="none"
                                    editable={false}
                                    disabled
                                // right={isProfileOwner && <TextInput.Icon name='pencil' color={theme.colors.primary} size={21} onPress={() =>
                                //     this.props.navigation.navigate('EditEmail', { onGoBack: this.refreshToast, userId: this.userId })
                                // } />}
                                />
                                {/* </TouchableOpacity> */}

                                {isProfileOwner &&
                                    <Button
                                        loading={loadingSignOut}
                                        mode="contained"
                                        onPress={this.handleSignout.bind(this)}
                                        backgroundColor='#ff5153'
                                        style={{ width: constants.ScreenWidth * 0.85, alignSelf: 'center' }}>
                                        Se déconnecter
                                    </Button>
                                }

                                {isAdmin &&
                                    <TouchableOpacity onPress={() => {
                                        if (!isConnected) return
                                        navigateToScreen(this, isAdmin, 'EditRole', { onGoBack: this.refreshToast, userId: this.userId, currentRole: role })
                                    }}>
                                        <MyInput
                                            label="Role"
                                            returnKeyType="done"
                                            value={role}
                                            autoCapitalize="none"
                                            editable={false}
                                            right={isAdmin && isConnected && <TextInput.Icon name='pencil' color={theme.colors.primary} size={21} onPress={() =>
                                                navigateToScreen(this, isAdmin, 'EditRole', { onGoBack: this.refreshToast, userId: this.userId, currentRole: role })
                                            } />} />
                                    </TouchableOpacity>
                                }

                                <MyInput
                                    label="Téléphone"
                                    returnKeyType="done"
                                    value={phone.value}
                                    onChangeText={text => updateField(this, phone, text)}
                                    error={!!phone.error}
                                    errorText={phone.error}
                                    autoCapitalize="none"
                                    textContentType='telephoneNumber'
                                    keyboardType='phone-pad'
                                    dataDetectorTypes='phoneNumber'
                                    editable={canUpdate}
                                    render={props =>
                                        <TextInputMask
                                            {...props}
                                            mask="+[00] [0] [00] [00] [00] [00]"
                                        />
                                    } />

                                <AddressInput
                                    offLine={!isConnected}
                                    address={address}
                                    addressError={addressError}
                                    onPress={() => navigateToScreen(this, canUpdate, 'Address', { prevScreen: 'Profile', userId: this.userId, currentAddress: this.state.address })}
                                    rightIcon={canUpdate && isConnected && <TextInput.Icon name='pencil' color={theme.colors.primary} size={21} onPress={() =>
                                        navigateToScreen(this, canUpdate, 'Address', { prevScreen: 'Profile', userId: this.userId, currentAddress: this.state.address })
                                    } />}
                                />

                                {isProfileOwner &&
                                    <View>
                                        <View style={{ paddingTop: 30, paddingBottom: 3 }}>
                                            <Text style={[theme.customFontMSsemibold.body, { marginBottom: 5 }]}>MODIFICATION DU MOT DE PASSE</Text>
                                            <Text style={[theme.customFontMSregular, { color: theme.colors.placeholder }]}>Laissez le mot de passe vide si vous ne voulez pas le changer.</Text>
                                        </View>

                                        <MyInput
                                            label="Ancien mot de passe"
                                            returnKeyType="done"
                                            value={currentPass.value}
                                            onChangeText={text => updateField(this, currentPass, text)}
                                            error={!!currentPass.error}
                                            errorText={currentPass.error}
                                            autoCapitalize="none"
                                            secureTextEntry={!currentPass.show}
                                            right={<TextInput.Icon name={currentPass.show ? 'eye-off' : 'eye'} color={theme.colors.placeholder} onPress={() => {
                                                currentPass.show = !currentPass.show
                                                this.setState({ currentPass })
                                            }} />}
                                        />

                                        <MyInput
                                            label="Nouveau mot de passe"
                                            returnKeyType="done"
                                            value={newPass.value}
                                            onChangeText={text => updateField(this, newPass, text)}
                                            error={!!newPass.error}
                                            errorText={newPass.error}
                                            autoCapitalize="none"
                                            secureTextEntry={!newPass.show}
                                            right={<TextInput.Icon name={newPass.show ? 'eye-off' : 'eye'} color={theme.colors.placeholder} onPress={() => {
                                                newPass.show = !newPass.show
                                                this.setState({ newPass })
                                            }} />}
                                        />
                                    </View>
                                }

                                {isProfileOwner &&
                                    <Button
                                        loading={loading}
                                        mode="contained"
                                        onPress={this.changePassword}
                                        style={{ width: constants.ScreenWidth * 0.85, alignSelf: 'center' }}>
                                        Modifier le mot de passe
                                </Button>
                                }

                            </View>
                        </View>
                        :
                        <Loading style={{ marginTop: constants.ScreenHeight * 0.4 }} size='large' />
                    }
                </ScrollView >

                <Toast
                    containerStyle={{ bottom: constants.ScreenWidth * 0.6 }}
                    message={toastMessage}
                    type={this.state.toastType}
                    onDismiss={() => this.setState({ toastMessage: '' })} />
            </View>
        )
    }
}

const mapStateToProps = (state) => {

    return {
        role: state.roles.role,
        permissions: state.permissions,
        network: state.network
        //fcmToken: state.fcmtoken
    }
}

export default connect(mapStateToProps)(Profile)

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.surface,
    },
    error: {
        fontSize: 14,
        color: theme.colors.error,
        paddingHorizontal: 4,
        paddingTop: 4
    },
    userImage: {
        width: constants.ScreenWidth * 0.17,
        height: constants.ScreenWidth * 0.17,
    },

});

