import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Keyboard,
  Alert,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { connect } from 'react-redux';
import _ from 'lodash';
import {
  faCashRegister,
  faCheckCircle,
  faEnvelopeOpenDollar,
  faExclamationTriangle,
  faHandsUsd,
  faInfoCircle,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';

import moment from 'moment';
import 'moment/locale/fr';
moment.locale('fr');

import FormSection from '../../components/FormSection';
import ActivitySection from '../../containers/ActivitySection';
import Appbar from '../../components/Appbar';
import MyInput from '../../components/TextInput';
import Picker from '../../components/Picker';
import ItemPicker from '../../components/ItemPicker';
import Button from '../../components/Button';
import EmptyList from '../../components/EmptyList';
import Loading from '../../components/Loading';
import SummaryRow from "./components/SummaryRow"
import SummarySeparator from "./components/SummarySeparator"
import { setAppToast } from "../../core/redux";
import { calculateSubTotal, calucluateSubTotalOfProducts, calculateTaxes, calculateTotalNetHT, calculateDiscountValue, calculateTotalTTC, calculateTotalNet, roundPrice } from "./core/utils"

import { db } from '../../firebase';
import {
  generateId,
  navigateToScreen,
  myAlert,
  nameValidator,
  load,
  articles_fr,
  isEditOffline,
  refreshProject,
  formatDocument,
  unformatDocument,
  formatPrice,
  docType_LabelValueMap
} from '../../core/utils';
import * as theme from '../../core/theme';
import { constants, highRoles } from '../../core/constants';
import { fetchDocument } from '../../api/firestore-api';
import { CustomIcon } from '../../components';

const states = [
  { label: 'Terminé', value: 'Terminé' },
  { label: 'En cours', value: 'En cours' },
  { label: 'Annulé', value: 'Annulé' },
];
const discounts = [
  { label: '0', value: '0' },
  { label: '5', value: '5' },
  { label: '10', value: '10' },
  { label: '15', value: '15' },
];
const properties = [
  'project',
  'state',
  'orderLines',
  'taxes',
  'primeCEE',
  'primeRenov',
  'aidRegion',
  'discount',
  'validated',
  'createdAt',
  'createdBy',
  'editedAt',
  'editedBy',
];
const masculins = ['Devis', 'Bon de commande', 'Dossier CEE'];
const warningMessage =
  "Attention, la tarification appliquée n'est pas conforme, veuillez notifier votre responsable d'agence pour valider.";
const confirmMessage =
  "La remise a été validé par votre responsable d'agence. Vous pouvez continuer.";
const pendingMessageAdmin = 'Valider la remise appliquée par votre commercial.';
const pendingMessageCom =
  'Le service technique a été notifié. Veuillez patienter ou bien contactez le par téléphone...';


class CreateOrder extends Component {
  constructor(props) {
    super(props);
    this.refreshOrderLine = this.refreshOrderLine.bind(this);
    this.refreshProject = refreshProject.bind(this);
    this.calculatePrices = this.calculatePrices.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.runOrderListener = this.runOrderListener.bind(this);
    this.generatePdf = this.generatePdf.bind(this);
    this.myAlert = myAlert.bind(this);
    this.showAlert = this.showAlert.bind(this);
    this.setDiscountPopUp = this.setDiscountPopUp.bind(this);
    this.onPressDiscountPopUp = this.onPressDiscountPopUp.bind(this);
    this.cancelDiscount = this.cancelDiscount.bind(this);

    this.initialState = {};
    this.isInit = true;
    this.isHighrole = highRoles.includes(this.props.role.id);

    //Generate pdf
    const { route } = this.props;
    this.autoGenPdf = route?.params?.autoGenPdf ?? false;
    this.docType = route?.params?.docType ?? '';
    this.popCount = route?.params?.popCount ?? 1; // Pour la génération de PDF

    this.titleText = route?.params?.titleText ?? '';
    this.OrderId = route?.params?.OrderId ?? '';
    this.isEdit = this.OrderId !== '' ? true : false;
    this.OrderId = this.isEdit ? this.OrderId : generateId('GS-CO-');
    const docTypelabel = docType_LabelValueMap(this.docType)
    this.titleText = `Création ${articles_fr("d'un", masculins, docTypelabel)} ${docTypelabel}`;
    this.title = this.autoGenPdf
      ? this.titleText
      : this.isEdit
        ? 'Modifier la commande'
        : 'Nouvelle commande';

    //Params (order properties)
    this.project = route?.params?.project ?? undefined;

    this.state = {
      //Screens
      project: this.project || { id: '', name: '' },
      projectError: '',
      client: { id: '', fullName: '' },

      //Pickers
      state: 'En cours',

      //Order Lines
      orderLines: [],
      //[{ "description": "", "price": "500", "product": { "brand": [Object], "category": "Catégorie 2", "createdAt": "2021-05-11T18:22:13+00:00", "createdBy": [Object], "deleted": false, "description": "", "editedAt": "2021-05-11T18:22:13+00:00", "editedBy": [Object], "hasPendingWrites": false, "id": "GS-AR-F83f", "name": "Produit 1", "price": "500", "taxe": "", "type": "product" }, "quantity": "1", "taxe": { "name": "", "rate": "", "value": 0 } }],
      checked: 'first',
      subTotal: 0,
      subTotalProducts: 0,
      taxe: 0,
      taxes: [],
      total: 0,
      primeCEE: 0,
      primeRenov: 0,
      aidRegion: 0,
      discount: 0,
      discountError: '',
      validated: true,

      //Prices Summary
      totalNetHT: 0,
      totalTTC: 0,
      totalNet: 0,

      discountValidationStep: '',
      enableSubmit: true,

      //logs
      createdBy: { id: '', fullName: '' },
      createdAt: '',
      editedBy: { id: '', fullName: '' },
      editededAt: '',

      loading: true,
      docNotFound: false,

      showDialog: false,
      order: null,
      pdfType: '',
      docType: this.docType,
    };
  }

  //FETCH-INITIALIZE
  async componentDidMount() {

    // setProducts();
    if (this.isEdit)
      await this.initEditMode();
    this.initialState = _.cloneDeep(this.state);
    load(this, false);
  }

  async initEditMode() {
    let order = await fetchDocument('Orders', this.OrderId);
    this.setState({ order }); //For pdf generation
    order = await this.setOrder(order);
    if (!order) return;
    this.calculatePrices(order.orderLines);
    if (!order.validated) {
      //Validation pending...
      this.setDiscountPopUp();
      this.runOrderListener();
    }
  }

  setOrder(order) {
    if (!order) this.setState({ docNotFound: true });
    else {
      order = formatDocument(order, properties);
      this.setState(order);
    }
    return order;
  }

  setDiscountPopUp() {
    if (this.isHighrole) var discountValidationStep = 'pendingAdmin';
    else var discountValidationStep = 'pendingCom';
    this.setState({ discountValidationStep });
  }

  //DELETE
  showAlert() {
    const title = 'Supprimer la commande';
    const message =
      'Etes-vous sûr de vouloir supprimer cette commande ? Cette opération est irreversible.';
    const handleConfirm = () => this.handleDelete();
    this.myAlert(title, message, handleConfirm);
  }

  async handleDelete() {
    load(this, true);
    this.title = 'Suppression de la commande...';
    db.collection('Orders').doc(this.OrderId).update({ deleted: true });
    //Refreshing orders list
    if (this.props.navigation.state.params.onGoBack) {
      this.props.navigation.state.params.onGoBack();
    }
    load(this, false);
    this.props.navigation.goBack();
  }

  //VALIDATE
  validateOrderLines() {
    if (this.state.orderLines.length === 0) {
      const errorTitle = 'Erreur de saisie';
      const errorMessage = 'Veuillez ajouter au moins une ligne de commande';
      Alert.alert(errorTitle, errorMessage);
      return errorTitle;
    } else return null;
  }

  validateInputs() {
    let { orderLines, project, discount, errors } = this.state;

    const projectError = nameValidator(project.id, '"Projet"');
    const orderLinesError = this.validateOrderLines();
    const discountError =
      discount > 15 ? 'La remise ne peut excéder 15% du prix initial' : '';

    if (projectError || discountError || orderLinesError) {
      this.setState({ projectError, discountError, loading: false });
      return false;
    }

    return true;
  }

  //POST

  async handleSubmit(notifyAdmin) {
    Keyboard.dismiss();
    const { isConnected } = this.props.network;
    let isEditOffLine = isEditOffline(this.isEdit, isConnected);
    if (isEditOffLine) return;

    //Disable submit onPress for the following cases...
    const disableSubmit =
      this.state.loading ||
      (_.isEqual(this.state, this.initialState) && !this.autoGenPdf) ||
      this.state.discountValidationStep === 'pendingCom' ||
      this.state.discountValidationStep === 'pendingAdmin';
    if (disableSubmit) return;

    load(this, true);

    //0. Validate inputs
    const isValid = this.validateInputs();
    if (!isValid) return;

    //1. Verify if Discount was applied BY A COMMERCIAL
    const isAdminValidationRequired =
      !notifyAdmin && this.checkDiscountValidation();
    if (isAdminValidationRequired) {
      this.setState({ discountValidationStep: 'warning' });
      load(this, false);
      return;
    }

    // //POSEUR & COMMERCIAL PHASES UPDATES PRIVILEGES: Check if user has privilege to update selected project
    // const currentRole = this.props.role.id
    // const isBlockedUpdates = blockRoleUpdateOnPhase(currentRole, this.state.project.step)
    // if (isBlockedUpdates) {
    //     Alert.alert('Accès refusé', `Utilisateur non autorisé à modifier un projet dans la phase ${this.state.project.step}.`)
    //     load(this, false)
    //     return
    // }

    //Set order
    const properties = [
      'project',
      'state',
      'orderLines',
      'subTotal',
      'subTotalProducts',
      'taxes',
      'primeCEE',
      'primeRenov',
      'aidRegion',
      'discount',
      'total',
      'validated',
    ];
    let order = unformatDocument(
      this.state,
      properties,
      this.props.currentUser,
      this.isEdit,
    );
    order.validated = !notifyAdmin;

    db.collection('Orders').doc(this.OrderId).set(order, { merge: true }); //#task: run trigger CF to notify responsable agence (with link of this order so he can validate it)

    if (notifyAdmin) {
      this.setState({ enableSubmit: false });
      this.runOrderListener();
      load(this, false);
    } else if (!this.autoGenPdf) {
      //Refreshing orders list
      if (this.props.navigation.state.params.onGoBack) {
        this.props.navigation.state.params.onGoBack();
      }
      this.props.navigation.goBack();
    }

    //#task: Store order to be able to generate pdf in case user goes back from PdfGeneration
    else
      this.setState({ order, loading: false }, () =>
        this.generatePdf(order, this.state.docType),
      );
  }

// PDF GEN
generatePdf(order, docType) {
  const { route } = this.props;

  const navParams = {
      order,
      docType,
      project: this.state.project,
      popCount: this.popCount,
      DocumentId: route?.params?.DocumentId ?? '',
      onGoBack: route?.params?.onGoBack ?? null,
  };

  this.props.navigation.navigate('PdfGeneration', navParams);
}


  //Helpers
  refreshOrderLine(orderLine, overwriteIndex) {
    let { orderLines } = this.state;
    if (overwriteIndex.toString())
      orderLines[overwriteIndex] = orderLine;
    else
      orderLines.push(orderLine);
    this.calculatePrices(orderLines);
  }

  removeOrderLine(key) {
    let { orderLines } = this.state;
    orderLines.splice(key, 1);
    this.calculatePrices(orderLines);
  }

  calculatePrices(orderLines) {
    const subTotal = calculateSubTotal(orderLines)
    console.log("9999999_____", typeof (subTotal))
    const subTotalProducts = calucluateSubTotalOfProducts(orderLines)
    const taxes = calculateTaxes(orderLines);
    this.setState({
      subTotal,
      subTotalProducts,
      taxes
    })
  }

  //RENDERERS

  renderSeparator(isShow) {
    if (!isShow) return
    return (
      <SummarySeparator />
    )
  }

  renderSummary() {
    //totalNetHT,
    const {
      taxes,
      subTotal,
      subTotalProducts,
      primeCEE,
      primeRenov,
      aidRegion,
      discount,
    } = this.state;
    const showTotalNetHT = discount > 0;
    //Discount is applied on products only (not on options)
    const discountValue = calculateDiscountValue(subTotalProducts, discount)
    const totalNetHT = calculateTotalNetHT(subTotal, discountValue)
    const totalTTC = calculateTotalTTC(totalNetHT, taxes)
    const totalNet = calculateTotalNet(totalTTC, primeCEE, primeRenov, aidRegion)

    //Show separators
    const showFirstSeparator = true
    const showSecondSeparator = showTotalNetHT
    const showThirdSeparator = primeCEE > 0 || primeRenov > 0 || aidRegion > 0
    const showFourthSeparator = true

    return (
      <View style={{ marginTop: theme.padding }}>
        {this.renderSubTotal(subTotal)}
        {this.renderSeparator(showFirstSeparator)}
        {this.renderRemise(discount, discountValue)}
        {this.renderTotalNetHT(showTotalNetHT, totalNetHT)}
        {this.renderSeparator(showSecondSeparator)}
        {this.renderTaxes(taxes)}
        {this.renderTotalTTC(totalTTC)}
        {this.renderSeparator(showThirdSeparator)}
        {this.renderPrimeCEE(primeCEE)}
        {this.renderPrimeRenov(primeRenov)}
        {/* {this.renderAideRegion(aidRegion)} */}
        {this.renderSeparator(showFourthSeparator)}
        {this.renderTotalNet(totalNet)}
      </View>
    );
  }

  renderOrderLines(canWrite) {
    const { orderLines } = this.state;

    return (
      <View style={styles.customTagsContainer}>
        {orderLines.map((orderLine, key) => {
          const totalAmount =
            Number(orderLine.quantity) * Number(orderLine.price);
          const tva =
            orderLine.taxe.name !== '' ? `(+ ${orderLine.taxe.name}% TVA)` : '';

          return (
            <TouchableOpacity
              key={key.toString()}
              onPress={() => {
                if (!canWrite) return;
                navigateToScreen(this, 'AddItem', {
                  orderLine,
                  orderKey: key,
                  onGoBack: this.refreshOrderLine,
                });
              }}
              style={styles.orderLine}>
              {canWrite && (
                <TouchableOpacity
                  style={{
                    flex: 0.1,
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                  }}
                  onPress={() => this.removeOrderLine(key)}>
                  <MaterialCommunityIcons
                    name="close-circle-outline"
                    color={theme.colors.error}
                    size={20}
                  />
                </TouchableOpacity>
              )}

              <View style={{ flex: canWrite ? 0.65 : 0.75 }}>
                <Text style={theme.customFontMSmedium.body}>
                  {orderLine.product.name}
                </Text>
                <Text
                  style={[
                    theme.customFontMSregular.caption,
                    { color: theme.colors.placeholder },
                  ]}>
                  {orderLine.quantity} x {orderLine.price} {tva}
                </Text>
              </View>

              <View style={{ flex: 0.25, alignItems: 'flex-end' }}>
                <Text style={theme.customFontMSmedium.body}>
                  €{totalAmount}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  renderSubTotal(subTotal) {
    return (
      <SummaryRow
        label="Total H.T"
        valuePrefix="€"
        value={subTotal}
      />
    )
  }

  renderRemise(discount, discountValue) {
    if (discount <= 0)
      return null
    return (
      <SummaryRow
        label={`Remise (${discount}%)`}
        valuePrefix="- €"
        value={roundPrice(discountValue)}
      />
    )
  }

  renderTotalNetHT(showTotalNetHT, totalNetHT) {
    if (!showTotalNetHT) return null
    return (
      <SummaryRow
        label="Total Net HT"
        valuePrefix="€"
        value={totalNetHT}
      />
    )
  }

  renderTotalTTC(totalTTC) {
    return (
      <SummaryRow
        label="Total T.T.C"
        valuePrefix="€"
        value={totalTTC}
        textTheme={theme.customFontMSmedium.body}
        labelStyle={{ color: theme.colors.secondary }}
      />
    )
  }

  renderPrimeCEE(primeCEE) {
    const showPrimeCee = primeCEE > 0
    if (!showPrimeCee) return null
    return (
      <SummaryRow
        label="Prime Cee"
        valuePrefix="- €"
        value={primeCEE}
      />
    )
  }

  renderPrimeRenov(primeRenov) {
    const showPrimeRenov = primeRenov > 0
    if (!showPrimeRenov) return null
    return (
      <SummaryRow
        label="Maprime Rénov"
        valuePrefix="- €"
        value={primeRenov}
      />
    )
  }

  renderAideRegion(aidRegion) {
    const showAideRegion = aidRegion > 0
    if (!showAideRegion) return null
    return (
      <SummaryRow
        label="Aides région"
        valuePrefix="- €"
        value={aidRegion}
      />
    )
  }

  renderTotalNet(totalNet) {
    return (
      <SummaryRow
        label="Net à payer"
        valuePrefix="€"
        value={roundPrice(totalNet)}
        textTheme={theme.customFontMSmedium.body}
        labelStyle={{ color: theme.colors.secondary }}
      />
    )
  }

  renderTaxes(taxes) {
    if (taxes.length === 0) return null;
    return taxes.map((taxe) => {
      let { name, value } = taxe;
      value = formatPrice(value)
      if (!name) return null;
      return (
        <SummaryRow
          label={`TVA (${taxe.name}%)`}
          valuePrefix="€"
          value={value}
        />
      );
    });
  }

  //DISCOUNT VALIDATION
  checkDiscountValidation() {
    const currentRole = this.props.role.id;
    const isAdminValidationRequired =
      this.state.discount > 0 && currentRole === 'com';
    return isAdminValidationRequired;
  }

  runOrderListener() {
    //Listener: To know when the Responsible validates the discount
    const query = db.collection('Orders').doc(this.OrderId);
    this.orderListener = query.onSnapshot((doc) => {
      const { discount, validated } = doc.data();
      let discountValidationStep = '';
      const pendingStep = this.isHighrole ? 'pendingAdmin' : 'pendingCom';

      if (discount === 0) {
        const toast = { message: "Remise annulée", type: "error" }
        setAppToast(this, toast)
      }
      else
        discountValidationStep =
          !doc.exists || !validated
            ? pendingStep
            : this.isHighrole
              ? ''
              : 'confirmed';

      this.setState({ discountValidationStep, discount, validated });

      const unsubscribe =
        discount === 0 || discountValidationStep === 'confirmed';
      if (unsubscribe) this.orderListener();
    });
  }

  cancelDiscount() {
    const discount = 0;
    if (this.state.discountValidationStep !== 'warning') {
      //Remote
      db.collection('Orders')
        .doc(this.OrderId)
        .update({ discount, validated: true });
      this.setState({ enableSubmit: true });
    } else this.setState({ discount, discountValidationStep: '' }); //Local
  }

  onPressDiscountPopUp() {
    const { enableSubmit } = this.state;
    if (!enableSubmit) return;
    //Admin Validation
    if (this.isHighrole) {
      db.collection('Orders').doc(this.OrderId).update({ validated: true }); //#task: notify commercial
      const toast = { message: "La remise a été validé !", type: "success" }
      setAppToast(this, toast)
      this.setState({ discountValidationStep: '' });
    }
    //Commercial discount request
    else if (this.state.discountValidationStep === 'warning')
      this.handleSubmit(true);
    //Hide popup
    else if (this.state.discountValidationStep === 'confirmed')
      this.setState({ discountValidationStep: '' });
  }

  renderAdminValidationPopUp() {
    const { discountValidationStep } = this.state;
    if (discountValidationStep === '') return null;

    const isWarning = discountValidationStep === 'warning';
    const isPendingCom = discountValidationStep === 'pendingCom';
    const isPendingAdmin = discountValidationStep === 'pendingAdmin';
    const isConfirm = discountValidationStep === 'confirmed';
    const isCancelable = isWarning || isPendingCom || isPendingAdmin;
    const isSubmittable = isWarning || isPendingAdmin;

    const backgroundColor = isWarning
      ? theme.colors.error
      : isPendingCom
        ? '#616161'
        : 'green';
    const widthButton = constants.ScreenWidth * 0.5 - theme.padding * 1.75;

    return (
      <View style={[styles.discountPopUp, { backgroundColor }]}>
        <View style={{ flexDirection: 'row' }}>
          <View style={{ justifyContent: 'center', paddingRight: theme.padding }}>
            <CustomIcon
              icon={isWarning ? faExclamationTriangle : faCheckCircle}
              color="white"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={[
                theme.customFontMSsemibold.caption,
                { color: theme.colors.white },
              ]}>
              {isWarning && warningMessage}
              {isConfirm && confirmMessage}
              {isPendingAdmin && pendingMessageAdmin}
              {isPendingCom && pendingMessageCom}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {isCancelable && (
            <Button
              mode="outlined"
              onPress={this.cancelDiscount}
              style={[
                styles.discountCancelButton,
                { backgroundColor, width: widthButton },
              ]}
              labelStyle={{ color: theme.colors.white }}>
              {isWarning || isPendingCom
                ? 'Annuler'
                : isPendingAdmin
                  ? 'Refuser'
                  : ''}
            </Button>
          )}
          {isSubmittable && (
            <Button
              mode="outlined"
              onPress={this.onPressDiscountPopUp}
              style={[
                styles.discountCancelButton,
                { backgroundColor, width: widthButton },
              ]}
              labelStyle={{ color: theme.colors.white }}>
              {isWarning ? 'Notifier' : isPendingAdmin ? 'Valider' : ''}
            </Button>
          )}
        </View>

        {isConfirm && (
          <CustomIcon
            icon={faTimes}
            size={16}
            color="white"
            style={{ position: 'absolute', right: 8, top: 8 }}
          />
        )}
      </View>
    );
  }
  //---------------------------//

  render() {
    const {
      project,
      state,
      client,
      orderLines,
      primeCEE,
      primeRenov,
      aidRegion,
      discount,
      createdAt,
      createdBy,
      editedAt,
      editedBy,
      projectError,
      discountError,
      loading,
      docNotFound,
      discountValidationStep,
      validated,
    } = this.state;

    const { canCreate, canUpdate, canDelete } = this.props.permissions.orders;
    const canWrite = (canUpdate && this.isEdit) || (canCreate && !this.isEdit);
    const { isConnected } = this.props.network;

    if (docNotFound)
      return (
        <View style={styles.container}>
          <Appbar close title titleText={this.title} />
          <EmptyList
            icon={faTimes}
            header="Commande introuvable"
            description="Le commande est introuvable dans la base de données. Il se peut qu'elle ait été supprimé."
            offLine={!isConnected}
          />
        </View>
      );
    else
      return (
        <View style={styles.container}>
          <Appbar
            close={!loading}
            title
            titleText={this.title}
            check={
              this.autoGenPdf
                ? false
                : this.isEdit
                  ? canWrite && !loading
                  : !loading
            }
            handleSubmit={() => this.handleSubmit(false)}
            del={canDelete && this.isEdit && !loading && !this.autoGenPdf}
            handleDelete={this.showAlert}
          />

          {loading ? (
            <View style={{ flex: 1 }}>
              <Loading size="large" style={styles.loadingContainer} />
            </View>
          ) : (
            <View style={{ flex: 1 }}>
              <ScrollView
                keyboardShouldPersistTaps="never"
                style={styles.container}
                contentContainerStyle={{
                  paddingBottom: constants.ScreenWidth * 0.02,
                }}>
                <FormSection
                  sectionTitle="Informations générales"
                  sectionIcon={faInfoCircle}
                  form={
                    <View style={{ flex: 1 }}>
                      {true && (
                        <MyInput
                          label="Numéro de la commande"
                          returnKeyType="done"
                          value={this.OrderId}
                          editable={false}
                          disabled
                        />
                      )}

                      <ItemPicker
                        onPress={() => {
                          if (this.project || this.isEdit) return; //pre-defined project
                          navigateToScreen(this, 'ListProjects', {
                            onGoBack: this.refreshProject,
                            isRoot: false,
                            prevScreen: 'CreateOrder',
                            titleText: 'Choix du projet',
                            showFAB: false,
                          });
                        }}
                        label="Projet concerné *"
                        value={project.name}
                        error={!!projectError}
                        errorText={projectError}
                        editable={canWrite}
                        showAvatarText={false}
                      />

                      {client.fullName !== '' && (
                        <ItemPicker
                          onPress={() => {
                            if (this.project || this.isEdit) return;
                            this.setState({
                              project: { id: '', name: '' },
                              client: { id: '', fullName: '' },
                            });
                          }}
                          label="Client concerné *"
                          value={client.fullName}
                          editable={false}
                          showAvatarText={true}
                          icon={faTimes}
                        />
                      )}

                      <Picker
                        returnKeyType="next"
                        value={state}
                        error={!!state.error}
                        errorText={state.error}
                        selectedValue={state}
                        onValueChange={(state) => this.setState({ state })}
                        title="État de la commande *"
                        elements={states}
                        enabled={canWrite}
                      />
                    </View>
                  }
                />

                <FormSection
                  sectionTitle="Primes"
                  sectionIcon={faEnvelopeOpenDollar}
                  form={
                    <View style={{ flex: 1 }}>
                      <MyInput
                        label="Prime CEE (€)"
                        returnKeyType="done"
                        keyboardType="numeric"
                        value={primeCEE}
                        onChangeText={(primeCEE) => {
                          this.setState({ primeCEE });
                        }}
                      />

                      <MyInput
                        label="Maprime Rénov (€)"
                        returnKeyType="done"
                        keyboardType="numeric"
                        value={primeRenov}
                        onChangeText={(primeRenov) => {
                          this.setState({ primeRenov });
                        }}
                      />

                      {/* <MyInput
                        label="Aides région (€)"
                        returnKeyType="done"
                        keyboardType="numeric"
                        value={aidRegion}
                        onChangeText={(aidRegion) => {
                          this.setState({ aidRegion });
                        }}
                      /> */}
                    </View>
                  }
                />

                <FormSection
                  sectionTitle="Remise"
                  sectionIcon={faHandsUsd}
                  form={
                    <View style={{ flex: 1, paddingTop: 10 }}>
                      <Picker
                        title="Remise (%)"
                        returnKeyType="next"
                        value={discount}
                        selectedValue={discount}
                        onValueChange={(discount) => {
                          this.setState({ discount });
                        }}
                        error={!!discountError}
                        errorText={discountError}
                        elements={discounts}
                        enabled={canWrite}
                      />
                    </View>
                  }
                />

                <FormSection
                  sectionTitle="Lignes de commandes"
                  sectionIcon={faCashRegister}
                  form={
                    <View style={{ flex: 1, paddingTop: 10 }}>
                      <Button
                        icon="plus-circle"
                        loading={loading}
                        mode="outlined"
                        onPress={() => {
                          if (!canWrite) return;
                          navigateToScreen(this, 'AddItem', {
                            onGoBack: this.refreshOrderLine,
                          });
                        }}
                        style={{
                          borderWidth: 1,
                          borderColor: theme.colors.primary,
                        }}
                        containerStyle={{ alignSelf: 'center' }}>
                        <Text style={theme.customFontMSmedium.caption}>
                          Ajouter une ligne de commande
                        </Text>
                      </Button>

                      {orderLines.length > 0 && (
                        <View>
                          <View
                            style={{
                              flexDirection: 'row',
                              paddingBottom: 10,
                              paddingTop: 25,
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              borderBottomColor: '#E0E0E0',
                              borderBottomWidth: 1,
                            }}>
                            <Text
                              style={[
                                theme.customFontMSmedium.caption,
                                { color: theme.colors.placeholder },
                              ]}>
                              Articles
                            </Text>
                            <Text
                              style={[
                                theme.customFontMSmedium.caption,
                                { color: theme.colors.placeholder },
                              ]}>
                              Prix HT
                            </Text>
                          </View>
                          {this.renderOrderLines(canWrite)}
                          {this.renderSummary()}
                        </View>
                      )}
                    </View>
                  }
                />

                {this.isEdit && !this.autoGenPdf && (
                  <ActivitySection
                    createdBy={createdBy}
                    createdAt={createdAt}
                    editedBy={editedBy}
                    editedAt={editedAt}
                    navigation={this.props.navigation}
                  />
                )}
              </ScrollView>

              {discountValidationStep !== '' &&
                this.renderAdminValidationPopUp()}

              {this.autoGenPdf && validated && (
                <Button
                  mode="contained"
                  onPress={() => this.handleSubmit(false)}
                  containerStyle={{
                    alignSelf: 'flex-end',
                    marginRight: theme.padding,
                  }}
                  style={{ backgroundColor: theme.colors.primary }}>
                  Générer
                </Button>
              )}
            </View>
          )}
        </View>
      );
  }
}

const mapStateToProps = (state) => {
  return {
    role: state.roles.role,
    permissions: state.permissions,
    network: state.network,
    currentUser: state.currentUser,
    //fcmToken: state.fcmtoken
  };
};

export default connect(mapStateToProps)(CreateOrder);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
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
    justifyContent: 'center',
  },
  orderLine: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomColor: '#E0E0E0',
    borderBottomWidth: 1,
  },
  discountPopUp: {
    paddingHorizontal: theme.padding,
    paddingVertical: theme.padding,
  },
  discountCancelButton: {
    borderColor: theme.colors.white,
    marginTop: theme.padding * 1.25,
  },
});




//##DOCUMENTATION
//subTotalProducts: Sous total des produits seulement (options non inclues)





//##TESTS
  // handleSubmit() {
  //   const { project, state, orderLines, subTotal, subTotalProducts, taxes, primeCEE, primeRenov, aidRegion, discount, total, validated } = this.state
  //   console.log('project', project)
  //   console.log('state', state)
  //   console.log('orderLines', orderLines)
  //   console.log('subTotal', subTotal)
  //   console.log('subTotalProducts', subTotalProducts)
  //   console.log('taxes', taxes)
  //   console.log('primeCEE', primeCEE)
  //   console.log('primeRenov', primeRenov)
  //   console.log('aidRegion', aidRegion)
  //   console.log('discount', discount)
  //   console.log('total', total)
  // }