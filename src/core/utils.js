import { Alert, Platform } from 'react-native'
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs'
import RNFetchBlob from 'rn-fetch-blob'
import FileViewer from 'react-native-file-viewer'
import { decode as atob, encode as btoa } from "base-64"
import SearchInput, { createFilter } from 'react-native-search-filter'
import ShortUniqueId from 'short-unique-id'
import UUIDGenerator from 'react-native-uuid-generator'
import { PDFDocument, degrees, PageSizes, StandardFonts, rgb } from 'pdf-lib'
import _ from 'lodash'
import { faCheck, faFlag, faTimes, faClock, faUpload, faFileSignature, faSackDollar, faEnvelopeOpenDollar, faEye, faPen, faBan, faEllipsisH, faPauseCircle, faSave, faUserHardHat } from '@fortawesome/free-solid-svg-icons'
//import Geocoder from 'react-native-geocoding';

import moment from 'moment';
import 'moment/locale/fr'
moment.locale('fr')

import * as theme from './theme'
import { downloadDir, errorMessages, roles, constants, isTablet, collectionScreenNameMap, publicDocTypes, allDocTypes } from './constants'
import { mandatSynergysModel, pvReceptionModel } from "./forms";
import { ficheEEBModel } from './forms/ficheEEB/ficheEEBModel'
import { mandatMPRModel } from './forms/mandatMPR/mandatMPRModel'

//##VALIDATORS
export const emailValidator = email => {
  const re = /\S+@\S+\.\S+/;

  if (!email || email.length <= 0) return "Le champs email est obligatoire.";
  if (!re.test(email)) return "Adresse email non valide.";

  return "";
};

export const passwordValidator = password => {
  if (!password || password.length <= 0) return "Le champs mot de passe est obligatoire.";

  return "";
};

export const nameValidator = (name, label) => {
  if (!name || name.length <= 0) return "Le champs " + label + " est obligatoire.";
  // if (!name || name.length <= 0) return "Le champs nom est obligatoire.";

  return "";
};

export const arrayValidator = (array, label) => {
  if (array.length === 0) return `Le champs ${label} est obligatoire`

  return ''
}

export const positiveNumberValidator = (price, label) => {
  price = Number(price)
  if (price === "" || price <= 0) return `Le champs ${label} doit être un nombre positif`
  return ""
}

export const phoneValidator = phone => {
  const re = /^((\+)33|0)[1-9](\d{2}){4}$/;

  if (!phone || phone.length <= 0) return "Le champs téléphone est obligatoire.";
  if (!re.test(phone)) return "Numéro de téléphone non valide.";

  return "";
}

export const compareDates = (date1, date2, operator) => {

  if (operator === 'isBefore') {
    if (moment(date1).isBefore(moment(date2))) return "La date d'échéance doit être supérieure à la date de début."
  }

  else if (operator === 'isAfter') {
    if (moment(date1).isAfter(moment(date2))) return "La date d'échéance doit être supérieure à la date de début."
  }

  else if (operator === 'isSame') {
    if (moment(date1).isSame(moment(date2))) return "La date d'échéance doit être supérieure à la date de début."
  }

  else if (operator === 'isSameOrAfter') {
    if (moment(date1).isSameOrAfter(moment(date2))) return "La date d'échéance doit être supérieure à la date de début."
  }

  else if (operator === 'isSameOrBefore') {
    if (moment(date1).isSameOrBefore(moment(date2))) return "La date d'échéance doit être supérieure à la date de début."
  }

  return "";
}

export const compareDays = (day1, day2, operator) => {
  if (operator === 'isBefore') {
    if (moment(day1).isBefore(moment(day2), 'days'))
      return "Le jour de fin doit être supérieur au jour de début."
    return ''
  }
}

export const compareTimes = (time1, time2, operator) => {
  if (operator === 'isBefore') {
    if (moment(time1, 'HH:mm').isBefore(moment(time2, 'HH:mm'), 'minute'))
      return "L'heure d'échéance doit être supérieure à l'heure de début."
    return ""
  }
}

export const checkOverlap = (timeSegments) => {
  if (timeSegments.length === 1) return false;

  timeSegments.sort((timeSegment1, timeSegment2) =>
    timeSegment1[0].localeCompare(timeSegment2[0])
  );

  for (let i = 0; i < timeSegments.length - 1; i++) {
    const currentEndTime = timeSegments[i][1];
    const nextStartTime = timeSegments[i + 1][0];

    if (currentEndTime > nextStartTime) {
      return true;
    }
  }

  return false;
};

//##NAVIGATION
export const navigateToScreen = (main, screen, params) => {
  main.props.navigation.navigate(screen, params)
}

//##HELPERS

export const formatSpaces = (str) => {
  str = str.replace(/\s+/g, '-').toLowerCase();
  return str
}



//We suppose that firstName can be composed of many strings. And lastName only one string.
export const retrieveFirstAndLastNameFromFullName = (fullName) => {
  let fullNameArr = fullName.split(' ')
  const lastName = fullNameArr[fullNameArr.length - 1]
  fullNameArr.pop()
  const firstName = fullNameArr.join(' ')
  return { firstName, lastName }
}

export const getMinObjectProp = (arrObjects, property) => {
  return arrObjects.reduce((min, object) => object[property] < min ? object[property] : min, arrObjects[0][property])
}

