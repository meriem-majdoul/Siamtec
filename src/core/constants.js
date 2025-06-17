import { Dimensions, Platform } from 'react-native'
import RNFetchBlob from 'rn-fetch-blob'
import { faCamera, faImages, faFileInvoice, faUserHardHat, faFileInvoiceDollar, faBallot, faFileCertificate, faFile, faFolderPlus, faHandHoldingUsd, faHandshake, faHomeAlt, faGlobeEurope, faReceipt, faFileAlt, faFileEdit } from '@fortawesome/free-solid-svg-icons'

import { rgb } from "pdf-lib"

const width = Dimensions.get('window').width
const height = Dimensions.get('window').height

export const appVersion = "1.5.33"

export const constants = {
    ScreenWidth: width,
    ScreenHeight: height
}

export const ScreenWidth = width
export const ScreenHeight = height

export const latestProcessVersion = "version9"

export const roles = [
    { id: 'admin', label: 'Admin', value: 'Admin', bool: 'isAdmin', level: 3 },
    // { id: 'backoffice', label: 'Back office', value: 'Back office', bool: 'isBackOffice', level: 3 },
    { id: 'dircom', label: 'MAR', value: 'MAR', bool: 'isDirCom', level: 2 },
    // { id: 'com', label: "Chargé d'affaires", value: "Chargé d'affaires", bool: 'isCom', level: 1 },
    { id: 'tech', label: 'Entreprise technique', value: 'Entreprise technique', bool: 'isTech', level: 1 },
    // { id: 'poseur', label: 'Équipe technique', value: 'Équipe technique', bool: 'isPoseur', level: 0 },
    { id: 'client', label: 'Client', value: 'Client', bool: 'isClient', level: -1 },
    // { id: 'designoffice', label: "Bureau d'étude", value: "Bureau d'étude", bool: 'isClient', level: -1 }
]

export const highRoles = ['admin', 'backoffice', 'dircom', 'tech']
export const lowRoles = ["poseur", "com"]
export const staffRoles = [...highRoles, ...lowRoles]
export const highRolesValues = ['Admin', 'Back office', 'MAR', 'Entreprise technique']


export const comSteps = ['Prospect', 'Visite technique préalable', 'Présentation étude']
export const techSteps = ['Visite technique', "En attente d'installation", 'Maintenance']

export const downloadDir = Platform.OS === 'ios' ? RNFetchBlob.fs.dirs.DocumentDir : RNFetchBlob.fs.dirs.DownloadDir
export const termsDir = `${downloadDir}/Synergys/Documents/Termes-et-conditions-générales-de-signature.pdf`
export const termsUrl = 'https://firebasestorage.googleapis.com/v0/b/projectmanagement-b9677.appspot.com/o/CONDITIONS%20G%C3%89N%C3%89RALES%20DE%20VENTE%20ET%20DE%20TRAVAUX.pdf?alt=media&token=3bf07ac2-6d9e-439a-91d8-f9908003488f'

export const errorMessages = {
    appInit: "Erreur inattendue lors de l'initialisation de la session. Veuillez redémarrer l'application.",
    auth: {
        emailExist: "L'adresse email que vous avez saisi est déjà associé à un compte."
    },
    firestore: {
        get: "Erreur lors du chargement des données. Veuillez réessayer.",
        update: "Erreur lors de la mise à jour des données. Veuillez réessayer.",
        delete: "Erreur inattendue lors de la suppression."
    },
    wordpress: { posts: "Erreur lors de la connection avec le serveur du siteweb." },
    profile: {
        emailUpdate: "Erreur lors de la modification de l'adresse email. Veuillez réessayer.",
        roleUpdate: "Erreur lors de la modification du role. Veuillez réessayer.",
        passwordUpdate: "Erreur lors de la modification du mot de passe. Veuillez réessayer."
    },
    documents: {
        upload: "Erreur lors de l'importation de la pièce jointe, veuillez réessayer.",
        download: "Erreur lors du téléchargement du document, veuillez réessayer plus tard."
    },
    pdfGen: "Erreur lors de la génération du document. Veuillez réessayer.",
    invalidFields: "Erreur de saisie, veuillez verifier les champs.",
    network: {
        newUser: "La création d'un nouvel utilisateur nécessite une connection réseau."
    },
    chat: "Erreur lors de l'envoi du message, veuillez réessayer",
    map: "Erreur lors de la communication avec le serveur Google Maps. Veuillez réessayer...",
    fields: {
        empty: 'Erreur de saisie, veuillez verifier les champs.'
    }
}

