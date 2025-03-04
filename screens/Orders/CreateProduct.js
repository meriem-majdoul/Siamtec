
//Category: name : Picker + Dialog (add new cat)
//Taxe: value : TextInput (numeric)
//Marque: {id, name, logo} : AutoCompleteTag (like articles)

import React, { Component } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Keyboard, Alert, Image, ImageBackground, Platform, ActivityIndicator } from 'react-native';
import { Card, Title, TextInput } from 'react-native-paper'
import Ionicons from 'react-native-vector-icons/Ionicons'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import Modal from 'react-native-modal'
import firebase from '@react-native-firebase/app'
import ImageView from 'react-native-image-view'
import { connect } from 'react-redux'
import Dialog from "react-native-dialog"

import moment from 'moment';
import 'moment/locale/fr'
moment.locale('fr')

import Appbar from '../../components/Appbar'
import MyInput from '../../components/TextInput'
import Picker from "../../components/Picker"
import Button from "../../components/Button"
import RadioButton from "../../components/RadioButton"
import UploadProgress from "../../components/UploadProgress"
import AutoCompleteBrands from "../../components/AutoCompleteBrands"
import Toast from "../../components/Toast"
import Loading from "../../components/Loading"

import { fetchDocs } from "../../api/firestore-api";
import { uploadFile } from "../../api/storage-api";

import { generatetId, myAlert, updateField, pickImage, renderImages, nameValidator, priceValidator, arrayValidator, setToast, load } from "../../core/utils";
import * as theme from "../../core/theme";
import { constants } from "../../core/constants";
import { handleFirestoreError } from '../../core/exceptions';

const db = firebase.firestore()

class CreateProduct extends Component {
    constructor(props) {
        super(props)
        this.fetchDocs = fetchDocs.bind(this)
        this.fetchProduct = this.fetchProduct.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
        this.pickNewBrandLogo = this.pickNewBrandLogo.bind(this)

        this.toggleDialog = this.toggleDialog.bind(this)
        this.addNewCategory = this.addNewCategory.bind(this)

        this.uploadFile = uploadFile.bind(this)
        this.myAlert = myAlert.bind(this)
        this.showAlert = this.showAlert.bind(this)
        this.renderBrand = this.renderBrand.bind(this)

        this.initialState = {}
        this.isInit = true
        this.currentUser = firebase.auth().currentUser

        this.ProductId = this.props.navigation.getParam('ProductId', '')
        this.isEdit = this.ProductId ? true : false
        this.title = this.ProductId ? "Modifier l'article" : "Nouvel article"

        this.state = {
            //AUTO-GENERATED
            ProductId: '', //Not editable
            checked: 'second',
            type: 'product',
            name: { value: '', error: '' },
            description: { value: '', error: '' },
            price: { value: '', error: '' },
            taxe: { value: '', error: '' },

            //Category
            category: { value: '', error: '' }, //Selected category
            categories: [{ label: 'Selectionnez une catégorie', value: '' }], //Picker with dynamic values
            showDialog: false, //Dialog to add new category
            dialogType: '', //category or brand
            newCategory: '', //New category

            //Brand
            suggestions: [], //Brands suggestions
            tagsSelected: [], //Selected brand
            brandError: '',
            newBrand: { name: '', logo: { path: '' } }, //New brand

            //logs
            createdBy: { id: '', fullName: '' },
            createdAt: '',
            editedBy: { id: '', fullName: '' },
            editededAt: '',

            error: '',
            loading: false,
            loadingDialog: false,
            toastType: '',
            toastMessage: '',

        }
    }

    async componentDidMount() {
        if (this.isEdit) {
            await this.fetchProduct()
        }

        else {
            const ProductId = generatetId('GS-AR-')
            this.setState({ ProductId }, () => this.initialState = this.state)
        }

        this.fetchCategories()
        this.fetchSuggestions()
    }

