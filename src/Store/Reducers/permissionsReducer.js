
const initialState = {
    projects: { canCreate: false, canRead: false, canUpdate: false, canDelete: false, queryFilters: [] },
    documents: { canCreate: false, canRead: false, canUpdate: false, canDelete: false, queryFilters: [] },
    orders: { canCreate: false, canRead: false, canUpdate: false, canDelete: false, queryFilters: [] },
    users: { canCreate: false, canRead: false, canUpdate: false, canDelete: false, queryFilters: [] },
    teams: { canCreate: false, canRead: false, canUpdate: false, canDelete: false, queryFilters: [] },
    messages: { canCreate: false, canRead: false, canUpdate: false, canDelete: false, queryFilters: [] },
    requests: { canCreate: false, canRead: false, canUpdate: false, canDelete: false, queryFilters: [] },
    tasks: { canCreate: false, canRead: false, canUpdate: false, canDelete: false, queryFilters: [] },
    clients: { canCreate: false, canRead: false, canUpdate: false, canDelete: false, queryFilters: [] },
    active: false
}

function setPermissions(state = initialState, action) {
    let nextState


    switch (action.type) {
        case 'SET_PERMISSIONS':
            nextState = {
                ...state,
                projects: {
                    ...state.projects,
                    canCreate: action.value.projects.canCreate,
                    canRead: action.value.projects.canRead,
                    canUpdate: action.value.projects.canUpdate,
                    canDelete: action.value.projects.canDelete,
                    queryFilters: action.value.projects.queryFilters
                },
                documents: {
                    ...state.documents,
                    canCreate: action.value.documents.canCreate,
                    canRead: action.value.documents.canRead,
                    canUpdate: action.value.documents.canUpdate,
                    canDelete: action.value.documents.canDelete,
                    queryFilters: action.value.documents.queryFilters
                },
                orders: {
                    ...state.orders,
                    canCreate: action.value.orders.canCreate,
                    canRead: action.value.orders.canRead,
                    canUpdate: action.value.orders.canUpdate,
                    canDelete: action.value.orders.canDelete,
                    queryFilters: action.value.orders.queryFilters
                },
                users: {
                    ...state.users,
                    canCreate: action.value.users.canCreate,
                    canRead: action.value.users.canRead,
                    canUpdate: action.value.users.canUpdate,
                    canDelete: action.value.users.canDelete,
                    queryFilters: action.value.users.queryFilters
                },
                teams: {
                    ...state.teams,
                    canCreate: action.value.teams.canCreate,
                    canRead: action.value.teams.canRead,
                    canUpdate: action.value.teams.canUpdate,
                    canDelete: action.value.teams.canDelete,
                    queryFilters: action.value.teams.queryFilters
                },
                messages: {
                    ...state.messages,
                    canCreate: action.value.messages.canCreate,
                    canRead: action.value.messages.canRead,
                    canUpdate: action.value.messages.canUpdate,
                    canDelete: action.value.messages.canDelete,
                    queryFilters: action.value.messages.queryFilters
                },
                requests: {
                    ...state.requests,
                    canCreate: action.value.requests.canCreate,
                    canRead: action.value.requests.canRead,
                    canUpdate: action.value.requests.canUpdate,
                    canDelete: action.value.requests.canDelete,
                    queryFilters: action.value.requests.queryFilters
                },
                tasks: {
                    ...state.tasks,
                    canCreate: action.value.tasks.canCreate,
                    canRead: action.value.tasks.canRead,
                    canUpdate: action.value.tasks.canUpdate,
                    canDelete: action.value.tasks.canDelete,
                    queryFilters: action.value.tasks.queryFilters
                },
                clients: {
                    ...state.tasks,
                    canCreate: action.value.clients.canCreate,
                    canRead: action.value.clients.canRead,
                    canUpdate: action.value.clients.canUpdate,
                    canDelete: action.value.clients.canDelete,
                    queryFilters: action.value.clients.queryFilters
                },
                active: true
            }

            return nextState || state

        default:
            return state
    }
}

export default setPermissions