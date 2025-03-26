
const initialState = { processModels: undefined }

function setProcessModel(state = initialState, action) {
    let nextState

    switch (action.type) {
        case 'SET_PROCESS_MODELS':
            nextState = {
                ...state,
                processModels: action.value
            }

            return nextState || state

        default:
            return state
    }
}

export default setProcessModel