export const sectionsModels = {
    project: {
        activity: {
            isExpanded: false,
            show: false,
            fields: {}
        },
        info: {
            isExpanded: false,
            show: false,
            fields: {
                projectId: { show: false },
                projectName: { show: false },
                projectStep: { show: false },
                projectState: { show: false },
                projectPhase: { show: false },
                projectWorkTypes: { show: false }
            }
        },
        client: {
            isExpanded: false,
            show: false,
            fields: {
                client: { show: false },
                address: { show: false }
            }
        },
        contacts: {
            isExpanded: false,
            show: false,
            fields: {
                com: { show: false },
                tech: { show: false }
            }
        },
        documents: {
            isExpanded: false,
            show: false,
            fields: {
                documents: { show: false }
            }
        },
        tasks: {
            isExpanded: false,
            show: false,
            fields: {
                tasks: false
            }
        },
        billing: {
            isExpanded: false,
            show: false,
            fields: {
                billAmount: { show: false }
            }
        },
        pictures: {
            isExpanded: false,
            show: false,
            fields: {}
        },
        notes: {
            isExpanded: false,
            show: false,
            fields: {
                notes: { show: false }
            }
        }
    }
}

export const issuesSubjects = [
    { label: 'Bug', value: 'Bug' },
    { label: 'Suggestion', value: 'Suggestion' },
    { label: "Problème d'affichage/design", value: "Problème d'affichage/design" },
    { label: "Plantage (Crash)", value: "Plantage (Crash)" },
    { label: "Autre", value: "Autre" },
]

export const imageSources = [
    { label: 'Caméra', value: 'upload', icon: faCamera },
    { label: 'Gallerie', value: 'generate', icon: faImages }
]


export const publicDocTypes = [
    { label: 'Bon de commande', value: 'Bon de commande', icon: faBallot },
    { label: 'Aide et subvention', value: 'Aide et subvention', icon: faHandshake },
    { label: 'Autre', value: 'Autre', icon: faFile },
]

export const privateDocTypes = [
    { label: 'Devis', value: 'Devis', icon: faFileInvoice },
    { label: 'Offre précontractuelle', value: 'Offre précontractuelle', icon: faFileInvoice },
    { label: 'Facture', value: 'Facture', icon: faFileInvoiceDollar },
    { label: 'Dossier CEE', value: 'Dossier CEE', icon: faFileCertificate },
    { label: 'Fiche EEB', value: 'Fiche EEB', icon: faFileAlt },
    { label: 'Audit énergétique', value: 'Audit énergétique', icon: faFileAlt },
    { label: 'Dossier client', value: 'Dossier client', icon: faFileAlt },
    { label: 'Dossier aide', value: 'Dossier aide', icon: faFolderPlus },
    // { label: 'Prime de rénovation', value: 'Prime de rénovation', icon: faHandHoldingUsd },
    { label: 'Mandat MaPrimeRénov', value: 'Mandat MaPrimeRénov', icon: faHandHoldingUsd },
    // { label: 'Mandat Synergys', value: 'Mandat Synergys', icon: faSave },
    { label: 'Action logement', value: 'Action logement', icon: faHomeAlt },
    { label: 'PV réception', value: 'PV réception', icon: faReceipt },
    { label: 'Mandat SEPA', value: 'Mandat SEPA', icon: faGlobeEurope },
    { label: 'Contrat CGU-CGV', value: 'Contrat CGU-CGV', icon: faFileEdit },
    { label: 'Attestation fluide', value: 'Attestation fluide', icon: faFileEdit },
    { label: 'Visite technique', value: 'Visite technique', icon: faUserHardHat },
    { label: "Relevé d'impôt", value: "Relevé d'impôt", icon: faFile },
    { label: "Justificatif de domicile", value: "Justificatif de domicile", icon: faFile },
    { label: "Plan cadastral", value: "Plan cadastral", icon: faFile },
    { label: "Taxe foncière", value: "Taxe foncière", icon: faFile },
]

export const allDocTypes = [...publicDocTypes, ...privateDocTypes]

export const generableDocTypes = [
    //"Devis",
    "Offre précontractuelle",
    //"Facture",
    "Fiche EEB",
    //"Dossier client",
    'PV réception',
    'Mandat MaPrimeRénov',
    'Mandat Synergys',
    'Visite technique'
]
export const onlyImportableDocTypes = []
export const masculinsDocTypes = [
    'Devis',
    'Bon de commande',
    'Dossier CEE',
    'PV réception',
    'Mandat MaPrimeRénov',
    'Mandat Synergys',
    "Dossier client",
    "Audit énergétique"
]

export const phases = [
    { label: 'Prospect', value: 'Prospect', id: 'init' },
    { label: 'Visite technique préalable', value: 'Visite technique préalable', id: 'rd1' },
    { label: 'Présentation étude', value: 'Présentation étude', id: 'rdn' },
    { label: 'Visite technique', value: 'Visite technique', id: 'technicalVisitManagement' },
    { label: "En attente d'installation", value: "En attente d'installation", id: 'installation' },
    //{ label: 'Maintenance', value: 'Maintenance', id: 'maintenance' },
]

