import React, { Component } from 'react'
import { StyleSheet, Text, View, Image, FlatList } from 'react-native'
import { List, Avatar } from 'react-native-paper'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

import * as theme from '../core/theme'
import { constants } from '../core/constants'
import Menu from './Menu'

import AvatarText from '../components/AvatarText'

import moment from 'moment'
import 'moment/locale/fr'
moment.locale('fr')

import { withNavigation } from 'react-navigation'
import firebase, { db } from '../firebase'

const MessageItem = ({ message, navigation, options, functions, ...props }) => {

    const markAsReadAndNavigate = (message) => {
        let haveRead = message.haveRead.find((id) => id === currentUser.uid)

        if (!haveRead) {
            let usersHaveRead = message.haveRead
            usersHaveRead = usersHaveRead.concat([currentUser.uid])
            db.collection('Messages').doc(message.id).update({ haveRead: usersHaveRead })
        }

        navigation.navigate('ViewMessage', { MessageId: message.id })
    }


    const currentUser = firebase.auth().currentUser
    let haveRead = true
    if (currentUser) {
        const isCurrentuserSender = message.sender.id === currentUser.uid
        const isCurrentUserReceiver = message.receivers.find((receiver) => receiver.id === currentUser.uid)
        var showMessageDescription = isCurrentuserSender || isCurrentUserReceiver  //currentUser is speaker ?
        haveRead = message.haveRead.includes(currentUser.uid)
    }

    const atColor = haveRead ? theme.colors.white : theme.colors.white
    const atBackgroundColor = haveRead ? theme.colors.gray_medium : theme.colors.primary

    return (
        <List.Item
            title={
                <View style={{ flexDirection: 'row' }}>
                    <Text style={theme.customFontMSmedium.body}>{message.sender.fullName}</Text>
                </View>
            }
            description={() => (
                <View style={{ paddingRight: 7 }}>
                    <Text numberOfLines={1} style={theme.customFontMSregular.caption}>
                        {message.mainSubject}
                    </Text>
                    <Text numberOfLines={1} style={[theme.customFontMSregular.caption, { color: theme.colors.gray_dark }]}>
                        {showMessageDescription ? message.message : ' '}
                    </Text>
                </View>
            )}

            left={props =>
                <View style={{ justifyContent: 'center', alignItems: 'center', marginHorizontal: theme.padding / 2 }}>
                    <AvatarText label={message.sender.fullName.charAt(0)} size={40} labelStyle={{ color: atColor }} style={{ backgroundColor: atBackgroundColor, elevation: 1 }} />
                </View>
            }

            right={props =>
                <View style={{ alignItems: 'center', paddingTop: 9, marginRight: theme.padding / 2 }}>
                    <Text style={[theme.customFontMSregular.caption, { color: theme.colors.gray_dark }]}>{moment(message.sentAt).format("Do MMM")}</Text>
                    {/* <Menu
                        options={[
                            { id: 0, title: 'Voir le message' },
                            { id: 1, title: 'Archiver le message' },
                        ]}

                        functions={[
                            () => markAsReadAndNavigate(message),
                            () => deleteUser(message)
                        ]}
                    /> */}
                </View>
            }
        />
    )
}

export default withNavigation(MessageItem)