export const getMaxObjectProp = (arrObjects, property) => {
  return arrObjects.reduce((max, object) => object[property] > max ? object[property] : max, arrObjects[0][property])
}

export const formatRow = (active, data, numColumns) => { //Format rows to display 3 columns grid
  if (!active) return data
  const numberOfFullRows = Math.floor(data.length / numColumns)
  let numberOfElementsLastRow = data.length - (numberOfFullRows * numColumns)
  while (numberOfElementsLastRow !== numColumns && numberOfElementsLastRow !== 0) {
    data.push({ id: `blank-${numberOfElementsLastRow}`, empty: true })
    numberOfElementsLastRow++
  }

  return data
}

export const stringifyUndefined = (data) => {
  const stringifiedData = typeof (data) !== 'undefined' ? data : ''
  return stringifiedData
}

export const configChoiceIcon = (choice) => {
  const element = _.cloneDeep(choice)
  const width = constants.ScreenWidth * 0.45 * 0.45

  if (element.image) {
    if (element.image === "sofincoLogo") {
      element.image = require("../assets/icons/sofincoLogo.png")
      element.imageStyle = { width, height: width / (990 / 228) }
    }
    else if (element.image === "cofidisLogo") {
      element.image = require("../assets/icons/cofidisLogo.png")
      element.imageStyle = { width, height: width / (5000 / 2749) }
    }
    else if (element.image === "domofinanceLogo") {
      element.image = require("../assets/icons/domofinanceLogo.jpg")
      element.imageStyle = { width, height: width / (500 / 296) }
    }
  }

  else {
    if (element.id === 'confirm') { element.icon = faCheck; element.iconColor = theme.colors.primary }
    else if (element.id === 'finish') { element.icon = faFlag; element.iconColor = theme.colors.primary }
    else if (element.id === 'cancel') { element.icon = faTimes; element.iconColor = theme.colors.error }
    else if (element.id === 'skip') { element.icon = faTimes; element.iconColor = theme.colors.error }
    else if (element.id === 'comment') { element.icon = faTimes; element.iconColor = theme.colors.error }
    else if (element.id === 'postpone') { element.icon = faClock; element.iconColor = theme.colors.secondary }
    else if (element.id === 'upload') { element.icon = faUpload; element.iconColor = theme.colors.secondary }
    else if (element.id === 'view') { element.icon = faEye; element.iconColor = theme.colors.secondary }
    else if (element.id === 'edit') { element.icon = faPen; element.iconColor = theme.colors.secondary }
    else if (element.id === 'sign') { element.icon = faFileSignature; element.iconColor = theme.colors.secondary }
    else if (element.id === 'cashPayment') { element.icon = faSackDollar; element.iconColor = theme.colors.secondary }
    else if (element.id === 'financing') { element.icon = faEnvelopeOpenDollar; element.iconColor = theme.colors.secondary }
    else if (element.id === 'block') { element.icon = faBan; element.iconColor = theme.colors.error }
    else if (element.id === 'pending') { element.icon = faPauseCircle; element.iconColor = theme.colors.gray_dark }
    else if (element.id === 'other') { element.icon = faEllipsisH; element.iconColor = theme.colors.gray_dark }
  }

  return element
}

export const initFormSections = (sections, sectionsTarget) => {
  for (const key in sectionsTarget) {
    sections[key].isExpanded = true
    sections[key].show = true
    for (const i in sectionsTarget[key]) {
      sections[key]["fields"][i].show = true
    }
  }
  return sections
}

export const articles_fr = (masc, masculins, target) => {

  let resp
  if (masc === 'du') {
    resp = masculins.includes(target) ? 'du' : "d'une"
  }
  else if (masc === 'un') {
    resp = masculins.includes(target) ? "un" : "une"
  }
  else if (masc === "d'un") {
    resp = masculins.includes(target) ? "d'un" : "d'une"
  }
  else if (masc === 'le') {
    resp = masculins.includes(target) ? 'le' : 'la'
  }
  else if (masc === 'e') {
    resp = masculins.includes(target) ? '' : 'e'
  }

  return resp
}

export const isMasculin = (item, mascItems) => {
  return mascItems.includes(item)
}

export const checkPlural = (arrayLength, string) => {
  let str = ''
  if (arrayLength === 0)
    str = ''

  else if (arrayLength === 1)
    str = arrayLength + string

  else
    str = arrayLength + string + 's'

  return str
}

export const formatPrice = (price) => {
  price = (Math.round(price * 100) / 100).toFixed(2)
  return price.toString()
}

export const countDown = async (ms) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(ms)
    }, ms)
  })
}

export const arrayIntersection = (obj1, obj2) => {
  const arr1 = Array.isArray(obj1) ? obj1 : [obj1] //Convert to array
  const arr2 = Array.isArray(obj2) ? obj2 : [obj2] //Convert to array
  const filteredArray = arr2.filter(value => arr1.includes(value))
  const isIntersection = filteredArray.length > 0
  return isIntersection
}

