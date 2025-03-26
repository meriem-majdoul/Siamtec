import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { List, Card, Paragraph, Title, Avatar } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

import moment from 'moment';
import 'moment/locale/fr'
moment.locale('fr')

import Menu from './Menu'

import * as theme from '../core/theme';
import { constants, isTablet } from '../core/constants';

import { ThemeColors, withNavigation } from 'react-navigation'
import { color } from 'react-native-reanimated';

const DocumentItem = ({ document, options, functions, onPress, ...props }) => {

    const setStateColor = (state) => {
        switch (state) {
            case 'A faire':
                return theme.colors.placeholder
                break

            case 'En cours':
                return 'orange'
                break

            case 'Validé':
                return theme.colors.primary
                break

            default:
                return '#333'
        }
    }

    let iconType = 'folder'
    let colorIconType = theme.colors.gray

    // switch (document.attachment.type) {
    //     case 'application/pdf': {
    //         iconType = 'pdf-box'
    //         colorIconType = '#da251b'
    //     }
    //         break

    //     case 'application/msword': {
    //         iconType = 'file-word-box'
    //         colorIconType = '#295699'
    //     }
    //         break

    //     case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
    //         iconType = 'file-word-box'
    //         colorIconType = '#295699'
    //     }
    //         break

    //     case 'image/jpeg': {
    //         iconType = 'image'
    //         colorIconType = theme.colors.primary
    //     }
    //         break

    //     case 'image/png': {
    //         iconType = 'image'
    //         colorIconType = theme.colors.primary
    //     }
    //         break

    //     case 'application/zip':
    //         iconType = 'zip'
    //         break

    //     default:
    //         break
    // }

    return (
        <Card style={{ paddingVertical: isTablet ? 12 : 0, marginVertical: 3, marginHorizontal: 5, elevation: 2, backgroundColor: theme.colors.white }} onPress={onPress}>

            <Card.Content style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                <View style={{ flex: 0.15, justifyContent: 'center', alignItems: 'flex-start' }}>
                    <MaterialCommunityIcons name={iconType} color={theme.colors.primary} size={33} />
                </View>

                <View style={{ flex: 0.85 }}>
                    <Text ellipsizeMode='middle' style={[theme.customFontMSmedium.body, { flex: 1, marginBottom: 10, lineHeight: 25 }]} >{document.name}</Text>
                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
                        <View style={{ flex: 0.75 }}>
                            <Text numberOfLines={1} style={[theme.customFontMSmedium.caption, { color: theme.colors.gray_dark, textAlign: 'left' }]}>Envoyé par {document.createdBy.fullName}</Text>
                        </View>
                        <View style={{ flex: 0.25 }}>
                            <Text style={[theme.customFontMSmedium.caption, { color: theme.colors.gray_dark, textAlign: 'right' }]}>{moment(document.createdAt).format('DD MMM')}</Text>
                        </View>
                    </View>
                </View>

                {/* 
                <View style={{ flex: 0.15, alignItems: 'flex-end', justifyContent: 'center' }}>
                    <Menu options={options} functions={functions} />
                </View> 
                */}
            </Card.Content>

        </Card>
    )

}


export default withNavigation(DocumentItem)
