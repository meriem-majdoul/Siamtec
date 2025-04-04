import React, { Component } from 'react';
import { StyleSheet, Dimensions, View } from 'react-native';
import {
  PDFDocument,
  PageSizes,
  StandardFonts,
  rgb,
  values,
  PDFTextField,
  degrees,
  grayscale,
} from 'pdf-lib';
//import Pdf from 'react-native-pdf';
import RNFS from 'react-native-fs';
import RNFetchBlob from 'rn-fetch-blob';

import { db } from '../../firebase';
import Appbar from '../../components/Appbar';
import Button from '../../components/Button';
import LoadDialog from '../../components/LoadDialog';

import moment, { months } from 'moment';
import 'moment/locale/fr';
moment.locale('fr');

// import { fetchAsset, writePdf } from './assets'
import { logoBase64 } from '../../assets/logoBase64';
import { termsBase64 } from '../../assets/termsAndConditionsBase64';
import {
  uint8ToBase64,
  base64ToArrayBuffer,
  articles_fr,
  setToast,
  saveFile,
  displayError,
  docType_LabelValueMap,
} from '../../core/utils';
import { sizes } from '../../core/theme';
import * as theme from '../../core/theme';
import { errorMessages } from '../../core/constants';
import { Alert } from 'react-native';
import { groupBy } from '../Process/algorithm/process';
import { formulaireRetraction } from '../../assets/files/formulaireRetraction';

//urls
const urlForm =
  'https://firebasestorage.googleapis.com/v0/b/projectmanagement-b9677.appspot.com/o/Templates%2Fdod_character.pdf?alt=media&token=b2c00766-4377-4d31-ad38-fad84eac5376';
const urlMario =
  'https://firebasestorage.googleapis.com/v0/b/projectmanagement-b9677.appspot.com/o/Templates%2FAssets%2Fsmall_mario.png?alt=media&token=505b1663-13c5-49b7-91ec-2a4afa0f1bb9';
const urlEmblem =
  'https://firebasestorage.googleapis.com/v0/b/projectmanagement-b9677.appspot.com/o/Templates%2FAssets%2Fmario_emblem.png?alt=media&token=28813b1e-06c5-487a-bedb-489a0c3f6ed1';

//local paths
const formPath = `${RNFetchBlob.fs.dirs.DownloadDir}/Synergys/Documents/Messagerie/dod_character`;
const marioImagePath = `${RNFetchBlob.fs.dirs.DownloadDir}/Synergys/Documents/Messagerie/small_mario`;
const emblemImagePath = `${RNFetchBlob.fs.dirs.DownloadDir}/Synergys/Documents/Messagerie/mario_emblem`;

const { base, font, radius, padding, h1, h2, h3, header, body } = sizes;
const caption = 10;
const lineHeight = 12;

export const lineBreaker = (data, font, size, maxWidth) => {
  const dataArray = [data];

  let dataArrayFormated = [];
  const line_Height = font.heightAtSize(size);

  for (var line of dataArray) {
    const lineWidth = font.widthOfTextAtSize(line, size);

    if (lineWidth > maxWidth) {
      var lineLength = line.length;
      var lastCharIndex = (maxWidth * lineLength) / lineWidth;

      //Avoid spliting words
      while (line.charAt(lastCharIndex) !== ' ') {
        lastCharIndex = lastCharIndex - 1;
      }

      var slicedLine = line.slice(0, lastCharIndex);
      dataArrayFormated.push(slicedLine);

      var restOfLine = line.slice(lastCharIndex);
      var restOfLineWidth = font.widthOfTextAtSize(restOfLine, size);

      while (restOfLineWidth > maxWidth) {
        lineLength = restOfLine.length;
        lastCharIndex = (maxWidth * lineLength) / restOfLineWidth;

        //Avoid spliting words
        while (restOfLine.charAt(lastCharIndex) !== ' ') {
          lastCharIndex = lastCharIndex - 1;
        }

        slicedLine = restOfLine.slice(0, lastCharIndex);
        dataArrayFormated.push(slicedLine);

        restOfLine = restOfLine.slice(lastCharIndex);
        restOfLineWidth = font.widthOfTextAtSize(restOfLine, size);
      }

      dataArrayFormated.push(restOfLine);
    } else dataArrayFormated.push(line);
  }

  return dataArrayFormated;
};

const formatPrice = (price) => {
  price = Number(price).toFixed(2).toString();
  return price;
};

export default class PdfGeneration extends Component {
  constructor(props) {
    super(props);
    this.savePdfBase64 = this.savePdfBase64.bind(this);
    const { route } = this.props;

    // Accès aux paramètres via route?.params
    this.project = route?.params?.project ?? '';
    this.order = route?.params?.order ?? '';
    this.docType = route?.params?.docType ?? ''; // Offre précontractuelle ou Facture (Proposal or Bill)
    
    this.isQuote = this.docType === 'Devis' || this.docType === 'Offre précontractuelle';
    this.DocumentId = route?.params?.DocumentId ?? '';
    this.isConversion = route?.params?.isConversion ?? false; // Conversion from Offre précontractuelle to Facture
    this.popCount = route?.params?.popCount ?? 1;//Conversion from Offre précontractuelle  to Facture

    const masculins = ['Devis', 'Bon de commande', 'Dossier CEE'];
    this.titleText = `Génération ${articles_fr(
      "d'un",
      masculins,
      this.docType,
    )} ${this.docType}`;

    this.state = {
      source: '',
      pdfBase64: '',
      loading: true,
    };
  }

