import React, { Component } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Keyboard, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { List } from 'react-native-paper'
import _ from 'lodash'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { faInfoCircle, faQuoteRight, faTasks, faFolder, faImage, faTimes, faChevronRight, faFileAlt, faCheckCircle, faEye, faArrowRight, faRedo, faAddressBook, faEuroSign, faRetweet, faUser } from '@fortawesome/free-solid-svg-icons'
import ImageView from 'react-native-image-view'
import { SliderBox } from "react-native-image-slider-box"
import { connect } from 'react-redux'

import moment from 'moment';
import 'moment/locale/fr'
moment.locale('fr')

import ActivitySection from '../../containers/ActivitySection';
import { Appbar, UploadProgress, FormSection, CustomIcon, TextInput as MyInput, ItemPicker, AddressInput, Picker, SquarePlus, Toast, Loading, EmptyList } from '../../components'

import firebase, { db } from '../../firebase'
import * as theme from "../../core/theme";
import { constants, highRoles, workTypes, errorMessages, latestProcessVersion, techSteps, phases } from "../../core/constants";
import { blockRoleUpdateOnPhase } from '../../core/privileges';
import { generateId, navigateToScreen, myAlert, nameValidator, load, pickImage, isEditOffline, refreshClient, refreshComContact, refreshTechContact, refreshAddress, setAddress, formatDocument, unformatDocument, displayError, initFormSections, docType_LabelValueMap } from "../../core/utils";

import { uploadFiles } from "../../api/storage-api";
import ModalCheckBoxes from '../../components/ModalCheckBoxes';
import { setAppToast } from '../../core/redux';

const states = [
    { label: 'En attente', value: 'En attente' },
    { label: 'En cours', value: 'En cours' },
    { label: 'Terminé', value: 'Terminé' },
    { label: 'Annulé', value: 'Annulé' },
]

const properties = ["client", "name", "note", "address", "state", "step", "color", "comContact", "techContact", "intervenant", "bill", "attachments", "process", "createdBy", "createdAt", "editedBy", "editedAt"]

const sectionsModels = {
    project: {
        activity: {
            isExpanded: false,
            show: false,
            fields: {}
        },
        info: {
            isExpanded: false,
            show: false,
            fields: {
                projectId: { show: false },
                projectName: { show: false },
                projectStep: { show: false },
                projectState: { show: false },
                projectPhase: { show: false },
                projectWorkTypes: { show: false }
            }
        },
        client: {
            isExpanded: false,
            show: false,
            fields: {
                client: { show: false },
                address: { show: false }
            }
        },
        contacts: {
            isExpanded: false,
            show: false,
            fields: {
                com: { show: false },
                tech: { show: false }
            }
        },
        documents: {
            isExpanded: false,
            show: false,
            fields: {
                documents: { show: false }
            }
        },
        tasks: {
            isExpanded: false,
            show: false,
            fields: {
                tasks: false
            }
        },
        billing: {
            isExpanded: false,
            show: false,
            fields: {
                billAmount: { show: false },
                billAids: { show: false },
            }
        },
        pictures: {
            isExpanded: false,
            show: false,
            fields: {}
        },
        notes: {
            isExpanded: false,
            show: false,
            fields: {
                notes: { show: false }
            }
        }
    }
}


