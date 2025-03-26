
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


export const version0 = {
    'init': {
        title: 'Prospect',
        instructions: 'Lorem ipsum dolor',
        phaseOrder: 1,
        followers: ['Admin', 'Directeur commercial', 'Commercial'],
        steps: { //One step
            'prospectCreation': {
                title: 'Création prospect',
                instructions: 'Lorem ipsum dolor',
                stepOrder: 1,
                actions: [
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
                    {
                        id: 'conversionClient',
                        title: 'Convertir le prospect en client',
                        instructions: 'Appuyez sur le bouton "Convertir en client"',
                        actionOrder: 5,
                        collection: 'Clients',
                        documentId: '', // dynamic
                        properties: ['isProspect'],
                        screenName: 'Profile', //#task OnUpdate client name on his profile: triggered cloud function should run to update all documents containing this client data.
                        screenParams: { user: { id: '', roleId: 'client' }, project: null },
                        screenPush: true,
                        type: 'auto',
                        responsable: 'Commercial',
                        status: 'pending',
                        verificationType: 'data-fill',
                        verificationValue: true, //check if fieldValue !== verificationValue
                    },
                ]
            },
        }
    },
    installation: {
        phaseValue: "En attente d'installation",
        title: "En attente d'installation",
        instructions: '',
        phaseOrder: 2,
        followers: ['Admin', 'Responsable technique', 'Poseur'],
        steps: {
            payModeValidation: {
                title: 'Modalité de paiement',
                instructions: '',
                stepOrder: 1,
                actions: [
                    {
                        id: 'financingAidsWebsite',
                        title: 'Propositions de financement',
                        instructions: 'Naviguer vers le lien du partenaire financier sélectionné, et suivre la procédure selon le partenaire choisi.',
                        actionOrder: 1,
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
                        responsable: 'Commercial',
                        status: 'pending',
                    },
                    {
                        id: 'financingAidsSelection',
                        title: 'Selection du partenaire financier',
                        instructions: 'Selectionnez le partenaire financier de ce projet.',
                        actionOrder: 2,
                        type: 'manual',
                        comment: '',
                        verificationType: 'multiple-choices',
                        choices: [
                            {
                                label: 'Adhefi.com',
                                id: 'cashPayment',
                                image: 'sofincoLogo',
                                onSelectType: 'commentPicker',
                                nextStep: 'technicalVisitCreation',
                            },
                            {
                                label: 'Moncofidispro.fr',
                                id: 'financing',
                                image: 'cofidisLogo',
                                onSelectType: 'commentPicker',
                                nextStep: 'technicalVisitCreation',
                            },
                            {
                                label: 'domofinance.com',
                                id: 'financing',
                                image: 'domofinanceLogo',
                                onSelectType: 'commentPicker',
                                nextStep: 'technicalVisitCreation',
                            },
                            {
                                label: 'Autres',
                                id: 'other',
                                onSelectType: 'commentPicker',
                                nextStep: 'technicalVisitCreation',
                            },
                        ],
                        responsable: 'Commercial',
                        status: 'pending',
                    },
                ],
            },
            technicalVisitCreation: {
                title: "Création d'une visite technique",
                instructions: '',
                stepOrder: 2,
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
        }
    },
    'version': 0
}


