import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  BackHandler,
  Platform,
} from 'react-native';
import { ProgressBar } from 'react-native-paper';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {faSignature,faFilePdf} from '@fortawesome/free-solid-svg-icons';
import firebase, { crashlytics } from '../../firebase';
// en haut de votre fichier Signature.js
import { db, functions } from '../../firebase';
import storage from '@react-native-firebase/storage';


import Dialog from 'react-native-dialog';
import _ from 'lodash';
import { connect } from 'react-redux';
//import DeviceInfo from 'react-native-device-info';
import { NetworkInfo } from 'react-native-network-info';

import moment from 'moment';
import 'moment/locale/fr';
moment.locale('fr');

import Pdf from 'react-native-pdf';
import RNFS from 'react-native-fs';
import RNFetchBlob from 'rn-fetch-blob';
import { PDFDocument, rgb } from 'pdf-lib';

import * as theme from '../../core/theme';
import {
  autoSignDocs,
  constants,
  downloadDir,
  errorMessages,
  docsConfig,
  termsUrl,
  isTablet,
  ScreenWidth,
  ScreenHeight,
} from '../../core/constants';
import {
  loadLog,
  setToast,
  uint8ToBase64,
  base64ToArrayBuffer,
  myAlert,
  uuidGenerator,
  displayError,
  downloadFile,
  readFile,
  deleteFile,
} from '../../core/utils';
import { uploadFile } from '../../api/storage-api';
import { script as emailTemplate } from '../../emailTemplates/signatureRequest';

import Appbar from '../../components/Appbar';
import LoadDialog from '../../components/LoadDialog';
import Toast from '../../components/Toast';
import TermsConditions from '../../components/Policies/TermsConditions';
import TermsConditionsModal from '../../components/Policies/TermsConditionsModal';