class CreateProject extends Component {
    constructor(props) {
        super(props)
        //  this.fetchDocs = fetchDocs.bind(this)
        this.refreshClient = refreshClient.bind(this)
        this.refreshComContact = refreshComContact.bind(this)
        this.refreshTechContact = refreshTechContact.bind(this)
        this.refreshAddress = refreshAddress.bind(this)
        this.setAddress = setAddress.bind(this)
        this.customBackHandler = this.customBackHandler.bind(this)

        this.handleSubmit = this.handleSubmit.bind(this)
        this.handleDeleteProject = this.handleDeleteProject.bind(this)
        this.handleDeleteImage = this.handleDeleteImage.bind(this)
        this.handleRefresh = this.handleRefresh.bind(this)
        //this.deleteAttachments = this.deleteAttachments.bind(this)

        this.myAlert = myAlert.bind(this)
        this.uploadFiles = uploadFiles.bind(this)
        this.showAlert = this.showAlert.bind(this)
        this.pickImage = this.pickImage.bind(this)

        this.initialState = {}
        this.isInit = true

        //User/Role
        this.currentUser = firebase.auth().currentUser
        this.isCurrentHighRole = highRoles.includes(this.props.role.id)
        this.isClient = this.props.role.id === 'client'

        // Accès aux paramètres de navigation avec React Navigation v5/v6
        this.projectParam = this.props.route?.params?.project || '';
        this.ProjectId = this.props.route?.params?.ProjectId || this.projectParam.id || "";
        this.isEdit = this.ProjectId !== "";
        this.ProjectId = this.isEdit ? this.ProjectId : generateId('GS-PR-');
        this.title = this.isEdit ? 'Modifier le projet' : 'Nouveau projet';

        // Pré-remplir les champs
        this.client = this.props.route?.params?.client || { id: '', fullName: '', email: '', role: '', phone: "" };
        this.address = this.props.route?.params?.address || { description: '', place_id: '', marker: { latitude: '', longitude: '' }, error: '' };
        this.comContact = this.props.role.id === "com" && !this.isEdit ? this.props.currentUser : { id: '', fullName: '', email: '', role: '' };
        this.sections = this.props.route?.params?.sections || null; // Exemple : { info: { projectWorkTypes: true } }

        //onSubmit, Go back if goBackConditions elements are not null
        const goBackConditions = [this.sections]
        this.isGoBack = !goBackConditions.includes(null)

        const showClient = !this.isClient && (this.client.id === "" || this.isEdit)
        const showAddress = !this.isClient && (this.client.id === "" || this.isEdit)
        const sections = initFormSections(sectionsModels.project, this.sections)

        const defaultSections = {
            activity: {
                isExpanded: !this.isEdit,
                show: this.isEdit,
                fields: {}
            },
            info: {
                isExpanded: !this.isEdit,
                show: true,
                fields: {
                    projectId: { show: this.isEdit },
                    projectName: { show: true },
                    projectStep: { show: !this.isClient },
                    projectState: { show: !this.isClient && this.isEdit },
                    projectPhase: { show: this.isClient },
                    projectWorkTypes: { show: true }
                }
            },
            client: {
                isExpanded: !this.isEdit,
                show: showClient && showAddress,
                fields: {
                    client: { show: showClient },
                    address: { show: showAddress }
                }
            },
            contacts: {
                isExpanded: !this.isEdit,
                show: this.comContact.id === "" || this.isEdit,
                fields: {
                    com: { show: true },
                    tech: { show: this.isEdit }
                }
            },
            documents: {
                isExpanded: !this.isEdit,
                show: this.isEdit,
                fields: {
                    documents: { show: true }
                }
            },
            tasks: {
                isExpanded: !this.isEdit,
                show: false,
                fields: {
                    tasks: true
                }
            },
            billing: {
                isExpanded: !this.isEdit,
                show: this.isEdit,
                fields: {
                    billAmount: { show: true },
                    billAids: { show: true },
                }
            },
            pictures: {
                isExpanded: !this.isEdit,
                show: true,
                fields: {}
            },
            notes: {
                isExpanded: !this.isEdit,
                show: true,
                fields: {
                    notes: { show: true }
                }
            }
        }

        this.state = {
            //TEXTINPUTS
            name: "",
            nameError: "",
            workTypes,
            note: "",

            //Screens
            address: this.address,
            client: this.client,

            //Pickers
            state: 'En cours',
            step: 'Prospect',
            color: theme.colors.primary,

            comContact: this.comContact,
            techContact: { id: '', fullName: '', email: '', role: '' },
            intervenant: null,

            //Billing
            bill: {
                amount: '',
                amountHT: '',
                customerPayment: '',
                financingPayment: "",
                MPRPayment: "",
                CEEPayment: "",
                closedAt: '',
                closedBy: {
                    id: '',
                    fullName: '',
                    email: '',
                    role: ''
                }
            },
            //logs (Auto-Gen)
            createdAt: '',
            createdBy: { id: '', fullName: '' },
            editedAt: '',
            editedBy: { id: '', fullName: '' },

            //Images
            newAttachments: [],
            attachments: [],
            isImageViewVisible: false,
            imageIndex: 0,
            imagesView: [],
            imagesCarousel: [],

            //Documents
            documentsList: [],
            documentTypes: [],
            expandedId: '',

            //Tasks
            tasksList: [],
            taskTypes: [],
            expandedTaskId: '',
            hasPriorTechVisit: false,
            hasPriorTechVisitError: '',

            error: '',
            loading: true,
            uploading: false,
            docNotFound: false,

            //Specific privileges (poseur & commercial)
            isBlockedUpdates: false,

            isModalCheckBoxesVisible: false,
            scrollViewRef: null,
            sections: this.sections ? sections : defaultSections,
        }


    }

    //Requires bill amount (from backend)s
    async componentDidMount() {
        if (this.isEdit) await this.initEditMode()
        else this.setWorkTypes()
        this.initialState = _.cloneDeep(this.state)
        this.setState({ loading: false })
    }

    initSectionsExpansion() {
        let { sections } = this.state
        for (const key in sections) {
            sections[key].isExpanded = false
        }
        this.setState({ sections })
    }

    async initEditMode(localProject) {
        this.isEdit = true
        this.title = 'Modifier le projet'
        if (!this.sections)
            this.initSectionsExpansion()

        const query = db.collection("Projects").doc(this.ProjectId)
        return new Promise((resolve, reject) => {
            query.get().then(async (doc) => {
                if (!doc.exists && !localProject) return null
                let project = localProject || doc.data()
                project.id = doc.id
                this.project = _.pick(project, ['id', 'name', 'client', 'step', 'comContact', 'techContact', 'intervenant', 'address', 'workTypes'])
                project = this.setProject(project)
                if (!project) return null
                this.setImageCarousel(project.attachments)
                this.configUserAccess(project.step)
                await this.fetchOtherData()
                resolve(true)
            })
        })
    }

    setProject(project) {
        if (!project)
            this.setState({ docNotFound: true })

        else {
            this.setWorkTypes(project)
            project = formatDocument(project, properties, [])
            this.setState(project)
        }
        return project
    }

    setWorkTypes(project) {
        let { workTypes } = this.state

        for (let wt of workTypes) {
            if (this.isEdit) {
                if (project.workTypes && project.workTypes.includes(wt.value))
                    wt.selected = true
            }
            else wt.selected = false
        }

        this.setState({ workTypes })
    }

    setImageCarousel(attachments) {
        if (typeof (attachments) === 'undefined' || attachments && attachments.length === 0) return
        attachments = attachments.filter((image) => !image.deleted)
        const imagesView = attachments.map((image) => { return ({ source: { uri: image.downloadURL } }) })
        const imagesCarousel = attachments.map((image) => image.downloadURL)
        this.setState({ imagesView, imagesCarousel })
    }

    configUserAccess(step) {
        const currentRole = this.props.role.id
        const isBlockedUpdates = blockRoleUpdateOnPhase(currentRole, step)
        this.setState({ isBlockedUpdates })
    }

    async fetchOtherData() {
        await this.fetchDocuments()
        await this.fetchTasks()
    }

    fetchDocuments() {
        const query = db
            .collection('Documents')
            .where('deleted', '==', false)
            .where('project.id', '==', this.ProjectId)
            .orderBy('createdAt', 'DESC')

        return query.get().then((querysnapshot) => {
            if (querysnapshot.empty) return
            let documentsList = []
            let documentTypes = []
            querysnapshot.forEach((doc) => {
                let document = doc.data()
                document.id = doc.id
                documentsList.push(document)
                documentTypes.push(document.type)
            })
            documentTypes = [...new Set(documentTypes)]
            this.setState({ documentsList, documentTypes })
        })
    }

