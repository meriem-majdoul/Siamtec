import React, { Component } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Keyboard } from 'react-native';
import { Card, Title } from 'react-native-paper'
import firebase from '@react-native-firebase/app';

import moment from 'moment';
import 'moment/locale/fr'
moment.locale('fr')


import Appbar from '../../components/Appbar'
import Picker from "../../components/Picker";
import AddressInput from '../../components/AddressInput'
import MyInput from '../../components/TextInput'
import RequestState from "../../components/RequestState";
import Toast from "../../components/Toast";
import MyFAB from "../../components/MyFAB";
import Loading from "../../components/Loading";

import * as theme from "../../core/theme";
import { constants } from "../../core/constants";
import { generatetId, navigateToScreen, myAlert, updateField, nameValidator, uuidGenerator, setToast, load } from "../../core/utils";

import { connect } from 'react-redux'
import CreateTicket from './CreateTicket';
import CreateProject from './CreateProject';

const db = firebase.firestore()

const departments = [
    { label: 'Commercial', value: 'Commercial' },
    { label: 'Facturation et suivi de projet', value: 'Facturation et suivi de projet' },
    { label: 'Conseil technique', value: 'Conseil technique' },
    { label: 'Incident', value: 'Incident' },
]

class CreateRequest extends Component {
    constructor(props) {
        super(props)
        this.refreshClient = this.refreshClient.bind(this)
        this.refreshAddress = this.refreshAddress.bind(this)

        this.handleSubmit = this.handleSubmit.bind(this)
        this.myAlert = myAlert.bind(this)

        this.initialState = {}
        this.isInit = true
        this.currentUser = firebase.auth().currentUser
        this.requestType = this.props.requestType
        this.isTicket = this.requestType === 'ticket' ? true : false
        //this.isProject = false

        this.RequestId = this.props.navigation.getParam('RequestId', '')
        this.isEdit = this.RequestId ? true : false

        this.state = {
            idCount: 0,
            RequestId: '', //Not editable
            client: { id: '', fullName: '' },

            department: 'Incident', //ticket
            address: { description: '', place_id: '' }, //project

            subject: { value: "", error: '' },
            description: { value: "", error: '' },
            state: 'En attente',

            createdAt: '',
            createdBy: { id: '', userName: '' },
            editedAt: '',
            editedBy: { id: '', userName: '' },

            error: '',
            loading: false,
            toastMessage: '',
            toastType: ''
        }
    }

    async componentDidMount() {
        //Edition
        if (this.isEdit)
            this.fetchRequest()

        //Creation
        else {
            const RequestId = this.isTicket ? generatetId('GS-DTC-') : generatetId('GS-DPR-')
            this.setState({ RequestId }, () => this.initialState = this.state)
        }
    }

    fetchRequest() {
        db.collection('Requests').doc(this.RequestId).get().then((doc) => {
            let { RequestId, department, client, subject, state, description, address } = this.state
            let { createdAt, createdBy, editedAt, editedBy } = this.state

            const request = doc.data()
            //General info
            RequestId = doc.id
            client = client
            subject.value = request.subject
            description.value = request.description
            this.chatId = request.chatId

            //َActivity
            createdAt = request.createdAt
            createdBy = request.createdBy
            editedAt = request.editedAt
            editedBy = request.editedBy

            //State
            state = request.state

            if (this.isTicket)
                department = request.department

            else
                address = request.address

            this.setState({ createdAt, createdBy, editedAt, editedBy })
            this.setState({ RequestId, client, department, subject, description, address, state }, () => {
                if (this.isInit)
                    this.initialState = this.state

                this.isInit = false
            })
        })
    }

    refreshClient(isPro, id, nom, prenom) {
        const fullName = isPro ? nom : prenom + ' ' + nom
        const client = { id, fullName }
        this.setState({ client })
    }

    refreshAddress(address) {
        this.setState({ address })
    }

