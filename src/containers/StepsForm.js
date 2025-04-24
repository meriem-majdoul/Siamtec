import { faTimes } from '@fortawesome/free-solid-svg-icons';
import React, { Component } from 'react';
import RNFS from 'react-native-fs';
import { PermissionsAndroid,Linking } from 'react-native';

import {
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  View,
  Image,
  BackHandler,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  Keyboard,
  
} from 'react-native';
import { ProgressBar, Checkbox, TextInput as Input } from 'react-native-paper';
import FileViewer from 'react-native-file-viewer';
import { connect } from 'react-redux';
import _ from 'lodash';
import Modal from 'react-native-modal';
import Pdf from 'react-native-pdf';
import DatePicker from 'react-native-date-picker';
import TextInputMask from 'react-native-text-input-mask';

import moment from 'moment';
import 'moment/locale/fr';
moment.locale('fr');

import { generatePdfForm } from '../core/utils';

import {
  AddressInput,
  Appbar,
  Button,
  CustomIcon,
  EmptyList,
  LoadDialog,
  Loading,
  ModalHeader,
  NumberInput,
  SquareOption,
  Picker,
  TextInput,
  Toast,
  SquarePlus,
  EEBPack,
} from '../components';
import { setEstimation } from '../components/EEBPack';

import {
  nameValidator,
  positiveNumberValidator,
  emailValidator,
  generateId,
  myAlert,
  saveFile,
  displayError,
  arrayIntersection,
  articles_fr,
  pickImage,
} from '../core/utils';

import {
  constants,
  contactForm,
  errorMessages,
  isTablet,
  pack1,
  pack2,
  simulationColorCats,
} from '../core/constants';
import * as theme from '../core/theme';
import { setStatusBarColor } from '../core/redux';
import { db, auth, functions } from '../firebase';
import { fetchDocument } from '../api/firestore-api';

const mascCollections = ['PvReception', 'MandatsMPR', 'MandatsSynergys'];

class StepsForm extends Component {
  constructor(props) {
    super(props);

    this.goNext = this.goNext.bind(this);
    this.goBack = this.goBack.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.toggleContactModal = this.toggleContactModal.bind(this);
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    this.submitContactForm = this.submitContactForm.bind(this);
    this.myAlert = myAlert.bind(this);
    BackHandler.addEventListener(
      'hardwareBackPress',
      this.handleBackButtonClick,
    );

    this.isEdit = this.props.DocId !== '' && this.props.DocId !== undefined;
    this.DocId = this.isEdit
      ? this.props.DocId
      : this.props.idPattern
        ? generateId(this.props.idPattern)
        : '';
        // const { route } = this.props;
        this.project = this.props.route?.params?.project ?? null;
        this.DocumentId = this.props.route?.params?.DocumentId ?? '';
        this.popCount = this.props.route?.params?.popCount ?? 1;

    this.isGuest = !auth.currentUser;

    this.initialState = {
      showWelcomeMessage:
        this.props.collection === 'Simulations' && !this.isEdit,
      showSuccessMessage: false,
      showContactModal: false,
      acceptPhoneCall: true,
      pagesDone: [],
      pageIndex: 0,
      stepIndex: 0,
      subStepIndex: -1,
      progress: 0,
      isPdfModalVisible: false,
      pdfBase64: '',
      initialLoading: true,
      loading: false,
      toastMessageModal: '',
      toastTypeModal: '',
      docNotFound: false,
      submitted: false,
      readOnly: this.isEdit,
      isEdit: this.isEdit,

      deleted: false,
      project: this.project ? this.project : null,

      isBack: false,
      ...this.props.initialState,

      totalImagesSize: 0,
      isTotalImagesSizeExceeded: false,
    };

    this.state = this.initialState;
  }

  //##Initialization
  addNavigationListeners() {
    this.willFocusSubscription = this.props.navigation.addListener(
      'willFocus',
      () => {
        const darkStatusBarStyle = {
          backgroundColor: '#003250',
          barStyle: 'light-content',
         
        };
        setStatusBarColor(this, darkStatusBarStyle);
      },
    );
    this.willBlurSubscription = this.props.navigation.addListener(
      'willBlur',
      () => {
        const lightStatusBarStyle = {
          backgroundColor: '#fff',
          barStyle: 'dark-content',
          
        };
        setStatusBarColor(this, lightStatusBarStyle);
      },
    );
  }

  async componentDidMount() {
    try {
      const colorLabel = this.setColorLabel('blue');
      console.log('color', colorLabel);

      this.addNavigationListeners();

      if (this.state.isEdit) await this.initEditMode();
      else if (this.props.autoGen) await this.handleSubmit(true, false);
      this.initialState = _.cloneDeep(this.state);
      this.setState({ initialLoading: false });
    } catch (e) {
      this.setState({ initialLoading: false });
      displayError({ message: e.message });
    }
  }

  async componentDidUpdate(prevProps, prevState, snapshot) {
    //For some forms parent initialState can change --> We have to update the generated PDF.
    if (prevProps.initialState !== this.props.initialState) {
      this.setState({ loading: true });
      await this.onInitialStateChange();
      this.setState({ loading: false });
    }
  }

  componentWillUnmount() {
    if (this.willFocusSubscription) this.willFocusSubscription.remove();
    if (this.willBlurSubscription) this.willBlurSubscription.remove();
  }

  onInitialStateChange() {
    return new Promise((resolve, reject) => {
      this.setState(this.props.initialState, async () => {
        const pdfBase64 = await generatePdfForm(
          this.state,
          this.props.collection,
          this.props.pdfParams,
        );
        this.setState({ pdfBase64 }, () => resolve(true));
      });
    });
  }

  async initEditMode() {
    try {
      const { collection, pdfParams } = this.props;
      let document = await fetchDocument(collection, this.DocId);
      //document = this.setDocument(document)
      if (!document) {
        this.setState({ docNotFound: true });
        return;
      }
      this.setState(document);
      const pdfBase64 = await generatePdfForm(document, collection, pdfParams);
      this.setState({ pdfBase64 });
    } catch (e) {
      throw new Error(e);
    }
  }

  // setDocument(document) {
  //     if (!document)
  //         this.setState({ docNotFound: true })
  //     else {
  //         const defaultProps = ["project", "createdAt", "createdBy", "editedAt", "editedBy", "deleted", "isSubmitted"]
  //         let properties = [...this.props.stateProperties, ...defaultProps]
  //         document = formatDocument(document, properties)
  //         this.setState(document)
  //     }
  //     return document
  // }

  //##Progression
  renderProgression(pages) {
    const pagesCount = pages.length - 1;
    const progress = Math.round((this.state.pageIndex / pagesCount) * 100);

    return (
      <View style={{ marginTop: 16, backgroundColor: '#003250' }}>
        <ProgressBar
          progress={progress / 100}
          color={theme.colors.primary}
          visible={true}
        />
        <Text
          style={[
            isTablet
              ? theme.customFontMSregular.caption
              : theme.customFontMSregular.small,
            { color: theme.colors.white, marginVertical: 8 },
          ]}>
          {progress}%
        </Text>
      </View>
    );
  }

  renderStep(step, index) {
    const { stepIndex } = this.state;
    const isSelected = stepIndex === index;
    const { primary, white, gray_medium } = theme.colors;
    const backgroundColor = isSelected ? primary : white;
    const color = isSelected ? white : gray_medium;

    return (
      <View key={index.toString()} style={[styles.step, { backgroundColor }]}>
        <Text style={[theme.customFontMSregular.caption, { color }]}>{step}</Text>
      </View>
    );
  }

  //##Form
  renderSteps(pages, steps) {
    return (
      <View style={[styles.stepsContainer,{color:'#fff'}]}>
        {steps.map((step, index) => {
          if (step === '')
            return (
              <View key={index.toString()} style={styles.stepsSeparator} />
            );
          else {
            const isStepObject = typeof step === 'object';
            const stepLabel = isStepObject ? step.label : step;
            const flex = 1 / step.subStepsCount - 0.02;
            return this.renderStep(stepLabel, index);
          }
        })}
      </View>
    );
  }

  renderTitle(pages) {
    const { pageIndex } = this.state;
    const { showPagination } = this.props;
    const { title } = pages[pageIndex];
    const pagination = showPagination
      ? `(${pageIndex + 1}/${pages.length})`
      : '';

    return (
      <View style={[styles.titleContainer,{color:'#fff'}]}>
        <Text
          style={[
            theme.customFontMSmedium.body,
            { textAlign: 'center', color: theme.colors.gray_dark },
          ]}>
          {title}
        </Text>
        {/* <Text style={[theme.customFontMSmedium.caption, { textAlign: 'center', color: theme.colors.gray_dark, marginTop: 2 }]}>
                    {title2}
                </Text> */}
      </View>
    );
  }

