
const initialState = { type: '', isConnected: false }

function setNetworkStatus(state = initialState, action) {
    let nextState
    switch (action.type) {
        case 'NET':
            nextState = { 
                ...state,
                type: action.value.type, 
                isConnected: action.value.isConnected 
            }

            return nextState || state

        default:
            return state
    }
}

export default setNetworkStatus