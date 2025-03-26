import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { faTools, faToolbox, faLamp, faUserHardHat, faCalendar, faCalendarAlt, faFolderOpen } from 'react-native-vector-icons/FontAwesome5'
import { faCheckCircle, faTimesCircle } from 'react-native-vector-icons/FontAwesome5';

import CustomIcon from './CustomIcon'

import * as theme from '../core/theme'
import { constants } from '../core/constants'

import { withNavigation } from 'react-navigation'

const iconContainerSize = constants.ScreenWidth * 0.24

const ProjectItem2 = ({ project, onPress, navigation, ...props }) => {

    const setIconPhase = (projectStep) => {
        switch (projectStep) {
            case 'Prospect':
                return faFolderOpen
                break

            case 'Initialisation': //Deprecated
                return faFolderOpen
                break

            case 'Visite technique préalable':
                return faCalendar
                break

            case 'Présentation étude':
                return faCalendarAlt
                break

            case 'Visite technique':
                return faUserHardHat
                break

            case "En attente d'installation":
                return faTools
                break

            case 'Maintenance':
                return faToolbox
                break
        }
    }

    const setIconState = (projectState) => {
        const projectEnded = projectState === 'Terminé'
        const projectCanceled = projectState === 'Annulé'
        const finalState = projectEnded || projectCanceled

        if (finalState) {
            const icon = projectEnded ? faCheckCircle : faTimesCircle
            const color = projectEnded ? 'green' : theme.colors.error
            const iconSize = iconContainerSize * 0.2
            const iconStyle = { position: 'absolute', top: 5, right: 10, zIndex: 1 }
            return <CustomIcon icon={icon} color={color} size={iconSize} style={iconStyle} />
        }

        else return null
    }

    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            {setIconState(project.state)}
            <View style={[styles.iconContainer, { backgroundColor: project.color }]}>
                <CustomIcon icon={setIconPhase(project.step)} size={iconContainerSize * 0.45} color={theme.colors.white} secondaryColor={theme.colors.secondary} />
            </View>
            <View style={{ width: iconContainerSize * 1.1, height: iconContainerSize * 0.4 }}>
                <Text style={[theme.customFontMSregular.caption, { flexWrap: 'wrap', textAlign: 'center', color: theme.colors.secondary }]} numberOfLines={2}>{project.name}</Text>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        //backgroundColor: 'pink',
    },
    iconContainer: {
        width: iconContainerSize,
        height: iconContainerSize,
        borderRadius: constants.ScreenWidth * 0.033,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10
    },
})

export default withNavigation(ProjectItem2)