    componentWillUnmount() {
        if (this.unsubscribeCategories)
            this.unsubscribeCategories()

        if (this.unsubscribe)
            this.unsubscribe()
    }

    fetchCategories() {
        this.unsubscribeCategories = db.collection('ProductCategories').onSnapshot((querysnapshot) => {
            let categories = [{ label: 'Selectionnez une catégorie', value: '' }]

            if (querysnapshot.empty) return

            querysnapshot.forEach((doc) => {
                const categoryName = doc.data().name
                const category = { label: categoryName, value: categoryName }
                categories.push(category)
            })

            categories.sort((a, b) => (a.label > b.label) ? 1 : -1) //Sort in alphabetical order
            this.setState({ categories })
        })
    }

    //Brands suggestions
    fetchSuggestions() {
        const query = db.collection('Brands')
        this.fetchDocs(query, 'suggestions', '', () => { load(this, false) })
    }

    //on Edit
    async fetchProduct() {
        await db.collection('Products').doc(this.ProductId).get().then((doc) => {
            let { ProductId, type, category, name, tagsSelected, description, price, taxe } = this.state
            let { createdAt, createdBy, editedAt, editedBy } = this.state
            let { error, loading } = this.state

            //General info
            const product = doc.data()
            ProductId = doc.id
            category.value = product.category
            name.value = product.name
            tagsSelected.push(product.brand)
            description.value = product.description
            price.value = product.price
            taxe.value = product.taxe

            //َActivity
            createdAt = product.createdAt
            createdBy = product.createdBy
            editedAt = product.editedAt
            editedBy = product.editedBy

            this.setState({ ProductId, category, name, tagsSelected, description, price, taxe, createdAt, createdBy, editedAt, editedBy }, () => {
                if (this.isInit)
                    this.initialState = this.state

                this.isInit = false
            })
        })
    }

    showAlert() {
        const title = "Supprimer l'article"
        const message = 'Etes-vous sûr de vouloir supprimer cet article ? Cette opération est irreversible.'
        const handleConfirm = () => this.handleDelete()
        this.myAlert(title, message, handleConfirm)
    }

    handleDelete() {
        db.collection('Products').doc(this.ProductId).update({ deleted: true })
        this.props.navigation.goBack()
    }

    //Handle inputs & Submit
    setProductType(checked, type) {
        this.setState({ checked, type })
    }

    validateInputs() {
        let { category, tagsSelected, brandError, name, price } = this.state

        const categoryError = nameValidator(category.value, `"Catégorie"`)
        brandError = arrayValidator(tagsSelected, `"Marque"`)
        const nameError = nameValidator(name.value, `"Désignation"`)
        const priceError = priceValidator(price.value)

        if (categoryError || brandError || nameError || priceError) {
            Keyboard.dismiss()
            category.error = categoryError
            name.error = nameError
            price.error = priceError
            this.setState({ category, name, price, brandError, loading: false })
            return false
        }

        return true
    }

    async handleSubmit() {
        //Handle Loading or No edit done
        if (this.state.loading || this.state === this.initialState) return

        load(this, true)

        //0. Validate inputs
        const isValid = this.validateInputs()
        if (!isValid) return

        //2. ADDING product to firestore
        let { ProductId, type, category, tagsSelected, name, description, price, taxe } = this.state
        const currentUser = { id: this.currentUser.uid, fullName: this.currentUser.displayName }

        let product = {
            type: type,
            category: category.value,
            brand: tagsSelected[0],
            name: name.value,
            description: description.value,
            price: price.value,
            taxe: taxe.value,
            editedAt: moment().format('lll'),
            editedBy: currentUser,
            deleted: false,
        }

        if (!this.isEdit) {
            product.createdAt = moment().format('lll')
            product.createdBy = currentUser
        }

        console.log('Ready to add product...')

        db.collection('Products').doc(ProductId).set(product, { merge: true })
        this.props.navigation.state.params.onGoBack(product)
        this.props.navigation.goBack()
    }

