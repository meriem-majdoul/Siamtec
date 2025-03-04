import React, { Component } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Keyboard } from 'react-native';
import { TextInput } from 'react-native';
import { Card, Title, FAB, ProgressBar, List } from 'react-native-paper'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import Entypo from 'react-native-vector-icons/Entypo'
import firebase from '@react-native-firebase/app'

import ImagePicker from 'react-native-image-picker'
import ImageView from 'react-native-image-view'
import { SliderBox } from "react-native-image-slider-box"

import moment from 'moment';
import 'moment/locale/fr'
moment.locale('fr')

import Appbar from '../../components/Appbar'
import MyInput from '../../components/TextInput'
import AddressInput from '../../components/AddressInput'
import Picker from "../../components/Picker"
import AutoCompleteUsers from '../../components/AutoCompleteUsers'
import Toast from "../../components/Toast"
import Loading from "../../components/Loading"

import * as theme from "../../core/theme";
import { constants, adminId } from "../../core/constants";
import { generatetId, navigateToScreen, myAlert, updateField, nameValidator, setToast, load, pickImage } from "../../core/utils";
import { notAvailableOffline, handleFirestoreError } from '../../core/exceptions';

import { fetchDocs } from "../../api/firestore-api";
import { uploadFiles } from "../../api/storage-api";

import { connect } from 'react-redux'

const db = firebase.firestore()

const states = [
    { label: 'En attente', value: 'En attente' },
    { label: 'En cours', value: 'En cours' },
    { label: 'Terminé', value: 'Terminé' },
    { label: 'Annulé', value: 'Annulé' },
]

const steps = [
    { label: 'Prospect', value: 'Prospect' },
    { label: 'Chantier', value: 'Chantier' },
    { label: 'SAV', value: 'SAV' },
]

const imagePickerOptions = {
    title: 'Selectionner une image',
    takePhotoButtonTitle: 'Prendre une photo',
    chooseFromLibraryButtonTitle: 'Choisir de la librairie',
    cancelButtonTitle: 'Annuler',
    noData: true,
}

class CreateProject extends Component {
    constructor(props) {
        super(props)
        this.fetchDocs = fetchDocs.bind(this)
        this.refreshClient = this.refreshClient.bind(this)
        this.refreshAddress = this.refreshAddress.bind(this)

        this.handleSubmit = this.handleSubmit.bind(this)
        this.handleDeleteProject = this.handleDeleteProject.bind(this)
        this.handleDeleteImage = this.handleDeleteImage.bind(this)
        //this.deleteAttachments = this.deleteAttachments.bind(this)

        this.myAlert = myAlert.bind(this)
        this.uploadFiles = uploadFiles.bind(this)
        this.showAlert = this.showAlert.bind(this)
        this.pickImage = this.pickImage.bind(this)

        this.initialState = {}
        this.isInit = true
        this.currentUser = firebase.auth().currentUser

        this.ProjectId = this.props.navigation.getParam('ProjectId', '')
        this.isEdit = this.ProjectId ? true : false
        this.ProjectId = this.isEdit ? this.ProjectId : generatetId('GS-DOC-')
        this.title = this.isEdit ? 'Modifier le projet' : 'Nouveau projet'

        this.state = {
            //TEXTINPUTS
            name: { value: "", error: '' },
            description: { value: "", error: '' },
            note: { value: "", error: '' },

            //Screens
            address: { description: '', place_id: '', marker: { latitude: '', longitude: '' } },
            addressError: '',
            client: { id: '', fullName: '' },

            //Pickers
            state: 'En attente',
            step: 'Prospect',

            //Tag Autocomplete
            suggestions: [],
            tagsSelected: [],

            //logs (Auto-Gen)
            createdAt: '',
            createdBy: { id: '', fullName: '' },
            editedAt: '',
            editedBy: { id: '', fullName: '' },

            //Images
            attachments: [],
            attachedImages: [],
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

            error: '',
            loading: true
        }
    }

    async componentDidMount() {
        const array = [{ id: '1' }, '2', '3']
        const contains = array.some(({ id }) => id === '1')
        console.log('contains', contains)

        if (this.isEdit) {
            await this.fetchProject()
            this.fetchDocuments()
            this.fetchTasks()
        }

        else this.initialState = this.state

        this.fetchSuggestions()
        load(this, false)
    }

