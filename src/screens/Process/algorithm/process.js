import moment from 'moment';
import 'moment/locale/fr'
moment.locale('fr')

import { db, functions } from '../../../firebase'
import _ from 'lodash'
import { stringifyUndefined, getMinObjectProp, displayError } from '../../../core/utils'
import { errorMessages, lastAction } from '../../../core/constants';

const documentIdMap = {
    Projects: { attribute: "project", idPath: ["id"] },
    Clients: { attribute: "project", idPath: ["client", "id"] },
}

export const processHandler = async (processModel, currentProcess, startPhaseId, attributes) => {
    try {
        let process = _.cloneDeep(currentProcess)
        isCorruptedProcess(processModel, process)
        const updatedProcess = await updateProcess(processModel, process, startPhaseId, attributes)
        return updatedProcess || currentProcess
    }
    catch (e) {
        const { message } = e
        displayError({ message })
        return currentProcess
    }
}

const isCorruptedProcess = (processModel, process) => {
    const corruptedProcessModel = !processModel || processModel === undefined || typeof (processModel) === "undefined"
    const corruptedProcess = !process || process === undefined || typeof (process) === "undefined"
    const isError = (corruptedProcessModel || corruptedProcess)
    if (isError) {
        throw new Error("Le model du process n'a pas été initialisé... Veuillez réessayer")
    }
    return
}

const updateProcess = async (processModel, process, startPhaseId, attributes) => {
    let isUpdateNextStep = true
    while (isUpdateNextStep) {
        console.log("1..")
        process = initProcessOnStartNewProject(processModel, process, startPhaseId)
        console.log("2..")
        const resp = await updateLastStepActions_And_HandleTransition({ processModel, process, attributes })
        console.log("3..")
        process = resp.process
        isUpdateNextStep = resp.isUpdateNextStep
    }
    return process
}

const initProcessOnStartNewProject = (processModel, process, startPhaseId) => {

    const isEmptyProcess = Object.keys(process).length === 1
    if (!isEmptyProcess) return process

    //Init project with first phase/first step
    const firstPhaseId = getPhaseId(processModel, 1) //Phase "Init"
    process = initPhase(processModel, process, firstPhaseId)


    //If "init"...Set nextPhase to second phase
    if (startPhaseId === 'init') {
        startPhaseId = getPhaseId(processModel, 2) //rd1
    }

    //Set "nextPhase" dynamiclly for last action of last step
    Object.keys(process[firstPhaseId].steps).forEach((stepId) => {
        let { actions } = process[firstPhaseId].steps[stepId]
        actions[actions.length - 1].nextPhase = startPhaseId
    })

    return process
}

const updateLastStepActions_And_HandleTransition = async ({ processModel, process, attributes }) => {
    //update actions
    var { currentPhaseId, currentStepId } = getCurrentStepPath(process)
    let { actions } = process[currentPhaseId].steps[currentStepId]
    const { verifiedActions, nextStep, nextPhase } = await updateActions({ actions, attributes })
    actions = verifiedActions

    //Handle step/phase transition
    const transitionResp = handleStepOrPhaseTransition({
        processModel,
        process,
        currentPhaseId,
        currentStepId,
        nextStep,
        nextPhase,
        attributes
    })
    process = transitionResp.process
    const isUpdateNextStep = transitionResp.isUpdateNextStep
    return { process, isUpdateNextStep }
}

const updateActions = async (params) => {
    let { actions, attributes } = params
    actions = removeNullActions(actions)
    if (actions.length === 0) return
    actions = await configureActions(actions, attributes)

    //Send email handler
    const firstAction = actions[0]
    if (firstAction.cloudFunction) {
        const projectName = attributes.project.name
        await handleSendBillEmail(firstAction, projectName)
    }

    var res = await verifyActions(actions)
    let { verifiedActions, nextStep, nextPhase } = res
    verifiedActions = setActionTimeLog(verifiedActions)
    return { verifiedActions, nextStep, nextPhase }
}

