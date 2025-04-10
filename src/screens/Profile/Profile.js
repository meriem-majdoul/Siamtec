import React, { Component } from 'react'
import { StyleSheet, ScrollView, TouchableOpacity, View, Text, Keyboard, FlatList, Alert, RefreshControl } from 'react-native'
import { TextInput } from 'react-native-paper'
import TextInputMask from 'react-native-text-input-mask'
import NetInfo from "@react-native-community/netinfo"
import _ from 'lodash'
import { faUser, faUserSlash } from 'react-native-vector-icons/FontAwesome5'
import { faPlusCircle } from 'react-native-vector-icons/FontAwesome5'
import { faBullseyeArrow, faCheck, faConstruction, faInfo, faLock, faMoneyBill, faRedo, faTimes } from 'react-native-vector-icons/FontAwesome5'
import { connect } from 'react-redux'

import moment from 'moment';
import 'moment/locale/fr'
moment.locale('fr')

import TurnoverGoalsContainer from '../../containers/TurnoverGoalsContainer'
import ClientBillingSection from './containers/ClientBillingSection'
import Appbar from '../../components/Appbar'
import CustomIcon from '../../components/CustomIcon'
import FormSection from '../../components/FormSection'
import MyInput from '../../components/TextInput'
import AddressInput from '../../components/AddressInput'
import Button from "../../components/Button"
import ProjectItem2 from "../../components/ProjectItem2"
import ClientPaymentItem from "../../components/ClientPaymentItem"
import TurnoverGoal from "../../components/TurnoverGoal"
import Toast from "../../components/Toast"
import Loading from "../../components/Loading"
import LoadDialog from "../../components/LoadDialog"
import EmptyList from "../../components/EmptyList"

import firebase, { db, auth } from '../../firebase'
import * as theme from "../../core/theme"
import { constants, highRoles, isTablet, lowRoles, staffRoles } from '../../core/constants'
import { fetchDocs, fetchTurnoverData, fetchDocument, fetchDocuments } from '../../api/firestore-api'
import { sortMonths, navigateToScreen, nameValidator, emailValidator, passwordValidator, updateField, load, setToast, formatRow, generateId, refreshAddress, setAddress, displayError, countDown } from "../../core/utils"
import { handleReauthenticateError, handleUpdatePasswordError } from '../../core/exceptions'
import { analyticsQueriesBasedOnRole, initTurnoverObjects, setTurnoverArr, setMonthlyGoals } from '../Dashboard/helpers'
import { setCurrentUser } from '../../core/redux'
import { SquarePlus } from '../../components'

class Profile extends Component {

    constructor(props) {
        super(props)
        this.fetchProfile = this.fetchProfile.bind(this)
        this.fetchClientProjects = this.fetchClientProjects.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
        this.changePassword = this.changePassword.bind(this)
        this.passwordValidation = this.passwordValidation.bind(this)
        this.refreshToast = this.refreshToast.bind(this)
        // this.fetchDocs = fetchDocs.bind(this)
        this.refreshMonthlyGoals = this.refreshMonthlyGoals.bind(this)
        this.refreshAddress = refreshAddress.bind(this)
        this.setAddress = setAddress.bind(this)
        this.isRoot = this.props.route?.params?.isRoot ?? false;
        //role
        this.roleId = this.props.role.id;
        this.userParam = this.props.route?.params?.user || { id: firebase.auth().currentUser.uid, roleId: this.roleId }; //default: current user
        this.isProfileOwner = this.userParam.id === firebase.auth().currentUser.uid;
        this.isClient = this.userParam.roleId === 'client';
        this.isCurrentUserStaff = staffRoles.includes(this.props.role.id);

        this.isEdit = this.props.route?.params?.isEdit || this.isProfileOwner;
        this.dataCollection = this.isClient ? 'Clients' : 'Users';
        this.isProcess = this.props.route?.params?.isProcess || false;
        this.project = this.props.route?.params?.project || null;
        this.initialState = {};

        if (this.userParam.roleId === 'com') {
            this.queries = analyticsQueriesBasedOnRole('com', this.userParam.id)
        }
        this.state = {
            id: this.userParam.id, //Not editable
            isPro: false,
            denom: { value: "", error: "" },
            siret: { value: "", error: "" },
            nom: { value: '', error: '' },
            prenom: { value: '', error: '' },
            isProspect: false,
            role: '',
            email: { value: '', error: '' },
            email2: { value: '', error: '' },
            phone: { value: '', error: '' },
            phone2: { value: '', error: '' },
            address: { description: '', place_id: '', marker: { latitude: '', longitude: '' } },
            addressError: '',

            currentPass: { value: '', error: '', show: false },
            newPass: { value: '', error: '', show: false },

            loadingClientProjects: true,
            loadingClientPayments: false,
            clientProjectsList: [],
            monthlyGoals: [],

            //Show/hide info
            sectionsExpansion: {
                info: true,
                pw: true,
                turnoverGoals: true,
                projects: true,
                billing: false,
            },
            viewMore: false,

            refreshing: false,
            loading: true,
            loadingDialog: false,
            loadingSignOut: false,
            error: '',
            toastMessage: '', //password change
            toastType: '',
            userNotFound: false,
            deleted: false
        }
    }
    //##task: add Billing tab