export const items_scrollTo = {
    "CreateProject": {
        "comContact": { x: 0, y: 1000, animated: true },
    }
}

export const lastAction = (actionOrder) => {
    return {
        id: 'endProject',
        title: "Finaliser le projet",
        instructions: "",
        actionOrder,
        type: 'manual',
        verificationType: 'validation',
        comment: '',
        responsable: 'ADV',
        status: 'pending',
        nextPhase: 'endProject',
    }
}

export const workTypes = [
    { label: 'PAC AIR/EAU', value: 'PAC AIR/EAU', selected: false },
    { label: 'PAC AIR/AIR (climatisation)', value: 'PAC AIR/AIR (climatisation)', selected: false },
    { label: 'BALLON THERMODYNAMIQUE', value: 'BALLON THERMODYNAMIQUE', selected: false },
    { label: 'BALLON SOLAIRE THERMIQUE', value: 'BALLON SOLAIRE THERMIQUE', selected: false },
    { label: 'PHOTOVOLTAÏQUE', value: 'PHOTOVOLTAÏQUE', selected: false },
    { label: 'PHOTOVOLTAÏQUE HYBRIDE', value: 'PHOTOVOLTAÏQUE HYBRIDE', selected: false },
    { label: 'ISOLATION ', value: 'ISOLATION ', selected: false },
    { label: 'VMC DOUBLE FLUX ', value: 'VMC DOUBLE FLUX ', selected: false },
    { label: 'POÊLE A GRANULES ', value: 'POÊLE A GRANULES ', selected: false },
    { label: 'RADIATEUR INERTIE ', value: 'RADIATEUR INERTIE ', selected: false },
]

export const contactForm = [
    {//33
        id: "coordinates",
        title: "COORDONNEES",
        fields: [
            {
                id: "addressNumber",
                type: "textInput",
                label: "N°",
                isNumeric: true,
                errorId: "addressNumberError",
                mendatory: true,
                pdfConfig: { dx: -53, dy: - 650, pageIndex: 2 }
            },
            {
                id: "addressStreet",
                type: "textInput",
                label: "Rue",
                errorId: "addressStreetError",
                mendatory: true,
                pdfConfig: { dx: -53, dy: - 650, pageIndex: 2 }
            },
            {
                id: "addressPostalCode",
                type: "textInput",
                label: "Code postal",
                errorId: "addressPostalCodeError",
                mendatory: true,
                pdfConfig: { dx: -53, dy: - 650, pageIndex: 2 }
            },
            {
                id: "addressCity",
                type: "textInput",
                label: "Ville",
                errorId: "addressCityError",
                mendatory: true,
                pdfConfig: { dx: -53, dy: - 650, pageIndex: 2 }
            },
            {
                id: "email",
                type: "textInput",
                label: "Email",
                errorId: "emailError",
                isEmail: true,
                mendatory: true,
                pdfConfig: { dx: -53, dy: - 650, pageIndex: 2 }
            },
            {
                id: "phone",
                type: "textInput",
                label: "Téléphone",
                errorId: "phoneError",
                isNumeric: true,
                mendatory: true,
                pdfConfig: { dx: -53, dy: - 650, pageIndex: 2 }
            },
            {
                id: "acceptPhoneCall",
                type: "checkbox",
                label: "Être rappelé",
                errorId: "acceptPhoneCallError",
                isNumeric: true,
                mendatory: true,
                pdfConfig: { dx: -53, dy: - 650, pageIndex: 2 }
            },
        ],
    },
]

export const simulationColorCats = [
    { id: "blue", label: "Bleu" },
    { id: "yellow", label: "Jaune" },
    { id: "purple", label: "Violet" },
    { id: "pink", label: "Rose" },
]

const choice1 = ["PAC AIR EAU", "Chauffage solaire combiné"]
const choice2 = ["Chaudière à granulé", "Chauffage solaire combiné"]
export const pack1 = [choice1, choice2]

const choice3 = ["PAC AIR EAU", "Chauffe-eau solaire individuel"]
const choice4 = ["PAC AIR EAU", "Ballon thermodynamique"]
const choice5 = ["Chaudière à granulé", "Chauffe-eau solaire individuel"]
const choice6 = ["Chaudière à granulé", "Ballon thermodynamique"]
export const pack2 = [choice3, choice4, choice5, choice6]

export const collectionScreenNameMap = {
    "Clients": "Profile",
    "Projects": "CreateProject",
    "Documents": "UploadDocument",
    "Agenda": "CreateTask"
}

