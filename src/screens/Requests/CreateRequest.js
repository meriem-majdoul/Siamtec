import React, { Component } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Keyboard, FlatList, TextInput, KeyboardAvoidingView, Platform } from 'react-native'
import { Card, Title, Checkbox } from 'react-native-paper'
import { faCommentDots, faInfoCircle, faLightbulbSlash, faPen, faRetweet, faTimes } from 'react-native-vector-icons/FontAwesome5'
import _ from 'lodash'
import Modal from 'react-native-modal'

import moment from 'moment';
import 'moment/locale/fr'
moment.locale('fr')

import ActivitySection from '../../containers/ActivitySection';
import Appbar from '../../components/Appbar'
import FormSection from '../../components/FormSection';
import SquarePlus from "../../components/SquarePlus";
import Picker from "../../components/Picker";
import AddressInput from '../../components/AddressInput'
import ItemPicker from '../../components/ItemPicker'
import MyInput from '../../components/TextInput'
import Button from '../../components/Button'
import RequestState from "../../components/RequestState";
import Toast from "../../components/Toast";
import MyFAB from "../../components/MyFAB";
import EmptyList from "../../components/EmptyList";
import Loading from "../../components/Loading";

import firebase, { db, auth } from '../../firebase'
import * as theme from "../../core/theme";
import { constants, errorMessages } from "../../core/constants";
import { generateId, navigateToScreen, myAlert, updateField, nameValidator, uuidGenerator, setToast, load, isEditOffline, refreshClient, refreshProject, refreshAddress, setAddress, removeDuplicateObjects, formatDocument, unformatDocument, displayError } from "../../core/utils";

import { connect } from 'react-redux'
// import CreateTicket from './CreateTicket';
// import CreateProject from './CreateProject';
import { fetchDocs, fetchDocument, fetchDocuments } from '../../api/firestore-api';
import CustomIcon from '../../components/CustomIcon';

const departments = [
    { label: 'Commercial', value: 'Commercial' },
    { label: 'Facturation et suivi de projet', value: 'Facturation et suivi de projet' },
    { label: 'Conseil technique', value: 'Conseil technique' },
    { label: 'Incident', value: 'Incident' },
]
const properties = ["project", "client", "department", "subject", "state", "description", "address", "selectedProducts", "chatId", "createdAt", "createdBy", "editedAt", "editedBy"]

class CreateRequest extends Component {
    constructor(props) {
        super(props)
        this.refreshProject = refreshProject.bind(this)
        this.refreshClient = refreshClient.bind(this)
        this.refreshAddress = refreshAddress.bind(this)
        this.setAddress = setAddress.bind(this)
        // this.fetchDocs = fetchDocs.bind(this)
        this.onPressProjectCallBack = this.onPressProjectCallBack.bind(this)
        this.setProducts = this.setProducts.bind(this)
        this.toggleModal = this.toggleModal.bind(this)
        this.renderModalItem = this.renderModalItem.bind(this)

        this.handleSubmit = this.handleSubmit.bind(this)
        this.myAlert = myAlert.bind(this)

        this.initialState = {}
        this.isInit = true
        this.requestType = this.props.requestType
        this.isTicket = this.requestType === 'ticket'

        this.RequestId = this.props.route?.params?.RequestId ?? '';

        this.isEdit = this.RequestId !== ''
        this.RequestId = this.isEdit ? this.RequestId : this.isTicket ? generateId('GS-DTC-') : generateId('GS-DPR-')

        this.isClient = this.props.role.id === 'client'

        this.state = {
            project: { id: '', name: '' },
            client: this.autoFillClient(),
            projectError: '',
            department: 'Commercial', //ticket
            address: { description: '', place_id: '' }, //project
            addressError: '',
            subject: "",
            subjectError: '',
            description: "",
            state: 'En attente',

            createdAt: '',
            createdBy: { id: '', fullName: '' },
            editedAt: '',
            editedBy: { id: '', fullName: '' },

            productsList: [],
            productsFetched: false,
            selectedProducts: [],
            otherProducts: "",
            isModalVisible: false,

            error: '',
            loading: true,
            docNotFound: false,
            toastMessage: '',
            toastType: ''
        }
    }

    autoFillClient() {
        let client = { id: '', fullName: '' }
        if (this.props.role.id === "client") {
            client = this.props.currentUser
        }
        return client
    }

