import React, { Component } from 'react';
import FormItem from './FormItem';

import { withNavigation } from 'react-navigation'

const PvReceptionItem = ({ pv, onPress, navigation, projectOwner, ...props }) => {

    return (
        <FormItem 
            item={pv}
            onPress={onPress} 
            navigation={navigation}
            nameClient1={projectOwner}
            nameClient2=""
        />
    )
}

export default withNavigation(PvReceptionItem)
