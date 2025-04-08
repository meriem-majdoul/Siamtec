// Définition des types d'action
const ActionTypes = {
    SET_APP_TOAST: 'SET_APP_TOAST',
    STATUSBAR_COLOR: 'STATUSBAR_COLOR',
    CURRENT_USER: 'CURRENT_USER',
    ROLE: 'ROLE',
    SET_PERMISSIONS: 'SET_PERMISSIONS',
    NET: 'NET',
    UPLOAD_PROGRESS_STARTED: 'UPLOAD_PROGRESS_STARTED',
    UPLOAD_PROGRESS_CHANGED: 'UPLOAD_PROGRESS_CHANGED',
    UPLOAD_PROGRESS_FINISHED: 'UPLOAD_PROGRESS_FINISHED',
    USER_LOGOUT: 'USER_LOGOUT',
};

// Dispatch action générique (pas besoin de le faire manuellement si tu es connecté avec `connect`)
const dispatchAction = (dispatch, type, value) => {
    const action = { type, value };
    dispatch(action);
};

// App Toast
export const setAppToast = (toast) => ({
    type: ActionTypes.SET_APP_TOAST,
    payload: toast,
});

// CurrentUser
export const setStatusBarColor = (statusBarProps) => ({
    type: ActionTypes.STATUSBAR_COLOR,
    value: statusBarProps,
});

export const setCurrentUser = (user) => ({
    type: ActionTypes.CURRENT_USER,
    value: user,
});

// Role
export const setRole = (role) => ({
    type: ActionTypes.ROLE,
    value: role,
});

// Permissions
export const setPermissions = (permissions) => ({
    type: ActionTypes.SET_PERMISSIONS,
    value: permissions,
});

export const setNetwork = (network) => ({
    type: ActionTypes.NET,
    value: network,
});

// Document actions
export const onUploadProgressStart = (attachment) => ({
    type: ActionTypes.UPLOAD_PROGRESS_STARTED,
    value: attachment,
});

export const onUploadProgressChange = (attachment) => ({
    type: ActionTypes.UPLOAD_PROGRESS_CHANGED,
    value: attachment,
});

export const onUploadProgressEnd = (attachment) => ({
    type: ActionTypes.UPLOAD_PROGRESS_FINISHED,
    value: attachment,
});

// Logout (Reset state and Purge asyncstorage)
export const resetState = () => ({
    type: ActionTypes.USER_LOGOUT,
    value: '',
});

export default ActionTypes;
