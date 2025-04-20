
import { faCheck, faTimes, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import * as theme from '../../theme'

import moment from 'moment';
import 'moment/locale/fr'
moment.locale('fr')

export const checklistPVModel = (params) => {

    const { pageIndex, clientName } = params

    const model = [
        {//0
            id: "metaDataBS",
            title: "",
            fields: [
                {
                    id: "clientName",
                    type: "autogen",
                    value: clientName,
                    pdfConfig: { dx: -275, dy: - 42, pageIndex }
                },
                {
                    id: "vtDate",
                    type: "autogen",
                    value: moment().format('DD/MM/YYYY'),
                    pdfConfig: { dx: -265, dy: - 60, pageIndex },
                },
            ],
            isFirstSubStep: true
        },
        {//1
            id: "panelTotalPowerPV",
            subStep: { id: "pv", label: "Photovoltaïque" },
            title: "PV - Partie Electrique",
            fields: [
                {
                    id: "panelTotalPowerPV",
                    type: "textInput",
                    isNumeric: true,
                    label: "Puissance totale des panneaux",
                    errorId: "panelTotalPowerPVError",
                    mendatory: true,
                    pdfConfig: { dx: -420, dy: - 129, pageIndex }
                },
            ]
        },
        {//2
            id: "counterLocationPV",
            title: "PV - Partie Electrique",
            fields: [
                {
                    id: "counterLocationPV",
                    type: "textInput",
                    label: "Emplacement compteur",
                    errorId: "counterLocationPVError",
                    mendatory: true,
                    pdfConfig: { dx: -420, dy: - 166, pageIndex }
                },
            ]
        },
        {//3
            id: "phaseTypePV",
            title: "PV - Partie Electrique",
            fields: [
                {
                    id: "phaseTypePV",
                    label: "Type de phase",
                    type: "options",
                    items: [
                        { label: 'Monophasé', value: 'Monophasé', icon: faCheckCircle, pdfConfig: { dx: -321, dy: - 205, pageIndex } },
                        { label: 'Triphasé', value: 'Triphasé', icon: faCheckCircle, pdfConfig: { dx: -169, dy: - 205, pageIndex } },
                    ],
                    errorId: "phaseTypePVError",
                    mendatory: true
                },
            ]
        },
        {//4
            id: "counterSubPowerPV",
            title: "PV - Partie Electrique",
            fields: [
                {
                    id: "counterSubPowerPV",
                    type: "textInput",
                    isNumeric: true,
                    label: "Puissance abonnement compteur",
                    errorId: "counterSubPowerPVError",
                    mendatory: true,
                    pdfConfig: { dx: -200, dy: - 243, pageIndex }
                },
            ]
        },
        {//5
            id: "groundResistancePV",
            title: "PV - Partie Electrique",
            fields: [
                {
                    id: "groundResistancePV",
                    type: "textInput",
                    isNumeric: true,
                    label: "Résistance à la terre",
                    errorId: "groundResistancePVError",
                    mendatory: true,
                    pdfConfig: { dx: -205, dy: - 282, pageIndex }
                },
            ]
        },
        {//6
            id: "inverterTypesPV",
            title: "PV - Partie Technique",
            fields: [
                {
                    id: "inverterTypesPV",
                    label: "Types d'onduleurs",
                    type: "options",
                    isMultiOptions: true,
                    items: [
                        { label: 'Central', value: 'Central', icon: faCheckCircle, pdfConfig: { dx: -334, dy: - 342, pageIndex } },
                        { label: 'Micro onduleur', value: 'Micro onduleur', icon: faCheckCircle, pdfConfig: { dx: -264, dy: - 342, pageIndex } },
                        { label: 'Solaredge', value: 'Solaredge', icon: faCheckCircle, pdfConfig: { dx: -163, dy: - 342, pageIndex } },
                    ],
                    errorId: "inverterTypesPVError",
                    mendatory: true
                },
            ]
        },
        {//7
            id: "inverterCountPV",
            title: "PV - Partie Technique",
            fields: [
                {
                    id: "inverterCountPV",
                    type: "textInput",
                    isNumeric: true,
                    label: "Nombre d'onduleurs",
                    errorId: "inverterCountPVError",
                    mendatory: true,
                    pdfConfig: { dx: -420, dy: - 381, pageIndex }
                },
            ]
        },
        {//8
            id: "inverterPowerPV",
            title: "PV - Partie Technique",
            fields: [
                {
                    id: "inverterPowerPV",
                    type: "textInput",
                    isNumeric: true,
                    label: "Puissance onduleur",
                    errorId: "inverterPowerPVError",
                    mendatory: true,
                    pdfConfig: { dx: -420, dy: - 420, pageIndex }
                },
            ]
        },
        {//9
            id: "orientationPV",
            title: "PV - Partie Emplacement",
            fields: [
                {
                    id: "orientationPV",
                    label: "Orientation du champ photovoltaîque",
                    type: "options",
                    items: [
                        { label: 'Portrait', value: 'Portrait', icon: faCheckCircle, pdfConfig: { dx: -323, dy: - 479, pageIndex } },
                        { label: 'Paysage', value: 'Paysage', icon: faCheckCircle, pdfConfig: { dx: -165, dy: - 479, pageIndex } },
                    ],
                    errorId: "orientationPVError",
                    mendatory: true
                },
            ]
        },
        {//10
            id: "columnsCountPV",
            title: "PV - Partie Emplacement",
            fields: [
                {
                    id: "columnsCountPV",
                    type: "textInput",
                    isNumeric: true,
                    label: "Nombre de colonnes",
                    errorId: "columnsCountPVPVError",
                    mendatory: true,
                    pdfConfig: { dx: -421, dy: - 520, pageIndex }
                },
            ]
        },
        {//11
            id: "linesCountPV",
            title: "PV - Partie Emplacement",
            fields: [
                {
                    id: "linesCountPV",
                    type: "textInput",
                    isNumeric: true,
                    label: "Nombre de lignes",
                    errorId: "linesCountPVError",
                    mendatory: true,
                    pdfConfig: { dx: -421, dy: - 557, pageIndex }
                },
            ]
        },
        {//12
            id: "solarMaskPV",
            title: "PV - Partie Emplacement",
            fields: [
                {
                    id: "solarMaskPV",
                    type: "textInput",
                    label: "Masque solaire",
                    mendatory: true,
                    errorId: "solarMaskPVError",
                    pdfConfig: { dx: -421, dy: - 598, pageIndex }
                },
            ]
        },
        {//13
            id: "calpinagePV",
            title: "PV - Partie Emplacement",
            fields: [
                {
                    id: "calpinagePV",
                    type: "textInput",
                    label: "Calpinage",
                    errorId: "calpinagePVError",
                    mendatory: true,
                    pdfConfig: { dx: -420, dy: - 633, pageIndex }
                },
            ]
        },
        {//14
            id: "panelsLocationPV",
            title: "PV - Partie Emplacement",
            fields: [
                {
                    id: "panelsLocationPV",
                    type: "textInput",
                    label: "Emplacemment panneaux",
                    errorId: "panelsLocationPVError",
                    mendatory: true,
                    pdfConfig: { dx: -420, dy: - 672, pageIndex }
                },
            ]
        },
        {//15
            id: "commentsPV",
            title: "PV - Partie Emplacement",
            fields: [
                {
                    id: "commentsPV",
                    type: "textInput",
                    label: "Commentaires",
                    errorId: "commentsPVError",
                    pdfConfig: { dx: -421, dy: - 740, pageIndex }
                },
            ]
        },
        {//16
            id: "noticePV",
            title: "PV - Partie Emplacement",
            fields: [
                {
                    id: "noticePV",
                    type: "textInput",
                    label: "Remarque",
                    errorId: "noticePVError",
                    pdfConfig: { dx: -421, dy: - 791, pageIndex }
                },
            ],
            isLastSubStep: true
        },
    ]

    return { model }
}