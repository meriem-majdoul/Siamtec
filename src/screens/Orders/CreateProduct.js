//Category: name : Picker + Dialog (add new cat)
//Taxe: value : TextInput (numeric)
//Marque: {id, name, logo} : AutoCompleteTag (like articles)

import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Keyboard,
  Image,
  ImageBackground,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {Card, Title, TextInput} from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Modal from 'react-native-modal';
import ImageView from 'react-native-image-view';
import {connect} from 'react-redux';
import Dialog from 'react-native-dialog';
import _ from 'lodash';

import moment from 'moment';
import 'moment/locale/fr';
moment.locale('fr');

import Appbar from '../../components/Appbar';
import MyInput from '../../components/TextInput';
import Picker from '../../components/Picker';
import RadioButton from '../../components/RadioButton';
import AutoCompleteBrands from '../../components/AutoCompleteBrands';
import Toast from '../../components/Toast';
import Loading from '../../components/Loading';

import firebase, {db, auth} from '../../firebase';
import {fetchDocs, fetchDocuments} from '../../api/firestore-api';
import {uploadFile} from '../../api/storage-api';

import {
  generateId,
  myAlert,
  updateField,
  pickImage,
  nameValidator,
  positiveNumberValidator,
  arrayValidator,
  setToast,
  load,
  displayError,
} from '../../core/utils';
import * as theme from '../../core/theme';
import { isTablet, ScreenWidth} from '../../core/constants';
import SquarePlus from '../../components/SquarePlus';
import {CustomIcon} from '../../components';
import {faPlusCircle, faTimes} from '@fortawesome/free-solid-svg-icons';

const dialogContainerSize = ScreenWidth * 0.8;
const logoSize = dialogContainerSize * 0.6;

class CreateProduct extends Component {
  constructor(props) {
    super(props);
    this.fetchDocs = fetchDocs.bind(this);
    this.fetchProduct = this.fetchProduct.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.pickNewBrandLogo = this.pickNewBrandLogo.bind(this);

    this.toggleDialog = this.toggleDialog.bind(this);
    this.addNewCategory = this.addNewCategory.bind(this);

    this.uploadFile = uploadFile.bind(this);
    this.myAlert = myAlert.bind(this);
    this.showAlert = this.showAlert.bind(this);
    this.renderBrand = this.renderBrand.bind(this);

    this.initialState = {};
    this.isInit = true;
    
    const { route } = this.props;

    this.ProductId = this.props.route?.params?.ProductId ?? '';
    this.isEdit = this.ProductId ? true : false;
    this.title = this.isEdit ? "Modifier l'article" : 'Nouvel article';

    this.state = {
      //AUTO-GENERATED
      ProductId: '', //Not editable
      checked: 'second',
      type: 'product',
      name: {value: '', error: ''},
      description: {value: '', error: ''},
      price: {value: 50, error: ''},
      taxe: {value: '', error: ''},

      //Category
      category: {value: '', error: ''}, //Selected category
      categories: [{label: 'Selectionnez une catégorie', value: ''}], //Picker with dynamic values
      showDialog: false, //Dialog to add new category
      dialogType: '', //category or brand
      newCategory: '', //New category

      //Brand
      suggestions: [], //Brands suggestions
      tagsSelected: [], //Selected brand
      brandError: '',
      newBrandName: '',
      newBrandLogo: {path: ''},

      //logs
      createdBy: {id: '', fullName: '', email: '', role: ''},
      createdAt: '',
      editedBy: {id: '', fullName: '', email: '', role: ''},
      editededAt: '',

      error: '',
      loading: true,
      loadingDialog: false,
      toastType: '',
      toastMessage: '',
    };
  }

  async componentDidMount() {
    this.fetchCategories();
    this.fetchSuggestions();

    if (this.isEdit) {
      await this.fetchProduct().catch((e) =>
        displayError({message: e.message}),
      );
    } else {
      const ProductId = generateId('GS-AR-');
      this.setState(
        {ProductId},
        () => (this.initialState = _.cloneDeep(this.state)),
      );
    }

    load(this, false);
  }

