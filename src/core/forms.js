
import { faCheck, faTimes, faCheckCircle } from "react-native-fontawesome";
import { rgb } from 'pdf-lib'

import moment from "moment";
import * as theme from './theme'

//##task: Check if really PV start from the end
export const pvReceptionModel = (params) => {

    const { pvId, clientFullName, billingDate } = params

    const globalConfig = {
        pageDuplication: {
            pageIndexSource: 0,
            pageIndexTarget: 1
        }
    }

    const model = [
        //---------------------------  Page 1
        { //2
            id: "worksWithReserves",
            title: "",
            fields: [
                {
                    id: "worksWithReserves",
                    label: "Travaux avec ou sans réserves ?",
                    type: "options",
                    items: [
                        {
                            label: 'Accepter la réception des travaux sans réserves',
                            value: 'Sans réserves',
                            icon: faCheckCircle,
                            pdfConfig: { dx: -492, dy: - 226, pageIndex: 0 },
                            rollBack: {
                                fields: [
                                    { id: "acceptWorksReceptionDate", type: "date" },
                                ]
                            }
                        },
                        {
                            label: 'Accepter la réception assortie de réserves',
                            value: 'Avec réserves',
                            icon: faCheckCircle,
                            pdfConfig: { dx: -492, dy: - 250, pageIndex: 0 },
                            rollBack: {
                                fields: [
                                    { id: "acceptReservesReceptionDate", type: "date" },
                                ]
                            }
                        },
                    ],
                    errorId: "worksWithReservesError",
                    mendatory: true,
                },
            ]
        },
        //AUTO-GEN
        {
            id: '',
            title: '',
            fields: [
                {
                    id: "projectOwner",
                    type: "autogen",
                    value: clientFullName,
                    pdfConfig: { dx: -423, dy: - 132, pageIndex: 0 }
                },
                {
                    id: "billingDate",
                    type: "autogen",
                    value: billingDate,
                    pdfConfig: { dx: -335, dy: - 172, pageIndex: 0 }
                },
                {
                    id: "reserveDate1",
                    type: "autogen",
                    value: moment().format('DD/MM/YYYY'),
                    pdfConfig: { dx: -174, dy: - 225, pageIndex: 0 },
                    isConditional: true,
                    condition: { with: "worksWithReserves", values: ["Sans réserves"] },
                },
                {
                    id: "reserveDate2",
                    type: "autogen",
                    value: moment().format('DD/MM/YYYY'),
                    pdfConfig: { dx: -200, dy: - 249, pageIndex: 0 },
                    isConditional: true,
                    condition: { with: "worksWithReserves", values: ["Avec réserves"] },
                },
                {
                    id: "todayDate1",
                    type: "autogen",
                    value: moment().format('DD/MM/YYYY'),
                    pdfConfig: { dx: -295, dy: - 547, pageIndex: 0 }
                },
                // {
                //     id: "appreciationDate",
                //     type: "autogen",
                //     value: moment().format('DD/MM/YYYY'),
                //     pdfConfig: { dx: -500, dy: -747, pageIndex: 1 },
                // },
                // {
                //     id: "dayNow",
                //     type: "autogen",
                //     value: moment().format('DD'),
                //     pdfConfig: {
                //         dx: -182, dy: - 313, pageIndex: 1, spaces: { afterEach: 1, str: '   ' },
                //         mendatory: true,
                //     }
                // },
                // {
                //     id: "monthNow",
                //     type: "autogen",
                //     value: moment().format('MM'),
                //     pdfConfig: {
                //         dx: -148, dy: - 313, pageIndex: 1, spaces: { afterEach: 1, str: '   ' },
                //         mendatory: true,
                //     }
                // },
                // {
                //     id: "yearNow",
                //     type: "autogen",
                //     value: moment().format('YYYY'),
                //     pdfConfig: {
                //         dx: -115, dy: - 313, pageIndex: 1, spaces: { afterEach: 1, str: '   ' },
                //         mendatory: true,
                //     }
                // },
                // {
                //     id: "pvId",
                //     type: "autogen",
                //     value: pvId,
                //     pdfConfig: {
                //         dx: -489,
                //         dy: -188,
                //         pageIndex: 1,
                //         mendatory: true,
                //     }
                // },
            ]
        },
        {//5
            id: "reservesNature",
            title: "",
            fields: [
                {
                    id: "reservesNature",
                    type: "textInput",
                    label: "Nature des réserves",
                    errorId: "reservesNatureError",
                    pdfConfig: {
                        dx: -335,
                        dy: - 267,
                        pageIndex: 0,
                        breakLines: {
                            linesWidths: [300, 410, 410, 410],
                            linesStarts: [
                                { dx: -335, dy: -267 },
                                { dx: -465, dy: -287 },
                                { dx: -465, dy: -307 },
                                { dx: -465, dy: -327 },
                            ]
                        }
                    },
                    mendatory: true,
                    isConditional: true,
                    condition: { with: "worksWithReserves", values: ["Avec réserves"] },
                },
            ],
        },
        {//6
            id: "worksToExecute",
            title: "",
            fields: [
                {
                    id: "worksToExecute",
                    type: "textInput",
                    label: "Travaux à exécuter",
                    errorId: "worksToExecuteError",
                    pdfConfig: {
                        dx: -337,
                        dy: - 348,
                        pageIndex: 0,
                        breakLines: {
                            linesWidths: [300, 410, 410, 410],
                            linesStarts: [
                                { dx: -335, dy: -347 },
                                { dx: -465, dy: -367 },
                                { dx: -465, dy: -387 },
                                { dx: -465, dy: -407 },
                            ]
                        }
                    },
                    mendatory: true,
                    isConditional: true,
                    condition: { with: "worksWithReserves", values: ["Avec réserves"] },
                },
            ],
        },
        {//7
            id: "timeLimitFromToday",
            title: "",
            fields: [
                {
                    id: "timeLimitFromToday",
                    type: "textInput",
                    label: "Délai imparti à compter de ce jour",
                    errorId: "timeLimitFromTodayError",
                    pdfConfig: { dx: -265, dy: - 428, pageIndex: 0 },
                    mendatory: true,
                    isConditional: true,
                    condition: { with: "worksWithReserves", values: ["Avec réserves"] },
                },
            ],
        },
        {//8
            id: "madeIn",
            title: "",
            fields: [
                {
                    id: "madeIn",
                    type: "textInput",
                    label: "Fait à:",
                    errorId: "madeInError",
                    pdfConfig: { dx: -452, dy: - 547, pageIndex: 0 },
                    mendatory: true,
                },
            ],
        },
        //----------------------- PAGE2
        // {//1
        //     id: "clientName",
        //     title: "Coordonnées du chantier",
        //     fields: [
        //         {
        //             id: "clientName",
        //             type: "textInput",
        //             label: "Nom et prénom du client",
        //             errorId: "clientNameError",
        //             pdfConfig: { dx: -430, dy: - 239, pageIndex: 1 },
        //             mendatory: true,
        //         },
        //     ],
        // },
        // {//2
        //     id: "installationAddress",
        //     title: "Coordonnées du chantier",
        //     fields: [
        //         {
        //             id: "installationAddress",
        //             type: "address",
        //             label: "Adresse complète de l'installation",
        //             errorId: "installationAddressError",
        //             pdfConfig: { dx: -393, dy: - 262, pageIndex: 1 },
        //             mendatory: true,
        //         }
        //     ]
        // },
        // {//3
        //     id: "clientPhone",
        //     title: "Coordonnées du chantier",
        //     fields: [
        //         {
        //             id: "phone",
        //             type: "textInput",
        //             mask: "[00][00][00][00][00]",
        //             isNumeric: true,
        //             label: "Téléphone du client",
        //             errorId: "phoneError",
        //             mendatory: true,
        //             pdfConfig: { dx: -453, dy: - 314, pageIndex: 1 }, //task: make spacing pattern to be more dynamic
        //             mendatory: true,
        //         },
        //     ]
        // },
        // //********************************* INSTALLATIONS
        // { //Inst1
        //     id: "installations",
        //     title: "Cochez la case de l'installation si mise en oeuvre et précisez la puissance ou la surface demandée",
        //     fields: [
        //         {
        //             id: "installations",
        //             label: "Installations",
        //             type: "options",
        //             isStepMultiOptions: true,
        //             items: [
        //                 {
        //                     label: 'Chauffe‐eau solaire individuel',
        //                     value: 'Chauffe‐eau solaire individuel',
        //                     icon: faCheckCircle,
        //                     pdfConfig: { dx: -544, dy: - 382, pageIndex: 1, squareSize: 8 },
        //                 },
        //                 {
        //                     label: 'Non installé, passer.',
        //                     value: '',
        //                     skip: true,
        //                     icon: faCheckCircle,
        //                     pdfConfig: { skip: true },
        //                     rollBack: {
        //                         fields: [
        //                             { id: "installations", type: "array", value: "Chauffe‐eau solaire individuel" },
        //                             { id: "solarWaterHeaterSensorSurface", type: "string" }
        //                         ]
        //                     }
        //                 },
        //             ],
        //         },
        //         {
        //             id: "solarWaterHeaterSensorSurface",
        //             type: "textInput",
        //             isNumeric: true,
        //             label: "Surface du capteur (en m²)",
        //             errorId: "solarWaterHeaterSensorSurfaceError",
        //             isConditional: true,
        //             condition: { with: "installations", values: ["Chauffe‐eau solaire individuel"] },
        //             pdfConfig: { dx: -160, dy: - 380, pageIndex: 1 },
        //             mendatory: true,
        //         },
        //     ]
        // },
        // { //Inst2
        //     id: "installations",
        //     title: "Cochez la case de l'installation si mise en oeuvre et précisez la puissance ou la surface demandée",
        //     fields: [
        //         {
        //             id: "installations",
        //             label: "",
        //             type: "options",
        //             isStepMultiOptions: true,
        //             items: [
        //                 {
        //                     label: 'Système solaire combiné',
        //                     value: 'Système solaire combiné',
        //                     icon: faCheckCircle,
        //                     pdfConfig: { dx: -544, dy: - 405, pageIndex: 1, squareSize: 8 },
        //                 },
        //                 {
        //                     label: 'Non installé, passer.',
        //                     value: '',
        //                     skip: true,
        //                     icon: faCheckCircle,
        //                     pdfConfig: { skip: true },
        //                     rollBack: {
        //                         fields: [
        //                             { id: "installations", type: "array", value: "Système solaire combiné" },
        //                             { id: "combinedSolarSystemSensorSurface", type: "string" }
        //                         ]
        //                     }
        //                 },
        //             ],
        //         },
        //         {
        //             id: "combinedSolarSystemSensorSurface",
        //             type: "textInput",
        //             isNumeric: true,
        //             label: "Surface du capteur (en m²)",
        //             errorId: "combinedSolarSystemSensorSurfaceError",
        //             isConditional: true,
        //             condition: { with: "installations", values: ["Système solaire combiné"] },
        //             pdfConfig: { dx: -160, dy: - 403, pageIndex: 1 },
        //             mendatory: true,
        //         },
        //     ]
        // },
        // { //Inst3
        //     id: "installations",
        //     title: "Cochez la case de l'installation si mise en oeuvre et précisez la puissance ou la surface demandée",
        //     fields: [
        //         {
        //             id: "installations",
        //             label: "",
        //             type: "options",
        //             isStepMultiOptions: true,
        //             items: [
        //                 {
        //                     label: 'Solaire thermique collectif (ECS)',
        //                     value: 'Solaire thermique collectif (ECS)',
        //                     icon: faCheckCircle,
        //                     pdfConfig: { dx: -544, dy: - 428, pageIndex: 1, squareSize: 8 },
        //                 },
        //                 {
        //                     label: 'Non installé, passer.',
        //                     value: '',
        //                     skip: true,
        //                     icon: faCheckCircle,
        //                     pdfConfig: { skip: true },
        //                     rollBack: {
        //                         fields:
        //                             [
        //                                 { id: "installations", type: "array", value: "Solaire thermique collectif (ECS)" },
        //                                 { id: "collectiveSolarThermalSensorSurface", type: "string" }
        //                             ]
        //                     }
        //                 },
        //             ],
        //         },
        //         {
        //             id: "collectiveSolarThermalSensorSurface",
        //             type: "textInput",
        //             isNumeric: true,
        //             label: "Surface du capteur (en m²)",
        //             errorId: "collectiveSolarThermalSensorSurfaceError",
        //             isConditional: true,
        //             condition: { with: "installations", values: ["Solaire thermique collectif (ECS)"] },
        //             pdfConfig: { dx: -160, dy: - 426, pageIndex: 1 },
        //             mendatory: true,
        //         },
        //     ]
        // },
        // { //Inst4
        //     id: "installations",
        //     title: "Cochez la case de l'installation si mise en oeuvre et précisez la puissance ou la surface demandée",
        //     fields: [
        //         {
        //             id: "installations",
        //             label: "",
        //             type: "options",
        //             isStepMultiOptions: true,
        //             items: [
        //                 {
        //                     label: 'Chauffage au bois',
        //                     value: 'Chauffage au bois',
        //                     icon: faCheckCircle,
        //                     pdfConfig: { dx: -544, dy: - 449, pageIndex: 1, squareSize: 8 },
        //                 },
        //                 {
        //                     label: 'Non installé, passer.',
        //                     value: '',
        //                     skip: true,
        //                     icon: faCheckCircle,
        //                     pdfConfig: { skip: true },
        //                     rollBack: {
        //                         fields: [
        //                             { id: "installations", type: "array", value: "Chauffage au bois" },
        //                             { id: "woodHeatingPower", type: "string" },
        //                             { id: "woodHeatingDeviceType", type: "string" }
        //                         ]
        //                     }
        //                 },
        //             ],
        //         },
        //         {
        //             id: "woodHeatingPower",
        //             type: "textInput",
        //             isNumeric: true,
        //             label: "Puissance (en kW)",
        //             errorId: "woodHeatingPowerError",
        //             isConditional: true,
        //             condition: { with: "installations", values: ["Chauffage au bois"] },
        //             pdfConfig: { dx: -190, dy: - 447, pageIndex: 1 },
        //             mendatory: true,
        //         },
        //         {
        //             id: "woodHeatingDeviceType",
        //             type: "picker",
        //             items: [
        //                 { label: "Choisir", value: "", pdfConfig: { skip: true } },
        //                 { label: "Poêle hydraulique", value: "Poêle hydraulique", pdfConfig: { dx: -545, dy: - 475, pageIndex: 1 } },
        //                 { label: "Poêle indépendant", value: "Poêle indépendant", pdfConfig: { dx: -458, dy: - 475, pageIndex: 1 } },
        //                 { label: "Insert", value: "Insert", pdfConfig: { dx: -367, dy: - 475, pageIndex: 1 } },
        //                 { label: "Chaudière manuelle (bûche)", value: "Chaudière manuelle (bûche)", pdfConfig: { dx: -333, dy: - 475, pageIndex: 1 } },
        //                 { label: "Chaudière automatique (granulé, pellet)", value: "Chaudière automatique (granulé, pellet)", pdfConfig: { dx: -210, dy: - 475, pageIndex: 1 } },
        //             ],
        //             label: "Type d’appareil",
        //             mendatory: true,
        //             errorId: "woodHeatingDeviceTypeError",
        //             isConditional: true,
        //             condition: { with: "installations", values: ["Chauffage au bois"] },
        //         },
        //     ]
        // },
        // { //Inst5
        //     id: "installations",
        //     title: "Cochez la case de l'installation si mise en oeuvre et précisez la puissance ou la surface demandée",
        //     fields: [
        //         {
        //             id: "installations",
        //             label: "",
        //             type: "options",
        //             isStepMultiOptions: true,
        //             items: [
        //                 {
        //                     label: 'Générateur photovoltaïque raccordé au réseau',
        //                     value: 'Générateur photovoltaïque raccordé au réseau',
        //                     icon: faCheckCircle,
        //                     pdfConfig: { dx: -544, dy: - 495, pageIndex: 1, squareSize: 8 },
        //                 },
        //                 {
        //                     label: 'Non installé, passer.',
        //                     value: '',
        //                     skip: true,
        //                     icon: faCheckCircle,
        //                     pdfConfig: { skip: true },
        //                     rollBack: {
        //                         fields: [
        //                             { id: "installations", type: "array", value: "Générateur photovoltaïque raccordé au réseau" },
        //                             { id: "photovoltaicPower", type: "string" },
        //                             { id: "photovoltaicWorksType", type: "string" }
        //                         ]
        //                     }
        //                 },
        //             ],
        //         },
        //         {
        //             id: "photovoltaicPower",
        //             type: "textInput",
        //             isNumeric: true,
        //             label: "Puissance (en kW)",
        //             errorId: "photovoltaicPowerError",
        //             isConditional: true,
        //             condition: { with: "installations", values: ["Générateur photovoltaïque raccordé au réseau"] },
        //             pdfConfig: { dx: -190, dy: - 493, pageIndex: 1 },
        //             mendatory: true,
        //         },
        //         {
        //             id: "photovoltaicWorksType",
        //             type: "picker",
        //             items: [
        //                 { label: "Choisir", value: "", pdfConfig: { skip: true } },
        //                 { label: "Travaux d’intégration au bâti", value: "Travaux d’intégration au bâti", pdfConfig: { dx: -517, dy: - 520, pageIndex: 1 } },
        //                 { label: "Travaux d’installation électrique", value: "Travaux d’installation électrique", pdfConfig: { dx: -370, dy: - 520, pageIndex: 1 } },
        //             ],
        //             label: "Nature des travaux réalisés par l’entreprise",
        //             mendatory: true,
        //             errorId: "photovoltaicWorksTypeError",
        //             isConditional: true,
        //             condition: { with: "installations", values: ["Générateur photovoltaïque raccordé au réseau"] },
        //         },
        //     ]
        // },
        // { //Inst6
        //     id: "installations",
        //     title: "Cochez la case de l'installation si mise en oeuvre et précisez la puissance ou la surface demandée",
        //     fields: [
        //         {
        //             id: "installations",
        //             label: "",
        //             type: "options",
        //             isStepMultiOptions: true,
        //             items: [
        //                 {
        //                     label: 'Pompe à chaleur',
        //                     value: 'Pompe à chaleur',
        //                     icon: faCheckCircle,
        //                     pdfConfig: { dx: -544, dy: - 541, pageIndex: 1, squareSize: 8 },
        //                 },
        //                 {
        //                     label: 'Non installé, passer.',
        //                     value: '',
        //                     skip: true,
        //                     icon: faCheckCircle,
        //                     pdfConfig: { skip: true },
        //                     rollBack: {
        //                         fields: [
        //                             { id: "installations", type: "array", value: "Pompe à chaleur" },
        //                             { id: "heatPumpPower", type: "string" },
        //                             { id: "heatPumpDeviceType", type: "string" }
        //                         ]
        //                     }
        //                 },
        //             ],
        //         },
        //         {
        //             id: "woodHeatingPower",
        //             type: "textInput",
        //             isNumeric: true,
        //             label: "Puissance (en kW)",
        //             errorId: "woodHeatingPowerError",
        //             isConditional: true,
        //             condition: { with: "installations", values: ["Pompe à chaleur"] },
        //             pdfConfig: { dx: -190, dy: - 539, pageIndex: 1 },
        //             mendatory: true,
        //         },
        //         {
        //             id: "heatPumpDeviceType",
        //             type: "picker",
        //             items: [
        //                 { label: "Choisir", value: "", pdfConfig: { skip: true } },
        //                 { label: "Air/Air", value: "Air/Air", pdfConfig: { dx: -517, dy: - 567, pageIndex: 1 } },
        //                 { label: "Air/Eau", value: "Air/Eau", pdfConfig: { dx: -460, dy: - 567, pageIndex: 1 } },
        //                 { label: "Eau/Eau", value: "Eau/Eau", pdfConfig: { dx: -400, dy: - 567, pageIndex: 1 } },//400
        //                 { label: "Sol/Eau", value: "Sol/Eau", pdfConfig: { dx: -335, dy: - 567, pageIndex: 1 } },
        //                 { label: "Sol/Sol", value: "Sol/Sol", pdfConfig: { dx: -275, dy: - 567, pageIndex: 1 } },
        //                 { label: "Air/Air multisplit", value: "Air/Air multisplit", pdfConfig: { dx: -215, dy: - 567, pageIndex: 1 } },
        //                 { label: "CET", value: "CET", pdfConfig: { dx: -120, dy: - 567, pageIndex: 1 } },
        //             ],
        //             label: "Type d’appareil",
        //             mendatory: true,
        //             errorId: "heatPumpDeviceTypeError",
        //             isConditional: true,
        //             condition: { with: "installations", values: ["Pompe à chaleur"] },
        //         },
        //     ]
        // },
        // { //Inst7
        //     id: "installations",
        //     title: "Cochez la case de l'installation si mise en oeuvre et précisez la puissance ou la surface demandée",
        //     fields: [
        //         {
        //             id: "installations",
        //             label: "",
        //             type: "options",
        //             isStepMultiOptions: true,
        //             items: [
        //                 {
        //                     label: 'Forage géothermique',
        //                     value: 'Forage géothermique',
        //                     icon: faCheckCircle,
        //                     pdfConfig: { dx: -544, dy: - 588, pageIndex: 1, squareSize: 8 },
        //                 },
        //                 {
        //                     label: 'Non installé, passer.',
        //                     value: '',
        //                     skip: true,
        //                     icon: faCheckCircle,
        //                     pdfConfig: { skip: true },
        //                     rollBack: {
        //                         fields: [
        //                             { id: "installations", type: "array", value: "Forage géothermique" },
        //                             { id: "geothermalDrillingDepth", type: "string" },
        //                             { id: "drillingType", type: "string" }
        //                         ]
        //                     }
        //                 },
        //             ],
        //         },
        //         {
        //             id: "geothermalDrillingDepth",
        //             type: "textInput",
        //             isNumeric: true,
        //             label: "Profondeur (en m)",
        //             errorId: "geothermalDrillingDepthError",
        //             isConditional: true,
        //             condition: { with: "installations", values: ["Forage géothermique"] },
        //             pdfConfig: { dx: -190, dy: - 586, pageIndex: 1 },
        //             mendatory: true,
        //         },
        //         {
        //             id: "drillingType",
        //             type: "picker",
        //             items: [
        //                 { label: "Choisir", value: "", pdfConfig: { skip: true } },
        //                 { label: "Forage sur Nappe", value: "Forage sur Nappe", pdfConfig: { dx: -517, dy: - 613, pageIndex: 1 } },//517
        //                 { label: "Forage sur Sonde", value: "Forage sur Sonde", pdfConfig: { dx: -415, dy: - 613, pageIndex: 1 } },
        //             ],
        //             label: "Type de forage",
        //             mendatory: true,
        //             errorId: "drillingTypeError",
        //             isConditional: true,
        //             condition: { with: "installations", values: ["Forage géothermique"] },
        //         },
        //     ]
        // },
        // { //Inst8
        //     id: "installations",
        //     title: "Cochez la case de l'installation si mise en oeuvre et précisez la puissance ou la surface demandée",
        //     fields: [
        //         {
        //             id: "installations",
        //             label: "",
        //             type: "options",
        //             isStepMultiOptions: true,
        //             items: [
        //                 {
        //                     label: 'Chaudière à condensation',
        //                     value: 'Chaudière à condensation',
        //                     icon: faCheckCircle,
        //                     pdfConfig: { dx: -544, dy: - 634, pageIndex: 1, squareSize: 8 },
        //                 },
        //                 {
        //                     label: 'Non installé, passer.',
        //                     value: '',
        //                     skip: true,
        //                     icon: faCheckCircle,
        //                     pdfConfig: { skip: true },
        //                     rollBack: {
        //                         fields: [
        //                             { id: "installations", type: "array", value: "Chaudière à condensation" },
        //                             { id: "condensingBoilerPower", type: "string" },
        //                             { id: "condensingBoilerDeviceType", type: "string" }
        //                         ]
        //                     }
        //                 },
        //             ],
        //         },
        //         {
        //             id: "condensingBoilerPower",
        //             type: "textInput",
        //             isNumeric: true,
        //             label: "Puissance (en kW)",
        //             errorId: "condensingBoilerPowerError",
        //             isConditional: true,
        //             condition: { with: "installations", values: ["Chaudière à condensation"] },
        //             pdfConfig: { dx: -190, dy: - 634, pageIndex: 1 },
        //             mendatory: true,
        //         },
        //         {
        //             id: "condensingBoilerDeviceType",
        //             type: "picker",
        //             items: [
        //                 { label: "Choisir", value: "", pdfConfig: { skip: true } },
        //                 { label: "Gaz", value: "Gaz", pdfConfig: { dx: -545, dy: - 660, pageIndex: 1, squareSize: 12 } },
        //                 { label: "Fioul", value: "Fioul", pdfConfig: { dx: -516, dy: - 660, pageIndex: 1, squareSize: 12 } },
        //             ],
        //             label: "Type d'appareil",
        //             mendatory: true,
        //             errorId: "condensingBoilerDeviceTypeError",
        //             isConditional: true,
        //             condition: { with: "installations", values: ["Chaudière à condensation"] },
        //         },
        //     ]
        // },
        // { //5
        //     id: "appreciation",
        //     title: "Appréciation de la prestation",
        //     fields: [
        //         {
        //             id: "appreciation",
        //             label: "Qualité globale de la prestation",
        //             type: "options",
        //             items: [
        //                 {
        //                     label: 'Très satisfaisante',
        //                     value: 'Très satisfaisante',
        //                     icon: faCheckCircle,
        //                     pdfConfig: { dx: -340, dy: - 723, pageIndex: 1, squareSize: 10 },
        //                 },
        //                 {
        //                     label: 'Satisfaisante',
        //                     value: 'Satisfaisante',
        //                     icon: faCheckCircle,
        //                     pdfConfig: { dx: -257, dy: - 723, pageIndex: 1, squareSize: 12 },
        //                 },
        //                 {
        //                     label: 'Peu satisfaisante',
        //                     value: 'Peu satisfaisante',
        //                     icon: faCheckCircle,
        //                     pdfConfig: { dx: -176, dy: - 723, pageIndex: 1, squareSize: 12 },
        //                 },
        //                 {
        //                     label: 'Insatisfaisante',
        //                     value: 'Insatisfaisante',
        //                     icon: faCheckCircle,
        //                     pdfConfig: { dx: -94, dy: - 723, pageIndex: 1, squareSize: 12 },
        //                 },
        //             ],
        //             mendatory: true,
        //         },
        //     ],
        //     isLast: true
        // },
    ]

    return { model, globalConfig }
}

