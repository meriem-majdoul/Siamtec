
import { faCheck, faTimes, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import * as theme from '../../theme'

import moment from 'moment';
import 'moment/locale/fr'
moment.locale('fr')

export const checklistBSModel = (params) => {

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
                    pdfConfig: { dx: -275, dy: - 30, pageIndex }
                },
                {
                    id: "vtDate",
                    type: "autogen",
                    value: moment().format('DD/MM/YYYY'),
                    pdfConfig: { dx: -265, dy: - 48, pageIndex },
                },
            ],
            isFirstSubStep: true
        },
        {//1
            id: "isPowerCableBS",
            subStep: { id: "bs", label: "Ballon solaire" },
            title: "BALLON SOLAIRE - Partie Electrique",
            fields: [
                {
                    id: "isPowerCableBS",
                    label: "Câble d’alimentation présent ?",
                    type: "options",
                    items: [
                        { label: 'Non', value: 'Non', icon: faTimes, iconColor: theme.colors.error, pdfConfig: { dx: -172, dy: - 116, pageIndex } },
                        { label: 'Oui', value: 'Oui', icon: faCheck, iconColor: "green", pdfConfig: { dx: -290, dy: - 116, pageIndex } },
                    ],
                    errorId: "isPowerCableBSError",
                    mendatory: true
                },
            ]
        },
        {//2
            id: "tubeDiameterBS",
            title: "BALLON SOLAIRE - Partie Hydraulique",
            fields: [
                {
                    id: "tubeDiameterEFBS",
                    type: "textInput",
                    isNumeric: true,
                    label: "Diamètre tube EF",
                    errorId: "tubeDiameterEFError",
                    mendatory: true,
                    pdfConfig: { dx: -260, dy: - 220, pageIndex }
                },
                {
                    id: "tubeDiameterECSBS",
                    type: "textInput",
                    isNumeric: true,
                    label: "Diamètre tube ECS",
                    errorId: "tubeDiameterECSError",
                    mendatory: true,
                    pdfConfig: { dx: -140, dy: - 220, pageIndex }
                },
            ]
        },
        {//3
            id: "tubeMaterialsBS",
            title: "BALLON SOLAIRE - Partie Hydraulique",
            fields: [
                {
                    id: "tubeMaterialsBS",
                    label: "Matériaux des tubes",
                    type: "options",
                    items: [
                        { label: "Acier", value: "Acier", icon: faCheckCircle, pdfConfig: { dx: -419, dy: -261, pageIndex } },
                        { label: "Cuivre", value: "Cuivre", icon: faCheckCircle, pdfConfig: { dx: -314, dy: - 261, pageIndex } },
                        { label: "Plastique", value: "Plastique", icon: faCheckCircle, pdfConfig: { dx: -218, dy: - 261, pageIndex } },
                    ],
                    mendatory: true,
                    errorId: "tubeMaterialsBSError",
                    pdfConfig: { dx: -450, dy: - 305, pageIndex }
                },
            ]
        },
        {//4
            id: "PVCdrainingBS",
            title: "BALLON SOLAIRE - Partie Hydraulique",
            fields: [
                {
                    id: "PVCdrainingToDoBS",
                    type: "options",
                    items: [
                        { label: "À faire", value: "À faire", icon: faCheckCircle, pdfConfig: { dx: -309, dy: - 301, pageIndex } },
                    ],
                    label: "Evacuation PVC existante",
                    errorId: "PVCdrainingToDoBSError",
                },
                {
                    id: "PVCdrainingDiameterBS",
                    type: "textInput",
                    label: "Diamètre",
                    isNumeric: true,
                    errorId: "PVCdrainingDiameterBSError",
                    mendatory: true,
                    pdfConfig: { dx: -120, dy: - 301, pageIndex }
                },
            ]
        },
        {//5
            id: "isDoubleTubeBS",
            title: "BALLON SOLAIRE - Partie Hydraulique",
            fields: [
                {
                    id: "isDoubleTubeBS",
                    label: "Tube en doublage",
                    type: "options",
                    items: [
                        { label: 'Non', value: 'Non', icon: faTimes, iconColor: theme.colors.error, pdfConfig: { dx: -146, dy: - 342, pageIndex } },
                        { label: 'Oui', value: 'Oui', icon: faCheck, iconColor: "green", pdfConfig: { dx: -315, dy: - 342, pageIndex } },
                    ],
                    errorId: "isDoubleTubeBSError",
                    mendatory: true
                },
            ]
        },
        {//6
            id: "isSpaceEnoughBS",
            title: "BALLON SOLAIRE - Partie Emplacement",
            fields: [
                {
                    id: "isSpaceEnoughBS",
                    type: "textInput",
                    label: "Vérifier espace suffisant pour emplacement ballon",
                    errorId: "isSpaceEnoughBSError",
                    mendatory: true,
                    pdfConfig: { dx: -420, dy: - 399, pageIndex }
                },
            ]
        },
        {//7
            id: "linksPassageBS",
            title: "BALLON SOLAIRE - Partie Emplacement",
            fields: [
                {
                    id: "linksPassageBS",
                    type: "textInput",
                    label: "Passage des liaisons, longueur",
                    errorId: "linksPassageBSError",
                    mendatory: true,
                    pdfConfig: { dx: -420, dy: - 447, pageIndex }
                },
            ]
        },
        {//8
            id: "sensorsNumberBS",
            title: "BALLON SOLAIRE - Capteur(s) Solaire",
            fields: [
                {
                    id: "sensorsNumberBS",
                    type: "textInput",
                    label: "Nombre de capteur solaire",
                    isNumeric: true,
                    errorId: "sensorsNumberBSError",
                    mendatory: true,
                    pdfConfig: { dx: -420, dy: - 511, pageIndex }
                },
            ]
        },
        {//9
            id: "calpinageBS",
            title: "BALLON SOLAIRE - Capteur(s) Solaire",
            fields: [
                {
                    id: "calpinageBS",
                    type: "textInput",
                    label: "Calpinage",
                    errorId: "calpinageBSError",
                    mendatory: true,
                    pdfConfig: { dx: -420, dy: - 552, pageIndex }
                },
            ]
        },
        {//10
            id: "sensorLocationBS",
            title: "BALLON SOLAIRE - Capteur(s) Solaire",
            fields: [
                {
                    id: "sensorLocationBS",
                    type: "textInput",
                    label: "Emplacement capteur",
                    errorId: "sensorLocationBSError",
                    mendatory: true,
                    pdfConfig: { dx: -420, dy: - 592, pageIndex }
                },
            ]
        },
        {//11
            id: "orientationCSBS",
            title: "BALLON SOLAIRE - Capteur(s) Solaire",
            fields: [
                {
                    id: "orientationCSBS",
                    label: "Orientation",
                    type: "options",
                    items: [
                        { label: 'Portrait', value: 'Portrait', icon: faCheckCircle, pdfConfig: { dx: -311, dy: - 631, pageIndex } },
                        { label: 'Paysage', value: 'Paysage', icon: faCheckCircle, pdfConfig: { dx: -168, dy: - 631, pageIndex } },
                    ],
                    errorId: "orientationCSBSError",
                    mendatory: true
                },
            ]
        },
        {//12
            id: "solarMaskBS",
            title: "BALLON SOLAIRE - Capteur(s) Solaire",
            fields: [
                {
                    id: "solarMaskBS",
                    type: "textInput",
                    label: "Masque solaire",
                    mendatory: true,
                    errorId: "solarMaskBSError",
                    pdfConfig: { dx: -421, dy: - 672, pageIndex }
                },
            ]
        },
        {//13
            id: "noticeCSBS",
            title: "BALLON SOLAIRE - Capteur(s) Solaire",
            fields: [
                {
                    id: "noticeCSBS",
                    type: "textInput",
                    label: "Remarque",
                    errorId: "noticeCSBSError",
                    pdfConfig: { dx: -421, dy: - 760, pageIndex }
                },
            ]
        },
        {//14
            id: "materialPropositionBS",
            title: "BALLON SOLAIRE - Capteur(s) Solaire",
            fields: [
                {
                    id: "materialPropositionBS",
                    type: "textInput",
                    label: "Proposition matériel adéquat si refus VT",
                    errorId: "materialPropositionBSError",
                    pdfConfig: { dx: -421, dy: - 807, pageIndex }
                },
            ],
            isLastSubStep: true
        },
    ]

    return { model }
}