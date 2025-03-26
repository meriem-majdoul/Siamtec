
const initialState = { id: '', fullName: '', email: '', role: '' }

function setUser(state = initialState, action) {
    let nextState
    switch (action.type) {
        case 'CURRENTUSER':
            nextState = {
                ...state,
                id: action.value.id,
                fullName: action.value.fullName,
                email: action.value.email,
                role: action.value.role
            }

            return nextState || state

        default:
            return state
    }
}

export default setUser