    validateInputs() {
        let { client, subject } = this.state

        let clientError = nameValidator(client.fullName, '"Client"')
        let subjectError = nameValidator(subject.value, '"Sujet"')
        //let addressError = nameValidator(address.description, '"Adresse postale"')

        if (clientError || subjectError) {
            subject.error = subjectError
            Keyboard.dismiss()
            this.setState({ clientError, subject, loading: false })
            setToast(this, 'e', 'Erreur de saisie, veuillez verifier les champs.')
            return false
        }

        return true
    }

    async AddRequestAndChatRoom(RequestId, request) {
        const chat = {
            name: this.state.subject.value,
            latestMessage: {
                text: `La demande de projet a été initiée.`,
                createdAt: new Date().getTime()
            }
        }

        const messageId = await uuidGenerator()
        const systemMessage = {
            _id: messageId,
            text: `La demande de projet a été initiée.`,
            createdAt: new Date().getTime(),
            system: true
        }

        //Batch write
        const batch = db.batch()

        const chatId = await uuidGenerator()

        const requestsRef = db.collection('Requests').doc(RequestId)
        const chatRef = db.collection('Chats').doc(chatId)
        const messagesRef = chatRef.collection('Messages').doc(messageId)

        request.chatId = chatId

        batch.set(requestsRef, request, { merge: true })
        batch.set(chatRef, chat)
        batch.set(messagesRef, systemMessage)

        batch.commit()

        // .catch((e) => {
        //     setToast(this, 'e', 'Erreur lors de la création de la demande, veuillez réessayer.')
        //     load(this, false)
        // })
    }

    async handleSubmit() {
        const { error, loading } = this.state
        if (loading || this.state === this.initialState) return
        load(this, true)

        //1. Validate inputs
        const isValid = this.validateInputs()
        if (!isValid) return

        //2. ADDING REQUEST DOCUMENT
        const { RequestId, client, department, subject, description, address, state } = this.state
        const currentUser = { id: this.currentUser.uid, userName: this.currentUser.displayName }

        let request = {
            RequestId: RequestId,
            client: client,
            subject: subject.value,
            description: description.value,
            state: state,
            editedAt: moment().format(),
            editedBy: currentUser
        }

        if (this.isTicket) {
            request.department = department
            request.type = 'ticket'
        }

        else {
            request.address = address
            request.type = 'projet'
        }

        if (!this.isEdit) {
            request.createdAt = moment().format('lll')
            request.createdBy = currentUser
        }

        console.log('Ready to add request...')

        if (this.isEdit)
            db.collection('Requests').doc(RequestId).set(request, { merge: true })

        else
            this.AddRequestAndChatRoom(RequestId, request)

        load(this, false)
        this.props.navigation.goBack()
    }

    renderStateToggle(currentState, canUpdate) {
        console.log('canUpdate', canUpdate)
        const label = this.isTicket ? 'ticket' : 'projet'
        return <RequestState state={currentState} onPress={(state) => this.alertUpdateRequestState(state, label, canUpdate)} />
    }

    alertUpdateRequestState(nextState, label, canUpdate) {
        if (nextState === this.state.state || !canUpdate) return

        const title = "Mettre à jour le " + label
        const message = "Etes-vous sûr de vouloir changer l'état de ce " + label + ' ?'
        const handleConfirm = () => this.updateRequestState(nextState)

        this.myAlert(title, message, handleConfirm)
    }

    updateRequestState(nextState) {
        db.collection('Requests').doc(this.RequestId).update({ state: nextState })
            .then(() => {
                this.setState({ state: nextState })
                // this.fetchRequest()
            })
            .catch((e) => setToast(this, 'e', "Erreur lors de la mise à jour de l'état de la demande"))
    }