    //GET
    async componentDidMount() {
        if (this.isEdit) await this.initEditMode()
        this.initialState = _.cloneDeep(this.state)
        load(this, false)
    }

    async initEditMode() {
        try {
            let request = await fetchDocument('Requests', this.RequestId)
            request = this.setRequest(request)
            if (!request) return
            const { project } = this.state
            let productsList = await this.setProducts(project.id)
            this.refreshModalData(productsList)
        }
        catch (e) {
            const { message } = e
            displayError({ message })
        }
    }

    setRequest(request) {
        if (!request)
            this.setState({ docNotFound: true })
        else {
            request = formatDocument(request, properties, [])
            this.setState(request)
        }
        return request
    }

    refreshModalData(productsList) {
        const { selectedProducts } = this.state
        if (productsList.length > 0) {
            const selectedProductsIds = selectedProducts.map((product) => product.id)
            productsList.forEach((product) => {
                if (selectedProductsIds.includes(product.id))
                    product.selected = true
            })
        }
        let otherProducts = selectedProducts.filter((product) => product.manual)
        otherProducts = otherProducts.map((product) => product.name)
        otherProducts = otherProducts.join(';')
        this.setState({ productsList, otherProducts })
    }

    //VALIDATE
    validateInputs() {
        let { project, subject } = this.state
        const subjectError = nameValidator(subject, '"Sujet"')
        const projectError = this.isTicket ? nameValidator(project.id, '"Projet"') : ""
        //let addressError = nameValidator(address.description, '"Adresse postale"')
        if (projectError || subjectError) {
            this.setState({ subjectError, projectError, loading: false })
            setToast(this, 'e', 'Erreur de saisie, veuillez verifier les champs.')
            return false
        }
        return true
    }

    //POST
    async AddRequestAndChatRoom(request) {
        if (this.isEdit) {
            db.collection('Requests').doc(this.RequestId).set(request, { merge: true })
            return
        }

        const messageId = await uuidGenerator()
        const text = request.type === "project" ? `La demande de projet a été initiée` : `La demande de ticket a été initiée` 
        const systemMessage = {
            _id: messageId,
            text,
            createdAt: new Date().getTime(),
            system: true
        }
        const chatId = await uuidGenerator()
        request.chatId = chatId

        //Batch write
        const batch = db.batch()
        const requestsRef = db.collection('Requests').doc(this.RequestId)
        const chatRef = db.collection('Chats').doc(chatId)
        const messagesRef = chatRef.collection('ChatMessages').doc(messageId)
        batch.set(requestsRef, request)
        batch.set(chatRef, systemMessage)
        batch.set(messagesRef, systemMessage)
        batch.commit()
    }

    async handleSubmit() {
        Keyboard.dismiss()

        const { isConnected } = this.props.network
        let isEditOffLine = isEditOffline(this.isEdit, isConnected)
        if (isEditOffLine) return

        const { error, loading } = this.state
        if (loading || _.isEqual(this.state, this.initialState)) return
        load(this, true)

        //1. Validate inputs
        const isValid = this.validateInputs()
        if (!isValid) return

        let props = ["client", "subject", "description", "state", "selectedProducts"]
        if (this.isTicket) props = [...props, ...["project", "department"]]
        else props = [...props, ...["address"]]
        let request = unformatDocument(this.state, props, this.props.currentUser, this.isEdit)
        request.type = this.isTicket ? 'ticket' : 'project'

        this.AddRequestAndChatRoom(request, this.isEdit)

        load(this, false)

        //Refreshing requests list
        if (this.props.navigation.state.params.onGoBack) {
            this.props.navigation.state.params.onGoBack()
        }

        this.props.navigation.goBack()
    }

    renderStateToggle(currentState, canWrite) {
        const label = this.isTicket ? 'ticket' : 'projet'
        return <RequestState state={currentState} onPress={(state) => this.alertUpdateRequestState(state, label, canWrite)} />
    }

    alertUpdateRequestState(nextState, label, canWrite) {
        if (nextState === this.state.state || !canWrite) return
        const title = "Mettre à jour le " + label
        const message = "Etes-vous sûr de vouloir changer l'état de ce " + label + ' ?'
        const handleConfirm = () => this.updateRequestState(nextState)
        this.myAlert(title, message, handleConfirm)
    }

