import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { List, Card, Paragraph, Title, Avatar } from 'react-native-paper';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons'
import Ionicons from 'react-native-vector-icons/Ionicons'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

import { faCommentDots } from 'react-native-fontawesome'

import moment from 'moment';
import 'moment/locale/fr'
moment.locale('fr')

import CustomIcon from './CustomIcon'
import Button from './Button'

import * as theme from '../core/theme';
import { constants, isTablet } from '../core/constants';

import { ThemeColors, withNavigation } from 'react-navigation'

const RequestItem = ({ request, requestType, chatId, navigation, ...props }) => {

    let nextScreen = ''
    let params = {}

    if (requestType === 'project') {
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
                return theme.colors.pending

            case 'En cours':
                return theme.colors.inProgress
                break

            case 'Terminé':
                return theme.colors.valid
                break

            case 'Résolu':
                return theme.colors.primary
                break

            default:
                return '#333'
        }
    }

    return (
        <Card style={{ margin: 5, paddingVertical: isTablet ? 15 : 0 }} onPress={() => navigation.navigate(nextScreen, params)}>

            <Card.Content style={{ flex: 1, flexDirection: 'row' }}>
                <View style={{ flex: 1 }}>

                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Title style={[theme.customFontMSsemibold.header, { flex: 0.85 }]} numberOfLines={1}>{request.subject}</Title>
                        <TouchableOpacity hitSlop={theme.hitslop} onPress={() => navigation.navigate('Chat', { chatId: chatId })}>
                            <CustomIcon icon={faCommentDots} />
                        </TouchableOpacity>
                    </View>

                    <Paragraph style={[theme.customFontMSmedium.body]} numberOfLines={1}>{request.description}</Paragraph>
                    <Paragraph style={[theme.customFontMSmedium.caption, { color: theme.colors.placeholder }]}>Modifié le {moment(request.editedAt).format('lll')}</Paragraph>

                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', }}>
                        <Paragraph style={[theme.customFontMSregular.caption, { color: theme.colors.placeholder }]} >Par <Text style={[theme.customFontMSregular.caption, { color: theme.colors.placeholder, textDecorationLine: 'underline' }]}>{request.editedBy.fullName}</Text></Paragraph>
                        <View style={{ paddingVertical: isTablet ? 10 : 0, width: constants.ScreenWidth * 0.25, borderRadius: 50, backgroundColor: setStateColor(request.state), padding: 2, ...theme.style.shadow }}>
                            <Paragraph style={[theme.customFontMSmedium.caption, { textAlign: 'center' }]}>{request.state}</Paragraph>
                        </View>
                    </View>

                </View>
            </Card.Content>

        </Card>
    )

}


export default withNavigation(RequestItem)
