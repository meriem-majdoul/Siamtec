
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


export const version8 = {
    init: {
        title: 'Prospect',
        instructions: '',
        phaseOrder: 1,
        followers: ['Admin', 'Directeur commercial', 'Commercial'],
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
                        responsable: 'Commercial',
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
                        responsable: 'Commercial',
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
                        responsable: 'Commercial',
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
                        responsable: 'Commercial',
                        status: 'pending',
                        verificationType: 'data-fill',
                        verificationValue: '',
                    },
                ],
            },
        },
    },
    rd1: {
        title: 'Visite technique préalable',
        instructions: '',
        phaseOrder: 2,
        followers: ['Admin', 'Directeur commercial', 'Commercial'],
        steps: {
            //##draft
            // priorTechnicalVisit: {
            //     title: 'Visite technique préalable',
            //     instructions: '',
            //     stepOrder: 1,
            //     actions: [
            //         {
            //             id: 'createPriorTechnicalVisit',
            //             title: 'Créer une visite technique préalable',
            //             instructions: 'Créer une visite technique préalable',
            //             actionOrder: 1,
            //             responsable: 'Commercial',
            //             verificationType: 'doc-creation',
            //             collection: 'Agenda',
            //             documentId: "",
            //             params: {
            //                 taskType: "Visite technique préalable",
            //             },
            //             queryFilters: buildQueryFilters(queryFilters_Agenda_Map("Visite technique préalable").create),
            //             status: 'pending',
            //         },
            //         {
            //             id: 'address',
            //             title: 'Lieu du rendez-vous',
            //             instructions: 'Lieu du rendez-vous',
            //             actionOrder: 2,
            //             responsable: 'Commercial',
            //             verificationType: 'data-fill',
            //             verificationValue: '',
            //             properties: ['address', 'description'],
            //             collection: 'Agenda',
            //             documentId: "",
            //             params: {
            //                 taskType: "Visite technique préalable",
            //             },
            //             queryFilters: buildQueryFilters(queryFilters_Agenda_Map("Visite technique préalable").create),
            //             status: 'pending',
            //         },
            //         {
            //             id: 'rd1Choice',
            //             title: 'Modifier le statut du rendez-vous 1',
            //             instructions: 'Modifier le statut du rendez-vous 1',
            //             actionOrder: 3,
            //             responsable: 'Commercial',
            //             verificationType: 'multiple-choices',
            //             choices: [
            //                 {
            //                     label: 'Annuler',
            //                     id: 'cancel',
            //                     nextPhase: 'cancelProject',
            //                     onSelectType: 'transition',
            //                     commentRequired: true,
            //                 },
            //                 {
            //                     label: 'Reporter',
            //                     id: 'postpone',
            //                     onSelectType: 'navigation'
            //                 },
            //                 {
            //                     label: 'Confirmer',
            //                     id: 'confirm',
            //                     nextStep: 'housingActionFile',
            //                     onSelectType: 'transition',
            //                     operation: { type: 'update', field: 'status', value: 'Terminé' },
            //                 },
            //             ],
            //             collection: 'Agenda',
            //             documentId: "",
            //             params: {
            //                 taskType: "Visite technique préalable",
            //             },
            //             queryFilters: buildQueryFilters(queryFilters_Agenda_Map("Visite technique préalable").create),
            //             status: 'pending',
            //         },
            //     ],
            // },
            housingActionFile: {
                title: 'Évaluation des besoins',
                instructions: '',
                stepOrder: 1,
                actions: [
                    // {   //##draft
                    //     id: 'eebFileCreation',
                    //     title: 'Créer une fiche Étude et Évaluation des besoins',
                    //     instructions: 'Créer une fiche Étude et Évaluation des besoins',
                    //     actionOrder: 1,
                    //     responsable: 'Commercial',
                    //     verificationType: 'doc-creation',
                    //     collection: 'Documents',
                    //     documentId: "", //creation
                    //     params: {
                    //         documentType: "Fiche EEB",
                    //     },
                    //     //Updates documentId to view the "onProgress uploading document"
                    //     queryFilters_onProgressUpload: buildQueryFilters(queryFilters_Documents_Map("Fiche EEB").create.onProgress),
                    //     //Verification:
                    //     queryFilters: buildQueryFilters(queryFilters_Documents_Map("Fiche EEB").create.onCreate),
                    //     status: 'pending',
                    //     nextStep: 'rd2Creation',
                    // },
                    {   //##new
                        id: 'eebFileCreation',
                        title: 'Créer un dossier de cheminement',
                        instructions: 'Importer un dossier de cheminement dûment rempli',
                        actionOrder: 1,
                        responsable: 'Commercial',
                        verificationType: 'doc-creation',
                        collection: 'Documents',
                        documentId: "", //creation
                        params: {
                            documentType: "Dossier de cheminement",
                        },
                        //Updates documentId to view the "onProgress uploading document"
                        queryFilters_onProgressUpload: buildQueryFilters(queryFilters_Documents_Map("Dossier de cheminement").create.onProgress),
                        //Verification:
                        queryFilters: buildQueryFilters(queryFilters_Documents_Map("Dossier de cheminement").create.onCreate),
                        status: 'pending',
                        nextStep: 'rd2Creation',
                    },
                ],
            },
            rd2Creation: {
                title: 'Initiation rendez-vous 2',
                instructions: '',
                stepOrder: 3,
                actions: [
                    {
                        id: 'rd2Creation',
                        title: 'Créer un rendez-vous 2',
                        instructions: '',
                        actionOrder: 1,
                        responsable: 'Commercial',
                        verificationType: 'doc-creation',
                        collection: 'Agenda',
                        documentId: "",
                        params: {
                            taskType: "Présentation étude",
                        },
                        queryFilters: buildQueryFilters(queryFilters_Agenda_Map("Présentation étude").create),
                        status: 'pending',
                        nextStep: 'quoteCreation',
                    }
                ],
            },
            quoteCreation: {
                title: "Création d'une offre précontractuelle",
                instructions: '',
                stepOrder: 4,
                actions: [
                    {   //##new
                        id: 'quoteCreation',
                        title: 'Créer une offre précontractuelle',
                        instructions: 'Créer une offre précontractuelle',
                        actionOrder: 1,
                        responsable: 'Commercial',
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
        title: 'Présentation étude',
        instructions: '',
        phaseOrder: 3,
        followers: ['Admin', 'Directeur commercial', 'Commercial'],
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
                        responsable: 'Commercial',
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
                    {   //##new
                        id: 'taxStatement',
                        title: "Relevé d'impôt",
                        instructions: "Importer le Relevé d'impôt du client",
                        actionOrder: 1,
                        responsable: 'Commercial',
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
                        actionOrder: 2,
                        responsable: 'Commercial',
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
                        actionOrder: 3,
                        responsable: 'Commercial',
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
                        actionOrder: 4,
                        responsable: 'Commercial',
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
                        actionOrder: 5,
                        responsable: 'Commercial',
                        verificationType: 'multiple-choices',
                        collection: "Documents",
                        documentId: "",
                        params: {
                            documentType: "Autre",
                        },
                        choices: [
                            { label: 'Valider', id: 'confirm', onSelectType: 'validation' },
                            { label: 'Importer', id: 'upload', onSelectType: 'navigation' },
                        ],
                        status: 'pending',
                    },
                    //##task: Validation du contrôle de conformité
                    {
                        id: 'conformityValidation',
                        title: "Validation du contrôle de conformité",
                        instructions: '',
                        actionOrder: 6,
                        type: 'manual',
                        //verificationType: 'validation',
                        comment: '',
                        responsable: 'Directeur commercial',
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
                    {   //##new (verify if Offre précontractuelle exists...)
                        id: 'quoteCreation',
                        title: 'Créer une offre précontractuelle',
                        instructions: 'Créer une offre précontractuelle',
                        actionOrder: 7,
                        responsable: 'Commercial',
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
                        id: 'signedQuoteCreation',
                        title: "Signer l'offre précontractuelle",
                        instructions: "Signature de l'offre précontractuelle par le client",
                        actionOrder: 8,
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
                        actionOrder: 9,
                        responsable: 'Commercial',
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
                        actionOrder: 10,
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
                        nextStep: 'payModeValidation',
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
                        responsable: 'Commercial',
                        status: 'pending',
                    },
                    {
                        id: 'financingWebsite',
                        title: 'Propositions de financement',
                        instructions: '',
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
                                label: 'Continuer',
                                id: 'confirm',
                                nextStep: 'technicalVisitCreation',
                                onSelectType: 'transition',
                            },
                        ],
                        responsable: 'Commercial',
                        status: 'pending',
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
                        responsable: 'Commercial',
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
        title: 'Visite technique',
        instructions: '',
        phaseOrder: 4,
        followers: ['Admin', 'Responsable technique', 'Poseur'],
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
                        responsable: 'Commercial', //Directeur technique
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
                        responsable: 'Commercial',  //Directeur technique
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
                        instructions: 'Affecter un technicien à la visite technique',  //Directeur technique
                        actionOrder: 3,
                        responsable: 'Responsable technique',
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
                                label: 'Valider le technicien',
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
                                label: 'Valider',
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
                        responsable: 'Poseur',
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
                        responsable: 'Poseur',
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
                        responsable: 'Poseur',
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
                        nextPhase: "installation"
                    },
                ],
            },
        },
    },
    installation: {
        title: 'Installation',
        instructions: '',
        phaseOrder: 5,
        followers: ['Admin', 'Responsable technique', 'Poseur'],
        steps: {
            installationCreation: {
                title: 'Plannification installation',
                instructions: '', // Example: process.init.create-prospect.nom.title
                stepOrder: 1,
                actions: [
                    {
                        id: 'installationCreation',
                        title: 'Créer une tâche de type installation',
                        instructions: 'Créer une tâche de type installation',
                        actionOrder: 1,
                        responsable: 'Poseur',
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
                stepOrder: 2,
                actions: [
                    {
                        id: 'installationChoice1',
                        title: "Mettre à jour le statut de l'installation (1)",
                        instructions: "Mettre à jour le statut de l'installation (1)",
                        actionOrder: 1,
                        responsable: 'Poseur',
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
                        responsable: 'Poseur',
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
                        responsable: 'Poseur',
                        status: 'pending',
                        forceValidation: true,
                    },
                ],
            },
            pvCreation: {
                title: "Création d'un PV réception",
                instructions: '',
                stepOrder: 3,
                actions: [
                    {   //##new
                        id: 'pvCreation',
                        title: 'Créer un PV réception',
                        instructions: 'Créer un PV réception',
                        actionOrder: 1,
                        responsable: 'Poseur',
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
                        nextStep: 'reserve',
                    },
                ],
            },
            reserve: {
                title: 'Réserve',
                instructions: '',
                stepOrder: 4,
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
                stepOrder: 5,
                actions: [
                    {
                        id: 'catchupCreation',
                        title: 'Créer une tâche rattrapage',
                        instructions: 'Créer une tâche rattrapage',
                        actionOrder: 1,
                        responsable: 'Poseur',
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
                        responsable: 'Poseur',
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
            //             responsable: 'Poseur',
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
            //             responsable: 'Poseur',
            //             status: 'pending',
            //         },
            //         {   //##new
            //             id: 'mandatSepaCreation',
            //             title: 'Créer/Importer un mandat SEPA',
            //             instructions: 'Créer/Importer un mandat SEPA',
            //             actionOrder: 2,
            //             responsable: 'Poseur',
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
            //             responsable: 'Poseur',
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
                stepOrder: 6,
                actions: [
                    {
                        id: 'billCreation',
                        title: 'Créer une facture',
                        instructions: 'Créer une facture',
                        actionOrder: 1,
                        responsable: 'Poseur',
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
                //conversion
                title: 'Finalisation de la facturation',
                instructions: '',
                stepOrder: 7,
                actions: [
                    {
                        //##task: add multiCommentsPicker
                        id: 'paymentStatus',
                        title: 'Modifier le statut du paiement',
                        instructions: '',
                        actionOrder: 1,
                        type: 'manual',
                        verificationType: 'multiple-choices',
                        onSelectType: 'multiCommentsPicker', //only in multiCommentsPicker
                        comment: '',
                        choices: [
                            {
                                label: 'Attente paiement client',
                                id: 'pending',
                                onSelectType: 'multiCommentsPicker',
                                selected: false,
                                stay: true,
                            },
                            {
                                label: 'Attente paiement financement',
                                id: 'pending',
                                onSelectType: 'multiCommentsPicker',
                                selected: false,
                                stay: true,
                            },
                            //##task: Diviser Attente paiement aide en MPR et CEE
                            {
                                label: 'Attente paiement aide MPR',
                                id: 'pending',
                                onSelectType: 'multiCommentsPicker',
                                selected: false,
                                stay: true,
                            },
                            {
                                label: 'Attente paiement aide CEE',
                                id: 'pending',
                                onSelectType: 'multiCommentsPicker',
                                selected: false,
                                stay: true,
                            },
                            {
                                label: 'Payé',
                                id: 'confirm',
                                onSelectType: 'multiCommentsPicker',
                                selected: false,
                                stay: false,
                            },
                        ],
                        responsable: 'Poseur',
                        status: 'pending',
                    },
                    {
                        id: 'advValidation',
                        title: "Validation de la facture par le DAF", //#task allow adv to view Offre précontractuelle before validating (multi-choice: voir/valider)
                        instructions: '',
                        actionOrder: 2,
                        type: 'manual',
                        //verificationType: 'validation',
                        comment: '',
                        responsable: 'ADV',
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
                            { label: 'Valider', id: 'confirm', onSelectType: 'validation' },
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
                        responsable: 'Poseur',
                        status: 'pending',
                    },
                    {
                        id: 'attestationCreation',
                        title: 'Créer une attestation fluide',
                        instructions: 'Créer une attestation fluide',
                        actionOrder: 4,
                        responsable: 'Poseur',
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
                        nextStep: 'emailBill',
                    }
                ],
            },
            emailBill: {
                title: 'Envoi facture par mail',
                instructions: '',
                stepOrder: 8,
                actions: [
                    //task: verify if bill & attestation fluide are still existing
                    {
                        id: 'emailBill',
                        title: 'Envoi automatique de la facture finale + attestation fluide par mail en cours...',
                        instructions: '',
                        actionOrder: 2,
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
                        nextStep: 'clientReview',
                    },
                ],
            },
            clientReview: {
                title: 'Satisfaction client',
                instructions:
                    "Le directeur technique devra valider la satisfaction du client vis-à-vis de l'installation",
                stepOrder: 9,
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
    //     title: 'Maintenance',
    //     instructions: '',
    //     phaseOrder: 6,
    //     followers: ['Admin', 'Responsable technique', 'Poseur'],
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
    //                     responsable: 'Poseur',
    //                     status: 'pending',
    //                 },
    //                 {   //##new
    //                     id: 'mandatSepaCreation',
    //                     title: 'Créer/Importer un mandat SEPA',
    //                     instructions: 'Créer/Importer un mandat SEPA',
    //                     actionOrder: 2,
    //                     responsable: 'Poseur',
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
    //                     responsable: 'Poseur',
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
        title: 'Finalisation',
        instructions: '',
        phaseOrder: 7,
        followers: [
            'Admin',
            'Directeur commercial',
            'Commercial',
            'Responsable technique',
            'Poseur',
        ],
        steps: {
            endProject: {
                title: 'Projet finalisé',
                instructions: '',
                stepOrder: 1,
                actions: [
                    {
                        id: 'endProject',
                        title: 'Le process du projet est terminé.',
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
        title: 'Annulation',
        instructions: 'Annulation du projet',
        phaseOrder: 7,
        followers: [
            'Admin',
            'Directeur commercial',
            'Commercial',
            'Responsable technique',
            'Poseur',
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
    version: 8,
};