  //   componentWillUnmount() {
  //     if (this.categoriesListener) {
  //       this.categoriesListener();
  //     }
  //     if (this.unsubscribe) {
  //       this.unsubscribe();
  //     }
  //   }

  fetchCategories() {
    this.categoriesListener = db
      .collection('ProductCategories')
      .get()
      .then((querysnapshot) => {
        let categories = [{label: 'Selectionnez une catégorie', value: ''}];
        if (querysnapshot.empty) return;
        querysnapshot.forEach((doc) => {
          const categoryName = doc.data().name;
          const category = {label: categoryName, value: categoryName};
          categories.push(category);
        });
        categories.sort((a, b) => (a.label > b.label ? 1 : -1)); //Sort in alphabetical order
        this.setState({categories});
      });
  }

  //Brands suggestions
  async fetchSuggestions() {
    const query = db.collection('Brands');
    // this.fetchDocs(query, 'suggestions', '', () => {
    //     this.setState({ loading: false })
    // })
    const suggestions = await fetchDocuments(query);
    this.setState({suggestions, loading: false});
  }

  //on Edit
  async fetchProduct() {
    try {
      const query = db.collection('Products').doc(this.ProductId);
      const doc = await query.get().catch((e) => {
        throw new Error(errorMessages.firestore.get);
      });
      let {
        ProductId,
        category,
        name,
        tagsSelected,
        description,
        price,
        taxe,
      } = this.state;
      let {createdAt, createdBy, editedAt, editedBy} = this.state;
      let {error, loading} = this.state;

      //General info
      const product = doc.data();
      ProductId = doc.id;
      category.value = product.category;
      name.value = product.name;
      tagsSelected.push(product.brand);
      description.value = product.description;
      price.value = product.price;
      taxe.value = product.taxe;

      //َActivity
      createdAt = product.createdAt;
      createdBy = product.createdBy;
      editedAt = product.editedAt;
      editedBy = product.editedBy;

      this.setState(
        {
          ProductId,
          category,
          name,
          tagsSelected,
          description,
          price,
          taxe,
          createdAt,
          createdBy,
          editedAt,
          editedBy,
        },
        () => {
          if (this.isInit) this.initialState = _.cloneDeep(this.state);
          this.isInit = false;
        },
      );
    } catch (e) {
      throw new Error(e);
    }
  }

  showAlert() {
    const title = "Supprimer l'article";
    const message =
      'Etes-vous sûr de vouloir supprimer cet article ? Cette opération est irreversible.';
    const handleConfirm = () => this.handleDelete();
    this.myAlert(title, message, handleConfirm);
  }

  handleDelete() {
    db.collection('Products').doc(this.ProductId).update({deleted: true});
    this.props.navigation.goBack();
  }

  //Handle inputs & Submit
  setProductType(checked, type) {
    let update = {checked, type};
    if (type === 'option') {
      update.category = {value: '-', error: ''};
    }
    this.setState(update);
  }

  validateInputs() {
    let {category, tagsSelected, brandError, name, price} = this.state;

    const categoryError = nameValidator(category.value, `"Catégorie"`);
    brandError = arrayValidator(tagsSelected, `"Marque"`);
    const nameError = nameValidator(name.value, `"Désignation"`);
    const priceError = positiveNumberValidator(price.value, `"Prix de vente"`);

    if (categoryError || brandError || nameError || priceError) {
      category.error = categoryError;
      name.error = nameError;
      price.error = priceError;
      this.setState({category, name, price, brandError, loading: false});
      return false;
    }

    return true;
  }

