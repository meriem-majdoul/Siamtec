import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';

import { Appbar, SuccessMessage } from "../../../components";
import { constants } from '../../../core/constants';
import * as theme from '../../../core/theme';

class GuestContactSuccess extends Component {

    constructor(props) {
        super(props);
        // Use this.props.route.params to access the parameters
        const { title, subHeading } = this.props.route.params || {}; // Default to empty object if params are undefined
        this.title = title || "";
        this.subHeading = subHeading || "";
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
        );
    }
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
    },
});

export default GuestContactSuccess;
