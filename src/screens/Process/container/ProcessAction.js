import React, { Component } from "react"
import { View, StyleSheet, Alert, Linking } from "react-native"
import firebase, { db, auth } from '../../../firebase'
import _ from 'lodash'
// import { withNavigation } from 'react-navigation'
import { connect } from 'react-redux'

import CommentDialog from '../../../components/CommentDialog'
import ModalOptions from '../../../components/ModalOptions'
import Loading from '../../../components/Loading'
 
import { enableProcessAction } from '../../../core/privileges'
import { configChoiceIcon, countDown, displayError, load } from '../../../core/utils'
import * as theme from "../../../core/theme"
import { errorMessages } from "../../../core/constants"

import ProcessContainer from "../../src/container/ProcessContainer"
import ActionHeader from "../components/ActionHeader"
import ProcessTool from "../components/ProcessTool"
import { buildValidateActionParams, buileNavigationOptions, configProcessDialogLabels, handleUpdateAction, runOperation, setProcessModel } from "../core/utils"
import { getCurrentStepPath, getCurrentAction, handleTransition, getPhaseIdFormValue, processHandler, checkForcedValidations, sortPhases } from '../algorithm/process'


const automaticActionTypes = [
    "doc-creation",
    "data-fill",
]

//component
class ProcessAction extends Component {

