import React, { Component } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Keyboard, Alert } from 'react-native';
import { TextInput } from 'react-native-paper'
import DocumentPicker from '@react-native-documents/picker';
import { faTimes, faCloudUploadAlt, faMagic, faFilePlus, faFileSearch, faInfoCircle, faSignature, faFileSignature } from '@fortawesome/free-solid-svg-icons'
import _ from 'lodash'
import { connect } from 'react-redux'

import moment from 'moment';
import 'moment/locale/fr'
moment.locale('fr')

import ActivitySection from '../../containers/ActivitySection'
import Appbar from '../../components/Appbar'
import FormSection from '../../components/FormSection'
import SquarePlus from '../../components/SquarePlus'
import MyInput from '../../components/TextInput'
import ItemPicker from "../../components/ItemPicker"
import Button from "../../components/Button"
import ModalOptions from "../../components/ModalOptions"
import UploadProgress from "../../components/UploadProgress"
import Toast from "../../components/Toast"
import EmptyList from "../../components/EmptyList"
import Loading from "../../components/Loading"
import LoadDialog from "../../components/LoadDialog"
import CustomIcon from '../../components/CustomIcon';

import { db, auth } from '../../firebase'
import { fetchDocument, fetchDocuments } from "../../api/firestore-api";
import { uploadFileNew } from "../../api/storage-api";
import {
    generateId,
    navigateToScreen,
    myAlert,
    nameValidator,
    setToast,
    pickDoc,
    articles_fr,
    isEditOffline,
    setPickerDocTypes,
    refreshProject,
    pickImage,
    saveFile,
    convertImageToPdf,
    displayError,
    formatDocument,
    unformatDocument
} from "../../core/utils";
import * as theme from "../../core/theme";

import {
    constants,
    docsConfig,
    errorMessages,
    generableDocTypes,
    onlyImportableDocTypes,
    highRoles,
    imageSources,
    masculinsDocTypes,
    staffRoles
} from "../../core/constants";
import { blockRoleUpdateOnPhase } from '../../core/privileges';

//Pickers items

const docSources = [
    { label: 'Importer', value: 'upload', icon: faCloudUploadAlt, selected: false },
    { label: 'Générer', value: 'generate', icon: faMagic, selected: false }
]

const genOrderSources = [
    { label: 'Une commande existante', value: 'oldOrder', icon: faFileSearch },
    { label: 'Une nouvelle commande', value: 'newOrder', icon: faFilePlus },
]

const genFicheEEBSources = [
    { label: 'Une simulation existante', value: 'oldSimulation', icon: faFileSearch },
    { label: 'Une nouvelle simulation', value: 'newSimulation', icon: faFilePlus },
]

const genFormSources = [
    { label: 'Un formulaire existant', value: 'oldForm', icon: faFileSearch },
    { label: 'Un nouveau formulaire', value: 'newForm', icon: faFilePlus },
]

const properties = ["project", "name", "type", "state", "attachment", "attachmentSource", "orderData", "createdAt", "createdBy", "editedAt", "editedBy"]

class UploadDocument extends Component {

    constructor(props) {
        super(props)

        //Inputs
        this.refreshProject = refreshProject.bind(this)

        //Submit
        this.handleSubmit = this.handleSubmit.bind(this)
        this.persistDocument = this.persistDocument.bind(this)
        this.uploadFile = this.uploadFile.bind(this)
        this.uploadFileNew = uploadFileNew.bind(this)
        this.unformatDocument_conversion = this.unformatDocument_conversion.bind(this)

        //Document source (gen/upload)
        this.toggleModal = this.toggleModal.bind(this)
        this.resetModalOptions = this.resetModalOptions.bind(this)
        this.startGenPdf = this.startGenPdf.bind(this) //Start Pdf gen flow
        this.getGenPdf = this.getGenPdf.bind(this) //End Pdf gen flow

        //Delete
        this.myAlert = myAlert.bind(this)
        this.showAlert = this.showAlert.bind(this)

        //Init
        this.initialState = {}
        this.isInit = true

        //Params
        const { route } = this.props;

        // Récupération des paramètres via route?.params
        this.DocumentId = route?.params?.DocumentId ?? '';
        this.isEdit = this.DocumentId !== '';
        this.DocumentId = this.isEdit ? this.DocumentId : generateId('GS-DOC-');
    
        // Navigation goBack behaviours
        this.onSignaturePop = route?.params?.onSignaturePop ?? 1;
    
        // Process params
        this.isProcess = route?.params?.isProcess ?? false;
        this.isSignature = route?.params?.isSignature ?? false;
        this.dynamicType = route?.params?.dynamicType ?? false;
        this.documentType = route?.params?.documentType;
        this.project = route?.params?.project;
        this.onGoBack = route?.params?.prevScreen; 
       

        this.currentRole = this.props.role.id
        this.isHighrole = highRoles.includes(this.currentRole)
        this.types = setPickerDocTypes(this.currentRole, this.dynamicType, this.documentType)
        this.docSources = docSources
        this.imageSources = imageSources
        this.genOrderSources = genOrderSources
        this.genFicheEEBSources = genFicheEEBSources
        this.genFormSources = genFormSources

        const defaultState = this.setDefaultState()

        this.state = {
            //TEXTINPUTS
            name: defaultState.name || "",
            nameError: "",
            description: "",

            //Screens
            project: defaultState.project || { id: '', name: '' },
            projectError: '',

            //Pickers
            state: 'En cours',
            type: defaultState.type || 'Autre',

            //File Picker
            attachment: null,
            attachmentError: "",

            //Logs
            createdBy: { id: '', fullName: '' },
            createdAt: '',
            editedBy: { id: '', fullName: '' },
            editededAt: '',
            signatures: [],

            //Pdf generation
            showModal: false,
            modalContent: 'docTypes',
            attachmentSource: '', //upload || generation || conversion || signature
            orderData: null,

            initialLoading: true,
            loading: false,
            docNotFound: false,
            loadingConversion: false,
            modalLoading: false,
            toastType: '',
            toastMessage: ''
        }
    }

