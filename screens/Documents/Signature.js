
import React, { Component } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Platform, PixelRatio, ActivityIndicator, Alert } from "react-native";
import { ProgressBar } from 'react-native-paper'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import firebase from '@react-native-firebase/app';
import Dialog from "react-native-dialog"

import moment from 'moment';
import 'moment/locale/fr'
moment.locale('fr')

import Pdf from "react-native-pdf";
import RNFS from 'react-native-fs'
import RNFetchBlob from 'rn-fetch-blob'
import { PDFDocument, StandardFontEmbedder, rgb } from "pdf-lib";

import * as theme from '../../core/theme'
import { constants } from '../../core/constants'
import { loadLog, setToast, uint8ToBase64, base64ToArrayBuffer, load, updateField, myAlert, uuidGenerator } from '../../core/utils'
import { script as emailTemplate } from '../../emailTemplates/signatureRequest'

import Appbar from '../../components/Appbar'
import Button from '../../components/Button'
import LoadDialog from '../../components/LoadDialog'
import Toast from '../../components/Toast'
import TermsConditions from "../../components/TermsConditions";

import { connect } from 'react-redux'
import DeviceInfo from 'react-native-device-info';
import { NetworkInfo } from "react-native-network-info";

const db = firebase.firestore()
const functions = firebase.functions()
const Dir = Platform.OS === 'ios' ? RNFetchBlob.fs.dirs.DocumentDir : RNFetchBlob.fs.dirs.DownloadDir

class Signature extends Component {

    constructor(props) {
        super(props)
        this.currentUser = firebase.auth().currentUser
        this.initMode = this.props.navigation.getParam('initMode', '')

        //Storage ref url
        this.ProjectId = this.props.navigation.getParam('ProjectId', '')
        this.DocumentId = this.props.navigation.getParam('DocumentId', '')
        this.DocumentType = this.props.navigation.getParam('DocumentType', '')

        this.fileName = this.props.navigation.getParam('fileName', '')
        this.sourceUrl = this.props.navigation.getParam('url', '')
        this.originalFilePath = `${Dir}/Synergys/Documents/${this.fileName}`

        this.termsPath = `${Dir}/Synergys/Documents/Termes-et-conditions-générales-de-signature.pdf`
        this.termsURL = 'https://firebasestorage.googleapis.com/v0/b/projectmanagement-b9677.appspot.com/o/CONDITIONS%20G%C3%89N%C3%89RALES%20DE%20VENTE%20ET%20DE%20TRAVAUX.pdf?alt=media&token=3bf07ac2-6d9e-439a-91d8-f9908003488f'

        this.tick = this.tick.bind(this)
        this.readFile = this.readFile.bind(this)
        this.toggleTerms = this.toggleTerms.bind(this)
        this.startSignature = this.startSignature.bind(this)
        this.verifyUser = this.verifyUser.bind(this)
        this.sendCode = this.sendCode.bind(this)
        this.verifyCode = this.verifyCode.bind(this)
        this.retrySign = this.retrySign.bind(this)
        this.confirmSign = this.confirmSign.bind(this)

        this.state = {
            fileDownloaded: false,
            pdfEditMode: false,

            signatureBase64: null,
            signatureArrayBuffer: null,

            pdfBase64: null,
            pdfArrayBuffer: null,

            newPdfSaved: false,
            newPdfPath: null,
            newAttachment: {
                path: '',
                type: '',
                name: '',
                size: '',
                progress: 0
            },

            pageWidth: 0,
            pageHeight: 0,

            filePath: this.originalFilePath,

            uploading: false,
            loading: false,
            loadingMessage: '',
            toastType: '',
            toastMessage: '',

            showTerms: false,

            showDialog: false,
            status: false,
            statusMessage: '',
            codeApproved: false,
            approvalMessage: '',
            code: 0,

            phoneNumber: '+212621581718',
            timeLeft: 60,

            //Data of proofs
            codeSent: 0,
            signee: '',
            ref: '',
            motif: '',
        }
    }

