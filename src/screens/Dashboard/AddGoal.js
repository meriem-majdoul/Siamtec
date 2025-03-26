import React, { Component } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Keyboard, TextInput, ActivityIndicator } from 'react-native';
import MonthPicker from 'react-native-month-year-picker'
import { faCalendarPlus, faInfoCircle, faFileAlt } from 'react-native-vector-icons/FontAwesome5'
import _ from 'lodash'
import { connect } from 'react-redux'

import moment from 'moment';
import 'moment/locale/fr'
moment.locale('fr')

import { Appbar, FormSection, ItemPicker, Loading, Toast, TurnoverGoal } from '../../components'
import MyInput from '../../components/TextInput'

import firebase, { db, auth } from '../../firebase'
import * as theme from "../../core/theme";
import { constants } from "../../core/constants";
import { generateId, navigateToScreen, myAlert, updateField, nameValidator, setToast, load, pickImage, isEditOffline, refreshClient, positiveNumberValidator, formatDocument, unformatDocument } from "../../core/utils";
import { notAvailableOffline, handleFirestoreError } from '../../core/exceptions';
import { fetchDocument } from "../../api/firestore-api";
import ActivitySection from '../../containers/ActivitySection';

const properties = ["target", "description", "createdAt", "createdBy", "editedAt", "editedBy"]

class AddGoal extends Component {
    constructor(props) {
        super(props)
        this.handleSubmit = this.handleSubmit.bind(this)
        this.handleDeleteGoal = this.handleDeleteGoal.bind(this)
        this.myAlert = myAlert.bind(this)
        this.showAlert = this.showAlert.bind(this)

        this.initialState = {}
        this.userId = this.props.navigation.getParam('userId', auth.currentUser.uid)
        this.GoalId = this.props.navigation.getParam('GoalId', '')
        this.currentTurnover = this.props.navigation.getParam('currentTurnover', 0)
        this.incomeSources = this.props.navigation.getParam('incomeSources', [])
        this.isEdit = this.GoalId ? true : false
        this.GoalId = this.isEdit ? this.GoalId : moment().format('YYYY')
        this.monthYear = this.props.navigation.getParam('monthYear', '')
        this.title = this.isEdit ? "Modifier l'objectif" : "Nouvel objectif"

        this.state = {
            //ID
            GoalId: this.GoalId,
            //TEXTINPUTS
            target: 0,
            targetError: '',
            current: this.currentTurnover,
            description: '',

            //Pickers
            monthYear: new Date(),

            //logs (Auto-Gen)
            createdAt: '',
            createdBy: { id: '', fullName: '' },
            editedAt: '',
            editedBy: { id: '', fullName: '' },

            showMonthPicker: false,
            error: '',
            loading: true,
            docNotFound: false,
        }
    }



    //##GET
    async componentDidMount() {
        if (this.isEdit) await this.initEditMode()
        this.initialState = _.cloneDeep(this.state)
        load(this, false)
    }

    async initEditMode() {
        const goals = await fetchDocument('Users', this.userId, 'Turnover', this.GoalId)
        let goal = goals[this.monthYear]
        goal = this.setGoal(goal)
        if (!goal) return
    }

    setGoal(goal) {
        if (!goal)
            this.setState({ docNotFound: true })
        else {
            goal = formatDocument(goal, properties, [])
            goal.monthYear = moment(this.monthYear, 'MM-YYYY').toDate()
            this.setState(goal)
        }
        return goal
    }

    //##VALIDATE
    validateInputs() {
        const { target } = this.state
        const targetError = positiveNumberValidator(target, `"Chiffre d'affaire cible"`)
        if (targetError) {
            Keyboard.dismiss()
            this.setState({ targetError, loading: false })
            setToast(this, 'e', 'Erreur de saisie, veuillez verifier les champs.')
            return false
        }
        return true
    }

