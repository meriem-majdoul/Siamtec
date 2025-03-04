import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { List, Card, Paragraph, Title, Avatar } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import LinearGradient from 'react-native-linear-gradient'

import moment from 'moment';
import 'moment/locale/fr'
moment.locale('fr')

import Button from './Button'

import * as theme from '../core/theme';
import { constants } from '../core/constants';

import { withNavigation } from 'react-navigation'

const OrderItem = ({ order, onPress, navigation, ...props }) => {

    const setStateColor = (state) => {
        switch (state) {
            case 'En cours':
                return theme.colors.placeholder
                break

            case 'Terminé':
                return theme.colors.primary
                break

            case 'Annulé':
                return theme.colors.error
                break

            default:
                return '#333'
        }
    }

    return (
        <TouchableOpacity onPress={onPress} style={{ flex: 1, paddingHorizontal: 15, paddingVertical: 5, borderBottomWidth: 2, borderBottomColor: '#E0E0E0' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 }}>
                <Text numberOfLines={1} style={theme.customFontMSbold.body}>{order.project.name}</Text>
                <Text style={theme.customFontMSbold.header}>€{order.total}</Text>
            </View>

            <View>
                {order.client && <Text><Text style={theme.customFontMSregular.body}>chez</Text> <Text style={theme.customFontMSbold.body}>{order.client.fullName}</Text></Text>}
                <Text style={[theme.customFontMSmedium.body, { paddingTop: 10 }]}>{order.id}</Text>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 }}>
                <Text style={[theme.customFontMSmedium.body]}>{moment(order.editedAt, 'lll').format('ll')}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: setStateColor(order.state), marginRight: 5 }} />
                    <Text style={[theme.customFontMSmedium.caption, { color: setStateColor(order.state) }]}>{order.state.toUpperCase()}</Text>
                </View>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    linearGradient: {
        flex: 1,
        paddingLeft: 15,
        paddingRight: 15,
        borderRadius: 5
    },
    stepContainer: {
        height: 33,
        justifyContent: 'center',
        alignItems: 'center',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    }
})

export default withNavigation(OrderItem)
