import React, { Component } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Keyboard } from 'react-native';
import { List } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Entypo'
import { connect } from 'react-redux'
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import DocumentPicker from 'react-native-document-picker';

import moment from 'moment';
import 'moment/locale/fr'
moment.locale('fr')

import Appbar from '../../components/Appbar'
import CustomIcon from '../../components/CustomIcon'
import TextInput from '../../components/TextInput'
import { TextInput as MessageInput } from 'react-native'
import AutoCompleteUsers from '../../components/AutoCompleteUsers'
import UploadProgress from '../../components/UploadProgress'
import Toast from '../../components/Toast'

import { db, auth } from '../../firebase'
import * as theme from "../../core/theme";
import { constants } from "../../core/constants";
import { load, setToast, updateField, nameValidator, uuidGenerator, pickDocs, displayError } from '../../core/utils'

import { fetchDocs, fetchDocuments } from '../../api/firestore-api';
import { uploadFiles } from '../../api/storage-api';
import AutoCompleteProducts from '../../components/AutoCompleteProducts';

class NewMessage extends Component {
    constructor(props) {
        super(props)
        this.currentUser = auth.currentUser

        const { route } = this.props;
        
        //Navigation params
        this.isReply = route?.params?.isReply ?? false;
        this.title = this.isReply ? 'Répondre' : 'Nouveau message';
        this.messageGroupeId = route?.params?.messageGroupeId ?? false;
        this.subject = route?.params?.subject ?? '';
        this.tagsSelected = route?.params?.tagsSelected ?? [];
        this.oldMessages = route?.params?.oldMessages ?? [];
        this.subscribers = route?.params?.subscribers ?? [];

        //this.fetchDocs = fetchDocs.bind(this)
        this.uploadFiles = uploadFiles.bind(this)

        this.state = {
            //payload
            tagsSelected: this.tagsSelected,
            subject: { value: this.subject, error: "" },
            message: { value: "", error: "" },
            previousSubscribers: this.subscribers,
            attachments: [], //attachments picked
            messagesCount: 0,

            //old messages
            accordionExpanded: true,
            oldMessages: this.oldMessages,

            //db
            suggestions: [],
            suggestionsCount: 0,

            loading: false,
            error: "",
            toastType: '',
            toastMessage: '',
        }
    }

    async componentDidMount() {
        await this.fetchSuggestions()
    }

    async fetchSuggestions() {
        const query = db.collection('Users')
        const suggestions = await fetchDocuments(query)
        this.setState({ suggestions, suggestionsCount: suggestions.length, loading: false })
    }

    //PICKER
    async pickDocs() {
        try {
            var { attachments } = this.state
            const types = [DocumentPicker.types.pdf, DocumentPicker.types.images]
            const newAttachments = await pickDocs(attachments, types)
            this.setState({ attachments: newAttachments })
        }
        catch (e) {
            const { message } = e
            displayError({ message })
        }
    }

    //SUBMIT
    validateInputs() {
        let { tagsSelected, subject, message } = this.state

        let tagsSelectedError = tagsSelected.length === 0 ? 'Aucun destinataire selectionné' : ''
        let subjectError = nameValidator(subject.value, '"Sujet"')
        let messageError = nameValidator(message.value, '"Message"')

        if (tagsSelectedError || subjectError || messageError) {
            Keyboard.dismiss()
            load(this, false)
            const error = tagsSelectedError || subjectError || messageError
            setToast(this, 'e', error)

            return false
        }

        return true
    }