    updateRequestState(state) {
        db.collection('Requests').doc(this.RequestId).update({ state, editedBy: this.props.currentUser })
        this.setState({ state })
    }

    async onPressProjectCallBack(projectObject) {
        try {
            const { id, name, client, step, address, comContact, techContact, intervenant, bill } = projectObject
            const project = { id, name, client, step, address, comContact, techContact, intervenant }
            this.setState({ project, client })
            const isClientCharged = bill.amount !== ''
            if (isClientCharged) await this.setProducts(project.id)
            else this.setState({ productsFetched: true })
        }
        catch (e) {
            const { message } = e
            displayError({ message })
        }
    }

    async setProducts(projectId) {
        try {
            let productsList = []
            const query = db.collection('Orders').where('project.id', '==', projectId).where('deleted', '==', false)
            let ordersList = await fetchDocuments(query)
            if (ordersList.length === 0) {
                this.setState({ productsFetched: true })
                return productsList
            }
            ordersList = removeDuplicateObjects(ordersList)
            const noGeneratedBill = ordersList.length === 0
            if (noGeneratedBill) return productsList
            for (const order of ordersList) {
                const products = order.orderLines.map((orderLine) => { return { ...orderLine.product, selected: false } })
                productsList = [...productsList, ...products]
            }
            this.setState({ productsList, productsFetched: true })
            return productsList
        }
        catch (e) {
            throw new Error("Erreur lors du chargement le la liste des produits concernant ce projet.")
        }
    }

    renderProducts() {
        let { selectedProducts, otherProducts, productsFetched } = this.state
        if (!productsFetched) return null
        const textStyle = theme.customFontMSregular.body
        const anyProductSelected = selectedProducts.length === 0 && otherProducts === ""

        const onPressProduct = (product) => {
            if (product.manual) return
            this.props.navigation.navigate('CreateProduct', { ProductId: product.id })
        }

        if (anyProductSelected)
            return (
                <View style={{ marginTop: 15 }}>
                    <Text style={[textStyle, { marginBottom: 15 }]}>Articles concernés</Text>
                    <SquarePlus onPress={this.toggleModal} />
                </View>
            )

        else return (
            <View style={styles.productsListContainer}>
                <TouchableOpacity style={styles.productsListHeader} onPress={this.toggleModal}>
                    <Text style={[textStyle]}>Articles concernés</Text>
                    <CustomIcon icon={faPen} color={theme.colors.secondary} size={21} />
                </TouchableOpacity>
                {selectedProducts.map((product, index) => {
                    const color = product.manual ? theme.colors.secondary : theme.colors.primary
                    return (
                        <TouchableOpacity
                            key={index.toString()}
                            onPress={onPressProduct.bind(this, product)}
                            style={styles.productsListRow}>
                            <Text style={[textStyle, { color }]}>{product.name}</Text>
                        </TouchableOpacity>
                    )
                })}
            </View>
        )
    }

    toggleModal() {
        const { isModalVisible } = this.state
        this.setState({ isModalVisible: !isModalVisible })
    }

    renderModalItem(product, key) {

        let { productsList } = this.state

        return (
            <View style={modalStyles.item}>
                <Checkbox
                    status={productsList[key].selected ? 'checked' : 'unchecked'}
                    color={theme.colors.primary}
                    onPress={() => {
                        productsList[key].selected = !productsList[key].selected
                        this.setState({ productsList })
                    }}
                />
                <Text style={[theme.customFontMSregular.body, { marginLeft: 15, flex: 1 }]}>
                    {product.name}
                </Text>
            </View>
        )
    }

    handleConfirmModal(productsList, otherProducts) {
        let selectedProducts = productsList.filter((product) => product.selected)
        if (otherProducts !== "") {
            otherProducts = otherProducts.split(';').map(item => item.trim())
            otherProducts = otherProducts.filter((product) => product !== "")
            otherProducts = otherProducts.map((productName) => { return { id: productName, name: productName, manual: true } })
            selectedProducts = [...selectedProducts, ...otherProducts]
        }
        this.setState({ selectedProducts }, () => this.toggleModal())
    }