export const setAttachmentIcon = (type) => {

  switch (type) {
    case 'application/pdf':
      return { name: 'pdf-box', color: '#da251b' }
      break

    case 'application/msword':
      return { name: 'file-word-box', color: '#295699' }
      break

    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return { name: 'file-word-box', color: '#295699' }
      break

    case 'image/jpeg':
      return { name: 'image', color: theme.colors.primary }
      break

    case 'image/png':
      return { name: 'image', color: theme.colors.primary }
      break


    case 'application/zip':
      return { name: 'zip', color: theme.colors.primary }
      break

    default:
      return { name: 'image', color: theme.colors.primary }
      break
  }

}

export const sortMonths = (monthYearArray) => {

  const months = ['Janv.', 'Févr.', 'Mars', 'Avr.', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.']
  //  const months2 = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Decembre']

  const sorter = (a, b) => {
    if (a.year !== b.year) {
      return a.year - b.year
    }
    else {
      return months.indexOf(a.month) - months.indexOf(b.month)
    }
  }

  monthYearArray.sort(sorter)

  return monthYearArray
}

export const getRoleIdFromValue = (roleValue) => {
  for (const role of roles) {
    if (role.value === roleValue)
      return role.id
  }
}

export const formatDocument = (document, properties) => {
  if (!document) return null
  let formatedDocument = _.pick(document, properties)
  return formatedDocument
}

export const unformatDocument = (thisState, properties, currentUser, isEdit) => {
  let doc = _.pick(thisState, properties)
  doc.editedAt = moment().format()
  doc.editedBy = currentUser
  doc.deleted = false
  if (!isEdit) {
    doc.createdAt = moment().format()
    doc.createdBy = currentUser
  }
  return doc
}

export const removeDuplicateObjects = (arr) => {
  const seen = new Set()

  const filteredArr = arr.filter(object => {
    const duplicate = seen.has(object.id)
    seen.add(object.id)
    return !duplicate
  })

  return filteredArr
}


//##WARNINGS
export const isEditOffline = (isEdit, isConnected) => {
  if (!isConnected && isEdit) {
    Alert.alert("", "La mise à jour des données n'est pas disponible en mode hors-ligne. Veuillez vous connecter à internet.")
    return true
  }
  return false
}

export const generateId = (suffix, length = 4) => {
  const uid = new ShortUniqueId({ length }).randomUUID();
  return suffix + uid;
};

export const uuidGenerator = async () => {
  const uuid = await UUIDGenerator.getRandomUUID()
  return uuid
}

export const updateField = (main, field, text) => {
  field.value = text
  field.error = ''
  main.setState({ field })
}

export const myAlert = function myAlert(title, message, handleConfirm, handleCancel, confirmText = 'Confirmer', cancelText = 'Annuler', extraButton = {}) {
  Alert.alert(
    title,
    message,
    [
      extraButton,
      { text: cancelText, onPress: handleCancel, style: 'cancel' },
      { text: confirmText, onPress: handleConfirm },
    ],
    { cancelable: false }
  )
}

export const displayError = (error) => {
  const showError = error && error.message !== "ignore"
  if (showError) Alert.alert('', error.message)
}

//##FILE SYSTEM
export const downloadFile = async (fileName, url, open = true, updateProgress) => {

  try {
    const path = await setDestPath(fileName)
    const fileExist = await RNFetchBlob.fs.exists(path)
    
    let downloadProgress = 0

    //Open file...
    // if (fileExist && open) {
    //   FileViewer.open(path, { showOpenWithDialog: true })
    //   return true
    // }

    // Download file...
    let options = {
      fileCache: true,
      path,
      addAndroidDownloads: {
        useDownloadManager: true,
        notification: true,
        path,
        description: 'Image',
      },
    }

    return RNFetchBlob
      .config(options)
      .fetch('GET', url)
      .progress((received, total) => {
        if (updateProgress) {
          downloadProgress = Math.round((received / total) * 100)
          updateProgress(downloadProgress)
        }
      })
      .then(() => {
        // FileViewer.open(path, { showOpenWithDialog: true })
        console.log("Opening ??")
      })
      .catch((e) => { throw new Error(e) })
  }

  catch (error) {
    throw new Error(errorMessages.documents.download)
  }
}

export const readFile = (path) => {
  return RNFS.readFile(path, "base64")
    .then((pdfBase64) => {
      const pdfArrayBuffer = base64ToArrayBuffer(pdfBase64)
      return { pdfBase64, pdfArrayBuffer }
    })
    .catch((e) => {
      throw new Error('Erreur lors du chargement du document, veuillez réessayer plus tard."')
    })
}

export const deleteFile = (path) => {
  return RNFS.exists(path)
    .then((exist) => {
      if (!exist) return true
      return RNFS.unlink(path)
    })
}

export const setDestPath = async (fileName) => {
  try {
    const destFolder = `${downloadDir}/Synergys/Documents`
    await RNFS.mkdir(destFolder)
    const destPath = `${destFolder}/${fileName}`
    return destPath
  }

  catch (e) {
    throw new Error('RNFS mkdir error has occured.')
  }
}

export const saveFile = async (file, fileName, encoding) => {
  try {
 
    const destPath = await setDestPath(fileName)
    await RNFS.writeFile(destPath, file, encoding)
    return destPath
  }
  catch (e) {
    const errorMessage = "Erreur lors de l'enregistrement du document"
    throw new Error(errorMessage)
  }
}

//##INFO UI
export const setToast = (main, type, toastMessage) => {
  let toastType = ''
  if (type === 'e')
    toastType = 'error'
  else if (type === 's')
    toastType = 'success'
  else if (type === 'i')
    toastType = 'info'

  main.setState({ toastType, toastMessage })
}

export const load = (main, bool) => {
  main.setState({ loading: bool })
}

export const loadLog = (main, bool, message) => {
  main.setState({ loading: bool, loadingMessage: message })
}
//##PDF
export const base64ToArrayBuffer = (base64) => {
  const binary_string = atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

export const uint8ToBase64 = (u8Arr) => {
  const CHUNK_SIZE = 0x8000; //arbitrary number
  let index = 0;
  const length = u8Arr.length;
  let result = "";
  let slice;
  while (index < length) {
    slice = u8Arr.subarray(index, Math.min(index + CHUNK_SIZE, length));
    result += String.fromCharCode.apply(null, slice);
    index += CHUNK_SIZE;
  }
  return btoa(result);
}

export const convertImageToPdf = async (attachment, title, notice) => {

  let errorMessage = null

  try {
    const isPng = attachment.type === 'image/png'
    const isJpeg = attachment.type === 'image/jpeg'
    if (!isPng && !isJpeg) {
      errorMessage = "Format non compatible pour une conversion en pdf. Veuillez importer un fichier PNG ou JPEG"
      throw new Error(errorMessage)
    }

    const path = attachment.path
    const imageBytes = await RNFS.readFile(path, 'base64')
    const pdfDoc = await PDFDocument.create()
    const image = isPng ? await pdfDoc.embedPng(imageBytes) : await pdfDoc.embedJpg(imageBytes)
    const page = pdfDoc.addPage(PageSizes.A4)

    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman)
    const TimesRomanBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold)
    const colors = {
      primary: rgb(0.576, 0.768, 0.486),
      black: rgb(0, 0, 0),
      white: rgb(1, 1, 1),
      gray: rgb(0.1333, 0.1333, 0.1333)
    }

    const maxHeightRatio = notice ? 0.8 : 0.83
    const scaleToFit_x = page.getWidth()
    const scaleToFit_y = page.getHeight() * maxHeightRatio
    const jpgDims = image.scaleToFit(scaleToFit_x, scaleToFit_y)
    const image_dx = - jpgDims.width / 2
    const image_dy = - jpgDims.height / 2

    page.drawImage(image, {
      x: page.getWidth() / 2 + image_dx,
      y: notice ? 5 : page.getHeight() / 2 + image_dy,
      width: jpgDims.width,
      height: jpgDims.height,
    })

    if (title)
      page.drawText(title, {
        x: page.getWidth() / 2 - TimesRomanBold.widthOfTextAtSize(title, 18) / 2,
        y: page.getHeight() * 0.95,
        size: 18,
        font: TimesRomanBold,
        color: colors.black,
      })


    if (notice) {
      notice = notice.split("\n").join(" ");
      const noticeArray = lineBreaker(notice, timesRomanFont, 16, page.getWidth() * 0.9)
      let marginTop = 0

      noticeArray.forEach((line) => {
        page.drawText(line,
          {
            x: page.getWidth() * 0.05,
            y: page.getHeight() * 0.9 - marginTop,
            size: 16,
            font: timesRomanFont,
            color: colors.black,
          })

        marginTop += timesRomanFont.sizeAtHeight(16)
      })
    }

    const pdfBytes = await pdfDoc.save()
    const pdfBase64 = uint8ToBase64(pdfBytes)
    return pdfBase64
  }

  catch (e) {
    console.log('error', e)
    if (e === "The input is not a PNG file!")
      errorMessage = "Fichier corrompu ou incompatible."
    throw new Error(errorMessage || "Erreur lors de la conversion de l'image en pdf.")
  }
}


