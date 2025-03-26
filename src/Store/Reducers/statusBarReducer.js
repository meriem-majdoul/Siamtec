import * as theme from "../../core/theme"

const initialState = { backgroundColor: theme.colors.background, barStyle: "dark-content" }

function setStatusBar(state = initialState, action) {
    let nextState
    switch (action.type) {
        case 'STATUSBARCOLOR':
            nextState = {
                ...state,
                backgroundColor: action.value.backgroundColor,
                barStyle: action.value.barStyle
            }

            return nextState || state

        default:
            return state
    }
}

export default setStatusBar