    async componentDidMount() {
        loadLog(this, true, 'Initialisation de la page...')
        await this.loadOriginalFile(this.originalFilePath)

        if (this.initMode === 'sign')
            this.toggleTerms()
    }

    //1. Download, Read & Load file
    async loadOriginalFile(filePath) {
        const { config, fs } = RNFetchBlob;
        let fileExist = await RNFetchBlob.fs.exists(filePath)
        let downloaded = false
        let read = false

        //Download file
        if (!fileExist) {
            this.setState({ loadingMessage: 'Téléchargement du document...' })
            downloaded = await this.downloadFile(filePath, this.sourceUrl)

            if (downloaded)
                fileExist = true

            else {
                loadLog(this, false, '')
                setToast(this, 'e', "Erreur lors du téléchargement du document, connection internet interrompue ou espace de stockage insuffisant")
                return
            }
        }

        //Read file
        if (fileExist) {
            this.setState({ fileDownloaded: true, loadingMessage: 'Initialisation du document...' })
            read = await this.readFile(filePath)

            if (!read) {
                setToast(this, 'e', 'Erreur lors du chargement du document, veuillez réessayer...')
            }
        }
    }

    async downloadFile(filePath, sourceUrl) {

        const { config } = RNFetchBlob;

        const options = {
            fileCache: true,
            addAndroidDownloads: {
                useDownloadManager: true,
                notification: true,
                path: filePath,
                description: 'Image',
            },
        }

        return config(options).fetch('GET', sourceUrl)
            .then(res => { return true })
            .catch((e) => { return false })
    }

    async readFile(filePath) {
        return await RNFS.readFile(filePath, "base64")
            .then((contents) => {
                this.setState({ pdfBase64: contents, pdfArrayBuffer: base64ToArrayBuffer(contents) })
                return true
            })
            .catch(() => { return false })
            .finally(() => loadLog(this, false, ''))
    }

    //2. Show/hide terms
    toggleTerms() {
        this.setState({ showTerms: !this.state.showTerms })
    }

    //3. OTP verification + Email send
    async verifyUser() {
        this.setState({ showTerms: false, showDialog: true })

        if (this.state.timeLeft > 0 && this.state.timeLeft < 60)
            return

        this.setState({ timeLeft: 60, status: true, statusMessage: "Génération d'un code secure..." })
        const codeSent = await this.sendCode()
        const emailSent = this.sendEmail()
        this.setState({ status: false, statusMessage: "" })

        if (codeSent) {
            console.log('code sent..')
            this.setState({ codeSent })
            this.tick()
        }

        else {
            this.setState({ showDialog: false })
            setToast(this, 'e', "Erreur lors de l'envoie du code, veuillez réessayer...")
        }
    }

    async sendCode() {
        const user = await db.collection('Users').doc(firebase.auth().currentUser.uid).get()
        const phoneNumber = user.data().phone
        this.setState({ phoneNumber })

        const sendCode = functions.httpsCallable('sendCode')
        return await sendCode({ phoneNumber: phoneNumber })
            .then((resp) => {
                //console.log(resp)
                if (resp.data.status === 'pending')
                    return true
            })
            .catch((err) => console.error(err)) //use onCall instead of onRequest
    }