//#PDF LIB
export const chunk = (str, n) => {
  var ret = [];
  var i;
  var len;

  for (i = 0, len = str.length; i < len; i += n) {
    ret.push(str.substr(i, n))
  }

  return ret
}

const lineBreaker2 = (dataArray, font, size, linesWidths, maxNumberOflLines) => {

  let dataArrayFormated = []
  const line_Height = font.heightAtSize(size)

  for (var line of dataArray) {
    const lineWidth = font.widthOfTextAtSize(line, size)
    let i = 0

    if (lineWidth > linesWidths[i]) {

      var lineLength = line.length
      var lastCharIndex = linesWidths[i] * lineLength / lineWidth

      //Avoid spliting words
      while (line.charAt(lastCharIndex) !== ' ') {
        lastCharIndex = lastCharIndex - 1
      }

      var slicedLine = line.slice(0, lastCharIndex)
      dataArrayFormated.push(slicedLine)

      var restOfLine = line.slice(lastCharIndex)
      var restOfLineWidth = font.widthOfTextAtSize(restOfLine, size)

      i += 1
      while (restOfLineWidth > linesWidths[i]) {
        if (i <= maxNumberOflLines) {
          lineLength = restOfLine.length
          lastCharIndex = linesWidths[i] * lineLength / restOfLineWidth

          //Avoid spliting words
          while (restOfLine.charAt(lastCharIndex) !== ' ') {
            lastCharIndex = lastCharIndex - 1
          }

          slicedLine = restOfLine.slice(0, lastCharIndex)
          dataArrayFormated.push(slicedLine)

          restOfLine = restOfLine.slice(lastCharIndex)
          restOfLineWidth = font.widthOfTextAtSize(restOfLine, size)
          i += 1
        }
      }

      dataArrayFormated.push(restOfLine)
    }

    else dataArrayFormated.push(line)
  }

  return dataArrayFormated
}

