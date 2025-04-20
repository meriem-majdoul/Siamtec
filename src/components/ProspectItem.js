

import React, { Children, Component } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, } from 'react-native';
import { List } from 'react-native-paper';
import Icon1 from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon2 from '@fortawesome/free-solid-svg-icons';
import * as theme from '../core/theme';
import { constants } from '../core/constants';

const ProspectItem = ({ main, onPress, item, controller, itemStyle, iconStyle, ...props }) => {
    return (
        <TouchableOpacity onPress={() => onPress()} style={[styles.item, itemStyle]}>

            <View style={styles.visuals}>
                {item.isPro && <List.Icon {...props} icon="briefcase-account" color={theme.colors.placeholder} />}
                {!item.isPro && item.role !== 'Admin' && <List.Icon {...props} icon="badge-account-horizontal" color={theme.colors.placeholder} />}
            </View>

            <View style={[styles.primaryTextContainer]}>
                {!item.isPro && <Text style={[theme.customFontMSsemibold.header, { marginBottom: 5 }]}>{item.prenom} {item.nom}</Text>}
                {item.isPro && <Text style={[theme.customFontMSsemibold.header, { marginBottom: 5 }]}>{item.denom}</Text>}
            </View>

            {controller}

        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: constants.ScreenHeight * 0.02,
        //backgroundColor: 'blue',
    },
    visuals: {
        flex: 0.2,
        justifyContent: 'center',
        alignItems: 'center',
        // backgroundColor: 'green',
    },
    primaryTextContainer: {
        flex: 0.7,
        marginLeft: 10,
        // backgroundColor: 'pink',
    },
})

export default ProspectItem
