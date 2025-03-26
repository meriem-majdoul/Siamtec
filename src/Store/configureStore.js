// Store/configureStore.js

import { createStore, combineReducers } from 'redux';
import { persistCombineReducers } from 'redux-persist'
import AsyncStorage from '@react-native-async-storage/async-storage';

import userReducer from './Reducers/userReducer'
import rolesReducer from './Reducers/rolesReducer'
import permissionsReducer from './Reducers/permissionsReducer'
import fcmtokenReducer from './Reducers/fcmtokenReducer'
import networkReducer from './Reducers/networkReducer'
import documentsReducer from './Reducers/documentsReducer'
import processReducer from './Reducers/processReducer'
import statusBarReducer from './Reducers/statusBarReducer'
import toastReducer from './Reducers/toastReducer'
import { resetState } from '../core/redux';

const rootPersistConfig = {
    key: 'root',
    storage: AsyncStorage
}

const appReducer = persistCombineReducers(rootPersistConfig, {
    currentUser: userReducer,
    roles: rolesReducer,
    permissions: permissionsReducer,
    fcmtoken: fcmtokenReducer,
    network: networkReducer,
    documents: documentsReducer,
    process: processReducer,
    statusBar: statusBarReducer,
    toast: toastReducer,
})

const rootReducer = (state, action) => {
    if (action.type === 'USER_LOGOUT') {
        // for all keys defined in persistConfig(s)
        AsyncStorage.removeItem('persist:root')
        //AsyncStorage.removeItem('persist:otherKey')
        state = undefined
    }
    return appReducer(state, action)
}

export default createStore(rootReducer)