    fetchTasks() {
        const query = db.collection('Agenda').where('project.id', '==', this.ProjectId)
        return query.get().then((agendaSnapshot) => {
            if (agendaSnapshot.empty) return
            let tasksList = []
            let taskTypes = []
            agendaSnapshot.forEach(async (taskDoc) => {
                const task = taskDoc.data()
                //task.id = taskDoc.id
                task.date = taskDoc.dateKey
                tasksList.push(task)
                taskTypes.push(task.type)
                taskTypes = [...new Set(taskTypes)]
                this.setState({ tasksList, taskTypes })
            })
        })
    }

    //Inputs validation
    validateInputs(isConnected) {
        let { client, name, address, comContact, techContact, step, hasPriorTechVisit } = this.state

        const isStepTech = techSteps.includes(step)
        const clientError = nameValidator(client.fullName, '"Client"')
        const nameError = nameValidator(name, '"Nom du projet"')
        const comContactError = nameValidator(comContact.id, '"Contact commercial"')
        //const techContactError = isStepTech ? nameValidator(techContact.id, '"Contact technique"') : ''
        const addressError = '' //Address optional on offline mode
        //var addressError = isConnected ? nameValidator(address.description, '"Emplacemment"') : '' //Address optional on offline mode
       // const hasPriorTechVisitError = this.isEdit ? "" : hasPriorTechVisit ? "" : "La création d'une visite technique préalable est obligatoire."

        if (clientError || nameError || addressError || comContactError) {
            client.error = clientError
            comContact.error = comContactError
            // techContact.error = techContactError
            address.error = addressError
            this.setState({ client, nameError, address, comContact, techContact, loading: false })
            const toast = { message: errorMessages.invalidFields, type: "error" }
            setAppToast(this, toast)
            return false
        }

        return true
    }

    //#OOS
    async handleSubmit() {
    Keyboard.dismiss();

    const { loading, newAttachments, workTypes } = this.state;
    const { isConnected } = this.props.network;

    // Prevent submission if loading or no state changes
    if (loading || _.isEqual(this.state, this.initialState)) return;

    load(this, true);

    // Check offline edit
    const isEditOffLine = isEditOffline(this.isEdit, isConnected);
    if (isEditOffLine) {
        load(this, false);
        return;
    }

    // Validate inputs
    const isValid = this.validateInputs(isConnected);
    if (!isValid) {
        load(this, false);
        return;
    }

    let attachments = [...this.initialState.attachments];

    // Upload files if online
    if (isConnected && newAttachments.length > 0) {
        try {
            this.setState({ uploading: true });
            this.title = "Importation des images...";
            const storageRefPath = `/Projects/${this.ProjectId}/Images/`;
            const uploadedImages = await this.uploadFiles(newAttachments, storageRefPath);

            if (uploadedImages) {
                attachments = attachments.concat(uploadedImages);
                this.setImageCarousel(attachments);
                this.setState({ attachments, newAttachments: [] });
            } else {
                setAppToast(this, { message: errorMessages.documents.upload, type: "error" });
            }
        } catch (error) {
            console.error("File upload error:", error);
            setAppToast(this, { message: "Erreur lors de l'importation des fichiers.", type: "error" });
        } finally {
            this.setState({ uploading: false });
        }
    }

    // Prepare project data
    const props = ["name", "client", "note", "state", "step", "address", "color", "bill", "comContact", "techContact", "intervenant"];
    const project = unformatDocument(this.state, props, this.props.currentUser, this.isEdit);
    project.attachments = attachments;
    project.processVersion = latestProcessVersion;
    project.workTypes = workTypes.filter((wt) => wt.selected).map((wt) => wt.value);

    // Persist project data
    await this.persistData({ project, process: { version: latestProcessVersion } });

    // Toast notification
    const toastMessage = this.isEdit ? "Le projet a été modifié" : "Le projet a été crée.";
    setAppToast(this, { message: toastMessage, type: "info" });

    load(this, false);

    // Navigation handling
    if (!this.isEdit) {
        this.props.navigation.replace("Process", { ProjectId: this.ProjectId });
    }
  else{
        const onGoBack = this.props.route.params?.onGoBack;
        if (onGoBack) onGoBack();
        this.props.navigation.goBack();
    }
}


    persistData(data) {
        const { project, process } = data
        const batch = db.batch()
        const projectRef = db.collection('Projects').doc(this.ProjectId)
        const processRef = projectRef.collection("Process").doc(this.ProjectId)
        const clientRef = db.collection('Clients').doc(project.client.id)
        batch.set(projectRef, project, { merge: true })
        batch.set(processRef, process, { merge: true })
        if (!this.isEdit) {
            batch.update(clientRef, { isProspect: false }) //For offline support
        }
        batch.commit()
        //Trigger Function should be now running to create user account for the client...
    }

    showAlert() {
        const title = "Supprimer le projet"
        const message = 'Etes-vous sûr de vouloir supprimer ce projet ? Cette opération est irreversible.'
        const handleConfirm = () => this.handleDeleteProject()
        this.myAlert(title, message, handleConfirm)
    }

    //#OOS
    async handleDeleteProject() {
    try {
        load(this, true); // Start loading
        await db.collection('Projects').doc(this.ProjectId).update({ deleted: true }); // Perform the deletion
        // this.props.navigation.goBack();
        this.props.navigation.navigate('ListProjects', {onGoBack: this.refreshAddress,isRoot:true});// Navigate back immediately after success
    } catch (error) {
        console.error('Error deleting project:', error); // Log the error for debugging
    } finally {
        load(this, false); // Stop loading, whether successful or not
    }
}


    //Delete URLs from FIRESTORE
    async handleDeleteImage(allImages, currentImage) {
        let { attachments } = this.state
        attachments[currentImage].deleted = true
        db.collection('Projects').doc(this.ProjectId).update({ attachments })
        this.setState({ attachments, isImageViewVisible: false })
    }