const handleStepOrPhaseTransition = ({ processModel, process, currentPhaseId, currentStepId, nextStep, nextPhase, attributes }) => {
    let isUpdateNextStep = true

    if (nextStep || nextPhase) {
        const ProjectId = attributes.project.id
        const transitionParams = {
            processModel,
            process,
            currentPhaseId,
            currentStepId,
            nextStepId: nextStep,
            nextPhaseId: nextPhase,
            ProjectId
        }
        const transitionRes = handleTransition(transitionParams)
        process = transitionRes.process
        const { processEnded } = transitionRes
        isUpdateNextStep = !processEnded
    }
    else isUpdateNextStep = false

    console.log("isUpdateNextStep.....", isUpdateNextStep)
    return { process, isUpdateNextStep }
}

export const handleTransition = ({ processModel, process, currentPhaseId, currentStepId, nextStepId, nextPhaseId, ProjectId }) => {
    let processEnded = false
    //Next step transition
    if (nextStepId) {
        console.log("uuuuu", nextStepId)
        process = projectNextStepInit(processModel, process, currentPhaseId, currentStepId, nextStepId)
    }
    //Next phase transition
    else if (nextPhaseId) {
        //Update project (status/step)
        if (nextPhaseId === 'cancelProject') {
            cancelProject(ProjectId)
        }

        else if (nextPhaseId === 'endProject') {
            endProject(ProjectId)
            processEnded = true
        }

        else {
            updateProjectPhase(processModel, nextPhaseId, ProjectId)
        }

        //Resume maintenance
        if (nextPhaseId === 'maintainance' && process['installation'].steps['maintainanceContract']) {
            process = resumeMaintainance(processModel, process)
        }

        else {
            process = initPhase(processModel, process, nextPhaseId)
        }
    }
    return { process, processEnded }
}

const removeNullActions = (actions) => {
    actions = actions.filter((a) => a !== null)
    return actions
}

const handleSendBillEmail = async (action, projectName) => {
    try {
        const sendEmail = functions.httpsCallable('sendEmail')
        const { subject, dest, projectId, attachments } = action.cloudFunction.params
        const html = `<b>${subject} du projet ${projectName}</b>`
        const isSent = await sendEmail({ receivers: dest, subject, html, attachments })
        console.log("isSent", dest, subject, html, attachments)

        //  if (isSent.data)
        await db.collection(action.collection).doc(projectId).update({ finalBillSentViaEmail: true })

        // else throw new Error("L'envoie de la facture par email a échoué. Veuillez réessayer plus tard.")
    }
    catch (e) {
        throw new Error(e)
    }
}

export const checkForcedValidations = (actions, choice) => {
    for (let action of actions) {
        if (action.forceValidation) {
            if (choice && choice.nextPhase === "cancelProject") //Pour contourner forceValidation
                action.status = 'pending'
            else action.status = 'done'
        }
    }
    return actions
}

const getPhaseId = (processModel, phaseOrder) => {
    const phaseArray = Object.entries(processModel).filter(([key, value]) => value['phaseOrder'] === phaseOrder)
    const phase = Object.fromEntries(phaseArray)
    const phaseId = Object.keys(phase)[0]
    return phaseId
}

export const initPhase = (processModel, process, phaseId) => {
    //1. Get next Phase from process model
    const phaseModel = _.cloneDeep(processModel[phaseId])

    //2. Keep only first step (stepOrder = 1)
    const firstStep = getStep(phaseModel.steps, 1)
    phaseModel.steps = firstStep

    //3. Add next phase to process
    process[phaseId] = phaseModel

    return process
}

