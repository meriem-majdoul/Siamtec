//Conditionnal rendering depending on USER ROLE

import React from "react"
import { View } from 'react-native'
import { connect } from 'react-redux'
import { faBell, faEnvelope } from '@fortawesome/free-solid-svg-icons'

import TabView from '../../components/TabView'
import Appbar from '../../components/Appbar'

import ListNotifications from './ListNotifications'
import ListMessages from './ListMessages'

class Inbox extends React.Component {

    constructor(props) {
        super(props)
        const { route } = this.props;

        // Récupération du paramètre isRoot
        this.isRoot = route?.params?.isRoot ?? true;  // Définir la valeur par défaut à true

        this.state = {
            index: 0,
            showInput: false,
            searchInput: ''
        }
    }

    defineRoutes() {
        const enableMessages = this.props.role.id !== "client"
        let routes = [
            { key: 'first', title: 'NOTIFICATIONS' },
        ]
        if (enableMessages) {
            routes = [...routes, { key: 'second', title: 'MESSAGES' }]
        }
        return routes
    }

    render() {

        let { index } = this.state
        const { isConnected } = this.props.network
        const { role } = this.props
        const permissionsMessages = this.props.permissions.messages
        const routes = this.defineRoutes()

        return (
            <View style={{ flex: 1 }}>
                <Appbar
                    menu={this.isRoot}
                    back={!this.isRoot}
                    title
                    titleText='Boîte de réception'
                />

                <TabView
                    navigationState={{ index, routes }}
                    onIndexChange={(index) => this.setState({ index, searchInput: '', showInput: false })}
                    icon1={faBell}
                    icon2={faEnvelope}
                    Tab1={<ListNotifications offLine={!isConnected} role={this.props.role}/>}
                    Tab2={<ListMessages offLine={!isConnected} role={role} permissions={permissionsMessages} />}
                />
            </View>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        role: state.roles.role,
        network: state.network,
        permissions: state.permissions
        //fcmToken: state.fcmtoken
    }
}

export default connect(mapStateToProps)(Inbox)











