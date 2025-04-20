
import { faCheck, faTimes, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import * as theme from '../../theme'

export const visiteTechModel = () => {

    const model = [
        { //1
            id: "houseFacadePicture",
            title: "Informations générales",
            fields: [
                {
                    id: "houseFacadePicture",
                    label: "Ajouter photo de la façade de la maison",
                    title: "Photo de la façade de la maison",
                    type: "image",
                    errorId: "houseFacadePictureError",
                    mendatory: true,
                },
                {
                    id: "houseFacadePictureNotice",
                    label: "Remarques",
                    isImageNotice: true,
                    type: "textInput",
                    maxLength: 300,
                    multiline: true,
                }
            ],
        },
        { //2
            id: "houseAccessPicture",
            title: "Informations générales",
            fields: [
                {
                    id: "houseAccessPicture",
                    label: "Ajouter photo de l'accès",
                    title: "Photo de l'accès",
                    type: "image",
                    errorId: "houseAccessPictureError",
                    mendatory: true,
                },
                {
                    id: "houseAccessPictureNotice",
                    label: "Remarques",
                    isImageNotice: true,
                    type: "textInput",
                    maxLength: 300,
                    multiline: true,
                }
            ],
        },
        {//3
            id: "subPower",
            title: "Informations générales",
            fields: [{
                id: "subPower",
                type: "textInput",
                isNumeric: true,
                label: "Puissance de l'abonnement souscrit",
                errorId: "subPowerError",
                mendatory: true,
                pdfConfig: { dx: -260, dy: - 187, pageIndex: 0 }
            }],
        },
        { //4
            id: "electricMeterPicture",
            title: "Informations générales",
            fields: [
                {
                    id: "electricMeterPicture",
                    label: "Ajouter photo du compteur",
                    title: "Photo du compteur",
                    type: "image",
                    errorId: "electricMeterPictureError",
                    mendatory: true,
                },
                {
                    id: "electricMeterPictureNotice",
                    label: "Remarques",
                    isImageNotice: true,
                    type: "textInput",
                    maxLength: 300,
                    multiline: true,
                }
            ],
        },
        {//5
            id: "phaseType",
            title: "Informations générales",
            fields: [{
                id: "phaseType",
                label: "Type de phase",
                type: "options",
                items: [
                    { label: 'Monophasé', value: 'Monophasé', icon: faCheckCircle, pdfConfig: { dx: -520, dy: - 301, squareSize: 10, pageIndex: 0 } },
                    { label: 'Triphasé', value: 'Triphasé', icon: faCheckCircle, pdfConfig: { dx: -520, dy: - 332, squareSize: 10, pageIndex: 0 } },
                ],
                mendatory: true,
            }]
        },
        { //6
            id: "electricPanelPicture",
            title: "Informations générales",
            fields: [
                {
                    id: "electricPanelPicture",
                    label: "Photo du tableau électrique existant",
                    title: "Photo du tableau électrique existant",
                    type: "image",
                    errorId: "electricPanelPictureError",
                    mendatory: true,
                },
                {
                    id: "electricPanelPictureNotice",
                    label: "Remarques",
                    isImageNotice: true,
                    type: "textInput",
                    maxLength: 300,
                    multiline: true,
                }
            ],
        },
        {//7
            id: "electricPanelLocation",
            title: "Informations générales",
            fields: [{
                id: "electricPanelLocation",
                type: "textInput",
                label: "Emplacement du tableau",
                instruction: { priority: "low", message: "Indiquez l'emplacement du tableau" },
                errorId: "electricPanelLocationError",
                mendatory: true,
                pdfConfig: { dx: -240, dy: - 402, pageIndex: 0 }
            }],
            isLast: true
        },
        //7 #task: Montant accompte (autoGen)
    ]

    return { model }
}