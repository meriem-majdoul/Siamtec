


import React, { Component } from "react"
import { View, StyleSheet, Text, ActivityIndicator, Alert } from "react-native"
import _ from 'lodash'
import { faCheckCircle, faExclamationCircle, faInfoCircle, faTimesCircle } from 'react-native-vector-icons/FontAwesome5'
import { faCheckCircle as faSolidCheckCircle } from 'react-native-vector-icons/FontAwesome5'

import CustomIcon from '../../../components/CustomIcon'
import { isTablet } from '../../../core/constants'

import * as theme from "../../../core/theme"
import { Caption } from "../../../components/typography/Typography"


class Action extends Component {

    setLeftIcon() {
        const { id, status } = this.props.action
        const icon = id === 'cancelProject' ? faTimesCircle : status === 'pending' ? faCheckCircle : faSolidCheckCircle
        const color = id === 'cancelProject' ? theme.colors.error : status === 'pending' ? this.props.actionTheme.mainColor : "green"
        const leftIcon = { icon, color }
        return leftIcon
    }

    renderLeft() {
        const { action, loading, loadingMessage, actionTheme } = this.props
        const { textFont, mainColor } = actionTheme
        const leftIcon = this.setLeftIcon()
        return (
            <View style={styles.actionTitleContainer}>
                {!loading &&
                    <CustomIcon
                        icon={leftIcon.icon}
                        size={isTablet ? 28 : 16}
                        color={leftIcon.color}
                        style={{ marginRight: 10 }}
                    />
                }
                <Text style={[textFont, { flex: 1, color: mainColor }]}>
                    {loading ? loadingMessage : action.title}
                </Text>
            </View>
        )
    }

    renderRight() {
        const { loading } = this.props
        if (loading)
            return this.renderLoading()

        else
            return this.renderRightIcons()
    }

    renderLoading() {
        return (
            <View style={styles.actionIconsContainer}>
                <ActivityIndicator size='small' color="#003250" />
                <ActivityIndicator size='small' color={theme.colors.white} />
            </View>
        )
    }

    renderRightIcons() {
        const { mainColor } = this.props.actionTheme
        const { action } = this.props
        const isComment = typeof (action.comment) !== "undefined" && action.comment !== ''
        return (
            <View style={[styles.actionIconsContainer, { justifyContent: isComment ? 'space-between' : 'flex-end' }]}>
                {isComment &&
                    <CustomIcon
                        icon={faExclamationCircle}
                        size={isTablet ? 28 : 16}
                        color={mainColor}
                        onPress={() => Alert.alert('Commentaire', action.comment)}
                        style={{ marginRight: isTablet ? 8 : 5 }}
                    />
                }
                <CustomIcon
                    icon={faInfoCircle}
                    size={isTablet ? 28 : 16}
                    color={mainColor}
                    onPress={() => Alert.alert('Instructions', action.instructions)}
                />
            </View>
        )
    }

    renderActionContent() {
        return (
            <View style={[styles.actionTouchable, this.props.style]}>
                {this.renderLeft()}
                {this.renderRight()}
            </View>
        )
    }

    renderResponsible() {
        const { action } = this.props
        const { responsable } = action
        if (action && responsable)
            return (
                <Text style={[isTablet ? theme.customFontMSregular.caption : theme.customFontMSregular.small, { color: theme.colors.white, marginTop: theme.padding }]}>
                    Responsable: {responsable}
                </Text>
            )
        return null
    }

    renderAction = () => {
        const { action, isProcessHistory } = this.props
        if (!action) return null

        if (isProcessHistory)
            return this.renderActionContent()

        else return (
            <View style={styles.container}>
                <Caption style={styles.actionToDoText}>Action à faire:</Caption>
                {this.renderActionContent()}
                {this.renderResponsible()}
            </View>
        )
    }

    render() {
        return this.renderAction()
    }
}

const styles = StyleSheet.create({
    container: {
        padding: theme.padding,
        backgroundColor: "#003250",
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5,
    },
    actionToDoText: {
        color: theme.colors.white,
        marginBottom: theme.padding
    },
    actionTouchable: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionEmptySpace: {
        flex: 0.1,
    },
    actionTitleContainer: {
        flex: 0.87,
        flexDirection: 'row',
        paddingHorizontal: theme.padding * 1.9,
        alignItems: 'center',
        //backgroundColor: 'brown'
    },
    actionIconsContainer: {
        flex: 0.13,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginRight: 10,
        paddingTop: 3,
        //backgroundColor: 'blue'
    }
})

export default Action