    renderProductsModal(isConnected) {
        let { isModalVisible, productsList, otherProducts } = this.state
        const header = (text) => <Text style={[theme.customFontMSregular.body, { color: theme.colors.gray_dark }]}>{text}</Text>

        return (
            <Modal
                isVisible={isModalVisible}
                style={modalStyles.modal}
                onBackdropPress={this.toggleModal}>

                <KeyboardAvoidingView
                    style={modalStyles.container}
                    behavior={Platform.OS === "ios" ? 'padding' : null}
                    keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
                >
                    <TouchableOpacity style={modalStyles.closeIcon}>
                        <CustomIcon
                            icon={faTimes}
                            color={theme.colors.gray_dark}
                            size={21}
                            onPress={this.toggleModal}
                        />
                    </TouchableOpacity>

                    <View style={{ flex: 0.7, paddingBottom: 15 }}>
                        {header("Suggestion d'articles")}
                        {productsList.length > 0 ?
                            <FlatList
                                data={productsList}
                                keyExtractor={item => item.id}
                                renderItem={({ item, index }) => this.renderModalItem(item, index)}
                            />
                            :
                            <EmptyList
                                icon={faLightbulbSlash}
                                header='Aucune suggestion'
                                description="Veuillez saisir manuellement, ci-dessous, les articles concernés."
                                offLine={!isConnected}
                            />
                        }
                    </View>

                    <View style={{ flex: 0.3, justifyContent: 'space-around' }}>
                        {header("Autres articles")}
                        <TextInput
                            underlineColorAndroid="transparent"
                            placeholder="Saisissez les désignations des articles séparés par des points virgules. Exp: Article 1; Article 2; Article 3; etc."
                            placeholderTextColor={theme.colors.gray_medium}
                            numberOfLines={7}
                            multiline={true}
                            onChangeText={otherProducts => this.setState({ otherProducts })}
                            value={otherProducts}
                            autoCapitalize='sentences'
                            style={modalStyles.productsTextArea}
                        />
                    </View>

                    <View>
                        <Button
                            mode="contained"
                            onPress={() => this.handleConfirmModal(productsList, otherProducts)}
                            containerStyle={modalStyles.confirmButton}>
                            Confirmer
                        </Button>
                    </View>
                </KeyboardAvoidingView>
            </Modal >
        )
    }

