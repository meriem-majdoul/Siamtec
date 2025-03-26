import * as theme from "../../core/theme"

const initialState = { message: "", type: "" }

function setStatusBar(state = initialState, action) {
    let nextState
    switch (action.type) {
        case 'TOAST':
            nextState = {
                ...state,
                message: action.value.message,
                type: action.value.type
            }

            return nextState || state

        default:
            return state
    }
}

export default setStatusBar