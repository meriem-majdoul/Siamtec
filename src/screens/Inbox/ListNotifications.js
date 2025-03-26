import React, { Component } from 'react'
import { StyleSheet, Text, View, TouchableOpacity, Image, FlatList, RefreshControl } from 'react-native'
import { List } from 'react-native-paper';
import { faBell } from 'react-native-vector-icons/FontAwesome5'

import * as theme from '../../core/theme'
import { constants } from '../../core/constants'

import Background from '../../components/NewBackground'
import ListSubHeader from '../../components/ListSubHeader'
import NotificationItem from '../../components/NotificationItem'
import EmptyList from '../../components/EmptyList'
import MyFAB from '../../components/MyFAB'
import Loading from '../../components/Loading'

import firebase, { db } from '../../firebase'
import { fetchDocs, fetchDocuments } from "../../api/firestore-api";
import { load, myAlert } from "../../core/utils";

import { withNavigation } from 'react-navigation'

class ListNotifications extends Component {
    constructor(props) {
        super(props)
        //this.fetchDocs = fetchDocs.bind(this)
        this.fetchNotifications = this.fetchNotifications.bind(this)
        this.myAlert = myAlert.bind(this)
        this.currentUser = firebase.auth().currentUser

        this.state = {
            notificationsList: [],
            notificationsCount: 0,
            loading: true,
            refreshing: false
        }
    }

    async componentDidMount() {
        await this.fetchNotifications()
    }

    async fetchNotifications() {
        this.setState({ refreshing: true })
        const collection = this.props.role.id === "client" ? "Clients" : "Users"
        let query = db
            .collection(collection)
            .doc(this.currentUser.uid)
            .collection('Notifications')
            .where('deleted', '==', false)
            .orderBy('sentAt', 'desc')
        const notificationsList = await fetchDocuments(query)

        this.setState({
            notificationsList,
            notificationsCount: notificationsList.length,
            loading: false,
            refreshing: false
        })
    }

    render() {
        let { notificationsCount, loading } = this.state

        const s = notificationsCount > 1 ? 's' : ''

        return (
            <View style={{ flex: 1 }}>

                {loading ?
                    <Background>
                        <Loading size='large' />
                    </Background>
                    :
                    <Background showMotif={notificationsCount < 5} style={styles.container}>
                        <ListSubHeader style={{ marginBottom: 10 }}>{notificationsCount} notification{s}</ListSubHeader>

                        {notificationsCount > 0 ?
                            <FlatList
                                style={styles.root}
                                contentContainerStyle={{ paddingBottom: constants.ScreenHeight * 0.1 }}
                                data={this.state.notificationsList}
                                extraData={this.state}
                                keyExtractor={(item) => { return item.id }}
                                renderItem={(item) => <NotificationItem notification={item.item} navigation={this.props.navigation} />}
                                refreshControl={
                                    <RefreshControl
                                        refreshing={this.state.refreshing}
                                        onRefresh={this.fetchNotifications}
                                    />
                                }
                            />
                            :
                            <EmptyList icon={faBell} iconColor={theme.colors.miInbox} header='Notifications' description='Aucune notification pour le moment.' offLine={this.props.offLine} />
                        }
                    </Background >
                }
            </View>
        )

    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#ffffff",
    },
    root: {
        //  marginTop: 10,
        zIndex: 1,
        paddingHorizontal: theme.padding,
        backgroundColor: "#ffffff",
    }
})


export default withNavigation(ListNotifications)