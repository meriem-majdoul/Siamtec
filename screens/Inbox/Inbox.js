//Conditionnal rendering depending on USER ROLE

import React from "react"
import { View } from 'react-native'
import { connect } from 'react-redux'

import TabView from '../../components/TabView'
import Appbar from '../../components/Appbar'

import ListNotifications from './ListNotifications'
import ListMessages from './ListMessages'

class Inbox extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            index: 0,
            showInput: false,
            searchInput: ''
        }
    }

    render() {

        const routes = [
            { key: 'first', title: 'NOTIFICATIONS' },
            { key: 'second', title: 'MESSAGES' },
        ]

        let { index } = this.state
        const { isConnected } = this.props.network

        return (
            <View style={{ flex: 1 }}>
                <Appbar menu title titleText='Boîte de réception' />

                <TabView
                    navigationState={{ index, routes }}
                    onIndexChange={(index) => this.setState({ index, searchInput: '', showInput: false })}

                    Tab1={<ListNotifications offLine={!isConnected} />}
                    Tab2={<ListMessages offLine={!isConnected} />} />
            </View>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        role: state.roles.role,
        network: state.network,
        //fcmToken: state.fcmtoken
    }
}

export default connect(mapStateToProps)(Inbox)











