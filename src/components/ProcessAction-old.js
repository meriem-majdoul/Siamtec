import React, { Component } from "react"
import { View, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, ActivityIndicator, Alert } from "react-native"
import firebase, { db, auth } from '../firebase'
import _ from 'lodash'
import { faCheckCircle, faExclamationCircle, faInfoCircle, faRedo, faTimesCircle } from 'react-native-fontawesome'
import { faCheckCircle as faSolidCheckCircle, faEye } from '@fortawesome/free-solid-svg-icons'
import { withNavigation } from 'react-navigation'
import { connect } from 'react-redux'

import moment from 'moment';
import 'moment/locale/fr'
moment.locale('fr')

import CommentDialog from './CommentDialog'
import ModalOptions from './ModalOptions'
import CustomIcon from './CustomIcon'
import StepProgress from './process/StepProgress'
import Loading from './Loading'

import { getCurrentStep, getCurrentAction, handleTransition, getPhaseId, processHandler, checkForcedValidations } from '../core/process'
import { enableProcessAction } from '../core/privileges'
import { configChoiceIcon, countDown, displayError, load } from '../core/utils'
import * as theme from "../core/theme"
import { constants, errorMessages, items_scrollTo } from "../core/constants"
import ProcessContainer from "../screens/src/container/ProcessContainer"
import { Linking } from "react-native"

//component
class ProcessAction extends Component {

    constructor(props) {
        super(props)
        this.mainHandler = this.mainHandler.bind(this)
        this.runProcessHandler = this.runProcessHandler.bind(this)
        this.updateProcess = this.updateProcess.bind(this)
        this.refreshProcess = this.refreshProcess.bind(this)
        this.refreshProcessHistory = this.refreshProcessHistory.bind(this)
        this.validateAction = this.validateAction.bind(this)
        this.undoPreviousAction = this.undoPreviousAction.bind(this)

        this.initialLoadingMessage = "Chargement de l'action..."

        this.state = {
            process: this.props.process,
            choice: null,
            nextStep: '',
            nextPhase: '',

            currentPhase: null,
            currentStep: null,
            currentPhaseId: '',
            currentStepId: '',

            phaseLabels: [],
            phaseStatuses: [],
            stepsData: [],

            currentAction: null,
            pressedAction: null,

            showModal: false,
            showDialog: false,
            expanded: true,
            dialogTitle: '',
            dialogDescription: '',
            loadingDialog: false,
            loadingModal: false,
            loading: true,
            loadingMessage: this.initialLoadingMessage
        }

        this.processModel = this.setProcessModel(this.props.process)
    }

    setProcessModel(process) {
        const { processModels } = this.props
        const { version } = process
        const processModel = processModels[version].process
        return processModel
    }

    async componentDidMount() {
        await this.mainHandler(this.state.process)
            .catch((e) => displayError({ message: e.message }))
    }

    async mainHandler(process) {
        try {
            load(this, true)
            const { isAllProcess } = this.props
            const updatedProcess = await this.runProcessHandler(process) //No error thrown (in case of failure it returns previous Json process object)
            await this.updateProcess(updatedProcess)
            await this.refreshProcess(updatedProcess)
            if (isAllProcess) {
                this.refreshProcessHistory(updatedProcess)
            }
        }
        catch (e) {
            console.log("ERROR", e.message)
            throw new Error(e)
        }
    }

    async runProcessHandler(process) {
        const { project, clientId, step } = this.props
        const secondPhaseId = getPhaseId(step)
        const processModel = _.cloneDeep(this.processModel)
        var updatedProcess = await processHandler(processModel, process, secondPhaseId, clientId, project)
        return updatedProcess
    }

    updateProcess(updatedProcess) {
        return db
            .collection('Projects')
            .doc(this.props.project.id)
            .update({ process: updatedProcess })
            .catch((e) => { throw new Error(errorMessages.firestore.update) })
    }

    //3. Refresh latest process locally
    async refreshProcess(process) {
        return new Promise((resolve, reject) => {
            const { currentPhaseId, currentStepId } = getCurrentStep(process)
            const currentPhase = process[currentPhaseId]
            const currentStep = process[currentPhaseId].steps[currentStepId]
            const currentAction = getCurrentAction(process)

            this.setState({
                process,
                currentPhase, currentStep,
                currentPhaseId, currentStepId,
                currentAction,
                nextStep: '', nextPhase: '',
                loading: false
            }, () => resolve(true))
        })
    }

