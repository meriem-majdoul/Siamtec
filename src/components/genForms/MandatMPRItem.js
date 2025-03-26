import React, { Component } from 'react';
import FormItem from './FormItem';

import { withNavigation } from 'react-navigation'

const MandatMPRItem = ({ mandat, onPress, navigation, applicantName, ...props }) => {

    return (
        <FormItem
            item={mandat}
            onPress={onPress} 
            navigation={navigation}
            nameClient1={applicantName}
            nameClient2=""
        />
    )
}

export default withNavigation(MandatMPRItem)
