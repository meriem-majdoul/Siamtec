import React, { Component,forwardRef  } from 'react'
import { GiftedChat, Bubble, Send, SystemMessage, Day, Time, Actions,InputToolbar  } from 'react-native-gifted-chat'
import { TouchableOpacity, ActivityIndicator, View, StyleSheet, Text, Alert, ImageBackground } from 'react-native'
import { faCommentDots } from '@fortawesome/free-solid-svg-icons'
import DocumentPicker from '@react-native-documents/picker';
import RNFS from 'react-native-fs'
import { IconButton } from 'react-native-paper'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { Thumbnail } from 'react-native-thumbnail-video'
import ImageView from 'react-native-image-view'
import _ from 'lodash'

import moment from 'moment'
import 'moment/locale/fr'
moment.locale('fr')

import { connect } from 'react-redux'

import Appbar from '../../components/Appbar'
import CustomIcon from '../../components/CustomIcon'
import UploadProgress from '../../components/UploadProgress'
import Toast from '../../components/Toast'
import Loading from '../../components/Loading'

import { uuidGenerator, setAttachmentIcon, downloadFile, getRoleIdFromValue, displayError, setToast } from '../../core/utils'

import firebase, { db } from '../../firebase'
import * as theme from '../../core/theme'
import { constants, errorMessages, isTablet } from '../../core/constants'
import { uploadFiles } from '../../api/storage-api'
import EmptyList from '../../components/EmptyList';

const mp4 = 'video/mp4'
const jpeg = 'image/jpeg'
const png = 'image/png'
const pdf = 'application/pdf'
const doc = 'application/msword'
const docx = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
const type = ['image/*', 'video/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']

class Chat extends Component {

    constructor(props) {
        super(props)
        this.currentUser = firebase.auth().currentUser
        this.chatId = this.props.route?.params?.chatId ?? '';
        // console.log("props: ", this.chatId); 

        this.videoPlayer = null

        this.fetchMessages = this.fetchMessages.bind(this)
        this.handleSend = this.handleSend.bind(this)
        this.pickFilesAndSendMessage = this.pickFilesAndSendMessage.bind(this)
        this.handleUpload = this.handleUpload.bind(this)
        this.uploadFiles = uploadFiles.bind(this)
        this.renderMessageVideo = this.renderMessageVideo.bind(this)
        this.renderMessageImage = this.renderMessageImage.bind(this)
        this.renderCustomView = this.renderCustomView.bind(this)
        this.toggleImageView = this.toggleImageView.bind(this)

        this.state = {
            messages: [],
            attachments: [],
            attachedFiles: [],
            imageSource: '',
            videoSource: '',
            file: {},

            showVideoPlayer: false,
            videoUrl: '',

            displayImageViewer: false,
            imageUrl: '',

            loading: false,
            toastMessage: '',
            toastType: ''
        }
    }

    async componentDidMount() {
        this.fetchMessages()
    }

    componentWillUnmount() {
        this.messagesListener()
    }

    fetchMessages() {
        this.messagesListener = db
            .collection('Chats')
            .doc(this.chatId)
            .collection('ChatMessages')
            .orderBy('createdAt', 'desc')
            .onSnapshot(querySnapshot => {
                const messages = querySnapshot.docs.map(doc => {
                    const message = doc.data();
    
                    if (!message.system && message.user) {
                        message.user._id = message.user.id || message.user._id; 
                        message.user.name = message.user.fullName || message.user.name;
                    }
    
                    if (message.createdAt && typeof message.createdAt.toDate === 'function') {
                        message.createdAt = message.createdAt.toDate();
                    }
    
                    return message;
                });
    
                this.setState({ messages });
            });
    }
    
    
    // Assurez-vous de déconnecter le listener lorsque le composant est démonté
    componentWillUnmount() {
        if (this.messagesListener) {
            this.messagesListener();
        }
    }
    

    async pickFilesAndSendMessage() {
        let attachments = []

        try {
            const results = await DocumentPicker.pickMultiple({ type })

            for (const res of results) {
                //android only
                if (res.uri.startsWith('content://')) { //#task remove this condition (useless..)
                    //1. Copy file to Cach to get its relative path (Documentpicker provides only absolute path which can not be used to upload file to firebase)
                    const destPath = `${RNFS.TemporaryDirectoryPath}/${'temporaryDoc'}${Date.now()}-${Math.floor(Math.random() * 100)}`
                    await RNFS.copyFile(res.uri, destPath)

                    const document = {
                        path: destPath,
                        type: res.type,
                        name: res.name, //#task: not used for video/image
                        size: res.size, //#task: not used for video/image
                        progress: 0
                    }

                    const { path, type, name, size } = document
                    if (type === mp4)
                        this.setState({ videoSource: path })
                    else if (type === png || type === jpeg)
                        this.setState({ imageSource: path })
                    else if (type === pdf || type === doc || type === docx)
                        this.setState({ file: { source: path, type, name, size } })

                    const messageId = await uuidGenerator()
                    document.messageId = messageId

                    await this.handleSend([{ text: '' }], messageId) //#task: get text using chat ref //#task2: add intermediary screen to crop/and adjust images
                    attachments.push(document)
                }
            }
            return attachments
        }

        catch (err) {
            if (!DocumentPicker.isCancel(err))
                displayError({ message: err })
            return null
        }
    }