    async verifyCode() {
        this.setState({ status: true, statusMessage: 'Vérification du code...' })

        const phoneNumber = this.state.phoneNumber
        const verifyCode = functions.httpsCallable('verifyCode')

        await verifyCode({ phoneNumber: phoneNumber, code: this.state.code })
            .then((resp) => {
                console.log(resp)
                if (resp.data.status === 'pending') {
                    this.setState({ status: false, statusMessage: '' })
                    Alert.alert('Code non valide', 'Vous avez saisi un code incorrecte.', [{ text: 'OK', style: 'cancel' }], { cancelable: false })
                }

                //UX security
                else if (resp.data.status === 'approved') { //Can a hacker compromise this value and get access to confirmSign function ?
                    setTimeout(() => this.setState({ codeApproved: true, approvalMessage: 'Code approuvé...' }), 0)
                    setTimeout(() => this.setState({ approvalMessage: 'Signature autorisée...' }), 2000)
                    setTimeout(() => this.setState({ showDialog: false }), 4000)
                    setTimeout(() => this.startSignature(), 4200)
                }

                if (resp.data.error)
                    console.error(resp.data.error)
            })
    }

    async sendEmail() {
        const html = emailTemplate(this.sourceUrl)
        const sendMail = functions.httpsCallable('sendMail')

        return await sendMail({ dest: this.currentUser.email, subject: "Vous avez un document à signer.", html: html })
            .then(() => { return true })
            .catch((e) => { return false })
    }

    tick() {
        this.countDown = setInterval(() => {

            let timeLeft = this.state.timeLeft
            // console.log('timeLeft: ' + timeLeft)

            if (timeLeft === 1)
                clearInterval(this.countDown)

            timeLeft -= 1
            this.setState({ timeLeft })
        }, 1000)
    }

    renderDialog = () => {
        let { code, showDialog, codeApproved, status, timeLeft } = this.state
        let disableResend = timeLeft > 0

        if (status || codeApproved)
            return (
                <View style={styles.dialogContainer}>
                    <Dialog.Container visible={this.state.showDialog}>
                        {status && <Dialog.Title style={[theme.customFontMSsemibold.header, { marginBottom: 5 }]}>{this.state.statusMessage}</Dialog.Title>}
                        {codeApproved && <Dialog.Title style={[theme.customFontMSsemibold.header, { marginBottom: 5 }]}>{this.state.approvalMessage}</Dialog.Title>}
                        <ActivityIndicator color={theme.colors.primary} size='small' />
                    </Dialog.Container>
                </View>
            )

        else return (
            <View style={styles.dialogContainer}>
                <Dialog.Container visible={this.state.showDialog}>
                    <Dialog.Title style={[theme.customFontMSsemibold.header, { marginBottom: 5 }]}>Veuillez saisir le code de sécurité que nous vous avons transmis via SMS au +33*******{this.state.phoneNumber.slice(-2)}</Dialog.Title>
                    <Dialog.Input
                        label="Code de confirmation"
                        returnKeyType="done"
                        value={this.state.code}
                        onChangeText={code => this.setState({ code })}
                        //secureTextEntry
                        autoFocus={showDialog} />
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 15, paddingHorizontal: constants.ScreenWidth * 0.03 }}>
                        <TouchableOpacity disabled={disableResend} onPress={this.verifyUser}>
                            <Text style={[theme.customFontMSmedium.body, { color: disableResend ? theme.colors.placeholder : theme.colors.primary }]}>Renvoyer le code</Text>
                        </TouchableOpacity>
                        <Text style={{ color: theme.colors.placeholder }}>00:{timeLeft < 10 && 0}{timeLeft}</Text>
                    </View>