    setDefaultState() {
        let defaultState = {}

        if (this.project && this.documentType) {
            const name = this.documentType.value !== "Autre" ? `${this.documentType.value} ${this.project.id}` : `Autre ${this.project.id}`
            defaultState = {
                name,
                type: this.documentType.value,
            }
        }

        if (this.project) {
            defaultState.project = this.project
        }

        return defaultState
    }

    async componentDidMount() {
        if (this.isEdit) await this.initEditMode(this.DocumentId)
        //Auto refresh
        this.willFocusSubscription = this.props.navigation.addListener('willFocus', async () => {
            this.setState({ initialLoading: true })
            await this.initEditMode(this.DocumentId)
            this.setState({ initialLoading: false })
        })
        this.initialState = _.cloneDeep(this.state)
        this.setState({ initialLoading: false })

        if (this.isSignature)
            this.navigateToSignature(true, this.props.network.isConnected)
    }

    // componentWillUnmount() {
    //     this.resetModalOptions()
    //     this.unsubscribeAttachmentListener && this.unsubscribeAttachmentListener()
    //     if (this.willFocusSubscription)
    //         this.willFocusSubscription.remove()
    // }

    async initEditMode(DocumentId) {
        if (!this.isEdit) return
        let document = await fetchDocument('Documents', DocumentId)
        document = await this.setDocument(document)
        if (!document) return
        await this.setSignatures(DocumentId)
        await this.attachmentListener(DocumentId)
    }

    async setDocument(document) {
        if (!document)
            this.setState({ docNotFound: true })
        else {
            document = formatDocument(document, properties)
            this.setState(document)
        }
        return document
    }

    async setSignatures(DocumentId) {
        const query = db.collection('Documents').doc(DocumentId).collection('AttachmentHistory')
        let attachmentHistoryDocs = await fetchDocuments(query)
        if (attachmentHistoryDocs == []) return
        attachmentHistoryDocs = attachmentHistoryDocs.filter((doc) => doc.sign_proofs_data)
        const signatures = attachmentHistoryDocs.map((doc) => {
            const { signedBy, signedAt } = doc.sign_proofs_data
            return { signedBy, signedAt }
        })
        this.setState({ signatures })
    }

    attachmentListener(DocumentId) {
        return new Promise((resolve, reject) => {
            const query = db.collection('Documents').doc(DocumentId)
            this.unsubscribeAttachmentListener = query.onSnapshot(async (doc) => {
                if (!doc.exists) resolve(true)
                const localAttachment = this.state.attachment
                if (!localAttachment) resolve(true)
                const remoteAttachment = doc.data().attachment
                const remoteStatus = remoteAttachment.pending

                if (!remoteStatus) {
                    this.setState({ attachment: remoteAttachment })
                    this.initialState.attachment = remoteAttachment
                    this.unsubscribeAttachmentListener()
                }
                resolve(true)
            })
        })
    }

    //##SUBMISSION
    validateInputs() {
        let { project, name, attachment } = this.state
        let projectError = nameValidator(project.id, '"Projet"')
        let nameError = nameValidator(name, '"Nom du document"')
        let attachmentError = !attachment ? 'La pièce jointe est obligatoire' : ""
        console.log(projectError, nameError, attachmentError)
        if (projectError || nameError || attachmentError) {
            this.setState({ projectError, nameError, attachmentError, loading: false, loadingConversion: false })
            return false
        }
        return true
    }

