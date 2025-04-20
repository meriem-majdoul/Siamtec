
import React, { Children, Component } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, } from 'react-native';
import { List } from 'react-native-paper';
import { faAddressCard, faUsers, faUserTie, faUser, faUserShield, faUserCog } from '@fortawesome/free-solid-svg-icons';

import * as theme from '../core/theme';
import { constants, isTablet } from '../core/constants';
import { checkPlural } from '../core/utils';

import Menu from './Menu'
import CustomIcon from './CustomIcon'

const UserItem = ({ isTeam, userType, onPress, item, controller, itemStyle, options, functions, ...props }) => {

    if (isTeam) {
        var { name, members } = item
        var membersCount = checkPlural(members.length, ' membre')
    }

    else {
        var { isPro, role, denom, prenom, nom } = item
        var normalUser = (!isPro && item.role !== 'Admin' && role !== 'Back office') //Technicien, Comercial, DC
    }

    const color = theme.colors.white
    const title = isTeam ? name : isPro ? denom : `${prenom} ${nom}`
    const description = isTeam ? membersCount : userType === 'utilisateur' ? role : (item.phone || item.email)

    const setIcon = () => {
        if (isTeam) return faUsers;
    
        if (userType === 'utilisateur') {
            if (isPro) return faUserTie;
            if (normalUser) return faUser;
            if (role === 'Admin') return faUserShield;
            if (role === 'Back office') return faUserCog;
        } else if (userType === 'client') {
            return faUser;
        } else if (userType === 'prospect') {
            return faAddressCard;
        }
    
        // Valeur par défaut
        return faQuestionCircle; // ou null, ou tout autre icône par défaut
    };
    
    const icon = setIcon();
 
    
    return (
        <TouchableOpacity onPress={onPress} style={[styles.item, itemStyle]}>

            <View style={styles.visuals}>
                <CustomIcon icon={icon} color={color} size={icon === faUser ? 19 : 24} />
            </View>

            <View style={[styles.primaryTextContainer]}>
                <Text style={[theme.customFontMSbold.body, { marginBottom: 5, color: theme.colors.white }]}>{title}</Text>
                <Text style={[theme.customFontMSregular.caption, { color: theme.colors.white }]}>{description}</Text>
            </View>

            <View style={styles.controller}>
                {options && <Menu options={options} functions={functions} />}
                {controller}
            </View>

        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        height: isTablet ? 100 : 70,
        backgroundColor: theme.colors.section,
        borderRadius: 20,
        marginVertical: isTablet ? 12 : 5,
    },
    visuals: {
        //flex: 0.18,
        height: 70,
        width: 70,
        justifyContent: 'center',
        alignItems: 'center',
        //backgroundColor: 'green',
    },
    primaryTextContainer: {
        flex: 0.85,
        //paddingLeft: 10,
        // backgroundColor: 'pink',
    },
    controller: {
        flex: 0.15,
        alignItems: 'center',
        // backgroundColor: 'brown',
    }
})

export default UserItem