    handleSend = async () => {
        const { loading, attachments } = this.state
        const { isConnected } = this.props.network

        //0. Handle isLoading or No edit done
        if (loading) return
        load(this, true)

        //1. Validate inputs
        const isValid = this.validateInputs()
        if (!isValid) return

        this.title = 'Envoie du message...'

        //2. UPLOADING FILES #Online 
        let uploadedAttachments = []
        if (isConnected && attachments.length > 0) {
            const storageRefPath = '/Inbox/Messages/'
            uploadedAttachments = await this.uploadFiles(attachments, storageRefPath)

            if (!uploadedAttachments) {
                uploadedAttachments = []
                this.title = this.isReply ? 'Répondre' : 'Nouveau message'
                return
            }

            this.setState({ attachments: uploadedAttachments })
        }

        //3. ADDING MESSAGE DOCUMENT
        let { tagsSelected, subject, message, messagesCount, oldMessages, previousSubscribers } = this.state

        //Sender
        const sender = {
            id: this.currentUser.uid,
            fullName: this.currentUser.displayName,
            email: this.currentUser.email,
            role: this.props.role.value
        }
        const senderId = this.currentUser.uid

        //Receivers
        const receivers = tagsSelected.map((tag) => {
            const { id, fullName, email, role } = tag
            const receiver = {
                id,
                fullName,
                email,
                role,
            }
            return receiver
        })
        const receiversIds = receivers.map((receiver) => receiver.id)

        //Speakers = Sender + Receivers
        const speakers = receivers.concat([sender])
        const speakersIds = receiversIds.concat([senderId])

        //Subscribers: previous subscribers + new subscribers (Receivers + nonReceivers) --> accumulation: ALL users involved in the discussion
        let subscribers = speakers.map(speaker => speaker.id)
        subscribers = subscribers.concat(previousSubscribers)
        subscribers = [...new Set([...subscribers, ...previousSubscribers])]

        //haveRead = [SenderId, nonReceivers]
        const nonReceiversIds = subscribers.filter(id => !receiversIds.includes(id))
        let haveRead = nonReceiversIds
        haveRead.push(senderId)

        //format oldMessages
        oldMessages = oldMessages.filter((msg) => msg !== '')

        const latestMessage = {
            sender,
            receivers, // receivers of the last message
            receiversIds,
            nonReceiversIds,
            speakers,
            speakersIds,
            subscribers,
            mainSubject: subject.value,
            message: message.value,
            sentAt: moment().format(),
            messagesCount: messagesCount + 1,
            haveRead
        }

        const msg = {
            sender,
            receivers,
            receiversIds,
            speakers,
            speakersIds,
            subject: subject.value,
            message: message.value,
            attachments: uploadedAttachments,
            sentAt: moment().format(),
            oldMessages,
        }

        if (this.isReply)
            await this.sendReply(latestMessage, msg)

        else
            await this.sendNewMessage(latestMessage, msg)

        this.props.navigation.goBack()
    }

    //#OOS
    async sendNewMessage(latestMessage, msg) {
        const messageId = await uuidGenerator()
        const batch = db.batch()
        const messagesRef = db.collection('Messages').doc(messageId)
        const allMessagesRef = messagesRef.collection('AllMessages').doc()
        batch.set(messagesRef, latestMessage)
        batch.set(allMessagesRef, msg)
        batch.commit()
    }

    //#OOS
    async sendReply(latestMessage, msg) {
        const batch = db.batch()
        const messagesRef = db.collection('Messages').doc(this.messageGroupeId)
        const allMessagesRef = messagesRef.collection('AllMessages').doc()
        batch.set(messagesRef, latestMessage, { merge: true })
        batch.set(allMessagesRef, msg)
        batch.commit()
    }

    //Renderers
    renderAttachments() {
        let { attachments, loading } = this.state

        const onPressRightIcon = (key) => {
            attachments.splice(key, 1)
            this.setState({ attachments })
        }

        const rightIconStyle = { flex: 0.15, justifyContent: 'center', alignItems: 'center' }

        return attachments.map((document, key) => {
            return (
                <UploadProgress
                    attachment={document}
                    showRightIcon
                    rightIcon={
                        <TouchableOpacity style={rightIconStyle} onPress={() => onPressRightIcon(key)}>
                            {!loading && <CustomIcon icon={faTimes} color={theme.colors.gray_dark} />}
                        </TouchableOpacity>
                    }
                />
            )
        })
    }

    renderOldMessages() {
        let { oldMessages, loading } = this.state

        return (
            <View style={{ marginBottom: 15, marginLeft: constants.ScreenWidth * 0.045 }}>
                <View>
                    {oldMessages.map((msg, key) => {
                        const sentAtDate = moment(msg.sentAt).format('ll')
                        const sentAtTime = moment(msg.sentAt).format('LT')
                        const sender = msg.sender.fullName
                        const message = msg.message

                        return (
                            <View key={key.toString()} style={{ borderLeftWidth: 1, borderLeftColor: theme.colors.gray2, marginLeft: key * 5, marginBottom: 5 }}>
                                <MessageInput
                                    style={styles.messageInput}
                                    underlineColor="transparent"
                                    returnKeyType="done"
                                    value={'Le ' + sentAtDate + ' à ' + sentAtTime + ' \n ' + sender + ' a écrit : ' + '\n ' + message}
                                    onChangeText={text => {
                                        oldMessages.splice(key, 1)
                                        this.setState({ oldMessages })
                                    }}
                                    multiline={true}
                                    theme={{ colors: { primary: '#fff', text: '#333' } }}
                                    selectionColor='#333'
                                    editable={!loading}
                                />
                            </View>
                        )
                    })}
                </View>
            </View>
        )
    }

