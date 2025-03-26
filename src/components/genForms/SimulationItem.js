import React, { Component } from 'react';
import FormItem from './FormItem';
import { Text } from 'react-native'
import { withNavigation } from 'react-navigation'

const SimulationItem = ({ simulation, onPress, navigation, nameSir, nameMiss, ...props }) => {

    return (
        <FormItem
            item={simulation}
            onPress={onPress}
            navigation={navigation}
            nameClient1={nameSir}
            nameClient2={nameMiss}
        />
    )
}

export default withNavigation(SimulationItem)