    //##POST
    async handleSubmit() {
        const { isConnected } = this.props.network
        let isEditOffLine = isEditOffline(this.isEdit, isConnected)
        if (isEditOffLine) return

        let { loading } = this.state
        if (loading || _.isEqual(this.state, this.initialState)) return
        load(this, true)

        const isValid = this.validateInputs(isConnected)
        if (!isValid) return

        const { monthYear, GoalId } = this.state
        const formatedMonthYear = moment(monthYear).format('MM-YYYY')
        const props = ["target", "description"]
        let monthlyGoal = unformatDocument(this.state, props, this.props.currentUser, this.isEdit)
        monthlyGoal.monthYear = formatedMonthYear
        monthlyGoal.lastMonthEdited = formatedMonthYear
        let payload = {}
        payload[formatedMonthYear] = monthlyGoal

        db.collection('Users').doc(this.userId).collection('Turnover').doc(GoalId).set(payload, { merge: true })
        this.props.navigation.state.params.onGoBack()
        this.props.navigation.goBack()
    }

    //##DELETE
    showAlert() {
        const title = "Supprimer l'ojectif"
        const message = 'Êtes-vous sûr de vouloir supprimer cet objectif ?'
        const handleConfirm = () => this.handleDeleteGoal()
        this.myAlert(title, message, handleConfirm)
    }

    handleDeleteGoal() {
        load(this, true)
        var update = {}
        update[`${this.monthYear}.target`] = null
        db.collection('Users').doc(this.userId).collection('Turnover').doc(this.state.GoalId).update(update)
        setTimeout(() => {
            load(this, false)
            this.props.navigation.state.params.onGoBack()
            this.props.navigation.goBack(), 1000
        })
    }

    //##RENDERERS
    goalOverview() {
        const { GoalId, target, current, monthYear } = this.initialState
        const monthTemp = moment(monthYear).format('MMMM')
        const month = monthTemp.charAt(0).toUpperCase() + monthTemp.slice(1)

        const goal = {
            id: GoalId,
            month,
            year: GoalId,
            target,
            current
        }

        return (
            <View style={{ marginTop: 10 }}>
                <TurnoverGoal
                    goal={goal}
                    index={0}
                    onPress={() => console.log('No action...')}
                    isList={false}
                    style={{ width: undefined }}
                />
            </View>
        )
    }

    renderIncomeSources() {

        const onPressProjectId = (ProjectId) => this.props.navigation.navigate('CreateProject', { ProjectId })
        const textStyle = theme.customFontMSregular.body

        return (
            <FormSection
                sectionTitle='Historique des sources'
                sectionIcon={faFileAlt}
                form={
                    <View style={styles.incSourcesContainer}>
                        <View style={styles.incSourcesHeader}>
                            <Text style={[textStyle]}>Projet</Text>
                            <Text style={[textStyle]}>Revenu</Text>
                        </View>

                        {this.incomeSources.map((source, index) => {
                            return (
                                <TouchableOpacity
                                    key={index.toString()}
                                    onPress={() => onPressProjectId(source.projectId)}
                                    style={styles.incSourcesRow}
                                >
                                    <Text style={[textStyle, { color: theme.colors.primary }]}>{source.projectId}</Text>
                                    <Text style={[textStyle]}>€ {source.amount}</Text>
                                </TouchableOpacity>
                            )
                        })}
                    </ View>
                }
            />
        )
    }