    //3. Refresh Process History locally
    refreshProcessHistory(process) {
        delete process.version
        let phaseLabels = []
        let phaseStatuses = []
        let steps = []

        for (const phaseId in this.processModel) {
            if (!process[phaseId] && phaseId !== 'cancelProject' && phaseId !== 'endProject') {
                let phase = _.cloneDeep(this.processModel[phaseId])
                delete phase.steps
                process[phaseId] = phase
            }
        }

        process = this.sortPhases(process)

        for (let phaseId in process) {
            const processData = process[phaseId]
            phaseLabels.push(processData.title)

            let phaseSteps = []
            let phaseStatus = processData.steps ? 'done' : 'grayed'
            for (let stepId in processData.steps) {
                let step = processData.steps[stepId]

                let actionsDoneCount = 0
                for (let action of step.actions) {
                    if (action.status === 'done')
                        actionsDoneCount += 1
                }
                step.actions.sort((a, b) => (a.actionOrder > b.actionOrder) ? 1 : -1)

                //Step & Phase progress
                step.progress = step.actions.length === 0 ? 100 : actionsDoneCount / step.actions.length * 100

                if (step.progress < 100)
                    phaseStatus = 'pending'

                phaseSteps.push(step)
            }

            phaseStatuses.push(phaseStatus)
            phaseSteps.sort((a, b) => (a.stepOrder < b.stepOrder) ? 1 : -1)
            steps.push(phaseSteps)
        }

        this.setState({ phaseLabels, phaseStatuses, stepsData: steps })
    }

    disableLoading() {
        this.setState({ loading: false, loadingMessage: this.initialLoadingMessage })
    }

    //func1
    onPressAction = async (canUpdate, currentAction) => {

        try {
            console.log("Action Pressed ******************************")
            if (!canUpdate) return
            const loadingMessage = "Traitement en cours..."
            this.setState({
                loading: true,
                loadingMessage,
                pressedAction: currentAction
            }, async () => {
                await countDown(500)
                const { responsable, type, scrollTo } = currentAction
                const { process, currentPhase } = this.state

                //Check user privilleges on action
                const currentUserId = auth.currentUser.uid
                const currentUserRole = this.props.role.value
                const enableAction = enableProcessAction(responsable, currentUserId, currentUserRole, currentPhase)
                if (!enableAction) {
                    this.disableLoading()
                    Alert.alert('Action non autorisée', "Seul un responsable peut effectuer cette opération.")
                    return
                }

                if (type === 'auto') {

                    //Modal
                    if (currentAction.choices) {
                        this.setState({
                            loading: false,
                            loadingMessage: this.initialLoadingMessage,
                            showModal: true
                        })
                    }

                    //Sroll to item
                    else if (scrollTo) {
                        const { screen, itemId } = scrollTo
                        this.setState({
                            loading: false,
                            loadingMessage: this.initialLoadingMessage
                        })
                        this.props.scrollTo(items_scrollTo[screen][itemId])
                    }

                    //Navigation
                    else {
                        let { screenParams, screenName, screenPush } = currentAction
                        if (screenParams) {
                            screenParams.isProcess = true
                            screenParams.onGoBack = () => this.mainHandler(process)
                        }
                        if (screenName) {
                            if (screenPush)
                                this.props.navigation.push(screenName, screenParams)
                            else
                                this.props.navigation.navigate(screenName, screenParams)
                        }
                        this.setState({
                            loading: false,
                            loadingMessage: this.initialLoadingMessage
                        })
                    }
                }

                else if (type === 'manual') {
                    const { verificationType, nextStep, nextPhase, formSettings } = currentAction

                    //Dialog
                    if (verificationType === 'comment') {
                        this.setNextStepOrPhase(nextStep, nextPhase) //To use later it onSubmit comment
                        const dialogTitle = formSettings && formSettings.label || 'Commentaire'
                        const dialogDescription = formSettings && formSettings.description || "Veuillez renseigner des informations utiles."
                        this.setState({
                            loading: false,
                            loadingMessage: this.initialLoadingMessage,
                            dialogTitle,
                            dialogDescription,
                            showDialog: true
                        })
                    }
                    //Modal
                    else if (verificationType === 'multiple-choices') {
                        this.disableLoading()
                        this.setState({
                            loading: false,
                            loadingMessage: this.initialLoadingMessage,
                            showModal: true
                        })
                    }
                    //Direct
                    else if (verificationType === 'validation') {
                        await this.validateAction(null, null, false, nextStep, nextPhase)
                        this.setState({
                            loading: false,
                            loadingMessage: this.initialLoadingMessage,
                        })
                    }
                    else if (verificationType === 'phaseRollback') {
                        await this.runOperation(currentAction.operation, currentAction) //Exp: update project status back to 'En cours'
                        await this.phaseRollback()
                        this.setState({
                            loading: false,
                            loadingMessage: this.initialLoadingMessage,
                        })
                    }
                }
            })
        }

        catch (e) {
            const { message } = e
            displayError({ message })
        }
    }