    componentWillUnmount() {
        if (this.willFocusSubscription)
            this.willFocusSubscription.remove()
    }

    //##GET
    async componentDidMount() {
        try {
            await this.fetchProfile()

            if (this.isClient) {
                this.fetchClientProjects()
                this.willFocusSubscription = this.props.navigation.addListener('willFocus', () => this.fetchClientProjects())
            }

            // if (this.isCurrentUserBackOffice) {
            //this.fetchClientPayments()
            // }

            // DC can view/add Coms goals
            if (this.userParam.roleId === 'com') {
                const initialTurnoverObjects = initTurnoverObjects()
                const turnoverObjects = await fetchTurnoverData(this.queries.turnover, initialTurnoverObjects, this.userParam.id)
                let turnoverArr = setTurnoverArr(turnoverObjects)
                turnoverArr = sortMonths(turnoverArr)
                const monthlyGoals = setMonthlyGoals(turnoverArr)
                this.setState({ monthlyGoals })
            }
            this.initialState = _.cloneDeep(this.state)
            load(this, false)
        }
        catch (e) {
            const { message } = e
            displayError({ message })
        }
    }

    async fetchProfile(count) {
        this.setState({ refreshing: true })
        if (count) {
            await countDown(count)
        }
        let user = await fetchDocument(this.dataCollection, this.userParam.id)
        console.log("user", user)
        user = this.setUser(user)
        this.setState({ refreshing: false })
        if (!user) return
    }

    async setUser(user) {
        if (!user)
            this.setState({ docNotFound: true })
        else {
            user = this.formatUser(user)
            this.setState(user)
        }
        return user
    }

    formatUser(user) {
        if (this.isClient)
            var isProspect = user.isProspect

        const email = { value: user.email, error: '' }
        const email2 = { value: user.email2 || "", error: '' }
        const phone = { value: user.phone, error: '' }
        const phone2 = { value: user.phone2, error: '' }
        const { role, address, isPro, deleted } = user
        const formatedUser = { isPro, role, email, email2, phone, phone2, address, isProspect, deleted }

        if (user.isPro) {
            var denom = { value: user.denom, error: "" }
            var siret = { value: user.siret, error: "" }
            formatedUser.denom = denom
            formatedUser.siret = siret
        }
        else {
            var nom = { value: user.nom, error: '' }
            var prenom = { value: user.prenom, error: '' }
            formatedUser.nom = nom
            formatedUser.prenom = prenom
        }
        return formatedUser
    }

    async fetchClientProjects() {
        this.setState({ loadingClientProjects: true })

        const query = db
            .collection('Projects')
            .where('client.id', '==', this.userParam.id)
            .where('deleted', '==', false)
            .orderBy('createdAt', 'DESC')


        let clientProjectsList = await fetchDocuments(query)
        if (this.isCurrentUserStaff) {
            clientProjectsList = [...[{ id: "addNewProject" }], ...clientProjectsList]
        }

        this.setState({
            clientProjectsList,
            clientProjectsCount: clientProjectsList.length,
            loadingClientProjects: false
        })
    }

