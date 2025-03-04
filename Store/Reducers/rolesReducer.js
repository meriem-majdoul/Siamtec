
const initialState = { role: { id: '', value: '' } }

function setRole(state = initialState, action) {
  let nextState
  switch (action.type) {
    case 'ROLE':
      nextState = {
        ...state,
        role: {
          ...state.role,
          id: action.value.id,
          value: action.value.value,
        }
      }

      return nextState || state

    default:
      return state
  }
}

export default setRole