    async phaseRollback() {
        try {
            const { process, currentPhaseId } = this.state
            let processTemp = _.cloneDeep(process)
            delete processTemp[currentPhaseId]
            await this.mainHandler(processTemp)
        }
        catch (e) {
            throw new Error(e)
        }
    }

    undoPreviousAction = async () => {
        try {
            const { process, currentPhaseId, currentStepId, pressedAction } = this.state
            const previousActionOrder = pressedAction.actionOrder - 1
            let processTemp = _.cloneDeep(process)
            processTemp[currentPhaseId].steps[currentStepId].actions.forEach((action) => {
                if (action.actionOrder === previousActionOrder) {
                    action.status = "pending"
                }
            })
            await this.mainHandler(processTemp)
        }
        catch (e) {
            throw new Error(e)
        }
    }

    //func2
    onSelectChoice = async (choice) => {
        try {
            this.setState({ loadingModal: true, choice })  //used in case of comment
            await countDown(500)
            const { process, pressedAction } = this.state
            let { screenName, screenParams, choices } = pressedAction
            const { onSelectType, commentRequired, operation, link } = choice
            const { nextStep, nextPhase } = choice

            //Highlight selected choice
            if (typeof (choice.selected) === 'boolean') {
                choices.forEach((item) => {
                    if (item.label === choice.label) item.selected = true
                    else item.selected = false
                })
            }

            if (commentRequired) {
                this.setNextStepOrPhase(nextStep, nextPhase) //used in case of comment
                const dialogTitle = this.configDialogLabels(choice.id).title
                const dialogDescription = this.configDialogLabels(choice.id).description
                this.setState({ dialogTitle, dialogDescription, showModal: false, loadingModal: false, showDialog: true })
                return
            }

            else {
                if (onSelectType === 'navigation') {
                    if (screenParams) {
                        screenParams.isProcess = true
                        screenParams.onGoBack = () => this.mainHandler(process)
                    }
                    this.setState({ showModal: false, loadingModal: false })
                    this.props.navigation.navigate(screenName, screenParams)
                }

                else {
                    if (onSelectType === 'actionRollBack') { //roll back to previous action (update its status to "pending")
                        await this.undoPreviousAction()
                    }

                    else if (onSelectType === 'transition') { //No comment, No "actionData" field -> Choice not needed
                        await this.runOperation(operation, pressedAction)
                        await this.validateAction(null, null, false, nextStep, nextPhase)
                    }

                    else if (onSelectType === 'validation') {
                        await this.runOperation(operation, pressedAction)
                        await this.validateAction(null, null, false, null, null, true)
                    }

                    else if (onSelectType === 'commentPicker') {
                        await this.runOperation(operation, pressedAction)
                        await this.validateAction(choice.label, choices, choice.stay, nextStep, nextPhase)
                    }

                    else if (onSelectType === "openLink") {
                        await Linking.openURL(link)
                    }

                    this.setState({ showModal: false, loadingModal: false })
                }
            }
        }
        catch (e) {
            const { message } = e
            displayError({ message })
        }
    }

    //func3
    onSubmitComment = async (comment, clearComment) => {
        try {
            if (!comment) return //show error message
            this.setState({ loadingDialog: true })

            const { pressedAction, choice, nextStep, nextPhase } = this.state
            const operation = choice && choice.operation || pressedAction.operation || null
            if (operation && !operation.value) operation.value = comment //Like in case updating bill amount

            await this.runOperation(operation, pressedAction)
            await this.validateAction(comment, null, false, nextStep, nextPhase)

            this.setState({ loadingDialog: false, showDialog: false })
            clearComment()
        }
        catch (e) {
            const { message } = e
            displayError({ message })
        }
    }

