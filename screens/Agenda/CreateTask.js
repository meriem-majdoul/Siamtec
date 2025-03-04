import React, { Component } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Keyboard } from 'react-native';
import { Card, Title, FAB } from 'react-native-paper'
import Ionicons from 'react-native-vector-icons/Ionicons'
import firebase from '@react-native-firebase/app'

import moment from 'moment';
import 'moment/locale/fr'
moment.locale('fr')

import OffLineBar from '../../components/OffLineBar'
import Appbar from '../../components/Appbar'
import MyInput from '../../components/TextInput'
import AddressInput from '../../components/AddressInput'
import Picker from "../../components/Picker"
import Loading from "../../components/Loading"

//Task state
import TaskState from "../../components/RequestState"

import * as theme from "../../core/theme";
import { constants, adminId } from "../../core/constants";
import { generatetId, navigateToScreen, load, myAlert, updateField, nameValidator } from "../../core/utils";

import { connect } from 'react-redux'

const db = firebase.firestore()

const types = [
    { label: 'Normale', value: 'Normale' },
    { label: 'Rendez-vous', value: 'Rendez-vous' },
    { label: 'Visite technique', value: 'Visite technique' },
    { label: 'Installation', value: 'Installation' },
    { label: 'Rattrapage', value: 'Rattrapage' },
    { label: 'Panne', value: 'Panne' },
    { label: 'Entretien', value: 'Entretien' },
]

const priorities = [
    { label: 'Urgente', value: 'Urgente' },
    { label: 'Moyenne', value: 'Moyenne' },
    { label: 'Faible', value: 'Faible' },
]

const statuses = [
    { label: 'En attente', value: 'En attente' },
    { label: 'En cours', value: 'En cours' },
    { label: 'Terminé', value: 'Terminé' },
    { label: 'Annulé', value: 'Annulé' },
]

class CreateTask extends Component {
    constructor(props) {
        super(props)
        this.refreshDate = this.refreshDate.bind(this)
        this.refreshAddress = this.refreshAddress.bind(this)
        this.refreshAssignedTo = this.refreshAssignedTo.bind(this)
        this.refreshProject = this.refreshProject.bind(this)

        this.handleSubmit = this.handleSubmit.bind(this)
        this.myAlert = myAlert.bind(this)
        this.alertDeleteTask = this.alertDeleteTask.bind(this)

        this.initialState = {}
        this.isInit = true
        this.currentUser = firebase.auth().currentUser

        this.DateId = this.props.navigation.getParam('DateId', '')
        this.TaskId = this.props.navigation.getParam('TaskId', '')
        this.isEdit = this.DateId ? true : false
        this.TaskId = this.isEdit ? this.TaskId : generatetId('GS-TC-')

        this.title = this.isEdit ? 'Modifier la tâche' : 'Nouvelle tâche'

        this.state = {
            //TEXTINPUTS
            name: { value: "", error: '' },
            description: { value: "", error: '' },

            //PICKERS
            type: 'Rendez-vous',
            priority: 'Moyenne',
            status: 'En cours',

            //Screens
            assignedTo: { id: '', fullName: '', error: '' },
            project: { id: '', name: '', error: '' },
            address: { description: '', place_id: '', error: '' },
            startDate: moment().format(),
            dueDate: moment().add(1, 'h').format(),

            createdAt: '',
            createdBy: { userId: '', userName: '' },
            editedAt: '',
            editedBy: { userId: '', userName: '' },

            error: '',
            loading: false
        }
    }


    async componentDidMount() {
        if (this.isEdit) {
            await this.fetchTask()
        }

        else this.initialState = this.state
    }

    componentWillUnmount() {
        if (this.isEdit)
            this.unsubscribe()
    }

    fetchTask() {
        this.unsubscribe = db.collection('Agenda').doc(this.DateId).collection('Tasks').doc(this.TaskId).onSnapshot((doc) => {
            let { name, assignedTo, description, project, type, priority, status, address, startDate, dueDate } = this.state
            let { createdAt, createdBy, editedAt, editedBy } = this.state
            const task = doc.data()

            if (!task) return

            // //General info
            name.value = task.name
            assignedTo = task.assignedTo
            description.value = task.description
            project = task.project
            priority = task.priority
            status = task.status
            type = task.type
            address = task.address
            startDate = task.startDate
            dueDate = task.dueDate

            //َActivity
            createdAt = task.createdAt
            createdBy = task.createdBy
            editedAt = task.editedAt
            editedBy = task.editedBy

            this.setState({ createdAt, createdBy, editedAt, editedBy })
            this.setState({ name, assignedTo, description, project, type, priority, status, address, startDate, dueDate }, () => {
                if (this.isInit)
                    this.initialState = this.state

                this.isInit = false
            })
        })
    }

    //Screen inputs
    refreshAddress(address) {
        address.error = ''
        this.setState({ address })
    }