    render() {
        let { tagsSelected, subject, message, suggestions, accordionExpanded, oldMessages, loading, toastType, toastMessage } = this.state
        const { isConnected } = this.props.network

        return (
            <View style={styles.container}>
                <Appbar
                    close
                    title
                    titleText={this.title}
                    send={!loading}
                    handleSend={this.handleSend}
                    attach={!loading && isConnected}
                    handleAttachement={this.pickDocs.bind(this)}
                    loading={loading}
                />
                <ScrollView keyboardShouldPersistTaps="never" style={styles.form}>

                    <View style={{ flexDirection: 'row', marginBottom: constants.ScreenHeight * 0.01 }}>
                        <View style={{ flexDirection: 'row' }}>
                            <Text>De         </Text>
                            <Text>{this.currentUser.displayName}</Text>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: "flex-end", zIndex: 1, marginBottom: 8 }}>
                        <Text style={{ marginTop: 13 }}>À           </Text>

                        <AutoCompleteUsers
                            suggestions={suggestions}
                            tagsSelected={tagsSelected}
                            main={this}
                            placeholder="Ajouter un destinataire"
                            //autoFocus={true}
                            showInput={true}
                            suggestionsBellow={true}
                            editable={!loading}
                        />

                        <Icon style={{ marginTop: 10 }} name='chevron-down' size={15} color={theme.colors.placeholder} />
                    </View>

                    <TextInput
                        label="Sujet"
                        returnKeyType="done"
                        value={subject.value}
                        onChangeText={text => updateField(this, subject, text)}
                        error={!!subject.error}
                        errorText={subject.error}
                        editable={!this.isReply && !loading}
                    />

                    <View style={{ flex: 1, backgroundColor: '#fff', elevation: 0 }}>
                        <MessageInput
                            // label="Message"
                            ref={ref => { this.messageInputRef = ref }}
                            placeholder='Rédigez votre message...'
                            underlineColor="transparent"
                            value={message.value}
                            onChangeText={text => updateField(this, message, text)}
                            error={!!message.error}
                            errorText={message.error}
                            multiline={true}
                            theme={{ colors: { primary: '#fff', text: '#333' } }}
                            selectionColor='#333'
                            style={styles.messageInput}
                            editable={!loading}
                        //autoFocus={this.isReply}
                        />

                        <View style={{ paddingTop: 30 }}>
                            {this.renderAttachments()}
                        </View>

                        {this.isReply && oldMessages.length > 0 &&
                            <List.Accordion
                                id={message.id}
                                expanded={accordionExpanded}
                                onPress={() => this.setState({ accordionExpanded: !accordionExpanded })}
                                //style={{ paddingVertical: constants.ScreenHeight * 0.03, borderBottomWidth: !isExpanded ? StyleSheet.hairlineWidth * 0.5 : 0, borderBottomColor: theme.colors.gray2 }}
                                titleComponent={<Text style={[theme.customFontMSbold.h1, { color: theme.colors.primary }]}>...</Text>}
                                arrowColor={theme.colors.primary}
                                // description={message.message}
                                theme={{ colors: { primary: '#333' } }}
                                style={{ marginLeft: - constants.ScreenWidth * 0.04 }}
                            >

                                {this.renderOldMessages()}

                            </List.Accordion>
                        }
                    </View>

                    {!accordionExpanded &&
                        <TouchableOpacity style={{ width: '100%', height: 300 }} onPress={() => this.messageInputRef.focus()} />
                    }

                </ScrollView>

                <Toast
                    containerStyle={{ bottom: constants.ScreenWidth * 0.6 }}
                    message={toastMessage}
                    type={toastType}
                    onDismiss={() => this.setState({ toastMessage: '' })} />
            </View >
        )
    }
}

const mapStateToProps = (state) => {
    return {
        role: state.roles.role,
        network: state.network,
        documents: state.documents
        //fcmToken: state.fcmtoken
    }
}

export default connect(mapStateToProps)(NewMessage)



const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingBottom: 15,
        backgroundColor: theme.colors.background
    },
    form: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 15,
        paddingTop: 30,
        paddingBottom: 15
    },
    messageInput: {
        width: "100%",
        //alignSelf: 'center',
        backgroundColor: 'transparent',
        //textAlign: 'center',
        marginTop: 10,
        paddingVertical: 0,
    },
});