    //func4
    runOperation = async (operation, action) => {
        if (!operation) return

        const { type, field, value } = operation
        const collection = operation.collection ? operation.collection : action.collection
        const documentId = operation.docId ? operation.docId : action.documentId

        if (type === 'update') {
            let update = {}
            update[field] = value
            await db.collection(collection).doc(documentId).update(update)
        }
    }

    //func5
    validateAction = async (comment, choices, stay, nextStep, nextPhase, forceUpdate = false) => {

        try {
            const { process, currentPhaseId, currentStepId, pressedAction } = this.state

            //Update action fields
            let processTemp = _.cloneDeep(process)
            const { actions } = processTemp[currentPhaseId].steps[currentStepId]

            actions.forEach((action) => {
                if (action.id === pressedAction.id) {
                    //Update comment
                    if (comment)
                        action.comment = comment
                    //Update selected choice (selected = true -> Display it green)
                    if (choices)
                        action.choices = choices
                    //Update action status
                    if (!stay && nextPhase !== 'cancelProject') {
                        action.status = "done"
                        action.doneAt = moment().format()
                        //set start time of next action
                        var index = actions.findIndex(action => action.actionOrder === action.actionOrder + 1)
                        if (index !== -1 && !actions[index].startAt)
                            actions[index].startAt = moment().format()
                    }
                }
            })

            this.setState({
                currentStep: processTemp[currentPhaseId].steps[currentStepId] //for progress animation
            })

            // await countDown(1000)

            if (nextStep || nextPhase) {
                processTemp[currentPhaseId].steps[currentStepId].actions = checkForcedValidations(actions)
                const transitionRes = handleTransition(this.processModel, processTemp, currentPhaseId, currentStepId, nextStep, nextPhase, this.props.project.id)
                processTemp = transitionRes.process
            }

            await this.mainHandler(processTemp)
        }

        catch (e) {
            throw new Error(e)
        }
    }

    //func6
    undoPreviousAction = async () => {
        try {
            const { process, currentPhaseId, currentStepId, pressedAction } = this.state
            const previousActionOrder = pressedAction.actionOrder - 1
            let processTemp = _.cloneDeep(process)
            processTemp[currentPhaseId].steps[currentStepId].actions.forEach((action) => {
                if (action.actionOrder === previousActionOrder) {
                    action.status = "pending"
                }
            })
            await this.mainHandler(processTemp)
        }
        catch (e) {
            throw new Error(e)
        }
    }

    //helper1
    setNextStepOrPhase = (nextStep, nextPhase) => {
        //Set next step or phase
        if (nextStep) {
            this.setState({ nextStep, nextPhase: '' })
        }

        else if (nextPhase) {
            this.setState({ nextStep: '', nextPhase })
        }

        else return
    }

    //helper2
    configDialogLabels = (choiceId) => {
        switch (choiceId) {
            case 'postpone': return { title: "Motif du repport", description: "Expliquez brièvemment la raison du report." }; break;
            case 'cancel': return { title: "Motif de l'annulation", description: "Expliquez brièvemment la raison de l'annulation." }; break
            case 'block': return { title: "Motif du bloquage", description: "Expliquez brièvemment la raison de ce blocage." }; break
            case 'comment': return { title: "Commentaire", description: "Veuillez saisir votre commentaire." }; break
            default: return { title: "Commentaire", description: "Veuillez saisir votre commentaire." }; break
        }
    }

    //helper3
    sortPhases(process) {
        const procesTemp = Object.entries(process).sort(([keyA, valueA], [keyB, valueB]) => {
            return (valueA.phaseOrder > valueB.phaseOrder ? 1 : -1)
        })
        process = Object.fromEntries(procesTemp)
        return process
    }