    async fetchClientPayments() {
        this.setState({ loadingClientPayments: true })

        const query = db
            .collection('Clients')
            .doc(this.userParam.id)
            .collection("Payments")
            .orderBy('createdAt', 'DESC')

        const clientPayments = await fetchDocuments(query)

        this.setState({
            clientPayments,
            clientPayments: clientPayments.length,
            loadingClientPayments: false
        })

    }

    //##VALIDATE
    validateInputs() {
        let denomError = ''
        let nomError = ''
        let prenomError = ''

        const { isPro, denom, nom, prenom, phone, phone2, email, email2, address, isProspect } = this.state

        if (isPro)
            denomError = nameValidator(denom.value, '"Dénomination sociale"')

        else {
            nomError = nameValidator(nom.value, '"Nom"')
            prenomError = nameValidator(prenom.value, '"Prénom"')
        }

        const phoneError = nameValidator(phone.value, '"Téléphone"')
        const phoneError2 = phone2 && phone2.value !== "" ? nameValidator(phone.value, '"Téléphone 2"') : ""
        const addressError = nameValidator(address.description, '"Adresse"')
        const emailError = isProspect ? '' : emailValidator(email.value)
        const emailError2 = email2 && email2.value !== "" ? emailValidator(email2.value) : ""

        if (denomError || nomError || prenomError || phoneError || phoneError2 || emailError || emailError2 || addressError) {

            phone.error = phoneError
            phone2.error = phoneError2
            email.error = emailError
            email2.error = emailError2

            if (isPro) {
                denom.error = denomError
                this.setState({ denom })
            }

            else {
                nom.error = nomError
                prenom.error = prenomError
                this.setState({ nom, prenom })
            }

            this.setState({ phone, phone2, email, email2, addressError, loading: false })
            setToast(this, 'e', 'Erreur de saisie, veuillez verifier les champs.')
            return false
        }

        return true
    }

    //##POST
    handleSubmit() {

        Keyboard.dismiss()
        if (this.state.loading || _.isEqual(this.state, this.initialState)) return
        load(this, true)

        //Validation
        const isValid = this.validateInputs()
        if (!isValid) return { error: 'Veuillez vérifier les champs' }

        //Format data
        let userData = []
        let { isPro, nom, prenom, denom, phone, phone2, address, email, email2 } = this.state
        const { isConnected } = this.props.network
        const fullName = isPro ? denom.value : `${prenom.value} ${nom.value}`

        let user = {
            fullName,
            phone: phone.value,
            address,
        }

        if (isPro) {
            user.denom = denom.value
            user.siret = siret.value
        }
        else {
            user.nom = nom.value
            user.prenom = prenom.value
        }
        if (this.isClient) {
            user.email = email.value
            user.email2 = email2.value
            user.phone2 = phone2.value
        }

        //Persist data
        db.collection(this.dataCollection).doc(this.userParam.id).set(user, { merge: true })
        const nomChanged = nom.value !== this.initialState.nom.value
        const prenomChanged = prenom.value !== this.initialState.prenom.value
        const denomChanged = denom.value !== this.initialState.denom.value

        //A cloud function updating firebase auth displayName is triggered -> give it some time to finish...
        if (nomChanged || prenomChanged || denomChanged) {
            //Update redux state
            let { currentUser } = this.props
            currentUser.fullName = fullName
            setCurrentUser(this, currentUser)
            setTimeout(() => {
                firebase.auth().currentUser.reload()
            }, 5000)
        }

        load(this, false)
        this.setState({ toastType: 'success', toastMessage: 'Modifications efféctuées !' })
    }

    //##PASSWORD CHANGE
    passwordValidation() {
        const { currentPass, newPass } = this.state
        const currentPassError = passwordValidator(currentPass.value)
        const newPassError = passwordValidator(newPass.value)

        if (currentPassError || newPassError) {
            currentPass.error = currentPassError
            newPass.error = newPassError

            this.setState({ currentPass, newPass, loading: false, toastType: 'error', toastMessage: 'Veuillez renseigner les champs mots de passe.' })
            return false
        }

        else return true
    }

