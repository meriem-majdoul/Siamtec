import React, { Component } from 'react'
import { StyleSheet, Text, View, TouchableOpacity, Image, FlatList } from 'react-native'
import { List } from 'react-native-paper'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import Menu from './Menu'
import CustomIcon from './CustomIcon'
import { faBell, faBellExclamation } from 'react-native-vector-icons/FontAwesome5'

import { db, auth } from '../firebase'
import * as theme from '../core/theme'
import { constants, isTablet } from '../core/constants'

import moment from 'moment';
import 'moment/locale/fr'
moment.locale('fr')

const NotificationItem = ({ notification, actions, navigation, ...props }) => { 

    const setLeftIcon = (topic) => {
        const icon = notification.read ? faBell : faBellExclamation
        const iconColor = notification.read ? theme.colors.white : theme.colors.white
        const backgroundColor = notification.read ? theme.colors.gray_medium : theme.colors.primary

        // switch (topic) {
        //     case 'projects':
        return (
            <View style={[styles.leftIcon, { backgroundColor: backgroundColor }]}>
                <CustomIcon icon={icon} color={iconColor} />
            </View>
        )
        // }
    }

    const markAsReadAndNavigate = async () => {

        if (!notification.read) {
            db.collection('Users')
                .doc(auth.currentUser.uid)
                .collection('Notifications')
                .doc(notification.id)
                .update({ read: true })
        }

        if (notification.navigation) {
            let params = notification.navigation
            const { screen } = params
            console.log(params)
            navigation.navigate(screen, params)
        }
    }


    //menu config
    const options = [
        { id: 0, title: 'Archiver' },
    ]

    return (
        <TouchableOpacity style={styles.container} onPress={markAsReadAndNavigate}>

            {setLeftIcon(notification.topic)}

            <View style={styles.content}>

                <View style={{ flex: 1 }}>
                    <Text style={[theme.customFontMSmedium.body, { color: theme.colors.secondary }]} numberOfLines={1}>{notification.title}</Text>
                    <Text style={[theme.customFontMSregular.caption, { color: theme.colors.secondary }]} numberOfLines={3}>{notification.body}</Text>
                    <Text style={[theme.customFontMSregular.caption, { color: theme.colors.gray_dark }]}>{moment(notification.sentAt).format('LLL')}</Text>
                </View>

                {/* #task:  use the menu component */}
                {/* <View style={{ flex: 0.15, justifyContent: 'flex-start', alignItems: 'center' }}>
                    <Menu options={options} functions={actions} />
                </View> */}

            </View>

        </TouchableOpacity>
    )

}

const styles = StyleSheet.create({
    container: {
        //padding: 10,
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginVertical: 5,
        // backgroundColor: 'pink'
    },
    leftIcon: {
        justifyContent: 'center',
        alignItems: 'center',
        width: isTablet ? 80 : 45,
        height: isTablet ? 80 : 45,
        borderRadius: isTablet ? 40 : 25,
        marginTop: 3,
        ...theme.style.shadow
    },
    content: {
        flex: 1,
        flexDirection: 'row',
        marginLeft: isTablet ? 35 : 15,
        marginRight: 0,
        paddingBottom: 9,
        borderBottomWidth: StyleSheet.hairlineWidth * 2,
        borderBottomColor: theme.colors.gray_light
    },
})

export default NotificationItem
