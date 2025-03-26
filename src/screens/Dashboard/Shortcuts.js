import React, { Component } from 'react'
import { StyleSheet, Text, View, FlatList, ScrollView } from 'react-native'
import { faUserAlt, faAddressCard, faClipboardUser, faConstruction, faCalendarAlt, faFolder, faVials } from 'react-native-vector-icons/FontAwesome5'
import { connect } from 'react-redux'
import _ from "lodash"

import moment from 'moment';
import 'moment/locale/fr'
moment.locale('fr')

import { db, auth } from '../../firebase'
import * as theme from '../../core/theme'
import { constants, isTablet, ScreenWidth } from '../../core/constants'
import { load } from '../../core/utils'

import { ModalForm } from '../../components/ModalOptions'

import { Appbar, CustomIcon, Section, EmptyList, NotificationItem, TaskItem, Loading } from '../../components'
//import crashlytics, { firebase } from '@react-native-firebase/crashlytics';

const shortcutsModel = {
    createProspect: {
        label: 'Nouveau prospect',
        value: '',
        icon: faClipboardUser,
        colors: { primary: '#ff6968', secondary: '#fe8280' },
        navigation: { screen: 'CreateClient', params: { prevScreen: 'Dashboard', isProspect: true } }
    },
    // createClient: {
    //     label: 'Nouveau client',
    //     value: '',
    //     icon: faAddressCard,
    //     colors: { primary: '#7a54ff', secondary: '#946afc' },
    //     navigation: {
    //         screen: 'CreateClient',
    //         params: { prevScreen: 'Dashboard', isProspect: false }
    //     }
    // },
    createUser: {
        label: 'Nouvel utilisateur',
        value: '',
        icon: faUserAlt,
        colors: { primary: '#ff8f61', secondary: '#fea879' },
        navigation: { screen: 'CreateUser', params: { prevScreen: 'Dashboard' } }
    },
    createProject: {
        label: 'Nouveau projet',
        value: '',
        icon: faConstruction,
        colors: { primary: '#2ac3ff', secondary: '#38d3ff' },
        navigation: { screen: 'ClientsManagement', params: { isRoot: false, prevScreen: 'Dashboard' } }
    },
    createTask: {
        label: 'Nouvelle tâche',
        value: '',
        icon: faCalendarAlt,
        colors: { primary: '#5a65ff', secondary: '#717bff' },
        navigation: { screen: 'CreateTask', params: { prevScreen: 'Dashboard' } }
    },
    createDocument: {
        label: 'Nouveau document',
        value: '',
        icon: faFolder,
        colors: { primary: '#96da45', secondary: '#ace558' },
        navigation: { screen: 'UploadDocument', params: { prevScreen: 'Dashboard' } }
    },
    createSimulation: {
        label: 'Nouvelle simulation',
        value: '',
        icon: faVials,
        colors: { primary: theme.colors.primary, secondary: '#35E999' },
        navigation: { screen: 'CreateSimulation', params: { prevScreen: 'Dashboard' } }
    }
}

class Shortcuts extends Component {
    constructor(props) {
        super(props)
        this.shortcuts = this.setPermissionBasedShortcuts()

        this.state = {
            loading: true
        }
    }

    componentDidMount() {
        load(this, false)
    }

    doSomething() {
        return { a: 1, b: 2 }
    }

    setPermissionBasedShortcuts() {
        let shortcuts = []
        const { clients, users, projects, tasks, documents } = this.props.permissions
        const { createProspect, createUser, createProject, createTask, createDocument, createSimulation } = shortcutsModel

        if (clients.canCreate) shortcuts.push(createProspect)
        // if (clients.canCreate) shortcuts.push(createClient)
        if (users.canCreate) shortcuts.push(createUser)
        if (projects.canCreate) shortcuts.push(createProject)
        if (tasks.canCreate) shortcuts.push(createTask)
        if (documents.canCreate) shortcuts.push(createDocument)
        if (this.props.role.id !== "client") shortcuts.push(createSimulation)

        return shortcuts
    }


    render() {
        const { loading } = this.state
        // const { isConnected } = this.props.network

        const elementSize = isTablet ?
            ScreenWidth * 0.29
            :
            ScreenWidth * 0.435

        const handleSelectElement = (element, index) => {
            const { screen, params } = element.navigation
            this.props.navigation.navigate(screen, params)
        }

        return (
            <View style={styles.container}>
                {loading ?
                    <Loading />
                    :
                    <View style={{ paddingVertical: 5 }}>
                        <ModalForm
                            elements={this.shortcuts}
                            elementSize={elementSize}
                            model='Element2'
                            handleSelectElement={handleSelectElement}
                            autoValidation={true}
                            isReview={false}
                        />
                    </View>
                }
            </View>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        role: state.roles.role,
        permissions: state.permissions,
        network: state.network,
        //fcmToken: state.fcmtoken
    }
}

export default connect(mapStateToProps)(Shortcuts)



const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: theme.padding * 0.6,
        paddingTop: theme.padding,
        zIndex: 2,
        backgroundColor: theme.colors.white
    },
});