    //renderers
    renderAction = (canUpdate, action, actionTheme, style) => {
        if (!action) return null
        const { loading, loadingMessage } = this.state
        var { title, status, verificationType, choices } = action
        const { mainColor, textFont } = actionTheme
        var isComment = typeof (action.comment) !== 'undefined' && action.comment !== ''
        const isDialog = choices || verificationType === 'comment'
        const leftIcon = action.id === 'cancelProject' ? faTimesCircle : status === 'pending' ? faCheckCircle : faSolidCheckCircle
        const leftIconColor = action.id === 'cancelProject' ? theme.colors.error : status === 'pending' ? mainColor : "green"

        return (
            <View style={[styles.actionTouchable, style]}>
                <View style={styles.actionTitleContainer}>
                    {!loading &&
                        <CustomIcon
                            icon={leftIcon}
                            size={18}
                            color={leftIconColor}
                            style={{ marginTop: 3, marginRight: 10, }}
                        />
                    }
                    <Text style={[textFont, { flex: 1, color: mainColor }]}>
                        {loading ? loadingMessage : title}
                    </Text>
                </View>

                {loading ?
                    <View style={styles.actionIconsContainer}>
                        <ActivityIndicator size='small' color={theme.colors.primary} />
                        <ActivityIndicator size='small' color={theme.colors.white} />
                    </View>
                    :
                    <View style={[styles.actionIconsContainer, { justifyContent: isComment ? 'space-between' : 'flex-end' }]}>
                        {isComment &&
                            <CustomIcon
                                icon={faExclamationCircle}
                                size={16}
                                color={mainColor}
                                onPress={() => Alert.alert('Commentaire', action.comment)}
                            />
                        }
                        <CustomIcon
                            icon={faInfoCircle}
                            size={16}
                            color={mainColor}
                            onPress={() => Alert.alert('Instructions', action.instructions)}
                        />
                    </View>
                }
                {isDialog && this.renderDialog(action.formSettings)}
            </View>
        )
    }

    renderDialog = (formSettings) => {
        const { showDialog, dialogTitle, dialogDescription, loadingDialog, loading } = this.state
        return (
            <CommentDialog
                isVisible={showDialog}
                title={dialogTitle}
                description={dialogDescription}
                keyboardType={formSettings && formSettings.keyboardType}
                onSubmit={this.onSubmitComment}
                onCancel={() => this.setState({ showDialog: false })}
                loading={loadingDialog}
            />
        )
    }

    renderModal = () => {
        const { pressedAction, showModal, loadingModal } = this.state
        const { title, choices } = pressedAction
        const elements = choices.map((choice) => configChoiceIcon(choice)) || []
        return (
            <ModalOptions
                isVisible={showModal}
                title={title}
                columns={choices.length}
                isLoading={loadingModal}
                toggleModal={() => this.setState({ showModal: !showModal })}
                handleCancel={() => console.log('cancel')}
                handleConfirm={() => console.log('confirm')}
                elements={elements}
                isReview={pressedAction.isReview}
                autoValidation={true}
                handleSelectElement={(element, index) => this.onSelectChoice(element)}
            />
        )
    }

