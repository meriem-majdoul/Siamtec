






import React, { Component } from "react"
import { View, StyleSheet, TouchableOpacity } from "react-native"
import _ from 'lodash'

import { isTablet } from '../../../core/constants'
import * as theme from "../../../core/theme"
import Action from "./Action"
import { Body, Header } from "../../../components/typography/Typography"
import StepProgress from './StepProgress'

class ProcessTool extends Component {

    renderPhase() {
        const { currentPhase } = this.props
        const phaseTitle = currentPhase ? currentPhase.title : "Chargement de la phase..."
        return (
            <Header style={{ marginBottom: 8 }}>{phaseTitle}</Header>
        )
    }

    renderStep() {
        const { currentStep } = this.props
        const stepTitle = currentStep ? `${currentStep.stepOrder}. ${currentStep.title}` : "Chargement de l'étape..."
        return (
            <Body>{stepTitle}</Body>
        )
    }

    renderStepProgress() {
        const { currentStep } = this.props
        const doneActions = currentStep ? currentStep.actions.filter((action) => action.status === 'done').length : null
        const totalActions = currentStep ? currentStep.actions.length : null
        var progress = totalActions ? (doneActions / totalActions) * 100 : null
        const showProgress = totalActions && progress !== null ? true : false
        if (!showProgress) return null
        return (
            <StepProgress
                progress={progress}
                size={isTablet ? 200 : 60}
                style={styles.stepProgress}
            />
        )
    }

    renderAction() {
        const {
            currentAction,
            loadingAction,
            loadingMessageAction,
            onPressAction
        } = this.props


        return (
            <TouchableOpacity onPress={() => onPressAction(currentAction)}>
                <Action
                    action={currentAction}
                    actionTheme={{ mainColor: theme.colors.white, textFont: theme.customFontMSbold.body }}
                    style={{}}
                    loading={loadingAction}
                    loadingMessage={loadingMessageAction}
                />
            </TouchableOpacity>
        )
    }

    renderProcessTool() {
        return (
            <View style={styles.container}>
                <View style={{ padding: theme.padding }}>
                    {this.renderPhase()}
                    {this.renderStep()}
                    {this.renderStepProgress()}
                </View>
                {this.renderAction()}
            </View>
        )
    }

    render() {
        return this.renderProcessTool()
    }
}

const styles = StyleSheet.create({
    container: {
        borderBottomRightRadius: 5,
        borderBottomLeftRadius: 5
    },
    stepProgress: {
        alignSelf: "center",
        marginTop: theme.padding * 0.8
    },
})

export default ProcessTool