    async handleUpload() {
        try {
            //PICK FILES & SEND MESSAGE
            const attachments = await this.pickFilesAndSendMessage()
            if (!attachments) return

            //UPLOAD FILES 
            const storageRefPath = `/Chat/${this.chatId}/`
            const uploadedAttachments = await this.uploadFiles(attachments, storageRefPath, true, this.chatId)
            if (!uploadedAttachments) throw new Error(errorMessages.documents.upload)

            for (const attachedFile of uploadedAttachments) { //attachedFile contains uploadTask: It can be used to cancel/pause/resume the upload
                const { downloadURL, name, size, type, messageId } = attachedFile
                let payload = { pending: false, sent: true, received: true }

                if (type === jpeg || type === png)
                    payload.image = downloadURL

                else if (type === mp4)
                    payload.video = downloadURL

                else if (type === pdf || type === doc || type === docx)
                    payload.file = { source: downloadURL, name, size, type: type }

                await db.collection('Chats').doc(this.chatId).collection('ChatMessages').doc(messageId).update(payload)
            }
        }
        catch (e) {
            const { message } = e
            displayError({ message })
        }
    }

    async handleSend(messages, messageId) {


        try {
            const text = messages[0].text

            const { imageSource, videoSource, file } = this.state

            if (!messageId)
                var messageId = await uuidGenerator()

            const msg = {
                _id: messageId,
                text,
                createdAt: new Date().getTime(),
                user: {
                    id: this.currentUser.uid,
                    email: this.currentUser.email,
                    fullName: this.currentUser.displayName
                },
                sent: true,
                received: true,
                pending: false,
            }

            console.log("Message date", msg.createdAt)

            // Handle attachments
            if (imageSource || videoSource || file && file.source) {
                console.log('imageSource', imageSource)

                msg.sent = false
                msg.received = false
                msg.pending = true //Only local user can see this file

                if (imageSource) {
                    msg.image = imageSource
                    msg.messageType = 'image/jpeg'
                }

                else if (videoSource) {
                    msg.video = videoSource
                    msg.messageType = 'video/mp4'
                }

                if (!_.isEmpty(file)) {
                    const { source, name, size, type } = file
                    msg.file = { source, name, size, type }
                }
            }

            const batch = db.batch()
            const chatsRef = db.collection('Chats').doc(this.chatId)
            const messagesRef = db.collection('Chats').doc(this.chatId).collection('ChatMessages').doc(messageId)

            batch.set(chatsRef, msg)
            batch.set(messagesRef, msg)
            batch.commit()

            this.setState({ imageSource: '', videoSource: '', file: {} })
        }
        catch (e) {
            displayError({ message: errorMessages.chat })
        }

    }


    //Renderers
    renderDay(props) {
        return
        <View style={{ flex: 1, backgroundColor: 'green', width: 500, height: 500 }}>
            <Text>Hey</Text>
        </View>
    }

    renderBubbleWithCustomTextStyle(props) {
        return (
        <Bubble
            {...props}

            wrapperStyle={{
                right: {
                    backgroundColor: "#3eb47a",
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 0,
                    borderBottomRightRadius: 20,
                    borderBottomLeftRadius: 20,
                    padding: 10,
                    marginBottom: 12
                },
                left: {
                    backgroundColor: "#f5f6fa",
                    borderTopLeftRadius: 0,
                    borderTopRightRadius: 20,
                    borderBottomRightRadius: 20,
                    borderBottomLeftRadius: 20,
                    padding: 10,
                    marginBottom: 12
                }
            }}

            textStyle={{
                right: [isTablet ? theme.customFontMSmedium.body : theme.customFontMSmedium.caption, {
                    color: '#fff',
                    marginBottom: 0,
                    lineHeight: isTablet ? 30 : undefined
                }],
                left: [isTablet ? theme.customFontMSmedium.body : theme.customFontMSmedium.caption, {
                    color: '#333',
                    marginBottom: 0,
                    lineHeight: isTablet ? 30 : undefined
                }]
            }}
            timeTextStyle={{
                right: { color: '#fff', opacity: 0.9, fontSize: 16 },
                left: { color: '#fff' },
            }}
            tickStyle={{ color: props.currentMessage.seen ? '#fff' : '#000' }}
            usernameStyle={{ color: theme.colors.gray_dark, marginTop: 10, fontSize: 14 }}
        />
    )}