    componentWillUnmount() {
        if (this.isEdit) {
            this.unsubscribeDocs && this.unsubscribeDocs()
            this.unsubscribeAgenda && this.unsubscribeAgenda()
            this.unsubscribeTasks && this.unsubscribeTasks()
        }
    }

    //FETCHES: #edit
    async fetchProject() {
        await db.collection('Projects').doc(this.ProjectId).get().then((doc) => {
            if (doc.exists) {
                let { client, name, description, note, address, state, step, tagsSelected } = this.state
                let { createdAt, createdBy, editedAt, editedBy, attachedImages } = this.state
                let { error, loading } = this.state
                var imagesView = []
                var imagesCarousel = []

                //General info
                const project = doc.data()
                client = project.client
                name.value = project.name
                description.value = project.description
                note.value = project.note
                tagsSelected = project.subscribers

                //َActivity
                createdAt = project.createdAt
                createdBy = project.createdBy
                console.log('createdBy', createdBy)
                editedAt = project.editedAt
                editedBy = project.editedBy

                //Images
                attachedImages = project.attachments

                if (attachedImages) {
                    attachedImages = attachedImages.filter((image) => !image.deleted)
                    imagesView = attachedImages.map((image) => { return ({ source: { uri: image.downloadURL } }) })
                    imagesCarousel = attachedImages.map((image) => image.downloadURL)
                }

                //State
                state = project.state
                step = project.step

                //Address
                address = project.address

                this.setState({ createdAt, createdBy, editedAt, editedBy, attachedImages, imagesView, imagesCarousel, client, name, description, note, address, state, step, tagsSelected }, () => {
                    if (this.isInit)
                        this.initialState = this.state

                    this.isInit = false
                })
            }
        })
    }

    fetchDocuments() {
        this.unsubscribeDocs = db.collection('Documents').where('deleted', '==', false).where('project.id', '==', this.ProjectId).orderBy('createdAt', 'DESC').onSnapshot((querysnapshot) => {
            if (querysnapshot.empty) return

            let documentsList = []
            let documentTypes = []
            querysnapshot.forEach((doc) => {
                const document = doc.data()
                documentsList.push(document)
                documentTypes.push(document.type)
            })
            documentTypes = [...new Set(documentTypes)]
            this.setState({ documentsList, documentTypes })
        })
    }

    fetchTasks() {
        this.unsubscribeAgenda = db.collection('Agenda').onSnapshot((querysnapshot) => {
            if (querysnapshot.empty) return

            let tasksList = []
            let taskTypes = []
            querysnapshot.forEach(async (dateDoc) => {
                const date = dateDoc.id
                const query = dateDoc.ref.collection('Tasks').where('project.id', '==', this.ProjectId)
                this.unsubscribeTasks = query.onSnapshot((tasksSnapshot) => {
                    if (!tasksSnapshot) return

                    tasksSnapshot.forEach((doc) => {
                        const task = doc.data()
                        task.id = doc.id
                        task.date = dateDoc.id
                        tasksList.push(task)
                        taskTypes.push(task.type)
                    })

                    taskTypes = [...new Set(taskTypes)]
                    this.setState({ tasksList, taskTypes })
                })
            })
        })
    }

    fetchSuggestions() {
        const query = db.collection('Users')
        this.fetchDocs(query, 'suggestions', '', () => { })
    }

    //Screen inputs
    refreshClient(isPro, id, nom, prenom) {
        let fullName = ''
        let client = { id: '', fullName: '' }

        if (isPro)
            fullName = nom

        else
            fullName = prenom + ' ' + nom

        client.id = id
        client.fullName = fullName

        this.setState({ client })
    }

    refreshAddress(address) {
        this.setState({ address, addressError: '' })
    }

    //Inputs validation
    validateInputs() {
        let { client, name, address } = this.state
        const { isConnected } = this.props.network

        let clientError = nameValidator(client.fullName, '"Client"')
        let nameError = nameValidator(name.value, '"Nom du projet"')
        //var addressError = isConnected ? nameValidator(address.description, '"Emplacemment"') : '' //Address optional on offline mode

        if (clientError || nameError) {
            name.error = nameError
            Keyboard.dismiss()
            this.setState({ clientError, name, loading: false })
            setToast(this, 'e', 'Erreur de saisie, veuillez verifier les champs.')
            return false
        }

        return true
    }