    async changePassword() {
        try {
            load(this, true)

            //Validate passwords (old pass & new pass)
            const isPasswordValid = this.passwordValidation()
            if (!isPasswordValid) return

            let { currentPass, newPass, email } = this.state
            const { currentUser } = firebase.auth()
            const emailCred = firebase.auth.EmailAuthProvider.credential(currentUser.email, currentPass.value)

            //Re-authenticate user (for security)
            await currentUser.reauthenticateWithCredential(emailCred)
                .catch(e => { throw new Error(handleReauthenticateError(e)) })

            //Update password
            await currentUser.updatePassword(newPass.value)
                .catch(e => { throw new Error(handleUpdatePasswordError(e)) })

            setToast(this, 's', 'Mot de passe modifié avec succès')
        }

        catch (e) {
            const { message } = e
            displayError({ message })
        }

        finally {
            const init = { value: '', error: '' }
            this.setState({ currentPass: init, newPass: init, loading: false })
        }
    }

    refreshToast(toastType, toastMessage) {
        this.setState({ toastType, toastMessage })
    }

    //##SIGNOUT
    handleSignout() {
        this.setState({ loadingSignOut: true })
        firebase.auth().signOut()
    }

    //##RENDERERS
    renderAvatar() {
        const { deleted } = this.state
        const icon = deleted ? faUserSlash : faUser
        const iconColor = deleted ? theme.colors.error : theme.colors.primary

        return (
            <View style={styles.avatar} >
                <CustomIcon icon={icon} color={iconColor} size={isTablet ? 35 : 30} />
                {deleted && <Text style={[theme.customFontMSregular.extraSmall, { position: 'absolute', bottom: 15, color: theme.colors.gray_dark, textAlign: 'center' }]}>Utilisateur supprimé</Text>}
            </View>
        )
    }

    renderMetadata(canUpdate, isConnected) {
        const { isPro, nom, prenom, denom, siret } = this.state

        return (
            <View style={styles.metadataContainer} >
                {isPro ?
                    < MyInput
                        label="Dénomination sociale"
                        returnKeyType="done"
                        value={denom.value}
                        onChangeText={text => updateField(this, denom, text)}
                        error={!!denom.error}
                        errorText={denom.error}
                        editable={this.isEdit && (isConnected && canUpdate || this.isProcess)}
                    />
                    :
                    <MyInput
                        label="Prénom"
                        returnKeyType="done"
                        value={prenom.value}
                        onChangeText={text => updateField(this, prenom, text)}
                        error={!!prenom.error}
                        errorText={prenom.error}
                        editable={this.isEdit && (isConnected && canUpdate || this.isProcess)}
                        disabled={!isConnected}
                    />
                }

                {isPro ?
                    < MyInput
                        label="Siret"
                        returnKeyType="done"
                        value={siret.value}
                        onChangeText={text => updateField(this, siret, text)}
                        error={!!siret.error}
                        errorText={siret.error}
                        editable={this.isEdit && (isConnected && canUpdate || this.isProcess)}
                    />
                    :
                    < MyInput
                        label="Nom"
                        returnKeyType="done"
                        value={nom.value}
                        onChangeText={text => updateField(this, nom, text)}
                        error={!!nom.error}
                        errorText={nom.error}
                        editable={this.isEdit && (isConnected && canUpdate || this.isProcess)}
                        disabled={!isConnected}
                    />
                }

            </View>

        )
    }

    addProjectComponent() {

        const { address, isPro, denom, prenom, nom, email, phone } = this.state
        const client = {
            id: this.userParam.id,
            fullName: isPro ? denom.value : `${prenom.value} ${nom.value}`,
            email: email.value,
            role: 'Client',
            phone: phone.value
        }

        return (
            <View>
                <SquarePlus onPress={() => this.props.navigation.navigate('CreateProject', { client, address, onGoBack: () => this.fetchProfile(1000) })} />
                <Text style={[theme.customFontMSregular.caption, { textAlign: "center", marginTop: theme.padding / 2, color: theme.colors.gray_dark }]}>
                    Nouveau projet
                </Text>
            </View>
        )
    }