    async pickImage() {
        let { newAttachments } = this.state
        newAttachments = await pickImage(newAttachments)
        this.setState({ newAttachments })
    }

    async handleRefresh() {
        load(this, true)
        await this.initEditMode()
        load(this, false)
    }

    customBackHandler() {
        const { hasPriorTechVisit, tasksList } = this.state
        if (!this.isEdit && hasPriorTechVisit) {
            const title = "Abandon du projet"
            const message = 'Êtes-vous sûr de vouloir abandonner la création du projet. Les données saisies seront perdues.'
            const handleConfirm = () => {
                //Delete "Visite technique préalable"
                if (tasksList.length > 0) {
                    const taskId = tasksList[0].id
                    db.collection("Agenda").doc(taskId).delete()
                }
                this.props.navigation.goBack()
            }
            this.myAlert(title, message, handleConfirm)
        }

        else this.props.navigation.goBack()
    }

    toggleSection(sectionId) {
        let { sections } = this.state
        if (!sectionId) {
            for (const sec in sections) {
                sections[sec].isExpanded = false
            }
        }
        else sections[sectionId].isExpanded = !sections[sectionId].isExpanded
        this.setState({ sections })
    }



    renderClientField(canWrite) {
        const { client } = this.state
        return (
            <ItemPicker
                onPress={() => {
                    // navigateToScreen(
                    //     this,
                    //     'ListClients',
                    //     {
                    //         onGoBack: this.refreshClient,
                    //         prevScreen: 'CreateProject',
                    //         isRoot: false
                    //     }
                    // )

                    this.props.navigation.navigate('ClientsManagementStack', {
                        screen: 'ListClients',
                        params: {
                            onGoBack: this.refreshClient,
                            prevScreen: 'CreateProject',
                            isRoot: true
                        }
                    })
                }}
                label='Client concerné *'
                value={client.fullName}
                errorText={client.error}
                editable={canWrite && !this.isEdit && this.client.id === ""}
            />
        )
    }

    renderAddressField(address, canWrite, isConnected) {
        return (
            <AddressInput
                offLine={!isConnected}
                onPress={() => this.props.navigation.navigate('ProfileStack', {screen:'Address', params:{ onGoBack: this.refreshAddress, currentAddress: address }})}
                onChangeText={this.setAddress}
                clearAddress={() => this.setAddress('')}
                address={address}
                addressError={address.error}
                editable={canWrite}
                isEdit={this.isEdit}
            />
        )
    }

    renderComContactField(canWrite) {
        const { comContact } = this.state
        return (
            <ItemPicker
                onPress={() =>
                    this.props.navigation.navigate('AgendaStack', {
                        screen: 'ListEmployees',
                        params: {
                            onGoBack: this.refreshComContact,
                            prevScreen: 'CreateProject',
                            isRoot: false,
                            titleText: 'Choisir un commercial',
                            queryFilters: [
                                { filter: 'role', operation: '==', value: "Chargé d'affaires" },
                                { filter: 'deleted', operation: '==', value: false }
                            ]
                        }
                    })
                }
                label="Contact commercial *"
                value={comContact.fullName || ''}
                error={!!comContact.error}
                errorText={comContact.error}
                editable={canWrite && !this.isClient}
            />
        )
    }

    renderTechContact(canWrite) {
        const { techContact } = this.state
        return (
            <ItemPicker
                onPress={() =>    this.props.navigation.navigate('AgendaStack',{screen:'ListEmployees', params:{
                    onGoBack: this.refreshTechContact,
                    prevScreen: 'CreateProject',
                    isRoot: false,
                    titleText: 'Choisir un poseur',
                    query: db.collection('Users').where('role', '==', 'Équipe technique').where('deleted', '==', false)
                }})
                }
                label="Contact technique *"
                value={techContact.fullName || ''}
                error={!!techContact.error}
                errorText={techContact.error}
                editable={canWrite && highRoles.includes(this.props.role.id)}
            />
        )
    }

    renderDocumentsField(canWrite) {

        const canCreateDocument = this.props.permissions.documents.canCreate
        const { expandedId, documentTypes, documentsList } = this.state

        return (
            <View style={{ flex: 1 }}>
                {canCreateDocument && canWrite &&
                    <Text
                        onPress={() => this.props.navigation.navigate('DocumentsStack',{screen:'UploadDocument', params:{ project: this.project }})}
                        style={[theme.customFontMSregular.caption, { color: theme.colors.primary, marginBottom: 5, marginTop: 16 }]}>
                        + Ajouter un document
                    </Text>
                }

                <List.AccordionGroup
                    expandedId={expandedId}
                    onAccordionPress={(expandedId) => {
                        if (this.state.expandedId === expandedId)
                            this.setState({ expandedId: '' })
                        else
                            this.setState({ expandedId })
                    }}>
                    {documentTypes.map((type, key) => {
                        let filteredDocuments = documentsList.filter((doc) => doc.type === type)
                        return (
                            <List.Accordion
                                key={key.toString()}
                                showArrow
                                title={docType_LabelValueMap(type)}
                                id={type}
                                titleStyle={{ color: '#000' }} 
                            >
                                {this.renderAttachments(filteredDocuments, 'pdf', false)}
                            </List.Accordion>
                        )
                    })}
                </List.AccordionGroup>
            </View>
        )
    }

    renderBillAmountField(bill, canWrite) {
        return (
            <View style={{ flex: 1 }}>
                <MyInput
                    label="Montant HT facturé (€)*"
                    returnKeyType="done"
                    keyboardType='numeric'
                    value={bill.amountHT}
                    onChangeText={amountHT => {
                        bill.amountHT = amountHT
                        this.setState({ bill })
                    }}
                    editable={canWrite && this.isCurrentHighRole}
                // error={!!price.error}
                // errorText={price.error}
                />
                <MyInput
                    label="Montant TTC facturé (€)*"
                    returnKeyType="done"
                    keyboardType='numeric'
                    value={bill.amount}
                    onChangeText={amount => {
                        bill.amount = amount
                        this.setState({ bill })
                    }}
                    editable={canWrite && this.isCurrentHighRole}
                // error={!!price.error}
                // errorText={price.error}
                />
            </View>
        )
    }

