

import React, { Children, Component } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, } from 'react-native';
import { Checkbox, List } from 'react-native-paper';
import Icon1 from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon2 from 'react-native-vector-icons/FontAwesome5';
import * as theme from '../core/theme';
import { constants } from '../core/constants';

const UserItem = ({ main, onPress, item, controller, itemStyle, iconStyle, ...props }) => {

    return (
        <TouchableOpacity onPress={() => onPress()} style={[styles.item, itemStyle]}>

            <View style={styles.visuals}>
                {item.isPro && <List.Icon {...props} icon="briefcase" color= {theme.colors.placeholder}/>}
                {!item.isPro && item.role !== 'Admin' && <List.Icon {...props} icon="account" color= {theme.colors.placeholder}/>}
                {item.role === 'Admin' && <List.Icon {...props} icon="account-cog" color= {theme.colors.placeholder}/>}
                {item.role === 'Back office' && <List.Icon {...props} icon="account-cog" color= {theme.colors.placeholder}/>}
            </View>

            <View style={[styles.primaryTextContainer]}>
                {!item.isPro && <Text style={[theme.customFontMSsemibold.header, { marginBottom: 5 }]}>{item.prenom} {item.nom}</Text>}
                {item.isPro && <Text style={[theme.customFontMSsemibold.header, { marginBottom: 5 }]}>{item.denom}</Text>}
                <Text style={[theme.customFontMSmedium.body, { color: theme.colors.placeholder }]}>{item.role}</Text>
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

export default UserItem
