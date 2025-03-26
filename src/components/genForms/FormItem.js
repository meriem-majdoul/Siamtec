import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { List, Card, Paragraph, Title, Avatar } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import LinearGradient from 'react-native-linear-gradient'

import moment from 'moment';
import 'moment/locale/fr'
moment.locale('fr')

import Button from '../Button'

import * as theme from '../../core/theme';
import { constants, isTablet } from '../../core/constants';

import { withNavigation } from 'react-navigation'

const FormItem = ({ item, onPress, navigation, nameClient1, nameClient2, ...props }) => {

    const { id, project, editedAt, isDraft, createdBy, isSubmitted, colorCat, estimation } = item

    const isNameClient1 = nameClient1 !== ""
    const isNameClient2 = nameClient2 !== ""
    const bothNames = isNameClient1 && isNameClient2
    if (bothNames)
        var clientsNames = nameClient1 + " & " + nameClient2
    else if (isNameClient1)
        var clientsNames = nameClient1
    else if (isNameClient2)
        var clientsNames = nameClient2

    return (
        <TouchableOpacity onPress={onPress} style={styles.container}>
            <View style={styles.header}>
                <Text style={[isTablet ? theme.customFontMSregular.caption : theme.customFontMSregular.small, { color: theme.colors.gray_medium }]}>{id}</Text>
                {estimation > 0 && <Text style={[theme.customFontMSmedium.header, { backgroundColor: colorCat, paddingHorizontal: theme.padding, paddingVertical: 2, borderRadius: 4, color: 'white' }]}>€ {estimation.toString()}</Text>}
            </View>

            <View style={styles.body}>
                <Text numberOfLines={1} style={[theme.customFontMSmedium.body, { marginBottom: 5, color: project ? theme.colors.secondary : theme.colors.gray_dark }]}>{project ? project.name : "Aucun projet"}</Text>
                <Text>
                    <Text numberOfLines={2} style={[theme.customFontMSmedium.caption, { color: theme.colors.gray_dark }]}>
                        {project && project.client ? project.client.fullName : clientsNames}
                    </Text>
                </Text>
            </View>

            {/* <Text style={[theme.customFontMSregular.caption, { marginBottom: 8, color: theme.colors.gray_dark }]}>Crée par {createdBy.fullName}</Text> */}

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={[theme.customFontMSregular.caption, { color: theme.colors.gray_dark }]}>{moment(editedAt).format('lll')}</Text>
                {!isSubmitted && <Text style={[theme.customFontMSregular.caption, { color: theme.colors.gray_dark }]}>Brouillon</Text>}
            </View>
        </TouchableOpacity >
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: isTablet ? 24 : 15,
        paddingVertical: isTablet ? 24 : 10,
        backgroundColor: theme.colors.background,
        borderRadius: 10,
        marginVertical: isTablet ? 14 : 5,
        ...theme.style.shadow
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: isTablet ? 16 : 0
    },
    body: {
        marginBottom: 15,
        marginTop: 3
    },
    linearGradient: {
        flex: 1,
        paddingLeft: 15,
        paddingRight: 15,
        borderRadius: 5
    },
    stepContainer: {
        height: 33,
        justifyContent: 'center',
        alignItems: 'center',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    }
})

export default withNavigation(FormItem)