  async handleSubmit() {
    Keyboard.dismiss();

    //Handle Loading or No edit done
    if (this.state.loading || _.isEqual(this.state, this.initialState)) return;

    load(this, true);

    //0. Validate inputs
    const isValid = this.validateInputs();
    if (!isValid) return;

    //2. ADDING product to firestore
    let {
      ProductId,
      type,
      category,
      tagsSelected,
      name,
      description,
      price,
      taxe,
    } = this.state;

    const currentUser = {
      id: auth.currentUser.uid,
      fullName: auth.currentUser.displayName,
      email: auth.currentUser.email,
      role: this.props.role.value,
    };

    let product = {
      type,
      category: category.value,
      brand: tagsSelected[0],
      name: name.value,
      description: description.value,
      price: Number(price.value).toFixed(2),
      taxe: Number(taxe.value).toFixed(2),
      editedAt: moment().format(),
      editedBy: currentUser,
      deleted: false,
    };

    if (!this.isEdit) {
      product.createdAt = moment().format();
      product.createdBy = currentUser;
    }

    db.collection('Products').doc(ProductId).set(product, {merge: true});
    this.props.navigation.state.params.onGoBack(product);
    this.props.navigation.goBack();
  }

  //Logo brand
  async pickNewBrandLogo() {
    let {newBrandLogo} = this.state;
    const attachments = await pickImage([]);
    newBrandLogo = attachments[0];
    newBrandLogo.ref = 'newBrandLogo';
    this.setState({newBrandLogo});
  }

  //Add new category
  toggleDialog(dialogType) {
    this.setState({showDialog: !this.state.showDialog, dialogType});
  }

  renderDialog(type) {
    //Category & Brand
    let {
      showDialog,
      newCategory,
      newBrandName,
      newBrandLogo,
      loadingDialog,
    } = this.state;
    const isCategory = type === 'category';
    const label = isCategory ? 'catégorie' : 'marque';

    if (loadingDialog) {
      const progression = isCategory
        ? ''
        : Math.round(this.state.newBrandLogo.progress * 100);
      const title = `Ajout de la ${label} en cours... ${progression}%`;
      return (
        <View style={styles.dialogContainer}>
          <Dialog.Container
            visible={showDialog}
            contentStyle={{paddingVertical: 15}}>
            <Dialog.Title
              style={[theme.customFontMSsemibold.body, {marginBottom: 5}]}>
              {title}
            </Dialog.Title>
            <ActivityIndicator color={theme.colors.primary} size="small" />
          </Dialog.Container>
        </View>
      );
    } else
      return (
        <View style={styles.dialogContainer}>
          <Dialog.Container
            visible={showDialog}
            contentStyle={{width: dialogContainerSize, alignItems: 'center'}}>
            {!isCategory && (
              <View
                style={{
                  marginBottom: isTablet ? 90 : 20,
                  width: 800,
                  alignSelf: 'center',
                }}>
                {newBrandLogo.path ? (
                  <TouchableOpacity onPress={this.pickNewBrandLogo}>
                    <Image
                      source={{uri: newBrandLogo.path}}
                      style={styles.logo}
                    />
                  </TouchableOpacity>
                ) : (
                  <SquarePlus
                    onPress={this.pickNewBrandLogo}
                    title="LOGO"
                    style={styles.logo}
                  />
                )}
              </View>
            )}

            <Dialog.Input
              label={`Nom de la ${label}`}
              returnKeyType="done"
              value={isCategory ? newCategory : newBrandName}
              onChangeText={(text) => {
                if (isCategory) this.setState({newCategory: text});
                else {
                  newBrandName = text;
                  this.setState({newBrandName});
                }
              }}
              //autoFocus={showDialog}
              autoFocus={false}
              style={{
                borderBottomColor: theme.colors.graySilver,
                borderBottomWidth: StyleSheet.hairlineWidth,
                width: logoSize,
              }}
            />
            <Dialog.Button
              label="Annuler"
              onPress={() => this.toggleDialog('')}
              style={{color: theme.colors.placeholder}}
            />
            <Dialog.Button
              label="Confirmer"
              onPress={async () => {
                if (isCategory) {
                  
                  if (!newCategory) return;
                  this.setState({loadingDialog: true});
                  this.addNewCategory();
                } else {
                 
                  if (!newBrandName) return;
                  else{
                    this.setState({loadingDialog: true});
                   
                  //upload logo
                  const storageRefPath = `/Brands/${newBrandName}/logo`;
                  console.log('newBrandLogo: ' + JSON.stringify(newBrandLogo, null, 2));

                  // const response = await this.uploadFile(
                  //   newBrandLogo,
                  //   storageRefPath,
                  //   true,
                  // );

                  // if (response === 'failure') {
                  //   this.setState({loadingDialog: false});
                  //   setToast(
                  //     this,
                  //     'e',
                  //     "Erreur lors de l'importation de la pièce jointe, veuillez réessayer.",
                  //   );
                  //   return;
                  // }

                  //add brand to db
                  this.addNewBrand();
                  }
                  
                }
              }}
            />
          </Dialog.Container>
        </View>
      );
  }