    renderBillAidsPaymentsField(bill, canWrite) {
        return (
            <View style={{ flex: 1 }}>
                <MyInput
                    label="Attente paiement client"
                    returnKeyType="done"
                    keyboardType='numeric'
                    value={bill.customerPayment}
                    onChangeText={customerPayment => {
                        bill.customerPayment = customerPayment
                        this.setState({ bill })
                    }}
                    editable={canWrite && this.isCurrentHighRole}
                />
                <MyInput
                    label="Attente paiement financement"
                    returnKeyType="done"
                    keyboardType='numeric'
                    value={bill.financingPayment}
                    onChangeText={financingPayment => {
                        bill.financingPayment = financingPayment
                        this.setState({ bill })
                    }}
                    editable={canWrite && this.isCurrentHighRole}
                />
                <MyInput
                    label="Attente paiement aide MPR"
                    returnKeyType="done"
                    keyboardType='numeric'
                    value={bill.MPRPayment}
                    onChangeText={MPRPayment => {
                        bill.MPRPayment = MPRPayment
                        this.setState({ bill })
                    }}
                    editable={canWrite && this.isCurrentHighRole}
                />
                <MyInput
                    label="Attente paiement CEE"
                    returnKeyType="done"
                    keyboardType='numeric'
                    value={bill.CEEPayment}
                    onChangeText={CEEPayment => {
                        bill.CEEPayment = CEEPayment
                        this.setState({ bill })
                    }}
                    editable={canWrite && this.isCurrentHighRole}
                />
            </View>
        )
    }

    renderNotesField(canWrite) {
        const { note } = this.state
        return (
            <TextInput
                underlineColorAndroid="transparent"
                placeholder="Rapportez des notes utiles..."
                placeholderTextColor={theme.colors.gray_dark}
                numberOfLines={7}
                multiline={true}
                onChangeText={note => this.setState({ note })}
                value={note}
                style={styles.note}
                autoCapitalize='sentences'
                editable={canWrite} />
        )
    }

    renderTasksFields() {

        const {
            name,
            expandedTaskId,
            taskTypes,
            tasksList
        } = this.state
        const id = this.ProjectId

        const onPressLink1 = () => {
            this.props.navigation.navigate('Agenda', {
                isAgenda: false,
                isRoot: false,
                projectFilter: {
                    id,
                    name
                }
            })
        }

        return (
            <View style={{ flex: 1 }}>
                {this.isEdit &&
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5, marginTop: 10 }}>
                        <CustomIcon icon={faEye} color={theme.colors.primary} size={14} />
                        <Text
                            onPress={onPressLink1}
                            style={[theme.customFontMSmedium.caption, { color: theme.colors.primary, marginLeft: 5 }]}>
                            {this.props.role.level === 1 ? "Voir mon agenda pour ce projet" : "Voir le planning du projet"}
                        </Text>
                    </View>
                }

