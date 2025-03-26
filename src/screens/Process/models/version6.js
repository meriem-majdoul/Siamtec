

export const version6 = {
    'init': {
        title: 'Prospect',
        instructions: 'Lorem ipsum dolor',
        phaseOrder: 1,
        followers: ['Admin', 'Directeur commercial', 'Commercial'],
        steps: {
            'prospectCreation': {
                title: 'Création prospect',
                instructions: 'Lorem ipsum dolor',
                stepOrder: 1,
                actions: [
                    //#Task make all verifications of same document on SAME ACTION (to avoid function verifyDataFill_sameDoc)
                    {
                        //General
                        id: 'nom',
                        title: 'Nom',
                        instructions: 'Lorem ipsum dolor',
                        actionOrder: 1,
                        //Verification
                        collection: 'Clients',
                        documentId: '', //#dynamic
                        properties: ['nom'],
                        //Navigation
                        screenName: 'Profile',
                        screenParams: { user: { id: '', roleId: 'client' }, project: null },
                        screenPush: true,
                        //Verification
                        type: 'auto',
                        verificationType: 'data-fill',
                        verificationValue: '',
                        responsable: 'Commercial',
                        status: 'pending',
                    },
                    {
                        //General
                        id: 'prenom',
                        title: 'Prénom',
                        instructions: 'Lorem ipsum dolor',
                        actionOrder: 2,
                        //Verification
                        collection: 'Clients',
                        documentId: '',
                        properties: ['prenom'],
                        //Navigation
                        screenName: 'Profile', //#task OnUpdate client name on his profile: triggered cloud function should run to update all documents containing this client data.
                        screenParams: { user: { id: '', roleId: 'client' }, project: null },
                        screenPush: true,
                        //Verification
                        type: 'auto',
                        verificationType: 'data-fill',
                        verificationValue: '',
                        responsable: 'Commercial',
                        status: 'pending',
                    },
                    {
                        id: 'address',
                        title: 'Adresse postale',
                        instructions: 'Lorem ipsum dolor',
                        actionOrder: 3,
                        collection: 'Clients',
                        documentId: '', //dynamic
                        properties: ['address', 'description'],
                        screenName: 'Profile',
                        screenParams: { user: { id: '', roleId: 'client' }, project: null },
                        screenPush: true,
                        type: 'auto',
                        verificationType: 'data-fill',
                        verificationValue: '',
                        responsable: 'Commercial',
                        status: 'pending',
                    },
                    {
                        id: 'phone',
                        title: 'Numéro de téléphone',
                        instructions: 'Lorem ipsum dolor',
                        actionOrder: 4,
                        collection: 'Clients',
                        documentId: '', // dynamic
                        properties: ['phone'],
                        screenName: 'Profile', //#task OnUpdate client name on his profile: triggered cloud function should run to update all documents containing this client data.
                        screenParams: { user: { id: '', roleId: 'client' }, project: null },
                        screenPush: true,
                        type: 'auto',
                        responsable: 'Commercial',
                        status: 'pending',
                        verificationType: 'data-fill',
                        verificationValue: ''
                    },
                ]
            },
        }
    },
    'rd1': {
        title: 'Visite technique préalable',
        instructions: 'Lorem ipsum dolor',
        phaseOrder: 2,
        followers: ['Admin', 'Directeur commercial', 'Commercial'],
        steps: {
            'priorTechnicalVisit': {
                title: 'Visite technique préalable',
                instructions: 'Lorem ipsum dolor',
                stepOrder: 1,
                actions: [
                    {
                        id: 'createPriorTechnicalVisit',
                        title: 'Créer une visite technique préalable',
                        instructions: 'Lorem ipsum dolor',
                        actionOrder: 1,
                        collection: 'Agenda',
                        queryFilters: [
                            { filter: 'project.id', operation: '==', value: '' },
                            { filter: 'type', operation: '==', value: 'Visite technique préalable' },
                            { filter: 'deleted', operation: '==', value: false },
                            { filter: 'status', operation: '!=', value: 'Annulé' },
                            //#task: add orderBy createdAt to get only the latest document (ignore old ones)
                        ],
                        screenName: 'CreateTask', //creation
                        screenParams: {
                            project: null,
                            taskType: { label: 'Visite technique préalable', value: 'Visite technique préalable', natures: ['com'] },
                            dynamicType: true
                        },
                        type: 'auto',
                        verificationType: 'doc-creation',
                        responsable: 'Commercial',
                        status: 'pending',
                    },
                    {
                        id: 'address',
                        title: 'Lieu du rendez-vous',
                        instructions: 'Lorem ipsum dolor',
                        actionOrder: 2,
                        collection: 'Agenda',
                        documentId: '', //#dynamic
                        properties: ['address', 'description'],
                        queryFilters: [
                            { filter: 'project.id', operation: '==', value: '' },
                            { filter: 'type', operation: '==', value: 'Visite technique préalable' },
                            { filter: 'deleted', operation: '==', value: false },
                            { filter: 'status', operation: '!=', value: 'Annulé' },
                        ],
                        screenName: 'CreateTask',
                        screenParams: { project: null, TaskId: '', taskType: { label: 'Visite technique préalable', value: 'Visite technique préalable', natures: ['tech'] }, dynamicType: true }, //#dynamic
                        type: 'auto',
                        verificationType: 'data-fill',
                        verificationValue: '',
                        responsable: 'Commercial',
                        status: 'pending',
                    },
                    {
                        id: 'rd1Choice',
                        title: 'Modifier le statut du rendez-vous 1',
                        instructions: 'Lorem ipsum dolor',
                        actionOrder: 3,
                        collection: 'Agenda',
                        documentId: '',
                        queryFilters: [
                            { filter: 'project.id', operation: '==', value: '' },
                            { filter: 'type', operation: '==', value: 'Visite technique préalable' },
                            { filter: 'deleted', operation: '==', value: false },
                            { filter: 'status', operation: '!=', value: 'Annulé' },
                        ],
                        screenName: 'CreateTask',
                        screenParams: { project: null, TaskId: '', taskType: { label: 'Visite technique préalable', value: 'Visite technique préalable', natures: ['tech'] }, dynamicType: true },
                        type: 'manual', //Check manually
                        verificationType: 'multiple-choices',
                        choices: [
                            { label: 'Annuler', id: 'cancel', nextPhase: 'cancelProject', onSelectType: 'transition', commentRequired: true },
                            { label: 'Reporter', id: 'postpone', onSelectType: 'navigation', },
                            { label: 'Confirmer', id: 'confirm', nextStep: 'housingActionFile', onSelectType: 'transition', operation: { type: 'update', field: 'status', value: 'Terminé' } },
                        ],
                        responsable: 'Commercial',
                        status: 'pending',
                    },
                ]
            },
            'housingActionFile': {
                title: 'Évaluation des besoins',
                instructions: 'Lorem ipsum dolor',
                stepOrder: 2,
                actions: [
                    {
                        id: 'eebFileCreation',
                        title: 'Créer une fiche Étude et Évaluation des besoins',
                        instructions: 'Lorem ipsum dolor',
                        actionOrder: 1,
                        collection: 'Documents',
                        //Verification:
                        queryFilters: [
                            { filter: 'project.id', operation: '==', value: '' },
                            { filter: 'type', operation: '==', value: 'Fiche EEB' },
                            { filter: 'deleted', operation: '==', value: false },
                            { filter: 'attachment.downloadURL', operation: '!=', value: '' }
                        ],
                        //Navigation
                        queryFiltersUpdateNav: [
                            { filter: 'project.id', operation: '==', value: '' },
                            { filter: 'type', operation: '==', value: 'Fiche EEB' },
                            { filter: 'deleted', operation: '==', value: false },
                        ],
                        screenName: 'UploadDocument', //creation
                        screenParams: { project: null, documentType: { label: 'Fiche EEB', value: 'Fiche EEB', selected: false }, dynamicType: true, },
                        type: 'auto',
                        verificationType: 'doc-creation',
                        responsable: 'Commercial',
                        status: 'pending',
                        nextStep: 'rd2Creation',
                    },
                    // {
                    //     id: 'eebFileChoice',
                    //     title: 'Le client est-il eligible au dossier action logement ?',
                    //     instructions: 'Lorem ipsum dolor',
                    //     actionOrder: 2,
                    //     type: 'manual',
                    //     verificationType: 'multiple-choices',
                    //     comment: '', //motif
                    //     choices: [
                    //         { label: 'NON', id: 'cancel', nextStep: 'rd2Creation', onSelectType: 'transition', commentRequired: true, operation: null }, //User's manual choice will route to next step (confirmRd2, postponeRd2 or cancelRd2) (it will technically set "nextStep" property)
                    //         { label: 'OUI', id: 'confirm', nextPhase: 'technicalVisitManagement', onSelectType: 'transition', operation: null },
                    //     ],
                    //     responsable: 'Commercial',
                    //     status: 'pending',
                    // },
                ]
            },
            // 'primeCEECreation': {
            //     title: "Création d'une prime CEE",
            //     instructions: 'Lorem ipsum dolor',
            //     stepOrder: 3,
            //     actions: [
            //         {
            //             id: 'primeCEEChoice',
            //             title: 'Ce projet est il éligible à la prime cee ?',
            //             instructions: 'Lorem ipsum dolor',
            //             actionOrder: 1,
            //             type: 'manual',
            //             verificationType: 'multiple-choices',
            //             comment: '', //motif
            //             choices: [
            //                 { label: 'NON', id: 'cancel', nextStep: 'rd2Creation', onSelectType: 'transition', commentRequired: true },
            //                 //{ label: 'OUI', id: 'confirm', nextStep: 'primeCEECreation', onSelectType: 'transition' },
            //                 { label: 'OUI', id: 'confirm', onSelectType: 'validation' },
            //             ],
            //             responsable: 'Commercial',
            //             status: 'pending',
            //         },
            //         {
            //             id: 'primeCEECreation',
            //             title: 'Créer une prime CEE',
            //             instructions: 'Lorem ipsum dolor',
            //             actionOrder: 2,
            //             collection: 'Documents',
            //             //Verification
            //             queryFilters: [
            //                 { filter: 'project.id', operation: '==', value: '' },
            //                 { filter: 'type', operation: '==', value: 'Dossier CEE' },
            //                 { filter: 'deleted', operation: '==', value: false },
            //                 { filter: 'attachment.downloadURL', operation: '!=', value: '' }
            //             ],
            //             //Navigation
            //             queryFiltersUpdateNav: [
            //                 { filter: 'project.id', operation: '==', value: '' },
            //                 { filter: 'type', operation: '==', value: 'Dossier CEE' },
            //                 { filter: 'deleted', operation: '==', value: false },
            //             ],
            //             screenName: 'UploadDocument', //creation
            //             screenParams: { project: null, documentType: { label: 'Dossier CEE', value: 'Dossier CEE', selected: false }, dynamicType: true },
            //             type: 'auto',
            //             verificationType: 'doc-creation',
            //             responsable: 'Commercial',
            //             status: 'pending',
            //             nextStep: 'rd2Creation'
            //         },
            //         // {
            //         //     id: 'quoteCreationChoice',
            //         //     title: 'Souhaitez-vous toujours être acteur de la transition énergétique ?',
            //         //     instructions: 'Lorem ipsum dolor',
            //         //     actionOrder: 3,
            //         //     type: 'manual',
            //         //     verificationType: 'multiple-choices',
            //         //     comment: '', //motif
            //         //     choices: [
            //         //         { label: 'Abandonner', id: 'cancel', nextPhase: 'cancelProject', onSelectType: 'transition', commentRequired: true },
            //         //         { label: 'Poursuivre', id: 'confirm', nextStep: 'rd2Creation', onSelectType: 'transition' },
            //         //     ],
            //         //     responsable: 'Commercial',
            //         //     status: 'pending',
            //         // },
            //     ]
            // },
            'rd2Creation': {
                title: 'Initiation rendez-vous 2',
                instructions: 'Lorem ipsum dolor',
                stepOrder: 3,
                actions: [
                    {
                        id: 'rd2Creation',
                        title: 'Créer un rendez-vous 2',
                        instructions: 'Lorem ipsum dolor',
                        actionOrder: 1,
                        collection: 'Agenda',
                        queryFilters: [
                            { filter: 'project.id', operation: '==', value: '' },
                            { filter: 'type', operation: '==', value: 'Présentation étude' },
                            { filter: 'deleted', operation: '==', value: false },
                            { filter: 'status', operation: '!=', value: 'Annulé' },
                        ],
                        screenName: 'CreateTask', //creation
                        screenParams: { project: null, taskType: { label: 'Présentation étude', value: 'Présentation étude', natures: ['com'] }, dynamicType: true },
                        type: 'auto',
                        verificationType: 'doc-creation',
                        responsable: 'Commercial',
                        status: 'pending',
                        nextStep: 'quoteCreation'
                    }
                ]
            },
            'quoteCreation': {
                title: "Création d'un devis",
                instructions: 'Lorem ipsum dolor',
                stepOrder: 4,
                actions: [
                    {
                        id: 'quoteCreation',
                        title: 'Créer un devis',
                        instructions: 'Lorem ipsum dolor',
                        actionOrder: 1,
                        collection: 'Documents',
                        //Verification
                        queryFilters: [
                            { filter: 'project.id', operation: '==', value: '' },
                            { filter: 'type', operation: '==', value: 'Devis' },
                            { filter: 'deleted', operation: '==', value: false },
                            { filter: 'attachment.downloadURL', operation: '!=', value: '' }
                        ],
                        //Navigation
                        queryFiltersUpdateNav: [
                            { filter: 'project.id', operation: '==', value: '' },
                            { filter: 'type', operation: '==', value: 'Devis' },
                            { filter: 'deleted', operation: '==', value: false },
                        ],
                        screenName: 'UploadDocument', //creation
                        screenParams: { project: null, documentType: { label: 'Devis', value: 'Devis', selected: false }, dynamicType: true },
                        type: 'auto',
                        verificationType: 'doc-creation',
                        responsable: 'Commercial',
                        status: 'pending',
                        nextPhase: 'rdn',
                    }
                ]
            },
        }
    },
    'rdn': {
        title: 'Présentation étude',
        instructions: 'Lorem ipsum dolor',
        phaseOrder: 3,
        followers: ['Admin', 'Directeur commercial', 'Commercial'],
        steps: {
            'rd2Creation': {
                title: 'Créer un rendez-vous 2', //1. verify if RD2 exists
                instructions: 'Lorem ipsum dolor',
                stepOrder: 1,
                actions: [
                    {
                        id: 'rd2Creation',
                        title: 'Créer un rendez-vous 2',
                        instructions: 'Lorem ipsum dolor',
                        actionOrder: 1,
                        collection: 'Agenda',
                        queryFilters: [
                            { filter: 'project.id', operation: '==', value: '' },
                            { filter: 'type', operation: '==', value: 'Présentation étude' },
                            { filter: 'deleted', operation: '==', value: false },
                            { filter: 'status', operation: '!=', value: 'Annulé' },
                        ],
                        screenName: 'CreateTask', //creation
                        screenParams: { project: null, taskType: { label: 'Présentation étude', value: 'Présentation étude', natures: ['com'] }, dynamicType: true },
                        type: 'auto',
                        verificationType: 'doc-creation',
                        responsable: 'Commercial',
                        status: 'pending',
                        nextStep: 'signature',
                    }
                ]
            },
            // 'rdnChoice': {
            //     title: "Modifier l'état du rendez-vous",
            //     instructions: 'Lorem ipsum dolor',
            //     stepOrder: 2,
            //     actions: [
            //         {
            //             id: 'rdnChoice',
            //             title: 'Modifier le statut du rendez-vous',
            //             instructions: 'Lorem ipsum dolor',
            //             actionOrder: 1,
            //             collection: 'Agenda',
            //             documentId: '', //#task: should be array in case of RDN lasting for many days (multiple tasks)
            //             queryFilters: [
            //                 { filter: 'project.id', operation: '==', value: '' },
            //                 { filter: 'type', operation: '==', value: 'Présentation étude' },
            //                 { filter: 'status', operation: '!=', value: 'Annulé' } //Get id of active RDN (all old/canceled RDN are inactive)
            //             ],
            //             type: 'manual',
            //             verificationType: 'multiple-choices',
            //             choices: [
            //                 { label: 'Annuler', id: 'cancel', nextPhase: 'cancelProject', onSelectType: 'transition', commentRequired: true, operation: { type: 'update', field: 'status', value: 'Annulé' } },
            //                 { label: 'Reporter', id: 'postpone', nextStep: 'rdnCreation', onSelectType: 'transition', commentRequired: true, operation: { type: 'update', field: 'status', value: 'Annulé' } },
            //                 { label: 'Confirmer', id: 'confirm', nextStep: 'signature', onSelectType: 'transition', operation: { type: 'update', field: 'status', value: 'Terminé' } },
            //             ],
            //             responsable: 'Commercial',
            //             status: 'pending',
            //         }
            //     ]
            // },
            // 'rdnCreation': { //rdn postpone
            //     title: "Création d'un rendez-vous 2 (Report)",
            //     instructions: 'Lorem ipsum dolor',
            //     stepOrder: 3,
            //     actions: [
            //         {
            //             id: 'rd2Creation', //1. verify if RD2 exists
            //             title: 'Créer un rendez-vous 2 (Report)',
            //             instructions: 'Lorem ipsum dolor',
            //             actionOrder: 1,
            //             collection: 'Agenda',
            //             queryFilters: [
            //                 { filter: 'project.id', operation: '==', value: '' },
            //                 { filter: 'type', operation: '==', value: 'Présentation étude' },
            //                 { filter: 'status', operation: '!=', value: 'Annulé' }
            //             ],
            //             screenName: 'CreateTask', //creation
            //             screenParams: { project: null, taskType: { label: 'Présentation étude', value: 'Présentation étude', natures: ['com'] }, dynamicType: true },
            //             type: 'auto',
            //             verificationType: 'doc-creation',
            //             status: 'pending',
            //             nextStep: 'rdnChoice',
            //         }
            //     ]
            // },
            //
            'signature': {
                title: 'Signature des documents',
                instructions: 'Lorem ipsum dolor',
                stepOrder: 2,
                actions: [
                    {
                        id: 'taxStatement',
                        title: "Relevé d'impôt",
                        instructions: "Veuillez importer le relevé d'impôt du client.",
                        actionOrder: 1,
                        screenName: 'UploadDocument', //creation
                        screenParams: { project: null, documentType: { label: 'Autre', value: 'Autre', selected: false } },
                        type: 'manual', //Check manually
                        verificationType: 'multiple-choices',
                        comment: '', //motif
                        choices: [
                            // { label: 'Ignorer', id: 'cancel', onSelectType: 'validation' },
                            { label: 'Valider', id: 'confirm', onSelectType: 'validation' },
                            { label: 'Importer', id: 'upload', onSelectType: 'navigation' },
                        ],
                        responsable: 'Commercial',
                        status: 'pending',
                    },
                    {
                        id: 'proofOfAddress',
                        title: "Justificatif de domicile (moins de 3 mois)",
                        instructions: 'Lorem ipsum dolor',
                        actionOrder: 2,
                        screenName: 'UploadDocument', //creation
                        screenParams: { project: null, documentType: { label: 'Autre', value: 'Autre', selected: false } },
                        type: 'manual', //Check manually
                        verificationType: 'multiple-choices',
                        comment: '', //motif
                        choices: [
                            { label: 'Valider', id: 'confirm', onSelectType: 'validation' },
                            { label: 'Importer', id: 'upload', onSelectType: 'navigation' },
                        ],
                        responsable: 'Commercial',
                        status: 'pending',
                    },
                    {
                        id: 'taxStatement',
                        title: "Plan cadastral",
                        instructions: "Veuillez importer le plan cadastral du client.",
                        actionOrder: 3,
                        screenName: 'UploadDocument', //creation
                        screenParams: { project: null, documentType: { label: 'Autre', value: 'Autre', selected: false } },
                        type: 'manual', //Check manually
                        verificationType: 'multiple-choices',
                        comment: '', //motif
                        choices: [
                            // { label: 'Ignorer', id: 'cancel', onSelectType: 'validation' },
                            { label: 'Valider', id: 'confirm', onSelectType: 'validation' },
                            { label: 'Importer', id: 'upload', onSelectType: 'navigation' },
                        ],
                        responsable: 'Commercial',
                        status: 'pending',
                    },
                    {
                        id: 'propertyTax',
                        title: "Taxe foncière",
                        instructions: "Veuillez importer la taxe foncière du client.",
                        actionOrder: 4,
                        screenName: 'UploadDocument', //creation
                        screenParams: { project: null, documentType: { label: 'Autre', value: 'Autre', selected: false } },
                        type: 'manual', //Check manually
                        verificationType: 'multiple-choices',
                        comment: '', //motif
                        choices: [
                            // { label: 'Ignorer', id: 'cancel', onSelectType: 'validation' },
                            { label: 'Valider', id: 'confirm', onSelectType: 'validation' },
                            { label: 'Importer', id: 'upload', onSelectType: 'navigation' },
                        ],
                        responsable: 'Commercial',
                        status: 'pending',
                    },
                    {
                        id: 'quoteCreation', //Verify if quote exists
                        title: 'Créer un devis',
                        instructions: 'Lorem ipsum dolor',
                        actionOrder: 5,
                        collection: 'Documents',
                        //Verification
                        queryFilters: [
                            { filter: 'project.id', operation: '==', value: '' },
                            { filter: 'type', operation: '==', value: 'Devis' },
                            { filter: 'deleted', operation: '==', value: false },
                            { filter: 'attachment.downloadURL', operation: '!=', value: '' }
                        ],
                        //Navigation
                        queryFiltersUpdateNav: [
                            { filter: 'project.id', operation: '==', value: '' },
                            { filter: 'type', operation: '==', value: 'Devis' },
                            { filter: 'deleted', operation: '==', value: false },
                        ],
                        screenName: 'UploadDocument', //creation
                        screenParams: { project: null, documentType: { label: 'Devis', value: 'Devis', selected: false }, dynamicType: true },
                        type: 'auto',
                        verificationType: 'doc-creation',
                        responsable: 'Commercial',
                        status: 'pending',
                    },
                    {
                        id: 'signedQuoteCreation', //#task: check if devis is still existing..
                        title: 'Signer le devis',
                        instructions: 'Lorem ipsum dolor',
                        actionOrder: 6,
                        collection: 'Documents',
                        queryFilters: [ //VERIFICATION: verify if signed quote exists
                            { filter: 'project.id', operation: '==', value: '' },
                            { filter: 'type', operation: '==', value: 'Devis' },
                            { filter: 'deleted', operation: '==', value: false },
                            { filter: 'attachmentSource', operation: '==', value: 'signature' }
                        ],
                        queryFiltersUpdateNav: [ //NAVIGATION: Get id of the existing quote (to update signature) 
                            { filter: 'project.id', operation: '==', value: '' },
                            { filter: 'type', operation: '==', value: 'Devis' },
                            { filter: 'deleted', operation: '==', value: false },
                        ],
                        screenName: 'UploadDocument',
                        screenParams: { DocumentId: '', onSignaturePop: 2, project: null, documentType: { label: 'Devis', value: 'Devis', selected: false }, dynamicType: true, isSignature: true }, //requires TaskId from { filter: 'project.id', operation: '==', value: '' },  { filter: 'type', operation: '==', value: 'Devis' },
                        type: 'auto',
                        choices: [
                            { label: 'Annuler', id: 'cancel', nextPhase: 'cancelProject', onSelectType: 'transition', commentRequired: true },
                            { label: 'Signer le devis', id: 'sign', onSelectType: 'navigation' },
                        ],
                        responsable: 'Client',
                        status: 'pending',
                        verificationType: 'doc-creation',
                    },
                    {
                        id: 'mandatMPRCreation',
                        title: 'Créer un mandat MaPrimeRénov',
                        instructions: 'Lorem ipsum dolor',
                        actionOrder: 7,
                        collection: 'Documents',
                        //Verification
                        queryFilters: [
                            { filter: 'project.id', operation: '==', value: '' },
                            { filter: 'type', operation: '==', value: 'Mandat MaPrimeRénov' },
                            { filter: 'deleted', operation: '==', value: false },
                            { filter: 'attachment.downloadURL', operation: '!=', value: '' }
                        ],
                        //Navigation
                        queryFiltersUpdateNav: [
                            { filter: 'project.id', operation: '==', value: '' },
                            { filter: 'type', operation: '==', value: 'Mandat MaPrimeRénov' },
                            { filter: 'deleted', operation: '==', value: false },
                        ],
                        screenName: 'UploadDocument', //creation
                        screenParams: { project: null, documentType: { label: 'Mandat MaPrimeRénov', value: 'Mandat MaPrimeRénov', selected: false }, dynamicType: true },
                        type: 'auto',
                        verificationType: 'doc-creation',
                        responsable: 'Commercial',
                        status: 'pending',
                    },
                    {
                        id: 'signedMandatMPRCreation', //#task: check if devis is still existing..
                        title: 'Signer le mandat MaPrimeRénov',
                        instructions: 'Lorem ipsum dolor',
                        actionOrder: 8,
                        collection: 'Documents',
                        queryFilters: [ //VERIFICATION: verify if signed quote exists
                            { filter: 'project.id', operation: '==', value: '' },
                            { filter: 'type', operation: '==', value: 'Mandat MaPrimeRénov' },
                            { filter: 'deleted', operation: '==', value: false },
                            { filter: 'attachmentSource', operation: '==', value: 'signature' }
                        ],
                        queryFiltersUpdateNav: [ //NAVIGATION: Get id of the existing quote (to update signature) 
                            { filter: 'project.id', operation: '==', value: '' },
                            { filter: 'type', operation: '==', value: 'Mandat MaPrimeRénov' },
                            { filter: 'deleted', operation: '==', value: false },
                        ],
                        screenName: 'UploadDocument',
                        screenParams: { DocumentId: '', onSignaturePop: 2, project: null, documentType: { label: 'Mandat MaPrimeRénov', value: 'Mandat MaPrimeRénov', selected: false }, dynamicType: true, isSignature: true }, //requires TaskId from { filter: 'project.id', operation: '==', value: '' },  { filter: 'type', operation: '==', value: 'Devis' },
                        type: 'auto',
                        choices: [
                            { label: 'Annuler', id: 'cancel', nextPhase: 'cancelProject', onSelectType: 'transition', commentRequired: true },
                            { label: 'Signer le mandat MaPrimeRénov', id: 'sign', onSelectType: 'navigation' },
                        ],
                        responsable: 'Client',
                        status: 'pending',
                        verificationType: 'doc-creation',
                    },
                    //#removed
                    // {
                    //     id: 'mandatSynergysCreation',
                    //     title: 'Créer un mandat Synergys',
                    //     instructions: 'Lorem ipsum dolor',
                    //     actionOrder: 9,
                    //     collection: 'Documents',
                    //     //Verification
                    //     queryFilters: [
                    //         { filter: 'project.id', operation: '==', value: '' },
                    //         { filter: 'type', operation: '==', value: 'Mandat Synergys' },
                    //         { filter: 'deleted', operation: '==', value: false },
                    //         { filter: 'attachment.downloadURL', operation: '!=', value: '' }
                    //     ],
                    //     //Navigation
                    //     queryFiltersUpdateNav: [
                    //         { filter: 'project.id', operation: '==', value: '' },
                    //         { filter: 'type', operation: '==', value: 'Mandat Synergys' },
                    //         { filter: 'deleted', operation: '==', value: false },
                    //     ],
                    //     screenName: 'UploadDocument', //creation
                    //     screenParams: { project: null, documentType: { label: 'Mandat Synergys', value: 'Mandat Synergys', selected: false }, dynamicType: true },
                    //     type: 'auto',
                    //     verificationType: 'doc-creation',
                    //     responsable: 'Commercial',
                    //     status: 'pending',
                    // },
                    //#removed
                    // {
                    //     id: 'signedMandatMPRCreation', //#task: check if devis is still existing..
                    //     title: 'Signer le mandat Synergys',
                    //     instructions: 'Lorem ipsum dolor',
                    //     actionOrder: 10,
                    //     collection: 'Documents',
                    //     queryFilters: [ //VERIFICATION: verify if signed quote exists
                    //         { filter: 'project.id', operation: '==', value: '' },
                    //         { filter: 'type', operation: '==', value: 'Mandat Synergys' },
                    //         { filter: 'deleted', operation: '==', value: false },
                    //         { filter: 'attachmentSource', operation: '==', value: 'signature' }
                    //     ],
                    //     queryFiltersUpdateNav: [ //NAVIGATION: Get id of the existing quote (to update signature) 
                    //         { filter: 'project.id', operation: '==', value: '' },
                    //         { filter: 'type', operation: '==', value: 'Mandat Synergys' },
                    //         { filter: 'deleted', operation: '==', value: false },
                    //     ],
                    //     screenName: 'UploadDocument',
                    //     screenParams: { DocumentId: '', onSignaturePop: 2, project: null, documentType: { label: 'Mandat Synergys', value: 'Mandat Synergys', selected: false }, dynamicType: true, isSignature: true }, //requires TaskId from { filter: 'project.id', operation: '==', value: '' },  { filter: 'type', operation: '==', value: 'Devis' },
                    //     type: 'auto',
                    //     choices: [
                    //         { label: 'Annuler', id: 'cancel', nextPhase: 'cancelProject', onSelectType: 'transition', commentRequired: true },
                    //         { label: 'Signer le mandat Synergys', id: 'sign', onSelectType: 'navigation' },
                    //     ],
                    //     responsable: 'Client',
                    //     status: 'pending',
                    //     verificationType: 'doc-creation',
                    // },
                    //info: Removed because currently user can't go back on process (for example after a mistake)
                    // {
                    //     id: 'isQuoteFinanced',
                    //     title: "Le devis est-il accompagné d'un financement ?",
                    //     instructions: 'Lorem ipsum dolor',
                    //     actionOrder: 11,
                    //     type: 'manual',
                    //     verificationType: 'multiple-choices',
                    //     comment: '', //#task: comments are joined (separated by ;)
                    //     choices: [
                    //         { label: 'NON', id: 'comment', nextStep: 'technicalVisitCreation', onSelectType: 'transition', commentRequired: true }, //User's manual choice will route to next step (confirmRd2, postponeRd2 or cancelRd2) (it will technically set "nextStep" property)
                    //         { label: 'OUI', id: 'confirm', onSelectType: 'validation' },
                    //     ],
                    //     responsable: 'Commercial',
                    //     status: 'pending',
                    // },
                    {
                        id: 'financingWebsite',
                        title: 'Propositions de financement',
                        instructions: "Lorem ipsum dolor",
                        actionOrder: 9,
                        type: 'manual',
                        comment: '',
                        verificationType: 'multiple-choices',
                        choices: [
                            { label: 'Adhefi.com', id: 'cashPayment', image: "sofincoLogo", onSelectType: 'openLink', link: 'https://www.adhefi.com' },
                            { label: 'Moncofidispro.fr', id: 'financing', image: "cofidisLogo", onSelectType: 'openLink', link: 'https://www.moncofidispro.fr' },
                            { label: 'Continuer', id: 'confirm', nextStep: 'payModeValidation', onSelectType: 'transition' },
                        ],
                        responsable: 'Commercial',
                        status: 'pending',
                    },
                ]
            },
            'payModeValidation': {
                title: "Validation modalité paiement",
                instructions: 'Lorem ipsum dolor',
                stepOrder: 3,
                actions: [
                    {
                        id: 'payModeChoice',
                        title: 'Modalité de paiement',
                        instructions: "Lorem ipsum dolor",
                        actionOrder: 1,
                        type: 'manual',
                        comment: '',
                        verificationType: 'multiple-choices',
                        choices: [
                            { label: 'Paiement comptant', id: 'cashPayment', onSelectType: 'commentPicker', nextStep: 'technicalVisitCreation' },
                            { label: 'Financement', id: 'financing', onSelectType: 'commentPicker', nextStep: 'technicalVisitCreation' },
                        ],
                        responsable: 'Commercial',
                        status: 'pending',
                    },
                    //Montant de l'acompte? (zone de saisie) //operation: add it to bill sub attributes
                    //Reste à payer: (zone de saisie)
                    // {
                    //     id: 'quoteValidation',
                    //     title: "Validation du devis par l'ADV", //#task allow adv to view devis before validating (multi-choice: voir/valider)
                    //     instructions: "",
                    //     actionOrder: 2,
                    //     type: 'manual',
                    //     comment: '',
                    //     responsable: 'ADV',
                    //     status: 'pending',
                    //     verificationType: 'multiple-choices',
                    //     choices: [
                    //         { label: 'Annuler', id: 'cancel', nextPhase: 'cancelProject', onSelectType: 'transition', commentRequired: true },
                    //         { label: 'Valider', id: 'confirm', nextStep: 'technicalVisitCreation', onSelectType: 'transition' },
                    //     ],
                    // },
                ]
            },
            'technicalVisitCreation': {
                title: "Création d'une visite technique",
                instructions: 'Lorem ipsum dolor',
                stepOrder: 4,
                actions: [
                    // {
                    //     //General
                    //     id: 'checkTechContact',
                    //     title: 'Renseigner un contact technique pour le projet', //#add refresh before scrollto
                    //     instructions: 'Renseigner un contact technique pour le projet',
                    //     actionOrder: 1,
                    //     //Verification
                    //     collection: 'Projects',
                    //     documentId: '', //#dynamic
                    //     properties: ['techContact', 'id'],
                    //     //Navigation
                    //     screenName: 'ListEmployees',
                    //     screenParams: {
                    //         project: null,
                    //         prevScreen: 'CreateProject',
                    //         isRoot: false,
                    //         titleText: 'Choisir un technicien',
                    //         //Filter List (new param type)
                    //         queryFilters: [ //Filter list
                    //             { filter: 'role', operation: '==', value: 'Poseur' },
                    //             { filter: 'deleted', operation: '==', value: false }
                    //         ]
                    //     },
                    //     type: 'auto',
                    //     verificationType: 'data-fill',
                    //     verificationValue: '',
                    //     responsable: 'Commercial',
                    //     status: 'pending',
                    // },
                    {
                        id: 'technicalVisitCreation', //1. verify if RD2 exists
                        title: 'Créer une visite technique',
                        instructions: 'Lorem ipsum dolor',
                        actionOrder: 1,
                        collection: 'Agenda',
                        queryFilters: [
                            { filter: 'project.id', operation: '==', value: '' },
                            { filter: 'type', operation: '==', value: 'Visite technique' },
                            { filter: 'deleted', operation: '==', value: false },
                            { filter: 'status', operation: '!=', value: 'Annulé' },
                        ],
                        screenName: 'CreateTask', //creation
                        screenParams: { project: null, taskType: { label: 'Visite technique', value: 'Visite technique', natures: ['tech'] }, dynamicType: true },
                        type: 'auto',
                        verificationType: 'doc-creation',
                        responsable: 'Commercial',
                        status: 'pending',
                        nextPhase: 'technicalVisitManagement',
                    }
                ]
            },
        }
    },
    'technicalVisitManagement': {
        title: 'Visite technique',
        instructions: 'Lorem ipsum dolor',
        phaseOrder: 4,
        followers: ['Admin', 'Responsable technique', 'Poseur'],
        steps: {
            'siteCreation': {
                title: 'Planification visite technique',
                instructions: 'Lorem ipsum dolor',  // Example: process.init.create-prospect.nom.title
                stepOrder: 1,
                actions: [
                    {
                        id: 'technicalVisitCreation', //1. verify if Visite Technique exists
                        title: 'Créer une visite technique',
                        instructions: 'Lorem ipsum dolor',
                        actionOrder: 1,
                        collection: 'Agenda',
                        queryFilters: [
                            { filter: 'project.id', operation: '==', value: '' },
                            { filter: 'type', operation: '==', value: 'Visite technique' },
                            { filter: 'deleted', operation: '==', value: false },
                            { filter: 'status', operation: '!=', value: 'Annulé' },
                        ],
                        screenName: 'CreateTask', //creation
                        screenParams: { project: null, taskType: { label: 'Visite technique', value: 'Visite technique', natures: ['tech'] }, dynamicType: true },
                        type: 'auto',
                        responsable: 'Poseur',
                        status: 'pending',
                        verificationType: 'doc-creation',
                    },
                    {
                        id: 'technicalVisitValidation',
                        title: "Valider la date de la visite technique",
                        instructions: 'Lorem ipsum dolor',
                        actionOrder: 2,
                        collection: 'Agenda',
                        queryFilters: [
                            { filter: 'project.id', operation: '==', value: '' },
                            { filter: 'type', operation: '==', value: 'Visite technique' },
                            { filter: 'deleted', operation: '==', value: false },
                            { filter: 'status', operation: '!=', value: 'Annulé' },
                        ],
                        screenName: 'CreateTask', //creation
                        screenParams: { project: null, TaskId: '', taskType: { label: 'Visite technique', value: 'Visite technique', natures: ['tech'] }, dynamicType: true },
                        type: 'manual',
                        verificationType: 'multiple-choices',
                        comment: '', //motif
                        choices: [
                            { label: 'Valider', id: 'confirm', onSelectType: 'validation', operation: { collection: "Clients", docId: "", type: 'update', field: 'status', value: "active" } },
                            { label: 'Modifier la date', id: 'edit', onSelectType: 'navigation' },
                        ],
                        responsable: 'Poseur',
                        status: 'pending',
                    },
                    {
                        id: 'poseurAffectation', //Validate "poseur" set previously
                        title: "Affecter un technicien à la visite technique",
                        instructions: 'Lorem ipsum dolor',
                        actionOrder: 3,
                        collection: 'Agenda',
                        queryFilters: [
                            { filter: 'project.id', operation: '==', value: '' },
                            { filter: 'type', operation: '==', value: 'Visite technique' },
                            { filter: 'deleted', operation: '==', value: false },
                            { filter: 'status', operation: '!=', value: 'Annulé' },
                        ],
                        screenName: 'CreateTask',
                        screenParams: { TaskId: '', taskType: { label: 'Visite technique', value: 'Visite technique', natures: ['tech'] }, dynamicType: true },
                        type: 'manual',
                        verificationType: 'multiple-choices',
                        comment: '',
                        choices: [
                            { label: 'Valider le technicien', id: 'confirm', nextStep: 'technicalVisitFile', onSelectType: 'transition' },
                            { label: 'Modifier le technicien', id: 'edit', onSelectType: 'navigation' }, //#ask: isn't the poseur already predefined with project as technical contact ?
                        ],
                        responsable: 'Poseur',
                        status: 'pending',
                    },
                ]
            },
            'technicalVisitFile': {
                title: 'Remplissage visite technique',
                instructions: 'Lorem ipsum dolor',
                stepOrder: 2,
                actions: [
                    //#task: add Visite technique (montant de l'accompte available) (dynamic: false, public: true)
                    {
                        id: 'technicalVisitFileCreation',
                        title: 'Remplir la visite technique',
                        instructions: 'Lorem ipsum dolor',
                        actionOrder: 1,
                        collection: 'Documents',
                        //Verification
                        queryFilters: [
                            { filter: 'project.id', operation: '==', value: '' },
                            { filter: 'type', operation: '==', value: 'Visite technique' },
                            { filter: 'deleted', operation: '==', value: false },
                            { filter: 'attachment.downloadURL', operation: '!=', value: '' }
                        ],
                        //Navigation
                        queryFiltersUpdateNav: [
                            { filter: 'project.id', operation: '==', value: '' },
                            { filter: 'type', operation: '==', value: 'Visite technique' },
                            { filter: 'deleted', operation: '==', value: false },
                        ],
                        screenName: 'UploadDocument', //creation
                        screenParams: { project: null, documentType: { label: 'Visite technique', value: 'Visite technique', selected: false }, dynamicType: true },
                        type: 'auto',
                        verificationType: 'doc-creation',
                        responsable: 'Poseur',
                        status: 'pending',
                    },
                    {
                        id: 'technicalVisitChoice',
                        title: "Voulez-vous cloturer la visite technique",
                        instructions: 'Lorem ipsum dolor',
                        actionOrder: 2,
                        collection: 'Agenda',
                        documentId: '',
                        queryFilters: [
                            { filter: 'project.id', operation: '==', value: '' },
                            { filter: 'type', operation: '==', value: 'Visite technique' },
                            { filter: 'deleted', operation: '==', value: false },
                            { filter: 'status', operation: '!=', value: 'Annulé' },
                        ],
                        type: 'manual', //Check manually
                        verificationType: 'multiple-choices',
                        comment: '', //motif
                        choices: [
                            { label: 'Abandonner', id: 'cancel', nextPhase: 'cancelProject', onSelectType: 'transition', commentRequired: true, operation: { type: 'update', field: 'status', value: 'Annulé' } },
                            { label: 'Oui', id: 'confirm', nextPhase: 'installation', onSelectType: 'transition', operation: { type: 'update', field: 'status', value: 'Terminé' } },
                        ],
                        responsable: 'Poseur',
                        status: 'pending',
                    }
                ]
            },
        },
    },
    'installation': {
        title: 'Installation',
        instructions: 'Lorem ipsum dolor',
        phaseOrder: 5,
        followers: ['Admin', 'Responsable technique', 'Poseur'],
        steps: {
            'installationCreation': {
                title: 'Plannification installation',
                instructions: 'Lorem ipsum dolor',  // Example: process.init.create-prospect.nom.title
                stepOrder: 1,
                actions: [
                    {
                        id: 'installationCreation', //1. verify if RD2 exists
                        title: 'Créer une tâche de type installation',
                        instructions: 'Lorem ipsum dolor',
                        actionOrder: 1,
                        collection: 'Agenda',
                        queryFilters: [
                            { filter: 'project.id', operation: '==', value: '' },
                            { filter: 'type', operation: '==', value: 'Installation' },
                            { filter: 'deleted', operation: '==', value: false },
                            { filter: 'status', operation: '!=', value: 'Annulé' },
                        ],
                        screenName: 'CreateTask', //creation
                        screenParams: { project: null, taskType: { label: 'Installation', value: 'Installation', natures: ['tech'] }, dynamicType: true },
                        type: 'auto',
                        responsable: 'Poseur',
                        status: 'pending',
                        verificationType: 'doc-creation',
                        nextStep: 'installationChoice'
                    },
                ]
            },
            'installationChoice': {
                title: "Mise à jour du statut de l'installation",
                instructions: 'Lorem ipsum dolor',
                stepOrder: 2,
                actions: [
                    {
                        id: 'installationChoice1',
                        title: "Mettre à jour le statut de l'installation (1)",
                        instructions: 'Lorem ipsum dolor',
                        actionOrder: 1,
                        collection: 'Agenda',
                        documentId: '',
                        queryFilters: [
                            { filter: 'project.id', operation: '==', value: '' },
                            { filter: 'type', operation: '==', value: 'Installation' },
                            { filter: 'deleted', operation: '==', value: false },
                            { filter: 'status', operation: '!=', value: 'Annulé' },
                        ],
                        type: 'manual', //Check manually
                        verificationType: 'multiple-choices',
                        comment: '', //motif
                        choices: [
                            { label: 'Bloquée', id: 'block', onSelectType: 'validation', commentRequired: true, operation: { type: 'update', field: 'status', value: 'En attente' } },
                            { label: 'Finalisée', id: 'confirm', nextStep: 'pvCreation', onSelectType: 'transition', operation: { type: 'update', field: 'status', value: 'Terminé' } },
                        ],
                        responsable: 'Poseur',
                        status: 'pending',
                    },
                    {
                        id: 'installationChoice2',
                        title: "Mettre à jour le statut de l'installation (2)",
                        instructions: 'Lorem ipsum dolor',
                        actionOrder: 2,
                        collection: 'Agenda',
                        documentId: '',
                        queryFilters: [
                            { filter: 'project.id', operation: '==', value: '' },
                            { filter: 'type', operation: '==', value: 'Installation' },
                            { filter: 'deleted', operation: '==', value: false },
                            { filter: 'status', operation: '!=', value: 'Annulé' },
                        ],
                        type: 'manual',
                        verificationType: 'multiple-choices',
                        comment: '', //motif
                        choices: [
                            { label: 'Abandonnée', id: 'cancel', nextPhase: 'cancelProject', onSelectType: 'transition', commentRequired: true, operation: { type: 'update', field: 'status', value: 'Annulé' } },
                            { label: 'En cours', id: 'confirm', onSelectType: 'actionRollBack', operation: { type: 'update', field: 'status', value: 'En cours' } },
                        ],
                        responsable: 'Poseur',
                        status: 'pending',
                        forceValidation: true
                    }
                ]
            },
            'pvCreation': {
                title: "Création d'un PV réception",
                instructions: 'Lorem ipsum dolor',
                stepOrder: 3,
                actions: [
                    {
                        id: 'pvCreation', //1. verify if RD2 exists
                        title: 'Créer un PV réception',
                        instructions: 'Lorem ipsum dolor',
                        actionOrder: 1,
                        collection: 'Documents',
                        //Verification:
                        queryFilters: [
                            { filter: 'project.id', operation: '==', value: '' },
                            { filter: 'type', operation: '==', value: 'PV réception' },
                            { filter: 'deleted', operation: '==', value: false },
                            { filter: 'attachment.downloadURL', operation: '!=', value: '' }
                        ],
                        //Navigation
                        queryFiltersUpdateNav: [
                            { filter: 'project.id', operation: '==', value: '' },
                            { filter: 'type', operation: '==', value: 'PV réception' },
                            { filter: 'deleted', operation: '==', value: false },
                        ],
                        screenName: 'UploadDocument', //creation
                        screenParams: { project: null, documentType: { label: 'PV réception', value: 'PV réception', selected: false }, dynamicType: true, },
                        type: 'auto',
                        verificationType: 'doc-creation',
                        responsable: 'Poseur',
                        status: 'pending',
                        nextStep: 'reserve',
                    }
                ]
            },
            'reserve': {
                title: "Réserve",
                instructions: 'Lorem ipsum dolor',
                stepOrder: 4,
                actions: [
                    {
                        id: 'reserve',
                        title: 'Êtes-vous satisfait de notre travail ?',
                        instructions: 'Lorem ipsum dolor',
                        actionOrder: 1,
                        type: 'manual',
                        verificationType: 'multiple-choices',
                        comment: '', //#task: comments are joined (separated by ;)
                        choices: [
                            { label: 'NON', id: 'comment', nextStep: 'catchupCreation', onSelectType: 'transition', commentRequired: true }, //User's manual choice will route to next step (confirmRd2, postponeRd2 or cancelRd2) (it will technically set "nextStep" property)
                            { label: 'OUI', id: 'confirm', nextStep: 'poseurValidation', onSelectType: 'transition' },
                        ],
                        responsable: 'Client',
                        status: 'pending',
                    },
                ]
            },
            'catchupCreation': {
                title: "Plannification tâche rattrapage",
                instructions: 'Lorem ipsum dolor',
                stepOrder: 5,
                actions: [
                    {
                        id: 'catchupCreation', //1. verify if RD2 exists
                        title: 'Créer une tâche rattrapage',
                        instructions: 'Créer une tâche rattrapage.',
                        actionOrder: 1,
                        collection: 'Agenda',
                        queryFilters: [
                            { filter: 'project.id', operation: '==', value: '' },
                            { filter: 'type', operation: '==', value: 'Rattrapage' },
                            { filter: 'deleted', operation: '==', value: false },
                            { filter: 'status', operation: '!=', value: 'Annulé' },
                        ],
                        screenName: 'CreateTask', //creation
                        screenParams: { project: null, taskType: { label: 'Rattrapage', value: 'Rattrapage', natures: ['tech'] }, dynamicType: true },
                        type: 'auto',
                        responsable: 'Poseur',
                        status: 'pending',
                        verificationType: 'doc-creation',
                    },
                    {
                        id: 'catchupChoice',
                        title: 'Finaliser la tâche rattrapage',
                        instructions: 'Lorem ipsum dolor',
                        actionOrder: 3,
                        collection: 'Agenda',
                        documentId: '',
                        queryFilters: [
                            { filter: 'project.id', operation: '==', value: '' },
                            { filter: 'type', operation: '==', value: 'Rattrapage' },
                            { filter: 'deleted', operation: '==', value: false },
                            { filter: 'status', operation: '!=', value: 'Annulé' },
                        ],
                        type: 'manual',
                        verificationType: 'multiple-choices',
                        choices: [
                            { label: 'Finaliser', id: 'finish', nextStep: 'reserve', onSelectType: 'transition', operation: { type: 'update', field: 'status', value: 'Terminé' } },
                        ],
                        responsable: 'Poseur',
                        status: 'pending',
                    },
                ]
            },
            'poseurValidation': {
                title: "Validation du technicien",
                instructions: 'Lorem ipsum dolor',
                stepOrder: 6,
                actions: [
                    {
                        id: 'maintainanceContractChoice',
                        title: 'Voulez-vous initier le contrat de maintenance ?',
                        instructions: 'Lorem ipsum dolor',
                        actionOrder: 1,
                        type: 'manual', //Check manually
                        verificationType: 'multiple-choices',
                        comment: '', //motif
                        choices: [
                            { label: 'Décider plus tard, passer à la facturation', id: 'cancel', nextStep: 'facturationOption1', onSelectType: 'transition', commentRequired: true }, //User's manual choice will route to next step (confirmRd2, postponeRd2 or cancelRd2) (it will technically set "nextStep" property)
                            { label: 'OUI', id: 'confirm', nextStep: 'maintainanceContract', onSelectType: 'transition' },
                        ],
                        responsable: 'Poseur',
                        status: 'pending',
                    },
                ]
            },
            'maintainanceContract': {
                title: "Contrat maintenance",
                instructions: 'Lorem ipsum dolor',
                stepOrder: 7,
                actions: [
                    {
                        id: 'commercialPropositionChoice',
                        title: "Accepter la proposition commerciale",
                        instructions: 'Lorem ipsum dolor',
                        actionOrder: 1,
                        type: 'manual', //Check manually
                        verificationType: 'multiple-choices',
                        comment: '', //motif
                        choices: [
                            { label: 'Décider plus tard, passer à la facturation', id: 'skip', nextStep: 'facturationOption1', onSelectType: 'transition' },
                            { label: 'Accepter', id: 'confirm', onSelectType: 'validation' },
                        ],
                        responsable: 'Poseur',
                        status: 'pending',
                    },
                    {
                        id: 'mandatSepaCreation',
                        title: "Créer/Importer un mandat SEPA",
                        instructions: 'Lorem ipsum dolor',
                        actionOrder: 2,
                        collection: 'Documents',
                        //Verification:
                        queryFilters: [
                            { filter: 'project.id', operation: '==', value: '' },
                            { filter: 'type', operation: '==', value: 'Mandat SEPA' },
                            { filter: 'deleted', operation: '==', value: false },
                            { filter: 'attachment.downloadURL', operation: '!=', value: '' }
                        ],
                        //Navigation
                        queryFiltersUpdateNav: [
                            { filter: 'project.id', operation: '==', value: '' },
                            { filter: 'type', operation: '==', value: 'Mandat SEPA' },
                            { filter: 'deleted', operation: '==', value: false },
                        ],
                        screenName: 'UploadDocument', //creation
                        screenParams: { project: null, documentType: { label: 'Mandat SEPA', value: 'Mandat SEPA', selected: false }, dynamicType: true },
                        type: 'auto', //Check manually
                        verificationType: 'doc-creation',
                        comment: '', //motif
                        choices: [
                            { label: 'Décider plus tard, passer à la facturation', id: 'skip', nextStep: 'facturationOption1', onSelectType: 'transition' },
                            { label: 'Importer le document', id: 'upload', onSelectType: 'navigation' },
                        ],
                        responsable: 'Poseur',
                        status: 'pending',
                    },
                    {
                        id: 'signedSEPACreation',
                        title: 'Signer le mandat SEPA',
                        instructions: 'Lorem ipsum dolor',
                        actionOrder: 3,
                        collection: 'Documents',
                        queryFilters: [ //verify if signed mandat SEPA exists
                            { filter: 'project.id', operation: '==', value: '' },
                            { filter: 'type', operation: '==', value: 'Mandat SEPA' },
                            { filter: 'deleted', operation: '==', value: false },
                            { filter: 'attachmentSource', operation: '==', value: 'signature' }
                        ],
                        queryFiltersUpdateNav: [ //Get id of the existing signed mandat (to update signature)
                            { filter: 'project.id', operation: '==', value: '' },
                            { filter: 'type', operation: '==', value: 'Mandat SEPA' },
                            { filter: 'deleted', operation: '==', value: false },
                        ],
                        screenName: 'UploadDocument',
                        screenParams: { DocumentId: '', onSignaturePop: 2, project: null, documentType: { label: 'Mandat SEPA', value: 'Mandat SEPA', selected: false }, dynamicType: true, isSignature: true }, //requires TaskId from { filter: 'project.id', operation: '==', value: '' },  { filter: 'type', operation: '==', value: 'Devis' },
                        type: 'auto',
                        verificationType: 'doc-creation',
                        choices: [
                            { label: 'Décider plus tard, passer à la facturation', id: 'cancel', nextStep: 'facturationOption1', onSelectType: 'transition', commentRequired: true },
                            { label: 'Signer le mandat SEPA', id: 'sign', onSelectType: 'navigation' },
                        ],
                        responsable: 'Client',
                        status: 'pending',
                    },
                    {
                        id: 'contractCreation',
                        title: "Créer/Importer un contrat",
                        instructions: 'Lorem ipsum dolor',
                        actionOrder: 4,
                        collection: 'Documents',
                        //Verification:
                        queryFilters: [
                            { filter: 'project.id', operation: '==', value: '' },
                            { filter: 'type', operation: '==', value: 'Contrat CGU-CGV' },
                            { filter: 'deleted', operation: '==', value: false },
                            { filter: 'attachment.downloadURL', operation: '!=', value: '' }
                        ],
                        //Navigation
                        queryFiltersUpdateNav: [
                            { filter: 'project.id', operation: '==', value: '' },
                            { filter: 'type', operation: '==', value: 'Contrat CGU-CGV' },
                            { filter: 'deleted', operation: '==', value: false },
                        ],
                        screenName: 'UploadDocument',
                        screenParams: { project: null, documentType: { label: 'Contrat CGU-CGV', value: 'Contrat CGU-CGV', selected: false }, dynamicType: true },
                        type: 'auto',
                        responsable: 'Poseur',
                        status: 'pending',
                        verificationType: 'doc-creation',
                        comment: '', //motif
                        choices: [
                            { label: 'Décider plus tard, passer à la facturation', id: 'skip', nextStep: 'facturationOption1', onSelectType: 'transition' },
                            { label: 'Importer le contrat', id: 'upload', onSelectType: 'navigation' },
                        ]
                    },
                    {
                        id: 'signedContractCreation',
                        title: 'Signer le contrat',
                        instructions: 'Lorem ipsum dolor',
                        actionOrder: 5,
                        collection: 'Documents',
                        queryFilters: [ //verify if signed mandat SEPA exists
                            { filter: 'project.id', operation: '==', value: '' },
                            { filter: 'type', operation: '==', value: 'Contrat CGU-CGV' },
                            { filter: 'deleted', operation: '==', value: false },
                            { filter: 'attachmentSource', operation: '==', value: 'signature' }
                        ],
                        queryFiltersUpdateNav: [ //Get id of the existing signed mandat (to update signature)
                            { filter: 'project.id', operation: '==', value: '' },
                            { filter: 'type', operation: '==', value: 'Contrat CGU-CGV' },
                            { filter: 'deleted', operation: '==', value: false },
                        ],
                        screenName: 'UploadDocument',
                        screenParams: { DocumentId: '', onSignaturePop: 2, project: null, documentType: { label: 'Contrat CGU-CGV', value: 'Contrat CGU-CGV', selected: false }, dynamicType: true, isSignature: true }, //requires TaskId from { filter: 'project.id', operation: '==', value: '' },  { filter: 'type', operation: '==', value: 'Devis' },
                        type: 'auto',
                        verificationType: 'doc-creation',
                        choices: [
                            { label: 'Décider plus tard, passer à la facturation', id: 'cancel', nextStep: 'facturationOption1', onSelectType: 'transition', commentRequired: true },
                            { label: 'Signer le contrat', id: 'sign', onSelectType: 'navigation' },
                        ],
                        responsable: 'Client',
                        status: 'pending',
                        nextStep: 'facturationOption1'
                    },
                    //#task: Add last action multi-choice (contrat "en cours" or "terminé")
                ]
            },
            // 'quoteVerification': {
            //     title: "Vérification automatique de l'existence d'un devis généré",
            //     instructions: 'Lorem ipsum dolor',
            //     stepOrder: 8,
            //     //#task: hide it from steps to no show on UI (hidden = true)
            //     actions: [
            //         //Devis verification #ask: It is possible that a project starts from Installation phase so quote does not exist -> cannot create bill from quote. Is it possible that somebody deletes the signed quote ? Or is it possible that If yes should we do quote existance verification to import/sign it again before moving to billing ?
            //         {
            //             id: 'quoteVerification',
            //             title: "Vérification de l'existence d'un devis généré",
            //             instructions: 'Lorem ipsum dolor',
            //             actionOrder: 1,
            //             collection: 'Documents',
            //             queryFilters: [
            //                 { filter: 'project.id', operation: '==', value: '' },
            //                 { filter: 'type', operation: '==', value: 'Devis' },
            //                 { filter: 'deleted', operation: '==', value: false },
            //                 { filter: 'attachmentSource', operation: '==', value: 'generation' }
            //             ],
            //             screenName: 'UploadDocument', //creation
            //             screenParams: { project: null, documentType: { label: 'Devis', value: 'Devis', selected: false }, dynamicType: true },
            //             type: 'auto',
            //             verificationType: 'doc-creation',
            //             status: 'pending',
            //             events: { onDocFound: { nextStep: '' }, onDocNotFound: { nextStep: 'facturationOption1' } }
            //         },
            //         { //Doc found
            //             id: 'billingChoice',
            //             title: "Voulez-vous créer la facture à partir du devis existant de ce projet ?",
            //             instructions: 'Lorem ipsum dolor',
            //             actionOrder: 2,
            //             type: 'manual',
            //             verificationType: 'multiple-choices',
            //             comment: '', //motif
            //             choices: [
            //                 { label: 'NON', id: 'cancel', nextStep: 'facturationOption1', onSelectType: 'transition', commentRequired: true, operation: null }, //User's manual choice will route to next step (confirmRd2, postponeRd2 or cancelRd2) (it will technically set "nextStep" property)
            //                 { label: 'OUI', id: 'confirm', nextStep: 'facturationOption2', onSelectType: 'transition', operation: null },
            //             ],
            //             responsable: 'Poseur',
            //             status: 'pending',
            //         },
            //     ]
            // },
            'facturationOption1': { //no conversion
                title: "Facturation",
                instructions: 'Lorem ipsum dolor',
                stepOrder: 8,
                nextStep: '',
                actions: [
                    {
                        id: 'billCreation',
                        title: 'Créer une facture',
                        instructions: 'Lorem ipsum dolor',
                        actionOrder: 1,
                        collection: 'Documents',
                        //Verification:
                        queryFilters: [
                            { filter: 'project.id', operation: '==', value: '' },
                            { filter: 'type', operation: '==', value: 'Facture' },
                            { filter: 'deleted', operation: '==', value: false },
                            { filter: 'attachment.downloadURL', operation: '!=', value: '' }
                        ],
                        //Navigation
                        queryFiltersUpdateNav: [
                            { filter: 'project.id', operation: '==', value: '' },
                            { filter: 'type', operation: '==', value: 'Facture' },
                            { filter: 'deleted', operation: '==', value: false },
                        ],
                        screenName: 'UploadDocument', //creation
                        screenParams: { project: null, documentType: { label: 'Facture', value: 'Facture', selected: false }, dynamicType: true },
                        type: 'auto',
                        verificationType: 'doc-creation',
                        responsable: 'Poseur',
                        status: 'pending',
                    },
                    {
                        id: 'signedBillCreation', //#task: check if devis is still existing..
                        title: 'Signer la facture',
                        instructions: 'Lorem ipsum dolor',
                        actionOrder: 2,
                        collection: 'Documents',
                        queryFilters: [ //VERIFICATION: verify if signed bill exists
                            { filter: 'project.id', operation: '==', value: '' },
                            { filter: 'type', operation: '==', value: 'Facture' },
                            { filter: 'deleted', operation: '==', value: false },
                            { filter: 'attachmentSource', operation: '==', value: 'signature' }
                        ],
                        queryFiltersUpdateNav: [ //NAVIGATION: Get id of the existing bill (to update signature) 
                            { filter: 'project.id', operation: '==', value: '' },
                            { filter: 'type', operation: '==', value: 'Facture' },
                            { filter: 'deleted', operation: '==', value: false },
                        ],
                        screenName: 'UploadDocument',
                        screenParams: { DocumentId: '', onSignaturePop: 2, project: null, documentType: { label: 'Facture', value: 'Facture', selected: false }, dynamicType: true, isSignature: true },
                        type: 'auto',
                        verificationType: 'doc-creation',
                        choices: [
                            { label: 'Annuler', id: 'cancel', nextPhase: 'cancelProject', onSelectType: 'transition', commentRequired: true },
                            { label: 'Signer la facture', id: 'sign', onSelectType: 'navigation' },
                        ],
                        responsable: 'Client',
                        status: 'pending',
                        nextStep: 'paymentStatus'
                    },
                ]
            },
            'paymentStatus': { //conversion
                title: "Finalisation de la facturation",
                instructions: 'Lorem ipsum dolor',
                stepOrder: 9,
                nextStep: '',
                actions: [
                    {
                        id: 'paymentStatus',
                        title: 'Modifier le statut du paiement',
                        instructions: "Lorem ipsum dolor",
                        actionOrder: 1,
                        type: 'manual',
                        verificationType: 'multiple-choices',
                        comment: '',
                        choices: [
                            { label: 'Attente paiement client', id: 'pending', onSelectType: 'commentPicker', selected: false, stay: true },
                            { label: 'Attente paiement financement', id: 'pending', onSelectType: 'commentPicker', selected: false, stay: true },
                            { label: 'Attente paiement aide', id: 'pending', onSelectType: 'commentPicker', selected: false, stay: true },
                            { label: 'Payé', id: 'confirm', onSelectType: 'commentPicker', selected: false, stay: false },
                        ],
                        responsable: 'Poseur',
                        status: 'pending',
                    },
                    {
                        id: 'advValidation',
                        title: "Validation de la facture par l'ADV", //#task allow adv to view devis before validating (multi-choice: voir/valider)
                        instructions: "",
                        actionOrder: 2,
                        type: 'manual',
                        //verificationType: 'validation',
                        comment: '',
                        responsable: 'ADV',
                        status: 'pending',
                        verificationType: 'multiple-choices',
                        choices: [
                            { label: 'Annuler', id: 'cancel', nextPhase: 'cancelProject', onSelectType: 'transition', commentRequired: true },
                            { label: 'Valider', id: 'confirm', onSelectType: 'validation' },
                        ],
                    },
                    {
                        id: 'billAmount',
                        title: "Montant de la facture", //#task allow adv to view devis before validating (multi-choice: voir/valider)
                        instructions: "",
                        actionOrder: 3,
                        collection: 'Projects',
                        documentId: '',
                        operation: { type: 'update', field: 'bill.amount' },
                        type: 'manual',
                        verificationType: 'comment',
                        comment: '',
                        formSettings: {
                            label: 'Montant de la facture',
                            description: 'Veuillez renseigner le montant total de la facture de ce projet.',
                            keyboardType: 'numeric'
                        },
                        responsable: 'ADV',
                        status: 'pending',
                    },
                    {
                        id: 'attestationCreation',
                        title: 'Créer une attestation fluide',
                        instructions: 'Lorem ipsum dolor',
                        actionOrder: 4,
                        collection: 'Documents',
                        //Verification:
                        queryFilters: [
                            { filter: 'project.id', operation: '==', value: '' },
                            { filter: 'type', operation: '==', value: 'Attestation fluide' },
                            { filter: 'deleted', operation: '==', value: false },
                            { filter: 'attachment.downloadURL', operation: '!=', value: '' }
                        ],
                        //Navigation
                        queryFiltersUpdateNav: [
                            { filter: 'project.id', operation: '==', value: '' },
                            { filter: 'type', operation: '==', value: 'Attestation fluide' },
                            { filter: 'deleted', operation: '==', value: false },
                        ],
                        screenName: 'UploadDocument', //creation
                        screenParams: { project: null, documentType: { label: 'Attestation fluide', value: 'Attestation fluide', selected: false }, dynamicType: true },
                        type: 'auto',
                        verificationType: 'doc-creation',
                        responsable: 'Poseur',
                        status: 'pending',
                        nextStep: 'emailBill'
                    },
                ]
            },
            'emailBill': {
                title: "Envoi facture par mail",
                instructions: 'Lorem ipsum dolor',
                stepOrder: 10,
                nextStep: '',
                actions: [
                    //task: verify if bill & attestation fluide are still existing
                    {
                        id: 'emailBill',
                        title: 'Envoi automatique de la facture finale + attestation fluide par mail en cours...',
                        instructions: 'Lorem ipsum dolor',
                        actionOrder: 2,
                        collection: 'Projects',
                        documentId: '', //#dynamic
                        queryFilters: [
                            { filter: 'project.id', operation: '==', value: '' },
                        ],
                        properties: ['finalBillSentViaEmail'],
                        status: 'pending',
                        verificationType: 'data-fill',
                        verificationValue: false,
                        cloudFunction: {
                            endpoint: 'sendEmail',
                            queryAttachmentsUrls: {
                                'Facture': [
                                    { filter: 'project.id', operation: '==', value: '' },
                                    { filter: 'type', operation: '==', value: 'Facture' },
                                    { filter: 'attachment.downloadURL', operation: '!=', value: '' }
                                ],
                                'Attestation fluide': [
                                    { filter: 'project.id', operation: '==', value: '' },
                                    { filter: 'type', operation: '==', value: 'Attestation fluide' },
                                    { filter: 'attachment.downloadURL', operation: '!=', value: '' }
                                ]
                            },
                            params: {
                                subject: "Facture finale et attestation fluide",
                                dest: 'sa.lyoussi@gmail.com', //#task: change it
                                projectId: '',
                                attachments: []
                            }
                        },
                        nextStep: 'clientReview'
                    },
                ]
            },
            'clientReview': {
                title: "Satisfaction client",
                instructions: "Le directeur technique devra valider la satisfaction du client vis-à-vis de l'installation",
                stepOrder: 11,
                nextStep: '',
                actions: [
                    {
                        id: 'clientReview',
                        title: 'Êtes-vous satisfait de notre service ?',
                        instructions: "Lorem ipsum dolor",
                        actionOrder: 1,
                        type: 'manual',
                        verificationType: 'multiple-choices',
                        isReview: true,
                        comment: '',
                        choices: [
                            { label: '1', onSelectType: 'commentPicker', selected: false, saty: false, nextPhase: 'maintainance' },
                            { label: '2', onSelectType: 'commentPicker', selected: false, saty: false, nextPhase: 'maintainance' },
                            { label: '3', onSelectType: 'commentPicker', selected: false, saty: false, nextPhase: 'maintainance' },
                            { label: '4', onSelectType: 'commentPicker', selected: false, saty: false, nextPhase: 'maintainance' },
                            { label: '5', onSelectType: 'commentPicker', selected: false, saty: false, nextPhase: 'maintainance' },
                            { label: '6', onSelectType: 'commentPicker', selected: false, saty: false, nextPhase: 'maintainance' },
                            { label: '7', onSelectType: 'commentPicker', selected: false, saty: false, nextPhase: 'maintainance' },
                            { label: '8', onSelectType: 'commentPicker', selected: false, saty: false, nextPhase: 'maintainance' },
                            { label: '9', onSelectType: 'commentPicker', selected: false, saty: false, nextPhase: 'maintainance' },
                            { label: '10', onSelectType: 'commentPicker', selected: false, stay: false, nextPhase: 'maintainance' },
                        ],
                        status: 'pending',
                    }
                ]
            }
        },
    },
    'maintainance': {
        title: 'Maintenance',
        instructions: 'Lorem ipsum dolor',
        phaseOrder: 6,
        followers: ['Admin', 'Responsable technique', 'Poseur'],
        steps: {
            'maintainanceContract': {
                title: "Contrat maintenance",
                instructions: 'Lorem ipsum dolor',
                stepOrder: 1,
                actions: [
                    {
                        id: 'commercialPropositionChoice',
                        title: "Accepter la proposition commerciale",
                        instructions: 'Lorem ipsum dolor',
                        actionOrder: 1,
                        type: 'manual', //Check manually
                        verificationType: 'multiple-choices',
                        comment: '', //motif
                        choices: [
                            { label: 'Accepter', id: 'confirm', onSelectType: 'validation' },
                        ],
                        responsable: 'Poseur',
                        status: 'pending',
                    },
                    {
                        id: 'mandatSepaCreation',
                        title: "Créer/Importer un mandat SEPA",
                        instructions: 'Lorem ipsum dolor',
                        actionOrder: 2,
                        collection: 'Documents',
                        //Verification:
                        queryFilters: [
                            { filter: 'project.id', operation: '==', value: '' },
                            { filter: 'type', operation: '==', value: 'Mandat SEPA' },
                            { filter: 'deleted', operation: '==', value: false },
                            { filter: 'attachment.downloadURL', operation: '!=', value: '' }
                        ],
                        //Navigation
                        queryFiltersUpdateNav: [
                            { filter: 'project.id', operation: '==', value: '' },
                            { filter: 'type', operation: '==', value: 'Mandat SEPA' },
                            { filter: 'deleted', operation: '==', value: false },
                        ],
                        screenName: 'UploadDocument', //creation
                        screenParams: { project: null, documentType: { label: 'Mandat SEPA', value: 'Mandat SEPA', selected: false }, dynamicType: true },
                        type: 'auto', //Check manually
                        verificationType: 'doc-creation',
                        comment: '', //motif
                        choices: [
                            { label: 'Importer le document', id: 'upload', onSelectType: 'navigation' },
                        ],
                        responsable: 'Poseur',
                        status: 'pending',
                    },
                    {
                        id: 'signedSEPACreation',
                        title: 'Signer le mandat SEPA',
                        instructions: 'Lorem ipsum dolor',
                        actionOrder: 3,
                        collection: 'Documents',
                        queryFilters: [ //verify if signed mandat SEPA exists
                            { filter: 'project.id', operation: '==', value: '' },
                            { filter: 'type', operation: '==', value: 'Mandat SEPA' },
                            { filter: 'deleted', operation: '==', value: false },
                            { filter: 'attachmentSource', operation: '==', value: 'signature' }
                        ],
                        queryFiltersUpdateNav: [ //Get id of the existing signed mandat (to update signature)
                            { filter: 'project.id', operation: '==', value: '' },
                            { filter: 'type', operation: '==', value: 'Mandat SEPA' },
                            { filter: 'deleted', operation: '==', value: false },
                        ],
                        screenName: 'UploadDocument',
                        screenParams: { DocumentId: '', onSignaturePop: 2, project: null, documentType: { label: 'Mandat SEPA', value: 'Mandat SEPA', selected: false }, dynamicType: true, isSignature: true }, //requires TaskId from { filter: 'project.id', operation: '==', value: '' },  { filter: 'type', operation: '==', value: 'Devis' },
                        type: 'auto',
                        choices: [
                            { label: 'Signer le mandat SEPA', id: 'sign', onSelectType: 'navigation' },
                        ],
                        responsable: 'Client',
                        status: 'pending',
                        verificationType: 'doc-creation',
                    },
                    {
                        id: 'contratCreation',
                        title: "Créer/Importer un contrat",
                        instructions: 'Lorem ipsum dolor',
                        actionOrder: 4,
                        collection: 'Documents',
                        //Verification:
                        queryFilters: [
                            { filter: 'project.id', operation: '==', value: '' },
                            { filter: 'type', operation: '==', value: 'Contrat CGU-CGV' },
                            { filter: 'deleted', operation: '==', value: false },
                            { filter: 'attachment.downloadURL', operation: '!=', value: '' }
                        ],
                        //Navigation
                        queryFiltersUpdateNav: [
                            { filter: 'project.id', operation: '==', value: '' },
                            { filter: 'type', operation: '==', value: 'Contrat CGU-CGV' },
                            { filter: 'deleted', operation: '==', value: false },
                        ],
                        screenName: 'UploadDocument',
                        screenParams: { project: null, documentType: { label: 'Contrat CGU-CGV', value: 'Contrat CGU-CGV', selected: false }, dynamicType: true },
                        type: 'auto',
                        verificationType: 'doc-creation',
                        comment: '', //motif
                        choices: [
                            { label: 'Importer le contrat', id: 'upload', onSelectType: 'navigation' },
                        ],
                        responsable: 'Poseur',
                        status: 'pending',
                    },
                    {
                        id: 'signedContractCreation',
                        title: 'Signer le contrat',
                        instructions: 'Lorem ipsum dolor',
                        actionOrder: 5,
                        collection: 'Documents',
                        queryFilters: [ //verify if signed mandat SEPA exists
                            { filter: 'project.id', operation: '==', value: '' },
                            { filter: 'type', operation: '==', value: 'Contrat CGU-CGV' },
                            { filter: 'deleted', operation: '==', value: false },
                            { filter: 'attachmentSource', operation: '==', value: 'signature' }
                        ],
                        queryFiltersUpdateNav: [ //Get id of the existing signed mandat (to update signature)
                            { filter: 'project.id', operation: '==', value: '' },
                            { filter: 'type', operation: '==', value: 'Contrat CGU-CGV' },
                            { filter: 'deleted', operation: '==', value: false },
                        ],
                        screenName: 'UploadDocument',
                        screenParams: { DocumentId: '', onSignaturePop: 2, project: null, documentType: { label: 'Contrat CGU-CGV', value: 'Contrat CGU-CGV', selected: false }, dynamicType: true, isSignature: true }, //requires TaskId from { filter: 'project.id', operation: '==', value: '' },  { filter: 'type', operation: '==', value: 'Devis' },
                        type: 'auto',
                        verificationType: 'doc-creation',
                        choices: [
                            { label: 'Signer le contrat', id: 'sign', onSelectType: 'navigation' },
                        ],
                        responsable: 'Client',
                        status: 'pending',
                    },
                    {
                        id: 'endProject',
                        title: "Finaliser le projet",
                        instructions: "",
                        actionOrder: 6,
                        type: 'manual',
                        verificationType: 'validation',
                        comment: '',
                        responsable: 'ADV',
                        status: 'pending',
                        nextPhase: 'endProject',
                    },
                ]
            },
        }
    },
    'endProject': {
        title: 'Finalisation',
        instructions: 'Lorem ipsum dolor',
        phaseOrder: 7,
        followers: ['Admin', 'Directeur commercial', 'Commercial', 'Responsable technique', 'Poseur'],
        steps: {
            'endProject': {
                title: "Projet finalisé",
                instructions: '',
                stepOrder: 1,
                actions: [
                    {
                        id: 'endProject',
                        title: 'Le process du projet est terminé.',
                        instructions: "Lorem ipsum dolor",
                        actionOrder: 1,
                        type: 'manual',
                        verificationType: 'no-verification',
                        comment: '',
                        status: 'pending',
                    },
                ]
            },
        }
    },
    'cancelProject': {
        title: 'Annulation',
        instructions: 'Annulation du projet',
        phaseOrder: 7,
        followers: ['Admin', 'Directeur commercial', 'Commercial', 'Responsable technique', 'Poseur'],
        steps: {
            'resumeProject': {
                title: "Reprendre le projet",
                instructions: 'Lorem ipsum dolor',
                stepOrder: 1,
                actions: [
                    {
                        id: 'resumeProject',  //#task: rollback (Resume project)
                        title: 'Appuyez ici pour reprendre le projet',
                        instructions: "Lorem ipsum dolor",
                        actionOrder: 1,
                        collection: 'Projects',
                        documentId: '',
                        type: 'manual',
                        verificationType: 'phaseRollback',
                        operation: { type: 'update', field: 'state', value: 'En cours' },
                        status: 'pending',
                    },
                ]
            },
        }
    },
    'version': 6
}