async function mergePDFDocuments(documents) {

  const mergedPdf = await PDFDocument.create();

  for (let document of documents) {
    document = await PDFDocument.load(document);

    const copiedPages = await mergedPdf.copyPages(document, document.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  return mergedPdf
}

export const generatePdfForm = async (formInputs, pdfType, params) => {
  try {
    if (pdfType === "PvReception") {
      var originalPdfBase64 = pvReceptionBase64
      var { model: formPages, globalConfig } = pvReceptionModel(params)
    }
    else if (pdfType === "Simulations") {
      var originalPdfBase64 = ficheEEBBase64
      var formPages = ficheEEBModel
    }
    else if (pdfType === "MandatsMPR") {
      var originalPdfBase64 = mandatMPRBase64
      var formPages = mandatMPRModel
    }
    else if (pdfType === "MandatsSynergys") {
      var originalPdfBase64 = mandatSynergysBase64
      var { model: formPages, globalConfig } = mandatSynergysModel()
    }
    if (pdfType === "VisitesTech") {
      var { model: formPages, checklistBase64 } = params
      var pdfDoc = await mergePDFDocuments(checklistBase64)
    }
    else var pdfDoc = await PDFDocument.load(originalPdfBase64)


    const pages = pdfDoc.getPages()

    //Theme config
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman)
    const colors = {
      primary: rgb(0.576, 0.768, 0.486),
      black: rgb(0, 0, 0),
      white: rgb(1, 1, 1),
      gray: rgb(0.1333, 0.1333, 0.1333)
    }
    const caption = 10

    //1. ADD INPUTS
    for (const formPage of formPages) {
      for (const field of formPage.fields) {
        const { id, isMultiOptions, isStepMultiOptions, pdfConfig, type, splitArobase } = field

        const isNotEmptyArray = isMultiOptions && formInputs[id].length > 0
        const isNotEmptyString = formInputs[id]
        const isNotEmpty = isNotEmptyArray || isNotEmptyString
        const isAutoGen = field.type === "autogen"
        const isHandleField = isNotEmpty || isAutoGen

        if (isHandleField) {

          let positions = []
          let text = ""

          console.log("id", field.id)

          if (pdfConfig && pdfConfig.skip)
            console.log('Skip drawing pdf...')

          else switch (type) {

            case "textInput":

              if (pdfConfig) {
                text = formInputs[id]
                let dataTextArray = [text]

                //Specific cases (spaces, email spli)
                if (typeof (text) !== "undefined") {
                  if (pdfConfig.spaces) {
                    const { afterEach, str } = pdfConfig.spaces
                    text = chunk(text, afterEach).join(str)
                  }

                  if (id === "email" && splitArobase) {
                    text = text.split('@')
                    text = text.join('                                                               ')
                  }
                }
                else text = ""

                //Break line if longer than field space
                if (pdfConfig.breakLines) {
                  const lineWidth = timesRomanFont.widthOfTextAtSize(text, caption)
                  dataTextArray = lineBreaker2(dataTextArray, timesRomanFont, caption, pdfConfig.breakLines.linesWidths, 4)
                }

                dataTextArray.forEach((text, key) => {
                  const isDrawText = !pdfConfig.breakLines || (pdfConfig.breakLines && key < pdfConfig.breakLines.linesStarts.length)
                  if (isDrawText) {
                    const dx = pdfConfig.breakLines ? pdfConfig.breakLines.linesStarts[key].dx : pdfConfig.dx
                    const dy = pdfConfig.breakLines ? pdfConfig.breakLines.linesStarts[key].dy : pdfConfig.dy

                    pages[pdfConfig.pageIndex].drawText(text,
                      {
                        x: pages[pdfConfig.pageIndex].getWidth() + dx,
                        y: pages[pdfConfig.pageIndex].getHeight() + dy,
                        size: caption,
                        font: timesRomanFont,
                        color: colors.black,
                      }
                    )
                  }
                })
              }

              break;

            case "options":

              if (isMultiOptions || isStepMultiOptions) {
                for (const item of field.items) {
                  if (!item.skip && formInputs[field.id].includes(item.value)) {
                    const { dx, dy } = item.pdfConfig
                    positions.push({ dx, dy })
                  }
                }
              }

              else {
                const index = field.items.findIndex(item => item.value === formInputs[field.id]) //Index of the selected option
                if (!field.items[index].pdfConfig.skip) {
                  const { dx, dy } = field.items[index].pdfConfig
                  positions.push({ dx, dy })
                }
              }

              for (const position of positions) {
                pages[field.items[0].pdfConfig.pageIndex].drawSquare({
                  x: pages[field.items[0].pdfConfig.pageIndex].getWidth() + position.dx,
                  y: pages[field.items[0].pdfConfig.pageIndex].getHeight() + position.dy,
                  size: field.items[0].pdfConfig.squareSize || 7,
                  color: rgb(0, 0, 0),
                })
              }
              break;

            case "picker":

              if (field.pdfConfig) {
                const { dx, dy } = field.pdfConfig
                var { pageIndex } = field.pdfConfig

                pages[pageIndex].drawText(formInputs[field.id],
                  {
                    x: pages[pageIndex].getWidth() + dx,
                    y: pages[pageIndex].getHeight() + dy,
                    size: caption,
                    font: timesRomanFont,
                    color: colors.black,
                  })
              }

              else { //Picker = Options
                const index = field.items.findIndex(item => item.value === formInputs[field.id]) //Index of the selected option

                if (!field.items[index].pdfConfig.skip) {
                  const { dx, dy } = field.items[index].pdfConfig
                  var pageIndex = field.items[index].pdfConfig.pageIndex

                  pages[pageIndex].drawSquare({
                    x: pages[pageIndex].getWidth() + dx,
                    y: pages[pageIndex].getHeight() + dy,
                    size: 7,
                    color: rgb(0, 0, 0),
                  })
                }
              }

              break;

            case "number":
              pages[field.pdfConfig.pageIndex].drawText(formInputs[field.id],
                {
                  x: pages[field.pdfConfig.pageIndex].getWidth() + field.pdfConfig.dx,
                  y: pages[field.pdfConfig.pageIndex].getHeight() + field.pdfConfig.dy,
                  size: caption,
                  font: timesRomanFont,
                  color: colors.black,
                })
              break;

            case "autogen":

              const condtionUnsatisfied = field.isConditional && !field.condition.values.includes(formInputs[field.condition.with])
              if (condtionUnsatisfied) {
                console.log("Skip drawing text..", field.id)
              }

              else {

                if (field.value) {
                  console.log("field value...", field.value)
                  text = field.value
                  if (field.pdfConfig.spaces) {
                    const { afterEach, str } = field.pdfConfig.spaces
                    text = chunk(text, afterEach).join(str)
                  }

                  console.log("text to draw...", text)
                  pages[pdfConfig.pageIndex].drawText(text,
                    {
                      x: pages[pdfConfig.pageIndex].getWidth() + pdfConfig.dx,
                      y: pages[pdfConfig.pageIndex].getHeight() + pdfConfig.dy,
                      size: caption,
                      font: timesRomanFont,
                      color: colors.black,
                    }
                  )
                }

                else if (field.items) {
                  const { dx, dy } = field.items[0].pdfConfig
                  pages[field.items[0].pdfConfig.pageIndex].drawSquare({
                    x: pages[field.items[0].pdfConfig.pageIndex].getWidth() + dx,
                    y: pages[field.items[0].pdfConfig.pageIndex].getHeight() + dy,
                    size: field.items[0].pdfConfig.squareSize || 7,
                    color: rgb(0, 0, 0),
                  })
                }
              }
              break;

            case "address":
              text = formInputs[field.id].description
              pages[field.pdfConfig.pageIndex].drawText(text,
                {
                  x: pages[field.pdfConfig.pageIndex].getWidth() + field.pdfConfig.dx,
                  y: pages[field.pdfConfig.pageIndex].getHeight() + field.pdfConfig.dy,
                  size: caption,
                  font: timesRomanFont,
                  color: colors.black,
                }
              )
              break;

            default: break;
          }

        }
      }
    }

    //2. ADD PICTURES
    for (const formPage of formPages) {
      for (const field of formPage.fields) {
        if (field.type === "image" && formInputs[field.id]) {
          //Find Image notice (Remarques)
          const imageNoticeField = formPage.fields.filter((field) => field.isImageNotice)[0]
          const imageNotice = formInputs[imageNoticeField.id]

          const mergedPdf = await PDFDocument.create()
          const imagePdfBase64 = await convertImageToPdf(formInputs[field.id], field.title, imageNotice)
          const imagePdf = await PDFDocument.load(imagePdfBase64)

          const copiedPagesA = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices())
          const copiedPagesB = await mergedPdf.copyPages(imagePdf, imagePdf.getPageIndices())
          copiedPagesA.forEach((p) => mergedPdf.addPage(p))
          copiedPagesB.forEach((p) => mergedPdf.addPage(p))

          pdfDoc = mergedPdf
        }
      }
    }

    if (globalConfig) {
      const { pageDuplication, rectangles } = globalConfig
      //Apply page duplication
      if (pageDuplication) {
        const { pageIndexSource, pageIndexTarget } = pageDuplication
        const copiedPage = await pdfDoc.copyPages(pdfDoc, [pageIndexSource])
        pdfDoc.insertPage(pageIndexTarget, copiedPage[0])
      }

      if (rectangles) {
        for (const rect of rectangles) {
          pages[rect.pageIndex].drawRectangle(rect.form)
        }
      }
    }

    const pdfBytes = await pdfDoc.save()
    const pdfBase64 = uint8ToBase64(pdfBytes)
    return pdfBase64
  }

  catch (e) {
    console.log(e)
    throw new Error(e)
  }
}