    async handleSubmit(isConversion, DocumentId) {
        Keyboard.dismiss()
        //0. Reject offline updates
        const { isConnected } = this.props.network
        let isEditOffLine = isEditOffline(this.isEdit, isConnected)
        if (isEditOffLine) return

        //1. Is loading or no edit ?
        const loadingOrNoEdit = this.state.loading || _.isEqual(this.state, this.initialState)
        if (loadingOrNoEdit) return
        this.setState({
            loading: true,
            loadingConversion: isConversion
        })

        //2. TECHNICIEN & COMMERCIAL PHASES UPDATES PRIVILEGES: Check if user has privilege to update selected project
        const isBlockedUpdates = blockRoleUpdateOnPhase(this.currentRole, this.state.project.step)
        if (isBlockedUpdates) {
            Alert.alert('Accès refusé', `Utilisateur non autorisé à modifier un projet dans la phase ${this.state.project.step}.`)
            this.setState({ loading: false, loadingConversion: false })
            return
        }

        //3. Validate
        const isValid = this.validateInputs()
        if (!isValid) return

        //4. Persist
        const props = ["project", "name", "description", "type", "state", "attachment", "attachmentSource", "orderData"]
        let document = unformatDocument(this.state, props, this.props.currentUser, this.isEdit)
        const { attachment } = this.state
        const isNewAttachment = attachment && !attachment.downloadURL

        if (isNewAttachment)
            document.attachment.pending = true

        if (isConversion)
            document = this.unformatDocument_conversion(document)

        await this.persistDocument(document, DocumentId)

        this.documentListener() //listener to await local writes

        this.refreshState(document, DocumentId, isConversion)

        //5. Upload
        if (isNewAttachment)
            var fileUploaded = await this.handleUpload(document, DocumentId, isConversion, isConnected)

        this.initialState = _.cloneDeep(this.state)

        //6. Go back (Process context only)
        const { onGoBack } = this.props.navigation.state.params
    

        if (onGoBack)
            onGoBack()
        this.props.navigation.goBack()

        this.setState({
            loading: false,
            loadingConversion: false
        })
    }

    //1. Persist
    persistDocument(document, DocumentId) {
        return new Promise((resolve, reject) => {
            const batch = db.batch()
            const documentRef = db.collection('Documents').doc(DocumentId)
            const attachmentsRef = db.collection('Documents').doc(DocumentId).collection('AttachmentHistory').doc()
            batch.set(documentRef, document, { merge: true })
            batch.set(attachmentsRef, document.attachment)
            batch.commit()
            this.documentListener = db.collection('Documents').doc(DocumentId).onSnapshot((doc) => resolve(true)) //Listener to handle offline persistance without using async/await
        })
    }

    unformatDocument_conversion(document) {
        document.createdAt = moment().format()
        document.createdBy = this.props.currentUser
        document.name = `${document.name} (Facture générée)`
        document.type = 'Facture'
        document.attachmentSource = 'conversion'
        document.conversionSource = this.DocumentId //Id of the current "OP"
        return document
    }

    //2. Refresh locally
    refreshState(document, DocumentId, isConversion) {
        if (isConversion) {
            this.DocumentId = DocumentId
            const { name, type, attachmentSource, conversionSource } = document
            this.setState({ name, type, attachmentSource, conversionSource })
        }

        if (!this.isEdit || isConversion) {
            const { createdAt, createdBy } = document
            this.setState({ createdAt, createdBy }, () => {
                this.isEdit = true
                this.initialState = _.cloneDeep(this.state)
            })
        }
    }

    //3. Upload
    async handleUpload(document, DocumentId, isConversion, isConnected) {
        if (!this.isEdit || isConversion)
            await this.attachmentListener(DocumentId)

        if (!isConnected)
            this.setState({
                loading: false,
                loadingConversion: false
            })

        const fileUploaded = await this.uploadFile(DocumentId)
        if (!fileUploaded)
            setToast(this, 'e', errorMessages.documents.upload) //#task: put it on redux store
        return fileUploaded
    }

    async uploadFile(DocumentId) {
        var { project, type, attachment } = this.state
        const storageRefPath = `Projects/${project.id}/Documents/${type}/${DocumentId}/${moment().format('ll')}/${attachment.name}`
        const fileUploaded = await this.uploadFileNew(attachment, storageRefPath, DocumentId, false)
        return fileUploaded
    }

    //##DELETION
    showAlert() {
        const title = "Supprimer le document"
        const message = 'Etes-vous sûr de vouloir supprimer ce document ? Cette opération est irreversible.'
        const handleConfirm = () => this.handleDelete()
        this.myAlert(title, message, handleConfirm)
    }

    handleDelete() {
        db.collection('Documents').doc(this.DocumentId).update({ deleted: true })
        //Refreshing documents list
        if (this.props.navigation.state.params.onGoBack) {
            this.props.navigation.state.params.onGoBack()
        }
        this.props.navigation.goBack()
    }

    //##ATTACHMENT COMPONENT
    async onPressAttachment(canWrite) {

        console.log("..............", canWrite)
        if (!canWrite) return

        if (!this.isEdit && !this.documentType) { //Creation & not pre-defined document type {
            this.toggleModal()
        }

        else { //this.isEdit || !this.isEdit && this.documentType 
            let modalContent = ''
            const isGenerable = generableDocTypes.includes(this.state.type)
            const isOnlyImportable = onlyImportableDocTypes.includes(this.state.type)

            if (isOnlyImportable) this.configImageSources(1, true)

            else {
                if (isGenerable) modalContent = 'docSources'
                else modalContent = 'imageSources'
                this.setState({ modalContent, showModal: true })
            }
        }
    }

