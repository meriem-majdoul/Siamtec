import React, { Component } from 'react'
import { StyleSheet, View, Alert, StatusBar } from 'react-native'
import NetInfo from "@react-native-community/netinfo"
import { connect } from 'react-redux'
import _ from 'lodash'

import moment from 'moment';
import 'moment/locale/fr'
moment.locale('fr')

// import OfflineBar from './components/OffLineBar'

import { setNetwork } from './core/redux'

class NetworkStatus extends Component {
    constructor(props) {
        super(props)
        this.alertDisplayed = false
        this.networkListener = this.networkListener.bind(this)
    }

    componentDidMount() {
        this.networkListener()
    }

   async networkListener() {
        this.unsubscribeNetwork = NetInfo.addEventListener(async state => {
            const { type, isConnected } = state
            console.log("state", state)
            const network = { type, isConnected }
            
            if (!isConnected && !this.alertDisplayed) Alert.alert('Mode Hors-Ligne', "L'application risque de ne pas fonctionner de façon optimale en mode hors-ligne. Veuillez rétablir votre connection réseau.")
            this.alertDisplayed = true
            setNetwork(this, network)
        })
    }

    componentWillUnmount() {
        this.unsubscribeNetwork && this.unsubscribeNetwork()
    }

    render() {
        const { network } = this.props
        const { isConnected } = network.isConnected
        // console.log('networkk:',network)
        console.log("is connected::::", isConnected)

        return (
            <View style={styles.container}>
                {/* {!isConnected && <OfflineBar />} */}
                {this.props.children}
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

export default connect(mapStateToProps)(NetworkStatus)

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
})