//##IMAGE PICKER
export const pickImage = (previousAttachments = [], isCamera = false, addPathSuffix = true) => {
  const options = {
    mediaType: 'photo', // Pour des images uniquement
    maxWidth: 1920,     // Largeur maximale
    maxHeight: 1080,    // Hauteur maximale
    quality: 1,         // Qualité maximale
    saveToPhotos: true, // Sauvegarder les photos prises avec la caméra (optionnel)
  };

  const imagePickerHandler = (response, resolve, reject) => {
    console.log("Réponse de l'image picker:", response);

    if (response.didCancel) {
      return resolve(previousAttachments); // L'utilisateur a annulé la sélection
    }

    if (response.errorCode) {
      return reject(new Error(response.errorMessage || "Erreur lors de la sélection du fichier. Veuillez réessayer."));
    }

    if (response.assets && response.assets.length > 0) {
      const selectedAsset = response.assets[0];
      const image = {
        type: selectedAsset.type,
        name: selectedAsset.fileName || `Image_${moment().format("DD-MM-YYYY_HH-mm")}`,
        size: selectedAsset.fileSize,
        local: true,
        progress: 0,
      };

      // Gestion des chemins pour Android et iOS
      if (Platform.OS === 'android') {
        const pathSuffix = addPathSuffix ? 'file://' : '';
        image.path = pathSuffix + selectedAsset.uri;
      } else {
        image.path = selectedAsset.uri;
      }

      const attachments = [...previousAttachments, image];
      return resolve(attachments);
    }

    return reject(new Error("Une erreur inconnue s'est produite."));
  };

  return new Promise((resolve, reject) => {
    if (isCamera) {
      // Utilisation de l'appareil photo
      launchCamera(options, (response) => imagePickerHandler(response, resolve, reject));
    } else {
      // Utilisation de la bibliothèque
      launchImageLibrary(options, (response) => imagePickerHandler(response, resolve, reject));
    }
  });
};