    onPressUploadPending(uploadRunning) {
        if (auth.currentUser.uid === this.state.editedBy.id) {
            if (uploadRunning) return
            else Alert.alert("", "L'importation de la pièce jointe va commencer dès que votre appareil se connecte à internet.")
        }

        //In case remote user presses the attachment while it is still pending.
        else Alert.alert("", "Ce document est en cours d'importation. Le document sera bientôt disponible, veuillez patienter...")
    }

    renderAttachment(canWrite, isProcess) {
        const { attachment } = this.state

        if (!attachment) {
            return (
                <View style={{ marginVertical: 10, marginTop: 15 }}>
                    {!isProcess &&
                        <Text style={[theme.customFontMSregular.caption, { marginBottom: 5 }]}>Pièce jointe</Text>
                    }
                    <SquarePlus
                        style={{ marginTop: 5 }}
                        onPress={() => this.onPressAttachment(canWrite)}
                        isBig={isProcess}
                    />
                </View>
            )
        }

        else {
            //upload task is running -> show progress for local user
            var reduxAttachment = this.props.documents.newAttachments[this.DocumentId] || null
            attachment.progress = reduxAttachment ? reduxAttachment.progress : null
            var uploadNotRunning = (!reduxAttachment || reduxAttachment && reduxAttachment.progress === 0) //remote user & local user before upload starts

            //local & remote 
            if (attachment.pending) {
                return (
                    <TouchableOpacity style={{ marginTop: 15 }}>
                        <Text style={[theme.customFontMSmedium.caption, { color: theme.colors.placeholder }]}>Pièce jointe</Text>
                        <UploadProgress
                            attachment={attachment}
                            showProgress={reduxAttachment}
                            pending={uploadNotRunning}
                            onPress={() => this.onPressUploadPending(!uploadNotRunning)}
                        />
                    </TouchableOpacity>
                )
            }

            else {
                return (
                    <TouchableOpacity onPress={() => this.onPressAttachment(canWrite)}>
                        <MyInput
                            label="Pièce jointe"
                            value={attachment && attachment.name}
                            editable={false}
                            //multiline
                            right={<TextInput.Icon name='attachment' color={theme.colors.placeholder} onPress={() => this.onPressAttachment(canWrite)} />}
                        />
                    </TouchableOpacity>
                )
            }
        }
    }

    //##PDF GENERATION/UPLOAD PROCESS
    //0.
    modalOptionsConfig() {
        const { modalContent, type } = this.state

        if (modalContent === 'docTypes') {
            return {
                title: `Choisissez le type du document`,
                columns: 3,
                elements: this.types,
            }
        }

        else if (modalContent === 'docSources') {
            return {
                title: `Créer ${articles_fr('un', masculinsDocTypes, type)} ${type.toLowerCase()}`,
                columns: 2,
                elements: this.docSources,
            }
        }

        else if (modalContent === 'imageSources') {
            return {
                title: `Source`,
                columns: 2,
                elements: this.imageSources,
            }
        }

        else if (modalContent === 'genOrderSources') {
            return {
                title: `Générer ${articles_fr('un', masculinsDocTypes, type)} ${type.toLowerCase()} à partir de:`,
                columns: 2,
                elements: this.genOrderSources,
            }
        }

        else if (modalContent === 'genFicheEEBSources') {
            return {
                title: `Générer une fiche EEB à partir de:`,
                columns: 2,
                elements: this.genFicheEEBSources,
            }
        }

        else if (modalContent === 'genFormSources') {
            return {
                title: `Générer un ${articles_fr('un', masculinsDocTypes, type)} ${type.toLowerCase()} à partir de:`,
                columns: 2,
                elements: this.genFormSources,
            }
        }
    }

    async toggleModal(reset) {
        await new Promise((resolve, reject) => {
            const modalContent = staffRoles.includes(this.props.role.id) ? "docTypes" : 'imageSources'
            this.setState({ showModal: !this.state.showModal, modalContent }, () => {
                setTimeout(() => {
                    resolve(true)
                }, 500)
            })
        })

        if (reset) this.resetModalOptions()
    }

    resetModalOptions() {
        const { attachment, type } = this.initialState
        this.setState({ attachment, type })
    }

    //1.
    async handleSelectOption(elements, index) {

        this.setState({ modalLoading: true })
        const { modalContent } = this.state

        if (modalContent === 'docTypes')
            this.configDocTypes(index)

        else if (modalContent === 'docSources')
            this.configDocSources(index)

        else if (modalContent === 'imageSources')
            await this.configImageSources(index)

        else if (modalContent === 'genOrderSources' || modalContent === 'genFicheEEBSources' || modalContent === 'genFormSources')
            this.startGenPdf(index)

        this.setState({ modalLoading: false })
    }

    //2.
    configDocTypes(index) {
        const type = this.types[index].value
        this.setState({ type })
        let isGenerable = generableDocTypes.includes(type)
        const isOnlyImportable = onlyImportableDocTypes.includes(type)

        if (isOnlyImportable) this.configImageSources(1)

        else {
            if (isGenerable) this.setState({ modalContent: 'docSources' })
            else this.setState({ modalContent: 'imageSources' })
        }
    }

