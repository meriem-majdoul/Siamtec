

import React, { Children, Component } from 'react'
import { StyleSheet, Text, View, TextInput, TouchableHighlight, Alert, FlatList, TouchableOpacity, ScrollView } from 'react-native'

import Icon from 'react-native-vector-icons/Feather'
import Icon2 from '@fortawesome/free-solid-svg-icons'
import Icon3 from 'react-native-vector-icons/Entypo'
import * as theme from '../core/theme'
import { color } from 'react-native-reanimated'
import { constants } from '../core/constants'

const TeamItem = ({ main, onPress, teamName, membersCount, controller, iconStyle, ...props }) => {
    return (
        <TouchableOpacity onPress={() => onPress()} style={styles.item}>

            <View style={styles.visuals}>
                <Icon2 name='users' size={19} style={[iconStyle]} color={theme.colors.icon} />
            </View>

            <View style={[styles.primaryText, {
                flex: 0.8, flexDirection: 'row',
                alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: constants.ScreenWidth * 0.015,
                //borderBottomColor: theme.colors.gray2, borderBottomWidth: StyleSheet.hairlineWidth, marginRight: constants.ScreenWidth*0.025 
            }]}
            >
                <View>
                    <Text style={[theme.customFontMSsemibold.body, { marginBottom: 5 }]}>{teamName}</Text>
                    <Text style={[theme.customFontMSmedium.caption, { color: theme.colors.placeholder, marginBottom: 5 }]}>{membersCount} membre{membersCount > 1 && <Text>s</Text>}</Text>
                    {/* <Text style={[theme.customFontMSmedium.caption, { color: theme.colors.placeholder }]}>3 projets</Text> */}
                </View>
                {controller}
            </View>

        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    item: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: constants.ScreenWidth * 0.005,
        paddingVertical: constants.ScreenHeight * 0.01,
        marginBottom: 5
        //backgroundColor: 'green',
    },
    visuals: {
        flex: 0.2,
        justifyContent: 'center',
        alignItems: 'center',
        //backgroundColor: 'blue',
    },
    primaryText: {
        flex: 0.7,
        marginLeft: 10,
        //backgroundColor: 'pink',
    },
})

export default TeamItem
