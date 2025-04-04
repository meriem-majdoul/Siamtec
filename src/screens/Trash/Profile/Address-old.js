
import React, { Component } from 'react'
import { StyleSheet, Alert, View } from 'react-native'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'

import Appbar from '../../../components/Appbar'
// import AddressSearch from '../../components/AddressSearch'

import * as theme from "../../../core/theme"
import { constants } from '../../../core/constants'
import firebase from '@react-native-firebase/app'


export default class Address extends Component {

    constructor(props) {
        super(props)
        this.handleSubmit = this.handleSubmit.bind(this)

        const { route } = this.props;
        const { prevScreen, userId } = route.params || {};
    
        this.prevScreen = prevScreen || '';
        this.userId = userId || '';

        this.state = {
            address: { description: '', place_id: '', error: '' },
        }
    }


    handleSubmit() {
        let address = this.state.address

        if (address.description === '') {
            Alert.alert('Veuillez saisir une adresse correcte.')
            return
        }

        if (this.prevScreen === 'Profile') {
            firebase.firestore().collection('Users').doc(this.userId).update({ address: address })
                .then(() => this.props.navigation.goBack())
                .catch((e) => Alert.alert(e))
        }

        else {
            this.props.navigation.state.params.onGoBack(address)
            this.props.navigation.goBack()
        }
    }


    render() {
        console.log(this.state.address)
        return (
            <View style={{ flex: 1 }}>
               {/* <AddressSearch main= {this} handleSubmit={this.handleSubmit}/> */}
            </View>
        );
    }
}