    //3.
    configDocSources(index) {
        const attachmentSource = index === 0 ? 'upload' : 'generation'
        this.setState({ attachmentSource })
        if (attachmentSource === 'upload')
            this.setState({ modalContent: 'imageSources' })
        else {
            const { type } = this.state
            //if (type === 'Facture' || type === 'Devis' || type === "Offre précontractuelle")
            if (type === "Offre précontractuelle")
                this.setState({ modalContent: 'genOrderSources' })
            if (type === 'Fiche EEB')
                this.setState({ modalContent: 'genFicheEEBSources' })
            if (type === 'PV réception' || type === 'Mandat Synergys')
                this.setState({ modalContent: 'genFormSources' })
            else if (type === 'Mandat MaPrimeRénov' || type === "Visite technique")
                this.startGenPdf(1)
        }
    }

    //3.1 Images
    async configImageSources(index, noToggle) {
        const isCamera = index === 0
        const result = await this.setAttachment(isCamera)
        const { attachment, error } = result
        if (error) displayError(error)
        else this.setState({ attachment, attachmentError: "", orderData: null })
        if (noToggle) return
        this.toggleModal()
    }

    async setAttachment(isCamera) {
        try {
            let attachment = null
            if (isCamera) {
                const attachments = await pickImage([], true, false)
                if (attachments.length === 0) throw new Error("ignore")
                attachment = attachments[0]
            }
            else attachment = await this.pickDoc()
            if (!attachment) throw new Error("ignore")
            attachment = await this.handleImageToPdfConversion(attachment)
            return { attachment }
        }

        catch (error) {
            return { error }
        }
    }

    async pickDoc() {
        try {
            const attachment = await pickDoc(true, [DocumentPicker.types.pdf, DocumentPicker.types.images])
            return attachment
        }
        catch (e) {
            const { message } = e
            displayError({ message })
        }
    }

    async handleImageToPdfConversion(attachment) {
        const isImage = attachment.type.includes('image/')
        if (!isImage) return attachment
        try {
            this.setState({ modalLoading: true })
            const pdfBase64 = await convertImageToPdf(attachment)
            const fileName = `Scan-${moment().format('DD-MM-YYYY-HHmmss')}.pdf`
            const destPath = await saveFile(pdfBase64, fileName, 'base64')
            attachment.path = destPath
            attachment.name = fileName
            return attachment
        }
        catch (e) {
            throw new Error(e)
        }
        finally {
            this.setState({ modalLoading: false })
        }
    }

    //3.2 Generation
    async startGenPdf(index) {

        const { type, project } = this.state

        let navParams = {
            autoGenPdf: true,
            docType: type,
            DocumentId: this.DocumentId,
            project,
            isConversion: false,
            isRoot: false,
            onGoBack: this.getGenPdf
        }

        const config = docsConfig(index)
        const { genNavigation } = config[type]
        navParams = { ...navParams, ...genNavigation }
        const navScreen = index === 0 ? navParams.listScreen : navParams.creationScreen

        await this.toggleModal()
        this.props.navigation.navigate(navScreen, navParams)
    }

    convertProposalToBill() {
        const { orderData } = this.state
        const navParams = {
            order: orderData,
            docType: 'Facture',
            DocumentId: generateId('GS-DOC-'),
            isConversion: true,
            onGoBack: this.getGenPdf
        }
        this.props.navigation.navigate('PdfGeneration', navParams)
    }

    getGenPdf(genPdf) {
        const {
            pdfBase64Path: path,
            pdfName: name,
            order: orderData,
            isConversion,
            DocumentId
        } = genPdf

        //#todo: order is specific to OP/facture
        //order: The order from which this "OP" was generated
        //isConversion: Conversion from OP to Facture (boolean)
        const attachment = {
            path,
            type: 'application/pdf',
            name,
            size: 100,
            downloadURL: "",
            progress: 0,
        }

        this.setState({ attachment, orderData: orderData || null }, () => {
            if (!isConversion) return
            //Handle conversion
            this.handleSubmit(isConversion, DocumentId)
        })
    }