  async addNewCategory() {
    const {newCategory} = this.state;
    console.log('newCategory'+newCategory)
    db.collection('ProductCategories').doc().set({name: newCategory});
    this.setState({
      category: {value: newCategory, error: ''},
      newCategory: '',
      loadingDialog: false,
      showDialog: false,
    });
  }

  async addNewBrand() {
    let {newBrandName, newBrandLogo, tagsSelected} = this.state;
    delete newBrandLogo.progress;
    delete newBrandLogo.local;
    const name = newBrandName;
    const logo = newBrandLogo;
    const newBrand = {name, logo};
    tagsSelected.push(newBrand);
    console.log('newBrand: ' + JSON.stringify(newBrand, null, 2));
    // db.collection('Brands').doc().set(newBrand);
    // this.setState({
    //   tagsSelected,
    //   newBrandName: '',
    //   newBrandLogo: {path: ''},
    //   loadingDialog: false,
    //   showDialog: false,
    // });
  }

  //Renderers
  renderTypeAndLogo() {
    const {checked, tagsSelected} = this.state;
    const isLogo =
      tagsSelected.length > 0 &&
      tagsSelected[0].logo &&
      tagsSelected[0].logo.downloadURL;
    const logoUrl = isLogo
      ? tagsSelected[0].logo && tagsSelected[0].logo.downloadURL
      : '';

    return (
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <View>
          <Text
            style={[
              theme.customFontMSregular.body,
              {marginBottom: isTablet ? 15 : 0},
            ]}>
            Type de l'article
          </Text>
          <RadioButton
            checked={checked}
            firstChoice={{title: 'Option', value: 'option'}}
            secondChoice={{title: 'Produit', value: 'good'}}
            onPress1={() => this.setProductType('first', 'option')}
            onPress2={() => this.setProductType('second', 'good')}
            style={{marginBottom: 10}}
            textRight={true}
            isRow={false}
          />
        </View>
        {isLogo && (
          <Image source={{uri: logoUrl}} style={{width: 90, height: 90}} />
        )}
      </View>
    );
  }

  renderCategory() {
    const {type, category, categories } = this.state;

    return (
      <View style={{marginBottom: isTablet ? 50 : 20}}>
        <Picker
          title="Catégorie *"
          returnKeyType="next"
          selectedValue={category.value}
          onValueChange={(text) => updateField(this, category, text)}
          elements={categories}
          errorText={category.error}
          enabled={type !== 'option'}
        />

        <Text
          onPress={() => this.toggleDialog('category')}
          style={[
            theme.customFontMSmedium.caption,
            {
              color: theme.colors.primary,
              marginTop: Platform.OS === 'android' ? 10 : 10,
            },
          ]}>
          + Nouvelle catégorie
        </Text>
      </View>
    );
  }