//Task 2. Configure actions
const configureActions = async (actions, attributes) => {

    try {
        let query

        for (let action of actions) {

            let {
                collection,
                documentId,
                cloudFunction,
                queryFilters,
                verificationType,
                queryFilters_onProgressUpload,
                choices
            } = action

            //1. Complete missing params
            if (collection && documentId === '') {
                const idMap = documentIdMap[collection]
                if (idMap) {
                    const { attribute, idPath } = idMap
                    const documentId = idPath.reduce((a, prop) => a[prop], attributes[attribute])
                    action.documentId = documentId
                }
            }


            if (queryFilters) {
                for (let item of action.queryFilters) {
                    if (item.filter === 'project.id') item.value = attributes.project.id
                }
            }

            if (queryFilters_onProgressUpload) {
                for (let item of action.queryFilters_onProgressUpload) {
                    if (item.filter === 'project.id') item.value = attributes.project.id
                }
            }

            if (choices) {
                for (let item of action.choices) {
                    if (item.operation && item.operation.collection === "Clients") {
                        item.operation.docId = attributes.project.client.id
                    }
                }
            }

            if (cloudFunction) {
                const { params, queryAttachmentsUrls } = action.cloudFunction

                for (let item in params) {
                    if (item === 'projectId') params.projectId = attributes.project.id
                }

                //set attachments
                for (let attachmentKey in queryAttachmentsUrls) {

                    for (let item of queryAttachmentsUrls[attachmentKey]) {
                        if (item.filter === 'project.id') item.value = attributes.project.id
                    }

                    query = db.collection('Documents')
                    queryAttachmentsUrls[attachmentKey].forEach(({ filter, operation, value }) => query = query.where(filter, operation, value))

                    const querysnapshot = await query.get().catch((e) => { throw new Error("Erreur lors du chargement de la facture et/ou de l'atestation fluide. Veuillez réessayer.") })
                    if (!querysnapshot.empty) {
                        const document = querysnapshot.docs[0].data()
                        const attachment = {
                            filename: `${attachmentKey}.pdf`,
                            path: document.attachment.downloadURL
                        }
                        params.attachments.push(attachment)
                    }
                    else {
                        throw new Error("Facture ou attestation fluide introuvable pour ce projet. Veuillez vérifier l'existence de ces documents.")
                    }
                }
            }

            const selectedQueryFilters = queryFilters_onProgressUpload || queryFilters || null


            if (selectedQueryFilters && selectedQueryFilters.length > 0) {

                //Set query
                query = db.collection(collection)
                selectedQueryFilters.forEach(({ filter, operation, value }, index) => {
                    query = query.where(filter, operation, value)
                })
                const querysnapshot = await query.get().catch((e) => { throw new Error(errorMessages.firestore.get) })

                //Reinitialize nav params in case document was deleted
                if (querysnapshot.empty) {
                    action.documentId = ''
                }

                //Set Navigation Params (exp: temporary access before upload completes)
                else {
                    const docId = querysnapshot.docs[0].id
                    action.documentId = docId
                }
            }

        }
        return actions
    }

    catch (e) {
        throw new Error(e)
    }
}

//Task 3. Verifications & Status Update
const verifyActions = async (actions) => {
    try {
        let allActionsValid = true
        let verifiedActions = []
        let nextStep = ''
        let nextPhase = ''

        //1. Split actions to 4 groups based on "verificationType" property
        const actions_groupedByVerificationType = groupBy(actions, "verificationType")

        //AUTO
        //VERIFICATION TYPE 1: data-fill
        let actions_dataFill = actions_groupedByVerificationType['data-fill'] || []
        let allActionsValid_dataFill = true

        if (actions_dataFill.length > 0) {
            var res1 = await verifyActions_dataFill(actions_dataFill)
            allActionsValid_dataFill = res1.allActionsValid_dataFill
            actions_dataFill = res1.verifiedActions_dataFill
            nextStep = res1.nextStep
            nextPhase = res1.nextPhase
        }

        //VERIFICATION TYPE 2: doc-creation
        let actions_docCreation = actions_groupedByVerificationType['doc-creation'] || []
        let allActionsValid_docCreation = true

        if (actions_docCreation.length > 0) {
            var res2 = await verifyActions_docCreation(actions_docCreation)
            allActionsValid_docCreation = res2.allActionsValid_docCreation
            actions_docCreation = res2.verifiedActions_docCreation
            nextStep = res2.nextStep
            nextPhase = res2.nextPhase
        }

        //MANUAL
        //VERIFICATION TYPE 3: 
        let actions_multipleChoices = actions_groupedByVerificationType['multiple-choices'] || []
        let actions_comment = actions_groupedByVerificationType['comment'] || []
        let actions_validation = actions_groupedByVerificationType['validation'] || []
        let actions_phaseRollback = actions_groupedByVerificationType['phaseRollback'] || []
        let actions_manual = actions_multipleChoices.concat(actions_comment, actions_validation, actions_phaseRollback)
        let allActionsValid_manual = true

        if (actions_manual.length > 0) {
            var res3 = verifyActions_manual(actions_manual)
            allActionsValid_manual = res3.allActionsValid_manual
            actions_manual = res3.verifiedActions_manual
            // nextStep = res3.nextStep
            // nextPhase = res3.nextPhase
        }

        allActionsValid = allActionsValid_dataFill && allActionsValid_docCreation && allActionsValid_manual
        verifiedActions = verifiedActions.concat(actions_dataFill, actions_docCreation, actions_manual)

        return {
            allActionsValid,
            verifiedActions,
            nextStep,
            nextPhase
        }
    }

    catch (e) {
        throw new Error(e)
    }
}