    //********************************************************************************************************************* */
    //Signature
    renderSignees() {
        const { signatures } = this.state

        return signatures.map((signature, index) => {
            const { signedAt, signedBy } = signature
            const signDate = moment(signedAt).format('ll')
            const signTime = moment(signedAt).format('HH:mm')

            return (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 15 }}>
                    <CustomIcon icon={faFileSignature} size={21} color={theme.colors.placeholder} />
                    <View>
                        <Text numberOfLines={1} style={[theme.customFontMSregular.body, { marginLeft: 15 }]}>
                            <Text style={[theme.customFontMSregular.body, { color: theme.colors.primary }]}>{signedBy.fullName} </Text>
                            a signé le document</Text>
                        <Text style={[theme.customFontMSregular.caption, { marginLeft: 15, color: theme.colors.placeholder }]}>le {signDate} à {signTime}</Text>
                    </View>
                </View>
            )
        })
    }

    //1. Footer (action buttons)
    renderFooter(isConnected, upload, sign, quoteToBillConversion) {
        const isSingleButtonShown = !upload.show && !quoteToBillConversion.show || !sign.show && !quoteToBillConversion.show
        return (
            <View style={{ flexDirection: "row", paddingHorizontal: theme.padding, justifyContent: isSingleButtonShown ? 'flex-end' : "space-between" }}>
                {quoteToBillConversion.show && this.renderFooterButton("conversion", "Convertir en facture", quoteToBillConversion.allow, isConnected)}
                {sign.show && this.renderFooterButton("sign", "Signer", sign.allow, isConnected)}
                {upload.show && this.renderFooterButton("upload", "Importer", upload.allow, isConnected)}
            </View>
        )
    }

    renderFooterButton(type, title, enable, isConnected) {
        const backgroundColor = enable ? theme.colors.primary : "#f2f3f5"
        const color = enable ? "#fff" : theme.colors.gray_medium

        return (
            <Button
                mode="contained"
                style={{ backgroundColor }}
                onPress={() => this.onPressFooterButton(type, isConnected, this.DocumentId, enable, isConnected)}>
                <Text style={[theme.customFontMSmedium.caption, { color }]}>
                    {title}
                </Text>
            </Button>
        )
    }

    onPressFooterButton(type, isConnected, DocumentId, enable) {
        //if (!enable) return

        if (type === "upload") {
            this.handleSubmit(false, DocumentId)
        }
        if (type === "sign") {
            this.navigateToSignature(true, isConnected)
        }
        if (type === "conversion") {
            this.convertProposalToBill(isConnected, true)
        }
    }

    setAllowedActions(canWrite) {
        const { type, orderData, attachment } = this.state

        const isGeneratedQuote = (type === 'Devis' || type === "Offre précontractuelle") && orderData !== null //orderData existing means OP was generated

        const isAttachmentSelected = attachment !== null
        const noDownloadUrl = isAttachmentSelected && (attachment.downloadURL === "" || attachment.downloadURL === undefined)
        const isDownloadUrl = isAttachmentSelected && (attachment.downloadURL !== "" && attachment.downloadURL !== undefined)
        const isAttachmentLocal = isAttachmentSelected && noDownloadUrl
        const isAttachmentRemote = isAttachmentSelected && isDownloadUrl && !attachment.pending

        //Actions autorization
        const allowSign = isAttachmentRemote && (canWrite || this.props.role.id === 'client')
        const allowUpload = isAttachmentLocal && canWrite
        const allowQuoteToBillConversion = isGeneratedQuote && isAttachmentRemote && this.isHighrole && canWrite

        //Show buttons
        const showSign = allowSign
        const showUpload = attachment === null || isAttachmentLocal
        const showQuoteToBillConversion = allowQuoteToBillConversion

        const upload = { show: showUpload, allow: allowUpload }
        const sign = { show: showSign, allow: allowSign }
        const quoteToBillConversion = { show: showQuoteToBillConversion, allow: allowQuoteToBillConversion }

        return { upload, sign, quoteToBillConversion }
    }

    //##Main renderers (2 models)
    renderProcessView(canWrite, isConnected) {

        const { modalContent, showModal, modalLoading, attachmentError } = this.state
        const { title, columns, elements } = this.modalOptionsConfig()
        const { upload, sign, quoteToBillConversion } = this.setAllowedActions(canWrite)

        return (
            <View style={{ flex: 1, paddingHorizontal: theme.padding }}>
                <View style={{ flex: 1 }}>
                    {this.renderAttachment(canWrite, true)}
                    {attachmentError !== "" &&
                        <Text style={[theme.customFontMSregular.caption, { color: theme.colors.error, marginTop: 3, alignSelf: "center" }]}>
                            {attachmentError}
                        </Text>
                    }
                </View>

                {this.renderFooter(isConnected, upload, sign, quoteToBillConversion)}

                <ModalOptions
                    title={title}
                    columns={columns}
                    isLoading={modalLoading}
                    modalStyle={{ marginTop: modalContent === 'docTypes' ? 0 : constants.ScreenHeight * 0.5 }}
                    isVisible={showModal}
                    toggleModal={() => this.toggleModal()}
                    elements={elements}
                    autoValidation={true}
                    handleSelectElement={async (elements, index) => this.handleSelectOption(elements, index)}
                />
            </View>
        )
    }

    renderStandardView(canWrite, isConnected) {
        const {
            modalContent,
            showModal,
            modalLoading,
            project,
            name,
            attachment,
            type,
            signatures,
            createdBy,
            createdAt,
            editedBy,
            editedAt,
            loading,
            nameError,
            projectError,
            attachmentError,
            toastMessage,
            toastType
        } = this.state

        const showSignatures = signatures.length > 0
        const showAttachmentField = project.id !== ""
        const showType = type !== '' && project.id !== "" && attachment !== null
        const { title, columns, elements } = this.modalOptionsConfig()
        const { upload, sign, quoteToBillConversion } = this.setAllowedActions(canWrite)

        return (
            <View style={{ flex: 1 }}>

                <ScrollView
                    style={{ flex: 0.8 }}
                    keyboardShouldPersistTaps="never"
                    contentContainerStyle={{ backgroundColor: theme.colors.white, paddingBottom: theme.padding }}
                >
                    <View>
                        {showSignatures &&
                            <FormSection
                                sectionTitle='Signatures'
                                sectionIcon={faSignature}
                                form={
                                    <View style={{ flex: 1, backgroundColor: theme.colors.white }}>
                                        {this.renderSignees()}
                                    </View>
                                }
                            />
                        }

                        <FormSection
                            sectionTitle='Informations générales'
                            sectionIcon={faInfoCircle}
                            form={
                                <View style={{ flex: 1, backgroundColor: theme.colors.white }}>
                                    {this.isEdit &&
                                        <MyInput
                                            label="Numéro du document"
                                            returnKeyType="done"
                                            value={this.DocumentId}
                                            editable={false}
                                            disabled
                                        />
                                    }

                                    <ItemPicker
                                        onPress={() => {
                                            if (this.project || this.isEdit || loading) return //pre-defined project
                                                this.props.navigation.navigate('ProjectsStack', {
                                                    screen: 'ListProjects',
                                                    params: {
                                                        onGoBack: this.refreshProject,
                                                        isRoot: false,
                                                        prevScreen: 'UploadDocument',
                                                        titleText: 'Choix du projet',
                                                        showFAB: false
                                                    }
                                                })
                                        }}
                                        label="Projet concerné *"
                                        value={project.name}
                                        error={!!projectError}
                                        errorText={projectError}
                                        editable={canWrite}
                                        showAvatarText={false}
                                    />


                                    {showAttachmentField &&
                                        <View>
                                            {this.renderAttachment(canWrite, false)}
                                            {attachmentError !== "" &&
                                                <Text style={[theme.customFontMSregular.caption, { color: theme.colors.error, marginTop: 3 }]}>
                                                    {attachmentError}
                                                </Text>
                                            }
                                        </View>
                                    }

                                    {showType &&
                                        <MyInput
                                            label="Type *"
                                            returnKeyType="done"
                                            value={type}
                                            editable={false}
                                            disabled
                                        />
                                    }

                                    <MyInput
                                        label="Nom du document *"
                                        returnKeyType="done"
                                        value={name}
                                        onChangeText={name => this.setState({ name, nameError })}
                                        error={!!nameError}
                                        errorText={nameError}
                                        //multiline={true}
                                        editable={canWrite}
                                    />

                                    <ModalOptions
                                        title={title}
                                        columns={columns}
                                        isLoading={modalLoading}
                                        modalStyle={{ marginTop: modalContent === 'docTypes' ? constants.ScreenHeight * 0.05 : constants.ScreenHeight * 0.5 }}
                                        isVisible={showModal}
                                        toggleModal={() => this.toggleModal()}
                                        elements={elements}
                                        autoValidation={true}
                                        handleSelectElement={async (elements, index) => this.handleSelectOption(elements, index)}
                                    />

                                </View>
                            }
                        />

                        {this.isEdit &&
                            <ActivitySection
                                createdBy={createdBy}
                                createdAt={createdAt}
                                editedBy={editedBy}
                                editedAt={editedAt}
                                navigation={this.props.navigation}
                            />
                        }

                    </View>
                </ScrollView>

                {this.renderFooter(isConnected, upload, sign, quoteToBillConversion)}

                <Toast
                    message={toastMessage}
                    type={toastType}
                    onDismiss={() => this.setState({ toastMessage: '' })} />
            </View>
        )
    }

    //##HELPERS
    navigateToSignature(signMode, isConnected) {
        if (signMode) {
            if (!isConnected) {
                Alert.alert('', 'La signature digitale est indisponible en mode hors-ligne.')
                return
            }
        }

        const { project, type, attachment, attachmentSource } = this.initialState

        const onGoBack = () => {
            if (this.onGoBack) this.onGoBack()
            else this.initEditMode(this.DocumentId)
        }

        var params = {
            onGoBack,
            ProjectId: project.id,
            DocumentId: this.DocumentId,
            DocumentType: type,
            fileName: attachment.name,
            url: attachment.downloadURL,
            onSignaturePop: this.onSignaturePop,
            attachmentSource
        }

        if (signMode)
            params.initMode = 'sign'

        this.props.navigation.navigate("Signature", params)
    }

    render() {
        const { type, createdBy, initialLoading, loading, docNotFound, loadingConversion } = this.state
        const { network, permissions } = this.props
        const { isConnected } = network
        let { canCreate, canUpdate, canDelete } = permissions.documents
        canUpdate = canUpdate || this.props.role.id === 'client' && createdBy.id === auth.uid
        console.log("canCreate/////", canCreate)
        const canWrite = (canUpdate && this.isEdit || canCreate && !this.isEdit) && !loading
        canDelete = canDelete && this.isEdit && !loading

        const titleText = loading ? 'Importation du document...' : (this.isProcess ? type : (this.isEdit ? 'Modifier le document' : 'Nouveau document'))

        if (initialLoading)
            return (
                <View style={styles.container}>
                    <Appbar close title titleText='Chargement du document...' />
                    <Loading />
                </View>
            )

        if (docNotFound)
            return (
                <View style={styles.container}>
                    <Appbar close title titleText='Modifier le document' />
                    <EmptyList icon={faTimes} header='Document introuvable' description="Le document est introuvable dans la base de données. Il se peut qu'il ait été supprimé." offLine={!isConnected} />
                </View>
            )

        else if (loadingConversion)
            return (
                <View style={styles.container}>
                    <Appbar close title titleText='Importation du document...' />
                    <LoadDialog loading={loadingConversion} message="Conversion du document en cours. Veuillez patienter..." />
                </View>
            )

        else return (
            <View style={styles.container}>
                <Appbar
                    close 
                    title
                    titleText={titleText}
                    loading={loading}
                    // check={canWrite && !this.isProcess}
                    // handleSubmit={() => this.handleSubmit(false, this.DocumentId)}
                    del={canDelete}
                    handleDelete={this.showAlert}
                     />

                {this.isProcess ?
                    this.renderProcessView(canWrite, isConnected)
                    :
                    this.renderStandardView(canWrite, isConnected)
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
        documents: state.documents,
        currentUser: state.currentUser
        //fcmToken: state.fcmtoken
    }
}

export default connect(mapStateToProps)(UploadDocument)

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.white
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
    },
    viewDocumentButton: {
        textAlign: 'center',
        color: theme.colors.primary
    },
    footerContainer: {
        flex: 0.1,
        flexDirection: 'row',
        borderColor: theme.colors.gray100,
        borderWidth: 1,
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        paddingLeft: constants.ScreenWidth * 0.025,
        backgroundColor: 'white'
    },
    bottomButton: {
        position: "absolute",
        right: theme.padding,
        bottom: 0,
        width: constants.ScreenWidth * 0.4,
    },
})

