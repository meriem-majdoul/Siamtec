import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { faTools, faToolbox, faLamp, faUserHardHat, faCalendar, faCalendarAlt, faFolderOpen } from '@fortawesome/free-solid-svg-icons'
import { faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

import CustomIcon from './CustomIcon'

import * as theme from '../core/theme'
import { constants } from '../core/constants'

import { useNavigation } from '@react-navigation/native'  // Remplacer withNavigation par useNavigation

const iconContainerSize = constants.ScreenWidth * 0.24

const ProjectItem2 = ({ project, onPress, ...props }) => {
    const navigation = useNavigation(); // Utilisation du hook useNavigation

    const setIconPhase = (projectStep) => {
        switch (projectStep) {
            case 'Prospect':
                return faFolderOpen
            case 'Initialisation': //Deprecated
                return faFolderOpen
            case 'Visite technique préalable':
                return faCalendar
            case 'Présentation étude':
                return faCalendarAlt
            case 'Visite technique':
                return faUserHardHat
            case "En attente d'installation":
                return faTools
            case 'Maintenance':
                return faToolbox
            default:
                return null
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

        return null
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

export default ProjectItem2;