    renderProject(project, index) {

        if (project.empty)
            return <View style={styles.invisibleItem} />

        else {
            if (index === 0 && this.isCurrentUserStaff) {
                return this.addProjectComponent()
            }

            else return (
                <ProjectItem2
                    project={project}
                    onPress={() => this.onPressProject(project.id)}
                />
            )
        }
    }

    onPressProject(ProjectId) {
        this.props.navigation.navigate('Process', { ProjectId, onGoBack: () => this.fetchProfile(1000) })
    }

    renderClientProjects(currentUser) {
        const mes = this.isProfileOwner ? 'Mes ' : ''
        const { loadingClientProjects, clientProjectsList, sectionsExpansion } = this.state

        return (
            <View style={{ flex: 1 }}>
                <FormSection
                    sectionTitle={`${mes}Projets`}
                    sectionRightComponent={
                        () => {
                            return (
                                <View style={{ flexDirection: 'row' }}>
                                    <CustomIcon
                                        icon={faRedo}
                                        size={24}
                                        color={theme.colors.white}
                                        onPress={this.fetchClientProjects}
                                    />
                                </View>
                            )
                        }
                    }
                    formContainerStyle={{ paddingTop: theme.padding * 1.5 }}
                    containerStyle={{ width: constants.ScreenWidth, alignSelf: 'center', marginBottom: 15 }}
                    isExpanded={sectionsExpansion["project"]}
                    onPressSection={() => this.toggleSection("projects")}
                    form={
                        loadingClientProjects ?
                            <Loading style={{ marginTop: 33 }} />
                            :
                            <FlatList
                                data={formatRow(true, clientProjectsList, 3)}
                                keyExtractor={item => item.id.toString()}
                                renderItem={({ item, index }) => this.renderProject(item, index)}
                                style={{ zIndex: 1 }}
                                numColumns={3}
                                columnWrapperStyle={{ justifyContent: 'space-between' }}
                            />
                    }
                />

            </View>
        )
    }

    //FACTURATION


    onPressNewGoal() {
        this.props.navigation.navigate('AddGoal', { userId: this.userParam.id, onGoBack: this.refreshMonthlyGoals })
    }

    onPressGoal(goal, index) {
        const navParams = {
            userId: this.userParam.id,
            GoalId: goal.id,
            currentTurnover: goal.current,
            incomeSources: goal.sources,
            monthYear: goal.monthYear,
            onGoBack: this.refreshMonthlyGoals
        }
        this.props.navigation.navigate('AddGoal', navParams)
    }

    async refreshMonthlyGoals() {
        try {
            const initialTurnoverObjects = initTurnoverObjects()
            let turnoverObjects = await fetchTurnoverData(this.queries.turnover, initialTurnoverObjects, this.userParam.id)
            const turnoverArr = setTurnoverArr(turnoverObjects)
            const monthlyGoals = setMonthlyGoals(turnoverArr)
            this.setState({ monthlyGoals })
        }
        catch (e) {
            const { message } = e
            displayError({ message })
        }
    }


    toggleSection(sectionId) {
        let { sectionsExpansion, viewMore } = this.state
        sectionsExpansion[sectionId] = !sectionsExpansion[sectionId]
        if (sectionId === "info")
            viewMore = false
        this.setState({ sectionsExpansion, viewMore })
    }

    renderCommercialGoals(monthlyGoals) {
        const { role } = this.props
        const { sectionsExpansion } = this.state
        const isCom = role.id === "com"
        const showSection = this.userParam.roleId === 'com' && role.isHighRole && !this.isProfileOwner
        if (!showSection) return null

        return (
            <View>
                <FormSection
                    sectionTitle='Objectifs'
                    sectionIcon={faBullseyeArrow}
                    isExpanded={sectionsExpansion["turnoverGoals"]}
                    onPressSection={() => this.toggleSection("turnoverGoals")}
                    form={
                        <TurnoverGoalsContainer
                            monthlyGoals={monthlyGoals}
                            onPressNewGoal={this.onPressNewGoal.bind(this)}
                            onPressGoal={this.onPressGoal.bind(this)}
                            navigation={this.props.navigation}
                            isCom={isCom}
                        />
                    }
                    containerStyle={{ width: constants.ScreenWidth, alignSelf: 'center', marginBottom: 20, paddingTop: theme.padding / 2 }}
                    formContainerStyle={{ paddingTop: theme.padding }}
                />
            </View>
        )
    }