const verifyActions_dataFill = async (actions) => {

    try {
        //Issue: cannot access same document same collection multiple times in a very short delay
        //Solution: Sort by 'Document-Id' to access and verify one time all actions concerning same document (use verifyActions_dataFill_sameDoc).
        const formatedActions = groupBy(actions, "documentId")

        //Verify actions for each document
        let allActionsValid_dataFill = true
        let verifiedActions_dataFill = []
        let nextStep = ''
        let nextPhase = ''

        for (const documentId in formatedActions) {
            let res = await verifyActions_dataFill_sameDoc(formatedActions[documentId])
            allActionsValid_dataFill = allActionsValid_dataFill && res.allActionsSameDocValid
            verifiedActions_dataFill = verifiedActions_dataFill.concat(res.verifiedActionsSameDoc)
            nextStep = res.nextStep
            nextPhase = res.nextPhase
        }

        return { allActionsValid_dataFill, verifiedActions_dataFill, nextStep, nextPhase }
    }

    catch (e) {
        throw new Error(e)
    }

}

const verifyActions_dataFill_sameDoc = async (actionsSameDoc) => {

    try {
        const collection = actionsSameDoc[0]['collection']
        const documentId = actionsSameDoc[0]['documentId']
        let allActionsSameDocValid = true
        let nextStep = ''
        let nextPhase = ''

        const doc = await db.collection(collection).doc(documentId).get()
        const data = doc.data()

        for (let action of actionsSameDoc) {

            if (!doc.exists) {
                action.status = 'pending'
                allActionsSameDocValid = false
            }

            else {
                const nestedVal = action.properties.reduce((a, prop) => a[prop], data)
                if (typeof (nestedVal) === 'undefined') {
                    action.status = 'pending'
                    allActionsSameDocValid = false
                }
                else {
                    if (nestedVal !== action.verificationValue) {
                        action.status = 'done'
                        nextStep = stringifyUndefined(action.nextStep)
                        nextPhase = stringifyUndefined(action.nextPhase)
                    }

                    else {
                        action.status = 'pending'
                        allActionsSameDocValid = false
                    }
                }
            }
        }
        const verifiedActionsSameDoc = actionsSameDoc

        return { verifiedActionsSameDoc, allActionsSameDocValid, nextStep, nextPhase }
    }

    catch (e) {
        throw new Error(errorMessages.firestore.get)
    }
}

