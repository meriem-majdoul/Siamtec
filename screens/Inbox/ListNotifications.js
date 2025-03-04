import React, { Component } from 'react'
import { StyleSheet, Text, View, TouchableOpacity, Image, FlatList } from 'react-native'
import { List } from 'react-native-paper';

import firebase from '@react-native-firebase/app'
import * as theme from '../../core/theme'
import { constants } from '../../core/constants'

import NotificationItem from '../../components/NotificationItem'
import EmptyList from '../../components/EmptyList'
import MyFAB from '../../components/MyFAB'

import { fetchDocs } from "../../api/firestore-api";
import { myAlert } from "../../core/utils";

import { withNavigation } from 'react-navigation'

const db = firebase.firestore()

class ListNotifications extends Component {
    constructor(props) {
        super(props)
        this.fetchDocs = fetchDocs.bind(this)
        this.myAlert = myAlert.bind(this)
        this.markAsReadAndNavigate = this.markAsReadAndNavigate.bind(this)
        this.currentUser = firebase.auth().currentUser

        this.state = {
            notificationsList: [],
            notificationsCount: 0,
        }
    }

    async componentDidMount() {
        let query = db.collection('Users').doc(this.currentUser.uid).collection('Notifications')
        //.where('deleted', '==', false)
        //.orderBy('sentAt', 'asc')
        this.fetchDocs(query, 'notificationsList', 'notificationsCount', () => { })
    }

    componentWillUnmount() {
        this.unsubscribe()
    }

    renderNotification(item) {
        const notification = item

        return (
            <TouchableOpacity onPress={() => this.markAsReadAndNavigate(notification)}>
                <NotificationItem notification={notification} />
            </TouchableOpacity>
        )
    }

    markAsReadAndNavigate = async (notification) => {
        const params = notification.navigation
        const screen = params.screen

        if (!notification.read) {
            await db.collection('Users').doc(this.currentUser.uid).collection('Notifications').doc(notification.id).update({ read: true })
        }

        this.props.navigation.navigate(screen, params) //generic form
    }


    render() {
        let { notificationsCount } = this.state
        const s = notificationsCount > 1 ? 's' : ''

        return (
            <View style={styles.container}>
                <List.Subheader>{notificationsCount} notification{s}</List.Subheader>
                {notificationsCount > 0 ?
                    <FlatList
                        style={styles.root}
                        contentContainerStyle={{ paddingBottom: constants.ScreenHeight * 0.1 }}
                        data={this.state.notificationsList}
                        extraData={this.state}
                        keyExtractor={(item) => { return item.id }}
                        renderItem={(item) => this.renderNotification(item.item)}
                    />
                    :
                    <EmptyList iconName='arrow-left-bold' header='Liste des demandes' description='Aucune nouvelle demande. Appuyez sur le boutton "+" pour en créer une nouvelle.' offLine={this.props.offLine} />
                }
            </View >
        )

    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    root: {
        backgroundColor: "#fff",
    }
})


export default withNavigation(ListNotifications)