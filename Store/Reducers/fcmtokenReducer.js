// Store/Reducers/favoriteReducer.js
// Redux test: Add something (film) to favorite

const initialState = { fcmToken: '' }

function setFCMToken(state = initialState, action) {
  let nextState
  switch (action.type) {
    case 'FCMTOKEN':
      nextState = {
        ...state,
        fcmToken: action.value
      }

      return nextState || state

    default:
      return state
  }
}

export default setFCMToken