//Verify actions for each document
const verifyActions_docCreation = async (actions) => {
    try {
        let allActionsValid_docCreation = true
        let nextStep = ''
        let nextPhase = ''

        for (let action of actions) {

            const { collection, queryFilters, events } = action
            let query = db.collection(collection)
            queryFilters.forEach(({ filter, operation, value }) => query = query.where(filter, operation, value))
            const querysnapshot = await query.get().catch((e) => { throw new Error(errorMessages.firestore.get) })

            if (querysnapshot.empty) {
                if (events && events.onDocNotFound) {  //CASE1: Conditional transition (2 options) depending on doc found or not
                    nextStep = events.onDocNotFound.nextStep
                    nextPhase = events.onDocNotFound.nextPhase
                }
                action.status = 'pending' //CASE2: No transition if doc not found
                allActionsValid_docCreation = false
            }

            else {
                if (events && events.onDocFound) { //CASE1: Conditional transition (2 options) depending on doc found or not
                    nextStep = events.onDocFound.nextStep
                    nextPhase = events.onDocFound.nextPhase
                }
                action.status = 'done' //CASE2: Transition only on doc found
                nextStep = stringifyUndefined(action.nextStep)
                nextPhase = stringifyUndefined(action.nextPhase)
            }
        }

        const verifiedActions_docCreation = actions
        return { allActionsValid_docCreation, verifiedActions_docCreation, nextStep, nextPhase }
    }

    catch (e) {
        throw new Error(e)
    }
}

const verifyActions_manual = (actions) => {
    let allActionsValid_manual = true
    let nextStep = ''
    let nextPhase = ''

    for (let action of actions) {
        if (action.status === 'pending')
            allActionsValid_manual = false

        else {
            nextStep = stringifyUndefined(action.nextStep)
            nextPhase = stringifyUndefined(action.nextPhase)
        }
    }

    const verifiedActions_manual = actions
    return {
        allActionsValid_manual,
        verifiedActions_manual,
        nextStep,
        nextPhase
    }
}

const setActionTimeLog = (actions) => {

    const pendingActions = actions.filter((action) => action.status === 'pending')
    if (pendingActions.length > 0) {
        var minPending = getMinObjectProp(pendingActions, 'actionOrder')
        var index1 = actions.findIndex(action => action.actionOrder === minPending)
        if (!actions[index1].startAt)
            actions[index1].startAt = moment().format()
    }

    const doneActions = actions.filter((action) => action.status === 'done')
    if (doneActions.length > 0) {
        for (const act of doneActions) {
            var index2 = actions.findIndex(action => action.id === act.id)

            if (!actions[index2].startAt)
                actions[index2].startAt = moment().format()

            if (!actions[index2].doneAt)
                actions[index2].doneAt = moment().format()
        }
    }

    return actions
}

export const projectNextStepInit = (processModel, process, currentPhaseId, currentStepId, nextStepId) => {

    //0. Handle rollback (report rdn loop)
    //Delete current step + undo all actions the new step
    if (nextStepId) {
        const currentStepOrder = processModel[currentPhaseId].steps[currentStepId].stepOrder
        const nextStepOrder = processModel[currentPhaseId].steps[nextStepId].stepOrder
        if (nextStepOrder < currentStepOrder) {
            delete process[currentPhaseId].steps[currentStepId]
            process[currentPhaseId].steps[nextStepId].actions.forEach((action) => {
                action.status = "pending"
            })
            return process
        }
    }

    //1. Get next Step from process model
    const nextStepModel = processModel[currentPhaseId].steps[nextStepId]

    //2. Concat next step to process
    process[currentPhaseId].steps[nextStepId] = nextStepModel

    return process
}

const getStep = (steps, stepOrder) => {
    const firstStepArray = Object.entries(steps).filter(([key, value]) => value['stepOrder'] === stepOrder)
    const firstStep = Object.fromEntries(firstStepArray)
    return firstStep
}