    //#OOS
    async handleSubmit() {
        //Handle Loading or No edit done
        let { loading, attachments } = this.state
        if (loading || this.state === this.initialState) return
        load(this, true)

        const isValid = this.validateInputs()
        if (!isValid) return

        let { client, name, description, note, address, state, step, tagsSelected } = this.state

        //1. UPLOADING FILES (ONLINE ONLY)
        const { isConnected } = this.props.network

        if (isConnected) {
            if (attachments.length > 0) {
                this.title = 'Exportation des images...'
                const storageRefPath = `/Projects/${this.ProjectId}/Images/`
                const uploadedImages = await this.uploadFiles(attachments, storageRefPath)
                if (uploadedImages) {
                    const previousAttachedImages = this.initialState.attachedImages
                    var attachedImages = previousAttachedImages.concat(uploadedImages)
                    this.setState({ attachedImages })
                }
            }
        }

        //2. Set project
        //subscribers = currentUser + collaborators (tags)
        const currentUser = { id: this.currentUser.uid, fullName: this.currentUser.displayName }
        const currentSubscriber = { id: this.currentUser.uid, fullName: this.currentUser.displayName, email: this.currentUser.email }

        var subscribers = tagsSelected.map((user) => { return { id: user.id, email: user.email, fullName: user.fullName } })
        subscribers.push(currentSubscriber)
        subscribers = [...new Set(subscribers)] //case of duplicates

        let project = {
            client: client,
            name: name.value,
            description: description.value,
            note: note.value,
            state: state,
            step: step,
            address: address,
            editedAt: moment().format('lll'),
            editedBy: currentUser,
            subscribers: subscribers,
            deleted: false,
        }

        if (!this.isEdit) {
            project.createdAt = moment().format('lll')
            project.createdBy = currentUser
        }

        if (isConnected) {
            project.attachments = attachedImages
        }

        console.log('Ready to set project...')
        db.collection('Projects').doc(this.ProjectId).set(project, { merge: true })
        setTimeout(() => this.props.navigation.goBack(), 1000)
    }

    showAlert() {
        const title = "Supprimer le projet"
        const message = 'Etes-vous sûr de vouloir supprimer ce projet ? Cette opération est irreversible.'
        const handleConfirm = () => this.handleDeleteProject()
        this.myAlert(title, message, handleConfirm)
    }

    //#OOS
    handleDeleteProject() {
        load(this, true)
        db.collection('Projects').doc(this.ProjectId).update({ deleted: true })
        setTimeout(() => this.props.navigation.goBack(), 1000)
    }

    //Delete URLs from FIRESTORE 
    async handleDeleteImage(allImages, currentImage) {
        const newAttachments = this.state.attachedImages
        newAttachments[currentImage].deleted = true

        db.collection('Projects').doc(this.ProjectId).update({ attachments: newAttachments })
        setTimeout(() => {
            this.fetchProject()
            this.setState({ isImageViewVisible: false })
            //await this.deleteAttachments(allImages, currentImage)
        }, 1000)
    }

    //Delete Images from STORAGE //#RULE: NEVER DELETE FILES
    // async deleteAttachments(allImages, currentImage) {
    //     let urls = []

    //     if (allImages)
    //         urls = this.initialState.attachedImages.map(image => image.downloadURL) //Delete all images

    //     else
    //         urls = [this.initialState.attachedImages[currentImage].downloadURL] //Delete single image

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

    async pickImage() {
        let { attachments } = this.state
        attachments = await pickImage(attachments)
        this.setState({ attachments })
    }

