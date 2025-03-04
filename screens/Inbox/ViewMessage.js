

import React, { Component } from 'react'
import { StyleSheet, Text, View, ScrollView, Image } from 'react-native'
import { List, Headline } from 'react-native-paper'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import Entypo from 'react-native-vector-icons/Entypo'

import * as theme from '../../core/theme'
import { constants } from '../../core/constants'
import { downloadFile, setToast, load } from '../../core/utils'
import { fetchDocs } from '../../api/firestore-api'

import moment from 'moment'
import 'moment/locale/fr'
moment.locale('fr')

import Appbar from '../../components/Appbar'
import Button from '../../components/Button'
import UploadProgress from '../../components/UploadProgress'
import Toast from '../../components/Toast'

import firebase from '@react-native-firebase/app'

const db = firebase.firestore()

export default class ViewMessage extends Component {

    constructor(props) {
        super(props)
        this.currentUser = firebase.auth().currentUser
        this.message = this.props.navigation.getParam('message', '')
        this.fetchDocs = fetchDocs.bind(this)

        this.state = {
            messagesList: [],
            messagesCount: 0,
            expandedId: '',

            showOldMessages: false,

            toastMessage: '',
            toastType: '',
            loading: true
        }
    }

    componentDidMount() {
        const currentUser = { id: this.currentUser.uid, fullName: this.currentUser.displayName }
        const query = db.collection('Messages').doc(this.message.id).collection('AllMessages').where('speakers', 'array-contains', currentUser).orderBy('sentAt', 'DESC')
        this.fetchDocs(query, 'messagesList', 'messagesCount', () => { load(this, false) })
    }

    componentWillUnmount() {
        this.unsubscribe()
    }

    goToReply(sender, messagesRendered) {
        let tagSelected = [sender]
        this.setState({ expandedId: '' })
        this.props.navigation.navigate('NewMessage', { isReply: true, messageGroupeId: this.message.id, tagsSelected: tagSelected, subject: this.message.mainSubject, oldMessages: messagesRendered, subscribers: this.message.subscribers })
    }

    goToReplyAll(speakers, messagesRendered) {
        let allTagsSelected = speakers.filter((subscriber) => subscriber.id !== this.currentUser.uid)
        this.setState({ expandedId: '' })
        this.props.navigation.navigate('NewMessage', { isReply: true, messageGroupeId: this.message.id, tagsSelected: allTagsSelected, subject: this.message.mainSubject, oldMessages: messagesRendered, subscribers: this.message.subscribers })
    }

    renderMessage(selectedMessage) {
        const { sender, message, sentAt, oldMessages } = selectedMessage
        let { showOldMessages } = this.state

        let messagesRendered = [{ sender, message, sentAt }].concat(oldMessages)
        const showHideText = showOldMessages ? 'Masquer le texte des messages précédents' : 'Afficher le texte des messages précédents'

        return (
            <View style={{ marginBottom: 15, marginLeft: constants.ScreenWidth * 0.045 }}>

                <View>
                    {messagesRendered.map((msg, key) => {

                        const sentAtDate = moment(msg.sentAt).format('ll')
                        const sentAtTime = moment(msg.sentAt).format('LT')

                        return (
                            <View>
                                {key === 0 &&
                                    <View>
                                        <Text style={[theme.customFontMSregular.body, { marginBottom: 20 }]}>{msg.message}</Text>
                                        {messagesRendered.length > 1 && <Text style={[theme.customFontMSsemibold.caption, { marginBottom: 5, color: theme.colors.primary }]} onPress={showOldMessages => this.setState({ showOldMessages: !this.state.showOldMessages })}>{showHideText}</Text>}
                                    </View>}
                                {key > 0 && showOldMessages &&
                                    <View>
                                        <Text style={theme.customFontMSregular.caption, { color: theme.colors.placeholder, marginTop: 4, marginBottom: 2 }}>Le <Text style={theme.customFontMSsemibold.body}>{sentAtDate}</Text> à <Text style={theme.customFontMSsemibold.body}>{sentAtTime}</Text>, <Text style={theme.customFontMSsemibold.body}>{msg.sender.fullName}</Text> a écrit:</Text>
                                        <Text style={[theme.customFontMSregular.body, { marginBottom: 15 }]}>{msg.message}</Text>
                                    </View>}
                            </View>
                        )
                    })}
                </View>

                {selectedMessage.attachments && this.renderAttachments(selectedMessage.attachments)}

                {/* {selectedMessage.sender.id !== this.currentUser.uid && */}
                <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginTop: 10 }}>
                    <Button loading={false} mode="outlined" onPress={() => this.goToReply(selectedMessage.sender, messagesRendered)}
                        style={{ width: '39%', alignSelf: 'center' }}>
                        <Text style={theme.customFontMSsemibold.body}>Répondre</Text>
                    </Button>