  componentDidMount() {
    const purchaseDocs = ['Devis', "Offre précontractuelle", 'Facture'];
    if (purchaseDocs.includes(this.docType)) {
      this.generatePurchaseDoc();
    }
  }

  sortOrderLines(orderLines) {
    const arrGrouped = groupBy(orderLines, 'category');
    let resultArray = [];
    for (const key in arrGrouped) {
      const array = arrGrouped[key];
      array.sort((a, b) => (a.priority > b.priority ? 1 : -1));
      resultArray = [...resultArray, ...array];
    }
    return resultArray;
  }

  async generatePurchaseDoc() {
    try {
      // Create a new PDFDocument
      const pdfDoc = await PDFDocument.create();

      // Theme config
      const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
      const timesRomanBoldFont = await pdfDoc.embedFont(
        StandardFonts.TimesRomanBold,
      );
      const colors = {
        primary: rgb(0.576, 0.768, 0.486),
        black: rgb(0, 0, 0),
        white: rgb(1, 1, 1),
        gray: rgb(0.1333, 0.1333, 0.1333),
      };

      // Add a blank page to the document
      let pages = [];
      let pageIndex = 0;
      pages[pageIndex] = pdfDoc.addPage(PageSizes.A4);

      // Get the width and height of the page
      const { width, height } = pages[pageIndex].getSize();

      // Margin & Padding initialization
      const marginLeft = 30;
      const marginRight = 30;
      var marginTop_R = 35; //Right column
      var marginTop_L = 20; //Left column
      const padding = 10;
      const cste = 10;
      const headerRigth_x_start = width * 0.5;

      //Dynamic data
      const createdAt = moment().format('DD/MM/YYYY');
      const {
        subTotal,
        subTotalProducts,
        taxes,
        primeCEE,
        primeRenov,
        aidRegion,
        discount,
        editedBy,
      } = this.order;
      const { client } = this.project;
      const workTypes = this.project.workTypes || [];
      const responsable = await db
        .collection('Users')
        .doc(editedBy.id)
        .get()
        .then((doc) => {
          return doc.data();
        });
      const orderLines = this.sortOrderLines(this.order.orderLines);
      const taxeValues = taxes.map((taxeItem) => taxeItem.value);
      const reducer = (a, b) => Number(a) + Number(b);
      const totalTaxe = taxeValues.reduce(reducer);
      const discountValue = (subTotal * discount) / 100;
      const totalNetHT = subTotal - discountValue;
      const totalTTC = totalNetHT + totalTaxe;
      const totalNet = totalTTC - primeCEE - primeRenov - aidRegion;

      //1. HeaderLeft: Logo
      const logoImage = await pdfDoc.embedPng(logoBase64);
      const logoDims = logoImage.scale(0.33);

      marginTop_L += logoDims.height;

      pages[pageIndex].drawImage(logoImage, {
        x: marginLeft,
        y: height - marginTop_L,
        width: logoDims.width,
        height: logoDims.height,
      });

      marginTop_L += cste * 1.5;

      //#static
      //2. HeaderLeft: Synergys contact
      const synergysContact =
        `SYNERGYS\n` +
        `270 B RUE DE LA COMBE DU MEUNIER\n` +
        `ZAC DU CASTELLAS\n` +
        `11100 MONTREDON DES CORBIERES\n` +
        `Email : contact@groupe-synergys.fr\n` +
        `Tél : (33) 09 70 15 57 16\n` +
        `RGE : QualiPAC/58669 - QualiPV/58669\n` +
        `QualiSOL : QS/58669 - QualiBOIS : QB/58669 -\n` +
        `Ventillation + : VPLUS/58669`;

      pages[pageIndex].drawText(synergysContact, {
        x: marginLeft,
        y: height - marginTop_L,
        size: caption,
        font: timesRomanFont,
        lineHeight,
        color: colors.black,
      });

      //#dynamic #LL
      //3. HeaderRight: Pdf Title
      const title = `${this.docType} n° ${this.DocumentId}`;
      const titleHeight = timesRomanBoldFont.heightAtSize(body);

      pages[pageIndex].drawText(title, {
        x: headerRigth_x_start,
        y: height - marginTop_R,
        size: body,
        font: timesRomanBoldFont,
        lineHeight,
        color: colors.black,
      });

      marginTop_R += titleHeight + cste;

      //#dynamic #VL
      //4. HeaderRight: Client contact
      const clientContactArray = [
        'Chantier : ' + client.fullName,
        this.project.address.description,
        'Mobile : ' + client.phone,
        'Email : ' + client.email,
        'Travaux : ' + workTypes.join(', '),
      ];

      //Linebreaker
      var maxWidth = width * 0.5 - marginRight;

      for (const clientContactLine of clientContactArray) {
        var textArrayFormated = lineBreaker(
          clientContactLine,
          timesRomanFont,
          caption,
          maxWidth,
        );

        textArrayFormated.forEach((text) => {
          pages[pageIndex].drawText(text, {
            x: width * 0.5,
            y: height - marginTop_R,
            size: caption,
            font: timesRomanFont,
            lineHeight,
            color: colors.black,
          });

          marginTop_R += timesRomanFont.sizeAtHeight(caption);
        });

        marginTop_R += cste / 2;
      }

      //5. Responsable contact
      const responsableContact =
        `Votre chargé d'affaires : ${responsable.fullName}\n` + //#task: trim Name if longer than x characters
        `Tél.: ${responsable.phone}\n` +
        `Email : ${responsable.email}\n`;

      pages[pageIndex].drawText(responsableContact, {
        x: headerRigth_x_start + padding,
        y: height - marginTop_R - padding,
        size: caption,
        font: timesRomanFont,
        lineHeight,
        color: colors.black,
      });

      const synergysContactBoxHeight = 55;

      marginTop_R += synergysContactBoxHeight - cste;

      pages[pageIndex].drawRectangle({
        x: headerRigth_x_start,
        y: height - marginTop_R,
        width: width * 0.5 - marginRight,
        height: synergysContactBoxHeight,
        color: colors.gray,
        opacity: 0.1,
      });

      //6. Client summary
      //6.1 Client name
      marginTop_R += cste * 3;
      let marginTop_ClientSummaryFrame = marginTop_R - padding;

      const clientName = client.fullName;
      const clientNameHeight = timesRomanBoldFont.heightAtSize(body);

      pages[pageIndex].drawText(clientName, {
        x: headerRigth_x_start + padding,
        y: height - marginTop_R - padding,
        size: caption,
        font: timesRomanBoldFont,
        lineHeight,
        color: colors.black,
      });

      marginTop_R += clientNameHeight + cste;

      //6.2 Client address
      const clientAddressArray = [this.project.address.description];

      maxWidth = width * 0.5 - marginRight - padding * 2; //paddingLeft & paddingRigth
      let clientSummaryBoxHeight = padding * 2 + clientNameHeight;

      for (const clientAddressLine of clientAddressArray) {
        textArrayFormated = lineBreaker(
          clientAddressLine,
          timesRomanFont,
          caption,
          maxWidth,
        );

        textArrayFormated.forEach((text) => {
          pages[pageIndex].drawText(text, {
            x: width * 0.5 + padding,
            y: height - marginTop_R,
            size: caption,
            font: timesRomanFont,
            lineHeight,
            color: colors.black,
          });

          marginTop_R += timesRomanFont.sizeAtHeight(caption);
          clientSummaryBoxHeight += timesRomanFont.sizeAtHeight(caption);
        });

        marginTop_R += cste;
      }

      marginTop_ClientSummaryFrame += clientSummaryBoxHeight;

      //6.3 Frame
      pages[pageIndex].drawRectangle({
        x: headerRigth_x_start,
        y: height - marginTop_ClientSummaryFrame,
        width: width * 0.5 - marginRight,
        height: clientSummaryBoxHeight,
        borderColor: colors.gray,
        borderWidth: 1,
        opacity: 0.1,
      });

      marginTop_R += clientSummaryBoxHeight;

      //7. Proposal
      //7.1 Table
      let marginTop = Math.max(marginTop_R, marginTop_L);
      const topBarHeight = 35;

      pages[pageIndex].drawRectangle({
        x: marginLeft,
        y: height - marginTop,
        width: width - marginLeft * 2,
        height: topBarHeight,
        color: colors.primary,
        opacity: 0.5,
        borderOpacity: 0.75,
      });

      marginTop -= topBarHeight;

      const firstVerticalLine_x = marginLeft;
      const secondVerticalLine_x = width * 0.1;
      const thirdVerticalLine_x = width * 0.6;
      const fourthVerticalLine_x = width * 0.65;
      const fifthVerticalLine_x = width * 0.7;
      const sixtVerticalLine_x = width * 0.8;
      const seventhVerticalLine_x = width - marginRight;
      const line_x_positions = [
        firstVerticalLine_x,
        secondVerticalLine_x,
        thirdVerticalLine_x,
        fourthVerticalLine_x,
        fifthVerticalLine_x,
        sixtVerticalLine_x,
        seventhVerticalLine_x,
      ];

      const firstHorizontalLine_y = height - marginTop;
      const secondHorizontalLine_y = height - (marginTop + topBarHeight);
      const line_y_positions = [firstHorizontalLine_y, secondHorizontalLine_y];

      for (const y of line_y_positions) {
        //remove 3rd line (belongs to footer)
        pages[pageIndex].drawLine({
          start: { x: marginLeft, y },
          end: { x: width - marginRight, y },
          thickness: 1,
          color: colors.gray,
        });
      }

      //7.2 Products table titles
      //marginTop += cste
      const marginLeftCalculator = (line_x_positions, i, ratio = 0.33) => {
        return (
          line_x_positions[i] +
          (line_x_positions[i + 1] - line_x_positions[i]) * ratio
        );
      };

      const titles = [
        { label: 'N°', marginLeft: marginLeftCalculator(line_x_positions, 0) },
        {
          label: 'Désignation',
          marginLeft: marginLeftCalculator(line_x_positions, 1),
        },
        { label: 'Qté', marginLeft: marginLeftCalculator(line_x_positions, 2) },
        { label: 'U', marginLeft: marginLeftCalculator(line_x_positions, 3) },
        { label: 'PUHT', marginLeft: marginLeftCalculator(line_x_positions, 4) },
        {
          label: 'Total H.T',
          marginLeft: marginLeftCalculator(line_x_positions, 5),
        },
      ];

      titles.forEach((title) => {
        pages[pageIndex].drawText(title.label, {
          x: title.marginLeft,
          y: height - marginTop - cste * 2,
          size: caption,
          font: timesRomanBoldFont,
          lineHeight,
          color: colors.white,
        });
      });

      //7.3 Products Details (list)
      let startVerticalLines_x = marginTop;
      marginTop += topBarHeight + cste * 2;
      maxWidth = width * 0.5 - padding;

      let catNum = 0;
      let subCat = 1;
      let category = null;

      for (let orderLine of orderLines) {
        //Add new page
        if (marginTop >= height * 0.9) {
          //Footer = height * 0.1
          //draw borderlines on current page
          for (const x of line_x_positions) {
            pages[pageIndex].drawLine({
              start: { x, y: height - startVerticalLines_x },
              end: { x, y: height * 0.11 },
              thickness: 1,
              color: colors.gray,
            });
          }

          //add & increment page + init marginTop
          pageIndex = pageIndex + 1;
          pages[pageIndex] = pdfDoc.addPage(PageSizes.A4);
          marginTop = 35;
          startVerticalLines_x = 25;
        }

        //Draw category (number and name)
        if (category !== orderLine.product.category) {
          catNum += 1;
          subCat = 1;

          //Cat Num
          pages[pageIndex].drawText(catNum.toString(), {
            x: firstVerticalLine_x + padding * 0.8,
            y: height - marginTop,
            size: caption,
            font: timesRomanBoldFont,
            lineHeight,
            color: colors.black,
          });

          //Cat Name
          category = orderLine.product.category;
          textArrayFormated = lineBreaker(
            category,
            timesRomanBoldFont,
            caption,
            maxWidth,
          ); //to upper case
          textArrayFormated.forEach((text) => {
            pages[pageIndex].drawText(text, {
              x: secondVerticalLine_x + padding / 2.5,
              y: height - marginTop,
              size: caption,
              font: timesRomanBoldFont,
              lineHeight,
              color: colors.black,
            });

            marginTop = marginTop + timesRomanFont.sizeAtHeight(caption);
          });
          marginTop = marginTop + cste;
        }

        //Draw orderline data
        const num = `${catNum}.${subCat}`;
        const rowData = [
          num,
          orderLine.quantity,
          'U',
          orderLine.product.price,
          orderLine.price,
        ];

        rowData.forEach((row, key) => {
          const index = key > 0 ? key + 1 : key;
          pages[pageIndex].drawText(row.toString(), {
            x: marginLeftCalculator(line_x_positions, index) - 2,
            y: height - marginTop,
            size: caption,
            font: timesRomanFont,
            lineHeight,
            color: colors.black,
          });
        });

        textArrayFormated = lineBreaker(
          orderLine.product.name,
          timesRomanFont,
          caption,
          maxWidth,
        );
        textArrayFormated.forEach((productName) => {
          pages[pageIndex].drawText(productName, {
            x: secondVerticalLine_x + padding / 2,
            y: height - marginTop,
            size: caption,
            font: timesRomanFont,
            lineHeight,
            color: colors.black,
          });

          marginTop = marginTop + timesRomanFont.sizeAtHeight(caption);
        });

        marginTop = marginTop + cste;
        subCat += 1;
      }

      for (const x of line_x_positions) {
        pages[pageIndex].drawLine({
          start: { x, y: height - startVerticalLines_x },
          end: { x, y: height - marginTop },
          thickness: 1,
          color: colors.gray,
        });
      }

      pages[pageIndex].drawLine({
        start: { x: marginLeft, y: height - marginTop },
        end: { x: width - marginRight, y: height - marginTop },
        thickness: 1,
        color: colors.gray,
      });

      /////////////////////////////////////////////////////////////////////////////////////////////////////////Price summary
      marginTop += cste * 3;

      //1. Calculate total height of Price summary box
      //Price summary title height
      const priceSummaryTitle_height =
        timesRomanFont.heightAtSize(caption) + padding / 2;

      //Price container heigth
      const priceData_height =
        9 * timesRomanFont.heightAtSize(caption) + padding * 9;

      //TVAs container heigth
      const tva_headers_height =
        timesRomanBoldFont.heightAtSize(caption) + padding * 0.2;
      const tva_single_row_height =
        timesRomanFont.heightAtSize(caption) + padding * 0.2;
      const tva_rows_height = taxes.length * tva_single_row_height;
      const tva_table_height = tva_headers_height + tva_rows_height;

      const priceSummaryBoxHeight =
        priceData_height + tva_table_height + padding * 2;

      //Check marginTop -> Turn page
      if (
        marginTop >=
        height * 0.9 - priceSummaryTitle_height - priceSummaryBoxHeight
      ) {
        pageIndex = pageIndex + 1;
        pages[pageIndex] = pdfDoc.addPage(PageSizes.A4);
        marginTop = 35;
      }

      //Price Summary Box (frame)
      pages[pageIndex].drawRectangle({
        x: headerRigth_x_start,
        y: height - marginTop - priceSummaryBoxHeight,
        width: width * 0.5 - marginRight,
        height: priceSummaryBoxHeight,
        borderColor: colors.gray,
        borderWidth: 1,
      });

      //2. Draw pricing
      //2.1 Draw title
      pages[pageIndex].drawText('Offre précontractuelle (EUR)', {
        x: headerRigth_x_start + padding,
        y: height - marginTop + padding / 2,
        size: caption,
        font: timesRomanFont,
        lineHeight,
        color: colors.black,
      });

      //2.2 Draw price details
      const priceDatas = [
        { label: 'Total H.T', value: formatPrice(subTotal) }, //subtotal, primeCEE, primeRenov, AidRegion, discount, taxes
        {
          label: `Remise ${discount > 0 ? discount : ''}${discount > 0 ? '%' : ''
            }`,
          value: `-${formatPrice(discountValue)}`,
        },
        { label: 'Total Net H.T', value: formatPrice(totalNetHT) }, //calculable

        { label: 'TVA', value: formatPrice(totalTaxe) },
        {
          label: 'Total T.T.C',
          value: formatPrice(totalTTC),
          pdfConfig: { font: timesRomanBoldFont },
        }, //calculable

        { label: 'PRIME CEE COUP DE POUCE', value: `-${formatPrice(primeCEE)}` },
        { label: 'Maprime Révov', value: `-${formatPrice(primeRenov)}` },
        //{ label: 'Aides région', value: `-${formatPrice(aidRegion)}` },

        {
          label: 'Net à payer',
          value: formatPrice(totalNet),
          pdfConfig: { font: timesRomanBoldFont },
        }, //calculable
      ];

      priceDatas.forEach((priceData) => {
        marginTop += padding + timesRomanFont.heightAtSize(caption);
        const { pdfConfig } = priceData;

        pages[pageIndex].drawText(priceData.label, {
          x: headerRigth_x_start + padding,
          y: height - marginTop,
          size: caption,
          font: pdfConfig && pdfConfig.font ? pdfConfig.font : timesRomanFont,
          lineHeight,
          color: colors.black,
        });

        pages[pageIndex].drawText(priceData.value, {
          x:
            width -
            marginRight -
            padding -
            timesRomanFont.widthOfTextAtSize(priceData.value, caption),
          y: height - marginTop,
          size: caption,
          font: pdfConfig && pdfConfig.font ? pdfConfig.font : timesRomanFont,
          lineHeight,
          color: colors.black,
        });
      });

      marginTop += padding;

      //3. Draw TVAs
      //3.1 TVA table: Borders settings
      const tva_firstVerticalLine = headerRigth_x_start + padding;
      const tva_fourthVerticalLine = width - marginRight - padding;
      const tva_secondVerticalLine = tva_firstVerticalLine + cste * 6;
      const tva_thirdVerticalLine = tva_fourthVerticalLine - cste * 10;
      const tva_lines_x_positions = [
        tva_firstVerticalLine,
        tva_secondVerticalLine,
        tva_thirdVerticalLine,
        tva_fourthVerticalLine,
      ];

      const tva_firstHorizontalLine = height - marginTop;
      const tva_secondHorizontalLine =
        tva_firstHorizontalLine - tva_headers_height;
      const tva_lines_y_positions = [
        tva_firstHorizontalLine,
        tva_secondHorizontalLine,
      ];

      //3.1 TVA table: Draw Headers
      marginTop += padding * 0.1 + timesRomanBoldFont.heightAtSize(caption);
      const tva_headers = ['%TVA', 'Base', 'Total TVA'];
      tva_headers.forEach((header, key) => {
        pages[pageIndex].drawText(header, {
          x: marginLeftCalculator(tva_lines_x_positions, key, 0.2),
          y: height - marginTop,
          size: caption,
          font: timesRomanBoldFont,
          lineHeight,
          color: colors.black,
        });
      });

      marginTop += padding * 0.2 + timesRomanFont.heightAtSize(caption);

      //3.2 TVA table: Draw taxes details
      for (const taxe of taxes) {
        const taxeItems = [
          { value: taxe.name, marginRef: tva_secondVerticalLine },
          { value: subTotal.toString(), marginRef: tva_thirdVerticalLine },
          { value: taxe.value.toString(), marginRef: tva_fourthVerticalLine },
        ];

        taxeItems.forEach((item) => {
          pages[pageIndex].drawText(item.value, {
            x:
              item.marginRef -
              timesRomanFont.widthOfTextAtSize(item.value, caption) -
              cste / 4,
            y: height - marginTop,
            size: caption,
            font: timesRomanFont,
            lineHeight,
            color: colors.black,
          });
        });

        marginTop += padding * 0.1;

        pages[pageIndex].drawLine({
          start: {
            x: tva_firstVerticalLine,
            y: height - (marginTop + padding * 0.1),
          },
          end: {
            x: width - marginRight - padding,
            y: height - (marginTop + padding * 0.1),
          },
          thickness: 1,
          color: colors.gray,
        });

        marginTop += padding * 0.1 + timesRomanFont.heightAtSize(caption);
      }

      //3.3 TVA table: Draw table borders
      for (const x of tva_lines_x_positions) {
        pages[pageIndex].drawLine({
          start: { x, y: tva_firstHorizontalLine },
          end: {
            x,
            y: height - marginTop + timesRomanFont.heightAtSize(caption),
          },
          thickness: 1,
          color: colors.gray,
        });
      }

      for (const y of tva_lines_y_positions) {
        pages[pageIndex].drawLine({
          start: { x: tva_firstVerticalLine, y },
          end: { x: width - marginRight - padding, y },
          thickness: 1,
          color: colors.gray,
        });
      }

      marginTop += padding;

      //Check marginTop -> Turn page
      if (
        marginTop >=
        height * 0.9 - timesRomanBoldFont.heightAtSize(caption)
      ) {
        pageIndex = pageIndex + 1;
        pages[pageIndex] = pdfDoc.addPage(PageSizes.A4);
        marginTop = 35;
      }

      if (this.isQuote) {
        //Draw Proposal expiry date
        const proposalExpiryDate = moment()
          .add(6, 'months')
          .format('DD/MM/YYYY');
        pages[pageIndex].drawText(
          `Validité de l'offre précontractuelle:     ${proposalExpiryDate}`,
          {
            x: marginLeft,
            y: height - marginTop,
            size: caption,
            font: timesRomanBoldFont,
            lineHeight,
            color: colors.black,
          },
        );

        marginTop += cste;

        const p2 = padding,
          p3 = padding * 2,
          p5 = cste * 3,
          p6 = padding / 2;

        const paymentModeBoxHeight =
          4 * p2 +
          5 * p3 +
          2 * p6 +
          p5 +
          timesRomanBoldFont.heightAtSize(body) +
          2 * timesRomanBoldFont.heightAtSize(caption) +
          6 * timesRomanFont.heightAtSize(caption);

        //Check marginTop -> Turn page
        if (marginTop >= height * 0.9 - paymentModeBoxHeight) {
          pageIndex = pageIndex + 1;
          pages[pageIndex] = pdfDoc.addPage(PageSizes.A4);
          marginTop = 35;
        }

        //4. Draw Payment Mode
        //4.1 Draw frame
        pages[pageIndex].drawRectangle({
          x: marginRight,
          y: height - marginTop - paymentModeBoxHeight,
          width: width - marginRight - marginLeft,
          height: paymentModeBoxHeight,
          borderColor: colors.gray,
          borderWidth: 1,
        });

        marginTop += p2 + timesRomanBoldFont.heightAtSize(body);

        //4.2 Draw title
        pages[pageIndex].drawText('MODE DE PAIEMENT', {
          x: marginLeft + p2,
          y: height - marginTop,
          size: caption,
          font: timesRomanBoldFont,
          lineHeight,
          color: colors.black,
        });

        marginTop += p3 + timesRomanBoldFont.heightAtSize(caption);

        //4.2 Draw 1st clause
        const checkBoxSize = 5;
        pages[pageIndex].drawRectangle({
          x: marginRight + p2,
          y: height - marginTop,
          width: checkBoxSize,
          height: checkBoxSize,
          borderColor: colors.gray,
          borderWidth: 1,
        });

        pages[pageIndex].drawText(
          '  Paiement Comptant / Paiement via organisme bancaire du client :',
          {
            x: marginLeft + p2 + checkBoxSize,
            y: height - marginTop,
            size: caption,
            font: timesRomanBoldFont,
            lineHeight,
            color: colors.black,
          },
        );

        marginTop += p2 + timesRomanFont.heightAtSize(caption);

        pages[pageIndex].drawText('Conditions de règlement :', {
          x: marginLeft + p2,
          y: height - marginTop,
          size: caption,
          font: timesRomanFont,
          lineHeight,
          color: colors.black,
        });

        marginTop += p3 + timesRomanFont.heightAtSize(caption);

        pages[pageIndex].drawText(
          '30 % soit ................................. € TTC à la visite technique',
          {
            x: marginLeft + p2 + p5,
            y: height - marginTop,
            size: caption,
            font: timesRomanFont,
            lineHeight,
            color: colors.black,
          },
        );

        marginTop += p2 + timesRomanFont.heightAtSize(caption);

        pages[pageIndex].drawText(
          'et 70 % soit ................................. € TTC au PV de réception de chantier',
          {
            x: marginLeft + p2 + p5,
            y: height - marginTop,
            size: caption,
            font: timesRomanFont,
            lineHeight,
            color: colors.black,
          },
        );

        marginTop += p3 + timesRomanBoldFont.heightAtSize(caption);

        //4.3 Draw 2nd clause
        pages[pageIndex].drawRectangle({
          x: marginRight + p2,
          y: height - marginTop,
          width: checkBoxSize,
          height: checkBoxSize,
          borderColor: colors.gray,
          borderWidth: 1,
        });

        pages[pageIndex].drawText(
          '  Paiement via l’organisme de financement partenaire Synergys : ......................................',
          {
            x: marginLeft + p2 + checkBoxSize,
            y: height - marginTop,
            size: caption,
            font: timesRomanBoldFont,
            lineHeight,
            color: colors.black,
          },
        );

        marginTop += p3 + timesRomanFont.heightAtSize(caption);

        pages[pageIndex].drawText(
          'Partie financée : ..................................... €       Et       Partie au comptant : ............................................... €',
          {
            x: marginLeft + p2 + p5,
            y: height - marginTop,
            size: caption,
            font: timesRomanFont,
            lineHeight,
            color: colors.black,
          },
        );

        marginTop += p3;

        //Draw Payment Table
        const boxWidth = cste * 6.5;
        for (let i = 0; i < 9; i++) {
          pages[pageIndex].drawLine({
            start: { x: marginLeft + p2 + i * boxWidth, y: height - marginTop },
            end: {
              x: marginLeft + p2 + i * boxWidth,
              y:
                height -
                marginTop -
                (p6 * 2 + 2 * timesRomanFont.heightAtSize(caption) + cste * 3),
            },
            thickness: 1,
            color: colors.gray,
          });
        }

        let pt_marginTop = marginTop;

        for (let j = 0; j < 3; j++) {
          pages[pageIndex].drawLine({
            start: { x: marginLeft + p2, y: height - pt_marginTop },
            end: { x: marginLeft + p2 + 8 * boxWidth, y: height - pt_marginTop },
            thickness: 1,
            color: colors.gray,
          });

          if (j === 0)
            pt_marginTop += p6 * 2 + 2 * timesRomanFont.heightAtSize(caption);
          if (j === 1) pt_marginTop += cste * 3;
        }

        //PT: Draw headers
        const pt_headers = [
          ['Durée du', 'financement'],
          ['Nombre de', 'mensualités'],
          ['Mensualité hors', 'assurance'],
          ['Mensualité avec', 'assurance'],
          ['Taux débiteur', 'fixe'],
          ['Taux débiteur', 'effectif global'],
          ['Coût total du', 'financement'],
          ['Report'],
        ];

        let x = marginLeft + p2;

        pt_headers.forEach((headerArray, key) => {
          const initMarginTop = marginTop;
          marginTop += p6;

          headerArray.forEach((header) => {
            marginTop += timesRomanFont.heightAtSize(caption);

            pages[pageIndex].drawText(header, {
              x:
                x +
                key * boxWidth +
                (boxWidth - timesRomanFont.widthOfTextAtSize(header, 9)) / 2,
              y: height - marginTop,
              size: 9,
              font: timesRomanFont,
              lineHeight,
              color: colors.black,
            });
          });

          marginTop = initMarginTop;
        });

        //PT: Draw units
        marginTop +=
          p6 * 2 + 2 * timesRomanFont.heightAtSize(caption) + cste * 3;

        const units = ['', '', '€', '€', '%', '%', '€', ''];

        units.forEach((unit, key) => {
          pages[pageIndex].drawText(unit, {
            x: marginLeft + (key + 1) * boxWidth,
            y: height - marginTop + p6,
            size: caption,
            font: timesRomanFont,
            lineHeight,
            color: colors.black,
          });
        });

        marginTop += padding * 3;

        //Check marginTop -> turn page
        if (
          marginTop >=
          height * 0.9 - 2 * timesRomanFont.heightAtSize(caption) - padding
        ) {
          pageIndex = pageIndex + 1;
          pages[pageIndex] = pdfDoc.addPage(PageSizes.A4);
          marginTop = 35;
        }

        //3rd clause
        const str = 'Si le produit commandé est indisponible :';
        pages[pageIndex].drawText(str, {
          x: marginLeft + p2,
          y: height - marginTop,
          size: caption,
          font: timesRomanFont,
          lineHeight,
          color: colors.black,
        });

        pages[pageIndex].drawLine({
          start: { x: marginLeft + p2, y: height - marginTop },
          end: {
            x: marginLeft + p2 + timesRomanFont.widthOfTextAtSize(str, caption),
            y: height - marginTop,
          },
          thickness: 1,
          color: colors.gray,
        });

        pages[pageIndex].drawText(str, {
          x: marginLeft + p2,
          y: height - marginTop,
          size: caption,
          font: timesRomanFont,
          lineHeight,
          color: colors.black,
        });

        marginTop += padding;

        //Equivalent product
        pages[pageIndex].drawRectangle({
          x: marginRight + p2,
          y: height - marginTop,
          width: checkBoxSize,
          height: checkBoxSize,
          borderColor: colors.gray,
          borderWidth: 1,
        });

        pages[pageIndex].drawText(
          "  Vous nous autorisez d'installer un produit d'une qualité et d'un prix équivalent (voir Article 4 des CGV)",
          {
            x: marginLeft + p2 + checkBoxSize,
            y: height - marginTop,
            size: caption,
            font: timesRomanBoldFont,
            lineHeight,
            color: colors.black,
          },
        );

        marginTop += padding * 2;

        //Signature
        const signatureBoxHeight = cste * 10;
        const signatureBoxWidth = width * 0.6;

        //Check marginTop -> turn page
        if (marginTop >= height * 0.9 - signatureBoxHeight) {
          pageIndex = pageIndex + 1;
          pages[pageIndex] = pdfDoc.addPage(PageSizes.A4);
          marginTop = 35;
        }

        pages[pageIndex].drawRectangle({
          x: marginRight + p2,
          y: height - marginTop - signatureBoxHeight,
          width: signatureBoxWidth,
          height: signatureBoxHeight,
          borderColor: colors.gray,
          borderWidth: 1,
        });

        marginTop += padding * 1.5;

        pages[pageIndex].drawText(`Offre précontractuelle: n° ${this.DocumentId}`, {
          x: marginRight + p2 * 2,
          y: height - marginTop,
          size: caption,
          font: timesRomanBoldFont,
          lineHeight,
          color: colors.black,
        });

        marginTop += p2;

        pages[pageIndex].drawText(
          'Signature précédée de la mention "offre précontractuelle: accepté le".',
          {
            x: marginRight + p2 * 2,
            y: height - marginTop,
            size: caption,
            font: timesRomanBoldFont,
            lineHeight,
            color: colors.black,
          },
        );
      }

      //Footer
      pages.forEach((page, pageIndex) => {
        let footer_MarginBottom = page.getHeight() * 0.075;

        page.drawLine({
          start: { x: marginLeft, y: footer_MarginBottom },
          end: { x: width - marginRight, y: footer_MarginBottom },
          thickness: 1,
          color: colors.gray,
        });

        footer_MarginBottom -= padding * 2;

        const footerText = [
          'Responsabilité civile et décennale n°0000010981242304 AXA',
          'SAS SYNERGYS au capital de 30000 € - Siret : 849583281 00027',
          'APE : 4322B - RCS NARBONNE - TVA intracommunautaire : FR68849583281'
        ];

        footerText.forEach((text) => {
          page.drawText(text, {
            x: (width - timesRomanFont.widthOfTextAtSize(text, 9)) / 2,
            y: footer_MarginBottom,
            size: 9,
            font: timesRomanFont,
            lineHeight,
            color: colors.black,
          });
          footer_MarginBottom -= padding * 1.5;
        });

        const pageNumber = pageIndex + 1;
        page.drawText(pageNumber.toString(), {
          x: width - marginRight,
          y: footer_MarginBottom + padding * 1.5,
          size: caption,
          font: timesRomanFont,
          lineHeight,
          color: colors.black,
        });
      });

      let pdfBytes;

      //Merge "Devis" with "Conditions générales"
      if (this.isQuote) {
        const mergedPdf = await PDFDocument.create();
        const termsPdf = await PDFDocument.load(termsBase64);
        const formulaireRetractionPdf = await PDFDocument.load(formulaireRetraction);

        const copiedPagesA = await mergedPdf.copyPages(
          pdfDoc,
          pdfDoc.getPageIndices(),
        );
        copiedPagesA.forEach((page) => mergedPdf.addPage(page));
        
        const copiedPagesB = await mergedPdf.copyPages(
          termsPdf,
          termsPdf.getPageIndices(),
        );
        copiedPagesB.forEach((page) => mergedPdf.addPage(page));
        

        //CERFA: Delete existing data (put white square) & set instead Client info
        const lastPageIndex = mergedPdf.getPages().length - 1;
        const cerfaClient = [
          {
            pdfConfig: {
              x: 125,
              y: 689,
              width: 90,
              height: 10,
            },
            text: client.fullName,
          },
          {
            pdfConfig: {
              x: 100,
              y: 678,
              width: 90,
              height: 10,
            },
            text: this.project.address.description,
          },
          {
            pdfConfig: {
              x: 228,
              y: 678,
              width: 242,
              height: 10,
            },
          },
        ];

        for (const item of cerfaClient) {
          const color = { color: rgb(1, 1, 1) };
          const rectangle = { ...item.pdfConfig, ...color };
          mergedPdf.getPages()[lastPageIndex].drawRectangle(rectangle);
          if (item.text) {
            const moreConfig = { size: caption, font: timesRomanFont };
            const textConfig = { ...item.pdfConfig, ...moreConfig };
            mergedPdf.getPages()[lastPageIndex].drawText(item.text, textConfig);
          }
        }

        // const copiedPagesC = await mergedPdf.copyPages(
        //   formulaireRetractionPdf,
        //   formulaireRetractionPdf.getPageIndices(),
        // );
        // copiedPagesC.forEach((page) => mergedPdf.addPage(page));

          pdfBytes = await mergedPdf.save();
      }

      else pdfBytes = await pdfDoc.save();

      const pdfBase64 = uint8ToBase64(pdfBytes);
      const source = { uri: `data:application/pdf;base64,${pdfBase64}` };
      this.setState({ source, pdfBase64 }, () => this.setState({ loading: false }));
    } catch (e) {
      console.log(e);
      displayError({ message: errorMessages.pdfGen });
    }
  }

