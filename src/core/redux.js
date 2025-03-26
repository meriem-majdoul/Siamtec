
//Dispatch action
const dispatchAction = (main, type, value) => {
    const action = { type, value }
    main.props.dispatch(action)
}

//App Toast
export const setAppToast = (main, value) => {
    dispatchAction(main, "TOAST", value)
}

//CurrentUser
export const setStatusBarColor = (main, statusBarProps) => {
    const action = { type: "STATUSBARCOLOR", value: statusBarProps }
    main.props.dispatch(action)
}

export const setCurrentUser = (main, user) => {
    const action = { type: "CURRENTUSER", value: user }
    main.props.dispatch(action)
}

//Role
export const setRole = (main, role) => {
    const action = { type: "ROLE", value: role }
    main.props.dispatch(action)
}

// //Process
// export const setProcessModel = (main, processModels) => {
//     const action = { type: "SET_PROCESS_MODELS", value: processModels }
//     main.props.dispatch(action)
// }

//Permissions

export const setPermissions = (main, permissions) => {
    const action = { type: "SET_PERMISSIONS", value: permissions }
    main.props.dispatch(action)
}

export const setNetwork = (main, network) => {
    const action = { type: "NET", value: network }
    main.props.dispatch(action)
}

//Document actions
export const onUploadProgressStart = (main, attachment) => {
    const action = { type: "UPLOAD_PROGRESS_STARTED", value: attachment }
    main.props.dispatch(action)
}

export const onUploadProgressChange = (main, attachment) => {
    const action = { type: "UPLOAD_PROGRESS_CHANGED", value: attachment }
    main.props.dispatch(action)
}

export const onUploadProgressEnd = (main, attachment) => {
    const action = { type: "UPLOAD_PROGRESS_FINISHED", value: attachment }
    main.props.dispatch(action)
}

//Logout (Reset state and Purge asyncstorage)
export const resetState = (main) => {
    const action = { type: "USER_LOGOUT", value: '' }
    main.props.dispatch(action)
}