    //ROLE INPUT
    renderRoleInput(role, isProspect, isConnected) {

        const isAdmin = this.roleId === "admin"

        if (this.isClient) return null

        return (
            <TouchableOpacity onPress={() => this.onPressRole(isAdmin, isConnected)}>
                <MyInput
                    label="Role"
                    returnKeyType="done"
                    value={role}
                    autoCapitalize="none"
                    editable={false}
                    right={
                        isAdmin &&
                        <TextInput.Icon
                            name='pencil'
                            color={theme.colors.gray_medium}
                            size={isTablet ? 33 : 21}
                            onPress={() => this.onPressRole(isAdmin, isConnected)}
                        />
                    }
                />
            </TouchableOpacity>
        )
    }

    onPressRole(isAdmin, isConnected) {
        const allowAction = isAdmin && this.isEdit && isConnected && !this.isClient //Client can't become an employee
        if (!allowAction) return

        const navParams = {
            onGoBack: this.refreshToast,
            userId: this.userParam.id,
            currentRole: this.state.role,
            dataCollection: this.dataCollection
        }

        this.props.navigation.navigate("EditRole", navParams)
    }

    render() {
        let {
            id,
            email,
            email2,
            phone,
            phone2,
            address,
            addressError,
            newPass,
            currentPass,
            role,
            toastMessage,
            error,
            loading,
            loadingDialog,
            loadingSignOut,
            clientProjectsList,
            monthlyGoals,
            isProspect,
            userNotFound,
            sectionsExpansion,
            viewMore
        } = this.state
        const { isConnected } = this.props.network

        const { currentUser } = firebase.auth()
        if (currentUser) var { uid } = currentUser

        let { canUpdate } = this.props.permissions.users
        canUpdate = (canUpdate || this.isProfileOwner)

        const changePwButtonColor = newPass.value === "" || currentPass.value === "" ? theme.colors.gray_medium : theme.colors.primary
        const showEmail2 = this.isClient
        const showPhone2 = this.isClient

        return (
            <View style={{ flex: 1 }}>
                <Appbar
                    menu={this.isRoot}
                    back={!this.isRoot}
                    title
                    titleText='Profil'
                    check={!userNotFound && (canUpdate || this.isClient)}
                    handleSubmit={this.handleSubmit}
                />

                {userNotFound || !currentUser ?
                    <EmptyList
                        icon={faUserSlash}
                        header='Utilisateur introuvable'
                        description='Cet utilisateur est introuvable dans la base de données.'
                        offLine={!isConnected}
                    />
                    :
                    <View style={{ flex: 1 }}>
                        <ScrollView
                            style={styles.container}
                            refreshControl={
                                <RefreshControl
                                    refreshing={this.state.refreshing}
                                    onRefresh={this.fetchProfile}
                                />
                            }
                        >
                            {loading ?
                                <Loading style={{ marginTop: constants.ScreenHeight * 0.4 }} size='large' />
                                :
                                <View>

                                    <FormSection
                                        sectionTitle='Informations'
                                        sectionIcon={faInfo}
                                        showSection={!loading}
                                        isExpanded={sectionsExpansion["info"]}
                                        onPressSection={() => this.toggleSection("info")}
                                        formContainerStyle={{ paddingTop: theme.padding }}
                                        containerStyle={{ marginBottom: 0.5 }}
                                        form={
                                            <View style={{ flex: 1 }}>
                                                <View style={{ height: 130, flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                                                    {this.renderAvatar()}
                                                    {this.renderMetadata(canUpdate, isConnected)}
                                                </View>

                                                {!viewMore &&
                                                    <Text
                                                        onPress={() => this.setState({ viewMore: true })}
                                                        style={[theme.customFontMSbold.body, { color: theme.colors.primary, textAlign: "center", marginTop: theme.padding }]}>
                                                        Voir plus...
                                                    </Text>
                                                }

                                                {viewMore &&
                                                    <View style={{ flex: 1, marginTop: isTablet ? 18 : 0 }}>
                                                        <MyInput
                                                            label="Numéro utilisateur"
                                                            returnKeyType="done"
                                                            value={id}
                                                            onChangeText={text => console.log(text)}
                                                            autoCapitalize="none"
                                                            editable={false}
                                                            disabled
                                                            
                                                            
                                                        />

                                                        <MyInput
                                                            label="Email"
                                                            returnKeyType="done"
                                                            value={email.value}

                                                            // numberOfLine={3}
                                                            onChangeText={text => updateField(this, email, text)}
                                                            autoCapitalize="none"
                                                            error={!!email.error}
                                                            errorText={email.error}
                                                            textContentType='emailAddress'
                                                            keyboardType='email-address'
                                                            editable={this.isEdit && this.isClient && isProspect}
                                                            disabled={false}
                                                        />

                                                        {showEmail2 &&
                                                            <MyInput
                                                                label="Email 2"
                                                                returnKeyType="done"
                                                                value={email2.value}
                                                                onChangeText={text => updateField(this, email2, text)}
                                                                autoCapitalize="none"
                                                                error={!!email2.error}
                                                                errorText={email2.error}
                                                                textContentType='emailAddress'
                                                                keyboardType='email-address'
                                                                editable={this.isEdit && (canUpdate || this.isProcess)}
                                                            />
                                                        }

                                                        {this.renderRoleInput(role, isProspect, isConnected)}

                                                        <MyInput
                                                            label="Téléphone"
                                                            returnKeyType="done"
                                                            value={phone.value}
                                                            onChangeText={text => updateField(this, phone, text)}
                                                            error={!!phone.error}
                                                            errorText={phone.error}
                                                            autoCapitalize="none"
                                                            textContentType='telephoneNumber'
                                                            keyboardType='phone-pad'
                                                            dataDetectorTypes='phoneNumber'
                                                            editable={this.isEdit && (canUpdate || this.isProcess)}
                                                        />

                                                        {
                                                            showPhone2 &&
                                                            <MyInput
                                                                label="Téléphone 2"
                                                                returnKeyType="done"
                                                                value={phone2.value}
                                                                onChangeText={text => updateField(this, phone2, text)}
                                                                error={!!phone2.error}
                                                                errorText={phone2.error}
                                                                autoCapitalize="none"
                                                                textContentType='telephoneNumber'
                                                                keyboardType='phone-pad'
                                                                dataDetectorTypes='phoneNumber'
                                                                editable={this.isEdit && (canUpdate || this.isProcess)}
                                                            />
                                                        }

                                                        <AddressInput
                                                            offLine={!isConnected}
                                                            onPress={() => {
                                                                navigateToScreen(this, 'Address', { currentAddress: this.state.address, onGoBack: this.refreshAddress })
                                                            }}
                                                            address={address}
                                                            onChangeText={this.setAddress}
                                                            clearAddress={() => this.setAddress('')}
                                                            addressError={addressError}
                                                            editable={this.isEdit && (canUpdate || this.isProcess)}
                                                            isEdit={true}
                                                        />

                                                        {this.isProfileOwner &&
                                                            <Button
                                                                loading={loadingSignOut}
                                                                mode="contained"
                                                                onPress={this.handleSignout.bind(this)}
                                                                backgroundColor='#ff5153'
                                                                containerStyle={{ alignSelf: 'center', marginVertical: 24 }}
                                                                style={{ width: constants.ScreenWidth - theme.padding * 2 }}>
                                                                Se déconnecter
                                                            </Button>
                                                        }

                                                    </View>
                                                }

                                            </View>
                                        }
                                    />

                                    {this.isClient &&
                                        <ClientBillingSection
                                            canUpdate={canUpdate}
                                            isExpanded={sectionsExpansion["billing"]}
                                            ClientId={this.userParam.id}
                                            toggleSection={() => this.toggleSection("billing")}
                                        />
                                    }

                                    {this.isClient && this.renderClientProjects(currentUser)}
                                    {this.renderCommercialGoals(monthlyGoals, role)}

                                    {this.isProfileOwner &&
                                        <FormSection
                                            sectionTitle='Modification du mot de passe'
                                            sectionIcon={faLock}
                                            containerStyle={{ width: constants.ScreenWidth, alignSelf: 'center' }}
                                            isExpanded={sectionsExpansion["pw"]}
                                            onPressSection={() => this.toggleSection("pw")}
                                            form={
                                                <View>
                                                    <View style={{ paddingTop: isTablet ? 25 : 15 }}>
                                                        <Text style={[theme.customFontMSregular.body, { color: theme.colors.placeholder }]}>Laissez le mot de passe vide si vous ne voulez pas le changer.</Text>
                                                    </View>

                                                    <MyInput
                                                        label="Ancien mot de passe"
                                                        returnKeyType="done"
                                                        value={currentPass.value}
                                                        onChangeText={text => updateField(this, currentPass, text)}
                                                        error={!!currentPass.error}
                                                        errorText={currentPass.error}
                                                        autoCapitalize="none"
                                                        secureTextEntry={!currentPass.show}
                                                        right={<TextInput.Icon
                                                            name={currentPass.show ? 'eye-off' : 'eye'}
                                                            color={theme.colors.placeholder}
                                                            size={isTablet ? 33 : 21}
                                                            onPress={() => {
                                                                currentPass.show = !currentPass.show
                                                                this.setState({ currentPass })
                                                            }} />}
                                                    />

                                                    <MyInput
                                                        label="Nouveau mot de passe"
                                                        returnKeyType="done"
                                                        value={newPass.value}
                                                        onChangeText={text => updateField(this, newPass, text)}
                                                        error={!!newPass.error}
                                                        errorText={newPass.error}
                                                        autoCapitalize="none"
                                                        secureTextEntry={!newPass.show}
                                                        right={<TextInput.Icon
                                                            name={newPass.show ? 'eye-off' : 'eye'}
                                                            color={theme.colors.placeholder}
                                                            size={isTablet ? 33 : 21}
                                                            onPress={() => {
                                                                newPass.show = !newPass.show
                                                                this.setState({ newPass })
                                                            }} />}
                                                    />

                                                    <Button
                                                        loading={loading}
                                                        mode="contained"
                                                        onPress={this.changePassword}
                                                        containerStyle={{ alignSelf: 'center', marginVertical: 24 }}
                                                        style={{ width: constants.ScreenWidth - theme.padding * 2, backgroundColor: changePwButtonColor }}>
                                                        Modifier le mot de passe
                                                    </Button>
                                                </View>
                                            }
                                        />
                                    }

                                </View>
                            }
                        </ScrollView >

                        <LoadDialog loading={loadingDialog} message="Conversion du prospect en client en cours..." />

                    </View>

                }

                <Toast
                    containerStyle={{ bottom: constants.ScreenWidth * 0.6 }}
                    message={toastMessage}
                    type={this.state.toastType}
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

export default connect(mapStateToProps)(Profile)

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        color:"#000",
    },
    avatar: {
        width: isTablet ? 167 : 130,
        height: isTablet ? 167 : 130,
        marginTop: 10,
        paddingHorizontal: 10,
        borderRadius: 10,
        backgroundColor: theme.colors.gray_light,
        justifyContent: 'center',
        alignItems: 'center'
    },
    metadataContainer: {
        flex: 0.7,
        alignItems: 'center',
        paddingLeft: 25
    },
    error: {
        fontSize: 14,
        color: theme.colors.error,
        paddingHorizontal: 4,
        paddingTop: 4
    },
    userImage: {
        width: constants.ScreenWidth * 0.17,
        height: constants.ScreenWidth * 0.17,
    },
    invisibleItem: { //Same shape of ProjectItem2
        width: constants.ScreenWidth * 0.24,
        height: constants.ScreenWidth * 0.24,
        borderRadius: constants.ScreenWidth * 0.05,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        backgroundColor: 'transparent'
    },
    clientPaymentContainer: {
        flex: 1,
        backgroundColor: theme.colors.white,
        borderRadius: 8,
        marginTop: 12,
        ...theme.style.shadow
    },
    clientPaymentHeader: {
        flexDirection: 'row',
        padding: theme.padding,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        justifyContent: 'space-between',
        backgroundColor: '#EAF7F1'
    },
    clientPaymentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        // alignItems:"center",
        padding: theme.padding,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: theme.colors.gray_light,
    }
})