  async savePdfBase64(pdfBase64) {
    const pdfName = `Scan généré ${moment().format('DD-MM-YYYY HHmmss')}.pdf`;
    saveFile(pdfBase64, pdfName, 'base64')
      .then((destPath) => {
        const genPdf = {
          pdfBase64Path: destPath,
          pdfName,
          order: this.order,
          isConversion: this.isConversion,
          DocumentId: this.DocumentId,
        };
        this.props.navigation.state.params.onGoBack(genPdf);
        this.props.navigation.pop(this.popCount);
      })
      .catch((e) => {
        Alert.alert('', e.message);
        return;
      });
  }

  render() {
    const { source, pdfBase64, loading } = this.state;

    if (loading)
      return (
        <View style={{ flex: 1 }}>
          <Appbar title titleText={`${this.titleText}`} />
          <LoadDialog loading message={`${this.titleText} en cours...`} />
        </View>
      );
    else
      return (
        <View style={{ flex: 1 }}>
          <Appbar back title titleText={this.titleText} />
          <View style={styles.container}>
            {source !== '' && (
              <Pdf
                source={source}
                // onLoadComplete={(numberOfPages, filePath, { width, height }) => {
                //     console.log(`number of pages: ${numberOfPages}`)
                //     console.log(`width: ${width}`)
                //     console.log(`height: ${height}`)
                // }}
                // onPageChanged={(page, numberOfPages) => {
                //     console.log(`current page: ${page}`)
                // }}
                // onError={(error) => {
                //     console.log(error)
                // }}
                // onPressLink={(uri) => {
                //     console.log(`Link presse: ${uri}`)
                // }}
                style={styles.pdf}
              />
            )}
          </View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              paddingRight: theme.padding,
              alignItems: 'center',
            }}>
            <Button
              mode="contained"
              onPress={() => this.savePdfBase64(pdfBase64)}>
              Valider
            </Button>
          </View>
        </View>
      );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  pdf: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});
