
import React, { Component } from 'react'
import { StyleSheet, View, ActivityIndicator } from 'react-native'

import Appbar from '../../components/Appbar'
import AddressSearch from '../../components/AddressSearch'
import MyInput from '../../components/TextInput'
import Toast from "../../components/Toast"
import Loading from "../../components/Loading"

import * as theme from "../../core/theme"
import { constants } from '../../core/constants'

import { emailValidator, updateField, load, setToast } from "../../core/utils"
import { handleReauthenticateError, handleUpdateEmailError } from "../../core/exceptions"

import firebase from '@react-native-firebase/app'
import Dialog from "react-native-dialog"

const db = firebase.firestore()

export default class Address extends Component {

    constructor(props) {
        super(props)
        this.handleSubmit = this.handleSubmit.bind(this)
        this.renderDialog = this.renderDialog.bind(this)

        this.userId = this.props.navigation.getParam('userId', '')
        this.currentUser = firebase.auth().currentUser //only owner can change his email

        this.state = {
            newEmail: { value: '', error: '' },
            password: { value: '', error: '' },

            toastType: '',
            toastMessage: '',

            showDialog: false,

            loading: false,
            statusLabel: "Confirmation de l'identité..."
        }
    }

    async handleSubmit() {
        let { newEmail, toastType, toastMessage } = this.state

        const emailError = this.verifyEmail()
        if (emailError) return

        this.setState({ showDialog: true })
    }

    verifyEmail() {
        let { newEmail } = this.state

        const emailError = emailValidator(newEmail.value)
        newEmail.error = emailError
        if (emailError) this.setState({ newEmail })

        return emailError
    }

    renderDialog = () => {
        let { password, showDialog, statusLabel, toastType, toastMessage, loading } = this.state

        if (loading)
            return (
                <View style={styles.dialogContainer}>
                    <Dialog.Container visible={this.state.showDialog}>
                        <Dialog.Title style={[theme.customFontMSsemibold.header, { marginBottom: 5 }]}>{statusLabel}</Dialog.Title>
                        <ActivityIndicator color={theme.colors.primary} size='small' />
                    </Dialog.Container>
                </View>
            )

        else
            return (
                <View style={styles.dialogContainer}>
                    <Dialog.Container visible={this.state.showDialog}>
                        <Dialog.Title style={[theme.customFontMSsemibold.header, { marginBottom: 5 }]}>Confirmation de l'identité</Dialog.Title>
                        <Dialog.Input
                            label="Votre mot de passe actuel"
                            returnKeyType="done"
                            value={password.value}
                            onChangeText={text => updateField(this, password, text)}
                            secureTextEntry
                            autoFocus={showDialog} />
                        <Dialog.Button label="Annuler" onPress={() => this.setState({ showDialog: false })} />
                        <Dialog.Button label="Confirmer" onPress={async () => await this.changeEmail()} />
                    </Dialog.Container>
                </View>
            )
    }

    async changeEmail() {

        let { newEmail, password } = this.state
        if (!newEmail.value || !password.value) return

        let emailCred = firebase.auth.EmailAuthProvider.credential(this.currentUser.email, password.value)

        load(this, true)

        const userCredential = await this.currentUser.reauthenticateWithCredential(emailCred).catch(e => this.handleReauthenticateError(e))
        if (!userCredential) {
            load(this, false)
            return
        }

        this.setState({ statusLabel: "Modification de l'adresse email..." })
        const emailUpdated = await this.currentUser.updateEmail(newEmail.value)
            .then(() => { return true })
            .catch(e => {
                this.handleUpdateEmailError(e)
                return false
            })

        if (!emailUpdated) {
            load(this, false)
            return
        }

        await db.collection('Users').doc(this.userId).update({ email: newEmail.value })
        newEmail = { value: '', error: '' }
        this.setState({ newEmail, showDialog: false }, () => {
            this.props.navigation.state.params.onGoBack('success', 'Adresse email modifiée avec succès')
            this.props.navigation.goBack()
        })

        this.setState({ loading: false, statusLabel: "Confirmation de l'identité..." })
    }

    handleReauthenticateError(e) {
        handleReauthenticateError(e)
        this.setState({ loading: false, password: { value: '', error: '' } })
    }

    handleUpdateEmailError(e) {
        const errorMessage = handleUpdateEmailError(e)
        this.setState({ loading: false, showDialog: false }, () => setToast(this, 'e', errorMessage))
    }

    render() {
        let { newEmail } = this.state

        return (
            <View style={{ flex: 1, backgroundColor: '#fff' }}>
                <Appbar back title titleText="Changer l'adresse email" check handleSubmit={this.handleSubmit} />
                <View style={{ flex: 1, padding: 20 }}>
                    <MyInput
                        label="Nouvelle adresse email"
                        returnKeyType="done"
                        value={newEmail.value}
                        onChangeText={text => updateField(this, newEmail, text)}
                        error={!!newEmail.error}
                        errorText={newEmail.error}
                        autoCapitalize="none"
                        autoCorrect={false}
                        autoCompleteType="email"
                        textContentType="emailAddress"
                        keyboardType="email-address" />
                    {this.renderDialog()}
                </View>

                <Toast
                    containerStyle={{ bottom: constants.ScreenWidth * 0.6 }}
                    message={this.state.toastMessage}
                    type={this.state.toastType}
                    onDismiss={() => this.setState({ toastMessage: '' })} />
            </View>
        )
    }
}


const styles = StyleSheet.create({
    dialogContainer: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: "center",
        justifyContent: "center",
    }
})