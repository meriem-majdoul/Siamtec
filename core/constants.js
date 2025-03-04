import { Dimensions } from 'react-native'

const width = Dimensions.get('window').width
const height = Dimensions.get('window').height

export const constants = {
    ScreenWidth: width,
    ScreenHeight: height
}

export const rolesRedux = [
    { id: 'admin', value: 'Admin', bool: 'isAdmin' },
    { id: 'backoffice', value: 'Back office', bool: 'isBackOffice' },
    { id: 'dircom', value: 'Directeur commercial', bool: 'isDirCom' },
    { id: 'com', value: 'Commercial', bool: 'isCom' },
    { id: 'tech', value: 'Responsable technique', bool: 'isTech' },
    { id: 'poseur', value: 'Poseur', bool: 'isPoseur' }
]

