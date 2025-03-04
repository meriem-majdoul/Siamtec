import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { List, Card, Paragraph, Title, Avatar } from 'react-native-paper';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons'
import Ionicons from 'react-native-vector-icons/Ionicons'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

import moment from 'moment';
import 'moment/locale/fr'
moment.locale('fr')

import Button from './Button'

import * as theme from '../core/theme';
import { constants } from '../core/constants';

import { ThemeColors, withNavigation } from 'react-navigation'

const RequestItem = ({ request, requestType, chatId, navigation, ...props }) => {

    let nextScreen = ''
    let params = {}

    if (requestType === 'projet') {
        nextScreen = 'CreateProjectReq'
        params = { RequestId: request.id }
    }

    else if (requestType === 'ticket') {
        nextScreen = 'CreateTicketReq'
        params = { RequestId: request.id }
    }

    const setStateColor = (state) => {
        switch (state) {
            case 'En attente':
                return theme.colors.error

            case 'En cours':
                return 'orange'
                break

            case 'Terminé':
                return theme.colors.primary
                break

            case 'Résolu':
                return theme.colors.primary
                break

            default:
                return '#333'
        }
    }

    return (
        <Card style={{ margin: 5 }} onPress={() => navigation.navigate(nextScreen, params)}>

            <Card.Content style={{ flex: 1, flexDirection: 'row' }}>
                <View style={{ flex: 1 }}>

                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 19 }}>
                        <Title style={[theme.customFontMSsemibold.header, { flex: 0.85, paddingRight: constants.ScreenWidth * 0.15 }]} numberOfLines={1}>{request.subject}</Title>
                        <Ionicons style={{ flex: 0.15, alignSelf: 'center' }} name='chatbubble-ellipses-outline' size={30} onPress={() => navigation.navigate('Chat', { chatId: chatId })} />
                    </View>

                    <Paragraph style={[theme.customFontMSmedium.body]} numberOfLines={1}>{request.description}</Paragraph>
                    <Paragraph style={[theme.customFontMSmedium.caption, { color: theme.colors.placeholder }]}>Modifié le {moment(request.editedAt).format('lll')}</Paragraph>

                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', }}>
                        <Paragraph style={[theme.customFontMSregular.caption, { color: theme.colors.placeholder }]} >Par <Text style={[theme.customFontMSregular.caption, { color: theme.colors.placeholder, textDecorationLine: 'underline' }]} onPress={() => navigation.navigate('Profile', { userId: request.editedBy.userId })}>{request.editedBy.userName}</Text></Paragraph>
                        <View style={{ width: constants.ScreenWidth * 0.25, borderRadius: 50, backgroundColor: setStateColor(request.state), padding: 2 }}>
                            <Paragraph style={[theme.customFontMSmedium.caption, { color: '#fff', textAlign: 'center' }]}>{request.state}</Paragraph>
                        </View>
                    </View>
                </View>
            </Card.Content>

        </Card>
    )

}


export default withNavigation(RequestItem)