class Signature extends Component {
  constructor(props) {
    super(props);
    this.currentUser = firebase.auth().currentUser;
    const { route } = this.props;

    // Accès aux paramètres via route?.params
    this.initMode = route?.params?.initMode ?? '';

    // Storage ref url
    this.ProjectId = route?.params?.ProjectId ?? '';
    this.DocumentId = route?.params?.DocumentId ?? '';
    this.DocumentType = route?.params?.DocumentType ?? '';
    this.fileName = route?.params?.fileName ?? '';
    this.sourceUrl = route?.params?.url ?? '';
    this.originalFilePath = `${downloadDir}/Synergys/Documents/${this.fileName}`;

    this.onSignaturePop = route?.params?.onSignaturePop ?? ''; // Navigation pop times when signature is done
    this.attachmentSource = route?.params?.attachmentSource ?? ''; // Navigation pop times when signature is done
    this.canSign = route?.params?.canSign ?? false;

    this.onAcceptTerms = this.onAcceptTerms.bind(this);
    this.init = this.init.bind(this);
    this.tick = this.tick.bind(this);
    this.toggleTerms = this.toggleTerms.bind(this);
    this.startSignature = this.startSignature.bind(this);
    this.verifyUser = this.verifyUser.bind(this);
    this.sendCode = this.sendCode.bind(this);
    this.verifyCode = this.verifyCode.bind(this);
    this.retrySign = this.retrySign.bind(this);
    this.confirmSign = this.confirmSign.bind(this);
    this.uploadFile = uploadFile.bind(this);
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    this.myAlert = myAlert.bind(this);

    BackHandler.addEventListener(
      'hardwareBackPress',
      this.handleBackButtonClick,
    );

    this.state = {
      fileDownloaded: false,
      pdfEditMode: false,

      signatureBase64: null,
      signatureArrayBuffer: null,

      //original
      pdfBase64: null,
      pdfArrayBuffer: null,

      newPdfSaved: false,
      newPdfPath: null,
      signedAttachment: {
        path: '',
        type: '',
        name: '',
        size: '',
        progress: 0,
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
      code: '',

      phoneNumber: '',
      timeLeft: 60,

      //Data of proofs
      signee: '',
      ref: '',
      motif: '',
    };
  }

  async componentDidMount() {
    await this.init();
  }

  componentWillUnmount() {
    BackHandler.removeEventListener(
      'hardwareBackPress',
      this.handleBackButtonClick,
    );
  }

  async init() {
    try {
      loadLog(this, true, 'Initialisation des données...');
      await this.loadOriginalFile();
      if (this.initMode === 'sign') {
        setTimeout(() => {
          this.toggleTerms();
        }, 500)
      }
    } catch (e) {
      displayError({ message: e.message });
    } finally {
      loadLog(this, false, '');
    }
  }

  //1. Download, Read & Load file
  async loadOriginalFile() {
    try {
      const fileExist = await RNFetchBlob.fs.exists(this.originalFilePath);

      if (!fileExist) await this.downloadFile();

      await this.readFile();
    } catch (e) {
      throw new Error(e);
    }
  }

  async downloadFile() {
    try {
      this.setState({ loadingMessage: 'Téléchargement du document...' });
      const updateProgress = (downloadProgress) => {
        const loadingMessage = `Téléchargement en cours... ${downloadProgress.toString()}%`;
        this.setState({ loadingMessage });
      };
      await downloadFile(this.fileName, this.sourceUrl, false, updateProgress);
    } catch (e) {
      throw new Error(e);
    }
  }

  async readFile() {
    try {
      this.setState({
        fileDownloaded: true,
        loadingMessage: 'Initialisation du document...',
      });
      const { pdfBase64, pdfArrayBuffer } = await readFile(this.originalFilePath);
      this.setState({
        pdfBase64,
        pdfArrayBuffer,
        filePath: this.originalFilePath,
      });
    } catch (e) {
      throw new Error(e);
    }
  }

  //2. Show/hide terms
  toggleTerms() {
    const { showTerms } = this.state;
    this.setState({ showTerms: !showTerms });
  }

  async verifyUser() {
  try {
    this.setState({
      showTerms: false,
      showDialog: true,
    });

    // Code OTP et envoi d'email supprimés ici.
    setTimeout(() => this.setState({ showDialog: false }), 4000);
    setTimeout(() => this.startSignature(), 4200);
  } catch (e) {
    setToast(
      this,
      'e',
      "Erreur, veuillez réessayer...",
    );
    this.setState({ showDialog: false });
  }
}

async sendCode() {
  const errorMessage =
    "Erreur lors de l'envoi du code. Veuillez réessayer plus tard";
  try {
    if (!this.ProjectId) throw new Error("ProjectId manquant");

    // 1. Charger le projet et extraire le téléphone (si nécessaire)
    const snap = await db.collection("Projects").doc(this.ProjectId).get();
    if (!snap.exists) throw new Error("Projet introuvable");
    const raw = snap.data().client?.phone || "";
    const clean = '+' + raw.replace(/\D+/g, '');
    console.log("📱 Numéro de téléphone : ", clean);
    this.setState({ phoneNumber: clean });

    // 2. Pas de besoin d'envoyer le code via la Cloud Function
    // Suppression de l'appel de la fonction `sendCode`
  } catch (e) {
    console.error("🚨 Erreur lors de l'envoi du code :", e.code || e.message, e.details);
    throw new Error(errorMessage);
  }
}

async verifyCode() {
  // Suppression de la logique de vérification du code OTP
  // setTimeout(() => this.setState({ showDialog: false }), 4000);
  // setTimeout(() => this.startSignature(), 4200);
}


  sendEmail() {
    const html = emailTemplate(this.sourceUrl);
    const sendMail = functions.httpsCallable('sendEmail');
    return sendMail({
      receivers: this.currentUser.email,
      subject: 'Vous avez un document à signer.',
      html,
      attachments: [],
    });
  }

  tick() {
    this.countDown = setInterval(() => {
      let { timeLeft } = this.state;
      if (timeLeft === 1) clearInterval(this.countDown);
      timeLeft -= 1;
      this.setState({ timeLeft });
    }, 1000);
  }

  renderDialog = () => {
    let { code, showDialog, codeApproved, status, timeLeft } = this.state;
    let disableResend = timeLeft > 0;

    if (status || codeApproved)
      return (
        <View style={styles.dialogContainer}>
          <Dialog.Container visible={this.state.showDialog}>
            {status && (
              <Dialog.Title
                style={[theme.customFontMSsemibold.header, { marginBottom: 5 }]}>
                {this.state.statusMessage}
              </Dialog.Title>
            )}
            {codeApproved && (
              <Dialog.Title
                style={[theme.customFontMSsemibold.header, { marginBottom: 5 }]}>
                {this.state.approvalMessage}
              </Dialog.Title>
            )}
            <ActivityIndicator color={theme.colors.primary} size="small" />
          </Dialog.Container>
        </View>
      );
    else
      return (
        <View style={styles.dialogContainer}>
          <Dialog.Container visible={this.state.showDialog}>
            <Dialog.Title
              style={[theme.customFontMSsemibold.header, { marginBottom: 5 }]}>
              Veuillez saisir le code de sécurité que nous vous avons transmis
              via SMS au +33*******{this.state.phoneNumber.slice(-2)}
            </Dialog.Title>
            <Dialog.Input
              label="Code de confirmation"
              returnKeyType="done"
              value={this.state.code}
              onChangeText={(code) => this.setState({ code: Number(code) })}
              // autoFocus={showDialog}
              autoFocus={false}
            />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingBottom: 15,
                paddingHorizontal: constants.ScreenWidth * 0.03,
              }}>
              <TouchableOpacity
                disabled={disableResend}
                onPress={this.verifyUser}>
                <Text
                  style={[
                    theme.customFontMSmedium.body,
                    {
                      color: disableResend
                        ? theme.colors.placeholder
                        : theme.colors.primary,
                    },
                  ]}>
                  Renvoyer le code
                </Text>
              </TouchableOpacity>
              <Text style={{ color: theme.colors.placeholder }}>
                00:{timeLeft < 10 && 0}
                {timeLeft}
              </Text>
            </View>
            <Dialog.Button
              label="Annuler"
              onPress={() => this.setState({ showDialog: false })}
              style={{ color: theme.colors.error }}
            />
            <Dialog.Button
              label="Valider"
              onPress={async () => await this.verifyCode()}
              style={{ color: theme.colors.primary }}
            />
          </Dialog.Container>
        </View>
      );
  };

  //4. Signature process
  startSignature() {
    this.setState({
      showTerms: false,
      pdfEditMode: true,
      toastType: 'info',
      toastMessage: "Touchez à l'endroit où vous voulez placer la signature.",
    });
  }
  
  calculatePaddingTop(pdfDoc, n) {
    const screenWidth = constants.ScreenWidth;
    const screenHeight = constants.ScreenHeight;
    const pages = pdfDoc.getPages();
    const nthPage = pages[n - 1];
    const ratio = nthPage.getHeight() / nthPage.getWidth();
    const pageWidth = screenWidth;
    const pageHeight = pageWidth * ratio;
    const paddingTop = (screenHeight - pageHeight) / 2;
    return paddingTop > 0 ? paddingTop : 0; // Assure que le padding ne soit pas négatif
  }

  //work on auto sign offre precontractuelle
  handleSingleTap = async (page, x, y, isAuto, signatures) => {
    console.log(`Tap on page: ${page}`);
    console.log(`Coordinates - x: ${x}, y: ${y}`);
  
    const { pdfEditMode } = this.state;
    if (!pdfEditMode) return;
  
    loadLog(this, true, 'Début du processus de signature...');
  
    setTimeout(async () => {
      try {
        const pdfDoc = await PDFDocument.load(this.state.pdfArrayBuffer);
        const pages = pdfDoc.getPages();
  
        this.setState({
          filePath: null,
          pdfEditMode: false,
          loadingMessage: 'Insertion de la signature...',
        });
  
        const signee = firebase.auth().currentUser.displayName;
        const ref = await uuidGenerator();
        const motif = 'Acceptation des conditions';
        const signedAt = moment().format('Do/MM/YYYY, HH:mm');
        const signature = `Signé électroniquement par: ${signee} \nRéférence: ${ref} \nDate: ${signedAt} \nMotif: ${motif}`;
        this.setState({ signee, signedAt, ref, motif });
  
        if (isAuto) {
          for (const s of signatures) {
            const { pageIndex, position } = s;
            const paddingTop = this.calculatePaddingTop(pdfDoc, pageIndex + 1);
            const { x, y, size: customSize } = position;
  
            if (pageIndex < pages.length) {
              pages[pageIndex].drawText(signature, {
                x,
                y: y + paddingTop,
                size: customSize || 10,
                lineHeight: 10,
                color: rgb(0, 0, 0),
              });
            }
          }
        } else {
          const paddingTop = this.calculatePaddingTop(pdfDoc, page);
          const nthPage = pages[page - 1];
          const adjustedX = (nthPage.getWidth() * x) / this.state.pageWidth - 96;
          const adjustedY =
            nthPage.getHeight() -
            (nthPage.getHeight() * y) / this.state.pageHeight +
            paddingTop +
            (isTablet ? 2 : 12) * this.state.pageHeight * 0.005;
  
          nthPage.drawText(signature, {
            x: adjustedX,
            y: adjustedY,
            size: 10,
            lineHeight: 10,
            color: rgb(0, 0, 0),
          });
        }
  
        this.setState({ loadingMessage: 'Génération du document signé...' });
        const pdfBytes = await pdfDoc.save();
        const pdfBase64 = uint8ToBase64(pdfBytes);
        const filePath = `${downloadDir}/Synergys/Documents/Scan signé ${moment().format(
          'DD-MM-YYYY HHmmss'
        )}.pdf`;
  
        this.setState({ loadingMessage: 'Enregistrement du document signé...' });
        await RNFS.writeFile(filePath, pdfBase64, 'base64');
        this.setState({
          newPdfSaved: true,
          newPdfPath: filePath,
          pdfBase64,
          pdfArrayBuffer: base64ToArrayBuffer(pdfBase64),
          filePath,
        });
  
        loadLog(this, false, '');
      } catch (error) {
        console.error('Erreur lors de la signature:', error);
        displayError({ message: errorMessages.pdfGen });
      }
    }, 1000);
  };
  
  //5.1 Retry sign
  async retrySign() {
    try {
      //Delete new generated signed pdf from device
      loadLog(this, true, 'Réinitialisation du processus de signature...');
      await deleteFile(this.state.newPdfPath);
      //Reset to original file
      this.setState({
        filePath: this.originalFilePath,
        newPdfPath: null,
        newPdfSaved: false,
        loadingMessage: 'Chargement du document original...',
      });
      await this.loadOriginalFile();
      loadLog(this, false, '');
      //start signature
      this.startSignature();
    } catch (e) {
      displayError({ message: 'Erreur inattendue. Veuillez réessayer.' });
    }
  }

  //5.2 Confirm sign
  async confirmSign() {
    try {
      await this.uploadSignedFile();
      //Data of proofs
      const ipLocalAddress = await NetworkInfo.getIPAddress() || "";
      const ipV4Address = await NetworkInfo.getIPV4Address() || "";
      // const macAddress = await DeviceInfo.getMacAddress() || "";
      // const android_id = await DeviceInfo.getAndroidId() || "";
      // const app_name = await DeviceInfo.getApplicationName() || "";
      // const device = await DeviceInfo.getDevice() || "";
      // const device_id = await DeviceInfo.getDeviceId() || "";

      const { signedAttachment, phoneNumber, ref, motif } = this.state;

      //store max of data (Audit) about the signee
      let document = {
        attachment: signedAttachment,
        attachmentSource: 'signature',
        signedAt: moment().format(), //only when signGenerated = true
      }

      if (Platform.OS === "android") {
        document.sign_proofs_data = {
          //User identity
          signedBy: {
            id: this.currentUser.uid,
            fullName: this.currentUser.displayName,
            email: this.currentUser.email,
            role: this.props.role.value,
          },
          //only when signGenerated = true
          //Timestamp
          signedAt: moment().format(), //only when signGenerated = true
          //Device data
          phoneNumber, //only when signGenerated = true
          ipLocalAddress,
          ipV4Address,
       //   macAddress,
          //android_id,
          //app_name,
          // device,
          // device_id,
          //Signature reference
          ref,
          //Other data
          motif,
        }
      }

      await db
        .collection('Documents')
        .doc(this.DocumentId)
        .set(document, { merge: true });
      await db
        .collection('Documents')
        .doc(this.DocumentId)
        .collection('AttachmentHistory')
        .add(document);
       this.props.route.params.onGoBack &&
         this.props.route.params.onGoBack(); //refresh document to get url of new signed document
       this.props.navigation.pop(this.onSignaturePop);
    } catch (e) {

      // crashlytics.log(document)
      // crashlytics.recordError(e, "Erreur d'importation de document signé")

      setToast(
        this,
        'e',
        e.message,
      );
    } finally {
      this.setState({ uploading: false });
    }
  }

  async uploadSignedFile() {
    try {
      this.setState({ uploading: true });
  
      // 1. Récupérer les infos du fichier avec react-native-fs
      const stats = await RNFS.stat(this.state.newPdfPath);
 
      const filePath = stats.path;                    // "/storage/.../Scan signé 06-05-2025 171032.pdf"
      const fileName = filePath.substring(filePath.lastIndexOf('/') + 1); 
      
      const signedAttachment = {
        path: filePath,
        type: 'application/pdf',
        name: fileName,
        size: stats.size,
        progress: 0,
        ref: 'signedAttachment',
      };
      this.setState({ signedAttachment });
  
      // 2. Préparer les métadonnées custom
      const metadata = {
        contentType: 'application/pdf',
        customMetadata: {
          signedAt: moment().toISOString(),
          signedBy: this.currentUser.uid,
          phoneNumber: this.state.phoneNumber,
        },
      };
  
      // 3. Construire le chemin de storage
      const storageRefPath = `Projects/${this.ProjectId}/Documents/${this.DocumentType}/${this.DocumentId}/${moment().format('DD-MM-YYYY')}/${signedAttachment.name}`;
      const ref = storage().ref(storageRefPath);
  
      // 4. Démarrer l'upload via putFile qui accepte un chemin local
      const task = ref.putFile(signedAttachment.path, metadata);
  
      // 5. Écouter la progression
      task.on('state_changed', taskSnapshot => {
        const progress = taskSnapshot.bytesTransferred / taskSnapshot.totalBytes;
        this.setState(prev => ({
          signedAttachment: {
            ...prev.signedAttachment,
            progress,
          }
        }));
      });
  
      // 6. Attendre la fin de l’upload
      await task;
  
      // 7. Récupérer l’URL de téléchargement si besoin
      const downloadURL = await ref.getDownloadURL();
  
      // 8. Mettre à jour l’état et retourner l’objet result
      this.setState({ uploading: false });
      return { signedAttachment, downloadURL };
  
    } catch (e) {
      console.error('uploadSignedFile error:', e);
      this.setState({ uploading: false });
      throw new Error("Erreur lors de l'importation du document.");
    }
  }

  renderAttachment() {
    let attachment = this.state.signedAttachment;
    let readableSize = attachment.size / 1000;
    readableSize = readableSize.toFixed(1);

    return (
      <View
        style={{
          backgroundColor: theme.colors.gray50,
          width: '90%',
          height: 60,
          alignSelf: 'center',
          borderRadius: 5,
          marginTop: 15,
          ...theme.style.shadow,
        }}>
        <View style={{ flex: 0.9, flexDirection: 'row', alignItems: 'center' }}>
          <View
            style={{
              flex: 0.17,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
      
            <FontAwesomeIcon icon={faFilePdf} 
            size={24}
            color={theme.colors.primary}/>
          </View>
          <View style={{ flex: 0.68 }}>
            <Text
              numberOfLines={1}
              ellipsizeMode="middle"
              style={[theme.customFontMSmedium.body,{color:'gray'}]}>
              {attachment.name}
            </Text>
            <Text
              style={[
                theme.customFontMSmedium.caption,
                { color: theme.colors.placeholder },
              ]}>
              {readableSize} KB
            </Text>
          </View>
          <View
            style={{ flex: 0.15, justifyContent: 'center', alignItems: 'center' }}
          />
        </View>
        <View style={{ flex: 0.1, justifyContent: 'flex-end' }}>
          <ProgressBar
            progress={attachment.progress}
            color={theme.colors.primary}
            visible={true}
          />
        </View>
      </View>
    );
  }

  handleBackButtonClick() {
    const { newPdfSaved } = this.state;

    if (newPdfSaved) {
      try {
        const title = 'Annuler la signature';
        const message = 'La signature ne sera pas enregistré';
        const handleConfirm = () => this.props.navigation.goBack(null);
        const handleCancel = () => console.log('dismiss');
        this.myAlert(title, message, handleConfirm, handleCancel);
      } catch (e) {
        console.log(e);
      }
    } else this.props.navigation.goBack(null);
    return true;
  }

  onAcceptTerms() {
    //Auto Sign
    const isAutoSign = autoSignDocs.includes(this.DocumentType); //#task: add isGenerated as condition + remove Offre précontractuelle & Facture
    const isGenerated = this.attachmentSource === 'generation';

    console.log("isAutoSign", isAutoSign)
    console.log("isGenerated", isGenerated)
    if (isGenerated && isAutoSign) {
      const config = docsConfig(0);
      const { signatures } = config[this.DocumentType];
      console.log("signatures", signatures)
      this.setState(
        {
          showTerms: false,
          pdfEditMode: true,
        },
        () => this.handleSingleTap(null, null, null, true, signatures),
      );
    } else this.startSignature();
    //#task: Replace this.startSignature by this.verifyUser
  }

  renderPDF() {
    const { filePath } = this.state;

    return (
      <View style={styles.pdfContainer}>
        <Pdf
          minScale={1.0}
          maxScale={1.0}
          scale={1.0}
          spacing={0}
          fitPolicy={0}
          enablePaging={true}
          source={{ uri: filePath }}
          usePDFKit={true}
          onLoadComplete={(numberOfPages, filePath, { width, height }) => {
            console.log('W', width);
            console.log('H', height);
            this.setState({ pageWidth: width, pageHeight: height });
          }}
          onPageSingleTap={(page, x, y) => {
            this.handleSingleTap(page, x, y, false, []);
          }}
          style={[styles.pdf]}
        />
      </View>
    );
  }

  render() {
    const {
      fileDownloaded,
      filePath,
      pdfEditMode,
      newPdfSaved,
      showDialog,
      showTerms,
      uploading,
      loading,
      loadingMessage,
      toastType,
      toastMessage,
    } = this.state;
    var { canUpdate } = this.props.permissions.documents;
    const { isConnected } = this.props.network;

    if (uploading) {
      return (
        <View style={styles.container}>
          <Appbar back title titleText={'Importation du document signé...'} />
          {this.renderAttachment()}
        </View>
      );
    } else
      return (
        <View style={styles.container}>
          {!pdfEditMode && (
            <Appbar
              back={true}
              title
              titleText={this.fileName}
              customBackHandler={this.handleBackButtonClick}
            />
          )}
          {fileDownloaded && filePath && this.renderPDF()}
          {!pdfEditMode && filePath && (
            <View>
              {newPdfSaved && (
                <View style={styles.buttonsContainer}>
                  <TouchableOpacity
                    onPress={this.retrySign}
                    style={[
                      styles.button1,
                      {
                        backgroundColor: theme.colors.white,
                        borderWidth: StyleSheet.hairlineWidth,
                        borderColor: theme.colors.gray_dark,
                      },
                    ]}>
                    <Text
                      style={[
                        theme.customFontMSsemibold.body,
                        { color: theme.colors.gray_dark, marginLeft: 5 },
                      ]}>
                      RÉESSAYER
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={this.confirmSign}
                    style={[
                      styles.button1,
                      { backgroundColor: theme.colors.primary },
                    ]}>
                    <Text
                      style={[
                        theme.customFontMSsemibold.body,
                        { color: '#fff', marginLeft: 5 },
                      ]}>
                      VALIDER
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {!newPdfSaved && fileDownloaded && isConnected && canUpdate && (
                <TouchableOpacity
                  onPress={() => this.setState({ showTerms: true })}
                  style={styles.button2}>
                
                  <FontAwesomeIcon icon={faSignature}  size={17}
                    color="#fff"
                    style={{ marginRight: 7 }}/>
                  <Text
                    style={[
                      theme.customFontMSsemibold.header,
                      { color: '#fff', marginLeft: 7, letterSpacing: 1 },
                    ]}>
                    SIGNER
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          {showTerms && (
            <TermsConditionsModal
              showTerms={showTerms}
              toggleTerms={this.toggleTerms}
              acceptTerms={this.verifyUser}
              //acceptTerms={this.onAcceptTerms}
              downloadPdf={() => {
                setToast(this, 'i', 'Début du téléchargement...');
                const fileName = 'Termes-et-conditions-générales-de-signature';
                downloadFile(fileName, termsUrl, true);
              }}
            />
          )}
          {showDialog}
          {loading && <LoadDialog loading={loading} message={loadingMessage} />}
          <Toast
            duration={3500}
            message={toastMessage}
            type={toastType}
            onDismiss={() => this.setState({ toastMessage: '' })}
            containerStyle={{ bottom: 0, zIndex: 10 }}
          />
        </View>
      );
  }
}

const mapStateToProps = (state) => {
  return {
    role: state.roles.role,
    permissions: state.permissions,
    network: state.network,
    //fcmToken: state.fcmtoken
  };
};

export default connect(mapStateToProps)(Signature);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerText: {
    color: '#508DBC',
    fontSize: 20,
    marginBottom: 20,
    alignSelf: 'center',
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
    backgroundColor: theme.colors.gray50,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
  },
  button1: {
    width: constants.ScreenWidth * 0.45,
    height: constants.ScreenWidth * 0.1,
    marginVertical: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  button2: {
    width: constants.ScreenWidth * 0.45,
    height: constants.ScreenWidth * 0.1,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
    marginVertical: 10,
    marginRight: theme.padding,
    flexDirection: 'row',
    alignSelf: 'flex-end',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#DAFFFF',
  },
  message: {
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 15,
    backgroundColor: theme.colors.secondary,
  },
  color: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'black',
  },
  dialogContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
