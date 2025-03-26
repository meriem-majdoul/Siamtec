
import { faMars, faVenus } from "react-native-fontawesome";
import { rgb } from 'pdf-lib'

import moment from "moment";
import * as theme from '../../theme'
import { getAddressDetails } from "../../utils";


export const mandatMPRModel = [
    { //1 DONE
        id: "identity",
        title: "IDENTITÉ DU MANDANT",
        fields: [
            {
                id: "sexe",
                label: "Je soussigné (vous le mandant):",
                type: "options",
                items: [
                    { label: 'Monsieur', value: 'Monsieur', icon: faMars, pdfConfig: { dx: -511, dy: - 401, pageIndex: 0 } },
                    { label: 'Madame', value: 'Madame', icon: faVenus, pdfConfig: { dx: -473, dy: - 401, pageIndex: 0 } },
                ],
                //mendatory: true,
            }
        ],
        isFirst: true,
        stepIndex: 1,
    },
    {//2 DONE
        id: "identity",
        title: "IDENTITÉ DU MANDANT",
        fields: [
            {
                id: "applicantFirstName",
                type: "textInput",
                maxLength: 15,
                label: "Prénom",
                errorId: "applicantFirstNameError",
                pdfConfig: { dx: -223, dy: - 415, pageIndex: 0, spaces: { afterEach: 1, str: '  ' } }, //add spaces
                mendatory: true
            },
            {
                id: "applicantLastName",
                type: "textInput",
                maxLength: 24,
                label: "Nom",
                errorId: "applicantLastNameError", //add max lenght
                pdfConfig: { dx: -501, dy: - 415, pageIndex: 0, spaces: { afterEach: 1, str: '  ' } }, //add spaces
                mendatory: true
            },
        ],
    },
    {
        id: "property",
        title: "PROPRIÉTÉ DU MANDANT",
        fields: [
            {
                id: "address",
                type: "textInput",
                label: "Adresse détaillée complète",
                errorId: "addressError",
                maxLength: 100,
                pdfConfig: { dx: -520, dy: - 440, pageIndex: 0 }, //add spaces
                mendatory: true,
            },
        ],
    },
    {
        id: "property",
        title: "PROPRIÉTÉ DU MANDANT",
        fields: [
            {
                id: "zipCode",
                type: "textInput",
                label: "Code postal",
                errorId: "zipCodeError",
                maxLength: 10,
                pdfConfig: { dx: -480, dy: - 456, pageIndex: 0 },
                mendatory: true,
            },
        ],
    },
    {
        id: "property",
        title: "PROPRIÉTÉ DU MANDANT",
        fields: [
            {
                id: "city",
                type: "textInput",
                label: "Commune",
                errorId: "cityError",
                maxLength: 50,
                pdfConfig: { dx: -386, dy: - 456, pageIndex: 0 },
                mendatory: true,
            },
        ],
        isLast: true,
    },
    // {
    //     id: "property",
    //     title: "PROPRIÉTÉ DU MANDANT",
    //     fields: [
    //         {
    //             id: "addressCode",
    //             type: "textInput",
    //             mask: "[0][0][0][0][0]",
    //             label: "Code Postal",
    //             isNumeric: true,
    //             errorId: "addressCodeError",
    //             mendatory: true,
    //             pdfConfig: { dx: -478, dy: - 456, pageIndex: 0, spaces: { afterEach: 1, str: '  ' } }, //add spaces
    //         },
    //     ]
    // },
    // {
    //     id: "property",
    //     title: "PROPRIÉTÉ DU MANDANT",
    //     fields: [
    //         {
    //             id: "commune",
    //             type: "textInput",
    //             maxLength: 31,
    //             label: "Commune",
    //             errorId: "communeError",
    //             pdfConfig: { dx: -386, dy: - 456, pageIndex: 0, spaces: { afterEach: 1, str: '  ' } }, //add spaces
    //             mendatory: true,
    //         },
    //     ],
    // },
    {
        id: "property",
        title: "COORDONNÉES DU MANDANT",
        fields: [
            {
                id: "email",
                type: "textInput",
                isEmail: true,
                label: "Adresse email",
                errorId: "emailError",
                mendatory: true,
                pdfConfig: { dx: -478, dy: - 471, pageIndex: 0 }
            },
        ],
        isFirst: true,
        stepIndex: 2,
    },
    {
        id: "property",
        title: "COORDONNÉES DU MANDANT",
        fields: [
            {
                id: "phone",
                type: "textInput",
                mask: "[00][00][00][00][00]",
                isNumeric: true,
                label: "Téléphone",
                errorId: "phoneError",
                mendatory: true,
                pdfConfig: { dx: -171, dy: - 471, pageIndex: 0, spaces: { afterEach: 1, str: '  ' } }
            },
        ]
    },
    //autogen
    {
        id: '',
        title: '',
        fields: [
            //AUTO-GEN
            // {
            //     id: "dayNow",
            //     type: "autogen",
            //     value: moment().format('DD'),
            //     pdfConfig: {
            //         dx: -423, dy: - 692, pageIndex: 1, spaces: { afterEach: 1, str: '  ' },
            //         mendatory: true,
            //     }
            // },
            // {
            //     id: "monthNow",
            //     type: "autogen",
            //     value: moment().format('MM'),
            //     pdfConfig: {
            //         dx: -398, dy: - 692, pageIndex: 1, spaces: { afterEach: 1, str: '  ' },
            //         mendatory: true,
            //     }
            // },
            // {
            //     id: "yearNow",
            //     type: "autogen",
            //     value: moment().format('YYYY'),
            //     pdfConfig: {
            //         dx: -372, dy: - 692, pageIndex: 1, spaces: { afterEach: 1, str: '  ' },
            //         mendatory: true,
            //     }
            // },
            {
                id: "isProprio",
                type: "autogen",
                items: [
                    {
                        label: 'Oui',
                        value: 'Oui',
                        pdfConfig: { dx: -523, dy: - 432, pageIndex: 0 }
                    },
                ],
            },
        ]
    },
    {//8
        id: "journal",
        title: "",
        fields: [
            {
                id: "createdIn",
                type: "textInput",
                maxLength: 18,
                label: "Mandat Maprimerénov fait à:",
                errorId: "createdInError",
                pdfConfig: { dx: -515, dy: - 693, pageIndex: 1 },
                mendatory: true,
                autoDate: { pdfConfig: { dx: -422, dy: - 693, pageIndex: 1 } }
            },
        ],
        isLast: true,
    },
]