                    <Button loading={false} mode="contained" onPress={() => this.goToReplyAll(selectedMessage.speakers, messagesRendered)}
                        style={{ width: '55%', alignSelf: 'center', marginLeft: 5 }}>
                        <Text style={theme.customFontMSsemibold.body}>Répondre à tous</Text>
                    </Button>
                </View>
                {/* } */}

            </View>
        )
    }

    renderAttachments(attachments) {
        return attachments.map((document, key) => {
            return <UploadProgress
                attachment={document}
                showRightIcon
                showProgress={false}
                rightIcon={
                    <View style={{ flex: 0.15, justifyContent: 'center', alignItems: 'center' }}>
                        <MaterialCommunityIcons
                            name={'download'}
                            size={21}
                            color={theme.colors.placeholder}
                            style={{ paddingVertical: 19, paddingHorizontal: 5 }}
                            onPress={() => downloadFile(this, document.name, document.downloadURL)} />
                    </View>}
            />
        })
    }

    setArrowStyle(message) {
        let arrowStyle = {}

        if (message.sender.id === this.currentUser.uid) {
            arrowStyle.arrowName = 'arrow-bold-right'
            arrowStyle.arrowColor = 'blue'
        }

        else {
            arrowStyle.arrowName = 'arrow-bold-left'
            arrowStyle.arrowColor = theme.colors.primary
        }

        return arrowStyle
    }

    renderMessages() {
        const { expandedId, messagesList } = this.state

        return (
            <List.AccordionGroup
                expandedId={expandedId}
                onAccordionPress={(expandedId) => {
                    if (this.state.expandedId === expandedId)
                        this.setState({ expandedId: '', showOldMessages: false })
                    else
                        this.setState({ expandedId })
                }}>

                {messagesList.map((message, key) => {

                    const isExpanded = (expandedId === message.id)
                    const arrowStyle = this.setArrowStyle(message)
                    let receivers = message.receivers.map((receiver) => receiver.fullName)
                    receivers = receivers.join(', ')

                    return (
                        <List.Accordion
                            id={message.id}
                            showArrow
                            style={{ paddingVertical: constants.ScreenHeight * 0.015, borderBottomWidth: !isExpanded ? StyleSheet.hairlineWidth * 2 : 0, borderBottomColor: theme.colors.grey_300 }}
                            titleComponent={
                                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                                    <Text numberOfLines={1} style={[theme.customFontMSsemibold.header, { marginRight: isExpanded ? 3 : 5 }]}>{message.sender.fullName}</Text>
                                    <Text style={[theme.customFontMSmedium.caption, { color: theme.colors.placeholder, marginHorizontal: 5, marginTop: 3 }]}>{moment(message.sentAt).format('lll')}</Text>
                                    {<Entypo name={arrowStyle.arrowName} size={17} color={arrowStyle.arrowColor} style={{ marginTop: 3, marginLeft: 5 }} />}
                                </View>
                            }
                            description={!isExpanded ? message.message : 'à ' + receivers}
                            theme={{ colors: { primary: '#333' } }}
                            titleStyle={theme.customFontMSsemibold.header}
                            descriptionStyle={theme.customFontMSmedium.caption}>

                            {this.renderMessage(message)}

                        </List.Accordion>
                    )
                })
                }

            </List.AccordionGroup>
        )
    }

    render() {
        let { toastMessage, toastType } = this.state

        return (
            <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
                <Appbar back title titleText='File des messages' />
                <View style={{ flex: 1, padding: 5, paddingTop: 20 }}>
                    <Headline style={[theme.customFontMSbold.h3, { paddingLeft: constants.ScreenWidth * 0.038, marginBottom: 5 }]}>{this.message.mainSubject}</Headline>
                    <ScrollView style={styles.container} >
                        {this.renderMessages()}
                    </ScrollView >
                </View>

                <Toast
                    message={toastMessage}
                    type={toastType}
                    onDismiss={() => this.setState({ toastMessage: '' })}
                    containerStyle={{ bottom: 10 }} />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background
    },
    box: {
        padding: 20,
        marginBottom: 5,
        backgroundColor: 'white',
        flexDirection: 'row',
    },
    boxContent: {
        flex: 1,
        //flexDirection: 'column',
        //alignItems: 'flex-start',
        marginLeft: 10,
    },
    description: {
        fontSize: 15,
        color: "#646464",
    },
    title: {
        fontSize: 18,
        color: "#151515",
    },
    fab: {
        flex: 1,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
        width: 50,
        height: 50,
        borderRadius: 100,
    }
});



/* <List.Accordion
title="Accordion 1"
id='team1'
title="Team 1"
theme={{ colors: { primary: '#333' } }}
titleStyle={theme.customFontMSsemibold.header}>
{this.renderMembers()}
</List.Accordion> */


// {this.state.teamsList.map((team, key) => {
//     <List.Accordion
//         id={team.id}
//         title={team.name}
//         theme={{ colors: { primary: '#333' } }}
//         titleStyle={theme.customFontMSsemibold.header}>
//         {this.renderMembers()}
//     </List.Accordion>
// })
// }