export const mandatSynergysModel = () => {

    const globalConfig = {
        rectangles: [
            {
                pageIndex: 0,
                form: {
                    x: 50,
                    y: 380,
                    width: 85,
                    height: 20,
                    color: rgb(1, 1, 1),
                    opacity: 1,
                }
            },
            {
                pageIndex: 0,
                form: {
                    x: 295,
                    y: 380,
                    width: 85,
                    height: 20,
                    color: rgb(1, 1, 1),
                    opacity: 1,
                }
            },
            {
                pageIndex: 0,
                form: {
                    x: 50,
                    y: 140,
                    width: 85,
                    height: 20,
                    color: rgb(1, 1, 1),
                    opacity: 1,
                }
            },
        ],
        signaturePositions: [
            { pageIndex: 0, dx: 300, dy: 300 }
        ]
    }

    const model = [
        { //1 
            id: "service",
            title: "PRESTATION",
            fields: [
                {
                    id: "serviceProvider",
                    label: "Synergys ou Sous-Traitance",
                    type: "options",
                    items: [
                        { label: 'Synergys', value: 'Synergys', icon: faCheckCircle, pdfConfig: { dx: -471, dy: - 174, squareSize: 12, pageIndex: 0 } },
                        { label: 'Sous-Traitance', value: 'Sous-Traitance', icon: faCheckCircle, pdfConfig: { dx: -278, dy: - 174, squareSize: 12, pageIndex: 0 } },
                    ],
                    errorId: "serviceProviderError",
                    mendatory: true,
                }
            ],
            isFirst: true,
            stepIndex: 0,
        },
        { //2
            id: "service",
            title: "PRESTATION",
            fields: [
                {
                    id: "serviceType",
                    label: "Type de prestation",
                    type: "options",
                    items: [
                        {
                            label: 'Installation',
                            value: 'Installation (Synergys)',
                            icon: faCheckCircle,
                            pdfConfig: { dx: -444, dy: - 197, squareSize: 8, pageIndex: 0 },
                            isConditional: true,
                            condition: { with: "serviceProvider", values: ["Synergys"] },
                        },
                        {
                            label: 'SAV',
                            value: 'SAV (Synergys)',
                            icon: faCheckCircle,
                            pdfConfig: { dx: -362, dy: - 197, squareSize: 8, pageIndex: 0 },
                            isConditional: true,
                            condition: { with: "serviceProvider", values: ["Synergys"] },
                        },
                        {
                            label: 'Installation',
                            value: 'Installation (Sous-Traitance)',
                            icon: faCheckCircle,
                            pdfConfig: { dx: -252, dy: - 197, squareSize: 8, pageIndex: 0 },
                            isConditional: true,
                            condition: { with: "serviceProvider", values: ["Sous-Traitance"] },
                        },
                        {
                            label: 'SAV',
                            value: 'SAV (Sous-Traitance)',
                            icon: faCheckCircle,
                            pdfConfig: { dx: -169, dy: - 197, squareSize: 8, pageIndex: 0 },
                            isConditional: true,
                            condition: { with: "serviceProvider", values: ["Sous-Traitance"] },
                        },
                    ],
                    errorId: "serviceTypeError",
                    mendatory: true,
                }
            ],
            isConditional: true,
            condition: { with: "serviceProvider", values: ["Synergys"] },
        },
        { //3
            id: "service",
            title: "PRESTATION",
            fields: [
                {
                    id: "productTypes",
                    label: "Type de produits",
                    type: "options",
                    isMultiOptions: true,
                    items: [
                        { label: 'PAC AIR/EAU', value: 'PAC AIR/EAU', icon: faCheckCircle, pdfConfig: { dx: -533, dy: - 253, squareSize: 8, pageIndex: 0 } },
                        { label: 'PAC AIR/AIR', value: 'PAC AIR/AIR', icon: faCheckCircle, pdfConfig: { dx: -430, dy: - 253, squareSize: 8, pageIndex: 0 } },
                        { label: 'PHOTOVOLTAÏQUE', value: 'PHOTOVOLTAÏQUE', icon: faCheckCircle, pdfConfig: { dx: -320, dy: - 253, squareSize: 8, pageIndex: 0 } },
                        { label: 'ISOLATION', value: 'ISOLATION', icon: faCheckCircle, pdfConfig: { dx: -183, dy: - 252, squareSize: 8, pageIndex: 0 } },
                        { label: 'CHAUFFE-EAU THERMODYNAMIQUE', value: 'CHAUFFE-EAU THERMODYNAMIQUE', icon: faCheckCircle, pdfConfig: { dx: -533, dy: - 271, squareSize: 8, pageIndex: 0 } },
                        { label: 'VMC', value: 'VMC', icon: faCheckCircle, pdfConfig: { dx: -320, dy: - 271, squareSize: 8, pageIndex: 0 } },
                    ],
                    errorId: "productTypesError",
                    mendatory: true,
                }
            ],
            isLast: true
        },
        {//2 DONE
            id: "client",
            title: "COORDONNÉES CLIENT",
            fields: [
                {
                    id: "clientFirstName",
                    type: "textInput",
                    maxLength: 15,
                    label: "Prénom",
                    errorId: "clientFirstNameError",
                    pdfConfig: { dx: -490, dy: - 339, pageIndex: 0 }, //add spaces
                    mendatory: true
                },
                {
                    id: "clientLastName",
                    type: "textInput",
                    maxLength: 24,
                    label: "Nom",
                    errorId: "clientLastNameError", //add max lenght
                    pdfConfig: { dx: -235, dy: - 339, pageIndex: 0 }, //add spaces
                    mendatory: true
                },
            ],
            isFirst: true,
            stepIndex: 1,
        },
        {//2 DONE
            id: "client",
            title: "ADRESSE",
            fields: [
                {
                    id: "addressClient",
                    type: "textInput",
                    label: "Adresse",
                    errorId: "addressClientError",
                    maxLength: 100,
                    pdfConfig: { dx: -475, dy: - 374, pageIndex: 0 }, //add spaces
                    mendatory: true,
                },
            ],
        },
        // {//2 DONE
        //     id: "client",
        //     title: "COORDONNÉES CLIENT",
        //     fields: [
        //         {
        //             id: "addressCodeClient",
        //             type: "textInput",
        //             mask: "[0][0][0][0][0]",
        //             label: "Code Postal",
        //             isNumeric: true,
        //             errorId: "addressCodeClientError",
        //             mendatory: true,
        //             pdfConfig: { dx: -453, dy: - 445, pageIndex: 0 }
        //         },
        //     ]
        // },
        // {//2 DONE
        //     id: "client",
        //     title: "COORDONNÉES CLIENT",
        //     fields: [
        //         {
        //             id: "addressCityClient",
        //             type: "textInput",
        //             label: "Ville",
        //             errorId: "addressCityClientError",
        //             mendatory: true,
        //             pdfConfig: { dx: -257, dy: - 445, pageIndex: 0 }
        //         },
        //     ]
        // },
        {//2 DONE
            id: "client",
            title: "COORDONNÉES CLIENT",
            fields: [
                {
                    id: "fixedPhoneClient",
                    type: "textInput",
                    mask: "[00][00][00][00][00]",
                    isNumeric: true,
                    label: "Téléphone fixe",
                    errorId: "fixedPhoneClientError",
                    pdfConfig: { dx: -500, dy: - 487, pageIndex: 0 }
                },
                {
                    id: "mobilePhoneClient",
                    type: "textInput",
                    mask: "[00][00][00][00][00]",
                    isNumeric: true,
                    label: "Téléphone mobile",
                    errorId: "mobilePhoneClientError",
                    mendatory: true,
                    pdfConfig: { dx: -260, dy: - 487, pageIndex: 0 }
                },
            ]
        },
        {//37
            id: "client",
            title: "COORDONNÉES CLIENT",
            fields: [
                {
                    id: "emailClient",
                    type: "textInput",
                    isEmail: true,
                    label: "Adresse email",
                    errorId: "emailClientError",
                    mendatory: true,
                    pdfConfig: { dx: -500, dy: - 530, pageIndex: 0, splitArobase: true }
                },
            ],
            isLast: true
        },
        {//37
            id: "client",
            title: "COORDONNÉES CLIENT",
            fields: [
                {
                    id: "isSiteInfoEqualToClientInfo",
                    label: "Est-ce que les coordonnées du chantier et du client sont identiques ?",
                    type: "options",
                    items: [
                        {
                            label: 'Oui',
                            value: 'Oui',
                            icon: faCheck,
                            iconColor: "green",
                            pdfConfig: { skip: true },
                            autoCopy: [
                                { id: "siteName", copyFrom: "clientLastName" },
                                { id: "addressSite", copyFrom: "addressClient" },
                                { id: "addressCodeSite", copyFrom: "addressCodeClient" },
                                { id: "phoneSite", copyFrom: "mobilePhoneClient" },
                                { id: "emailSite", copyFrom: "emailClient" },
                            ]
                        },
                        {
                            label: 'Non',
                            value: 'Non',
                            icon: faTimes,
                            iconColor: theme.colors.error,
                            pdfConfig: { skip: true }
                        },
                    ],
                    errorId: "isSiteInfoEqualToClientInfoError",
                    mendatory: true
                },
            ]
        },
        {//37
            id: "site",
            title: "COORDONNÉES CHANTIER",
            fields: [
                {
                    id: "siteName",
                    type: "textInput",
                    maxLength: 15,
                    label: "Nom",
                    errorId: "siteNameError",
                    pdfConfig: { dx: -492, dy: - 587, pageIndex: 0 }, //add spaces
                    mendatory: true,
                    isConditional: true,
                    condition: { with: "isSiteInfoEqualToClientInfo", values: ["Non"] },
                }
            ]
        },
        {//37
            id: "site",
            title: "COORDONNÉES CHANTIER",
            fields: [
                {
                    id: "addressSite",
                    type: "textInput",
                    label: "Adresse",
                    errorId: "addressSiteError",
                    maxLength: 40,
                    pdfConfig: { dx: -480, dy: - 622, pageIndex: 0 }, //add spaces
                    mendatory: true,
                    isConditional: true,
                    condition: { with: "isSiteInfoEqualToClientInfo", values: ["Non"] },
                }
            ]
        },
        // {//2 DONE
        //     id: "site",
        //     title: "COORDONNÉES CHANTIER",
        //     fields: [
        //         {
        //             id: "addressCodeSite",
        //             type: "textInput",
        //             mask: "[0][0][0][0][0]",
        //             label: "Code Postal",
        //             isNumeric: true,
        //             errorId: "addressCodeSiteError",
        //             mendatory: true,
        //             isConditional: true,
        //             condition: { with: "isSiteInfoEqualToClientInfo", values: ["Non"] },
        //             pdfConfig: { dx: -455, dy: - 693, pageIndex: 0 }
        //         }
        //     ]
        // },
        {//2 DONE
            id: "site",
            title: "COORDONNÉES CHANTIER",
            fields: [
                {
                    id: "phoneSite",
                    type: "textInput",
                    mask: "[00][00][00][00][00]",
                    isNumeric: true,
                    label: "Téléphone mobile",
                    errorId: "phoneSiteError",
                    mendatory: true,
                    isConditional: true,
                    condition: { with: "isSiteInfoEqualToClientInfo", values: ["Non"] },
                    pdfConfig: { dx: -500, dy: - 737, pageIndex: 0 }
                },
            ]
        },
        {//2 DONE
            id: "site",
            title: "COORDONNÉES CHANTIER",
            fields: [
                {
                    id: "emailSite",
                    type: "textInput",
                    isEmail: true,
                    label: "Adresse email",
                    errorId: "emailSiteError",
                    mendatory: true,
                    isConditional: true,
                    condition: { with: "isSiteInfoEqualToClientInfo", values: ["Non"] },
                    pdfConfig: { dx: -502, dy: - 779, pageIndex: 0 }
                },
            ]
        },
        {
            id: "site",
            title: "FINANCEMENT",
            fields: [
                {
                    id: "financingAids",
                    label: "A sélectionner si présent",
                    type: "options",
                    isMultiOptions: true,
                    items: [
                        { label: 'ACTION LOGEMENT', value: 'ACTION LOGEMENT', icon: faCheckCircle, pdfConfig: { dx: -267, dy: - 615, pageIndex: 0 } },
                        { label: 'CHEQUE REGION', value: 'CHEQUE REGION', icon: faCheckCircle, pdfConfig: { dx: -267, dy: - 648, pageIndex: 0 } },
                        { label: 'MA PRIME RENOV', value: 'MA PRIME RENOV', icon: faCheckCircle, pdfConfig: { dx: -267, dy: - 684, pageIndex: 0 } }, //#task scroll to error offset_y
                        { label: 'CEE', value: 'CEE', icon: faCheckCircle, pdfConfig: { dx: -267, dy: - 719, pageIndex: 0 } }, //#task scroll to error offset_y
                        { label: 'FINANCEMENT', value: 'FINANCEMENT', icon: faCheckCircle, pdfConfig: { dx: -267, dy: - 754, pageIndex: 0 } }, //#task scroll to error offset_y
                    ],
                    style: { marginTop: 100 },
                    // isConditional: true,
                    // condition: { with: "isSiteInfoEqualToClientInfo", values: ["Oui"] },
                },
            ],
            isLast: true
        },
    ]

    return { model, globalConfig }
}



//VERSIONNING:

// export const pvReceptionModels = {
//     { model: pvReceptionModel1(), version: 1 }  
// }

// ---> find where version is MAX