    render() {
        const { project, client, department, subject, state, description, address } = this.state
        const { createdAt, createdBy, editedAt, editedBy, loading, docNotFound, toastMessage, toastType, subjectError, projectError, addressError } = this.state
        const { requestType } = this.props

        let { canCreate, canUpdate, canDelete } = this.props.permissions.requests
        const canWrite = (canUpdate && this.isEdit || canCreate && !this.isEdit)
        const { isConnected } = this.props.network

        const title = ' Demande de ' + requestType
        const prevScreen = requestType === 'ticket' ? 'CreateTicketReq' : 'CreateProjectReq'
        const showClient = !this.isClient && (project.client && project.client.id || !this.isTicket)

        if (docNotFound)
            return (
                <View style={styles.container}>
                    <Appbar close title titleText={title} />
                    <EmptyList icon={faTimes} header='Demande introuvable' description="Le demande est introuvable dans la base de données. Il se peut qu'elle ait été supprimé." offLine={!isConnected} />
                </View>
            )

        else return (
            <View style={styles.container}>
                <Appbar close title titleText={title} check={this.isEdit ? canWrite && !loading : !loading} handleSubmit={this.handleSubmit} />

                {loading ?
                    <Loading size='large' />
                    :
                    <ScrollView keyboardShouldPersistTaps="never" style={styles.container}>
                        <FormSection
                            sectionTitle='Informations générales'
                            sectionIcon={faInfoCircle}
                            form={
                                <View style={{ flex: 1 }}>
                                    <MyInput
                                        label="Numéro de la demande"
                                        returnKeyType="done"
                                        value={this.RequestId}
                                        editable={false}
                                    />

                                    {this.isTicket ?
                                        <Picker
                                            label="Département *"
                                            returnKeyType="next"
                                            value={department}
                                            selectedValue={department}
                                            onValueChange={(department) => this.setState({ department })}
                                            title="Département"
                                            elements={departments}
                                            enabled={canWrite}
                                        />
                                        :
                                        <AddressInput
                                            label='Adresse postale'
                                            offLine={!isConnected}
                                            onPress={() => navigateToScreen(this, 'Address', { onGoBack: this.refreshAddress })}
                                            address={address}
                                            onChangeText={this.setAddress}
                                            clearAddress={() => this.setAddress('')}
                                            addressError={addressError}
                                            editable={canWrite}
                                            isEdit={this.isEdit} />
                                    }

                                    <MyInput
                                        label="Sujet *"
                                        returnKeyType="done"
                                        value={subject}
                                        onChangeText={subject => this.setState({ subject })}
                                        error={!!subjectError}
                                        errorText={subjectError}
                                        editable={canWrite}
                                    />

                                    <MyInput
                                        label="Description de la demande"
                                        returnKeyType="done"
                                        value={description}
                                        onChangeText={description => this.setState({ description })}
                                        // error={!!description.error}
                                        // errorText={description.error}
                                        editable={canWrite}
                                    />
                                </View>
                            }
                        />

                        {this.isTicket &&
                            <FormSection
                                sectionTitle='Références'
                                sectionIcon={faRetweet}
                                form={
                                    <View style={{ flex: 1 }}>
                                        <ItemPicker
                                            onPress={() => {
                                                if (this.project || this.isEdit) return //pre-defined project
                                                navigateToScreen(this, 'ListProjects', { onGoBack: this.onPressProjectCallBack, prevScreen: 'CreateRequest', isRoot: false, titleText: 'Choix du projet', showFAB: false })
                                            }}
                                            label="Projet concerné"
                                            value={project.name}
                                            error={!!projectError}
                                            errorText={projectError}
                                            showAvatarText={false}
                                            editable={canWrite}
                                        />

                                        {showClient &&
                                            <ItemPicker
                                                onPress={() => navigateToScreen(this, 'ListClients', { onGoBack: this.refreshClient, prevScreen: 'CreateRequest', isRoot: false })}
                                                label="Client *"
                                                value={client.fullName}
                                                error={!!client.error}
                                                errorText={client.error}
                                                editable={!this.isTicket}
                                            />
                                        }

                                        {this.renderProducts()}
                                        {this.renderProductsModal(isConnected)}
                                    </View>
                                }
                            />
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
                    </ScrollView >
                }

                <Toast
                    containerStyle={{ bottom: constants.ScreenWidth * 0.6 }}
                    message={toastMessage}
                    type={toastType}
                    onDismiss={() => this.setState({ toastMessage: '' })} />

                {this.isEdit &&
                    <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10, paddingRight: 15, backgroundColor: theme.colors.surface, elevation: 5 }}>
                        <MyFAB
                            onPress={() => this.props.navigation.navigate('Chat', { chatId: this.state.chatId })}
                            icon={faCommentDots}
                            style={styles.fab} />
                        {this.renderStateToggle(state, canWrite)}
                    </View>
                }
            </View >
        );
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

export default connect(mapStateToProps)(CreateRequest)

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background
    },
    fab: {
        width: constants.ScreenWidth * 0.14,
        height: constants.ScreenWidth * 0.14,
    },
    productsListContainer: {
        flex: 1,
        backgroundColor: theme.colors.white,
        borderRadius: 8,
        marginTop: 15,
        ...theme.style.shadow
    },
    productsListHeader: {
        flexDirection: 'row',
        padding: theme.padding,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        justifyContent: 'space-between',
        backgroundColor: '#EAF7F1'
    },
    productsListRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: theme.padding,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: theme.colors.gray_light,
    }
})

const modalStyles = StyleSheet.create({
    modal: {
        flex: 1,
        maxHeight: constants.ScreenHeight,
        margin: 15,
    },
    container: {
        flex: 1,
        backgroundColor: theme.colors.white,
        padding: theme.padding
    },
    closeIcon: {
        zIndex: 1,
        position: 'absolute',
        top: theme.padding,
        right: theme.padding,
        justifyContent: 'center',
        alignItems: 'center'
    },
    productsTextArea: {
        alignSelf: 'center',
        textAlignVertical: 'top',
        backgroundColor: '#ffffff',
        borderRadius: 8,
        paddingTop: 15,
        paddingHorizontal: 10,
        ...theme.style.shadow
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 15,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: theme.colors.gray_light
    },
    confirmButton: {
        alignSelf: 'flex-end',
    }
})