//##FILE PICKER
export const pickDocs = async (attachments, type = [DocumentPicker.types.allFiles]) => {
  try {
    // Sélection multiple de fichiers
    const results = await DocumentPicker.pick({
      allowMultiSelection: true, // Permet de sélectionner plusieurs fichiers
      type,
    });

    // Parcourir les résultats
    for (const res of results) {
      const destPath = await setDestPath(res.name); // Chemin de destination personnalisé
      
      // Déplacer le fichier vers le chemin de destination
      await RNFS.moveFile(decodeURI(res.uri), destPath);

      // Créer un objet pour chaque pièce jointe
      const attachment = {
        path: destPath,
        type: res.type || res.mimeType, // Adapter selon les métadonnées
        name: res.name,
        size: res.size,
        progress: 0,
      };

      // Ajouter l'objet à la liste des pièces jointes
      attachments.push(attachment);
    }

    return attachments; // Retourne les pièces jointes mises à jour
  } catch (error) {
    console.error('Erreur DocumentPicker:', error);
    if (DocumentPicker.isCancel(error)) {
      // Annulation de l'utilisateur
      return attachments;
    } else {
      // Autres erreurs
      throw new Error('Erreur lors de la sélection des fichiers. Veuillez réessayer.');
    }
  }
};

export const pickDoc = async (generateName = false, type = [DocumentPicker.types.allFiles]) => {
  try {
    const results = await DocumentPicker.pick({ type });
    
    // Pour prendre en charge les versions qui retournent un tableau
    const res = Array.isArray(results) ? results[0] : results;

    // Vérification si l'objet `res` est valide
    if (!res || !res.uri) {
      throw new Error('Fichier non valide ou sélection annulée.');
    }

    // Génération du nom de fichier
    const attachmentName = generateName 
      ? `Scan-${moment().format('DD-MM-YYYY-HHmmss')}.pdf` 
      : res.name;

    // Vérification du chemin URI
    if (res.uri.startsWith('content://')) {
      const destPath = await setDestPath(attachmentName);

      // Déplacement du fichier
      await RNFS.moveFile(decodeURI(res.uri), destPath);

      // Retour de l'objet attaché
      return {
        path: destPath,
        type: res.type,
        name: attachmentName,
        size: res.size,
        progress: 0,
        downloadURL: '',
      };
    } else {
      throw new Error('Chemin de fichier non pris en charge.');
    }
  } catch (error) {
    if (DocumentPicker.isCancel(error)) {
      console.log('Sélection annulée par l\'utilisateur.');
      return null; // Annulation
    }

    console.error('Erreur lors de la sélection du fichier :', error);
    throw new Error('Erreur lors de la sélection du fichier. Veuillez réessayer.');
  }
};

import { highRoles } from './constants'

import { mandatMPRBase64 } from '../assets/files/mandatMPRBase64';
import { ficheEEBBase64 } from '../assets/files/ficheEEBBase64';
import { pvReceptionBase64 } from '../assets/files/pvReceptionBase64';
import { mandatSynergysBase64 } from '../assets/files/mandatSynergysBase64';
import { lineBreaker } from '../screens/Documents/PdfGeneration';


export const docType_LabelValueMap = (value) => {
  if (!value) return ""
  const label = allDocTypes.filter((type) => type.value === value)[0].label
  return label
}


let publicTaskTypes = [
  { label: 'Normale', value: 'Normale', natures: ['com', 'tech'] }, //#static
  { label: 'Panne', value: 'Panne', natures: ['com', 'tech'] }, //#static
  { label: 'Entretien', value: 'Entretien', natures: ['com', 'tech'] }, //#static
]

