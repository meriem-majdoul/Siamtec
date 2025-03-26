
import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native'

import { Appbar, SuccessMessage } from "../../../components"

import { constants } from '../../../core/constants'
import * as theme from '../../../core/theme'


class GuestContactSuccess extends Component {

    constructor(props) {
        super(props)
        this.title = this.props.navigation.getParam("title", "")
        this.subHeading = this.props.navigation.getParam("subHeading", "")
    }

    render() {
        return (
            <View style={styles.mainContainer}>
                <Appbar
                    appBarColor={"#003250"}
                    iconsColor={theme.colors.white}
                    back
                    title
                    titleText="Message envoyé !"
                />
                <SuccessMessage
                    title={this.title}
                    subHeading={this.subHeading}
                />
            </View>
        )
    }
}

const styles = StyleSheet.create({

})

export default GuestContactSuccess