    renderAttachments(attachments, type, isUpload) {
        const { loading } = this.state

        return attachments.map((image, key) => {

            if (!isUpload) {
                var DocumentId = image.DocumentId
                image = image.attachment
            }

            let readableSize = image.size / 1000
            readableSize = readableSize.toFixed(1)

            return (
                <TouchableOpacity
                    onPress={() => {
                        if (!isUpload)
                            this.props.navigation.navigate('UploadDocument', { DocumentId: DocumentId })
                    }}
                    style={styles.attachment}>

                    <View style={{ flex: 0.9, flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ flex: 0.17, justifyContent: 'center', alignItems: 'center' }}>
                            <MaterialCommunityIcons name={type === 'image' ? 'image' : 'folder'} size={24} color={type === 'image' ? theme.colors.primary : theme.colors.gray} />
                        </View>

                        <View style={{ flex: 0.68 }}>
                            <Text numberOfLines={1} ellipsizeMode='middle' style={[theme.customFontMSmedium.body]}>{image.name}</Text>
                            <Text style={[theme.customFontMSmedium.caption, { color: theme.colors.placeholder }]}>{readableSize} KB</Text>
                        </View>

                        <View style={{ flex: 0.15, justifyContent: 'center', alignItems: 'center' }}>
                            {!isUpload ?
                                < MaterialIcons
                                    name='keyboard-arrow-right'
                                    size={21}
                                    color={theme.colors.placeholder}
                                    style={{ paddingVertical: 19, paddingHorizontal: 5 }}
                                    onPress={() => this.props.navigation.navigate('UploadDocument', { isEdit: true, DocumentId: DocumentId })}
                                />
                                :
                                !loading &&
                                < MaterialCommunityIcons
                                    name='close'
                                    size={21}
                                    color={theme.colors.placeholder}
                                    style={{ paddingVertical: 19, paddingHorizontal: 5 }}
                                    onPress={() => {
                                        attachments.splice(key, 1)
                                        this.setState({ attachments })
                                    }}
                                />
                            }
                        </View>
                    </View>

                    {isUpload &&
                        <View style={{ flex: 0.1, justifyContent: 'flex-end' }}>
                            <ProgressBar progress={image.progress} color={theme.colors.primary} visible={true} />
                        </View>
                    }

                </TouchableOpacity>
            )
        })
    }