    constructor(props) {
        super(props)
        this.autoTriggerNextAction = this.autoTriggerNextAction.bind(this)
        this.handleTransition = this.handleTransition.bind(this)
        this.onGoBack = this.onGoBack.bind(this)
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

            multiComments: [],

            showModal: false,
            showDialog: false,
            expanded: true,
            dialogTitle: '',
            dialogDescription: '',
            loadingDialog: false,
            loadingModal: false,
            loading: true,
            loadingMessage: this.initialLoadingMessage,
        }

    }

    async componentDidUpdate(prevProps, prevState, snapshot) {
        //Process was updated on backend (by some user...)
        if (!_.isEqual(prevProps.process, this.props.process)) {
            await this.refreshProcessOnstate(this.props.process)
        }
    }

    async componentDidMount() {
        await this.initProcess()
    }

    async initProcess() {
        const { process } = this.props
        this.processModel = setProcessModel(process)
        await this.mainHandler(process)
            .catch((e) => displayError({ message: e.message }))
    }

    async mainHandler(process) {
        return new Promise(async (resolve, reject) => {
            load(this, true)
            const updatedProcess = await this.runProcessHandler(process) //No error thrown (in case of failure it returns previous Json process object)
            const isEmptyProcess = Object.keys(updatedProcess).length === 1
            if (isEmptyProcess) return
            await this.handleUpdateProcess(updatedProcess)
            resolve(true)
        })
    }

    async runProcessHandler(currentProcess) {
        const { project, step } = this.props
        const startPhaseId = getPhaseIdFormValue(step)
        const processModel = _.cloneDeep(this.processModel)
        var updatedProcess = await processHandler(processModel, currentProcess, startPhaseId, { project })
        return updatedProcess
    }

    async handleUpdateProcess(updatedProcess) {
        await this.updateProcess(updatedProcess)
        await this.refreshProcessOnstate(updatedProcess)
    }

    updateProcess(updatedProcess) {
        const { project } = this.props
        return db
            .collection('Projects')
            .doc(project.id)
            .collection("Process")
            .doc(project.id)
            .set(updatedProcess, { merge: true })
            .catch((e) => { throw new Error(errorMessages.firestore.update) })
    }

    async refreshProcessOnstate(process) {
        const { isAllProcess } = this.props
        await this.refreshProcess(process) //Triggers componentdidupdate
        if (isAllProcess) {
            this.refreshProcessHistory(process)
        }
    }

    //3. Refresh latest process locally
    async refreshProcess(process) {
        return new Promise((resolve, reject) => {
            const { currentPhaseId, currentStepId } = getCurrentStepPath(process)
            const currentPhase = process[currentPhaseId]
            const currentStep = process[currentPhaseId].steps[currentStepId]
            const currentAction = getCurrentAction(process)

            this.setState({
                process,
                currentPhase, currentPhaseId,
                currentStep, currentStepId,
                currentAction,
                nextStep: '',
                nextPhase: '',
                loading: false
            }, () => {
                resolve(true)
            })
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

        process = sortPhases(process)

        for (let phaseId in process) {
            if (phaseId !== "version") {
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
        }

        this.setState({
            phaseLabels,
            phaseStatuses,
            stepsData: steps
        })
    }

    disableLoading() {
        this.setState({
            loading: false,
            loadingMessage: this.initialLoadingMessage
        })
    }

    highLightChoice(choices, choice) {
        const { selected, onSelectType } = choice
        const isMultiCommentsPicker = onSelectType === 'multiCommentsPicker'
        if (typeof (selected) === 'boolean') {
            choices.forEach((item) => {
                const bool1 = isMultiCommentsPicker ? !item.selected : true
                const bool2 = isMultiCommentsPicker ? item.selected : false
                const isSelectedItem = item.label === choice.label
                if (isSelectedItem)
                    item.selected = bool1
                else
                    item.selected = bool2
            })
        }
    }

    async handleMultiCommentsPicker(choiceLabel) {
        return new Promise((resolve, reject) => {
            let { multiComments } = this.state
            const commentIndex = multiComments.findIndex((com) => com === choiceLabel)
            const commentFound = commentIndex !== -1
            if (commentFound)
                multiComments.splice(commentIndex, 1)
            else multiComments.push(choiceLabel)
            this.setState({ multiComments }, () => resolve(true))
        })
    }

    async handleCommentInit(choice) {
        return new Promise((resolve, reject) => {
            const { nextStep, nextPhase } = choice
            this.setNextStepOrPhase(nextStep, nextPhase) //used in case of comment
            const dialogTitle = configProcessDialogLabels(choice.id).title
            const dialogDescription = configProcessDialogLabels(choice.id).description
            this.setState({
                dialogTitle,
                dialogDescription,
                loadingModal: false,
                showModal: false,
            }, () => {
                setTimeout(() => {
                    this.setState({ showDialog: true })
                    resolve(true)
                }, 500)
            })
        })
    }

    //func2
    onSelectChoice = async (choice) => {
        try {
            this.setState({ loadingModal: true, choice })  //used in case of comment
            await countDown(500)
            const { pressedAction } = this.state
            let { choices } = pressedAction
            const { onSelectType, commentRequired, operation, link, nextStep, nextPhase } = choice

            //Highlight selected choice
            choices = this.highLightChoice(choices, choice)
            //Handle MultiComments

            if (onSelectType === 'multiCommentsPicker') {
                await this.handleMultiCommentsPicker(choice.label)
            }

            if (commentRequired) {
                await this.handleCommentInit(choice)
                return
            }

            else {
                if (onSelectType === 'navigation') {
                    this.handleNavigation(pressedAction)
                }

                else if (onSelectType === 'actionRollBack') { //roll back to previous action (update its status to "pending")
                    await this.undoPreviousAction()
                }

                else if (onSelectType === 'transition' || onSelectType === 'validation' || onSelectType === 'commentPicker') {
                    const validateActionParams = buildValidateActionParams(onSelectType, choices, choice, nextStep, nextPhase)
                    await runOperation(operation, pressedAction)
                    await this.validateAction(validateActionParams)
                }

                else if (onSelectType === "openLink") {
                    await Linking.openURL(link)
                }

                this.setState({
                    showModal: onSelectType === 'multiCommentsPicker',
                    loadingModal: false
                })
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
            if (operation && !operation.value)
                operation.value = comment

            await runOperation(operation, pressedAction)
            await this.validateAction({
                comment: null,
                choices: null,
                stay: false,
                nextStep,
                nextPhase,
                choice
            })

            this.setState({
                loadingDialog: false,
                showDialog: false
            })
            clearComment()
        }
        catch (e) {
            const { message } = e
            displayError({ message })
        }
    }

    async handleTransition(params) {
        let { nextStep, nextPhase, processTemp, choice } = params
        if (nextStep || nextPhase) {
            const {
                currentPhaseId,
                currentStepId,
                actions
            } = params

            processTemp[currentPhaseId].steps[currentStepId].actions = checkForcedValidations(actions, choice)

            const { processModel } = this
            const ProjectId = this.props.project.id
            const transitionParams = {
                processModel,
                process: processTemp,
                currentPhaseId,
                currentStepId,
                nextStepId: nextStep,
                nextPhaseId: nextPhase,
                ProjectId
            }
            const transitionRes = handleTransition(transitionParams)
            processTemp = transitionRes.process
            await this.handleUpdateProcess(processTemp)
        }
        else console.log("No transition...")
        return processTemp
    }

    async autoTriggerNextAction() {
        const { verificationType } = this.state.currentAction
        const isAutoPress = verificationType !== "phaseRollback"
        if (false)
            await this.onPressAction(this.props.canUpdate, this.state.currentAction)
    }

    //func5
    validateAction = async (params) => {

        try {
            const { process, currentPhaseId, currentStepId, pressedAction } = this.state
            const { nextStep, nextPhase, choice } = params

            //Update action fields
            let processTemp = _.cloneDeep(process)
            let { actions } = processTemp[currentPhaseId].steps[currentStepId]
            // console.log("process before verify...", processTemp[currentPhaseId].steps[currentStepId].actions, "********"

            actions = handleUpdateAction(actions, pressedAction, params) 

            processTemp[currentPhaseId].steps[currentStepId].actions = actions

            //For stepProgress animation
            this.setState({
                currentStep: processTemp[currentPhaseId].steps[currentStepId]
            })

            // await countDown(1000)

            // console.log("process before transition...", processTemp[currentPhaseId].steps[currentStepId].actions, "----------------")

            const transitionParams = {
                processTemp,
                currentPhaseId,
                currentStepId,
                nextStep,
                nextPhase,
                actions,
                choice
            }

            processTemp = await this.handleTransition(transitionParams)

            // console.log("process after transition...", processTemp[currentPhaseId].steps[currentStepId].actions, ";;;;;")

            await this.mainHandler(processTemp, true)

            //Auto trigger next action
            await this.autoTriggerNextAction()
        }

        catch (e) {
            throw new Error(e)
        }
    }

    //UNDO/ROLLBACK 1
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

    //UNDO/ROLLBACK 2
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
            await this.mainHandler(processTemp, true)
        }
        catch (e) {
            throw new Error(e)
        }
    }

    async handleConfirmChoices(pressedAction, onSelectType) {
        if (onSelectType === "multiCommentsPicker") {
            const comment = this.state.multiComments.join(", ")
            const { choices, nextStep, nextPhase, operation } = pressedAction
            await runOperation(operation, pressedAction)
            await this.validateAction({ comment, choices, stay: false, nextStep, nextPhase })
        }
    }

    //NAVIGATION HANDLERS
    async onGoBack() {
        await this.mainHandler(this.state.process, true)
        //Auto trigger next action
        const { verificationType } = this.state.currentAction
        if (verificationType !== 'validation')
            await this.onPressAction(this.state.currentAction)
    }

    handleNavigation = (currentAction) => {
        console.log('currentAction JSON:', JSON.stringify(currentAction, null, 2));


        let { screenName, screenParams ,drawer } = buileNavigationOptions(currentAction, this.props.project)
     
        screenParams.onGoBack = this.onGoBack

        const navigate = () => {
            if (screenParams.screenPush)
                this.props.navigation.push(drawer,{screen:screenName, params:screenParams})
            else
                this.props.navigation.navigate(drawer,{screen:screenName, params:screenParams})
        }


        this.setState({
            loading: false,
            loadingMessage: this.initialLoadingMessage,
            showModal: false,
            loadingModal: false,
        }, navigate())
    }

    check_User_Authorization_To_Handle_Process_Action(responsable) {
        const { currentPhase } = this.state
        const currentUserId = auth.currentUser.uid
        const currentUserRole = this.props.role.value
        const authorized = enableProcessAction(responsable, currentUserId, currentUserRole, currentPhase)
        return authorized
    }

    handleAutomaticAction(action) {
        //Modal
        const showModal = action.choices

        if (showModal)
            this.setState({ showModal })
        //Navigation
        else
            this.handleNavigation(action)
    }

    async handleManualAction(action) {
        const { verificationType, nextStep, nextPhase, formSettings } = action
        //Dialog
        if (verificationType === 'comment') {
            this.setNextStepOrPhase(nextStep, nextPhase) //To use later it onSubmit comment
            const dialogTitle = formSettings && formSettings.label || 'Commentaire'
            const dialogDescription = formSettings && formSettings.description || "Veuillez renseigner des informations utiles."
            this.setState({
                dialogTitle,
                dialogDescription,
                showDialog: true
            })
        }
        //Modal
        else if (verificationType === 'multiple-choices') {
            this.setState({ showModal: true })
        }
        //Direct
        else if (verificationType === 'validation') {
            const params = buildValidateActionParams(verificationType)
            await this.validateAction(params)
        }
        //Phase RollBack
        else if (verificationType === 'phaseRollback') {
            await runOperation(action.operation, action) //Exp: update project status back to 'En cours'
            await this.phaseRollback()
        }
    }

    async handleAction(action) {
        const isAutomaticAction = automaticActionTypes.includes(action.verificationType)

        if (isAutomaticAction)
            this.handleAutomaticAction(action)
        else
            await this.handleManualAction(action)
    }

    //func1
    onPressAction = async (pressedAction) => {
        try {
            return new Promise(async (resolve, reject) => {
                if (!this.props.canUpdate) return

                this.setState({
                    loading: true,
                    loadingMessage: pressedAction.cloudFunction ? "Envoie de la Facture + Attestation fluide en cours..." : "Traitement en cours...",
                    pressedAction
                }, async () => {
                    await countDown(500)

                    //Check User Authorization To Handle Action
                    // console.log("111", pressedAction)
                    // console.log("222", pressedAction.responsable)
                    const authorized = this.check_User_Authorization_To_Handle_Process_Action(pressedAction.responsable)

                    if (!authorized) {
                        this.disableLoading()
                        Alert.alert('', "Action à mener par un autre utilisateur.")
                        return
                    }

                    //Handle action
                    await this.handleAction(pressedAction)

                    this.disableLoading()
                    resolve(true)
                })
            })
        }
        catch (e) {
            const { message } = e
            displayError({ message })
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

    //renderers
    renderDialog = () => {
        const { showDialog, dialogTitle, dialogDescription, loadingDialog, currentAction } = this.state
        const isDialog = currentAction && (currentAction.choices || currentAction.verificationType === 'comment')
        if (isDialog) {
            const { formSettings } = currentAction
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
        return null
    }

    renderModal = () => {
        const { pressedAction } = this.state
        if (pressedAction && pressedAction.choices) {
            const { showModal, loadingModal } = this.state
            const { title, choices } = pressedAction
            const elements = choices.map((choice) => configChoiceIcon(choice)) || []
            const isMultiCommentsPicker = choices[0].onSelectType === "multiCommentsPicker" //all items are multiCommentsPicker (we can take the first one)
            const isManualValidation = isMultiCommentsPicker
            return (
                <ModalOptions
                    isVisible={showModal}
                    title={title}
                    columns={choices.length}
                    isLoading={loadingModal}
                    toggleModal={() => this.setState({ showModal: !showModal })}
                    handleCancel={() => console.log('cancel')}
                    elements={elements}
                    isReview={pressedAction.isReview}
                    autoValidation={!isManualValidation}
                    handleConfirm={() => this.handleConfirmChoices(pressedAction, choices[0].onSelectType)}
                    hideCancelButton={true}
                    returnSingleElement={isMultiCommentsPicker}
                    handleSelectElement={(element, index) => this.onSelectChoice(element)}
                />
            )
        }

        return null
    }

    renderProcessHistoryContainer(canUpdate) {
        const {
            process,
            currentPage,
            phaseLabels,
            phaseStatuses,
            stepsData,
            loading,
            loadingMessage
        } = this.state
        return (
            <ProcessContainer
                process={process}
                currentPage={currentPage}
                phaseLabels={phaseLabels}
                phaseStatuses={phaseStatuses}
                stepsData={stepsData}
                canUpdate={canUpdate}
                renderAction={this.renderAction}
                loadingAction={loading}
                loadingMessageAction={loadingMessage}
            />
        )
    }

    renderHeader() {
        const { process } = this.state
        const { canUpdate, role, navigation, project } = this.props
        return (
            <ActionHeader
                process={process}
                project={project}
                canUpdate={canUpdate}
                role={role}
                navigation={navigation}
            />
        )
    }

    renderProcessTool() {
        const {
            currentPhase,
            currentStep,
            currentAction,
            loading,
            loadingMessage
        } = this.state

        const onPressAction = async () => await this.onPressAction(currentAction)
        return (
            <ProcessTool
                currentAction={currentAction}
                loadingAction={loading}
                loadingMessageAction={loadingMessage}
                currentPhase={currentPhase}
                currentStep={currentStep}
                onPressAction={onPressAction}
            />
        )
    }

    //Containers
    renderHistoryView() {
        const { loading } = this.state
        const { canUpdate } = this.props
        if (loading)
            return <Loading />
        else
            return (
                <View style={{ flex: 1 }}>
                    {this.renderProcessHistoryContainer(canUpdate)}
                    {this.renderModal()}
                </View>
            )
    }

    renderProcessToolView() {
        return (
            <View style={styles.container}>
                {this.renderHeader()}
                {this.renderProcessTool()}
                {this.renderDialog()}
                {this.renderModal()}
            </View>
        )
    }

    render() {
        const { isAllProcess } = this.props
        return (
            <View style={isAllProcess ? { flex: 1 } : {}}>
                {isAllProcess
                    ?
                    this.renderHistoryView()
                    :
                    this.renderProcessToolView()
                }
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        //  flex: 1,
        borderRadius: 5,
        backgroundColor: theme.colors.white,
        marginHorizontal: 15,
        marginTop: theme.padding * 3,
        marginBottom: theme.padding * 2,
        ...theme.style.shadow
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
        textAlign: 'center',
        color: theme.colors.white
    },
    stepContainer: {
        flexDirection: 'row',
        alignItems: "center",
        marginTop: theme.padding,
        marginBottom: theme.padding * 4
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

const mapStateToProps = (state) => {
    return {
        role: state.roles.role,
        currentUser: state.currentUser,
        //processModels: state.process.processModels
        //fcmToken: state.fcmtoken
    }
}

export default connect(mapStateToProps)(ProcessAction)