const modalStyles1 = StyleSheet.create({
    modal: {
        width: constants.ScreenWidth,
        marginTop: constants.ScreenHeight * 0.6,
        marginHorizontal: 0,
        marginBottom: 0,
        borderTopLeftRadius: constants.ScreenWidth * 0.03,
        borderTopRightRadius: constants.ScreenWidth * 0.03,
    },
    container: {
        flex: 1,
        paddingTop: constants.ScreenHeight * 0.02,
        backgroundColor: '#fff',
        borderTopLeftRadius: constants.ScreenWidth * 0.03,
        borderTopRightRadius: constants.ScreenWidth * 0.03,
    },
    buttonsContainer: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#fff',
    },
    column: {
        flex: 0.5,
        justifyContent: 'center',
        alignItems: 'center'
    }
})

const modalStyles2 = StyleSheet.create({
    modal: {
        width: constants.ScreenWidth,
        marginTop: constants.ScreenHeight * 0.3,
        marginHorizontal: 0,
        marginBottom: 0,
        borderTopLeftRadius: constants.ScreenWidth * 0.03,
        borderTopRightRadius: constants.ScreenWidth * 0.03,
    },
    container: {
        flex: 1,
        paddingTop: constants.ScreenHeight * 0.02,
        backgroundColor: '#fff',
        borderTopLeftRadius: constants.ScreenWidth * 0.03,
        borderTopRightRadius: constants.ScreenWidth * 0.03,
    },
    buttonsContainer: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#fff',
    },
    column: {
        flex: 0.5,
        justifyContent: 'center',
        alignItems: 'center'
    }
})