  renderLabel(label, items) {
    return (
      <Text
        style={[
          theme.customFontMSregular.body,
          { textAlign: 'center', marginTop: 24, marginBottom: 8 },
        ]}>
        {label}
      </Text>
    );
  }

  renderForm(pages) {
    const { pageIndex, showSuccessMessage } = this.state;

    if (showSuccessMessage) return this.successMessage();
    else
      return (
        <ScrollView contentContainerStyle={styles.formContainer}>
          {this.renderFields(pages, pageIndex)}
        </ScrollView>
      );
  }

  renderFields(pages, pageIndex) {
    const { id, layout, fields, items } = pages[pageIndex];

    const fieldsComponents = fields.map((field) => {
      const value = this.state[field.id];
      const error = this.state[field.errorId];
      const {
        id,
        errorId,
        type,
        items,
        isConditional,
        condition,
        isNumeric,
        isEmail,
        isMultiOptions,
        isStepMultiOptions,
        mendatory,
        maxLength,
        rollBack,
        instruction,
      } = field;
      const asterisk = mendatory && field.label !== '' ? ' *' : '';
      const label = field.label + asterisk;

      if (isConditional) {
        const emptyString = !condition.values && !this.state[condition.with];
        const optionNotSelected =
          condition.values &&
          !arrayIntersection(this.state[condition.with], condition.values);
        const hideField = emptyString || optionNotSelected;

        if (hideField) {
          return null;
        }
      }

      switch (field.type) {
        case 'textInput':
          if (field.mask)
            return (
              <TextInput
                key={field.id.toString()}
                label={label}
                returnKeyType="done"
                keyboardType={
                  isNumeric ? 'numeric' : isEmail ? 'email-address' : 'default'
                }
                value={value}
                multiline={field.multiline}
                onChangeText={(value) => {
                  this.removeErrors(errorId);
                  let update = {};
                  update[id] = value;
                  this.setState(update);
                }}
                error={error}
                errorText={error}
                editable={true}
                render={(props) => (
                  <TextInputMask
                    {...props}
                    {...(field.mask && { mask: field.mask })}
                  />
                )}
                right={
                  instruction ? (
                    <Input.Icon
                      name="information"
                      onPress={() => {
                        const title =
                          instruction.priority === 'high'
                            ? 'IMPORTANT'
                            : 'Instruction';
                        Alert.alert(title, instruction.message);
                      }}
                    />
                  ) : null
                }
              />
            );
          else
            return (
              <TextInput
                key={field.id.toString()}
                label={label}
                returnKeyType="done"
                keyboardType={
                  isNumeric ? 'numeric' : isEmail ? 'email-address' : 'default'
                }
                multiline={field.multiline}
                value={value}
                onChangeText={(value) => {
                  this.removeErrors(errorId);
                  let update = {};
                  update[id] = value;
                  this.setState(update);
                }}
                error={error}
                errorText={error}
                editable={true}
                maxLength={maxLength}
                right={
                  instruction ? (
                    <Input.Icon
                      name="information"
                      onPress={() => {
                        const title =
                          instruction.priority === 'high'
                            ? 'IMPORTANT'
                            : 'Instruction';
                        Alert.alert(title, instruction.message);
                      }}
                    />
                  ) : null
                }
              />
            );
          break;

        case 'picker':
          return (
            <Picker
              key={field.id.toString()}
              returnKeyType="next"
              value={value}
              error={error}
              errorText={error}
              selectedValue={value}
              onValueChange={(value) => {
                let update = {};

                //0. Rollback
                if (rollBack) {
                  for (const f of rollBack.fields) {
                    if (f.type === 'string') update[f.id] = '';
                    else if (f.type === 'array') {
                      //Remove element
                      if (f.value) {
                        const index = update[f.id].findIndex(
                          (e) => e === f.value,
                        );
                        if (index !== -1) update[f.id].splice(index, 1);
                      }
                      //Empty array
                      else update[f.id] = [];
                    } else if (f.type === 'date') update[f.id] = new Date();
                  }
                }

                //1. Change value
                update[field.id] = value;
                this.setState(update);
              }}
              title={label}
              elements={items}
              enabled={true}
              style={field.style}
            />
          );
          break;

        case 'options':
          //Green highlight selection
          if (isMultiOptions || isStepMultiOptions) {
            items.forEach(
              (e) => (e.selected = this.state[id].includes(e.label)),
            );
          } else
            items.forEach((e) => (e.selected = e.label === this.state[id]));

          return (
            <View key={field.id.toString()}>
              {this.renderLabel(label, items)}
              <View
                style={[
                  styles.formOptionsContainer,
                  {
                    justifyContent:
                      items && items.length > 1 ? 'space-between' : 'center',
                  },
                ]}>
                {items.map((item, index) => {
                  const { isConditional, condition } = item;
                  let hideOption = false;

                  if (isConditional) {
                    const conditionVerified = arrayIntersection(
                      this.state[condition.with],
                      condition.values,
                    );
                    if (!conditionVerified) {
                      hideOption = true;
                    }
                  }

                  if (hideOption) return null;

                  return (
                    <SquareOption
                      key={index.toString()}
                      element={item}
                      index={index}
                      elementSize={constants.ScreenWidth * 0.4}
                      onPress={() => {
                        let update = {};

                        //0.1 Rollback
                        if (item.rollBack) {
                          for (const field of item.rollBack.fields) {
                            if (field.type === 'string') update[field.id] = '';
                            else if (field.type === 'array') {
                              //Remove element
                              if (field.value) {
                                update[field.id] = this.state[field.id];
                                const index = update[field.id].findIndex(
                                  (e) => e === field.value,
                                );
                                if (index !== -1)
                                  update[field.id].splice(index, 1);
                              }
                              //Empty array
                              else update[field.id] = [];
                            } else if (field.type === 'date')
                              update[field.id] = new Date();
                          }
                        }

                        //0.2 AUTO COPY-PASTE
                        if (item.autoCopy) {
                          for (const element of item.autoCopy) {
                            update[element.id] = this.state[element.copyFrom];
                          }
                        }

                        //1. Update value & Go Next
                        const { value } = item;

                        //Get initial value
                        var selectedOptions = this.state[id];

                        if (isMultiOptions || isStepMultiOptions) {
                          //onPress: Remove value if already selected
                          if (selectedOptions.includes(value)) {
                            selectedOptions = selectedOptions.filter(
                              (option) => option !== value,
                            );
                          } else {
                            if (isStepMultiOptions) {
                              //onPress: Remove all selected items of SAME PAGE (only one can be selected per page)
                              const itemsValues = items.map(
                                (item) => item.value,
                              );
                              selectedOptions = selectedOptions.filter(
                                (option) => !itemsValues.includes(option),
                              );
                            }

                            //Push value
                            if (isMultiOptions || !item.skip)
                              selectedOptions.push(value);
                          }
                        } else {
                          //Case1: Unselect option if pressed twice
                          if (this.state[id] === value) selectedOptions = '';
                          //Case2: select option
                          else selectedOptions = value;
                        }

                        update[id] = selectedOptions;

                        this.setState(update, async () => {
                          //Auto goNext
                          //if (this.isEdit) return
                          const isPageWithSingleField =
                            pages[pageIndex].fields.length === 1;
                          if (
                            (isPageWithSingleField && !isMultiOptions) ||
                            item.skip
                          )
                            await this.goNext();
                        });
                      }}
                    />
                  );
                })}
              </View>
              {error ? (
                <Text
                  style={[
                    theme.customFontMSregular.caption,
                    {
                      color: theme.colors.error,
                      textAlign: 'center',
                      marginTop: 8,
                    },
                  ]}>
                  {error}
                </Text>
              ) : null}
            </View>
          );
          break;

        case 'number':
          return (
            <View key={field.id.toString()} style={field.style}>
              {this.renderLabel(label)}
              <NumberInput
                changeValue={(operation) => {
                  let value = this.state[id];
                  value = Number(value);
                  if (operation === 'add') {
                    if (value === '') value = 1;
                    else value += 1;
                  } else {
                    if (value === '' || value === 0) return;
                    else value -= 1;
                  }
                  value = value.toString();
                  let update = {};
                  update[id] = value;
                  this.setState(update);
                }}
                label={label}
                value={value}
                onChangeText={(value) => {
                  let update = {};
                  update[id] = value;
                  this.setState(update);
                }}
                placeholder={field.placeholder || ''}
                error={error}
                errorText={error}
                editable={true}
              />
            </View>
          );
          break;

        case 'address':
          return (
            <AddressInput
              key={field.id.toString()}
              label={label}
              offLine={!this.props.network.isConnected}
              onPress={() =>
                this.props.navigation.navigate('Address', {
                  onGoBack: (address) => {
                    let update = {};
                    update[id] = address;
                    this.setState(update);
                  },
                })
              }
              onChangeText={(description) => {
                const address = {
                  description,
                  marker: { latitude: '', longitude: '' },
                  place_id: '',
                };
                let update = {};
                update[id] = address;
                this.setState(update);
              }}
              clearAddress={() => {
                const address = {
                  description: '',
                  marker: { latitude: '', longitude: '' },
                  place_id: '',
                };
                let update = {};
                update[id] = address;
                this.setState(update);
              }}
              address={this.state[id]}
              addressError={this.state[errorId]}
              editable={true}
            />
          );
          break;

        case 'checkbox':
          const onPressCheckBox = () =>
            this.setState({ acceptPhoneCall: !this.state.acceptPhoneCall });
          return (
            <View
              key={field.id.toString()}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginLeft: -10,
                marginTop: 25,
              }}>
              <Checkbox
                status={this.state.acceptPhoneCall ? 'checked' : 'unchecked'}
                onPress={onPressCheckBox}
                color={theme.colors.primary}
              />
              <Text
                style={[theme.customFontMSregular.body]}
                onPress={onPressCheckBox}>
                {label}
              </Text>
            </View>
          );
          break;

        case 'datePicker':
          return (
            <View key={field.id.toString()}>
              {this.renderLabel(label)}
              <DatePicker
                date={value}
                onDateChange={(selectedDate) => {
                  let update = {};
                  update[id] = selectedDate;
                  this.setState(update);
                }}
                mode="date"
                locale="fr"
                androidVariant="nativeAndroid"
                fadeToColor={theme.colors.primary}
                style={{ alignSelf: 'center', marginTop: 32 }}
              />
            </View>
          );
          break;

        case 'image':
          return this.renderImageField(field);

        case 'autogen':
          return null;
          break;
      }
    });

    const arr = fieldsComponents.filter((e) => e !== null);
    const emptyPage = arr.length === 0;
    if (emptyPage) {
      var delta = this.state.isBack ? -1 : 1; //Update pageIndex depending on if is it going next or back.
      this.setState({ pageIndex: this.state.pageIndex + delta });
    }

    return fieldsComponents;
  }

  renderImageField(field) {
    const { id, label, errorId } = field;

    if (!this.state[id])
      return (
        <View key={id}>
          {this.renderLabel(label)}
          <SquarePlus
            style={{ marginTop: theme.padding }}
            onPress={() => this.handleImage(id)}
            title="Ajouter une photo"
            isBig={true}
            errorText={this.state[errorId]}
          />
        </View>
      );
    else {
      return (
        <View
          style={{
            borderWidth: 1,
            borderColor: theme.colors.gray_light,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Image
            source={{ uri: this.state[field.id].path }}
            resizeMode="contain"
            style={{
              alignSelf: 'center',
              width: this.state[field.id].width,
              height: this.state[field.id].height,
            }}
          />
          <TouchableOpacity
            onPress={() => this.removeImage(id)}
            style={{
              position: 'absolute',
              right: theme.padding / 2,
              top: theme.padding / 2,
              borderRadius: 15,
              width: 30,
              height: 30,
              backgroundColor: '#000',
              opacity: 0.7,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <CustomIcon icon={faTimes} color="#fff" size={24} />
          </TouchableOpacity>
        </View>
      );
    }
  }

  removeImage(fieldId) {
    //Deduce image size from total images size
    const imageSize = this.state[fieldId].size;
    let { totalImagesSize, isTotalImagesSizeExceeded } = this.state;
    totalImagesSize = totalImagesSize - imageSize;

    const totalImagesSize_MB = totalImagesSize / 1048576;
    if (totalImagesSize_MB < 20) {
      isTotalImagesSizeExceeded = false
      this.setState({ isTotalImagesSizeExceeded })
    }
    this.setState({ totalImagesSize });

    //Remove image from form
    let update = {};
    update[fieldId] = null;
    this.setState(update);
  }

  async handleImage(fieldId) {
    try {
      //1. Pick/Take picture
      const attachments = await pickImage([], false, true);
      if (attachments.length === 0) return;
      let attachment = attachments[0];

      //2. Calculate total size of photos
      let { totalImagesSize } = this.state;
      let isTotalImagesSizeExceeded = false;
      const attachmentSize = attachment.size;
      totalImagesSize = totalImagesSize + attachmentSize;
      const totalImagesSize_MB = totalImagesSize / 1048576;

      console.log('total image size', totalImagesSize_MB);
      if (totalImagesSize_MB > 20) {
        isTotalImagesSizeExceeded = true;
        this.setState({ isTotalImagesSizeExceeded });
        this.displayLimitPhotosSizeExceeded(totalImagesSize);
        return;
      } else this.setState({ totalImagesSize, isTotalImagesSizeExceeded });

      // //2. Convert to base64
      // const attachmentBase64 = await RNFS.readFile(attachment.path, "base64")
      // attachment.base64 = attachmentBase64

      //3. Set imageSize/ratio
      const { width, height } = await this.setImageSize(attachment.path);
      attachment.width = width;
      attachment.height = height;

      //4. Update state
      let update = {};
      update[fieldId] = attachment;
      this.setState(update);
    } catch (e) {
      throw new Error(e);
    }
  }

  async setImageSize(uri) {
    return new Promise((resolve, reject) => {
      Image.getSize(
        uri,
        (srcWidth, srcHeight) => {
          const maxHeight = constants.ScreenWidth - theme.padding * 2; // or something else
          const maxWidth = constants.ScreenHeight / 2;

          const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
          const width = srcWidth * ratio;
          const height = srcHeight * ratio;
          const size = { width, height };
          resolve(size);
        },
        (error) => {
          console.log(error);
          reject("Erreur lors de l'initialisation de la photo.");
        },
      );
    });
  }

  renderButtons(pages) {
    const { pageIndex, showSuccessMessage } = this.state;
    const { collection } = this.props;
    const isLastPage = pageIndex === pages.length - 1;
    const showContactUs =
      collection === 'Simulations' &&
      showSuccessMessage &&
      isLastPage &&
      this.isGuest;
    let title = isLastPage ? 'TERMINER' : 'CONTINUER';
    title = showContactUs ? 'NOUS CONTACTER' : title;

    return (
      <View style={styles.buttonsContainer}>
        {pageIndex > 0 ? (
          <TouchableOpacity
            style={{
              borderRadius: 5,
              paddingHorizontal: theme.padding,
              paddingVertical: theme.padding / 2,
              borderWidth: 1,
              borderColor: theme.colors.gray_medium,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={this.goBack}>
            <Text
              style={[
                theme.customFontMSmedium.body,
                { letterSpacing: 1, color: theme.colors.primary },
              ]}>
              RETOUR
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: constants.ScreenWidth * 0.45 }} />
        )}
        <TouchableOpacity
          style={{
            elevation: 1,
            borderRadius: 5,
            paddingHorizontal: theme.padding,
            paddingVertical: theme.padding / 2,
            backgroundColor: theme.colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={this.goNext}>
          <Text
            style={[
              theme.customFontMSregular.body,
              { letterSpacing: 1, color: theme.colors.white },
            ]}>
            {title}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  //##Handlers
  displayLimitPhotosSizeExceeded(totalImagesSize) {
    let totalImagesSize_MB = totalImagesSize / 1048576;
    totalImagesSize_MB = totalImagesSize_MB.toFixed(2);
    const title = 'Limite dépassée';
    const message = `Vous avez importé au total ${totalImagesSize_MB}MB.\nLa taille maximale de l'ensemble des photos importées est de 20MB.`;
    Alert.alert(title, message);
  }

  async goNext() {
    const { isTotalImagesSizeExceeded, totalImagesSize } = this.state;
    if (isTotalImagesSizeExceeded) {
      this.displayLimitPhotosSizeExceeded(totalImagesSize);
      return;
    }

    const { pageIndex, pagesDone, stepIndex, subStepIndex, showSuccessMessage } =
      this.state;
    const { pages, collection } = this.props;
    let update = {};

    //Verify fields
    const isValid = this.verifyFields(pages, pageIndex);
    if (!isValid) {
      return;
    }

    //Remove errors
    const errorUpdate = this.removeErrors(false);
    if (!_.isEmpty(errorUpdate)) {
      update = { ...update, ...errorUpdate };
    }

    //Add Page browsed + Set direction (useful for handling pageIndex/pagesDone update)
    pagesDone.push(pageIndex);
    update.pagesDone = pagesDone;
    update.isBack = false;

    //Show results (if Simulation) or Submit
    const isLastPage = pageIndex === pages.length - 1;

    if (isLastPage) {
      if (
        (collection === 'Simulations' && showSuccessMessage) ||
        collection !== 'Simulations'
      ) {
        if (this.isGuest) this.setState({ showContactModal: true });
        else await this.handleSubmit(true, true, update);
      } else if (collection === 'Simulations' && !showSuccessMessage) {
        const { products, colorCat, estimation } = this.setResults();
        update.products = products;
        update.colorCat = colorCat;
        update.estimation = estimation;
        update.showSuccessMessage = true;
        update.loading = false;
        this.setState(update);
      }
    } else {
      //Increment page
      update.pageIndex = pageIndex + 1;

      //Increment step
      if (
        pages[pageIndex].isLast ||
        (pages[pageIndex + 1] && pages[pageIndex + 1].isFirst)
      ) {
        update.stepIndex = stepIndex + 2;
      }

      //Increment subStep
      if (
        pages[pageIndex].isLastSubStep ||
        (pages[pageIndex + 1] && pages[pageIndex + 1].isFirstSubStep)
      ) {
        update.subStepIndex = subStepIndex + 1;
      }

      this.setState(update);
    }
  }

  goBack() {
    let { pageIndex, pagesDone, stepIndex, subStepIndex } = this.state;
    const { pages } = this.props;

    //Set direction (useful for handling pageIndex/pagesDone update)
    this.setState({ isBack: true });

    //Hide success message
    if (pageIndex === pages.length - 1)
      this.setState({ showSuccessMessage: false });

    pageIndex = this.state.isEdit
      ? pageIndex - 1
      : pagesDone[pagesDone.length - 1];

    this.setState({ pageIndex }, () => {
      //Pop current page from browsed pages
      pagesDone.pop();
      this.setState({ pagesDone });
    });

    //Decrement step
    if (
      pages[pageIndex].isLast ||
      (pages[pageIndex + 1] && pages[pageIndex + 1].isFirst)
    )
      this.setState({ stepIndex: stepIndex - 2 });

    //Decrement subStep
    if (
      pages[pageIndex].isLastSubStep ||
      (pages[pageIndex + 1] && pages[pageIndex + 1].isFirstSubStep)
    )
      this.setState({ subStepIndex: subStepIndex - 1 });
  }

  verifyFields(pages, pageIndex) {
    const { fields } = pages[pageIndex];
    let isValid = true;
    let error = '';

    if (pages[pageIndex].exclusiveMendatory) {
      let isError = true;
      for (const field of fields) {
        isError = isError && this.state[field.id] === '';
      }

      error = isError ? 'Veuillez remplir au moins un champs' : '';

      if (error !== '') {
        for (const field of fields) {
          let errorUpdate = {};
          errorUpdate[field.errorId] = error;
          this.setState(errorUpdate);
        }
        return false;
      }
    } else {
      for (const field of fields) {
        const {
          id,
          label,
          type,
          mendatory,
          isConditional,
          condition,
          isEmail,
          errorId,
        } = field;

        if (mendatory) {
          if (type === 'number')
            error = positiveNumberValidator(this.state[id], `"${label}"`);
          else if (type === 'address')
            error = nameValidator(this.state[id].description, `"${label}"`);
          else if (type === 'image')
            error = !this.state[id]
              ? `Le champs "${label}" est obligatoire`
              : '';
          else if (isEmail) error = emailValidator(this.state[id]);
          else error = nameValidator(this.state[id], `"${label}"`);

          if (error !== '') {
            const isHandleError =
              !isConditional ||
              (isConditional &&
                !condition.values &&
                this.state[condition.with] !== '') ||
              (isConditional &&
                condition.values &&
                arrayIntersection(
                  this.state[condition.with],
                  condition.values,
                ));

            if (isHandleError) {
              let errorUpdate = {};
              errorUpdate[errorId] = error;
              this.setState(errorUpdate);
              isValid = false;
            }
          }
        }
      }
    }

    return isValid;
  }

  removeErrors(errorId) {
    const { pageIndex, pagesDone } = this.state;
    let errorUpdate = {};

    for (const field of this.props.pages[pageIndex].fields) {
      if ((errorId && field.errorId === errorId) || !errorId) {
        errorUpdate[field.errorId] = '';
      }
    }

    return errorUpdate;
  }

  //##Logic: Submit
  async handleSubmit(isSubmitted, ignoreVerification, stateUpdate) {
    return new Promise(async (resolve, reject) => {
      try {
        this.setState({ loading: true });

        //Inputs Verification
        if (!ignoreVerification) {
          const isValid = this.verifyFields(
            this.props.pages,
            this.state.pageIndex,
          );
          if (!isValid) {
            this.setState({ loading: false });
            resolve(true);
          }
        }

        const { idPattern, collection, pdfParams } = this.props;

        //Set form
        let form = this.unformatDocument();
        form = this.addFormLogs(form);
        form.isSubmitted = form.isSubmitted || isSubmitted;
        const DocId = this.state.isEdit
          ? this.DocId
          : idPattern
            ? generateId(idPattern)
            : '';

        //Persist
        if (collection) {
          db.collection(collection).doc(DocId).set(form);
        }

        const pdfBase64 = await generatePdfForm(
          form,
          this.props.pdfType,
          pdfParams,
        );

        this.DocId = DocId;
        let update = {
          pdfBase64,
          pageIndex: 0,
          pagesDone: [],
          submitted: true,
          readOnly: true,
          isEdit: true,
          loading: false,
          showSuccessMessage: false,
        };

        if (stateUpdate) update = { ...update, ...stateUpdate };

        this.setState(update, () => {
          resolve(true);
        });
      } catch (e) {
        console.log('ERROR SUBMIT....................', e.message);
        displayError({ message: e.message });
        reject(e);
      } finally {
        this.setState({ loading: false });
      }
    });
  }

  unformatDocument() {
    const state = _.cloneDeep(this.state);
    let form = this.extractForm(state);
    return form;
  }

  extractForm(state) {
    delete state.showWelcomeMessage;
    delete state.showSuccessMessage;
    delete state.showContactModal;
    delete state.acceptPhoneCall;
    delete state.pagesDone;
    delete state.pageIndex;
    delete state.stepIndex;
    delete state.subStepIndex;
    delete state.progress;
    delete state.isPdfModalVisible;
    delete state.pdfBase64;
    delete state.loading;
    delete state.toastMessageModal;
    delete state.toastTypeModal;
    delete state.docNotFound;
    delete state.initialLoading;
    delete state.submitted;
    delete state.readOnly;
    delete state.isEdit;
    delete state.isBack;

    for (const key in state) {
      const isErrorField = key.toLowerCase().includes('error');
      if (isErrorField) {
        delete state[key];
      }
    }

    return state;
  }

  addFormLogs(form) {
    if (!this.state.isEdit) {
      const createdAt = moment().format();
      const createdBy = this.props.currentUser;
      form.createdAt = createdAt;
      form.createdBy = createdBy;
      this.setState({ createdAt, createdBy }); //Used if draft saved multiple times.
    }

    form.editedAt = moment().format();
    form.editedBy = this.props.currentUser;

    return form;
  }

  //##Logic: Simulation Results
  setResults() {
    this.setState({ loading: true });
    const form = this.unformatDocument();
    const products = this.setProducts(form);
    const colorCat = this.setColorCat(form);
    const estimation = setEstimation(products, colorCat);
    return { products, colorCat, estimation };
  }

  setProducts(form) {
    let products = [];
    const {
      transmittersTypes,
      energySource,
      isParkingMinFourMetersSqr,
      lostAticsIsolation,
      lostAticsIsolationAge,
      heatedSurface,
      slopeOrientation,
      roofLength,
      roofWidth,
      yearlyElecCost,
      livingSurface,
      hotWaterProduction,
    } = form;

    const pacAirAir = 'Pac air air (climatisation)';
    const pacAirEau = 'PAC AIR EAU';
    const isoCombles = 'Isolation des combles';
    const ballonThermo = 'Ballon thermodynamique';
    const photovolt = 'Photovoltaïque';
    //New products (02/2022)
    const cag = 'Chaudière à granulé';
    const cesi = 'Chauffe-eau solaire individuel';
    const ssc = 'Chauffage solaire combiné';

    const energySourceValues = ['Gaz', 'Fioul'];
    const slopeOrientationValues = ['Sud-Est/Sud-Ouest', 'Sud'];
    const roofSurface = Number(roofWidth) * Number(roofLength);
    const yearlyCost_PerSquareMeter = yearlyElecCost / livingSurface;

    const paeCondition = energySourceValues.includes(energySource);
    const paaCondition = transmittersTypes.includes('Radiateurs électriques');
    const isoComblesCondition =
      lostAticsIsolation == 'Oui' &&
      lostAticsIsolationAge > 6 &&
      heatedSurface > 24;
    const btCondition =
      hotWaterProduction.includes('Cumulus électrique') ||
      hotWaterProduction.includes('Chaudière');

    const sscCondition1 = roofSurface >= 10;
    const sscCondition2 = isParkingMinFourMetersSqr === 'Oui';
    const sscCondition3 = paeCondition;
    const pvCondition1 =
      slopeOrientationValues.includes(slopeOrientation) &&
      yearlyCost_PerSquareMeter > 10;
    const pvCondition2 = roofSurface >= 20;

    if (paaCondition) products.push(pacAirAir);

    if (paeCondition) {
      products.push(pacAirEau);
      products.push(cag);
    }

    if (pvCondition1) {
      if (pvCondition2) products.push(photovolt);
      if (sscCondition1 && sscCondition2 && sscCondition3) products.push(ssc);
    }

    if (isoComblesCondition) products.push(isoCombles);

    if (btCondition) {
      products.push(ballonThermo);
      products.push(cesi);
    }

    return products;
  }

  setColorCat(form) {
    let { taxIncome, familyMembersCount } = form;
    taxIncome = Number(taxIncome);
    familyMembersCount = Number(familyMembersCount);

    let personnesSupplementaires = familyMembersCount - 5;
    if (personnesSupplementaires < 0) {
      personnesSupplementaires = 0;
    }

    let couleurChoisie = 'Aucun';
    const isOneMember = familyMembersCount === 1;
    const isTwoMembers = familyMembersCount === 2;
    const isThreeMembers = familyMembersCount === 3;
    const isFourMembers = familyMembersCount === 4;
    const isFiveMembers = familyMembersCount === 5;
    const isMoreThanFive = familyMembersCount >= 6;

    if (
      (taxIncome <= 15262 && isOneMember) ||
      (taxIncome <= 22320 && isTwoMembers) ||
      (taxIncome <= 26844 && isThreeMembers) ||
      (taxIncome <= 31359 && isFourMembers) ||
      (taxIncome <= 35894 && isFiveMembers) ||
      (taxIncome <= 35894 + 4526 * personnesSupplementaires && isMoreThanFive)
    ) {
      couleurChoisie = 'blue';
    } else if (
      (taxIncome <= 19565 && isOneMember) ||
      (taxIncome <= 28614 && isTwoMembers) ||
      (taxIncome <= 34411 && isThreeMembers) ||
      (taxIncome <= 40201 && isFourMembers) ||
      (taxIncome <= 46015 && isFiveMembers) ||
      (taxIncome <= 46015 + 5797 * personnesSupplementaires && isMoreThanFive)
    ) {
      couleurChoisie = 'yellow';
    } else if (
      (taxIncome <= 29148 && isOneMember) ||
      (taxIncome <= 42848 && isTwoMembers) ||
      (taxIncome <= 51592 && isThreeMembers) ||
      (taxIncome <= 60336 && isFourMembers) ||
      (taxIncome <= 69081 && isFiveMembers) ||
      (taxIncome <= 69081 + 8744 * personnesSupplementaires && isMoreThanFive)
    ) {
      couleurChoisie = 'purple';
    } else if (
      (taxIncome > 29148 && isOneMember) ||
      (taxIncome > 42848 && isTwoMembers) ||
      (taxIncome > 51592 && isThreeMembers) ||
      (taxIncome > 60336 && isFourMembers) ||
      (taxIncome > 69081 && isFiveMembers) ||
      (taxIncome > 69081 + 8744 * personnesSupplementaires && isMoreThanFive)
    ) {
      couleurChoisie = 'pink';
    }

    return couleurChoisie;
  }

  //##Success
  setPacks(products) {
    const isSSC = products.includes('Chauffage solaire combiné');
    const isPAE = products.includes('PAC AIR EAU');
    const isBT = products.includes('Ballon thermodynamique');
    const isPV = products.includes('Photovoltaïque');

    let packs = [];
    let isPVElligible = false;

    if (isPAE) {
      if (isSSC) {
        packs = packs.concat(pack1);
      }
      if (isBT) {
        packs = packs.concat(pack2);
      }
      if (isSSC || isBT) {
        isPVElligible = true;
      }
    }

    return { packs, isPVElligible };
  }

  successMessage() {
    const title = 'Estimation de votre prime: ';
    const { products, colorCat, estimation, submitted } = this.state;
    const message1 = 'Ce que nous vous recommandons';
    const colorLabel = this.setColorLabel(colorCat);
    const { packs, isPVElligible } = this.setPacks(products);

    return (
      <View style={{ flex: 1 }}>
        <ScrollView
          style={{ backgroundColor: theme.colors.white }}
          contentContainerStyle={{ paddingBottom: 8 }}>
          <View style={styles.sucessMessageContent}>
            <Text
              style={[
                theme.customFontMSmedium.body,
                styles.successMessageTitle,
              ]}>
              Vous êtes dans le barème: {colorLabel}
            </Text>
          </View>

          {/* <View style={{ padding: theme.padding }}>
                        <Text style={[theme.customFontMSsemibold.body, { opacity: 0.8, marginBottom: 16 }]}>{message1}</Text>
                        {products.map((product, key) => {
                            return (
                                <View key={key.toString()} style={{ flexDirection: "row" }}>
                                    <Image source={this.getImage(product)} style={{ alignSelf: 'center', width: 15, height: 15 }} />
                                    <Text style={[theme.customFontMSregular.body, { marginLeft: 8 }]}>{product}</Text>
                                </View>
                            )
                        }
                        )}
                    </View> */}

          <View
            style={{
              width: constants.ScreenWidth - theme.padding * 2,
              alignSelf: 'center',
              borderColor: theme.colors.gray_light,
              borderWidth: StyleSheet.hairlineWidth,
            }}
          />

          {/* <EEBPack packs={packs} isPV={isPVElligible} colorCat={colorCat} /> */}

          <View style={{ flex: 1, padding: theme.padding }}>
            {/* <Text style={[theme.customFontMSsemibold.body, { opacity: 0.8, marginBottom: 16 }]}>{message3}</Text>
                        {this.renderTrackingSteps()} */}
            <Image
              source={require('../assets/images/maprimerenove.jpg')}
              style={{
                width: constants.ScreenWidth - theme.padding * 2,
                height: constants.ScreenWidth - theme.padding * 2,
                alignSelf: 'center',
              }}
            />
          </View>
        </ScrollView>

        {submitted && this.renderBottomRightButton('Générer', this.toggleModal)}
      </View>
    );
  }

  renderTrackingSteps() {
    const steps = [
      {
        circleColor: 'green',
        barColor: 'green',
        textColor: theme.colors.secondary,
        title: 'OK',
        caption: "L'estimation de votre prime à été calculée",
      },
      {
        circleColor: 'green',
        barColor: theme.colors.graySilver,
        textColor: theme.colors.secondary,
        title: 'Contact',
        caption:
          'Un conseiller vous contacte par téléphone et valide votre dossier.',
      },
      {
        circleColor: theme.colors.graySilver,
        barColor: theme.colors.graySilver,
        textColor: theme.colors.graySilver,
        title: 'Etude et offre précontractuelle',
        caption:
          'Synergys vous remet votre étude et votre offre précontractuelle.',
      },
      {
        circleColor: theme.colors.graySilver,
        barColor: theme.colors.graySilver,
        textColor: theme.colors.graySilver,
        title: 'Travaux',
        caption: 'offre précontractuelle acceptée, nous entamons les travaux.',
      },
      {
        circleColor: theme.colors.graySilver,
        barColor: theme.colors.graySilver,
        textColor: theme.colors.graySilver,
        title: 'Aide',
        caption:
          "Pour les aides ? Vous n'avez pas à les avancer, Synergys est mandataire administratif et financier de Maprime Rénov !",
      },
    ];

    return steps.map((step, index) => {
      return (
        <View key={index.toString()} style={{ flexDirection: 'row' }}>
          <View style={{ alignItems: 'center' }}>
            <View
              style={{
                width: 16,
                height: 16,
                borderRadius: 8,
                backgroundColor: step.circleColor,
              }}
            />
            {index !== steps.length - 1 && (
              <View
                style={{ flex: 1, width: 2, backgroundColor: step.barColor }}
              />
            )}
          </View>

          <View style={{ flex: 1, paddingLeft: 16, marginBottom: 24 }}>
            <Text
              style={[
                theme.customFontMSsemibold.body,
                { marginTop: -4, color: step.textColor },
              ]}>
              {step.title}
            </Text>
            <Text
              style={[
                theme.customFontMSregular.caption,
                { color: theme.colors.gray_dark },
              ]}>
              {step.caption}
            </Text>
          </View>
        </View>
      );
    });
  }

  getImage(name) {
    switch (name) {
      case 'Pac air air (climatisation)':
        return require('../assets/icons/pacAirAir.png');
        break;
      case 'PAC AIR EAU':
        return require('../assets/icons/pacAirEau.png');
        break;
      case 'Ballon thermodynamique':
        return require('../assets/icons/ballonThermo.png');
        break;
      case 'Isolation des combles':
        return require('../assets/icons/isoCombles.png');
        break;
      default:
        return require('../assets/icons/pacAirAir.png');
        break;
    }
  }

  //##BackHandler
  componentWillUnmount() {
    BackHandler.removeEventListener(
      'hardwareBackPress',
      this.handleBackButtonClick,
    );
  }

  handleBackButtonClick() {
    const { showWelcomeMessage, submitted, readOnly, isEdit } = this.state;

    if (!isEdit && !showWelcomeMessage && !submitted) {
      const title = 'Abandonner';
      const message =
        'Les données saisies seront perdues. Êtes-vous sûr de vouloir annuler ?';
      const handleConfirm = () => {
        this.initialState.initialLoading = false;
        this.setState(this.initialState, () =>
          this.props.navigation.goBack(null),
        );
        this.props.navigation.goBack(null);
      };
      this.myAlert(title, message, handleConfirm);
    } else {
      if (!readOnly) this.setState({ readOnly: true });
      else {
        this.initialState.initialLoading = false;
        this.setState(this.initialState, () =>
          this.props.navigation.goBack(null),
        );
      }
    }
    return true;
  }

  //##Helpers
  toggleModal() {
    this.setState({ isPdfModalVisible: !this.state.isPdfModalVisible });
  }
  
  requestStoragePermission = async () => {
    if (Platform.OS === 'android' && Platform.Version < 30) {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Permission de stockage',
            message: 'L\'application a besoin d\'accéder au stockage pour enregistrer le fichier.',
            buttonNeutral: 'Plus tard',
            buttonNegative: 'Annuler',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    // Android 10+ : Scoped Storage
    return true;
  };
  
  savePdfBase64 = async (base64Data) => {
    try {
      // Vérification des permissions pour Android < 10
      const hasPermission = await this.requestStoragePermission();
      console.log('hasPermission: ' + hasPermission);
  
      if (!hasPermission) {
        this.setState({
          toastMessageModal: 'Permission refusée',
          toastTypeModal: 'error',
        });
        return;
      }
  
      // Définir le chemin du fichier
      const path = `${RNFS.DownloadDirectoryPath}/generated_file.pdf`;
      console.log('Path cible : ' + path);
      const dirExists = await RNFS.exists(RNFS.DownloadDirectoryPath);
      if (!dirExists) {
        console.error('Le répertoire Download n\'existe pas ou n\'est pas accessible.');
        return;
      } else{
        console.log('Le répertoire Download ')
      }
  
      // Écriture du fichier PDF
      // await RNFS.writeFile(path, base64Data, 'base64');
      // console.log(`Fichier enregistré avec succès dans : ${path}`);
  
      // this.setState({
      //   toastMessageModal: `Fichier enregistré dans : ${path}`,
      //   toastTypeModal: 'success',
      // });
  
      // // Notifier l'utilisateur
      // Alert.alert('Succès', `Fichier enregistré dans : ${path}`);
  
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du fichier PDF :', error);
  
      // Mise à jour de l'état pour une alerte utilisateur
      this.setState({
        toastMessageModal: 'Erreur lors de la sauvegarde',
        toastTypeModal: 'error',
      });
  
      // Facultatif : afficher une alerte d'erreur
      Alert.alert('Erreur', 'Impossible de sauvegarder le fichier PDF.');
    }
  };
  


  renderBottomRightButton(title, onPress) {
    return (
      <Button
        mode="contained"
        containerStyle={styles.bottomRightButton}
        onPress={onPress}>
        {title}
      </Button>
    );
  }

  calculateStepIndex(selectedPageIndex) {
    let stepIndex = 0;
    let subStepIndex = 0;
    const { pages } = this.props;

    let i = 0;
    let pagesIterator = pages[i];
    while (i <= selectedPageIndex && i < pages.length - 1) {
      if (pagesIterator.isLast) {
        stepIndex += 2;
      }
      if (pagesIterator.isLastSubStep) {
        subStepIndex += 1;
      }
      i += 1;
      pagesIterator = pages[i];
    }

    return { stepIndex, subStepIndex };
  }

  setColorLabel(colorCat) {
    const simulationColorCat = simulationColorCats.filter(
      (color) => color.id === colorCat,
    );

    const colorLabel =
      simulationColorCat.length > 0 ? simulationColorCat[0].label : '';

    return colorLabel;
  }

  //##Overview
  renderOverview() {
    const { readOnly, isEdit } = this.state;
    const { pages, collection } = this.props;
    const form = this.unformatDocument();
    let redundantFields = [];

    let showSummary = false;
    if (collection === 'Simulations') {
      const { colorCat, estimation } = form;
      const products = form.products.join(', ');
      const colorLabel = this.setColorLabel(colorCat);

      var summary = [
        { title: 'Barème', value: colorLabel },
        // { title: "Produits recommandés", value: products },
        // { title: "Estimation", value: `${estimation} €` },
      ];
      showSummary = colorCat !== '' && products !== [] && estimation > 0;
    }

    return (
      <View style={{ flex: 1 }}>
        <Text
          style={[
            theme.customFontMSbold.body,
            {
              backgroundColor: theme.colors.primary,
              width: '100%',
              textAlign: 'center',
              color: theme.colors.white,
              alignSelf: 'center',
              paddingVertical: theme.padding * 0.8,
              letterSpacing: 1,
            },
          ]}>
          RÉCAPITULATIF
        </Text>

        <ScrollView contentContainerStyle={styles.overviewContainer}>
          {showSummary && (
            <View
              style={{
                marginBottom: theme.padding / 2,
                backgroundColor: theme.colors.white,
              }}>
              {summary.map((item, key) => {
                return (
                  <View key={key.toString()} style={styles.overviewRow}>
                    <Text
                      style={[
                        theme.customFontMSsemibold.caption,
                        styles.overviewText,
                        { opacity: 0.8 },
                      ]}>
                      {item.title}
                    </Text>
                    <Text
                      style={[
                        theme.customFontMSbold.caption,
                        styles.overviewText,
                      ]}>
                      {item.value}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}

          <View style={{ marginBottom: 16, backgroundColor: 'white' }}>
            {pages.map((page, pageIndex) => {
              return (
                <View key={pageIndex.toString()}>
                  {page.fields.map((field, key) => {
                    let values = '';

                    //Avoid repetition of same field (isStepMultiOptions)
                    if (redundantFields.includes(field.id)) return null;

                    if (field.isStepMultiOptions)
                      redundantFields.push(field.id);

                    //Values definition
                    if (
                      typeof form[field.id] !== 'undefined' &&
                      form[field.id] !== null
                    ) {
                      //String fields
                      if (typeof form[field.id] === 'string') {
                        if (form[field.id] !== '') {
                          values = form[field.id];
                        }
                      }

                      //Boolean fields
                      else if (typeof form[field.id] === 'boolean') {
                        values = !form[field.id] ? 'Oui' : 'Non';
                      }

                      //Address field
                      else if (field.type === 'address') {
                        values = form[field.id].description;
                      }

                      //Array fields
                      else if (
                        Array.isArray(form[field.id]) &&
                        form[field.id] !== []
                      ) {
                        values = '';
                        values = form[field.id].join(', ');
                      }
                    }

                    if (field.type === 'autogen') return null;
                    else {
                      const emptyAndConditional =
                        !values && field.isConditional;
                      return (
                        <View key={key}>
                          {page.subStep && (
                            <View
                              style={{
                                backgroundColor: '#003250',
                                paddingHorizontal: theme.padding,
                                paddingVertical: theme.padding / 2,
                              }}>
                              <Text
                                style={[
                                  theme.customFontMSmedium.header,
                                  { color: theme.colors.white },
                                ]}>
                                {page.subStep.label}
                              </Text>
                            </View>
                          )}
                          {page.section && key === 0 && (
                            <View
                              style={{
                                backgroundColor: theme.colors.gray_light,
                                paddingHorizontal: theme.padding,
                                paddingVertical: theme.padding / 2,
                              }}>
                              <Text
                                style={[
                                  theme.customFontMSmedium.body,
                                  { color: '#003250' },
                                ]}>
                                {page.section.label}
                              </Text>
                            </View>
                          )}
                          <TouchableOpacity
                            key={field.id.toString()}
                            onPress={() => {
                              if (emptyAndConditional) return;
                              const { stepIndex, subStepIndex } =
                                this.calculateStepIndex(pageIndex);
                              this.setState({
                                pageIndex,
                                stepIndex,
                                subStepIndex,
                                showSuccessMessage: false,
                                readOnly: false,
                                submitted: false,
                              });
                            }}
                            style={styles.overviewRow}>
                            <Text
                              style={[
                                theme.customFontMSregular.caption,
                                styles.overviewText,
                                {
                                  color: emptyAndConditional
                                    ? theme.colors.gray_medium
                                    : theme.colors.gray_dark,
                                },
                              ]}>
                              {field.label}
                            </Text>
                            <Text
                              style={[
                                theme.customFontMSregular.caption,
                                styles.overviewText,
                                {
                                  color: emptyAndConditional
                                    ? theme.colors.gray_medium
                                    : theme.colors.gray_googleAgenda,
                                },
                              ]}>
                              {values || '-'}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      );
                    }
                  })}
                </View>
              );
            })}
          </View>
        </ScrollView>

        {isEdit &&
          readOnly &&
          this.renderBottomRightButton('Générer', this.toggleModal)}
      </View>
    );
  }

  renderSubSteps() {
    const { stepIndex } = this.state;

    if (this.props.steps[stepIndex])
      var { subSteps, subStepsCount } = this.props.steps[stepIndex];

    if (!subSteps) return null;

    const flex = 1 / subStepsCount - 0.02;

    return (
      <View style={styles.subStepsContainer}>
        {subSteps.map((subStep, i) => {
          const isSubStepSelected = this.state.subStepIndex === i;
          const { primary, white } = theme.colors;
          const backgroundColor = isSubStepSelected ? primary : white;
          return (
            <View
              style={[
                styles.subStepContainer,
                {
                  flex,
                  backgroundColor,
                  borderWidth: isSubStepSelected ? 0 : StyleSheet.hairlineWidth,
                },
              ]}>
              <Text
                style={[
                  theme.customFontMSmedium.body,
                  {
                    textAlign: 'center',
                    color: isSubStepSelected
                      ? theme.colors.white
                      : theme.colors.gray_dark,
                  },
                ]}>
                {subStep.id}
              </Text>
            </View>
          );
        })}
      </View>
    );
  }

  renderContent() {
    const {
      initialLoading,
      readOnly,
      showWelcomeMessage,
      showSuccessMessage,
      submitted,
      isEdit,
    } = this.state;
    const { pages, steps } = this.props;

    if (initialLoading) return <Loading />;
    else if (isEdit && readOnly) return this.renderOverview();
    else if (showWelcomeMessage && this.props.welcomeMessage) {
      const callBack = () => this.setState({ showWelcomeMessage: false });
      return this.props.welcomeMessage(callBack);
    } else
      return (
        <View style={styles.container}>
          {!showSuccessMessage && (
            <View style={styles.header}>
              {this.renderSteps(pages, steps)}
              {this.renderProgression(pages)}
            </View>
          )}

          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : null}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}>
            <View style={styles.body}>
              {this.renderSubSteps()}
              {!showSuccessMessage && this.renderTitle(pages)}
              {this.renderForm(pages)}
            </View>
          </KeyboardAvoidingView>

          {!submitted && this.renderButtons(pages)}
        </View>
      );
  }

  async handleSave() {
    const { collection, pages } = this.props;
    const { pageIndex } = this.state;

    if (collection === 'Simulations') {
      const { products, colorCat, estimation } = this.setResults();
      this.setState({ products, colorCat, estimation });
    }

    const isLastPage = pageIndex === pages.length - 1;
    const isSubmitted = isLastPage;
    await this.handleSubmit(isSubmitted, false);
  }

  toggleContactModal() {
    this.setState({ showContactModal: !this.state.showContactModal });
  }

  async submitContactForm() {
    try {
      //0. Verify input
      const isValid = this.verifyFields(contactForm, 0);
      if (!isValid) return;

      //1. Hide contact form
      this.setState({ showContactModal: false });

      //2. Show loading dialog
      setTimeout(() => {
        this.setState({ loading: true });
      }, 500);

      // 4. Generate Fiche EEB PDF (page 1) + Products & Packages (page 2) + Contact info (page 3)
      const pdfBase64 = await generatePdfForm(
        this.state,
        this.props.collection,
        this.props.pdfParams,
      );

      //5. Send email (using nodemailer)
      const {
        nameSir,
        nameMiss,
        acceptPhoneCall,
        addressCity,
        addressNumber,
        addressStreet,
        addressPostalCode,
        email,
        phone,
        products,
        colorCat,
      } = this.state;
      const clientName = nameSir || nameMiss || 'eeb';
      const isAcceptPhoneCall = acceptPhoneCall ? 'Oui' : 'Non';

      const subject = 'Contact client';
      const receivers = ['contact@eqx-software.com', 'salimlyoussi1@gmail.com'];
      const attachments = [
        {
          filename: `Simulation-${clientName}.pdf`,
          content: pdfBase64,
          encoding: 'base64',
        },
      ];

      const { packs, isPVElligible } = this.setPacks(products);

      const packsList = packs.map((choice, i) => {
        let myHtml = `<p>Pack ${i + 1}:</p><ul>`;
        for (const product of choice) {
          const str = `<li>${product}</li>`;
          myHtml = myHtml.concat(str);
        }
        const PVElligibleStr = isPVElligible
          ? "<li>Éligible à l'option photovoltaïque</li>"
          : '';
        myHtml = myHtml.concat(PVElligibleStr);

        const estimation = setEstimation(choice, colorCat);
        const amount = `</ul><p>Estimation des aides: €${estimation}</p>`;
        myHtml = myHtml.concat(amount);
        myHtml = `${myHtml}`;
        return myHtml;
      });
      const packsHtmlList = packsList.join('');

      const html = `
                    <!DOCTYPE html>
                        <html>
                        <body>
                           <h2>Coordonnées du client</h2>
                           <p>Nom: ${clientName}</p>
                           <p>Ville: ${addressCity}</p>
                           <p>N°: ${addressNumber}</p>
                           <p>Rue: ${addressStreet}</p>
                           <p>Code postal: ${addressPostalCode}</p>
                           <p>Email: ${email}</p>
                           <p>Téléphone: ${phone}</p>
                           <p>Être rappelé: ${isAcceptPhoneCall}</p>    
                           <h2>Packs proposés</h2>
                               ${packsHtmlList}
                        </body>
                        </html>
                    `;

      const sendEmail = functions.httpsCallable('sendEmail');
      const isSent = await sendEmail({ receivers, subject, html, attachments });
      console.log('Has email been sent ?', isSent);

      //6. Reset state & Go to success screen
      this.initialState.loading = false;
      this.setState(this.initialState, () => {
        const title = "Votre dossier d'aide a été délivré avec succès!";
        const subHeading =
          'Un conseiller vous contactera bientôt pour vous communiquer la démarche à suivre. Merci de patienter.';
        this.props.navigation.navigate('GuestContactSuccess', {
          title,
          subHeading,
        });
      });
    } catch (e) {
      console.log('Error::::::', e);
      displayError({ message: e.message });
    }
  }

  renderGuestContactModal() {
    const { showContactModal } = this.state;

    return (
      <Modal
        isVisible={showContactModal}
        onSwipeComplete={this.toggleContactModal}
        onBackButtonPress={this.toggleContactModal}
        onBackdropPress={this.toggleContactModal}
        style={styles.contactModal}
        propagateSwipe={true}>
        <View style={styles.scrollableModal}>
          <ModalHeader
            title="Coordonnées"
            toggleModal={this.toggleContactModal}
          />

          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : null}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}>
            <ScrollView
              style={{ flex: 0.9, paddingHorizontal: theme.padding }}
              contentContainerStyle={{ paddingBottom: 200 }}>
              {this.renderFields(contactForm, 0)}
            </ScrollView>
          </KeyboardAvoidingView>

          <View style={{ flex: 0.1, paddingRight: theme.padding }}>
            <Button
              mode="contained"
              containerStyle={{ alignSelf: 'flex-end' }}
              onPress={this.submitContactForm}>
              <Text style={[theme.customFontMSmedium.caption]}>Soumettre</Text>
            </Button>
          </View>
        </View>
      </Modal>
    );
  }

  render() {
    const {
      showWelcomeMessage,
      isPdfModalVisible,
      pdfBase64,
      isEdit,
      readOnly,
      loading,
      docNotFound,
      toastMessageModal,
      toastTypeModal,
    } = this.state;
    const { collection } = this.props;
    const isProcess = this.props.route?.params?.onGoBack ? true : false;
    

    if (docNotFound)
      return (
        <View style={styles.mainContainer}>
          <Appbar close title titleText={this.title}/>
          <EmptyList
            icon={faTimes}
            header="Formulaire introuvable"
            description="Le formulaire est introuvable dans la base de données. Il se peut qu'il ait été supprimé."
            offLine={!this.props.network.isConnected}
          />
        </View>
      );

    return (
      <View style={styles.mainContainer}>
        <Appbar
          appBarColor={'#003250'}
          iconsColor={theme.colors.white}
          theme={{ colors: {  color: '#fff' } }}
          close={!this.isGuest}
          title
          check={!showWelcomeMessage && !readOnly && !this.isGuest}
          handleSubmit={this.handleSave}
          edit={isEdit && readOnly}
          handleEdit={() => this.setState({ submitted: false, readOnly: false })}
          titleText={this.props.titleText}
          customBackHandler={this.handleBackButtonClick}
        />

        {this.renderContent()}
        {this.isGuest && this.renderGuestContactModal()}

        <Modal
          isVisible={isPdfModalVisible}
          onSwipeComplete={this.toggleModal}
          onBackButtonPress={this.toggleModal}
          onBackdropPress={this.toggleModal}
          style={styles.modal}>
          <View style={styles.scrollableModal}>
            <ModalHeader
              title={`${this.props.fileName} généré${articles_fr(
                'e',
                mascCollections,
                collection,
              )}`}
              toggleModal={this.toggleModal}
            />
            {pdfBase64 !== '' && ( //#task: test isPdfModalVisible && pdfBase64 (to avoid crash)
              <View style={{ flex: 1 }}>
                <Pdf
                  source={{ uri: `data:application/pdf;base64,${pdfBase64}` }}
                  style={modalStyles.pdf}
                />
              </View>
            )}
            <Toast
              duration={1500}
              message={toastMessageModal}
              type={toastTypeModal}
              onDismiss={() => this.setState({ toastMessageModal: '' })}
              containerStyle={{ bottom: constants.ScreenHeight * 0.1 }}
            />
          </View>

          <View style={{ backgroundColor: 'white' }}>
            {isProcess
              ? this.renderBottomRightButton('Valider', () =>
                this.savePdfBase64(pdfBase64, isProcess),
              )
              : this.renderBottomRightButton('Télécharger', () =>
                this.savePdfBase64(pdfBase64, isProcess),
              )}
          </View>
        </Modal>

        <LoadDialog message={'Traitement en cours...'} loading={loading} />
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

export default connect(mapStateToProps)(StepsForm);

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  formContainer: {
    // flex: 1,
    // flexGrow: 1,
    // justifyContent: 'center',
    paddingTop: constants.ScreenHeight * 0.05,
    paddingBottom: 24,
    paddingHorizontal: theme.padding,
  },
  subStepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.padding / 2,
    marginHorizontal: theme.padding,
  },
  subStepContainer: {
    height: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 2,
    borderColor: theme.colors.gray_medium,
  },
  header: {
    backgroundColor: '#003250',
    paddingHorizontal: theme.padding,
  },
  step: {
    borderWidth: 1,
    borderColor: '#003250',
    padding: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  stepsSeparator: {
    flex: 1,
    alignSelf: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.white,
  },
  titleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: theme.padding,
    paddingHorizontal: theme.padding,
  },
  body: {
    flex: 1,
    backgroundColor: theme.colors.white,
    // paddingHorizontal: theme.padding
  },
  stepsContainer: {
    flexDirection: 'row',
    //  alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#003250',
  },
  buttonsContainer: {
    padding: theme.padding,
    backgroundColor: theme.colors.background,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bottomRightButton: {
    alignSelf: 'flex-end',
    marginRight: theme.padding,
  },
  sucessMessageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.padding * 2,
    backgroundColor: '#003250',
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
  },
  colorCatCircle: {
    height: 18,
    width: 18,
    borderRadius: 9,
  },
  successMessageTitle: {
    color: theme.colors.white,
    textAlign: 'center',
    letterSpacing: 1,
    marginLeft: 8,
  },
  overviewContainer: {
    flexGrow: 1,
    // paddingTop: theme.padding / 2,
    paddingBottom: theme.padding * 3,
    backgroundColor: theme.colors.gray_extraLight,
  },
  overviewRow: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.gray_light,
    marginHorizontal: theme.padding,
  },
  overviewText: {
    flex: 0.5,
    paddingHorizontal: theme.padding / 2,
    paddingRight: theme.padding * 2,
    paddingVertical: theme.padding / 2,
  },
  modal: {
    width: constants.ScreenWidth,
    marginTop: constants.ScreenHeight * 0.05,
    marginHorizontal: 0,
    marginBottom: 0,
    borderTopLeftRadius: constants.ScreenWidth * 0.03,
    borderTopRightRadius: constants.ScreenWidth * 0.03,
  },
  contactModal: {
    width: constants.ScreenWidth * 0.7,
    marginVertical: constants.ScreenHeight * 0.1,
    alignSelf: 'center',
    borderRadius: constants.ScreenWidth * 0.05,
  },
  scrollableModal: {
    flex: 1,
    borderTopLeftRadius: constants.ScreenWidth * 0.03,
    borderTopRightRadius: constants.ScreenWidth * 0.03,
    backgroundColor: '#fff',
  },
  scrollableModalContent1: {
    height: 200,
    backgroundColor: '#87BBE0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollableModalText1: {
    fontSize: 20,
    color: 'white',
  },
  scrollableModalContent2: {
    height: 200,
    backgroundColor: '#A9DCD3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollableModalText2: {
    fontSize: 20,
    color: 'white',
  },
  formOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
});

const modalStyles = StyleSheet.create({
  modal: {
    width: constants.ScreenWidth,
    marginTop: constants.ScreenHeight * 0.07,
    marginHorizontal: 0,
    marginBottom: 0,
    borderTopLeftRadius: constants.ScreenWidth * 0.03,
    borderTopRightRadius: constants.ScreenWidth * 0.03,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.primary,
    borderTopLeftRadius: constants.ScreenWidth * 0.03,
    borderTopRightRadius: constants.ScreenWidth * 0.03,
    paddingHorizontal: theme.padding,
    paddingVertical: 10,
  },
  pdf: {
    flex: 1,
    width: constants.ScreenWidth, //fixed to screen width
    height: 500,
    backgroundColor: theme.colors.gray50,
  },
});

const itemStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: constants.ScreenWidth,
  },
  trackingRow: {
    flex: 0.5,
    flexDirection: 'row',
  },
  trackingLineRight: {
    borderRightWidth: 1,
  },
  trackingLineLeft: {
    borderLeftWidth: 1,
  },
  trackingCircle: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  iconContainer: {
    flex: 0.25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBackground: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: constants.ScreenWidth * 0.085,
    width: constants.ScreenWidth * 0.17,
    height: constants.ScreenWidth * 0.17,
  },

  textContainer: {
    flex: 0.6,
    justifyContent: 'center',
    paddingLeft: 15,
    paddingRight: 10,
  },
});

//DONE
//Submit color, estimation & products
//Algo: products not showing all
//Scrollview on recap simulation
//"Générer une fiche eeb" button is showed even after pressing faPen
//message: Enregistré avec succés
// Save draft (check icon when this.isEdit === false)
// Tag drafts
// Navigate to pageindex onPress field recap
// Cancel attachment removes reference

//TO FIX
//Soumettre: crash when editing existing field (try speed)
//--> Check screenshot of error