    renderLoading() {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size='large' color='#fff' />
            </View>
        )
    }

    renderSend(props) {
        return (
            <Send {...props}>
                <View style={styles.sendingContainer}>
                    <IconButton icon='send-circle' size={33} color={theme.colors.primary} />
                </View>
            </Send>
        )
    }

    scrollToBottomComponent() {
        return (
            <View style={styles.bottomComponentContainer}>
                <IconButton icon='chevron-double-down' size={36} color='#6646ee' />
            </View>
        )
    }

    renderSystemMessage(props) {
        return (
            <SystemMessage
                {...props}
                wrapperStyle={styles.systemMessageWrapper}
                textStyle={[theme.customFontMSmedium.caption, styles.systemMessageText]}
                containerStyle={{ marginHorizontal: 25, }}
            />
        );
    }

    renderActions(props, isConnected) {
        if (!isConnected) return null

        else return (
            <Actions
                {...props}
                // options={{
                //     ['Choisir une image']: this.handlePickImage,
                // }}
                icon={() => (
                    <MaterialCommunityIcons name={'attachment'} size={28} color={theme.colors.primary} />
                )}
                onPressActionButton={this.handleUpload}
            />
        )
    }

    sendSystemMessage(message) {
        db.collection('Chats').doc(this.chatId).collection('ChatMessages').add({
            text: message,
            createdAt: new Date().getTime(),
            system: true
        })
    }

    //Files (pdf, docs...)
    renderCustomView(props) {
        // return <ChatCustomView {...props} />
        const { messageType, pending, file } = props.currentMessage

        if (file && file.source) {

            const icon = setAttachmentIcon(messageType)
            const url = pending ? `file:///${file}` : file

            return (
                <UploadProgress
                    attachment={file}
                    showProgress={false}
                    containerStyle={{ width: constants.ScreenWidth * 0.65, marginHorizontal: 5 }}
                    onPress={() => {
                        if (pending) return
                        setToast(this, 'i', 'Début du téléchargement...')
                        downloadFile(file.name, file.source)
                    }}
                    showRightIcon={pending}
                    rightIcon={
                        <View style={{ flex: 0.15, justifyContent: 'center', alignItems: 'center' }}>
                            <Loading size='small' />
                        </View>
                    }
                />
            )
        }

        else return null
    }

    //Videos
    renderMessageVideo(props, navigation) {
        const { currentMessage } = props
        const { video, pending } = currentMessage

        return (
            <TouchableOpacity
                style={[styles.messageVideo, { backgroundColor: '#000' }]}
                onPress={() => {
                    if (pending) return
                    navigation.navigate('VideoPlayer', { videoUrl: video })
                }}>
                {pending ?
                    <Loading size={50} />
                    :
                    <MaterialCommunityIcons
                        name='play-circle'
                        color='#fff'
                        size={60}
                        style={{ position: 'absolute' }} />
                }
            </TouchableOpacity>
        )

        // else return (
        //     <TouchableOpacity onPress={() => this.runVideoPlayer(currentMessage.video)} style={styles.messageVideo}>
        //         <Thumbnail url={video} /> //#task: works only with youtube
        //     </TouchableOpacity >
        // )
    }

    //Images
    renderMessageImage(props) {
        const { pending, image } = props.currentMessage
        const uri = pending ? `file:///${image}` : image

        return (
            <TouchableOpacity onPress={() => this.displayImageViewer(uri)} onLongPress={() => console.log('display UI to delete image')}>
                <ImageBackground
                    source={{
                        uri: uri,
                        cache: 'only-if-cached'
                    }}
                    style={{ width: 200, height: 200, justifyContent: 'center', alignItems: 'center' }}>
                    {props.currentMessage.pending && <Loading size={50} />}
                    {/* <MaterialCommunityIcons
                        onPress={() => props.currentMessage.uploadTask.cancel()}
                        name='close-circle'
                        color='pink'
                        size={33}
                        style={{ position: 'absolute' }} /> */}
                </ImageBackground>
            </TouchableOpacity>
        )
    }

    displayImageViewer(url) {
        this.setState({ isImageViewVisible: true, imageUrl: url })
    }

    toggleImageView() {
        this.setState({ isImageViewVisible: !this.state.isImageViewVisible })
    }

    renderChatEmpty() {
        return (
            <View style={styles.chatEmpty}>
                <EmptyList icon={faCommentDots} iconColor={theme.colors.miRequests} header='Aucun message' description='Commencez la discussion en envoyant un nouveau message' offLine={!this.props.network.isConnected} />
            </View>
        )
    }

    navigateToProfile(user) {
        this.props.navigation.navigate('Profile', { user: { id: user.id, roleId: getRoleIdFromValue(user.role) } })
    }

    render() {
        const { messages, attachments, showVideoPlayer, videoUrl, isImageViewVisible, imageUrl, toastMessage, toastType } = this.state
        const imagesView = [{
            source: { uri: imageUrl },
            width: constants.ScreenWidth,
            height: constants.ScreenHeight * 0.8,
        }]

        const { isConnected } = this.props.network

        if (isImageViewVisible)
            return (
                <ImageView
                    images={imagesView}
                    imageIndex={0}
                    isVisible={isImageViewVisible}
                    onClose={this.toggleImageView}

                    renderFooter={(currentImage) => (
                        <View style={{ justifyContent: 'flex-end', alignItems: 'flex-end' }}>
                            <TouchableOpacity style={{ padding: 10, backgroundColor: 'black', opacity: 0.8, borderRadius: 50, margin: 10 }} onPress={() => {
                                this.toggleImageView()
                                setToast(this, 'i', 'Début du téléchargement...')
                                downloadFile(`image_${moment().format('DD_MM_YYYY_HH_mm')}`, imagesView[0].source.uri)
                            }}>
                                <MaterialCommunityIcons name={'download'} size={24} color='#fff' />
                            </TouchableOpacity>
                        </View>
                    )}
                />
            )

        else return (
            <View style={{ flex: 1 }}>
                <Appbar back title titleText='Espace messagerie' />
                <View style={{ flex: 1, backgroundColor: theme.colors.background, padding: theme.padding / 2 }}>
                    <GiftedChat
                        ref={(ref) => { this.chatRef = ref }}
                        renderUsernameOnMessage={true}
                        onPressAvatar={(user) => this.navigateToProfile(user)}
                        messagesContainerStyle={{ backgroundColor: theme.colors.chatBackground }}
                        messages={messages}
                        onSend={this.handleSend}
                        user={{ _id: this.currentUser.uid, _name: this.currentUser.displayName }}
                        placeholder='Tapez un message'
                         placeholderTextColor="gray"
                        inputTextStyle={{
                            color: 'black', // Couleur du texte de l'input
                        }}
                        alwaysShowSend
                        showUserAvatar={false}
                        scrollToBottom
                        renderCustomView={this.renderCustomView}
                        renderBubble={(props) => this.renderBubbleWithCustomTextStyle(props)}
                        renderLoading={this.renderLoading}
                        renderSend={this.renderSend}
                        renderActions={(props) => this.renderActions(props, isConnected)}
                        renderMessageVideo={(props) => this.renderMessageVideo(props, this.props.navigation)}
                        renderMessageImage={this.renderMessageImage}
                        scrollToBottomComponent={this.scrollToBottomComponent}
                        renderSystemMessage={this.renderSystemMessage}
                        renderDay={(props) => <Day {...props} dateFormat={'D MMM YYYY'} textStyle={[{ color: theme.colors.gray_dark, fontSize: isTablet ? 16 : undefined }]} />}
                        renderChatEmpty={this.renderChatEmpty.bind(this)}
                        renderInputToolbar={(props) => {
                            return (
                                <InputToolbar
                                    {...props}
                                   
                                    textInputStyle={{
                                        color: 'black', // Couleur du texte de l'input
                                    }}
                                />
                            );
                        }}
                    />
                </View>
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
        //fcmToken: state.fcmtoken
    }
}

