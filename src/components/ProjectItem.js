import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card, Title } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient'

import moment from 'moment';
import 'moment/locale/fr'
moment.locale('fr')

import * as theme from '../core/theme';
import { constants, isTablet } from '../core/constants';

import { withNavigation } from 'react-navigation'

const ProjectItem = ({ project, onPress, navigation, ...props }) => {

    const { id, step, name, description, address, state, client, editedAt, editedBy } = project
    let { processVersion } = project
    processVersion = processVersion.replace("version", "") || ""

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

            case 'Annulé':
                return theme.colors.canceled
                break

            default:
                return '#333'
        }
    }

    const setStepColor = (step) => {
        return [theme.colors.valid, theme.colors.valid, theme.colors.valid]
    }

    const viewClientProfile = () => {
        navigation.navigate('Profile', { user: { id: client.id, roleId: 'client' }, isClient: true })
    }

    const lastUpdate = `${moment(editedAt).format('ll')} - ${moment(editedAt).format('HH:mm')}`

    return (
        <Card style={styles.container} onPress={onPress}>
            <LinearGradient start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} colors={setStepColor(step)} style={[styles.linearGradient, styles.stepContainer]}>
                <Text style={[isTablet ? theme.customFontMSmedium.caption : theme.customFontMSmedium.extraSmall, styles.header]} numberOfLines={1}>{id}</Text>
                <Text style={[theme.customFontMSbold.caption, { color: theme.colors.white }]}>{step}</Text>
                <Text style={[isTablet ? theme.customFontMSmedium.caption : theme.customFontMSregular.small, styles.processVersion]}>V{processVersion}</Text>
            </LinearGradient>

            <Card.Content style={styles.content}>
                <View style={{ flex: 1, alignSelf: 'flex-start' }}>
                    <Title style={[theme.customFontMSmedium.body]} numberOfLines={1}>{name}</Title>
                    <View style={{ alignItems: 'flex-start', marginBottom: 20 }}>
                        {address.description !== '' && <Text numberOfLines={2} style={theme.customFontMSregular.caption}>à {address.description}</Text>}
                        <Text numberOfLines={1} style={theme.customFontMSregular.caption}>chez <Text style={[theme.customFontMSregular.caption, { textDecorationLine: 'underline' }]} onPress={viewClientProfile}>{client.fullName}</Text></Text>
                    </View>
                    <View style={styles.footer}>
                        <Text style={[theme.customFontMSregular.caption, { color: theme.colors.gray_dark }]} >{lastUpdate}</Text>
                        <View style={{ width: constants.ScreenWidth * 0.23, borderRadius: 50, backgroundColor: setStateColor(state), padding: 5, elevation: 2 }}>
                            <Text style={[theme.customFontMSregular.caption, { color: theme.colors.secondary, textAlign: 'center' }]}>{state}</Text>
                        </View>
                    </View>
                </View>
            </Card.Content>
        </Card>
    )

}

const styles = StyleSheet.create({
    container: {
        marginVertical: theme.padding / 2,
        borderRadius: 10,
        zIndex: 100,
        ...theme.style.shadow
    },
    linearGradient: {
        flex: 1,
        paddingLeft: 15,
        paddingRight: 15,
        borderRadius: 0
    },
    header: {
        position: 'absolute',
        left: theme.padding,
        color: theme.colors.white
    },
    processVersion: {
        position: 'absolute',
        right: theme.padding,
        color: theme.colors.white
    },
    content: {
        flex: 1,
        flexDirection: 'row',
        paddingTop: isTablet ? 15 : 5
    },
    stepContainer: {
        height: isTablet ? 49 : 33,
        justifyContent: 'center',
        alignItems: 'center',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
    }
})

export default withNavigation(ProjectItem)