    renderTasks(tasksList) {

        return tasksList.map((task, key) => {
            return (
                <TouchableOpacity
                    onPress={() => this.props.navigation.navigate('CreateTask', { isEdit: true, title: 'Modifier la tâche', DateId: task.date, TaskId: task.id })}
                    style={[styles.attachment, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15 }]}>
                    <Text style={theme.customFontMSregular.body}>{task.name}</Text>
                    <MaterialIcons
                        name='keyboard-arrow-right'
                        size={21}
                        color={theme.colors.placeholder}
                        style={{ paddingVertical: 19, paddingHorizontal: 5 }}
                    />
                </TouchableOpacity>
            )
        })
    }

    render() {
        let { client, clientError, name, description, note, address, addressError, state, step } = this.state
        let { createdAt, createdBy, editedAt, editedBy, isImageViewVisible, imageIndex, imagesView, imagesCarousel, attachments } = this.state
        let { documentsList, documentTypes, tasksList, taskTypes, expandedTaskId, suggestions, tagsSelected } = this.state
        let { error, loading, toastMessage, toastType } = this.state
        let { canUpdate, canDelete } = this.props.permissions.projects
        canUpdate = (canUpdate || !this.isEdit)
        const canCreateDocument = this.props.permissions.documents.canCreate

        const { isConnected } = this.props.network

        return (
            <View style={styles.container}>
                <Appbar back={!loading} close title titleText={this.title} check={this.isEdit ? canUpdate && !loading : !loading} handleSubmit={this.handleSubmit} del={canDelete && this.isEdit && !loading} handleDelete={this.showAlert} loading={loading} />

                <ScrollView style={styles.container}>

                    {!loading &&
                        <Card style={{ margin: 5 }}>
                            <Card.Content>
                                <Title>Informations générales</Title>
                                <MyInput
                                    label="Numéro du projet"
                                    returnKeyType="done"
                                    value={this.ProjectId}
                                    editable={false}
                                    disabled />

                                <MyInput
                                    label="Nom du projet"
                                    returnKeyType="done"
                                    value={name.value}
                                    onChangeText={text => updateField(this, name, text)}
                                    error={!!name.error}
                                    errorText={name.error}
                                    multiline={true}
                                    editable={canUpdate} />

                                <MyInput
                                    label="Description"
                                    returnKeyType="done"
                                    value={description.value}
                                    onChangeText={text => updateField(this, description, text)}
                                    error={!!description.error}
                                    errorText={description.error}
                                    multiline={true}
                                    editable={canUpdate} />

                                <TouchableOpacity onPress={() => navigateToScreen(this, canUpdate, 'ListClients', { onGoBack: this.refreshClient, prevScreen: 'CreateProject', titleText: 'Clients' })}>
                                    <MyInput
                                        label="Client"
                                        value={client.fullName}
                                        error={!!clientError}
                                        errorText={clientError}
                                        editable={false} />
                                </TouchableOpacity>

                                <AddressInput
                                    offLine={!isConnected}
                                    onPress={() => navigateToScreen(this, canUpdate, 'Address', { onGoBack: this.refreshAddress, currentAddress: address })}
                                    address={address}
                                    addressError={addressError} />

                                <Picker
                                    returnKeyType="next"
                                    value={step}
                                    error={!!step.error}
                                    errorText={step.error}
                                    selectedValue={step}
                                    onValueChange={(step) => this.setState({ step })}
                                    title="Étape"
                                    elements={steps}
                                    enabled={canUpdate} />

                                <Picker
                                    returnKeyType="next"
                                    value={state}
                                    error={!!state.error}
                                    errorText={state.error}
                                    selectedValue={state}
                                    onValueChange={(state) => this.setState({ state })}
                                    title="État"
                                    elements={states}
                                    enabled={canUpdate} />

                                <View style={{ marginTop: 10 }}>
                                    <Text style={[{ fontSize: 12, color: theme.colors.placeholder }]}>Collaborateurs</Text>
                                    <AutoCompleteUsers
                                        suggestions={suggestions}
                                        tagsSelected={tagsSelected}
                                        main={this}
                                        placeholder="Ajouter un utilisateur"
                                        autoFocus={false}
                                        showInput={true}
                                        suggestionsBellow={false}
                                        editable={canUpdate}
                                    />
                                </View>

                            </Card.Content>
                        </Card>
                    }

                    {!loading &&
                        <Card style={{ margin: 5 }}>
                            <Card.Content>
                                <Title style={{ marginBottom: 15 }}>Bloc Notes</Title>
                                <TextInput
                                    underlineColorAndroid="transparent"
                                    placeholder="Rapportez des notes utiles..."
                                    placeholderTextColor="grey"
                                    numberOfLines={7}
                                    multiline={true}
                                    onChangeText={text => updateField(this, note, text)}
                                    value={note.value}
                                    style={styles.note}
                                    autoCapitalize='sentences'
                                    editable={canUpdate} />
                            </Card.Content>
                        </Card>
                    }

                    {!loading && this.isEdit &&
                        <Card style={{ margin: 5 }}>
                            <Card.Content>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Title>Tâches</Title>
                                    <Text
                                        onPress={() => this.props.navigation.navigate('Agenda', { isAgenda: false, projectFilter: { id: this.ProjectId, name: this.state.name } })}
                                        style={[theme.customFontMSsemibold.caption, { color: theme.colors.primary }]}>Planning du projet</Text>
                                </View>

                                <List.AccordionGroup
                                    expandedId={expandedTaskId}
                                    onAccordionPress={(expandedId) => {
                                        if (expandedTaskId === expandedId)
                                            this.setState({ expandedTaskId: '' })
                                        else
                                            this.setState({ expandedTaskId: expandedId })
                                    }}>
                                    {taskTypes.map((type) => {
                                        let filteredTasks = tasksList.filter((task) => task.type === type)

                                        return (
                                            <List.Accordion showArrow title={type} id={type}>
                                                {this.renderTasks(filteredTasks)}
                                            </List.Accordion>
                                        )
                                    })}
                                </List.AccordionGroup>

                            </Card.Content>
                        </Card>
                    }

                    {!loading && this.isEdit &&
                        <Card style={{ margin: 5 }}>
                            <Card.Content>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Title>Documents</Title>
                                    {canCreateDocument && <Text onPress={() => this.props.navigation.navigate('UploadDocument', { project: { id: this.ProjectId, name: this.initialState.name.value } })} style={[theme.customFontMSsemibold.caption, { color: theme.colors.primary }]}>Ajouter un document</Text>}
                                </View>

                                <List.AccordionGroup
                                    expandedId={this.state.expandedId}
                                    onAccordionPress={(expandedId) => {
                                        if (this.state.expandedId === expandedId)
                                            this.setState({ expandedId: '' })
                                        else
                                            this.setState({ expandedId })
                                    }}>
                                    {documentTypes.map((type) => {
                                        let filteredDocuments = documentsList.filter((doc) => doc.type === type)

                                        return (
                                            <List.Accordion showArrow title={type} id={type}>
                                                {this.renderAttachments(filteredDocuments, 'pdf', false)}
                                            </List.Accordion>
                                        )
                                    })}
                                </List.AccordionGroup>

                            </Card.Content>
                        </Card>
                    }

                    {isConnected &&
                        <Card style={{ paddingBottom: 20, margin: 5 }}>
                            <Card.Content>
                                {!loading &&
                                    <View>
                                        <Title style={{ marginBottom: 15 }}>Photos et plan du lieu</Title>
                                    </View>
                                }
                                {imagesView.length > 0 &&
                                    <ImageView
                                        images={imagesView}
                                        imageIndex={0}
                                        onImageChange={(imageIndex) => this.setState({ imageIndex: imageIndex })}
                                        isVisible={this.state.isImageViewVisible}
                                        onClose={() => this.setState({ isImageViewVisible: false })}
                                        renderFooter={(currentImage) => (
                                            <View style={{ justifyContent: 'flex-end', alignItems: 'flex-end' }}>
                                                <TouchableOpacity
                                                    style={{ padding: 10, backgroundColor: 'black', opacity: 0.8, borderRadius: 50, margin: 10 }}
                                                    onPress={() => this.handleDeleteImage(false, this.state.imageIndex)}>
                                                    <MaterialCommunityIcons name='delete' size={24} color='#fff' />
                                                </TouchableOpacity>
                                            </View>)}
                                    />
                                }
                            </Card.Content>

                            {!loading &&
                                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                    {imagesCarousel.length > 0 &&
                                        <SliderBox
                                            images={imagesCarousel}
                                            sliderBoxHeight={200}
                                            onCurrentImagePressed={index => this.setState({ imageIndex: index, isImageViewVisible: true })}
                                            dotColor={theme.colors.secondary}
                                            inactiveDotColor="gray"
                                            paginationBoxVerticalPadding={20}
                                            //autoplay
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
                                        />}
                                </View>
                            }

                            {this.renderAttachments(attachments, 'image', true)}

                            {canUpdate && !loading &&
                                <TouchableOpacity onPress={this.pickImage} style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 15, marginTop: 15 }}>
                                    <Entypo name='camera' color={theme.colors.primary} size={19} />
                                    <Text style={[theme.customFontMSsemibold.body, { color: theme.colors.primary, textAlign: 'center', marginLeft: 10 }]}>Ajouter une photo</Text>
                                </TouchableOpacity>
                            }

                        </Card>
                    }

                    {!loading && this.isEdit &&
                        <Card style={{ margin: 5 }}>
                            <Card.Content>
                                <Title>Activité</Title>
                                <MyInput
                                    label="Date de création"
                                    returnKeyType="done"
                                    value={createdAt}
                                    editable={false}
                                />

                                <TouchableOpacity onPress={() => this.props.navigation.navigate('Profile', { userId: createdBy.id })}>
                                    <MyInput
                                        label="Crée par"
                                        returnKeyType="done"
                                        value={createdBy.fullName}
                                        editable={false}
                                        link
                                    />
                                </TouchableOpacity>

                                <MyInput
                                    label="Dernière mise à jour"
                                    returnKeyType="done"
                                    value={editedAt}
                                    editable={false}
                                />

                                <TouchableOpacity onPress={() => this.props.navigation.navigate('Profile', { userId: editedBy.id })}>
                                    <MyInput
                                        label="Dernier intervenant"
                                        returnKeyType="done"
                                        value={editedBy.fullName}
                                        editable={false}
                                        link
                                    />
                                </TouchableOpacity>

                            </Card.Content>
                        </Card>
                    }
                </ScrollView>

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
        //fcmToken: state.fcmtoken
    }
}

export default connect(mapStateToProps)(CreateProject)



const styles = StyleSheet.create({
    container: {
        flex: 1,
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
        width: constants.ScreenWidth * 0.91,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.32,
        shadowRadius: 5.46,
        elevation: 2,
    },
    attachment: {
        // flex: 1,
        elevation: 1,
        backgroundColor: theme.colors.gray50,
        width: '90%',
        height: 60,
        alignSelf: 'center',
        borderRadius: 5,
        marginTop: 15
    }
})