    renderHeaderBar() {
        const { process } = this.state
        const { project, clientId, step, canUpdate, role } = this.props
        const navParams = { process, project, clientId, step, canUpdate, role }
        const onPressEye = () => this.props.navigation.navigate('Progression', navParams)
        return (
            <View style={styles.headerBarContainer}>
                <Text style={[theme.customFontMSmedium.caption, styles.headerBarText]}>SUIVI DU PROJET</Text>
                <View style={styles.progressionLinks}>
                    <TouchableOpacity>
                        <CustomIcon
                            onPress={() => this.mainHandler(process)}
                            icon={faRedo}
                            size={18}
                            color={theme.colors.primary}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <CustomIcon
                            onPress={onPressEye}
                            icon={faEye}
                            size={19}
                            color={theme.colors.primary}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    renderProcessBox(canUpdate) {
        const { expanded, currentPhase, currentStep, currentAction } = this.state
        const phaseTitle = currentPhase ? currentPhase.title : "Chargement de la phase..."
        const stepTitle = currentStep ? `${currentStep.stepOrder}. ${currentStep.title}` : "Chargement de l'étape..."
        const doneActions = currentStep ? currentStep.actions.filter((action) => action.status === 'done').length : undefined
        const totalActions = currentStep ? currentStep.actions.length : undefined
        var progress = totalActions ? (doneActions / totalActions) * 100 : undefined

        const showProgress = totalActions && progress !== undefined ? true : false

        return (
            <View style={{ borderBottomRightRadius: 5, borderBottomLeftRadius: 5 }}>
                <View style={{ padding: theme.padding }}>
                    <Text style={[theme.customFontMSmedium.body, { marginBottom: 8 }]}>{phaseTitle}</Text>
                    <Text style={theme.customFontMSregular.body}>{stepTitle}</Text>
                    {showProgress &&
                        <StepProgress
                            progress={progress}
                            size={60}
                            style={{ alignSelf: "center", marginTop: theme.padding * 0.8 }}
                        />
                    }
                </View>

                <TouchableWithoutFeedback onPress={() => this.onPressAction(canUpdate, currentAction)}>
                    <View style={{ padding: theme.padding, backgroundColor: theme.colors.primary, borderBottomLeftRadius: 5, borderBottomRightRadius: 5, }}>
                        <Text style={[theme.customFontMSmedium.caption, { color: theme.colors.white, marginBottom: theme.padding }]}>Action à faire:</Text>
                        {this.renderAction(canUpdate, currentAction, { mainColor: theme.colors.white, textFont: theme.customFontMSbold.body }, {})}
                        {currentAction && currentAction.responsable &&
                            <Text style={[theme.customFontMSregular.small, { color: theme.colors.white, marginTop: theme.padding }]}>
                                Responsable: {currentAction.responsable}
                            </Text>
                        }
                    </View>
                </TouchableWithoutFeedback>
            </View>
        )
    }

    renderProcessHistoryContainer(canUpdate) {
        const { process, currentPage, phaseLabels, phaseStatuses, stepsData } = this.state
        return (
            <ProcessContainer
                process={process}
                currentPage={currentPage}
                phaseLabels={phaseLabels}
                phaseStatuses={phaseStatuses}
                stepsData={stepsData}
                canUpdate={canUpdate}
                renderAction={this.renderAction}
            />
        )
    }

    render() {
        const { pressedAction, currentPhase, currentStep } = this.state
        const { canUpdate, isAllProcess } = this.props

        if (isAllProcess) {
            return (
                <View style={{ flex: 1 }}>
                    {this.renderProcessHistoryContainer(canUpdate)}
                    {pressedAction && pressedAction.choices && this.renderModal()}
                </View>
            )
        }

        else return (
            <View style={styles.container}>
                {this.renderHeaderBar()}
                {this.renderProcessBox(canUpdate)}
                {pressedAction && pressedAction.choices && this.renderModal()}
            </View>
        )
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        elevation: 5,
        borderRadius: 5,
        backgroundColor: theme.colors.white,
        margin: 15,
        marginVertical: 35
    },
    headerBarContainer: {
        backgroundColor: theme.colors.section,
        borderTopRightRadius: 5,
        borderTopLeftRadius: 5,
        borderBottomWidth: 2,
        borderBottomColor: theme.colors.gray_light,
        paddingVertical: theme.padding,
        // justifyContent: 'center'
    },
    headerBarText: {
        letterSpacing: 2.5,
        opacity: 0.7,
        textAlign: 'center'
    },
    stepContainer: {
        flexDirection: 'row',
        alignItems: "center",
        marginTop: theme.padding,
        marginBottom: theme.padding * 4
    },
    progressionLinks: {
        flexDirection: 'row',
        zIndex: 1,
        position: 'absolute',
        top: theme.padding * 1.2,
        right: theme.padding / 2,
        justifyContent: 'space-between',
        alignItems: 'center',
        width: 50
    },
    accordion: {
        paddingVertical: 10,
        paddingHorizontal: 13,
        marginLeft: 0,
        borderBottomColor: theme.colors.gray_light
    },
    actionTouchable: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionEmptySpace: {
        flex: 0.1,
    },
    actionTitleContainer: {
        flex: 0.8,
        flexDirection: 'row',
        // backgroundColor: 'brown'
    },
    actionIconsContainer: {
        flex: 0.1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginRight: 10,
        paddingTop: 3,
        // backgroundColor: 'blue'
    }
})

const mapStateToProps = (state) => {
    return {
        role: state.roles.role,
        processModels: state.process.processModels
        //fcmToken: state.fcmtoken
    }
}

export default withNavigation(connect(mapStateToProps)(ProcessAction))