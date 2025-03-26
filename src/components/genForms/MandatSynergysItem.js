import React, { Component } from 'react';
import FormItem from './FormItem';

import { withNavigation } from 'react-navigation'

const MandatSynergysItem = ({ mandat, onPress, navigation, ...props }) => {

    const { clientFirstName, clientLastName } = mandat
    const nameClient1 = `${clientFirstName} ${clientLastName}`

    return (
        <FormItem
            item={mandat}
            onPress={onPress}
            navigation={navigation}
            nameClient1={nameClient1}
            nameClient2=""
        />
    )
}

export default withNavigation(MandatSynergysItem)