    //Logo brand
    async pickNewBrandLogo() {
        let { newBrand } = this.state
        const attachments = await pickImage([])
        newBrand.logo = attachments[0]
        this.setState({ newBrand })
    }

    //Add new category
    toggleDialog(dialogType) {
        this.setState({ showDialog: !this.state.showDialog, dialogType })
    }

    renderDialog(type) { //Category & Brand
        const { showDialog, newCategory, newBrand, logo, loadingDialog } = this.state
        const isCategory = type === 'category'
        const label = isCategory ? 'catégorie' : 'marque'

        if (loadingDialog)
            return (
                <View style={styles.dialogContainer} >
                    <Dialog.Container visible={showDialog}>
                        <Dialog.Title style={[theme.customFontMSsemibold.header, { marginBottom: 5 }]}>Ajout de la {label} en cours...</Dialog.Title>
                        <ActivityIndicator color={theme.colors.primary} size='small' />
                    </Dialog.Container>
                </View >
            )

        else return (
            < View style={styles.dialogContainer} >
                <Dialog.Container visible={showDialog}>
                    {!isCategory ?
                        newBrand.logo.path ?
                            <TouchableOpacity style={{ marginBottom: 20 }} onPress={this.pickNewBrandLogo}>
                                <Image source={{ uri: newBrand.logo.path }} style={{ width: 90, height: 90 }} />
                            </TouchableOpacity>
                            :
                            <TouchableOpacity style={styles.imagesBox} onPress={this.pickNewBrandLogo}>
                                <Text style={[theme.customFontMSsemibold.caption, { color: '#333' }]}>+ Logo de</Text>
                                <Text style={[theme.customFontMSsemibold.caption, { color: '#333' }]}>la marque</Text>
                            </TouchableOpacity>
                        : null
                    }

                    <Dialog.Input
                        label={`Nom de la ${label}`}
                        returnKeyType="done"
                        value={isCategory ? newCategory : newBrand}
                        onChangeText={text => {
                            if (isCategory)
                                this.setState({ newCategory: text })

                            else {
                                newBrand.name = text
                                this.setState({ newBrand })
                            }
                        }}
                        autoFocus={showDialog}
                        style={{ borderBottomColor: theme.colors.graySilver, borderBottomWidth: StyleSheet.hairlineWidth }}
                    />
                    <Dialog.Button label="Annuler" onPress={() => this.toggleDialog('')} style={{ color: theme.colors.placeholder }} />
                    <Dialog.Button label="Confirmer" onPress={async () => {

                        if (isCategory) {
                            if (!newCategory) return
                            this.setState({ loadingDialog: true })
                            this.addNewCategory()
                        }

                        else {
                            const { name, logo } = this.state.newBrand
                            if (!name) return
                            this.setState({ loadingDialog: true })

                            //upload logo
                            const storageRefPath = `/Brands/${name}/logo`
                            const response = await this.uploadFile(logo, storageRefPath, false)

                            if (response === 'failure') {
                                this.setState({ loadingDialog: false })
                                setToast(this, 'e', "Erreur lors de l'exportation de la pièce jointe, veuillez réessayer.")
                                return
                            }

                            //add brand to db
                            this.addNewBrand()
                        }
                    }} />
                </Dialog.Container>
            </View >
        )
    }

    async addNewCategory() {
        const { newCategory } = this.state
        db.collection('ProductCategories').doc().set({ name: newCategory })
        setTimeout(() => this.setState({ category: { value: newCategory, error: '' }, newCategory: '', loadingDialog: false, showDialog: false }), 1000)
    }

    async addNewBrand() {
        const { newBrand, tagsSelected } = this.state

        let logo = newBrand.logo
        delete logo.progress
        delete logo.local

        const name = newBrand.name

        tagsSelected.push(newBrand)

        console.log('tagsSelected', tagsSelected)
        console.log('logo', logo)

        db.collection('Brands').doc().set({ name, logo })
        setTimeout(() => this.setState({ tagsSelected, newBrand: { name: '', logo: {} }, loadingDialog: false, showDialog: false }), 1000)
    }