                    <Dialog.Button label="Annuler" onPress={() => this.setState({ showDialog: false })} style={{ color: theme.colors.error }} />
                    <Dialog.Button label="Valider" onPress={async () => await this.verifyCode()} style={{ color: theme.colors.primary }} />
                </Dialog.Container>
            </View>
        )
    }

    //4. Signature process
    startSignature() {
        this.setState({ pdfEditMode: true, toastType: 'info', toastMessage: "Touchez à l'endroit où vous voulez placer la signature." })
    }

    async calculatePaddingTop() {
        const screenWidth = constants.ScreenWidth
        const screenHeight = constants.ScreenHeight

        const pdfDoc = await PDFDocument.load(this.state.pdfArrayBuffer)
        const pages = pdfDoc.getPages()
        const firstPage = pages[0]

        const ratio = firstPage.getHeight() / firstPage.getWidth()

        const pageWidth = screenWidth
        const pageHeight = pageWidth * ratio

        const paddingTop = (screenHeight - pageHeight) / 2

        return paddingTop
    }

    handleSingleTap = async (page, x, y) => {

        if (this.state.pdfEditMode)
            loadLog(this, true, 'Début du processus de signature...')

        setTimeout(async () => {
            if (this.state.pdfEditMode) {
                const paddingTop = await this.calculatePaddingTop()

                this.setState({ filePath: null, pdfEditMode: false, loadingMessage: 'Insertion de la signature...' })

                //Getting tapped page
                const pdfDoc = await PDFDocument.load(this.state.pdfArrayBuffer)
                const pages = pdfDoc.getPages()
                const firstPage = pages[page - 1]

                // The meat
                //const signatureImage = await pdfDoc.embedPng(this.state.signatureArrayBuffer)

                //constants
                const signee = firebase.auth().currentUser.displayName
                const ref = await uuidGenerator()
                const motif = 'Acceptation des conditions'
                const signedAt = moment().format('Do/MM/YYYY, HH:mm')

                this.setState({ signee, signedAt, ref, motif })

                if (Platform.OS == 'android') {
                    // firstPage.drawImage(signatureImage, {
                    //     x: (firstPage.getWidth() * x) / (this.state.pageWidth) - (firstPage.getWidth() * 0.25) / 2,
                    //     y: (firstPage.getHeight() - ((firstPage.getHeight() * y) / this.state.pageHeight)) + paddingTop,
                    //     width: firstPage.getWidth() * 0.25,
                    //     height: firstPage.getWidth() * 0.25 * 0.56,
                    // })

                    firstPage.drawText(`Signé électroniquement par: ${signee} \n Référence: ${ref} \n Date ${signedAt} \n Motif: ${motif}`, {
                        x: (firstPage.getWidth() * x) / (this.state.pageWidth) - 16 * 6,
                        y: (firstPage.getHeight() - ((firstPage.getHeight() * y) / this.state.pageHeight)) + paddingTop + 12 * this.state.pageHeight * 0.005,
                        size: 12,
                        //font: helveticaFont,
                        color: rgb(0, 0, 0),
                    })
                }

                else {
                    // firstPage.drawImage(signatureImage, {
                    //     x: ((pageWidth * (x - 12)) / constants.ScreenWidth),
                    //     y: pageHeight - ((pageHeight * (y + 12)) / 540),
                    //     width: firstPage.getWidth() * 0.1,
                    //     height: firstPage.getHeight() * 0.1,
                    // })

                    firstPage.drawText(`APPROUVÉ LE ${moment().format()} \n Signé electroniquement par: Synergys`, {
                        x: (firstPage.getWidth() * x) / (this.state.pageWidth) - 16 * 6,
                        y: (firstPage.getHeight() - ((firstPage.getHeight() * y) / this.state.pageHeight)) + paddingTop + 16 * 2,
                        size: 12,
                        //font: helveticaFont,
                        color: rgb(0.95, 0.1, 0.1),
                    })
                }

                this.setState({ loadingMessage: 'Génération du document signé...' })
                const pdfBytes = await pdfDoc.save()
                const pdfBase64 = uint8ToBase64(pdfBytes);
                const path = `${Dir}/Synergys/Documents/Scan signé ${moment().format('DD-MM-YYYY HHmmss')}.pdf`

                this.setState({ loadingMessage: 'Enregistrement du document signé...' })
                RNFS.writeFile(path, pdfBase64, "base64")
                    .then((success) => this.setState({ newPdfSaved: true, newPdfPath: path, pdfBase64: pdfBase64, pdfArrayBuffer: base64ToArrayBuffer(pdfBase64), filePath: path }))
                    .catch((err) => setToast(this, 'e', 'Erreur inattendue, veuillez réessayer.'))
                    .finally(() => loadLog(this, false, ''))
            }
        }, 1000)

    }

    //5.1 Retry sign
    async retrySign() {
        //Delete new generated signed pdf from device
        loadLog(this, true, 'Réinitialisation du processus de signature...')
        await this.deleteFileFromLocal(this.state.newPdfPath)
        this.setState({ loadingMessage: 'Chargement du document original...' })
        //Reset original file
        this.setState({ filePath: this.originalFilePath, newPdfPath: null }, async () => {
            await this.loadOriginalFile(this.originalFilePath)
        })
        //start signature
        this.startSignature()
    }

    async deleteFileFromLocal(filePath) {

        await RNFS.exists(filePath).then((result) => {
            if (result)
                return RNFS.unlink(filePath).catch((e) => console.error(e))
        })
            .catch((e) => console.error(e.message))
    }

    //5.2 Confirm sign
    async confirmSign() {

        const result = await this.uploadFile()

        if (result === 'failure') {
            this.setState({ uploading: false })
            setToast(this, 'e', "Erreur lors de l'exportation du document signé, veuillez réessayer.")
            return
        }

        //Data of proofs
        const ipLocalAddress = await NetworkInfo.getIPAddress()
        const ipV4Address = await NetworkInfo.getIPV4Address()
        const macAddress = await DeviceInfo.getMacAddress()
        const android_id = await DeviceInfo.getAndroidId()
        const app_name = await DeviceInfo.getApplicationName()
        const device = await DeviceInfo.getDevice()
        const device_id = await DeviceInfo.getDeviceId()

        //store max of data (Audit) about the signee
        const newAttachment = {
            attachment: this.state.newAttachment,
            createdAt: moment().format('lll'),
            createdBy: { id: this.currentUser.uid, fullName: this.currentUser.displayName },
            generation: 'sign',
            //Data of proofs
            sign_proofs_data: {
                //Code sent
                codeSent: this.state.codeSent,
                //User identity     
                signedBy: { id: this.currentUser.uid, fullName: this.currentUser.displayName },//only when signGenerated = true
                //Timestamp
                signedAt: moment().format('lll'),//only when signGenerated = true
                //Device data
                phoneNumber: this.state.phoneNumber,//only when signGenerated = true
                ipLocalAddress: ipLocalAddress,
                ipV4Address: ipV4Address,
                macAddress: macAddress,
                android_id: android_id,
                app_name: app_name,
                device: device,
                device_id: device_id,
                //Signature reference
                ref: this.state.ref,
                //Other data
                motif: this.state.motif,
            }
        }

        await db.collection('Documents').doc(this.DocumentId).update(newAttachment)
        await db.collection('Documents').doc(this.DocumentId).collection('Attachments').add(newAttachment)
            .finally(() => {
                this.setState({ uploading: false, showDialog: false })
                this.props.navigation.state.params.onGoBack() //refresh document to get url of new signed document
                this.props.navigation.goBack()
            })
    }

    async uploadFile() {
        this.setState({ uploading: true })

        const stats = await RNFetchBlob.fs.stat(this.state.newPdfPath)

        let attachment = {
            path: this.state.newPdfPath,
            type: 'application/pdf',
            name: stats.filename,
            size: stats.size,
            progress: 0
        }

        this.setState({ newAttachment: attachment })

        const metadata = {
            signedAt: moment().format('lll'),
            signedBy: this.currentUser.uid,
            phoneNumber: this.state.phoneNumber
        }

        const reference = firebase.storage().ref(`Projects/${this.ProjectId}/Documents/${this.DocumentType}/${this.DocumentId}/${moment().format('ll')}/${stats.filename}`)
        const uploadTask = reference.putFile(attachment.path, { customMetadata: metadata })

        const promise = new Promise((resolve, reject) => {
            uploadTask
                .on('state_changed', async function (snapshot) {
                    var progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
                    console.log('Upload attachment ' + progress + '% done')
                    attachment.progress = progress / 100
                    this.setState({ attachment })
                }.bind(this))

            uploadTask
                .then((res) => {
                    attachment.downloadURL = res.downloadURL
                    this.setState({ attachment })
                    resolve('success')
                })
                .catch(err => { reject('failure') })
        })

        return promise
    }

    renderAttachment() {
        let attachment = this.state.newAttachment

        let readableSize = attachment.size / 1000
        readableSize = readableSize.toFixed(1)

        return (
            <View style={{ elevation: 1, backgroundColor: theme.colors.gray50, width: '90%', height: 60, alignSelf: 'center', borderRadius: 5, marginTop: 15 }}>
                <View style={{ flex: 0.9, flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ flex: 0.17, justifyContent: 'center', alignItems: 'center' }}>
                        <MaterialCommunityIcons name='pdf-box' size={24} color={theme.colors.primary} />
                    </View>

                    <View style={{ flex: 0.68 }}>
                        <Text numberOfLines={1} ellipsizeMode='middle' style={[theme.customFontMSmedium.body]}>{attachment.name}</Text>
                        <Text style={[theme.customFontMSmedium.caption, { color: theme.colors.placeholder }]}>{readableSize} KB</Text>
                    </View>

                    <View style={{ flex: 0.15, justifyContent: 'center', alignItems: 'center' }} />

                </View>
                <View style={{ flex: 0.1, justifyContent: 'flex-end' }}>
                    <ProgressBar progress={attachment.progress} color={theme.colors.primary} visible={true} />
                </View>
            </View>
        )
    }


    render() {
        let { fileDownloaded, filePath, pdfEditMode, newPdfSaved, showDialog, showTerms, uploading, loading, loadingMessage, toastType, toastMessage } = this.state
        var { canUpdate } = this.props.permissions.documents
        const { isConnected } = this.props.network

        if (uploading) {
            return (
                <View style={styles.container}>
                    <Appbar back={false} title titleText={'Exportation du document signé...'} />
                    {this.renderAttachment()}
                </View>
            )
        }

        else return (
            <View style={styles.container}>
                {!pdfEditMode && <Appbar back={true} title titleText={this.fileName} />}

                {fileDownloaded &&
                    <View style={styles.pdfContainer}>
                        <Pdf
                            minScale={1.0}
                            maxScale={1.0}
                            scale={1.0}
                            spacing={0}
                            fitPolicy={0}
                            enablePaging={true}
                            source={{ uri: filePath }}
                            usePDFKit={false}
                            onLoadComplete={(numberOfPages, filePath, { width, height }) => {
                                this.setState({ pageWidth: width, pageHeight: height })
                            }}
                            onPageSingleTap={(page, x, y) => {
                                console.log('555')
                                this.handleSingleTap(page, x, y)
                            }}
                            style={[styles.pdf]} />
                    </View>
                }

                {!pdfEditMode && filePath &&
                    <View>
                        {newPdfSaved &&
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 5 }}>
                                <TouchableOpacity onPress={this.retrySign} style={[styles.button1, { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 15 }]}>
                                    <Text style={[theme.customFontMSsemibold.body, { color: '#fff', marginLeft: 5 }]}>RÉESSAYER</Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={this.confirmSign} style={[styles.button1, { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 15 }]}>
                                    <Text style={[theme.customFontMSsemibold.body, { color: '#fff', marginLeft: 5 }]}>VALIDER</Text>
                                </TouchableOpacity>
                            </View>}

                        {!newPdfSaved && fileDownloaded && isConnected && canUpdate &&
                            <TouchableOpacity onPress={() => this.setState({ showTerms: true })} style={[styles.button2, { flexDirection: 'row', justifyContent: 'center', paddingVertical: 8 }]}>
                                <FontAwesome5 name='signature' size={17} color='#fff' style={{ marginRight: 7 }} />
                                <Text style={[theme.customFontMSsemibold.header, { color: '#fff', marginLeft: 7, letterSpacing: 1 }]}>SIGNER</Text>
                            </TouchableOpacity>
                        }
                    </View>
                }

                {showTerms &&
                    <TermsConditions
                        showTerms={showTerms}
                        toggleTerms={this.toggleTerms}
                        //acceptTerms={this.verifyUser}
                        acceptTerms={this.startSignature}
                        dowloadPdf={() => {
                            setToast(this, 'i', 'Début du téléchargement...')
                            this.downloadFile(this.termsPath, this.termsURL)
                        }} />}

                {showDialog && this.renderDialog()}
                {loading && <LoadDialog loading={loading} message={loadingMessage} />}

                <Toast
                    duration={3500}
                    message={toastMessage}
                    type={toastType}
                    onDismiss={() => this.setState({ toastMessage: '' })}
                    containerStyle={{ bottom: 0 }} />
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

