
import { faCheck, faTimes, faCheckCircle } from "react-native-fontawesome";
import * as theme from '../../theme'

import moment from 'moment';
import 'moment/locale/fr'
moment.locale('fr')

export const checklistPAEModel = (params) => {

    const { pageIndex, clientName } = params

    const model = [
        {//0
            id: "metaDataPAE",

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
            isFirstSubStep: true,
        },
        {//1
            id: "isInstalledPAE",
            subStep: { id: "pae", label: "PAC AIR/EAU" },
            section: { id: "electric", label: "Partie Electrique" },
            title: "PAC AIR/EAU - Partie Electrique",
            fields: [
                {
                    id: "isInstalledPAE",
                    label: "Installation existante ?",
                    type: "options",
                    items: [
                        { label: 'Non', value: 'Non', icon: faTimes, iconColor: theme.colors.error, pdfConfig: { dx: -182, dy: - 81, pageIndex } },
                        { label: 'Oui', value: 'Oui', icon: faCheck, iconColor: "green", pdfConfig: { dx: -297, dy: - 81, pageIndex } },
                    ],
                    errorId: "isInstalledPAEError",
                    mendatory: true,
                },
            ],
        },
        // {//2
        //     id: "phaseTypePAE",
        //    
        //     title: "PAC AIR/EAU - Partie Electrique",
        //     fields: [
        //         {
        //             id: "phaseTypePAE",
        //             label: "Type de phase",
        //             type: "options",
        //             items: [
        //                 { label: 'Monophasé', value: 'Monophasé', icon: faCheckCircle, pdfConfig: { dx: -321, dy: - 101, pageIndex } },
        //                 { label: 'Triphasé', value: 'Triphasé', icon: faCheckCircle, pdfConfig: { dx: -176, dy: - 101, pageIndex } },
        //             ],
        //             errorId: "phaseTypePAEError",
        //             mendatory: true
        //         },
        //     ]
        // },
        {//3
            id: "counterSubPowerPAE",

            title: "PAC AIR/EAU - Partie Electrique",
            fields: [
                {
                    id: "counterSubPowerPAE",
                    type: "picker",
                    items: [
                        { label: "Selectionner", value: "" },
                        { label: "6", value: "6" },
                        { label: "9", value: "9" },
                        { label: "12", value: "12" },
                        { label: "18", value: "18" },
                    ],
                    label: "Puissance abonnement compteur",
                    mendatory: true,
                    errorId: "counterSubPowerPAEError",
                    pdfConfig: { dx: -200, dy: - 121, pageIndex },
                    // style: { marginBottom: 32 },
                    // rollBack: { fields: [{ id: "transmittersTypes", type: "array" }] }
                },
            ]
        },
        {//4
            id: "powerCablePAE1",

            title: "PAC AIR/EAU - Partie Electrique",
            fields: [
                {
                    id: "powerCableSourcePAE",
                    label: "Câble d'alimentation",
                    type: "options",
                    errorId: "powerCableSourcePAEError",
                    items: [
                        { label: 'Existant', value: 'Existant', icon: faCheckCircle, pdfConfig: { dx: -330, dy: - 140, pageIndex } },
                        { label: 'A tirer', value: 'A tirer', icon: faCheckCircle, pdfConfig: { dx: -238, dy: - 140, pageIndex } },
                    ],
                    mendatory: true,
                },
                // {
                //     id: "powerCableSectionPAE",
                //     type: "textInput",
                //     label: "Section",
                //     errorId: "powerCableSectionPAEError",
                //     mendatory: true,
                //     pdfConfig: { dx: -110, dy: - 140, pageIndex }
                // },
            ]
        },
        {//5
            id: "powerCablePAE2",

            title: "PAC AIR/EAU - Partie Electrique",
            fields: [
                {
                    id: "powerCableTypePAE",
                    type: "textInput",
                    label: "Type câble d'alimentation",
                    errorId: "powerCableTypePAEError",
                    pdfConfig: { dx: -370, dy: - 160, pageIndex }
                },
                {
                    id: "powerCableLengthPAE",
                    type: "textInput",
                    isNumeric: true,
                    label: "Longueur câble d'alimentation",
                    errorId: "powerCableLengthPAEError",
                    mendatory: true,
                    pdfConfig: { dx: -350, dy: - 180, pageIndex }
                },
            ]
        },
        {//6
            id: "thermostatTypePAE",

            title: "PAC AIR/EAU - Partie Electrique",
            fields: [
                {
                    id: "thermostatTypePAE",
                    label: "Type de thermostat",
                    type: "options",
                    errorId: "thermostatTypePAEError",
                    items: [
                        { label: 'Filaire', value: 'Filaire', icon: faCheckCircle, pdfConfig: { dx: -285, dy: - 198, pageIndex } },
                        { label: 'Radio', value: 'Radio', icon: faCheckCircle, pdfConfig: { dx: -201, dy: - 198, pageIndex } },
                    ],
                    mendatory: true,
                },
            ]
        },
        {//7
            id: "cableToPullLengthPAE",

            title: "PAC AIR/EAU - Partie Electrique",
            fields: [
                {
                    id: "cableToPullLengthPAE",
                    type: "textInput",
                    isNumeric: true,
                    label: "Longueur de câble à tirer",
                    errorId: "cableToPullLengthPAEError",
                    mendatory: true,
                    pdfConfig: { dx: -421, dy: - 218, pageIndex }
                },
            ]
        },
        { //4
            id: "internalUnityLocationPicturePAE",
            title: "PAC AIR/EAU - Partie Electrique",
            fields: [
                {
                    id: "internalUnityLocationPicturePAE",
                    label: "Photo emplacement unité intérieure",
                    title: "Photo emplacement unité intérieure",
                    type: "image",
                    errorId: "internalUnityLocationPicturePAEError",
                    mendatory: true,
                },
                {
                    id: "internalUnityLocationPictureNoticePAE",
                    label: "Remarques",
                    isImageNotice: true,
                    type: "textInput",
                    maxLength: 300,
                    multiline: true,
                }
            ],
        },
        // {//8
        //     id: "protectionPAE",
        //    
        //     title: "PAC AIR/EAU - Partie Electrique",
        //     fields: [
        //         {
        //             id: "interdiffProtectionPAE",
        //             type: "textInput",
        //             label: "Protection de l'interdifférentiel",
        //             errorId: "interdiffProtectionPAEError",
        //             mendatory: true,
        //             pdfConfig: { dx: -257, dy: - 242, pageIndex }
        //         },
        //         {
        //             id: "disjoncteurProtectionPAE",
        //             type: "textInput",
        //             label: "Protection de(s) disjoncteur(s)",
        //             errorId: "disjoncteurProtectionPAEError",
        //             mendatory: true,
        //             pdfConfig: { dx: -120, dy: - 242, pageIndex }
        //         },
        //     ]
        // },
        {//9
            id: "heatingPipeDiameterPAE",
            section: { id: "hydraulic", label: "Partie Hydraulique" },
            title: "PAC AIR/EAU - Partie Hydraulique",
            fields: [
                {
                    id: "heatingPipeDiameterInputPAE",
                    type: "textInput",
                    label: "Diamètre des tuyaux chauffage (Entrée)",
                    isNumeric: true,
                    errorId: "heatingPipeDiameterPAEError",
                    mendatory: true,
                    pdfConfig: { dx: -311, dy: - 286, pageIndex }
                },
                {
                    id: "heatingPipeDiameterOutputPAE",
                    type: "textInput",
                    label: "Diamètre des tuyaux chauffage (Sortie)",
                    isNumeric: true,
                    errorId: "heatingPipeDiameterOutputPAEError",
                    mendatory: true,
                    pdfConfig: { dx: -144, dy: - 286, pageIndex }
                },
            ]
        },
        {//10
            id: "pipeMaterialTypePAE",

            title: "PAC AIR/EAU - Partie Hydraulique",
            fields: [
                {
                    id: "pipeMaterialTypePAE",
                    label: "Types matériaux tuyaux",
                    type: "options",
                    items: [
                        { label: "Acier", value: "Acier", icon: faCheckCircle, pdfConfig: { dx: -352, dy: -307, pageIndex } },
                        { label: "Cuivre", value: "Cuivre", icon: faCheckCircle, pdfConfig: { dx: -284, dy: - 307, pageIndex } },
                        { label: "PER", value: "PER", icon: faCheckCircle, pdfConfig: { dx: -218, dy: - 307, pageIndex } },
                        { label: "Multicouches", value: "Multicouches", icon: faCheckCircle, pdfConfig: { dx: -166, dy: - 307, pageIndex } },
                    ],
                    isMultiOptions: true,
                    mendatory: true,
                    errorId: "pipeMaterialTypePAEError",
                    pdfConfig: { dx: -450, dy: - 305, pageIndex }
                },
            ]
        },
        {//11
            id: "heatingZonesCountPAE",

            title: "PAC AIR/EAU - Partie Hydraulique",
            fields: [
                {
                    id: "heatingZonesCountPAE",
                    type: "picker",
                    items: [
                        { label: "Selectionner un nombre", value: "" },
                        { label: "1", value: "1" },
                        { label: "2", value: "2" },
                        { label: "3", value: "3" },
                        { label: "4", value: "4" },
                    ],
                    label: "Nombre zones de chauffage",
                    mendatory: true,
                    errorId: "heatingZonesCountPAEError",
                    pdfConfig: { dx: -421, dy: - 327, pageIndex }
                    // style: { marginBottom: 32 },
                    // rollBack: { fields: [{ id: "transmittersTypes", type: "array" }] }
                },
            ]
        },
        {//12
            id: "transmittersTypePAE",

            title: "PAC AIR/EAU - Partie Hydraulique",
            fields: [
                {
                    id: "transmittersTypePAE",
                    label: "Type d'émetteurs",
                    type: "options",
                    errorId: "transmittersTypePAEError",
                    items: [
                        { label: 'Radiateur', value: 'Radiateur', icon: faCheckCircle, pdfConfig: { dx: -358, dy: - 345, pageIndex } },
                        { label: 'Plancher chauffant', value: 'Plancher chauffant', icon: faCheckCircle, pdfConfig: { dx: -265, dy: - 345, pageIndex } },
                        { label: 'Ventilo-convecteur  ', value: 'Ventilo-convecteur  ', icon: faCheckCircle, pdfConfig: { dx: -139, dy: - 345, pageIndex } },
                    ],
                    mendatory: true,
                },
            ]
        },
        {//13
            id: "radiatorMaterialTypePAE",

            title: "PAC AIR/EAU - Partie Hydraulique",
            fields: [
                {
                    id: "radiatorMaterialTypePAE",
                    label: "Types matériaux radiateurs",
                    type: "options",
                    items: [
                        { label: "Acier", value: "Acier", icon: faCheckCircle, pdfConfig: { dx: -330, dy: -364, pageIndex } },
                        { label: "Fonte", value: "Fonte", icon: faCheckCircle, pdfConfig: { dx: -238, dy: - 364, pageIndex } },
                        { label: "Alu", value: "Alu", icon: faCheckCircle, pdfConfig: { dx: -146, dy: - 364, pageIndex } },
                    ],
                    mendatory: true,
                    errorId: "radiatorMaterialTypePAEError",
                },
            ]
        },
        {//14
            id: "radiatorCountPAE",

            title: "PAC AIR/EAU - Partie Hydraulique",
            fields: [
                {
                    id: "radiatorCountPAE",
                    type: "textInput",
                    isNumeric: true,
                    label: "Nombre de radiateurs",
                    errorId: "radiatorCountPAEError",
                    mendatory: true,
                    pdfConfig: { dx: -421, dy: - 383, pageIndex }
                },
            ]
        },
        {//15
            id: "isBallAndCircMergeRequiredPAE",

            title: "PAC AIR/EAU - Partie Hydraulique",
            fields: [
                {
                    id: "isBallAndCircMergeRequiredPAE",
                    label: "Ballon mélange avec circulateur nécessaire",
                    type: "options",
                    items: [
                        { label: 'Non', value: 'Non', icon: faTimes, iconColor: theme.colors.error, pdfConfig: { dx: -139, dy: - 402, pageIndex }, rollBack: { fields: [{ id: "ballAndCircMergeVolumePAE", type: "string" }] } },
                        { label: 'Oui', value: 'Oui', icon: faCheck, iconColor: "green", pdfConfig: { dx: -340, dy: - 402, pageIndex } },
                    ],
                    errorId: "isBallAndCircMergeRequiredPAEError",
                    mendatory: true
                },
                {
                    id: "ballAndCircMergeVolumePAE",
                    type: "textInput",
                    isNumeric: true,
                    label: "Combien en litre ?",
                    errorId: "ballAndCircMergeVolumePAEError",
                    mendatory: true,
                    isConditional: true,
                    condition: { with: "isBallAndCircMergeRequiredPAE", values: ["Oui"] },
                    pdfConfig: { dx: -308, dy: - 402, pageIndex }
                },
            ]
        },
        {//16
            id: "isExpansionTankRequiredPAE",

            title: "PAC AIR/EAU - Partie Hydraulique",
            fields: [
                {
                    id: "isExpansionTankRequiredPAE",
                    label: "Vase d'expansion nécessaire",
                    type: "options",
                    items: [
                        { label: 'Non', value: 'Non', icon: faTimes, iconColor: theme.colors.error, pdfConfig: { dx: -142, dy: - 420, pageIndex }, rollBack: { fields: [{ id: "expansionTankVolumePAE", type: "string" }] } },
                        { label: 'Oui', value: 'Oui', icon: faCheck, iconColor: "green", pdfConfig: { dx: -340, dy: - 420, pageIndex } },
                    ],
                    errorId: "isExpansionTankRequiredPAEError",
                    mendatory: true
                },
                {
                    id: "expansionTankVolumePAE",
                    type: "textInput",
                    isNumeric: true,
                    label: "6% du volume d'eau de chauffage (en L)",
                    errorId: "expansionTankVolumePAEError",
                    mendatory: true,
                    isConditional: true,
                    condition: { with: "isExpansionTankRequiredPAE", values: ["Oui"] },
                    pdfConfig: { dx: -229, dy: - 420, pageIndex }
                },
            ]
        },
        {//17
            id: "hydraulicModuleLocationPAE",

            title: "PAC AIR/EAU - Partie Hydraulique",
            fields: [
                {
                    id: "hydraulicModuleLocationPAE",
                    type: "textInput",
                    label: "Emplacement module hydraulique",
                    errorId: "hydraulicModuleLocationPAEError",
                    mendatory: true,
                    instruction: { priority: "low", message: "Emplacement module hydraulique INT (sauf monobloc)" },
                    pdfConfig: { dx: -360, dy: - 440, pageIndex }
                },
            ]
        },
        {//18
            id: "commentsElecPAE",

            title: "PAC AIR/EAU - Partie Hydraulique",
            fields: [
                {
                    id: "commentElecPAE",
                    type: "textInput",
                    label: "Commentaires",
                    errorId: "commentsElecPAEError",
                    pdfConfig: { dx: -421, dy: - 463, pageIndex }
                },
            ]
        },
        {//19
            id: "tubeDiameterPAE",
            section: { id: "ecs", label: "Partie EC Sanitaire" },
            title: "PAC AIR/EAU - Partie EC Sanitaire",
            fields: [
                {
                    id: "tubeDiameterEFPAE",
                    type: "textInput",
                    isNumeric: true,
                    label: "Diamètre tube EF",
                    errorId: "tubeDiameterEFPAEError",
                    mendatory: true,
                    pdfConfig: { dx: -275, dy: - 503, pageIndex }
                },
                {
                    id: "tubeDiameterECSPAE",
                    type: "textInput",
                    isNumeric: true,
                    label: "Diamètre tube ECS",
                    errorId: "tubeDiameterECSPAEError",
                    mendatory: true,
                    pdfConfig: { dx: -140, dy: - 503, pageIndex }
                },
            ]
        },
        {//20
            id: "tubeMaterialsPAE",

            title: "PAC AIR/EAU - Partie EC Sanitaire",
            fields: [
                {
                    id: "tubeMaterialsPAE",
                    label: "Type matériaux tuyaux",
                    type: "options",
                    items: [
                        { label: "Acier", value: "Acier", icon: faCheckCircle, pdfConfig: { dx: -351, dy: -522, pageIndex } },
                        { label: "Cuivre", value: "Cuivre", icon: faCheckCircle, pdfConfig: { dx: -284, dy: - 522, pageIndex } },
                        { label: "PER", value: "PER", icon: faCheckCircle, pdfConfig: { dx: -217, dy: - 522, pageIndex } },
                        { label: "Multicouches", value: "Multicouches", icon: faCheckCircle, pdfConfig: { dx: -167, dy: - 522, pageIndex } },
                    ],
                    isMultiOptions: true,
                    mendatory: true,
                    errorId: "tubeMaterialsPAEError",
                },
            ]
        },
        {//21
            id: "PVCdrainingPAE",
            title: "PAC AIR/EAU - Partie EC Sanitaire",
            fields: [
                {
                    id: "PVCdrainingPAE",
                    label: "Evacuation PVC",
                    type: "options",
                    errorId: "PVCdrainingPAEError",
                    items: [
                        { label: 'Existante', value: 'Existante', icon: faCheckCircle, pdfConfig: { dx: -321, dy: - 541, pageIndex } },
                        { label: 'Non existante', value: 'Non existante', icon: faCheckCircle, pdfConfig: { dx: -199, dy: - 541, pageIndex } },
                    ],
                    mendatory: true,
                },
            ]
        },
        {//22
            id: "PVCdrainingDiameterPAE",
            title: "PAC AIR/EAU - Partie EC Sanitaire",
            fields: [
                {
                    id: "PVCdrainingDiameterPAE",
                    type: "textInput",
                    isNumeric: true,
                    label: "Si évacuation PVC existante: diamètre",
                    errorId: "PVCdrainingDiameterPAEError",
                    instruction: { priority: "low", message: "Si évacuation PVC existante: diamètre en mm" },
                    pdfConfig: { dx: -253, dy: - 560, pageIndex }
                },
            ]
        },
        {//23
            id: "GELocationPAE",
            section: { id: "ext", label: "Partie Groupe Ext." },
            title: "PAC AIR/EAU - Partie Groupe Ext.",
            fields: [
                {
                    id: "GELocationPAE",
                    type: "textInput",
                    label: "Emplacement GE (hauteur en cm)",
                    isNumeric: true,
                    mendatory: true,
                    errorId: "GELocationPAEError",
                    pdfConfig: { dx: -70, dy: - 596, pageIndex }
                },
            ]
        },
        {//24
            id: "bracketTypePAE",

            title: "PAC AIR/EAU - Partie Groupe Ext.",
            fields: [
                {
                    id: "bracketTypePAE",
                    label: "Type de support",
                    type: "options",
                    items: [
                        { label: "Au sol sur rubber foot", value: "Au sol sur rubber foo", icon: faCheckCircle, pdfConfig: { dx: -401, dy: -615, pageIndex } },
                        { label: "Support mural classique", value: "Support mural classique", icon: faCheckCircle, pdfConfig: { dx: -279, dy: - 615, pageIndex } },
                        { label: "Support mural mupro", value: "Support mural mupro", icon: faCheckCircle, pdfConfig: { dx: -152, dy: - 615, pageIndex } },
                    ],
                    mendatory: true,
                    errorId: "bracketTypePAEError",
                },
            ]
        },
        {//25
            id: "capacitorDrainingPAE",

            title: "PAC AIR/EAU - Partie Groupe Ext.",
            fields: [
                {
                    id: "capacitorDrainingPAE",
                    type: "textInput",
                    label: "Evacuation condensat",
                    mendatory: true,
                    errorId: "capacitorDrainingPAEError",
                    pdfConfig: { dx: -421, dy: - 634, pageIndex }
                },
            ]
        },
        {//26
            id: "commentsExtGroupPAE",

            title: "PAC AIR/EAU - Partie Groupe Ext.",
            fields: [
                {
                    id: "commentsExtGroupPAE",
                    type: "textInput",
                    label: "Commentaires",
                    errorId: "commentsExtGroupPAEError",
                    pdfConfig: { dx: -421, dy: - 658, pageIndex }
                },
            ]
        },
        // {//27
        //     id: "linksDiameterPAE",
        //    
        //     title: "PAC AIR/EAU - Partie Frigorifique",
        //     fields: [
        //         {
        //             id: "linksDiameterPAE",
        //             type: "textInput",
        //             label: "Diamètre liaison",
        //             isNumeric: true,
        //             mendatory: true,
        //             errorId: "linksDiameterPAEError",
        //             pdfConfig: { dx: -421, dy: - 700, pageIndex }
        //         },
        //     ]
        // },
        {//28
            id: "linksLengthPAE",
            section: { id: "frigo", label: "Partie Frigorifique" },
            title: "PAC AIR/EAU - Partie Frigorifique",
            fields: [
                {
                    id: "linksLengthPAE",
                    type: "textInput",
                    label: "Longueur des liaisons (en m)",
                    isNumeric: true,
                    mendatory: true,
                    errorId: "linksLengthPAEError",
                    pdfConfig: { dx: -240, dy: - 719, pageIndex }
                },
            ]
        },
        {//29
            id: "linksPassagePAE",

            title: "PAC AIR/EAU - Partie Frigorifique",
            fields: [
                {
                    id: "linksPassagePAE",
                    type: "textInput",
                    label: "Passage des liaisons",
                    mendatory: true,
                    errorId: "linksPassagePAEError",
                    pdfConfig: { dx: -421, dy: - 740, pageIndex }
                },
            ]
        },
        { //4
            id: "linksPassagePicturePAE",
            title: "PAC AIR/EAU - Partie Frigorifique",
            fields: [
                {
                    id: "linksPassagePicturePAE",
                    label: "Photo du passage des liaisons",
                    title: "Photo du passage des liaisons",
                    type: "image",
                    errorId: "linksPassagePicturePAEError",
                    mendatory: true,
                },
                {
                    id: "linksPassagePictureNoticePAE",
                    label: "Remarques",
                    isImageNotice: true,
                    type: "textInput",
                    maxLength: 300,
                    multiline: true,
                }
            ],
        },
        {//30
            id: "gutterTypePAE",

            title: "PAC AIR/EAU - Partie Frigorifique",
            fields: [
                {
                    id: "gutterTypePAE",
                    label: "Type de goulottes",
                    type: "options",
                    errorId: "gutterTypePAEError",
                    items: [
                        { label: '80Ø', value: '80Ø', icon: faCheckCircle, pdfConfig: { dx: -309, dy: - 757, pageIndex } },
                        { label: '120Ø', value: '120Ø', icon: faCheckCircle, pdfConfig: { dx: -176, dy: - 757, pageIndex } },
                    ],
                    mendatory: true,
                },
            ]
        },
        {//30.1
            id: "gutterLengthPAE",

            title: "PAC AIR/EAU - Partie Frigorifique",
            fields: [
                {
                    id: "gutterLengthPAE",
                    type: "textInput",
                    label: "Longueur des goulottes (en m)",
                    isNumeric: true,
                    mendatory: true,
                    errorId: "gutterLengthPAEError",
                    pdfConfig: { dx: -421, dy: - 777, pageIndex }
                },
            ]
        },
        {//31
            id: "noticePAE",

            title: "PAC AIR/EAU - Remarques",
            fields: [
                {
                    id: "noticePAE",
                    type: "textInput",
                    label: "Remarques",
                    errorId: "noticePAEError",
                    pdfConfig: { dx: -421, dy: - 819, pageIndex }
                },
            ],
            isLastSubStep: true
        },
    ]

    return { model }
}