export default connect(mapStateToProps)(Chat)

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.chatBackground
    },
    sendingContainer: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    bottomComponentContainer: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    systemMessageWrapper: {
        backgroundColor: '#BBDEFB',
        borderRadius: 4,
        padding: 5,
        paddingHorizontal: 7
    },
    systemMessageText: {
        color: theme.colors.placeholder,
        textAlign: 'center'
    },
    backgroundVideo: {
        flex: 1,
    },
    messageVideo: {
        width: 200, height: 200, justifyContent: 'center', alignItems: 'center'
    },
    chatEmpty: {
        flex: 1,
        alignSelf: 'center',
        justifyContent: 'center',
        transform: [{ scaleY: -1 }]
    }
})








// return (
//     // <TouchableOpacity onPress={() => this.runVideoPlayer(currentMessage.video)} style={{ padding: 20, width: 200, height: 200 }}>
//     /* <Video
//         //source={require('../../dogs.mp4')}
//         source={{ uri: uri }}   // Can be a URL or a local file.
//         // ref={(ref: Video) => { this.video = ref }}
//         //fullscreen={false}
//         onBuffer={this.onBuffer}                // Callback when remote video is buffering
//         onError={this.videoError}               // Callback when video cannot be loaded
//         style={styles.backgroundVideo}
//         paused={false}
//     /> */
//     <ThumbnailRemote url='https://www.youtube.com/watch?v=8Fd77omIrII&list=RD8Fd77omIrII&start_radio=1' />

//     // </TouchableOpacity >
// )