    render() {
        const { RequestId, client, department, subject, state, description, address } = this.state
        const { createdAt, createdBy, editedAt, editedBy, loading, toastMessage, toastType, clientError, addressError } = this.state
        const { requestType } = this.props
        let { canUpdate, canDelete } = this.props.permissions.requests
        canUpdate = (canUpdate || !this.isEdit)
        const { isConnected } = this.props.network

        const title = ' Demande de ' + requestType
        const prevScreen = requestType === 'ticket' ? 'CreateTicketReq' : 'CreateProjectReq'

        return (
            <View style={styles.container}>
                <Appbar back close title titleText={title} check handleSubmit={this.handleSubmit} />

                {loading ?
                    <Loading size='large' />
                    :
                    <ScrollView style={styles.container} contentContainerStyle={{
                        backgroundColor: '#fff',
                        padding: constants.ScreenWidth * 0.02,
                        // paddingBottom: 80
                    }}>

                        <Card style={{ marginBottom: 20 }}>
                            <Card.Content>
                                <Title>Informations générales</Title>
                                <MyInput
                                    label="Numéro de la demande"
                                    returnKeyType="done"
                                    value={RequestId}
                                    editable={false}
                                />

                                <TouchableOpacity onPress={() => navigateToScreen(this, canUpdate, 'ListClients', { onGoBack: this.refreshClient, prevScreen: prevScreen, titleText: 'Clients' })}>
                                    <MyInput
                                        label="Client"
                                        value={client.fullName}
                                        error={!!clientError}
                                        errorText={clientError}
                                        editable={false}
                                    />
                                </TouchableOpacity>

                                {this.isTicket ?
                                    <Picker
                                        label="Département"
                                        returnKeyType="next"
                                        value={department}
                                        error={!!department.error}
                                        errorText={department.error}
                                        selectedValue={department}
                                        onValueChange={(department) => this.setState({ department })}
                                        title="Département"
                                        elements={departments}
                                        enabled={canUpdate}
                                    />
                                    :
                                    <AddressInput
                                        label='Adresse postale'
                                        offLine={!isConnected}
                                        onPress={() => navigateToScreen(this, canUpdate, 'Address', { onGoBack: this.refreshAddress })}
                                        address={address}
                                        addressError={addressError} />
                                }

                                <MyInput
                                    label="Sujet"
                                    returnKeyType="done"
                                    value={subject.value}
                                    onChangeText={text => updateField(this, subject, text)}
                                    error={!!subject.error}
                                    errorText={subject.error}
                                    editable={canUpdate}
                                />

                                <MyInput
                                    label="Description"
                                    returnKeyType="done"
                                    value={description.value}
                                    onChangeText={text => updateField(this, description, text)}
                                    error={!!description.error}
                                    errorText={description.error}
                                    editable={canUpdate}
                                />

                            </Card.Content>
                        </Card>

                        {this.isEdit &&
                            <Card>
                                <Card.Content>
                                    <Title>Activité</Title>
                                    <MyInput
                                        label="Date de création"
                                        returnKeyType="done"
                                        value={createdAt}
                                        editable={false}
                                    />
                                    <MyInput
                                        label="Auteur"
                                        returnKeyType="done"
                                        value={createdBy.userName}
                                        editable={false}
                                    />
                                    <MyInput
                                        label="Dernière mise à jour"
                                        returnKeyType="done"
                                        value={editedAt}
                                        editable={false}
                                    />
                                    <MyInput
                                        label="Dernier intervenant"
                                        returnKeyType="done"
                                        value={editedBy.userName}
                                        editable={false}
                                    />
                                </Card.Content>
                            </Card>
                        }
                    </ScrollView>

                }

                <Toast
                    containerStyle={{ bottom: constants.ScreenWidth * 0.6 }}
                    message={toastMessage}
                    type={toastType}
                    onDismiss={() => this.setState({ toastMessage: '' })} />

                {this.isEdit &&
                    <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10, paddingRight: 15, backgroundColor: '#eee', elevation: 3 }}>
                        <MyFAB
                            onPress={() => this.props.navigation.navigate('Chat', { chatId: this.chatId })}
                            icon='chat-processing'
                            style={styles.fab} />
                        {this.renderStateToggle(state, canUpdate)}
                    </View>}
            </View>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        role: state.roles.role,
        permissions: state.permissions,
        network: state.network,
        //fcmToken: state.fcmtoken
    }
}

export default connect(mapStateToProps)(CreateRequest)

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background
    },
    fab: {
        //flex: 1,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'flex-end',
        marginBottom: 10,
        width: constants.ScreenWidth * 0.13,
        height: constants.ScreenWidth * 0.13,
        borderRadius: 100,
    }
});