//OLD
// customBackHandler() {
//     const { loading, uploading } = this.state

//     if (loading || uploading) {
//         this.uploadTask.pause()

//         const title = "Annuler l'opération"
//         const message = "Êtes-vous sûr(e) de vouloir annuler l'exportation du document. Toutes les nouvelles données saisies seront perdues."

//         const handleConfirm = () => {
//             this.uploadTask.cancel()
//             this.props.navigation.goBack()
//         }

//         const handleCancel = () => this.uploadTask.resume()

//         this.myAlert(title, message, handleConfirm, handleCancel)
//     }

//     else this.props.navigation.goBack(null)
//     return true
// }



//OLD
   // async deleteAttachment(docURL) {
    //     let fileRef = firebase.storage().refFromURL(docURL)
    //     await fileRef.delete()
    //         .then(() => console.log('File deleted from cloud storage'))
    //         .catch(e => console.error(e))
    // }

    // pickFile() {
    //     FilePickerManager.showFilePicker(null, (response) => {
    //         console.log('Response = ', response)

    //         if (response.didCancel) {
    //             console.log('User cancelled file picker');
    //         }
    //         else if (response.error) {
    //             console.log('FilePickerManager Error: ', response.error);
    //         }
    //         else {
    //             const attachment = {
    //                 path: response.path,
    //                 type: response.type,
    //                 name: `Scan ${moment().format('DD-MM-YYYY HHmmss')}.pdf`,
    //                 //name: response.fileName,
    //                 size: response.readableSize,
    //                 progress: 0
    //             }

    //             this.setState({ attachment, attachmentError: '' })
    //         }
    //     })
    // }