  renderBrand() {
    const {suggestions, tagsSelected, brandError} = this.state;
    const noItemSelected = tagsSelected.length === 0;
    const {isConnected} = this.props.network;
    const iconSize = isTablet ? 32 : 21;

    return (
      <View style={{marginBottom: 5, zIndex: 2}}>
        <Text
          style={[
            theme.customFontMSmedium.caption,
            {color: theme.colors.placeholder, marginBottom: 5},
          ]}>
          Marque *
        </Text>
        <View style={{flexDirection: 'row', alignItems: 'flex-start'}}>
          <View style={{flex: 0.9}}>
            <AutoCompleteBrands
              placeholder="Écrivez pour choisir une marque"
              suggestions={suggestions}
              tagsSelected={tagsSelected}
              main={this}
              //autoFocus={false}
              showInput={noItemSelected}
              errorText={brandError}
              suggestionsBellow={false}
            />
          </View>

          {noItemSelected ? (
            isConnected && (
              <TouchableOpacity
                style={styles.plusIcon}
                onPress={() => this.toggleDialog('brand')}>
                <CustomIcon
                  icon={faPlusCircle}
                  color={theme.colors.primary}
                  size={iconSize}
                />
              </TouchableOpacity>
            )
          ) : (
            <TouchableOpacity
              style={[styles.plusIcon, {paddingTop: 0}]}
              onPress={() => this.setState({tagsSelected: []})}>
              <CustomIcon
                icon={faTimes}
                color={theme.colors.placeholder}
                size={iconSize}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  render() {
    const {
      ProductId,
      name,
      brand,
      description,
      price,
      taxe,
      showDialog,
      dialogType,
    } = this.state;
    const { loading, toastType, toastMessage} = this.state;

    return (
      <View style={styles.container}>
        <Appbar
          close={!loading}
          title
          titleText={this.title}
          check={true}
          loading={loading}
          handleSubmit={this.handleSubmit}
          del={this.isEdit && !loading}
          handleDelete={this.showAlert}
        />

        {loading ? (
          <Loading />
        ) : (
          <View style={{flex: 1}}>
            <ScrollView
              style={styles.container}
              contentContainerStyle={{padding: theme.padding}}>
              <KeyboardAvoidingView
                style={{flex: 1}}
                behavior={Platform.OS === 'ios' ? 'padding' : null}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}>
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
                  label="Désignation *"
                  value={name.value}
                  onChangeText={(text) => updateField(this, name, text)}
                  error={!!name.error}
                  errorText={name.error}
                  multiline={true}
                />

                <MyInput
                  label="Description"
                  value={description.value}
                  onChangeText={(text) => updateField(this, description, text)}
                  error={!!description.error}
                  errorText={description.error}
                  multiline={true}
                />

                <View style={{flexDirection: 'row'}}>
                  <View style={{flex: 0.5, paddingRight: 15}}>
                    <MyInput
                      label="Prix de vente HT (€) *"
                      returnKeyType="done"
                      keyboardType="numeric"
                      value={price.value.toString()}
                      onChangeText={(text) => {
                        updateField(this, price, text);
                      }}
                      error={!!price.error}
                      errorText={price.error}
                    />
                  </View>

                  <View style={{flex: 0.5, paddingLeft: 15}}>
                    <MyInput
                      label="Taxe (%)"
                      returnKeyType="done"
                      keyboardType="numeric"
                      value={taxe.value.toString()}
                      onChangeText={(text) => {
                        updateField(this, taxe, text);
                      }}
                      error={!!taxe.error}
                      errorText={taxe.error}
                    />
                  </View>
                </View>
              </KeyboardAvoidingView>
            </ScrollView>

            {showDialog && this.renderDialog(dialogType)}

            <Toast
              message={toastMessage}
              type={toastType}
              onDismiss={() => this.setState({toastMessage: ''})}
            />
          </View>
        )}
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    role: state.roles.role,
    network: state.network,
    //fcmToken: state.fcmtoken
  };
};

export default connect(mapStateToProps)(CreateProduct);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
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
  imagesBox: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 90,
    height: 90,
    marginBottom: 20,
    backgroundColor: theme.colors.gray50,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 1,
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
    opacity: 0.65,
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
    alignItems: 'center',
  },
  dialogContainer: {
    flex: 1,
    width: ScreenWidth * 0.5,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusIcon: {
    flex: 0.1,
    padding: 5,
    justifyContent: 'flex-start',
    alignItems: isTablet ? 'flex-end' : 'center',
  },
  emptyLogo: {
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    width: 90,
    height: 90,
    ...theme.style.shadow,
  },
  logo: {
    alignSelf: 'center',
    width: logoSize,
    height: logoSize,
  },
});

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
