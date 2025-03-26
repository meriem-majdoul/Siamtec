import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import { TermsConditions } from '../../components';

import Appbar from '../../components/Appbar'

import * as  theme from '../../core/theme'
// import { constants } from '../core/constants'


export default class SalesTermsAndConditions extends Component {

    render() {
        return (
            <View style={{ flex: 1, backgroundColor: theme.colors.white }}>
                <Appbar back title titleText='Conditions générales de vente et de travaux' />
                <TermsConditions />
            </View>
        )
    }

}


const styles = StyleSheet.create({

})
