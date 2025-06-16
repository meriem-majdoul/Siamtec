
const queryFilters_Documents_Map = (documentType) => {
    const map = {
        create: {
            onProgress: {
                collection: "Documents",
                operation: "create",
                params: {
                    documentType,
                    isOnProgress: true
                }
            },
            onCreate: {
                collection: "Documents",
                operation: "create",
                params: {
                    documentType
                }
            }
        },
        sign: {
            onProgress: {
                collection: "Documents",
                operation: "sign",
                params: {
                    isOnProgress: true,
                    documentType
                }
            },
            onCreate: {
                collection: "Documents",
                operation: "sign",
                params: {
                    documentType
                }
            }
        }
    }
    return map
}

const queryFilters_Agenda_Map = (taskType) => {
    const map = {
        create: {
            collection: "Agenda",
            params: {
                taskType,
            }
        },
        update: {
            collection: "Agenda",
            params: {
                taskType,
            }
        }
    }
    return map
}

const buildQueryFilters = (config) => {
    const { collection, operation, params } = config
    let queryFilters = null

    if (collection === "Documents") {
        const { isOnProgress, documentType } = params
        if (operation === "create") {
            if (isOnProgress)
                queryFilters = [
                    { filter: 'project.id', operation: '==', value: '' },
                    { filter: 'type', operation: '==', value: documentType },
                    { filter: 'deleted', operation: '==', value: false },
                    { filter: 'attachment.downloadURL', operation: '!=', value: '' },
                ]
            else
                queryFilters = [
                    { filter: 'project.id', operation: '==', value: '' },
                    { filter: 'type', operation: '==', value: documentType },
                    { filter: 'deleted', operation: '==', value: false },
                ]
        }

        else if (operation === "sign") {
            if (isOnProgress)
                queryFilters = [
                    //VERIFICATION: verify if signed quote exists
                    { filter: 'project.id', operation: '==', value: '' },
                    { filter: 'type', operation: '==', value: documentType },
                    { filter: 'deleted', operation: '==', value: false },
                ]
            else queryFilters = [
                //NAVIGATION: Get id of the existing quote (to update signature)
                { filter: 'project.id', operation: '==', value: '' },
                { filter: 'type', operation: '==', value: documentType },
                { filter: 'deleted', operation: '==', value: false },
                { filter: 'attachmentSource', operation: '==', value: 'signature' }
            ]
        }
    }

    else if (collection === "Agenda") {
        const { taskType } = params
        queryFilters = [
            { filter: 'project.id', operation: '==', value: '' },
            { filter: 'type', operation: '==', value: taskType },
            { filter: 'deleted', operation: '==', value: false },
            { filter: 'status', operation: '!=', value: 'Annulé' },
        ]
    }

    return queryFilters
}