//Auto-Sign docs
export const autoSignDocs = [
    "Mandat MaPrimeRénov",
    //"Devis",
    "Offre précontractuelle",
    //"Facture",
    "PV réception"
]
export const docsConfig = (index) => {

    const config = {
        //obsolete: only for old documents
        "Devis": {
            signatures: [
                {
                    pageIndex: 1,
                    position: {
                        x: 75,
                        y: 440,
                        size: 10,
                        lineHeight: 10,
                        color: rgb(0, 0, 0),
                    }
                },
                {
                    pageIndex: 5,
                    position: {
                        x: 250,
                        y: 137,
                        size: 10,
                        lineHeight: 10,
                        color: rgb(0, 0, 0),
                    }
                }
            ],
            genNavigation: {
                titleText: "Choix de la commande",
                listScreen: "ListOrders",
                creationScreen: "CreateOrder",
                popCount: index === 0 ? 3 : 2,
            }
        },
        "Offre précontractuelle": {
            signatures: [
                {
                    pageIndex: 1,
                    position: {
                        x: 75,
                        y: 440,
                        size: 10,
                        lineHeight: 10,
                        color: rgb(0, 0, 0),
                    }
                },
                {
                    pageIndex: 5,
                    position: {
                        x: 250,
                        y: 137,
                        size: 10,
                        lineHeight: 10,
                        color: rgb(0, 0, 0),
                    }
                }
            ],
            genNavigation: {
                titleText: "Choix de la commande",
                listScreen: "ListOrders",
                creationScreen: "CreateOrder",
                popCount: index === 0 ? 3 : 2,
            }
        },
        "Mandat MaPrimeRénov": {
            signatures: [{
                pageIndex: 1,
                position: {
                    x: 60,
                    y: 90,
                    size: 10,
                    lineHeight: 10,
                    color: rgb(0, 0, 0),
                }
            }],
            genNavigation: {
                titleText: "Choix du formulaire",
                listScreen: "ListMandatsMPR",
                creationScreen: "CreateMandatMPR",
                popCount: index === 0 ? 2 : 1,
            }
        },
        "Mandat Synergys": {
            signatures: [{
                pageIndex: 0,
                position: {
                    x: 45,
                    y: 180,
                    size: 10,
                    lineHeight: 10,
                    color: rgb(0, 0, 0),
                }
            }]
        },
        "Facture": {
            signatures: [{
                pageIndex: 0,
                position: {
                    x: 45,
                    y: 160,
                    size: 10,
                    lineHeight: 10,
                    color: rgb(0, 0, 0),
                }
            }],
            genNavigation: {
                titleText: "Choix de la commande",
                listScreen: "ListOrders",
                creationScreen: "CreateOrder",
                popCount: index === 0 ? 3 : 2,
            }
        },
        "Fiche EEB": {
            genNavigation: {
                titleText: "Choix de la simulation",
                listScreen: "ListSimulations",
                creationScreen: "CreateSimulation",
                popCount: index === 0 ? 2 : 1,
            }
        },
        "Mandat Synergys": {
            signatures: [{
                pageIndex: 0,
                position: {
                    x: 45,
                    y: 170,
                    size: 10,
                    lineHeight: 10,
                    color: rgb(0, 0, 0),
                }
            }],
            genNavigation: {
                titleText: "Choix du formulaire",
                listScreen: "ListMandatsSynergys",
                creationScreen: "CreateMandatSynergys",
                popCount: index === 0 ? 2 : 1,
            },
        },
        "PV réception": {
            signatures: [
                {
                    pageIndex: 0,
                    position: {
                        x: 370,
                        y: 247,
                        size: 7,
                        lineHeight: 10,
                        color: rgb(0, 0, 0),
                    }
                },
                {
                    pageIndex: 1,
                    position: {
                        x: 370,
                        y: 247,
                        size: 7,
                        lineHeight: 10,
                        color: rgb(0, 0, 0),
                    }
                },
                // {
                //     pageIndex: 2,
                //     position: {
                //         x: 375,
                //         y: 90,
                //         size: 7,
                //         lineHeight: 10,
                //         color: rgb(0, 0, 0),
                //     }
                // },
            ],
            genNavigation: {
                titleText: "Choix du formulaire",
                listScreen: "ListPvReceptions",
                creationScreen: "CreatePvReception",
                popCount: index === 0 ? 2 : 1,
            },
        },
        "Visite technique": {
            genNavigation: {
                titleText: "Choix du formulaire",
                listScreen: "",
                creationScreen: "CreateFicheTech",
                popCount: index === 0 ? 2 : 1,
            },
        },
    }

    return config
}

//##Device Info
// import DeviceInfo from "react-native-device-info"

//export const isTablet = DeviceInfo.isTablet()
export const isTablet = false 