    render() {
        let { monthYear, target, description } = this.state
        let { createdAt, createdBy, editedAt, editedBy } = this.state
        let { showMonthPicker, targetError, loading, docNotFound, toastMessage, toastType } = this.state

        //Privilleges
        let { canCreate, canUpdate, canDelete } = this.props.permissions.users
        const canWrite = (canUpdate && this.isEdit || canCreate && !this.isEdit)

        const { isConnected } = this.props.network

        if (docNotFound)
            return (
                <View style={styles.mainContainer}>
                    <Appbar close title titleText={this.title} />
                    <EmptyList
                        icon={faTimes}
                        header='Objectif introuvable'
                        description="L'objectif est introuvable dans la base de données. Il se peut qu'il ait été supprimé."
                        offLine={!isConnected}
                    />
                </View>
            )

        else return (
            <View style={styles.mainContainer}>
                <Appbar close title titleText={this.title} check={this.isEdit ? canWrite && !loading : !loading} handleSubmit={this.handleSubmit} del={canDelete && this.isEdit && !loading} handleDelete={this.showAlert} loading={loading} />

                {loading ?
                    <Loading />
                    :
                    <ScrollView keyboardShouldPersistTaps="never" style={styles.dataContainer}>
                        {this.isEdit && this.goalOverview()}
                        <FormSection
                            sectionTitle='Détails'
                            sectionIcon={faInfoCircle}
                            iconColor={theme.colors.gray_dark}
                            form={
                                <View style={{ flex: 1 }}>

                                    <ItemPicker
                                        onPress={() => this.setState({ showMonthPicker: !showMonthPicker })}
                                        label={'Mois *'}
                                        value={moment(monthYear).format('MMMM YYYY').charAt(0).toUpperCase() + moment(monthYear).format('MMMM YYYY').slice(1)}
                                        editable={canWrite && !this.isEdit}
                                        showAvatarText={false}
                                        icon={faCalendarPlus}
                                    />

                                    <MyInput
                                        label="Chiffre d'affaire cible (€) *"
                                        returnKeyType="done"
                                        keyboardType='numeric'
                                        value={target}
                                        onChangeText={target => this.setState({ target, targetError: '' })}
                                        error={!!targetError}
                                        errorText={targetError}
                                    />

                                    <MyInput
                                        label="Description"
                                        returnKeyType="done"
                                        value={description}
                                        onChangeText={description => this.setState({ description })}
                                        multiline={true}
                                        editable={canWrite}
                                    />

                                </View>
                            }
                        />

                        <View style={{ paddingTop: 100 }}>
                            {showMonthPicker && (
                                <MonthPicker
                                    onChange={(event, newDate) => {
                                        const selectedDate = newDate || monthYear
                                        const GoalId = moment(selectedDate).format('YYYY')
                                        this.setState({ monthYear: selectedDate, GoalId, showMonthPicker: false })
                                    }}
                                    value={monthYear}
                                    //minimumDate={new Date()}
                                    maximumDate={new Date(2030, 5)}
                                    locale="fr"
                                    cancelButton="Annuler"
                                    okButton="Valider"

                                />
                            )}
                        </View>

                        {this.isEdit && this.incomeSources.length > 0 &&
                            this.renderIncomeSources()
                        }

                        {this.isEdit &&
                            <ActivitySection
                                createdBy={createdBy}
                                createdAt={createdAt}
                                editedBy={editedBy}
                                editedAt={editedAt}
                                navigation={this.props.navigation}
                            />
                        }
                    </ScrollView>
                }

                <Toast
                    containerStyle={{ bottom: constants.ScreenWidth * 0.6 }}
                    message={toastMessage}
                    type={toastType}
                    onDismiss={() => this.setState({ toastMessage: '' })} />

            </View >
        )
    }
}

const mapStateToProps = (state) => {
    return {
        role: state.roles.role,
        permissions: state.permissions,
        network: state.network,
        currentUser: state.currentUser
        //fcmToken: state.fcmtoken
    }
}

export default connect(mapStateToProps)(AddGoal)

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: theme.colors.background
    },
    dataContainer: {
        flex: 1,
    },
    incSourcesContainer: {
        flex: 1,
        backgroundColor: theme.colors.white,
        borderRadius: 8,
        marginTop: 12,
        ...theme.style.shadow
    },
    incSourcesHeader: {
        flexDirection: 'row',
        padding: theme.padding,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        justifyContent: 'space-between',
        backgroundColor: '#EAF7F1'
    },
    incSourcesRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: theme.padding,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: theme.colors.gray_light,
    }
})

