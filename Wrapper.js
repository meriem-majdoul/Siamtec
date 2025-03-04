import React, { Component } from 'react'
import { Children } from 'react'
import { StyleSheet, View, Alert } from 'react-native'
import NetInfo from "@react-native-community/netinfo"
import { connect } from 'react-redux'

import OfflineBar from './components/OffLineBar'

import { setNetwork } from './core/redux'
import { stat } from 'react-native-fs'

class Wrapper extends Component {
    constructor(props) {
        super(props)
        this.alertDisplayed = false
        this.networkListener = this.networkListener.bind(this)
    }

    componentDidMount() {
        this.networkListener()
    }

    networkListener() {
        this.unsubscribeNetwork = NetInfo.addEventListener(state => {
            const { type, isConnected } = state
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
        const { isConnected } = this.props.network

        return (
            <View style={styles.container}>
                {!isConnected && <OfflineBar />}
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

export default connect(mapStateToProps)(Wrapper)

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
})

