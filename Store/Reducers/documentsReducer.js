import { omit } from 'lodash'

const initialState = { newAttachments: {} }

function handleUploadProgress(state = initialState, action) {
    let nextState
    switch (action.type) {
        case 'UPLOAD_PROGRESS_STARTED':
            console.log('UPLOAD_PROGRESS_STARTED')
            nextState = {
                ...state,
                newAttachments: {
                    ...state.newAttachments,
                    [action.value.DocumentId]: {
                        ...state.newAttachments[action.value.DocumentId],
                        name: action.value.name,
                        path: action.value.path,
                        size: action.value.size,
                        type: action.value.type,
                        storageRefPath: action.value.storageRefPath,
                        progress: 0
                    }
                }
            }

            return nextState || state

        case 'UPLOAD_PROGRESS_CHANGED':
            console.log('UPLOAD_PROGRESS_CHANGED')
            nextState = {
                ...state,
                newAttachments: {
                    ...state.newAttachments,
                    [action.value.DocumentId]: {
                        ...state.newAttachments[action.value.DocumentId],
                        progress: action.value.progress
                    }
                }
            }

            return nextState || state

        case 'UPLOAD_PROGRESS_FINISHED':
            console.log('UPLOAD_PROGRESS_FINISHED')
            let nextState = Object.assign({}, state)
            delete nextState.newAttachments[action.value.DocumentId]
            return nextState || state

        default:
            return state
    }
}

export default handleUploadProgress