    refreshAssignedTo(isPro, id, prenom, nom, role) {
        console.log(isPro, id, prenom, nom, role)
        const assignedTo = { id, fullName: `${prenom} ${nom}`, role, error: '' }
        this.setState({ assignedTo })
    }

    refreshDate(label, date) {
        const formatedDate = moment(date).format()

        if (label === 'start')
            this.setState({ startDate: formatedDate })
        else if (label === 'due')
            this.setState({ dueDate: formatedDate })
    }

    refreshProject(project) {
        console.log(project)
        project.error = ''
        this.setState({ project })
    }

    //Inputs validation
    validateInputs() {
        let { name, assignedTo, project, startDate, dueDate } = this.state

        let nameError = nameValidator(name.value, '"Nom de la tâche"')
        let assignedToError = nameValidator(assignedTo.id, '"Attribué à"')
        let projectError = nameValidator(project.id, '"Projet"')
        //let addressError = nameValidator(address.description, '"Adresse postale"')
        //#inputVerify dueDate > startDate

        if (nameError || assignedToError || projectError) {
            name.error = nameError
            assignedTo.error = assignedToError
            project.error = projectError
            // address.error = addressError

            Keyboard.dismiss()
            this.setState({ name, assignedTo, project, startDate, dueDate, loading: false })
            return false
        }

        return true
    }

    //Submit
    async handleSubmit() {
        let { error, loading } = this.state
        let { name, assignedTo, description, project, type, priority, status, address, startDate, dueDate } = this.state

        if (loading || this.state === this.initialState) return
        load(this, true)

        //1. Validate inputs
        const isValid = this.validateInputs()
        if (!isValid) return

        // 2. ADDING task DOCUMENT
        const currentUser = { userId: this.currentUser.uid, userName: this.currentUser.displayName }

        let task = {
            name: name.value,
            assignedTo: { id: assignedTo.id, fullName: assignedTo.fullName, role: assignedTo.role },
            description: description.value,
            project: { id: project.id, name: project.name },
            type: type,
            priority: priority,
            status: status,
            address: { description: address.description, place_id: address.place_id },
            startDate: startDate,
            dueDate: dueDate,
            editedAt: moment().format(),
            editedBy: currentUser,
            subscribers: [{ id: this.currentUser.uid }] //add others (DC, CMX)
        }

        if (!this.isEdit) {
            task.createdAt = moment().format()
            task.createdBy = currentUser
        }

        console.log('Ready to add task...')

        const batch = db.batch()
        const agendaId = moment(startDate).format('YYYY-MM-DD')
        const agendaRef = db.collection('Agenda').doc(agendaId)
        const tasksRef = agendaRef.collection('Tasks').doc(this.TaskId)

        batch.set(agendaRef, { date: agendaId }, { merge: true })
        batch.set(tasksRef, task, { merge: true })
        batch.commit()

        if (this.isEdit)
            this.props.navigation.state.params.onGoBack(false) //Don't refresh tasks in agenda

        this.props.navigation.goBack()

        // await agendaRef.set({ date: agendaId }, { merge: true })
        // await agendaRef.collection('Tasks').doc(this.TaskId).set(task, { merge: true })
        // if (this.isEdit)
        //     this.props.navigation.state.params.onGoBack(false) //Don't refresh tasks in agenda
        // this.props.navigation.goBack()
    }


    alertDeleteTask() {
        const title = "Supprimer la tâche"
        const message = 'Êtes-vous sûr de vouloir supprimer cette tâche ?'
        const handleConfirm = () => this.handleDelete()
        this.myAlert(title, message, handleConfirm)
    }

    //#OOS
    handleDelete() {
        this.title = 'Suppression de la tâche...'
        load(this, true)
        db.collection('Agenda').doc(this.DateId).collection('Tasks').doc(this.TaskId).delete()
        load(this, false)
        this.props.navigation.state.params.onGoBack(true) //Refresh manually tasks in agenda because onSnapshot doesn't listen to delete operations.
        this.props.navigation.goBack()
    }