const resumeMaintainance = (processModel, process) => {

    //Initialize maintainance phase
    process['maintainance'] = {}
    process['maintainance'].title = _.clone(processModel['maintainance'].title)
    process['maintainance'].instructions = _.clone(processModel['maintainance'].instructions)
    process['maintainance'].phaseOrder = _.clone(processModel['maintainance'].phaseOrder)
    process['maintainance'].steps = {}
    process['maintainance'].steps['maintainanceContract'] = _.cloneDeep(process['installation'].steps['maintainanceContract'])

    //Configure maintainance phase actions
    process['maintainance'].steps['maintainanceContract'].actions.forEach((action, actionIndex) => {
        if (action.nextStep)
            delete action.nextStep
        if (action.nextPhase)
            delete action.nextPhase
        if (action.choices)
            action.choices = action.choices.filter((choice) => choice.id !== "cancel" && choice.id !== "skip")
    })
    const actionOrder = process['maintainance'].steps['maintainanceContract'].actions.length
    process['maintainance'].steps['maintainanceContract'].actions.push(lastAction(actionOrder))

    //Remove pending actions from installation.maintainanceContract (because it is duplicated to maintainance phase)
    let { actions } = process['installation'].steps['maintainanceContract']
    actions = actions.filter((action) => action.status !== "pending")
    process['installation'].steps['maintainanceContract'].actions = actions

    return process
}

//Update project (status/step)
const updateProjectPhase = (processModel, nextPhaseId, ProjectId) => {
    const phaseValue = processModel[nextPhaseId].phaseValue
    db.collection('Projects').doc(ProjectId).update({ step: phaseValue })
}

const endProject = (ProjectId) => {
    db.collection('Projects').doc(ProjectId).update({ state: 'Terminé' })
}

const cancelProject = (ProjectId) => {
    db.collection('Projects').doc(ProjectId).update({ state: 'Annulé' })
}


//#Helpers
export const getCurrentPhase = (process) => {

    const phases = Object.entries(process)

    let maxPhaseOrder = 0
    let currentPhaseId

    phases.forEach(([phaseId, phase]) => {
        if (phase.phaseOrder > maxPhaseOrder) {
            maxPhaseOrder = phase.phaseOrder
            currentPhaseId = phaseId
        }
    })

    return currentPhaseId
}

export const getCurrentStepPath = (process) => {
    let maxStepOrder = 0
    var currentPhaseId = getCurrentPhase(process)
    let currentStepId

    const { steps } = process[currentPhaseId]
    const stepsFormated = Object.entries(steps)

    stepsFormated.forEach(([stepId, step]) => {
        if (step.stepOrder > maxStepOrder) {
            maxStepOrder = step.stepOrder
            currentStepId = stepId
        }
    })

    return { currentPhaseId, currentStepId } //you can then use process[currentPhaseId].steps[currentStepId]
}

export const getCurrentAction = (process) => {
    if (_.isEmpty(process)) return null
    const { currentPhaseId, currentStepId } = getCurrentStepPath(process)
    let { actions } = process[currentPhaseId].steps[currentStepId]
    actions.sort((a, b) => (a.actionOrder > b.actionOrder) ? 1 : -1)
    let currentAction = null
    for (const action of actions) { 
        if (!currentAction && action.status === 'pending')
            currentAction = action
    }
    return currentAction
}

const phasesIdsValuesMap = [
    { values: ['Prospect', 'Initialisation'], id: 'init' },
    { values: ['Visite technique préalable', 'Rendez-vous 1'], id: 'rd1' },
    { values: ['Présentation étude', 'Rendez-vous N'], id: 'rdn' },
    { values: ['Visite technique'], id: 'technicalVisitManagement' },
    { values: ['Installation', "En attente d'installation"], id: 'installation' },
    { values: ['Maintenance'], id: 'maintenance' },
]

export const getPhaseIdFormValue = (phaseValue) => {
    const index = phasesIdsValuesMap.findIndex((item) => item.values.includes(phaseValue))
    const currentPhaseId = phasesIdsValuesMap[index].id

    return currentPhaseId
}

export const groupBy = (arr, property) => {
    return arr.reduce((memo, x) => {
        if (!memo[x[property]]) {
            memo[x[property]] = []
        }

        memo[x[property]].push(x)
        return memo
    }, {})
}

export const sortPhases = (process) => {
    const procesTemp = Object.entries(process).sort(([keyA, valueA], [keyB, valueB]) => {
        return (valueA.phaseOrder > valueB.phaseOrder ? 1 : -1)
    })
    process = Object.fromEntries(procesTemp)
    return process
}