export const version9 = {
    init: {
        phaseValue: "Prospect",
        title: 'Prospect',
        instructions: '',
        phaseOrder: 1,
        followers: ['Admin', 'MAR'],
        steps: {
            prospectCreation: {
                title: 'Création prospect',
                instructions: '',
                stepOrder: 1,
                actions: [
                    //#Task make all verifications of same document on SAME ACTION (to avoid function verifyDataFill_sameDoc)
                    {
                        //General
                        id: 'nom',
                        title: 'Nom',
                        instructions: 'Saisir le Nom du client',
                        actionOrder: 1,
                        responsable: "MAR",
                        verificationType: 'data-fill',
                        verificationValue: '',
                        collection: 'Clients',
                        documentId: '', //#dynamic
                        properties: ['nom'],
                        status: 'pending',
                    },
                    {
                        id: 'nom',
                        title: 'Prénom',
                        instructions: 'Saisir le Prénom du client',
                        actionOrder: 2,
                        responsable: "MAR",
                        verificationType: 'data-fill',
                        verificationValue: '',
                        collection: 'Clients',
                        documentId: '', //#dynamic
                        properties: ['prenom'],
                        status: 'pending',
                    },
                    {
                        id: 'address',
                        title: 'Adresse postale',
                        instructions: '',
                        actionOrder: 3,
                        collection: 'Clients',
                        documentId: '', //dynamic
                        properties: ['address', 'description'],
                        verificationType: 'data-fill',
                        verificationValue: '',
                        responsable: "MAR",
                        status: 'pending',
                    },
                    {
                        id: 'phone',
                        title: 'Numéro de téléphone',
                        instructions: '',
                        actionOrder: 4,
                        collection: 'Clients',
                        documentId: '', // dynamic
                        properties: ['phone'],
                        responsable: "MAR",
                        status: 'pending',
                        verificationType: 'data-fill',
                        verificationValue: '',
                    },
                ],
            },
        },
    },
    rd1: {
        phaseValue: "Visite technique préalable",
        title: 'Visite technique préalable',
        instructions: '',
        phaseOrder: 2,
        followers: ['Admin', 'MAR'],
        steps: {
            
            housingActionFile: {
                title: "Vérification de l'éligibilité du client",
                instructions: '',
                stepOrder: 1,
                actions: [ //Audit energetique
                    {
                        id: 'eebOrEnergeticAudit',
                        title: "Vérification de l'éligibilité du client, de la catégorie et des aides complémentaires effectuée?",
                        instructions: '',
                        actionOrder: 1,
                        type: 'manual',
                        comment: '',
                        responsable: "MAR",
                        status: 'pending',
                        verificationType: 'multiple-choices',
                        choices: [
                            {
                                label: 'Annuler',
                                id: 'cancel',
                                onSelectType: 'transition',
                                nextStep: 'cancelProject',
                            },
                            {
                                label: 'Valider',
                                id: 'confirm',
                                onSelectType: 'validation',
                                nextStep: 'energeticAuditCreation',
                            },
                        ],
                    },
                ],
            },
               energeticAuditCreation: {
                title: "Importer le contrat d’accompagnement",
                instructions: '',
                stepOrder: 2,
                actions: [
                    {
                        id: 'energeticAuditCreation',
                        title: "Importer le contrat d’accompagnement   ",
                        instructions: "Importer le contrat d’accompagnement ",
                        actionOrder: 1,
                        responsable: "MAR",
                        verificationType: 'doc-creation',
                        collection: 'Documents',
                        documentId: "", //creation
                        params: {
                            documentType: "Contrat CGU-CGV",
                        },
                        //Updates documentId to view the "onProgress uploading document"
                        queryFilters_onProgressUpload: buildQueryFilters(queryFilters_Documents_Map("Contrat CGU-CGV").create.onProgress),
                        //Verification:
                        queryFilters: buildQueryFilters(queryFilters_Documents_Map("Contrat CGU-CGV").create.onCreate),
                        status: 'pending',
        
                       nextStep: 'rd2Creation',
                    },
                ]
            },
          
            
           rd2Creation: {
                title: 'Signature du contrat d’accompagnement',
                instructions: '',
                stepOrder: 3,
                actions: [
                   
                    {   //##new
                        id: 'rd2Creation',
                        title: "Signer le contrat d’accompagnement",
                        instructions: "Signature du contrat d’accompagnement par le client",
                        actionOrder: 1,
                        responsable: 'Client',
                        verificationType: 'doc-creation',
                        collection: 'Documents',
                        documentId: "", //edit
                        params: {
                            documentType: "Contrat CGU-CGV",
                            isSignature: true
                        },
                        //Updates documentId to view the "onProgress uploading document"
                        queryFilters_onProgressUpload: buildQueryFilters(queryFilters_Documents_Map("Contrat CGU-CGV").sign.onProgress),
                        //Verification:
                        queryFilters: buildQueryFilters(queryFilters_Documents_Map("Contrat CGU-CGV").sign.onCreate),
                        comment: "",
                        choices: [
                            {
                                id: 'cancel',
                                label: 'Annuler',
                                nextPhase: 'cancelProject',
                                onSelectType: 'transition',
                                commentRequired: true,
                            },
                            {
                                id: 'sign',
                                label: "Signer le contrat d’accompagnement",
                                onSelectType: 'navigation',
                            },
                        ],
                        status: 'pending',
                        nextStep: 'impDocClient',
                       
                    },
                ],
                 
            },
             impDocClient: {
                title: "Importer les documents (RI ,PI...) ",
                instructions: '',
                stepOrder: 4,
                actions: [
                    {
                        id: 'impRI',
                        title: "Importer le Relevé d'impôt  ",
                        instructions: "Importer le Relevé d'impôt du client",
                        actionOrder: 1,
                        responsable: "Client",
                        verificationType: 'doc-creation',
                        collection: 'Documents',
                        documentId: "", //creation
                        params: {
                            documentType: "Relevé d'impôt",
                        },
                        //Updates documentId to view the "onProgress uploading document"
                        queryFilters_onProgressUpload: buildQueryFilters(queryFilters_Documents_Map("Relevé d'impôt").create.onProgress),
                        //Verification:
                        queryFilters: buildQueryFilters(queryFilters_Documents_Map("Relevé d'impôt").create.onCreate),
                        status: 'pending',
                        // nextStep: 'impAuditEnrg',
                         nextPhase: 'rdn',
                    },
                    //  {
                    //     id: 'impRI',
                    //     title: "Importer le Relevé d'impôt  ",
                    //     instructions: "Importer le Relevé d'impôt du client",
                    //     actionOrder: 1,
                    //     responsable: "Client",
                    //     verificationType: 'doc-creation',
                    //     collection: 'Documents',
                    //     documentId: "", //creation
                    //     params: {
                    //         documentType: "Relevé d'impôt",
                    //     },
                    //     //Updates documentId to view the "onProgress uploading document"
                    //     queryFilters_onProgressUpload: buildQueryFilters(queryFilters_Documents_Map("Relevé d'impôt").create.onProgress),
                    //     //Verification:
                    //     queryFilters: buildQueryFilters(queryFilters_Documents_Map("Relevé d'impôt").create.onCreate),
                    //     status: 'pending',
                    //     nextPhase: 'rdn',
                    // },
                ]
            },
            quoteCreation: {
                title: "Création d'une offre précontractuelle",
                instructions: '',
                stepOrder: 5,
                actions: [
                    {   //##new
                        id: 'quoteCreation',
                        title: 'Créer une offre précontractuelle',
                        instructions: 'Créer une offre précontractuelle',
                        actionOrder: 1,
                        responsable: "MAR",
                        verificationType: 'doc-creation',
                        collection: 'Documents',
                        documentId: "", //creation
                        params: {
                            documentType: "Offre précontractuelle",
                        },
                        //Updates documentId to view the "onProgress uploading document"
                        queryFilters_onProgressUpload: buildQueryFilters(queryFilters_Documents_Map("Offre précontractuelle").create.onProgress),
                        //Verification:
                        queryFilters: buildQueryFilters(queryFilters_Documents_Map("Offre précontractuelle").create.onCreate),
                        status: 'pending',
                        nextPhase: 'rdn',

                    },
                ],
            },
        },
    },
    rdn: {
        phaseValue: "Présentation étude",
        title: 'Présentation étude',
        instructions: '',
        phaseOrder: 3,
        followers: ['Admin', 'MAR'],
        steps: {
            rd2Creation: {
                title: 'Créer un rendez-vous 2', //1. verify if RD2 exists
                instructions: '',
                stepOrder: 1,
                actions: [
                    {
                        id: 'rd2Creation',
                        title: 'Créer un rendez-vous 2',
                        instructions: '',
                        actionOrder: 1,
                        responsable: "MAR",
                        verificationType: 'doc-creation',
                        collection: 'Agenda',
                        documentId: "",
                        params: {
                            taskType: "Présentation étude",
                        },
                        queryFilters: buildQueryFilters(queryFilters_Agenda_Map("Présentation étude").create),
                        status: 'pending',
                        nextStep: 'signature',
                    }
                ],
            },
            signature: {
                title: 'Signature des documents',
                instructions: '',
                stepOrder: 2,
                actions: [
                    {   //##new (verify if Offre précontractuelle exists...)
                        id: 'quoteCreation',
                        title: 'Créer une offre précontractuelle',
                        instructions: 'Créer une offre précontractuelle',
                        actionOrder: 1,
                        responsable: "MAR",
                        verificationType: 'doc-creation',
                        collection: 'Documents',
                        documentId: "", //creation
                        params: {
                            documentType: "Offre précontractuelle",
                        },
                        //Updates documentId to view the "onProgress uploading document"
                        queryFilters_onProgressUpload: buildQueryFilters(queryFilters_Documents_Map("Offre précontractuelle").create.onProgress),
                        //Verification:
                        queryFilters: buildQueryFilters(queryFilters_Documents_Map("Offre précontractuelle").create.onCreate),
                        status: 'pending',
                    },
                    {   //##new
                        id: 'taxStatement',
                        title: "Relevé d'impôt",
                        instructions: "Importer le Relevé d'impôt du client",
                        actionOrder: 2,
                        responsable: "MAR",
                        verificationType: 'doc-creation',
                        collection: 'Documents',
                        documentId: "", //creation
                        params: {
                            documentType: "Relevé d'impôt",
                        },
                        //Updates documentId to view the "onProgress uploading document"
                        queryFilters_onProgressUpload: buildQueryFilters(queryFilters_Documents_Map("Relevé d'impôt").create.onProgress),
                        //Verification:
                        queryFilters: buildQueryFilters(queryFilters_Documents_Map("Relevé d'impôt").create.onCreate),
                        status: 'pending',
                    },
                    {   //##new
                        id: 'proofOfAddress',
                        title: "Justificatif de domicile",
                        instructions: "Importer le Justificatif de domicile du client",
                        actionOrder: 3,
                        responsable: "MAR",
                        verificationType: 'doc-creation',
                        collection: 'Documents',
                        documentId: "", //creation
                        params: {
                            documentType: "Justificatif de domicile",
                        },
                        //Updates documentId to view the "onProgress uploading document"
                        queryFilters_onProgressUpload: buildQueryFilters(queryFilters_Documents_Map("Justificatif de domicile").create.onProgress),
                        //Verification:
                        queryFilters: buildQueryFilters(queryFilters_Documents_Map("Justificatif de domicile").create.onCreate),
                        status: 'pending',
                    },
                    {   //##new
                        id: 'cadastralMap',
                        title: "Plan cadastral",
                        instructions: "Importer le Plan cadastral du client",
                        actionOrder: 4,
                        responsable: "MAR",
                        verificationType: 'doc-creation',
                        collection: 'Documents',
                        documentId: "", //creation
                        params: {
                            documentType: "Plan cadastral",
                        },
                        //Updates documentId to view the "onProgress uploading document"
                        queryFilters_onProgressUpload: buildQueryFilters(queryFilters_Documents_Map("Plan cadastral").create.onProgress),
                        //Verification:
                        queryFilters: buildQueryFilters(queryFilters_Documents_Map("Plan cadastral").create.onCreate),
                        status: 'pending',
                    },
                    {   //##new
                        id: 'propertyTax',
                        title: "Taxe foncière",
                        instructions: "Importer la Taxe foncière du client",
                        actionOrder: 5,
                        responsable: "MAR",
                        verificationType: 'doc-creation',
                        collection: 'Documents',
                        documentId: "", //creation
                        params: {
                            documentType: "Taxe foncière",
                        },
                        //Updates documentId to view the "onProgress uploading document"
                        queryFilters_onProgressUpload: buildQueryFilters(queryFilters_Documents_Map("Taxe foncière").create.onProgress),
                        //Verification:
                        queryFilters: buildQueryFilters(queryFilters_Documents_Map("Taxe foncière").create.onCreate),
                        status: 'pending',
                    },
                    //##done:task Autre documents
                    {   //##new
                        id: 'otherDocs',
                        title: 'Autre(s) document(s)',
                        instructions: "Veuillez importer tout autre document. Appuyer sur valider pour passer à l'action suivante",
                        actionOrder: 6,
                        responsable: "MAR",
                        verificationType: 'multiple-choices',
                        collection: "Documents",
                        documentId: "",
                        params: {
                            documentType: "Autre",
                        },
                        choices: [
                            { label: 'Continuer', id: 'confirm', onSelectType: 'validation' },
                            { label: 'Importer', id: 'upload', onSelectType: 'navigation' },
                        ],
                        status: 'pending',
                    },
                    {   //##new
                        id: 'signedQuoteCreation',
                        title: "Signer l'offre précontractuelle",
                        instructions: "Signature de l'offre précontractuelle par le client",
                        actionOrder: 7,
                        responsable: 'Client',
                        verificationType: 'doc-creation',
                        collection: 'Documents',
                        documentId: "", //edit
                        params: {
                            documentType: "Offre précontractuelle",
                            isSignature: true
                        },
                        //Updates documentId to view the "onProgress uploading document"
                        queryFilters_onProgressUpload: buildQueryFilters(queryFilters_Documents_Map("Offre précontractuelle").sign.onProgress),
                        //Verification:
                        queryFilters: buildQueryFilters(queryFilters_Documents_Map("Offre précontractuelle").sign.onCreate),
                        comment: "",
                        choices: [
                            {
                                id: 'cancel',
                                label: 'Annuler',
                                nextPhase: 'cancelProject',
                                onSelectType: 'transition',
                                commentRequired: true,
                            },
                            {
                                id: 'sign',
                                label: "Signer l'offre précontractuelle",
                                onSelectType: 'navigation',
                            },
                        ],
                        status: 'pending',
                    },
                    {   //##new
                        id: 'mandatMPRCreation',
                        title: 'Créer un mandat MaPrimeRénov',
                        instructions: 'Créer un mandat MaPrimeRénov',
                        actionOrder: 8,
                        responsable: "MAR",
                        verificationType: 'doc-creation',
                        collection: 'Documents',
                        documentId: "", //creation
                        params: {
                            documentType: "Mandat MaPrimeRénov",
                        },
                        //Updates documentId to view the "onProgress uploading document"
                        queryFilters_onProgressUpload: buildQueryFilters(queryFilters_Documents_Map("Mandat MaPrimeRénov").create.onProgress),
                        //Verification:
                        queryFilters: buildQueryFilters(queryFilters_Documents_Map("Mandat MaPrimeRénov").create.onCreate),
                        status: 'pending',
                    },
                    {   //##new
                        id: 'signedMandatMPRCreation',
                        title: 'Signer le mandat MaPrimeRénov',
                        instructions: 'Signer le mandat MaPrimeRénov',
                        actionOrder: 9,
                        responsable: 'Client',
                        verificationType: 'doc-creation',
                        collection: 'Documents',
                        documentId: "", //edit
                        params: {
                            documentType: "Mandat MaPrimeRénov",
                            isSignature: true
                        },
                        //Updates documentId to view the "onProgress uploading document"
                        queryFilters_onProgressUpload: buildQueryFilters(queryFilters_Documents_Map("Mandat MaPrimeRénov").sign.onProgress),
                        //Verification:
                        queryFilters: buildQueryFilters(queryFilters_Documents_Map("Mandat MaPrimeRénov").sign.onCreate),
                        comment: "",
                        choices: [
                            {
                                id: 'cancel',
                                label: 'Annuler',
                                nextPhase: 'cancelProject',
                                onSelectType: 'transition',
                                commentRequired: true,
                            },
                            {
                                id: 'sign',
                                label: 'Signer le mandat MaPrimeRénov',
                                onSelectType: 'navigation',
                            },
                        ],
                        status: 'pending',
                        nextStep: "payModeValidation"
                    },
                ],
            },
            payModeValidation: {
                title: 'Modalité de paiement',
                instructions: '',
                stepOrder: 3,
                actions: [
                    {
                        id: 'payModeChoice',
                        title: 'Modalité de paiement',
                        instructions: '',
                        actionOrder: 1,
                        type: 'manual',
                        comment: '',
                        verificationType: 'multiple-choices',
                        choices: [
                            {
                                label: 'Paiement comptant',
                                id: 'cashPayment',
                                onSelectType: 'commentPicker',
                            },
                            {
                                label: 'Financement',
                                id: 'financing',
                                onSelectType: 'commentPicker',
                            },
                        ],
                        responsable: "MAR",
                        status: 'pending',
                    },
                    {
                        id: 'financingAidsWebsite',
                        title: 'Propositions de financement',
                        instructions: 'Naviguer vers le lien du partenaire financier sélectionné, et suivre la procédure selon le partenaire choisi.',
                        actionOrder: 2,
                        type: 'manual',
                        comment: '',
                        verificationType: 'multiple-choices',
                        choices: [
                            {
                                label: 'Adhefi.com',
                                id: 'cashPayment',
                                image: 'sofincoLogo',
                                onSelectType: 'openLink',
                                link: 'https://www.adhefi.com',
                            },
                            {
                                label: 'Moncofidispro.fr',
                                id: 'financing',
                                image: 'cofidisLogo',
                                onSelectType: 'openLink',
                                link: 'https://www.moncofidispro.fr',
                            },
                            {
                                label: 'domofinance.com',
                                id: 'financing',
                                image: 'domofinanceLogo',
                                onSelectType: 'openLink',
                                link: 'https://www.domofinance.com/login',
                            },
                            {
                                label: 'Continuer',
                                id: 'confirm',
                                onSelectType: 'validation',
                            },
                        ],
                        responsable: "MAR",
                        status: 'pending',
                    },
                    {
                        id: 'financingAidsSelection',
                        title: 'Selection du partenaire financier',
                        instructions: 'Selectionnez le partenaire financier de ce projet.',
                        actionOrder: 3,
                        type: 'manual',
                        comment: '',
                        verificationType: 'multiple-choices',
                        choices: [
                            {
                                label: 'Adhefi.com',
                                id: 'cashPayment',
                                image: 'sofincoLogo',
                                onSelectType: 'commentPicker',
                                //nextStep: 'technicalVisitCreation',
                            },
                            {
                                label: 'Moncofidispro.fr',
                                id: 'financing',
                                image: 'cofidisLogo',
                                onSelectType: 'commentPicker',
                                //nextStep: 'technicalVisitCreation',
                            },
                            {
                                label: 'domofinance.com',
                                id: 'financing',
                                image: 'domofinanceLogo',
                                onSelectType: 'commentPicker',
                               // nextStep: 'technicalVisitCreation',
                            },
                            {
                                label: 'Autres',
                                id: 'other',
                                onSelectType: 'commentPicker',
                              //  nextStep: 'technicalVisitCreation',
                            },
                        ],
                        responsable: "MAR",
                        status: 'pending',
                    },
                    {
                        id: 'conformityValidation',
                        title: "Validation du contrôle de conformité",
                        instructions: '',
                        actionOrder: 4,
                        type: 'manual',
                        comment: '',
                        responsable: 'MAR',
                        status: 'pending',
                        verificationType: 'multiple-choices',
                        choices: [
                            {
                                label: 'Annuler',
                                id: 'cancel',
                                nextPhase: 'cancelProject',
                                onSelectType: 'transition',
                                commentRequired: true,
                            },
                            {
                                label: 'Valider',
                                id: 'confirm',
                                onSelectType: 'validation',
                                nextStep: 'technicalVisitCreation',
                            },
                        ],
                    },
                    //Montant de l'acompte? (zone de saisie) //operation: add it to bill sub attributes
                ],
            },
            technicalVisitCreation: {
                title: "Création d'une visite technique",
                instructions: '',
                stepOrder: 4,
                actions: [
                    {
                        id: 'technicalVisitCreation',
                        title: 'Créer une visite technique',
                        instructions: 'Créer une visite technique',
                        actionOrder: 1,
                        responsable: 'Entreprise technique', 
                        verificationType: 'doc-creation',
                        collection: 'Agenda',
                        documentId: "",
                        params: { 
                            taskType: "Visite technique",
                        },
                        queryFilters: buildQueryFilters(queryFilters_Agenda_Map("Visite technique").create),
                        status: 'pending',
                        nextPhase: 'technicalVisitManagement',
                    },
                ],
            },
        },
    },
    technicalVisitManagement: {
        phaseValue: "Visite technique",
        title: 'Visite technique',
        instructions: '',
        phaseOrder: 4,
        followers: ['Admin', 'Entreprise technique', 'Équipe technique'],
        steps: {
            siteCreation: {
                title: 'Planification visite technique',
                instructions: '', // Example: process.init.create-prospect.nom.title
                stepOrder: 1,
                actions: [
                    {
                        id: 'technicalVisitCreation',
                        title: 'Créer une visite technique',
                        instructions: 'Créer une visite technique',
                        actionOrder: 1,
                        responsable: 'Entreprise technique', //Entreprise technique
                        verificationType: 'doc-creation',
                        collection: 'Agenda',
                        documentId: "",
                        params: {
                            taskType: "Visite technique",
                        },
                        queryFilters: buildQueryFilters(queryFilters_Agenda_Map("Visite technique").create),
                        status: 'pending',
                    },
                    {
                        id: 'technicalVisitValidation',
                        title: 'Valider la date de la visite technique',
                        instructions: 'Valider la date de la visite technique',
                        actionOrder: 2,
                        responsable: 'Entreprise technique',  //Entreprise technique
                        verificationType: 'doc-creation',
                        collection: 'Agenda',
                        documentId: "",
                        params: {
                            taskType: "Visite technique",
                        },
                        queryFilters: buildQueryFilters(queryFilters_Agenda_Map("Visite technique").create),
                        comment: '', //motif
                        choices: [
                            {
                                id: 'confirm',
                                label: 'Valider',
                                onSelectType: 'validation',
                                operation: {
                                    collection: 'Clients',
                                    docId: '',
                                    type: 'update',
                                    field: 'status',
                                    value: 'active',
                                },
                            },
                            {
                                id: 'edit',
                                label: 'Modifier la date',
                                onSelectType: 'navigation',
                            },
                        ],
                        status: 'pending',
                    },
                    {
                        id: 'poseurAffectation',
                        title: 'Affecter un technicien à la visite technique',
                        instructions: 'Affecter un technicien à la visite technique',  //Entreprise technique
                        actionOrder: 3,
                        responsable: 'Entreprise technique',
                        collection: 'Agenda',
                        documentId: "",
                        params: {
                            taskType: "Visite technique",
                        },
                        queryFilters: buildQueryFilters(queryFilters_Agenda_Map("Visite technique").update),
                        verificationType: 'multiple-choices',
                        comment: '',
                        choices: [
                            {
                                id: 'confirm',
                                label: 'Continuer',
                                onSelectType: 'validation',
                            },
                            {
                                id: 'edit',
                                label: 'Modifier le technicien',
                                onSelectType: 'navigation',
                            }, //#ask: isn't the poseur already predefined with project as technical contact ?
                        ],
                        status: 'pending',
                    },
                    //##done:task: Choisir les types de travaux
                    {
                        id: 'workTypesSelection',
                        title: 'Selectionnez les types de travaux',  //technicien
                        instructions: "Appuyer sur modifier pour selectionner les types de travaux. Ou appuyer sur valider pour passer à l'action suivante.",
                        actionOrder: 4,
                        collection: "Projects",
                        params: {
                            screenParams: {
                                sections: { info: { projectWorkTypes: true } },
                            }
                        },
                        verificationType: 'multiple-choices',
                        comment: '', //motif
                        choices: [
                            // { label: 'Ignorer', id: 'cancel', onSelectType: 'validation' },
                            {
                                label: 'Continuer',
                                id: 'confirm',
                                onSelectType: 'validation',
                                nextStep: 'technicalVisitFile',
                            },
                            {
                                label: 'Modifier',
                                id: 'edit',
                                onSelectType: 'navigation'
                            },
                        ],
                        responsable: 'Entreprise technique',
                        status: 'pending',
                    },
                ],
            },
            technicalVisitFile: {
                title: 'Remplissage visite technique',
                instructions: '',
                stepOrder: 2,
                actions: [
                    //#task: add Visite technique (montant de l'accompte available) (dynamic: false, public: true)
                    {   //##new
                        id: 'technicalVisitFileCreation',
                        title: 'Remplir la visite technique',
                        instructions: 'Remplir la visite technique',
                        actionOrder: 1,
                        responsable: 'Entreprise technique',
                        verificationType: 'doc-creation',
                        collection: 'Documents',
                        documentId: "", //creation
                        params: {
                            documentType: "Visite technique",
                        },
                        //Updates documentId to view the "onProgress uploading document"
                        queryFilters_onProgressUpload: buildQueryFilters(queryFilters_Documents_Map("Visite technique").create.onProgress),
                        //Verification:
                        queryFilters: buildQueryFilters(queryFilters_Documents_Map("Visite technique").create.onCreate),
                        status: 'pending',
                    },
                    {

                        id: 'technicalVisitChoice',
                        title: 'Voulez-vous cloturer la visite technique',
                        instructions: 'Voulez-vous cloturer la visite technique',
                        actionOrder: 2,
                        responsable: 'Entreprise technique',
                        collection: 'Agenda',
                        documentId: "",
                        params: {
                            taskType: "Visite technique",
                        },
                        queryFilters: buildQueryFilters(queryFilters_Agenda_Map("Visite technique").update),
                        verificationType: 'multiple-choices',
                        comment: '',
                        choices: [
                            {
                                id: 'cancel',
                                label: 'Abandonner',
                                nextPhase: 'cancelProject',
                                onSelectType: 'transition',
                                commentRequired: true,
                                operation: { type: 'update', field: 'status', value: 'Annulé' },
                            },
                            {
                                id: 'confirm',
                                label: 'Oui',
                                onSelectType: 'validation',
                                operation: { type: 'update', field: 'status', value: 'Terminé' },
                            },
                        ],
                        status: 'pending',
                    },
                    //##done:task: Signer la VT
                    {   //##new
                        id: 'signedVTCreation',
                        title: 'Signer la visite technique',
                        instructions: 'Signer la visite technique',
                        actionOrder: 3,
                        responsable: 'Client',
                        verificationType: 'doc-creation',
                        collection: 'Documents',
                        documentId: "", //edit
                        params: {
                            documentType: "Visite technique",
                            isSignature: true
                        },
                        //Updates documentId to view the "onProgress uploading document"
                        queryFilters_onProgressUpload: buildQueryFilters(queryFilters_Documents_Map("Visite technique").sign.onProgress),
                        //Verification:
                        queryFilters: buildQueryFilters(queryFilters_Documents_Map("Visite technique").sign.onCreate),
                        comment: "",
                        choices: [
                            {
                                id: 'cancel',
                                label: 'Annuler',
                                nextPhase: 'cancelProject',
                                onSelectType: 'transition',
                                commentRequired: true,
                            },
                            {
                                id: 'sign',
                                label: 'Signer la visite technique',
                                onSelectType: 'navigation',
                            },
                        ],
                        status: 'pending',
                        nextStep: "uploadQuote"
                    },
                ],
            },
            uploadQuote: {
                title: "Devis",
                instructions: '',
                stepOrder: 3,
                actions: [
                    {   //##new
                        id: 'uploadQuote',
                        title: 'Importer un devis',
                        instructions: 'Importer un devis de votre appareil',
                        actionOrder: 1,
                        responsable: 'Équipe technique',
                        verificationType: 'doc-creation',
                        collection: 'Documents',
                        documentId: "", //creation
                        params: {
                            documentType: "Devis",
                        },
                        //Updates documentId to view the "onProgress uploading document"
                        queryFilters_onProgressUpload: buildQueryFilters(queryFilters_Documents_Map("Devis").create.onProgress),
                        //Verification:
                        queryFilters: buildQueryFilters(queryFilters_Documents_Map("Devis").create.onCreate),
                        status: 'pending',
                        nextPhase: "installation"
                    },
                ],
            },
        },
    },
    installation: {
        phaseValue: "En attente d'installation",
        title: "En attente d'installation",
        instructions: '',
        phaseOrder: 5,
        followers: ['Admin', 'Entreprise technique', 'Équipe technique'],
        steps: {
            installationPreparation: {
                title: "Préparation de l'installation",
                instructions: '', // Example: process.init.create-prospect.nom.title
                stepOrder: 1,
                actions: [
                    {
                        id: 'orderInstallationMaterial',
                        title: "Commande du matériel",
                        instructions: '',
                        actionOrder: 1,
                        type: 'manual',
                        comment: '',
                        responsable: 'Équipe technique',
                        status: 'pending',
                        verificationType: 'multiple-choices',
                        choices: [
                            {
                                label: 'Annuler',
                                id: 'cancel',
                                nextPhase: 'cancelProject',
                                onSelectType: 'transition',
                                commentRequired: true,
                            },
                            {
                                label: 'Valider',
                                id: 'confirm',
                                onSelectType: 'validation'
                            },
                        ],
                    },
                    {
                        id: 'receptionInstallationMaterial',
                        title: "Réception du matériel",
                        instructions: '',
                        actionOrder: 2,
                        type: 'manual',
                        comment: '',
                        responsable: 'Équipe technique',
                        status: 'pending',
                        verificationType: 'multiple-choices',
                        choices: [
                            {
                                label: 'Annuler',
                                id: 'cancel',
                                nextPhase: 'cancelProject',
                                onSelectType: 'transition',
                                commentRequired: true,
                            },
                            {
                                label: 'Valider',
                                id: 'confirm',
                                onSelectType: 'validation'
                            },
                        ],
                    },
                    {
                        id: 'installationDateProposition',
                        title: "Proposition de date",
                        instructions: '',
                        actionOrder: 3,
                        type: 'manual',
                        comment: '',
                        responsable: 'Équipe technique',
                        status: 'pending',
                        verificationType: 'multiple-choices',
                        choices: [
                            {
                                label: 'Annuler',
                                id: 'cancel',
                                nextPhase: 'cancelProject',
                                onSelectType: 'transition',
                                commentRequired: true,
                            },
                            {
                                label: 'Valider',
                                id: 'confirm',
                                onSelectType: 'validation'
                            },
                        ],
                    },
                    {
                        id: 'installationConfirmation',
                        title: "Confirmation d'installation",
                        instructions: '',
                        actionOrder: 4,
                        type: 'manual',
                        comment: '',
                        responsable: 'Équipe technique',
                        status: 'pending',
                        verificationType: 'multiple-choices',
                        choices: [
                            {
                                label: 'Annuler',
                                id: 'cancel',
                                nextPhase: 'cancelProject',
                                onSelectType: 'transition',
                                commentRequired: true,
                            },
                            {
                                label: 'Valider',
                                id: 'confirm',
                                onSelectType: 'transition',
                                nextStep: 'installationCreation',
                            },
                        ],
                    },
                ],
            },
            installationCreation: {
                title: 'Plannification installation',
                instructions: '',
                stepOrder: 2,
                actions: [
                    {
                        id: 'installationCreation',
                        title: 'Créer une tâche de type installation',
                        instructions: 'Créer une tâche de type installation',
                        actionOrder: 1,
                        responsable: 'Équipe technique',
                        verificationType: 'doc-creation',
                        collection: 'Agenda',
                        documentId: "",
                        params: {
                            taskType: "Installation",
                        },
                        queryFilters: buildQueryFilters(queryFilters_Agenda_Map("Installation").create),
                        status: 'pending',
                        nextStep: 'installationChoice',
                    },
                ],
            },
            installationChoice: {
                title: "Mise à jour du statut de l'installation",
                instructions: '',
                stepOrder: 3,
                actions: [
                    {
                        id: 'installationChoice1',
                        title: "Mettre à jour le statut de l'installation (1)",
                        instructions: "Mettre à jour le statut de l'installation (1)",
                        actionOrder: 1,
                        responsable: 'Équipe technique',
                        collection: 'Agenda',
                        documentId: "",
                        params: {
                            taskType: "Installation",
                        },
                        queryFilters: buildQueryFilters(queryFilters_Agenda_Map("Installation").create),
                        verificationType: 'multiple-choices',
                        comment: '', //motif
                        choices: [
                            {
                                id: 'block',
                                label: 'Bloquée',
                                onSelectType: 'validation',
                                commentRequired: true,
                                operation: {
                                    type: 'update',
                                    field: 'status',
                                    value: 'En attente',
                                },
                            },
                            {
                                id: 'confirm',
                                label: 'Finalisée',
                                nextStep: 'pvCreation',
                                onSelectType: 'transition',
                                operation: { type: 'update', field: 'status', value: 'Terminé' },
                            },
                        ],
                        status: 'pending',
                    },
                    {
                        id: 'installationChoice2',
                        title: "Mettre à jour le statut de l'installation (2)",
                        instructions: "Mettre à jour le statut de l'installation (2)",
                        actionOrder: 2,
                        responsable: 'Équipe technique',
                        collection: 'Agenda',
                        documentId: "",
                        params: {
                            taskType: "Installation",
                        },
                        queryFilters: buildQueryFilters(queryFilters_Agenda_Map("Installation").create),
                        verificationType: 'multiple-choices',
                        comment: '', //motif            
                        choices: [
                            {
                                label: 'Abandonnée',
                                id: 'cancel',
                                nextPhase: 'cancelProject',
                                onSelectType: 'transition',
                                commentRequired: true,
                                operation: { type: 'update', field: 'status', value: 'Annulé' },
                            },
                            {
                                label: 'En cours',
                                id: 'confirm',
                                onSelectType: 'actionRollBack',
                                operation: { type: 'update', field: 'status', value: 'En cours' },
                            },
                        ],
                        responsable: 'Équipe technique',
                        status: 'pending',
                        forceValidation: true,
                    },
                ],
            },
            pvCreation: {
                title: "PV réception",
                instructions: '',
                stepOrder: 4,
                actions: [
                    {   //##new
                        id: 'pvCreation',
                        title: 'Créer un PV réception',
                        instructions: 'Créer un PV réception',
                        actionOrder: 1,
                        responsable: 'Équipe technique',
                        verificationType: 'doc-creation',
                        collection: 'Documents',
                        documentId: "", //creation
                        params: {
                            documentType: "PV réception",
                        },
                        //Updates documentId to view the "onProgress uploading document"
                        queryFilters_onProgressUpload: buildQueryFilters(queryFilters_Documents_Map("PV réception").create.onProgress),
                        //Verification:
                        queryFilters: buildQueryFilters(queryFilters_Documents_Map("PV réception").create.onCreate),
                        status: 'pending',
                    },
                    {   //##new
                        id: 'signPV',
                        title: 'Signer le PV réception',
                        instructions: 'Signer le PV réception',
                        actionOrder: 2,
                        responsable: 'Client',
                        verificationType: 'doc-creation',
                        collection: 'Documents',
                        documentId: "", //edit
                        params: {
                            documentType: "PV réception",
                            isSignature: true
                        },
                        //Updates documentId to view the "onProgress uploading document"
                        queryFilters_onProgressUpload: buildQueryFilters(queryFilters_Documents_Map("PV réception").sign.onProgress),
                        //Verification:
                        queryFilters: buildQueryFilters(queryFilters_Documents_Map("PV réception").sign.onCreate),
                        status: 'pending',
                        nextStep: 'attestationFluid',
                    },
                ],
            },
            attestationFluid: {
                title: "Attestation fluide",
                instructions: '',
                stepOrder: 5,
                actions: [
                    {
                        id: 'attestationCreation',
                        title: 'Créer une attestation fluide',
                        instructions: 'Créer une attestation fluide',
                        actionOrder: 1,
                        responsable: 'Équipe technique',
                        verificationType: 'doc-creation',
                        collection: 'Documents',
                        documentId: "", //creation
                        params: {
                            documentType: "Attestation fluide",
                        },
                        //Updates documentId to view the "onProgress uploading document"
                        queryFilters_onProgressUpload: buildQueryFilters(queryFilters_Documents_Map("Attestation fluide").create.onProgress),
                        //Verification:
                        queryFilters: buildQueryFilters(queryFilters_Documents_Map("Attestation fluide").create.onCreate),
                        status: 'pending',
                        nextStep: 'reserve',
                    }
                ],
            },
            reserve: {
                title: 'Réserve',
                instructions: '',
                stepOrder: 6,
                actions: [
                    {
                        id: 'reserve',
                        title: 'Êtes-vous satisfait de notre travail ?',
                        instructions: '',
                        actionOrder: 1,
                        type: 'manual',
                        verificationType: 'multiple-choices',
                        comment: '', //#task: comments are joined (separated by ;)
                        choices: [
                            {
                                label: 'NON',
                                id: 'comment',
                                nextStep: 'catchupCreation',
                                onSelectType: 'transition',
                                commentRequired: true,
                            }, //User's manual choice will route to next step (confirmRd2, postponeRd2 or cancelRd2) (it will technically set "nextStep" property)
                            {
                                label: 'OUI',
                                id: 'confirm',
                                nextStep: 'facturationOption1',
                                onSelectType: 'transition',
                            },
                        ],
                        responsable: 'Client',
                        status: 'pending',
                    },
                ],
            },
            catchupCreation: {
                title: 'Plannification tâche rattrapage',
                instructions: '',
                stepOrder: 7,
                actions: [
                    {
                        id: 'catchupCreation',
                        title: 'Créer une tâche rattrapage',
                        instructions: 'Créer une tâche rattrapage',
                        actionOrder: 1,
                        responsable: 'Équipe technique',
                        verificationType: 'doc-creation',
                        collection: 'Agenda',
                        documentId: "",
                        params: {
                            taskType: "Installation",
                        },
                        queryFilters: buildQueryFilters(queryFilters_Agenda_Map("Rattrapage").create),
                        status: 'pending',
                    },
                    {
                        id: 'catchupChoice',
                        title: 'Finaliser la tâche rattrapage',
                        instructions: 'Finaliser la tâche rattrapage',
                        actionOrder: 3,
                        responsable: 'Équipe technique',
                        verificationType: 'multiple-choices',
                        choices: [
                            {
                                id: 'finish',
                                label: 'Finaliser',
                                nextStep: 'reserve',
                                onSelectType: 'transition',
                                operation: { type: 'update', field: 'status', value: 'Terminé' },
                            },
                        ],
                        collection: 'Agenda',
                        documentId: "",
                        params: {
                            taskType: "Rattrapage",
                        },
                        queryFilters: buildQueryFilters(queryFilters_Agenda_Map("Rattrapage").create),
                        status: 'pending',
                    },
                ],
            },
            //##draft
            // poseurValidation: {
            //     title: 'Validation du technicien',
            //     instructions: '',
            //     stepOrder: 6,
            //     actions: [ 
            //         {
            //             id: 'maintainanceContractChoice',
            //             title: 'Voulez-vous initier le contrat de maintenance ?',
            //             instructions: '',
            //             actionOrder: 1,
            //             verificationType: 'multiple-choices',
            //             comment: '', //motif
            //             choices: [
            //                 {
            //                     label: 'Décider plus tard, passer à la facturation',
            //                     id: 'cancel',
            //                     nextStep: 'facturationOption1',
            //                     onSelectType: 'transition',
            //                     commentRequired: true,
            //                 }, //User's manual choice will route to next step (confirmRd2, postponeRd2 or cancelRd2) (it will technically set "nextStep" property)
            //                 {
            //                     label: 'OUI',
            //                     id: 'confirm',
            //                     nextStep: 'maintainanceContract',
            //                     onSelectType: 'transition',
            //                 },
            //             ],
            //             responsable: 'Équipe technique',
            //             status: 'pending',
            //         },
            //     ],
            // },
            // maintainanceContract: {
            //     title: 'Contrat maintenance',
            //     instructions: '',
            //     stepOrder: 7,
            //     actions: [
            //         {
            //             id: 'commercialPropositionChoice',
            //             title: 'Accepter la proposition commerciale',
            //             instructions: '',
            //             actionOrder: 1,
            //             type: 'manual', //Check manually
            //             verificationType: 'multiple-choices',
            //             comment: '', //motif
            //             choices: [
            //                 {
            //                     label: 'Décider plus tard, passer à la facturation',
            //                     id: 'skip',
            //                     nextStep: 'facturationOption1',
            //                     onSelectType: 'transition',
            //                 },
            //                 { label: 'Accepter', id: 'confirm', onSelectType: 'validation' },
            //             ],
            //             responsable: 'Équipe technique',
            //             status: 'pending',
            //         },
            //         {   //##new
            //             id: 'mandatSepaCreation',
            //             title: 'Créer/Importer un mandat SEPA',
            //             instructions: 'Créer/Importer un mandat SEPA',
            //             actionOrder: 2,
            //             responsable: 'Équipe technique',
            //             verificationType: 'doc-creation',
            //             collection: 'Documents',
            //             documentId: "", //creation
            //             params: {
            //                 documentType: "Mandat SEPA",
            //             },
            //             //Updates documentId to view the "onProgress uploading document"
            //             queryFilters_onProgressUpload: buildQueryFilters(queryFilters_Documents_Map("Mandat SEPA").create.onProgress),
            //             //Verification:
            //             queryFilters: buildQueryFilters(queryFilters_Documents_Map("Mandat SEPA").create.onCreate),
            //             comment: '', //motif
            //             choices: [
            //                 {
            //                     id: 'skip',
            //                     label: 'Décider plus tard, passer à la facturation',
            //                     nextStep: 'facturationOption1',
            //                     onSelectType: 'transition',
            //                 },
            //                 {
            //                     id: 'upload',
            //                     label: 'Importer le document',
            //                     onSelectType: 'navigation',
            //                 },
            //             ],
            //             status: 'pending',
            //         },
            //         {   //##new
            //             id: 'signedSEPACreation',
            //             title: 'Signer le mandat SEPA',
            //             instructions: 'Signer le mandat SEPA',
            //             actionOrder: 3,
            //             responsable: 'Client',
            //             verificationType: 'doc-creation',
            //             collection: 'Documents',
            //             documentId: "", //edit
            //             params: {
            //                 documentType: "Mandat SEPA",
            //                 isSignature: true
            //             },
            //             //Updates documentId to view the "onProgress uploading document"
            //             queryFilters_onProgressUpload: buildQueryFilters(queryFilters_Documents_Map("Mandat SEPA").sign.onProgress),
            //             //Verification:
            //             queryFilters: buildQueryFilters(queryFilters_Documents_Map("Mandat SEPA").sign.onCreate),
            //             comment: "",
            //             choices: [
            //                 {
            //                     id: 'cancel',
            //                     label: 'Décider plus tard, passer à la facturation',
            //                     nextStep: 'facturationOption1',
            //                     onSelectType: 'transition',
            //                     commentRequired: true,
            //                 },
            //                 {
            //                     id: 'sign',
            //                     label: 'Signer le mandat SEPA',
            //                     onSelectType: 'navigation',
            //                 },
            //             ],
            //             status: 'pending',
            //         },
            //         {   //##new
            //             id: 'contractCreation',
            //             title: 'Créer/Importer un contrat',
            //             instructions: 'Créer/Importer un contrat',
            //             actionOrder: 4,
            //             responsable: 'Équipe technique',
            //             verificationType: 'doc-creation',
            //             collection: 'Documents',
            //             documentId: "", //creation
            //             params: {
            //                 documentType: "Contrat CGU-CGV",
            //             },
            //             //Updates documentId to view the "onProgress uploading document"
            //             queryFilters_onProgressUpload: buildQueryFilters(queryFilters_Documents_Map("Contrat CGU-CGV").create.onProgress),
            //             //Verification:
            //             queryFilters: buildQueryFilters(queryFilters_Documents_Map("Contrat CGU-CGV").create.onCreate),
            //             comment: '', //motif
            //             choices: [
            //                 {
            //                     label: 'Décider plus tard, passer à la facturation',
            //                     id: 'skip',
            //                     nextStep: 'facturationOption1',
            //                     onSelectType: 'transition',
            //                 },
            //                 {
            //                     label: 'Importer le contrat',
            //                     id: 'upload',
            //                     onSelectType: 'navigation',
            //                 },
            //             ],
            //             status: 'pending',
            //         },
            //         {   //##new
            //             id: 'signedContractCreation',
            //             title: 'Signer le contrat',
            //             instructions: 'Signer le contrat',
            //             actionOrder: 5,
            //             responsable: 'Client',
            //             verificationType: 'doc-creation',
            //             collection: 'Documents',
            //             documentId: "", //edit
            //             params: {
            //                 documentType: "Contrat CGU-CGV",
            //                 isSignature: true
            //             },
            //             //Updates documentId to view the "onProgress uploading document"
            //             queryFilters_onProgressUpload: buildQueryFilters(queryFilters_Documents_Map("Contrat CGU-CGV").sign.onProgress),
            //             //Verification:
            //             queryFilters: buildQueryFilters(queryFilters_Documents_Map("Contrat CGU-CGV").sign.onCreate),
            //             comment: "",
            //             choices: [
            //                 {
            //                     label: 'Décider plus tard, passer à la facturation',
            //                     id: 'cancel',
            //                     nextStep: 'facturationOption1',
            //                     onSelectType: 'transition',
            //                     commentRequired: true,
            //                 },
            //                 {
            //                     label: 'Signer le contrat',
            //                     id: 'sign',
            //                     onSelectType: 'navigation',
            //                 },
            //             ],
            //             status: 'pending',
            //             nextStep: 'facturationOption1',
            //         },
            //         //#task: Add last action multi-choice (contrat "en cours" or "terminé")
            //     ],
            // },
            facturationOption1: {
                //no conversion
                title: 'Facturation',
                instructions: '',
                stepOrder: 8,
                actions: [
                    {
                        id: 'billCreation',
                        title: 'Créer une facture',
                        instructions: 'Créer une facture',
                        actionOrder: 1,
                        responsable: 'Équipe technique',
                        verificationType: 'doc-creation',
                        collection: 'Documents',
                        documentId: "", //creation
                        params: {
                            documentType: "Facture",
                        },
                        //Updates documentId to view the "onProgress uploading document"
                        queryFilters_onProgressUpload: buildQueryFilters(queryFilters_Documents_Map("Facture").create.onProgress),
                        //Verification:
                        queryFilters: buildQueryFilters(queryFilters_Documents_Map("Facture").create.onCreate),
                        status: 'pending',
                        nextStep: 'paymentStatus',
                    }
                    //##done:task: Delete "Signer la facture"
                ],
            },
            paymentStatus: {
                title: 'Finalisation de la facturation',
                instructions: '',
                stepOrder: 9,
                actions: [
                    {
                        id: 'billingAmount',
                        title: 'Saisir les montants restant à payer par les aides',
                        instructions: "Veuillez saisir les montants restant à payer par les aides",
                        actionOrder: 1,
                        collection: 'Projects',
                        params: {
                            screenParams: {
                                sections: { billing: { billAids: true } },
                            }
                        },
                        verificationType: 'multiple-choices',
                        choices: [
                            {
                                id: 'confirm',
                                label: 'Continuer',
                                onSelectType: 'validation',
                            },
                            {
                                id: 'edit',
                                label: 'Modifier',
                                onSelectType: 'navigation'
                            },
                        ],
                        screenPush: true,
                        //Comment
                        comment: '',
                        //Others
                        responsable: 'Entreprise technique',
                        status: 'pending',
                    },
                    {
                        id: 'advValidation',
                        title: "Validation de la facture par le DAF", //#task allow adv to view Offre précontractuelle before validating (multi-choice: voir/valider)
                        instructions: '',
                        actionOrder: 2,
                        type: 'manual',
                        comment: '',
                        responsable: 'Admin',
                        status: 'pending',
                        verificationType: 'multiple-choices',
                        choices: [
                            {
                                label: 'Annuler',
                                id: 'cancel',
                                nextPhase: 'cancelProject',
                                onSelectType: 'transition',
                                commentRequired: true,
                            },
                            {
                                label: 'Valider',
                                id: 'confirm',
                                onSelectType: 'validation'
                            },
                        ],
                    },
                    //##done:task: Ajouter montant HT + TTC ??
                    {
                        id: 'billingAmount',
                        title: 'Saisir le montant de la facture',
                        instructions: "Veuillez saisir le montant HT et TTC de la facture.",
                        actionOrder: 3,
                        //Verification
                        collection: 'Projects',
                        documentId: '', //#dynamic
                        properties: ['bill', "amount"],
                        params: {
                            screenParams: {
                                sections: { billing: { billAmount: true } },
                            }
                        },
                        screenPush: true,
                        //Comment
                        comment: '',
                        //Verification
                        type: 'auto',
                        verificationType: 'data-fill',
                        verificationValue: '',
                        //Others
                        responsable: 'Équipe technique',
                        status: 'pending',
                        nextStep: 'clientReview',
                    },
                ]
            },
            // paymentStatus: {
            //     //conversion
            //     title: 'Finalisation de la facturation',
            //     instructions: '',
            //     stepOrder: 9,
            //     actions: [
            //         {
            //             //##task: add multiCommentsPicker
            //             id: 'paymentStatus',
            //             title: 'Modifier le statut du paiement',
            //             instructions: '',
            //             actionOrder: 1,
            //             type: 'manual',
            //             verificationType: 'multiple-choices',
            //             onSelectType: 'multiCommentsPicker', //only in multiCommentsPicker
            //             comment: '',
            //             choices: [
            //                 {
            //                     label: 'Attente paiement client',
            //                     id: 'pending',
            //                     onSelectType: 'multiCommentsPicker',
            //                     selected: false,
            //                     stay: true,
            //                 },
            //                 {
            //                     label: 'Attente paiement financement',
            //                     id: 'pending',
            //                     onSelectType: 'multiCommentsPicker',
            //                     selected: false,
            //                     stay: true,
            //                 },
            //                 //##task: Diviser Attente paiement aide en MPR et CEE
            //                 {
            //                     label: 'Attente paiement aide MPR',
            //                     id: 'pending',
            //                     onSelectType: 'multiCommentsPicker',
            //                     selected: false,
            //                     stay: true,
            //                 },
            //                 {
            //                     label: 'Attente paiement aide CEE',
            //                     id: 'pending',
            //                     onSelectType: 'multiCommentsPicker',
            //                     selected: false,
            //                     stay: true,
            //                 },
            //                 {
            //                     label: 'Payé',
            //                     id: 'confirm',
            //                     onSelectType: 'multiCommentsPicker',
            //                     selected: false,
            //                     stay: false,
            //                 },
            //             ],
            //             responsable: 'Équipe technique',
            //             status: 'pending',
            //         },
            //         {
            //             id: 'advValidation',
            //             title: "Validation de la facture par le DAF", //#task allow adv to view Offre précontractuelle before validating (multi-choice: voir/valider)
            //             instructions: '',
            //             actionOrder: 2,
            //             type: 'manual',
            //             //verificationType: 'validation',
            //             comment: '',
            //             responsable: 'DAF',
            //             status: 'pending',
            //             verificationType: 'multiple-choices',
            //             choices: [
            //                 {
            //                     label: 'Annuler',
            //                     id: 'cancel',
            //                     nextPhase: 'cancelProject',
            //                     onSelectType: 'transition',
            //                     commentRequired: true,
            //                 },
            //                 { label: 'Valider', id: 'confirm', onSelectType: 'validation' },
            //             ],
            //         },
            //         //##done:task: Ajouter montant HT + TTC ??
            //         {
            //             id: 'billingAmount',
            //             title: 'Saisir le montant de la facture',
            //             instructions: "Veuillez saisir le montant HT et TTC de la facture.",
            //             actionOrder: 3,
            //             //Verification
            //             collection: 'Projects',
            //             documentId: '', //#dynamic
            //             properties: ['bill', "amount"],
            //             params: {
            //                 screenParams: {
            //                     sections: { billing: { billAmount: true } },
            //                 }
            //             },
            //             screenPush: true,
            //             //Comment
            //             comment: '',
            //             //Verification
            //             type: 'auto',
            //             verificationType: 'data-fill',
            //             verificationValue: '',
            //             //Others
            //             responsable: 'Équipe technique',
            //             status: 'pending',
            //             nextStep: 'emailBill',
            //         },
            //     ],
            // },
            emailBill: {
                title: 'Envoi facture par mail',
                instructions: '',
                stepOrder: 10,
                actions: [
                    //task: verify if bill & attestation fluide are still existing
                    {
                        id: 'emailBill',
                        title: 'Envoi automatique de la facture finale + attestation fluide par mail en cours...',
                        instructions: '',
                        actionOrder: 1,
                        collection: 'Projects',
                        documentId: '', //#dynamic
                        queryFilters: [{ filter: 'project.id', operation: '==', value: '' }],
                        properties: ['finalBillSentViaEmail'],
                        status: 'pending',
                        verificationType: 'data-fill',
                        verificationValue: false,
                        cloudFunction: {
                            endpoint: 'sendEmail',
                            queryAttachmentsUrls: {
                                Facture: [
                                    { filter: 'project.id', operation: '==', value: '' },
                                    { filter: 'type', operation: '==', value: 'Facture' },
                                    {
                                        filter: 'attachment.downloadURL',
                                        operation: '!=',
                                        value: '',
                                    },
                                ],
                                'Attestation fluide': [
                                    { filter: 'project.id', operation: '==', value: '' },
                                    {
                                        filter: 'type',
                                        operation: '==',
                                        value: 'Attestation fluide',
                                    },
                                    {
                                        filter: 'attachment.downloadURL',
                                        operation: '!=',
                                        value: '',
                                    },
                                ],
                            },
                            params: {
                                subject: 'Facture finale et attestation fluide',
                                dest: 'sa.lyoussi@gmail.com', //#task: change it
                                projectId: '',
                                attachments: [],
                            },
                        },
                       // responsable: 'Équipe technique',
                        nextStep: 'clientReview',
                    },
                ],
            },
            clientReview: {
                title: 'Satisfaction client',
                instructions:
                    "Le directeur technique devra valider la satisfaction du client vis-à-vis de l'installation",
                stepOrder: 10,
                actions: [
                    {
                        id: 'clientReview',
                        title: 'Êtes-vous satisfait de notre service ?',
                        instructions: '',
                        actionOrder: 1,
                        type: 'manual',
                        verificationType: 'multiple-choices',
                        isReview: true,
                        comment: '',
                        responsable: "Client",
                        choices: [
                            {
                                label: '1',
                                onSelectType: 'commentPicker',
                                selected: false,
                                saty: false,
                                nextPhase: 'endProject',
                            },
                            {
                                label: '2',
                                onSelectType: 'commentPicker',
                                selected: false,
                                saty: false,
                                nextPhase: 'endProject',
                            },
                            {
                                label: '3',
                                onSelectType: 'commentPicker',
                                selected: false,
                                saty: false,
                                nextPhase: 'endProject',
                            },
                            {
                                label: '4',
                                onSelectType: 'commentPicker',
                                selected: false,
                                saty: false,
                                nextPhase: 'endProject',
                            },
                            {
                                label: '5',
                                onSelectType: 'commentPicker',
                                selected: false,
                                saty: false,
                                nextPhase: 'endProject',
                            },
                            {
                                label: '6',
                                onSelectType: 'commentPicker',
                                selected: false,
                                saty: false,
                                nextPhase: 'endProject',
                            },
                            {
                                label: '7',
                                onSelectType: 'commentPicker',
                                selected: false,
                                saty: false,
                                nextPhase: 'endProject',
                            },
                            {
                                label: '8',
                                onSelectType: 'commentPicker',
                                selected: false,
                                saty: false,
                                nextPhase: 'endProject',
                            },
                            {
                                label: '9',
                                onSelectType: 'commentPicker',
                                selected: false,
                                saty: false,
                                nextPhase: 'endProject',
                            },
                            {
                                label: '10',
                                onSelectType: 'commentPicker',
                                selected: false,
                                stay: false,
                                nextPhase: 'endProject',
                            },
                        ],
                        status: 'pending',
                    },
                ],
            },
        },
    },
    //##draft
    // maintainance: {
    //     phaseValue: "Maintenance"
    //     title: 'Maintenance',
    //     instructions: '',
    //     phaseOrder: 6,
    //     followers: ['Admin', 'Entreprise technique', 'Équipe technique'],
    //     steps: {
    //         maintainanceContract: {
    //             title: 'Contrat maintenance',
    //             instructions: '',
    //             stepOrder: 1,
    //             actions: [
    //                 {
    //                     id: 'commercialPropositionChoice',
    //                     title: 'Accepter la proposition commerciale',
    //                     instructions: '',
    //                     actionOrder: 1,
    //                     type: 'manual', //Check manually
    //                     verificationType: 'multiple-choices',
    //                     comment: '', //motif
    //                     choices: [
    //                         { label: 'Accepter', id: 'confirm', onSelectType: 'validation' },
    //                     ],
    //                     responsable: 'Équipe technique',
    //                     status: 'pending',
    //                 },
    //                 {   //##new
    //                     id: 'mandatSepaCreation',
    //                     title: 'Créer/Importer un mandat SEPA',
    //                     instructions: 'Créer/Importer un mandat SEPA',
    //                     actionOrder: 2,
    //                     responsable: 'Équipe technique',
    //                     verificationType: 'doc-creation',
    //                     collection: 'Documents',
    //                     documentId: "", //creation
    //                     params: {
    //                         documentType: "Mandat SEPA",
    //                     },
    //                     //Updates documentId to view the "onProgress uploading document"
    //                     queryFilters_onProgressUpload: buildQueryFilters(queryFilters_Documents_Map("Mandat SEPA").create.onProgress),
    //                     //Verification:
    //                     queryFilters: buildQueryFilters(queryFilters_Documents_Map("Mandat SEPA").create.onCreate),
    //                     comment: '', //motif
    //                     choices: [
    //                         {
    //                             id: 'upload',

    //                             label: 'Importer le document',
    //                             onSelectType: 'navigation',
    //                         },
    //                     ],
    //                     status: 'pending',
    //                 },
    //                 {   //##new
    //                     id: 'signedSEPACreation',
    //                     title: 'Signer le mandat SEPA',
    //                     instructions: 'Signer le mandat SEPA',
    //                     actionOrder: 3,
    //                     responsable: 'Client',
    //                     verificationType: 'doc-creation',
    //                     collection: 'Documents',
    //                     documentId: "", //edit
    //                     params: {
    //                         documentType: "Mandat SEPA",
    //                         isSignature: true
    //                     },
    //                     //Updates documentId to view the "onProgress uploading document"
    //                     queryFilters_onProgressUpload: buildQueryFilters(queryFilters_Documents_Map("Mandat SEPA").sign.onProgress),
    //                     //Verification:
    //                     queryFilters: buildQueryFilters(queryFilters_Documents_Map("Mandat SEPA").sign.onCreate),
    //                     comment: "",
    //                     choices: [
    //                         {
    //                             id: 'sign',
    //                             label: 'Signer le mandat SEPA',
    //                             onSelectType: 'navigation',
    //                         },
    //                     ],
    //                     status: 'pending',
    //                 },
    //                 {   //##new
    //                     id: 'contractCreation',
    //                     title: 'Créer/Importer un contrat',
    //                     instructions: 'Créer/Importer un contrat',
    //                     actionOrder: 4,
    //                     responsable: 'Équipe technique',
    //                     verificationType: 'doc-creation',
    //                     collection: 'Documents',
    //                     documentId: "", //creation
    //                     params: {
    //                         documentType: "Contrat CGU-CGV",
    //                     },
    //                     //Updates documentId to view the "onProgress uploading document"
    //                     queryFilters_onProgressUpload: buildQueryFilters(queryFilters_Documents_Map("Contrat CGU-CGV").create.onProgress),
    //                     //Verification:
    //                     queryFilters: buildQueryFilters(queryFilters_Documents_Map("Contrat CGU-CGV").create.onCreate),
    //                     comment: '', //motif
    //                     choices: [
    //                         {
    //                             id: 'upload',
    //                             label: 'Importer le contrat',
    //                             onSelectType: 'navigation',
    //                         },
    //                     ],
    //                     status: 'pending',
    //                 },
    //                 {   //##new
    //                     id: 'signedContractCreation',
    //                     title: 'Signer le contrat',
    //                     instructions: 'Signer le contrat',
    //                     actionOrder: 5,
    //                     responsable: 'Client',
    //                     verificationType: 'doc-creation',
    //                     collection: 'Documents',
    //                     documentId: "", //edit
    //                     params: {
    //                         documentType: "Contrat CGU-CGV",
    //                         isSignature: true
    //                     },
    //                     //Updates documentId to view the "onProgress uploading document"
    //                     queryFilters_onProgressUpload: buildQueryFilters(queryFilters_Documents_Map("Contrat CGU-CGV").sign.onProgress),
    //                     //Verification:
    //                     queryFilters: buildQueryFilters(queryFilters_Documents_Map("Contrat CGU-CGV").sign.onCreate),
    //                     comment: "",
    //                     choices: [
    //                         {
    //                             id: 'sign',
    //                             label: 'Signer le contrat',
    //                             onSelectType: 'navigation',
    //                         },
    //                     ],
    //                     status: 'pending',
    //                 },
    //                 {
    //                     id: 'endProject',
    //                     title: 'Finaliser le projet',
    //                     instructions: '',
    //                     actionOrder: 6,
    //                     type: 'manual',
    //                     verificationType: 'validation',
    //                     comment: '',
    //                     responsable: 'ADV',
    //                     status: 'pending',
    //                     nextPhase: 'endProject',
    //                 },
    //             ],
    //         },
    //     },
    // },
    endProject: {
        phaseValue: "Finalisation",
        title: 'Finalisation',
        instructions: '',
        phaseOrder: 7,
        followers: [
            'Admin',
            'MAR',
            'Entreprise technique',
            'Équipe technique',
        ],
        steps: {
            endProject: {
                title: 'Projet finalisé',
                instructions: '',
                stepOrder: 1,
                actions: [
                    {
                        id: 'endProject',
                        title: 'Le projet est terminé.',
                        instructions: '',
                        actionOrder: 1,
                        type: 'manual',
                        verificationType: 'no-verification',
                        comment: '',
                        status: 'pending',
                    },
                ],
            },
        },
    },
    cancelProject: {
        phaseValue: "Annulation",
        title: 'Annulation',
        instructions: 'Annulation du projet',
        phaseOrder: 7,
        followers: [
            'Admin',
            'MAR',
            'Entreprise technique',
            'Équipe technique',
        ],
        steps: {
            resumeProject: {
                title: 'Reprendre le projet',
                instructions: '',
                stepOrder: 1,
                actions: [
                    {
                        id: 'resumeProject', //#task: rollback (Resume project)
                        title: 'Appuyez ici pour reprendre le projet',
                        instructions: '',
                        actionOrder: 1,
                        collection: 'Projects',
                        documentId: '',
                        type: 'manual',
                        verificationType: 'phaseRollback',
                        operation: { type: 'update', field: 'state', value: 'En cours' },
                        status: 'pending',
                    },
                ],
            },
        },
    },
    version: 9,
};