    render() {
        let { name, description, assignedTo, project, startDate, startHour, dueDate, dueHour, type, priority, status, address } = this.state
        let { createdAt, createdBy, editedAt, editedBy, loading } = this.state
        let { canUpdate, canDelete } = this.props.permissions.tasks
        canUpdate = (canUpdate || !this.isEdit)
        const { isConnected } = this.props.network

        return (
            <View style={styles.container}>
                <Appbar back={!loading} close title titleText={this.title} check={this.isEdit ? canUpdate && !loading : !loading} handleSubmit={this.handleSubmit} del={canDelete && this.isEdit && !loading} handleDelete={this.alertDeleteTask} />

                {loading ?
                    <Loading size='large' />
                    :
                    <ScrollView style={styles.container} contentContainerStyle={{ backgroundColor: '#fff', padding: constants.ScreenWidth * 0.02 }}>

                        <Card style={{ marginBottom: 20 }}>
                            <Card.Content>
                                <Title>Informations générales</Title>
                                <MyInput
                                    label="Numéro de la tâche"
                                    returnKeyType="done"
                                    value={this.TaskId}
                                    editable={false}
                                    style={{ marginBottom: 15 }}
                                    disabled
                                />

                                <MyInput
                                    label="Nom de la tâche"
                                    returnKeyType="done"
                                    value={name.value}
                                    onChangeText={text => updateField(this, name, text)}
                                    error={!!name.error}
                                    errorText={name.error}
                                    editable={canUpdate}
                                />

                                <TouchableOpacity onPress={() => navigateToScreen(this, canUpdate, 'ListEmployees', { onGoBack: this.refreshAssignedTo, prevScreen: 'CreateTask', titleText: 'Utilisateurs' })}>
                                    <MyInput
                                        label="Attribuée à"
                                        value={assignedTo.fullName}
                                        error={!!assignedTo.error}
                                        errorText={assignedTo.error}
                                        editable={false} />
                                </TouchableOpacity>

                                <MyInput
                                    label="Description"
                                    returnKeyType="done"
                                    value={description.value}
                                    onChangeText={text => updateField(this, description, text)}
                                    error={!!description.error}
                                    errorText={description.error}
                                    editable={canUpdate}
                                />

                                <TouchableOpacity onPress={() => navigateToScreen(this, canUpdate, 'ListProjects', { onGoBack: this.refreshProject, prevScreen: 'CreateTask', isRoot: false, title: 'Choix du projet', showFAB: false })}>
                                    <MyInput
                                        label="Choisir un projet"
                                        value={project.name}
                                        error={!!project.error}
                                        errorText={project.error}
                                        editable={false} />
                                </TouchableOpacity>

                                <Picker
                                    label="Type"
                                    returnKeyType="next"
                                    value={type}
                                    error={!!type.error}
                                    errorText={type.error}
                                    selectedValue={type}
                                    onValueChange={(type) => this.setState({ type })}
                                    title="Type"
                                    elements={types}
                                    enabled={canUpdate}
                                />

                                <Picker
                                    label="État"
                                    returnKeyType="next"
                                    value={status}
                                    error={!!status.error}
                                    errorText={status.error}
                                    selectedValue={status}
                                    onValueChange={(status) => this.setState({ status })}
                                    title="État"
                                    elements={statuses}
                                    enabled={canUpdate}
                                />

                                <Picker
                                    label="Priorité"
                                    returnKeyType="next"
                                    value={priority}
                                    error={!!priority.error}
                                    errorText={priority.error}
                                    selectedValue={priority}
                                    onValueChange={(priority) => this.setState({ priority })}
                                    title="Priorité"
                                    elements={priorities}
                                    enabled={canUpdate}
                                />

                                <AddressInput
                                    label='Adresse postale'
                                    offLine={!isConnected}
                                    onPress={() => this.props.navigation.navigate('Address', { onGoBack: this.refreshAddress })}
                                    address={address}
                                    addressError={address.error}
                                    editable={canUpdate} />

                                <TouchableOpacity onPress={() => navigateToScreen(this, canUpdate, 'DatePicker', { onGoBack: this.refreshDate, label: 'de début' })}>
                                    <MyInput
                                        label="Date de début"
                                        value={moment(startDate).format('lll')}
                                        editable={false}
                                    />
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => navigateToScreen(this, canUpdate, 'DatePicker', { onGoBack: this.refreshDate, label: "d'échéance" })}>
                                    <MyInput
                                        label="Date d'échéance"
                                        value={moment(dueDate).format('lll')}
                                        editable={false}
                                    />
                                </TouchableOpacity>

                            </Card.Content>
                        </Card>

                        {this.isEdit &&
                            <Card>
                                <Card.Content>
                                    <Title>Activité</Title>
                                    <MyInput
                                        label="Date de création"
                                        returnKeyType="done"
                                        value={createdAt}
                                        editable={false}
                                    />
                                    <MyInput
                                        label="Auteur"
                                        returnKeyType="done"
                                        value={createdBy.userName}
                                        editable={false}
                                    />
                                    <MyInput
                                        label="Dernière mise à jour"
                                        returnKeyType="done"
                                        value={editedAt}
                                        editable={false}
                                    />
                                    <MyInput
                                        label="Dernier intervenant"
                                        returnKeyType="done"
                                        value={editedBy.userName}
                                        editable={false}
                                    />
                                </Card.Content>
                            </Card>
                        }
                    </ScrollView>
                }
            </View>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        role: state.roles.role,
        permissions: state.permissions,
        network: state.network,
        //fcmToken: state.fcmtoken
    }
}

export default connect(mapStateToProps)(CreateTask)

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background
    },
    fab: {
        //flex: 1,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'flex-end',
        marginBottom: 10,
        width: 50,
        height: 50,
        borderRadius: 100,
    }
})