export const privateTaskTypes = [
  { label: 'Visite technique préalable', value: 'Visite technique préalable', natures: ['com'] }, //#dynamic
  { label: 'Visite technique', value: 'Visite technique', natures: ['tech'] }, //#dynamic
  { label: 'Installation', value: 'Installation', natures: ['tech'] }, //#dynamic
  { label: 'Rattrapage', value: 'Rattrapage', natures: ['tech'] }, //#dynamic
  { label: 'Présentation étude', value: 'Présentation étude', natures: ['com'] },
]

let alltaskTypes = [
  { label: 'Normale', value: 'Normale', natures: ['com', 'tech'] }, //#static
  { label: 'Visite technique préalable', value: 'Visite technique préalable', natures: ['com'] }, //#dynamic
  { label: 'Visite technique', value: 'Visite technique', natures: ['tech'] }, //#dynamic 
  { label: 'Installation', value: 'Installation', natures: ['tech'] }, //#dynamic
  { label: 'Rattrapage', value: 'Rattrapage', natures: ['tech'] }, //#dynamic
  { label: 'Panne', value: 'Panne', natures: ['tech'] }, //#static
  { label: 'Entretien', value: 'Entretien', natures: ['tech'] }, //#static
  { label: 'Présentation étude', value: 'Présentation étude', natures: ['com'] }, //restriction: user can not create rdn manually (only during the process and only DC can posptpone it during the process)
]

export const taskType_LabelValueMap = (value) => alltaskTypes.filter((type) => type.value === value)[0].label


export const getTaskNatures = (taskLabel) => {
  const task = alltaskTypes.find((task) => task.label === taskLabel)
  const taskNatures = task.natures
  return taskNatures
}

//Documents
export const setPickerDocTypes = (currentRole, dynamicType, documentType) => {
  return setPickerTypes(currentRole, dynamicType, documentType, publicDocTypes, allDocTypes)
}

//Tasks
export const setPickerTaskTypes = (currentRole, dynamicType, documentType) => {
  return setPickerTypes(currentRole, dynamicType, documentType, publicTaskTypes, alltaskTypes)
}

const setPickerTypes = (currentRole, dynamicType, documentType, publicTypes, allTypes) => {
  let types = publicTypes

  if (dynamicType && documentType) {
    types.push(documentType)
  }

  //Normal case
  else {
    if (highRoles.includes(currentRole))
      types = allTypes
  }

  return types
}

//##FILTERS
export const setFilter = (main, field, value) => {
  const update = {}
  update[field] = value
  main.setState(update)
}

export const toggleFilter = (main) => {
  main.setState({ filterOpened: !main.state.filterOpened })
}

export const handleFilter = (inputList, outputList, fields, searchInput, KEYS_TO_FILTERS) => {
  outputList = inputList
  for (const field of fields) {
    if (field.value !== "") {
      outputList = outputList.filter(createFilter(field.value, [field.label]))
    }
  }
  outputList = outputList.filter(createFilter(searchInput, KEYS_TO_FILTERS))
  return outputList
}

export const handleFilterAgenda = (inputList, outputList, fields, KEYS_TO_FILTERS) => {
  outputList = JSON.parse(JSON.stringify(inputList))

  for (let key in outputList) {
    let items = outputList[key]

    for (const field of fields) {
      items = items.filter(createFilter(field.value, field.label))
    }

    outputList[key] = items
  }

  return outputList
}

export const handleFilterTasks = (inputList, fields, KEYS_TO_FILTERS) => {

  let outputList = []

  inputList.forEach(taskItems => {

    for (const field of fields) {
      taskItems = taskItems.filter(createFilter(field.value, field.label))
    }

    if (taskItems.length > 0)
      outputList.push(taskItems)

  })

  return outputList
}


//## Refresh inputs
export function refreshClient(user) {
  const client = refreshUser(user)
  const address = user.address
  this.setState({ client, address })
}

export function refreshComContact(user) {
  const comContact = refreshUser(user)
  this.setState({ comContact })
}

export function refreshTechContact(user) {
  const techContact = refreshUser(user)
  this.setState({ techContact })
}

export function refreshAssignedTo(user) {
  const assignedTo = refreshUser(user)
  this.setState({ assignedTo, assignedToError: "" })
}


export const refreshUser = (user) => {
  const isPro = user.isPro || false
  const id = user.id || ""
  const denom = user.denom || ""
  const nom = user.nom || ""
  const prenom = user.prenom || ""
  const role = user.role || ""
  const email = user.email || ""
  const phone = user.phone || ""

  const fullName = isPro ? nom : `${prenom} ${nom}`
  const userObject = { id, fullName, email, role, phone }
  return userObject
}


export function refreshAddress(address) {
  this.setState({ address })
}

export function setAddress(description) {
  const address = {
    description,
    marker: { latitude: '', longitude: '' },
    place_id: ''
  }
  this.setState({ address })
}

export function refreshProject(projectObject, setState = true) {
  const { id, name, client, step, address, comContact, techContact, intervenant, workTypes } = projectObject
  const project = { id, name, client, step, address, comContact, techContact, intervenant, workTypes }
  if (setState) this.setState({ project, address, client, projectError: '', addressError: '' })
  return project
}