                <List.AccordionGroup
                    expandedId={expandedTaskId}
                    onAccordionPress={(expandedId) => {
                        const isExpanded = expandedTaskId === expandedId
                        this.setState({ expandedTaskId: isExpanded ? '' : expandedId })
                    }}
                >
                    {taskTypes.map((type, key) => {
                        let filteredTasks = tasksList.filter((task) => task.type === type)
                        return (
                            <List.Accordion
                                key={key.toString()}
                                id={type}
                                showArrow
                                title={type}
                                titleStyle={theme.customFontMSregular.body}
                            >
                                {this.renderTasks(filteredTasks)}
                            </List.Accordion>
                        )
                    })}
                </List.AccordionGroup>
            </View>
        )
    }

    renderPriorTechVisitField() {
        const id = this.ProjectId
        const {
            name,
            client,
            step,
            address,
            comContact,
            techContact,
            intervenant,
            hasPriorTechVisitError
        } = this.state
        const canCreateTasks = this.props.permissions.tasks.canCreate

        const onPressLink2 = () => {
            this.props.navigation.navigate('CreateTask', {
                isProcess: true,
                hideAssignedTo: true,
                project: {
                    id,
                    name,
                    client,
                    step,
                    address,
                    comContact,
                    techContact,
                    intervenant,
                },
                dynamicType: true,
                taskType: {
                    label: 'Visite technique préalable',
                    value: 'Visite technique préalable',
                    natures: ['com']
                },
                onGoBack: (refresh, task) => {
                    let { tasksList, taskTypes } = this.state
                    tasksList.push(task)
                    taskTypes.push('Visite technique préalable')
                    this.setState({
                        tasksList,
                        taskTypes,
                        hasPriorTechVisit: true
                    })
                }
            })
        }

        return (
            <ItemPicker
                onPress={onPressLink2}
                label='Créer une visite technique préalable *'
                errorText={hasPriorTechVisitError}
                editable={canCreateTasks}
            />
        )
    }

    renderProjectIdField() {
        return (
            <MyInput
                label="Numéro du projet"
                value={this.ProjectId}
                editable={false}
                disabled
            />
        )
    }

    renderProjectNameField(canWrite) {
        const { name, nameError } = this.state
        return (
            <MyInput
                label="Nom du projet *"
                value={name}
                onChangeText={name => this.setState({ name, nameError: '' })}
                error={nameError}
                errorText={nameError}
                //multiline={true}
                editable={canWrite && !this.isClient}
            // autoFocus={!this.isEdit}
            />
        )
    }

    renderProjectStepField(canWrite) {
        const { step } = this.state

        return (
            <Picker
                returnKeyType="next"
                value={step}
                error={!!step.error}
                errorText={step.error}
                selectedValue={step}
                onValueChange={(step) => this.setState({ step })}
                title="Étape *"
                elements={phases}
                enabled={canWrite && !this.isClient}
            />
        )
    }

    renderProjectStateField(canWrite) {
        const { state } = this.state
        return (
            <Picker
                returnKeyType="next"
                value={state}
                selectedValue={state}
                onValueChange={(state) => this.setState({ state })}
                title="État *"
                elements={states}
                enabled={canWrite && !this.isClient}
            />
        )
    }

    renderProjectPhaseField() {
        const { state, step } = this.state
        const phase = step + ' ' + state
        return (
            <MyInput
                label="Phase *"
                value={phase}
                // error={nameError}
                // errorText={nameError}
                multiline={true}
                editable={false}
            />
        )
    }

    renderWorkTypesField(canWrite) {
        return (
            <ModalCheckBoxes
                items={workTypes}
                itemsFetched={true}
                updateItems={(workTypes) => this.setState({ workTypes })}
                onPressItem={(item) => console.log(item)}
                editable={canWrite && !this.isClient}
                toggleModal={toggle => this.toggleModalCheckBoxes = toggle}
            />
        )
    }

    renderAttachments(newAttachments, type, isUpload) {
        let { loading } = this.state

        const onPressAttachment = (isUpload, DocumentId) => {
            if (isUpload) return
            this.props.navigation.navigate('UploadDocument', { DocumentId })
        }

        const setRightIcon = (key) => {
            const rightIconStyle = { flex: 0.15, justifyContent: 'center', alignItems: 'center' }
            return (
                <TouchableOpacity style={rightIconStyle} onPress={() => onPressRightIcon(key)}>
                    <CustomIcon
                        icon={isUpload ? faTimes : faChevronRight}
                        style={{ color: theme.colors.gray_dark }}
                        size={16}
                    />
                </TouchableOpacity>
            )
        }

        const onPressRightIcon = (key) => {
            if (!isUpload) return
            newAttachments.splice(key, 1)
            this.setState({ newAttachments })
        }

        return (
            <View style={styles.attachmentsContainer}>
                {newAttachments.map((attachment, key) => {
                    if (!isUpload) {
                        var DocumentId = attachment.id
                        attachment = attachment.attachment
                    }
                    return (
                        <UploadProgress
                            key={key.toString()}
                            attachment={attachment}
                            showRightIcon={!loading}
                            rightIcon={setRightIcon(key)}
                            onPress={() => onPressAttachment(isUpload, DocumentId)}
                            showProgress={isUpload}
                        />
                    )
                })}
                {isUpload && loading && <Loading />}
            </View>
        )

    }

    renderTasks(tasksList) {

        const onPressTask = (taskDate, TaskId) => {
            this.props.navigation.navigate('CreateTask', { isEdit: true, title: 'Modifier la tâche', TaskId, isProcess: true, hideAssignedTo: true })
        }

        return tasksList.map((task, key) => {
            return (
                <TouchableOpacity
                    key={key.toString()}
                    style={[styles.task, { backgroundColor: task.color }]}
                    onPress={() => onPressTask(task.date, task.id)}
                >
                    <View style={{ flex: 0.5, justifyContent: 'center', paddingRight: 5 }}>
                        <Text style={[theme.customFontMSregular.body, { color: '#fff' }]} numberOfLines={1}>{task.name}</Text>
                    </View>
                    <View style={{ flex: 0.5, alignItems: 'flex-end', justifyContent: 'center', paddingLeft: 5 }}>
                        <Text style={[theme.customFontMSregular.caption, { color: '#fff' }]} numberOfLines={1}>{task.assignedTo.fullName}</Text>
                    </View>
                </TouchableOpacity>
            )
        })
    }

    //SECTIONS:
    renderActivitySection(showFields, isExpanded) {
        const { createdBy, createdAt, editedBy, editedAt } = this.state
        return (
            <ActivitySection
                createdBy={createdBy}
                createdAt={createdAt}
                editedBy={editedBy}
                editedAt={editedAt}
                navigation={this.props.navigation}
                isExpanded={isExpanded}
                onPressSection={() => this.toggleSection("activity")}
                formSectionContainerStyle={{ marginBottom: 1 }}
            />
        )
    }

    renderGeneralInfoSection(showFields, isExpanded, canWrite, loading) {

        return (
            <FormSection
                sectionTitle='Informations générales'
                sectionIcon={faInfoCircle}
                isLoading={loading}
                isExpanded={isExpanded}
                onPressSection={() => this.toggleSection("info")}
                containerStyle={{ marginBottom: 1 }}
                form={
                    <View style={{ flex: 1 }}>

                        {showFields.projectId.show &&
                            this.renderProjectIdField()
                        }

                        {showFields.projectName.show &&
                            this.renderProjectNameField(canWrite)
                        }

                        {showFields.projectStep.show &&
                            this.renderProjectStepField(canWrite)
                        }

                        {showFields.projectState.show &&
                            this.renderProjectStateField(canWrite)
                        }

                        {showFields.projectPhase.show &&
                            this.renderProjectPhaseField(canWrite)
                        }

                        {showFields.projectWorkTypes.show &&
                            this.renderWorkTypesField(canWrite)
                        }
                    </View>
                } />
        )
    }

    renderTasksSection(showFields, isExpanded) {
        const {
            tasksList,
        } = this.state

        return (
            <FormSection
                sectionTitle='Tâches'
                sectionIcon={faTasks}
                isExpanded={isExpanded}
                onPressSection={() => this.toggleSection("tasks")}
                containerStyle={{ marginBottom: 1 }}
                form={
                    <View style={{ flex: 1 }}>
                        {tasksList.length > 0 ?
                            this.renderTasksFields()
                            :
                            this.renderPriorTechVisitField()
                        }
                    </View>
                } />
        )
    }

    renderClientSection(showFields, isExpanded, address, canWrite, isConnected) {

        return (
            <FormSection
                sectionTitle='Client'
                sectionIcon={faUser}
                isExpanded={isExpanded}
                onPressSection={() => this.toggleSection("client")}
                containerStyle={{ marginBottom: 1 }}
                form={
                    <View style={{ flex: 1 }}>
                        {showFields.client.show && this.renderClientField(canWrite)}
                        {showFields.address.show && this.renderAddressField(address, canWrite, isConnected)}
                    </View>
                }
            />
        )
    }

    renderContactsSection(showFields, isExpanded, canWrite) {

        return (
            <FormSection
                sectionTitle='Contacts'
                sectionIcon={faAddressBook}
                isExpanded={isExpanded}
                onPressSection={() => this.toggleSection("contacts")}
                containerStyle={{ marginBottom: 1 }}
                form={
                    <View style={{ flex: 1 }}>
                        {showFields.com.show && this.renderComContactField(canWrite)}
                        {showFields.tech.show && this.renderTechContact(canWrite)}
                    </View>
                }
            />
        )
    }

    renderDocumentsSection(showFields, isExpanded, canWrite) {
        return (
            <FormSection
                sectionTitle='Documents'
                sectionIcon={faFolder}
                isExpanded={isExpanded}
                onPressSection={() => this.toggleSection("documents")}
                containerStyle={{ marginBottom: 1 }}
                form={
                    <View style={{ flex: 1 }}>
                        {showFields.documents.show && this.renderDocumentsField(canWrite)}
                    </View>
                }
            />
        )
    }

    renderBillingSection(showFields, isExpanded, bill, canWrite) {
        return (
            <FormSection
                sectionTitle='Facturation'
                sectionIcon={faEuroSign}
                isExpanded={isExpanded}
                onPressSection={() => this.toggleSection("billing")}
                containerStyle={{ marginBottom: 1 }}
                form={
                    <View style={{ flex: 1 }}>
                        {showFields.billAmount.show && this.renderBillAmountField(bill, canWrite)}
                        {showFields.billAids.show && this.renderBillAidsPaymentsField(bill, canWrite)}
                    </View>
                }
            />
        )
    }

    renderPicturesSection(showFields, isExpanded, loading, canWrite, isConnected) {

        const { isImageViewVisible, imageIndex, imagesView, imagesCarousel, newAttachments } = this.state
        const showAddButton = canWrite && isConnected && !loading
        const showImageView = imagesView.length > 0
        const showSliderBox = !loading

        return (
            <FormSection
                hide={!this.isEdit}
                sectionTitle='Photos et plan du lieu'
                sectionIcon={faImage}
                showSection={!loading}
                isExpanded={isExpanded}
                onPressSection={() => this.toggleSection("pictures")}
                containerStyle={{ marginBottom: 1 }}
                form={
                    <View style={{ flex: 1, justifyContent: 'flex-start' }}>

                        {showSliderBox &&
                            <View style={{ flex: 1, marginTop: 15, justifyContent: 'center', alignItems: 'center' }}>
                                {imagesCarousel.length > 0 &&
                                    <SliderBox
                                        images={imagesCarousel}
                                        sliderBoxHeight={200}
                                        onCurrentImagePressed={imageIndex => this.setState({ imageIndex, isImageViewVisible: true })}
                                        dotColor={theme.colors.secondary}
                                        inactiveDotColor="gray"
                                        paginationBoxVerticalPadding={20}
                                        circleLoop
                                        resizeMethod={'resize'}
                                        resizeMode={'cover'}
                                        paginationBoxStyle={{
                                            position: "absolute",
                                            bottom: 0,
                                            padding: 0,
                                            alignItems: "center",
                                            alignSelf: "center",
                                            justifyContent: "center",
                                            paddingVertical: 10
                                        }}
                                        dotStyle={{
                                            width: 10,
                                            height: 10,
                                            borderRadius: 5,
                                            marginHorizontal: 0,
                                            padding: 0,
                                            margin: 0,
                                            backgroundColor: "rgba(128, 128, 128, 0.92)"
                                        }}
                                        ImageComponentStyle={{ borderRadius: 10, width: '95%', marginTop: 5 }}
                                        imageLoadingColor="#2196F3"
                                    //onPressDelete={(currentImage) => this.handleDeleteImage(false, currentImage)}
                                    />
                                }
                            </View>
                        }

                        {showImageView &&
                            <ImageView
                                images={imagesView}
                                imageIndex={0}
                                onImageChange={(imageIndex) => this.setState({ imageIndex })}
                                isVisible={isImageViewVisible}
                                onClose={() => this.setState({ isImageViewVisible: false })}
                                renderFooter={(currentImage) => (
                                    <View style={{ justifyContent: 'flex-end', alignItems: 'flex-end' }}>
                                        <TouchableOpacity
                                            style={{ padding: 10, backgroundColor: 'black', opacity: 0.8, borderRadius: 50, margin: 10 }}
                                            onPress={() => this.handleDeleteImage(false, imageIndex)}>
                                            <MaterialCommunityIcons name='delete' size={24} color='#fff' />
                                        </TouchableOpacity>
                                    </View>)
                                }
                            />
                        }

                        {this.renderAttachments(newAttachments, 'image', true)}

                        {showAddButton &&
                            <SquarePlus onPress={this.pickImage} style={{ marginTop: 8 }} />
                        }
                    </View>
                }
            />
        )
    }

    renderNotesSection(showFields, isExpanded, canWrite) {
        return (
            <FormSection
                hide={!this.isEdit}
                sectionTitle='Bloc Notes'
                sectionIcon={faQuoteRight}
                formContainerStyle={{ paddingTop: 25 }}
                form={
                    <View style={{ flex: 1 }}>
                        {showFields.notes.show && this.renderNotesField(canWrite)}
                    </View>
                }
            />
        )
    }

    renderForm(canWrite, loading, isConnected) {

        const { sections, bill, name, step, client, address, comContact, techContact } = this.state
        const canReadTasks = this.props.permissions.tasks.canRead
        const prerequiredFields = [name, client.id, address.description, comContact.id]
        const isStepTech = techSteps.includes(step)
        let showTasksSection = !prerequiredFields.includes("") && (!isStepTech || isStepTech && techContact.id !== "")
        showTasksSection = canReadTasks && (this.isEdit || !this.isEdit && showTasksSection) && !this.sections

        return (
            <View>
                {sections["activity"].show &&
                    this.renderActivitySection(sections["activity"].fields, sections["activity"].isExpanded)
                }

                {sections["info"].show &&
                    this.renderGeneralInfoSection(sections["info"].fields, sections["info"].isExpanded, canWrite, loading)
                }

                {sections["client"].show &&
                    this.renderClientSection(sections["client"].fields, sections["client"].isExpanded, address, canWrite, isConnected)
                }

                {sections["contacts"].show &&
                    this.renderContactsSection(sections["contacts"].fields, sections["contacts"].isExpanded, canWrite)
                }

                {sections["documents"].show &&
                    this.renderDocumentsSection(sections["documents"].fields, sections["documents"].isExpanded, canWrite)
                }

                {/* {showTasksSection &&
                    this.renderTasksSection(sections["tasks"].fields, sections["tasks"].isExpanded, showTasksSection)
                } */}

                {sections["billing"].show &&
                    this.renderBillingSection(sections["billing"].fields, sections["billing"].isExpanded, bill, canWrite)
                }

                {sections["pictures"].show &&
                    this.renderPicturesSection(sections["pictures"].fields, sections["pictures"].isExpanded, loading, canWrite, isConnected)
                }

                {sections["notes"].show &&
                    this.renderNotesSection(sections["notes"].fields, sections["notes"].isExpanded, canWrite)
                }
            </View>
        )
    }

    renderStandardView(canWrite, isConnected, loading) {

        return (
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? 'padding' : null}
                keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
            >
                <ScrollView style={styles.dataContainer} keyboardShouldPersistTaps="never">
                    {this.renderForm(canWrite, loading, isConnected)}
                </ScrollView>
            </KeyboardAvoidingView>

        )
    }


    render() {
        const { sections, docNotFound, loading, uploading, isBlockedUpdates } = this.state
        const { isConnected } = this.props.network
        let { canCreate, canUpdate, canDelete } = this.props.permissions.projects
        const canWrite = (canUpdate && this.isEdit && !isBlockedUpdates || canCreate && !this.isEdit && !isBlockedUpdates)

        if (docNotFound)
            return (
                <View style={styles.mainContainer}>
                    <Appbar back title titleText={this.title} />
                    <EmptyList
                        icon={faTimes}
                        header='Projet introuvable'
                        description="Le projet est introuvable dans la base de données. Il se peut qu'il ait été supprimé."
                        offLine={!isConnected}
                    />
                </View>
            )

        else if (uploading)
            return (
                <View style={styles.mainContainer}>
                    <Appbar back title titleText={this.title} />
                    {this.renderPicturesSection(sections["pictures"].fields, sections["pictures"].isExpanded, loading, canWrite, isConnected)}
                </View>
            )

        else if (loading)
            return (
                <View style={styles.mainContainer}>
                    <Appbar back title titleText={this.title} />
                    <Loading />
                </View>
            )

        else return (
            <View style={styles.mainContainer}>
                <Appbar
                    back
                    title
                    titleText={this.title}
                    check={this.isEdit ? canWrite && !loading : !loading}
                    handleSubmit={this.handleSubmit}
                    del={canDelete && this.isEdit && !loading}
                    handleDelete={this.showAlert}
                    loading={loading}
                    refresh={this.isEdit && !loading}
                    handleRefresh={this.handleRefresh}
                    customBackHandler={this.customBackHandler}
                />
                {this.renderStandardView(canWrite, isConnected, loading)}
            </View >
        )
    }
}

