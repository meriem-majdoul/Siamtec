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
import firebase from '@react-native-firebase/app'

const db = firebase.firestore()

const MessageItem = ({ message, navigation, options, functions, ...props }) => {
    const currentUser = firebase.auth().currentUser
    let haveRead = message.haveRead.find((id) => id === currentUser.uid)
    const isCurrentuserSender = message.sender.id === currentUser.uid
    const isCurrentUserReceiver = message.receivers.find((receiver) => receiver.id === currentUser.uid)
    const showMessageDescription = isCurrentuserSender || isCurrentUserReceiver  //currentUser is speaker ?

    const markAsReadAndNavigate = (message) => {
        let haveRead = message.haveRead.find((id) => id === currentUser.uid)

        if (!haveRead) {
            let usersHaveRead = message.haveRead
            usersHaveRead = usersHaveRead.concat([currentUser.uid])
            db.collection('Messages').doc(message.id).update({ haveRead: usersHaveRead })
        }

        navigation.navigate('ViewMessage', { message: message })
    }

    return (
        <List.Item
            title={
                <View style={{ flexDirection: 'row' }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{message.sender.fullName}</Text>
                </View>
            }
            description={() => (
                <View style={{ paddingRight: 7 }}>
                    <Text numberOfLines={1} style={theme.customFontMSbold.caption}>
                        {message.mainSubject}
                    </Text>
                    <Text numberOfLines={1} style={[theme.customFontMSmedium.caption, { color: theme.colors.placeholder }]}>
                        {showMessageDescription ? message.message : ' '}
                    </Text>
                </View>
            )}

            left={props =>
                <View style={{ justifyContent: 'center', alignItems: 'center', marginHorizontal: 10 }}>
                    <AvatarText label={message.sender.fullName.charAt(0)} size={42} />
                </View>
            }

            right={props =>
                <View style={{ alignItems: 'center', paddingTop: 9, marginRight: 5 }}>
                    <Text style={[theme.customFontMSmedium.caption, { color: theme.colors.placeholder }]}>{moment(message.sentAt).format("Do MMM")}</Text>
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
            
            style={{ backgroundColor: haveRead ? '#fff' : '#DCEDC8' }}
        />
    )
}

export default withNavigation(MessageItem)