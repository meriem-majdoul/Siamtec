
import { faCheck, faTimes, faCheckCircle } from "react-native-fontawesome";
import * as theme from '../../theme'

import moment from 'moment';
import 'moment/locale/fr'
moment.locale('fr')

export const checklistPAAModel = (params) => {

    const { pageIndex, clientName } = params

    const model = [
        {//0
            id: "metaDataPAA",
            title: "PAC AIR/EAU - Partie Electrique",
            fields: [
                {
                    id: "clientName",
                    type: "autogen",
                    value: clientName,
                    pdfConfig: { dx: -300, dy: - 18, pageIndex }
                },
                {
                    id: "vtDate",
                    type: "autogen",
                    value: moment().format('DD/MM/YYYY'),
                    pdfConfig: { dx: -287, dy: - 33, pageIndex },
                },
            ],
            isFirstSubStep: true
        },
        {//1
            id: "counterPowerPAA",
            subStep: { id: "paa", label: "PAC AIR/AIR" },
            title: "PAC AIR/AIR - Partie Electrique",
            fields: [{
                id: "counterPowerPAA",
                label: "Puissance du compteur",
                type: "options",
                errorId: "counterPowerPAAError",
                items: [
                    { label: 'Monophasé', value: 'Monophasé', icon: faCheckCircle, pdfConfig: { dx: -312, dy: - 96, pageIndex } },
                    { label: 'Triphasé', value: 'Triphasé', icon: faCheckCircle, pdfConfig: { dx: -197, dy: - 96, pageIndex } },
                ],
                mendatory: true,
            }]
        },
        {//2
            id: "powerCablePAA1",
            title: "PAC AIR/AIR - Partie Electrique",
            fields: [
                {
                    id: "powerCableTypePAA",
                    type: "textInput",
                    label: "Type câble d'alimentation",
                    errorId: "powerCableTypePAAError",
                    mendatory: true,
                    pdfConfig: { dx: -400, dy: - 132, pageIndex }
                },
                {
                    id: "powerCableLengthPAA",
                    type: "textInput",
                    isNumeric: true,
                    label: "Longueur câble d'alimentation",
                    errorId: "powerCableLengthPAAError",
                    mendatory: true,
                    pdfConfig: { dx: -382, dy: - 155, pageIndex }
                },
            ]
        },
        {//3
            id: "powerCablePAA2",
            title: "PAC AIR/AIR - Partie Electrique",
            fields: [
                {
                    id: "powerCableSourcePAA",
                    label: "Câble d'alimentation",
                    type: "options",
                    errorId: "powerCableSourcePAAError",
                    items: [
                        { label: 'Existant', value: 'Existant', icon: faCheckCircle, pdfConfig: { dx: -392, dy: - 196, pageIndex } },
                        { label: 'A tirer', value: 'A tirer', icon: faCheckCircle, pdfConfig: { dx: -306, dy: - 196, pageIndex } },
                    ],
                    mendatory: true,
                },
                {
                    id: "powerCableSectionPAA",
                    type: "textInput",
                    label: "Section",
                    errorId: "powerCableSectionPAAError",
                    mendatory: true,
                    pdfConfig: { dx: -195, dy: - 196, pageIndex }
                },
            ]
        },
        {//4
            id: "splitLocationPAA",
            title: "PAC AIR/AIR - Partie Emplacement",
            fields: [
                {
                    id: "splitLocationPAA",
                    type: "textInput",
                    label: "Emplacement Split",
                    errorId: "splitLocationPAAError",
                    mendatory: true,
                    pdfConfig: { dx: -421, dy: - 277, pageIndex }
                },
            ]
        },
        {//5
            id: "isMultiSplit",
            title: "PAC AIR/AIR - Partie Emplacement",
            fields: [
                {
                    id: "multiSplitLocationPAA",
                    type: "textInput",
                    label: "Si Multi-Split, Emplacement Split",
                    errorId: "multiSplitLocationPAAError",
                    pdfConfig: { dx: -323, dy: - 339, pageIndex }
                },
                {
                    id: "multiSplitLinksTypePAA",
                    type: "textInput",
                    label: "Si Multi-Split, Type de liaisons",
                    errorId: "multiSplitLinksTypePAAError",
                    pdfConfig: { dx: -110, dy: - 339, pageIndex }
                },
            ]
        },
        {//6
            id: "sumpPumpsCountPAA",

            title: "PAC AIR/AIR - Partie Emplacement",
            fields: [
                {
                    id: "sumpPumpsCountPAA",
                    type: "textInput",
                    isNumeric: true,
                    label: "Nombre de pompes de relevage",
                    mendatory: true,
                    errorId: "sumpPumpsCountPAAError",
                    pdfConfig: { dx: -420, dy: - 380, pageIndex }
                },
            ]
        },
        {//7
            id: "bracketTypePAA",

            title: "PAC AIR/AIR - Partie Groupe Ext.",
            fields: [
                {
                    id: "bracketTypePAA",
                    label: "Type de support",
                    type: "options",
                    items: [
                        { label: "Au sol", value: "Au sol", icon: faCheckCircle, pdfConfig: { dx: -484, dy: -450, pageIndex } },
                        { label: "Support mural classique", value: "Support mural classique", icon: faCheckCircle, pdfConfig: { dx: -370, dy: - 450, pageIndex } },
                        { label: "Support mural mupro", value: "Support mural mupro", icon: faCheckCircle, pdfConfig: { dx: -200, dy: - 450, pageIndex } },
                    ],
                    mendatory: true,
                    errorId: "bracketTypePAAError",
                    pdfConfig: { dx: -450, dy: - 305, pageIndex }
                },
            ]
        },
        {//8
            id: "GELocationPAA",

            title: "PAC AIR/AIR - Partie Emplacement",
            fields: [
                {
                    id: "GELocationPAA",
                    type: "textInput",
                    label: "Emplacement GE",
                    mendatory: true,
                    errorId: "GELocationPAAError",
                    pdfConfig: { dx: -180, dy: - 512, pageIndex }
                },
            ]
        },
        {//8.1
            id: "capacitorDrainingPAA",

            title: "PAC AIR/AIR - Partie Groupe Ext.",
            fields: [
                {
                    id: "capacitorDrainingPAA",
                    type: "textInput",
                    label: "Evacuation condensateur",
                    mendatory: true,
                    errorId: "capacitorDrainingPAAError",
                    pdfConfig: { dx: -420, dy: - 553, pageIndex }
                },
            ]
        },
        {//9
            id: "linksPassagePAA",

            title: "PAC AIR/AIR - Partie Frigorifique",
            fields: [
                {
                    id: "linksPassagePAA",
                    type: "textInput",
                    label: "Passage des liaisons",
                    errorId: "linksPassagePAAError",
                    mendatory: true,
                    pdfConfig: { dx: -420, dy: - 600, pageIndex }
                },
            ]
        },
        {//10
            id: "linksLengthPAA",

            title: "PAC AIR/AIR - Partie Frigorifique",
            fields: [
                {
                    id: "linksLengthPAA",
                    type: "textInput",
                    label: "Longueur des liaisons",
                    errorId: "linksLengthPAAError",
                    mendatory: true,
                    pdfConfig: { dx: -420, dy: - 639, pageIndex }
                },
            ]
        },
        {//11
            id: "chuteTypePAA",

            title: "PAC AIR/AIR - Partie Frigorifique",
            fields: [
                {
                    id: "chuteTypePAA",
                    type: "textInput",
                    label: "Type de goulotte",
                    errorId: "chuteTypePAAError",
                    mendatory: true,
                    pdfConfig: { dx: -420, dy: - 678, pageIndex }
                },
            ]
        },
        {//12
            id: "chuteLengthPAA",

            title: "PAC AIR/AIR - Partie Frigorifique",
            fields: [
                {
                    id: "chuteLengthPAA",
                    type: "textInput",
                    label: "Longueur de goulotte",
                    isNumeric: true,
                    errorId: "chuteLengthPAAError",
                    mendatory: true,
                    pdfConfig: { dx: -420, dy: - 714, pageIndex }
                },
            ]
        },
        {//13
            id: "noticePAA",

            title: "PAC AIR/AIR - Remarques",
            fields: [
                {
                    id: "noticePAA",
                    type: "textInput",
                    label: "Remarques",
                    errorId: "noticePAAError",
                    pdfConfig: { dx: -421, dy: - 775, pageIndex }
                },
            ]
        },
        {//14
            id: "materialPropositionPAA",

            title: "PAC AIR/AIR - Remarques",
            fields: [
                {
                    id: "materialPropositionPAA",
                    type: "textInput",
                    label: "Proposition matériel adéquat si refus VT",
                    errorId: "materialPropositionPAAError",
                    pdfConfig: { dx: -421, dy: - 812, pageIndex }
                },
            ],
            isLastSubStep: true
        },
    ]

    return { model }
}