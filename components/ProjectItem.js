import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { List, Card, Paragraph, Title, Avatar } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import LinearGradient from 'react-native-linear-gradient'

import moment from 'moment';
import 'moment/locale/fr'
moment.locale('fr')

import Button from './Button'

import * as theme from '../core/theme';
import { constants } from '../core/constants';

import { ThemeColors, withNavigation } from 'react-navigation'

const ProjectItem = ({ project, onPress, navigation, ...props }) => {


    const setStateColor = (state) => {
        switch (state) {
            case 'En attente':
                return theme.colors.gray400

            case 'En cours':
                return theme.colors.primary
                break

            case 'Terminé':
                return '#0288D1'
                break

            case 'Annulé':
                return theme.colors.error
                break

            default:
                return '#333'
        }
    }

    const setStepColor = (step) => {
        switch (step) {
            case 'Prospect':
                return [theme.colors.gray400, theme.colors.gray400, theme.colors.gray400]

            case 'Chantier':
                return ['#09a500', '#69b300', '#9fbc00']
                break

            case 'SAV':
                return ['#0288D1', '#03A9F4', '#4FC3F7']
                break

            default:
                return '#333'
        }
    }

    return (
        <Card style={{ margin: 10, borderRadius: 15 }} onPress={onPress}>
            <LinearGradient start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} colors={setStepColor(project.step)} style={[styles.linearGradient, styles.stepContainer]}>
                <Text style={[theme.customFontMSsemibold.header, { color: '#fff' }]}>{project.step}</Text>
            </LinearGradient>

            <Card.Content style={{ flex: 1, flexDirection: 'row', paddingTop: 10 }}>
                <View style={{ flex: 1, alignSelf: 'flex-start' }}>
                    <Title style={[theme.customFontMSbold.body]} numberOfLines={1}>{project.name}</Title>
                    <Paragraph style={[theme.customFontMSmedium.caption, { marginBottom: 20 }]} numberOfLines={1}>{project.description}</Paragraph>

                    <View style={{ alignItems: 'flex-start', marginBottom: 20 }}>
                        <Paragraph numberOfLines={1} style={theme.customFontMSmedium.caption}>à <Paragraph style={[theme.customFontMSsemibold.caption]}>{project.address.description}</Paragraph></Paragraph>
                        <Paragraph numberOfLines={1} style={theme.customFontMSmedium.caption}>chez <Paragraph style={[theme.customFontMSsemibold.caption, { textDecorationLine: 'underline' }]} onPress={() => navigation.navigate('Profile', { userId: project.client.id })}>{project.client.fullName}</Paragraph></Paragraph>
                    </View>

                    <Paragraph style={[theme.customFontMSmedium.caption, { color: theme.colors.placeholder }]}>Modifié par <Text style={[theme.customFontMSregular.caption, { color: theme.colors.placeholder, textDecorationLine: 'underline' }]} onPress={() => navigation.navigate('Profile', { userId: project.editedBy.id })}>{project.editedBy.fullName}</Text></Paragraph>

                    <View style={styles.footer}>
                        <Paragraph style={[theme.customFontMSregular.caption, { color: theme.colors.placeholder }]} >{moment(project.editedAt, 'lll').format('ll')} - {moment(project.editedAt, 'lll').format('HH:mm')}</Paragraph>
                        <View style={{ width: constants.ScreenWidth * 0.25, borderRadius: 50, backgroundColor: setStateColor(project.state), padding: 2 }}>
                            <Paragraph style={[theme.customFontMSmedium.caption, { color: '#fff', textAlign: 'center' }]}>{project.state}</Paragraph>
                        </View>
                    </View>
                </View>
            </Card.Content>

        </Card>
    )

}

const styles = StyleSheet.create({
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
        alignItems: 'flex-end',
        justifyContent: 'space-between',
    }
})

export default withNavigation(ProjectItem)