    //Renderers
    renderTypeAndLogo() {
        const { checked, tagsSelected } = this.state
        const isLogoSelected = tagsSelected.length > 0 && tagsSelected[0].logo.downloadURL
        const logoUrl = isLogoSelected ? tagsSelected[0].logo.downloadURL : ''
        if (isLogoSelected)
            console.log('logoURL', tagsSelected[0].logo.downloadURL)

        return (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View>
                    <Text style={theme.customFontMSregular.body}>Type de l'article</Text>
                    <RadioButton
                        checked={checked}
                        firstChoice={{ title: 'Service', value: 'service' }}
                        secondChoice={{ title: 'Produit', value: 'good' }}
                        onPress1={() => this.setProductType('first', 'service')}
                        onPress2={() => this.setProductType('second', 'good')}
                        style={{ marginBottom: 10 }}
                        textRight={true}
                        isRow={false} />
                </View>

                <TouchableOpacity>
                    {isLogoSelected &&
                        <Image source={{ uri: logoUrl }} style={{ width: 90, height: 90 }} />
                    }
                </TouchableOpacity>

            </View>

        )
    }

    renderCategory() {
        const { category, categories, dialogType } = this.state

        return (
            <View style={{ marginBottom: 30 }}>
                <Picker
                    title="Catégorie"
                    returnKeyType="next"
                    selectedValue={category.value}
                    onValueChange={(text) => updateField(this, category, text)}
                    elements={categories}
                    errorText={category.error} />

                <TouchableOpacity onPress={() => this.toggleDialog('category')}>
                    <Text style={[theme.customFontMSmedium.caption, { color: theme.colors.primary }]}>+  Nouvelle catégorie</Text>
                </TouchableOpacity>
            </View>
        )
    }

    renderBrand() {
        const { suggestions, tagsSelected, brandError } = this.state
        const noItemSelected = tagsSelected.length === 0
        const { isConnected } = this.props.network

        return (
            <View style={{ marginBottom: 5 }}>
                <Text style={[theme.customFontMSmedium.caption, { color: theme.colors.placeholder, marginBottom: 5 }]} >Marque</Text>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>

                    <View style={{ flex: 0.9 }}>
                        <AutoCompleteBrands
                            placeholder='Écrivez pour choisir une marque'
                            suggestions={suggestions}
                            tagsSelected={tagsSelected}
                            main={this}
                            autoFocus={false}
                            showInput={noItemSelected}
                            errorText={brandError}
                            suggestionsBellow={false}
                        />
                    </View>

                    {noItemSelected ?
                        isConnected &&
                        <TouchableOpacity style={styles.plusIcon} onPress={() => this.toggleDialog('brand')}>
                            <MaterialCommunityIcons name='plus' color={theme.colors.primary} size={21} />
                        </TouchableOpacity>
                        :
                        <TouchableOpacity style={[styles.plusIcon, { paddingTop: 0 }]} onPress={() => this.setState({ tagsSelected: [] })}>
                            <MaterialCommunityIcons name='close' color={theme.colors.placeholder} size={21} />
                        </TouchableOpacity>
                    }
                </View>
            </View>
        )
    }