export default connect(mapStateToProps)(Signature)

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerText: {
        color: "#508DBC",
        fontSize: 20,
        marginBottom: 20,
        alignSelf: "center"
    },
    pdfContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        // backgroundColor: 'pink',
    },
    pdf: {
        flex: 1,
        width: constants.ScreenWidth, //fixed to screen width
        backgroundColor: theme.colors.gray50
    },
    button1: {
        width: constants.ScreenWidth * 0.45,
        height: constants.ScreenWidth * 0.1,
        borderRadius: 5,
        alignItems: "center",
        backgroundColor: theme.colors.primary,
        padding: 10,
        marginVertical: 10
    },
    button2: {
        width: constants.ScreenWidth * 0.9,
        alignSelf: 'center',
        borderRadius: 5,
        alignItems: "center",
        backgroundColor: theme.colors.primary,
        padding: 10,
        marginVertical: 10
    },
    buttonText: {
        color: "#DAFFFF",
    },
    message: {
        alignItems: "center",
        paddingVertical: 2,
        paddingHorizontal: 15,
        backgroundColor: theme.colors.secondary
    },
    color: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'black'
    },
    dialogContainer: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: "center",
        justifyContent: "center",
    }
});




// ***************** OLD CODE *******************************
 // async sendEmail() {
    //     const code = this.state.code
    //     const currentUser = firebase.auth().currentUser

    //     const text = `<div>
    //     <h4>Veuillez confirmer votre identité en saisissant le code suivant dans l'application Synergys afin de continuer la procédure de signature.</h4>
    //     <h2>${code}</h2>
    //     <h4>Si vous ce n'est pas vous, ou bien vous n'avez fourni à nulle personne tierce la permission de signer en votre nom, prière de signaler ce message auprès d'un responsable du Groupe Synergys.</h4>
    //     </div>`

    //     const sendMail = functions.httpsCallable('sendMail')
    //     return await sendMail({ dest: currentUser.email, code: this.state.code, subject: "Signature digitale: Vérification de l'identité", text: text })
    //         .then(() => {
    //             return db.collection('Users').doc(currentUser.uid).update({ signCode: this.state.code })
    //                 .then(() => {
    //                     this.setState({ loadingMessage: 'Code envoyé !' })
    //                     return true
    //                 })
    //         })
    //         .catch((e) => { return false })
    //         .finally(() => loadLog(this, false, ''))
    // }

    // async verifyCode() {
    //     let { signCode } = this.state

    //     await db.collection('Users').doc(firebase.auth().currentUser.uid).get().then((doc) => {

    //         if (doc.data().signCode === signCode) {
    //             this.setState({ showDialog: false })
    //             this.confirmSign()
    //         }

    //         else setToast(this, 'e', 'Code de confirmation invalide.')
    //     })

    // }