const mapStateToProps = (state) => {
    return {
        role: state.roles.role,
        permissions: state.permissions,
        network: state.network,
        //processModels: state.process.processModels,
        currentUser: state.currentUser
        //fcmToken: state.fcmtoken
    }
}

export default connect(mapStateToProps)(CreateProject)


const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: theme.colors.background
    },
    dataContainer: {
        flex: 1,
        //paddingHorizontal: theme.padding
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
    note: {
        //backgroundColor: 'green',
        alignSelf: 'center',
        textAlignVertical: 'top',
        backgroundColor: '#ffffff',
        borderRadius: 5,
        paddingTop: 15,
        paddingLeft: 15,
        height: 150,
        width: constants.ScreenWidth * 0.91,
        ...theme.style.shadow
    },
    attachmentsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    attachment: {
        // flex: 1,
        backgroundColor: theme.colors.gray50,
        width: '90%',
        height: 60,
        alignSelf: 'center',
        borderRadius: 5,
        marginTop: 15,
        ...theme.style.shadow
    },
    task: {
        //flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        borderRadius: 5,
        paddingVertical: 5,
        paddingHorizontal: 10,
        marginHorizontal: 15,
        marginBottom: 10,
        //marginTop: 10,
    },
})


//Delete Images from STORAGE //#RULE: NEVER DELETE FILES
// async deleteAttachments(allImages, currentImage) {
//     let urls = []

//     if (allImages)
//         urls = this.initialState.attachments.map(image => image.downloadURL) //Delete all images

//     else
//         urls = [this.initialState.attachments[currentImage].downloadURL] //Delete single image

//     const promises = []
//     for (let i = 0; i < urls.length; i++) {
//         const deletion = firebase.storage().refFromURL(urls[i]).delete()
//         promises.push(deletion)
//     }

//     await Promise.all(promises)
//         .then(() => console.log('All images were deleted from STORAGE'))
//         .catch(e => Alert.alert(e))

//     if (allImages)
//         this.props.navigation.goBack()

//     // else
//     //     this.fetchProject()
// }