    render() {
        const { ProductId, checked, name, brand, description, price, taxe, category, categories, showDialog, dialogType } = this.state
        const { suggestions, tagsSelected } = this.state
        const { createdAt, createdBy, editedAt, editedBy } = this.state
        const { error, loading, toastType, toastMessage } = this.state
        const { isImageViewVisible } = this.state

        return (
            <View style={styles.container}>
                <Appbar back={!loading} title titleText={this.title} check={false} loading={loading} handleSubmit={this.handleSubmit} del={this.isEdit && !loading} handleDelete={this.showAlert} />

                {loading ?
                    <Loading />
                    :
                    <View style={{ flex: 1 }}>

                        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: constants.ScreenWidth * 0.02 }}>

                            <Card style={{ margin: 5, paddingVertical: 10 }}>
                                <Card.Content>

                                    {this.renderTypeAndLogo()}

                                    <MyInput
                                        label="Numéro de l'article"
                                        returnKeyType="done"
                                        value={ProductId}
                                        editable={false}
                                        disabled
                                    />

                                    {this.renderCategory()}
                                    {this.renderBrand()}

                                    <MyInput
                                        label="Désignation"
                                        returnKeyType="done"
                                        value={name.value}
                                        onChangeText={text => updateField(this, name, text)}
                                        error={!!name.error}
                                        errorText={name.error}
                                        multiline={true} />

                                    <MyInput
                                        label="Description"
                                        returnKeyType="done"
                                        value={description.value}
                                        onChangeText={text => updateField(this, description, text)}
                                        error={!!description.error}
                                        errorText={description.error}
                                        multiline={true} />

                                    <MyInput
                                        label="Prix de vente"
                                        returnKeyType="done"
                                        keyboardType='numeric'
                                        value={price.value}
                                        onChangeText={text => updateField(this, price, text)}
                                        error={!!price.error}
                                        errorText={price.error}
                                    />

                                    <MyInput
                                        label="Taxe (%)"
                                        returnKeyType="done"
                                        keyboardType='numeric'
                                        value={taxe.value}
                                        onChangeText={text => updateField(this, taxe, text)}
                                        error={!!taxe.error}
                                        errorText={taxe.error}
                                    />
                                </Card.Content>
                            </Card>

                        </ScrollView>

                        {showDialog && this.renderDialog(dialogType)}

                        <Toast
                            message={toastMessage}
                            type={toastType}
                            onDismiss={() => this.setState({ toastMessage: '' })} />
                    </View>
                }

            </View>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        role: state.roles.role,
        network: state.network
        //fcmToken: state.fcmtoken
    }
}

export default connect(mapStateToProps)(CreateProduct)



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
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    imagesBox: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 90,
        height: 90,
        marginBottom: 20,
        backgroundColor: theme.colors.gray50,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderRadius: 1
    },
    imagesCounter: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: 0,
        right: 0,
        width: 30,
        height: 15,
        backgroundColor: '#000',
        opacity: 0.65
    },
    imageThumbNail: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 90,
        height: 90,
    },
    addImage: {
        width: 90,
        marginTop: 5,
        paddingVertical: 5,
        backgroundColor: theme.colors.gray50,
        justifyContent: 'center',
        alignItems: 'center'
    },
    dialogContainer: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: "center",
        justifyContent: "center",
    },
    plusIcon: {
        flex: 0.1,
        padding: 5,
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    emptyLogo: {
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        width: 90,
        height: 90
    }
})












// <Modal
// isVisible={this.state.showImages}
// style={{ maxHeight: constants.ScreenHeight * 0.8, padding: 10, backgroundColor: '#fff', }}>
// <MaterialCommunityIcons name='close' size={21} style={{ position: 'absolute', right: 10, top: 10 }} />
// <View style={{ flex: 1 }}>
//     <Text style={[theme.customFontMSsemibold.h3, { textAlign: 'center' }]}>Images de l'article</Text>
//     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//         <Text style={[theme.customFontMSsemibold.body, { color: theme.colors.placeholder, marginBottom: 10 }]}>Aucune image</Text>
//         <Button loading={loading} mode="outlined" onPress={this.pickImage} style={{width: constants.ScreenWidth*0.5, borderWidth: 2, borderColor: theme.colors.primary}}>
//             <Text style={theme.customFontMSsemibold.caption}>Ajouter une image</Text>
//         </Button>
//     </View>
// </View>
// </Modal>
