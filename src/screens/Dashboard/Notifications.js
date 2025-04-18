import React, { Component } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { faBell } from '@fortawesome/free-solid-svg-icons'
import { connect } from 'react-redux'

import moment from 'moment';
import 'moment/locale/fr'
moment.locale('fr')

import { db, auth } from '../../firebase'
import * as theme from '../../core/theme'
import { constants } from '../../core/constants'
import { load } from '../../core/utils'
import { fetchDocs, fetchDocuments } from '../../api/firestore-api'
import { renderSection } from './helpers'

import { Section, NotificationItem, Loading } from '../../components'

class Summary extends Component {
    constructor(props) {
        super(props)
        // this.fetchDocs = fetchDocs.bind(this)

        this.state = {
            notificationsList: [],
            notificationsCount: 0,
            loading: true
        }
    }

    async componentDidMount() {
        const query = db
            .collection('Users')
            .doc(auth.currentUser.uid)
            .collection('Notifications')
            .where('deleted', '==', false)
            .where('read', '==', false)
            .orderBy('sentAt', 'desc')
            .limit(5)

        // this.fetchDocs(queryNotifications, 'notificationsList', 'notificationsCount', () => { load(this, false) })
        let notificationsList = await fetchDocuments(query)
        this.setState({ notificationsList, notificationsCount: notificationsList.length, loading: false })
    }

    notificationsSection(isConnected) {
        const { notificationsCount, notificationsList } = this.state
        const renderItem = (item) => <NotificationItem notification={item.item} navigation={this.props.navigation} />
        const navParams = { isRoot: false }
        return renderSection('Notifications', faBell, notificationsList, notificationsCount, this.props.navigation, 'Inbox', navParams, renderItem, 'Notifications', 'Aucune nouvelle notification.', isConnected)
    }

    render() {
        const { loading } = this.state
        const { isConnected } = this.props.network

        return (
            <View style={{ flex: 1 }}>
                {loading ?
                    <Loading />
                    :
                    this.notificationsSection(isConnected)
                }
            </View>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        role: state.roles.role,
        permissions: state.permissions,
        network: state.network,
        //fcmToken: state.fcmtoken
    }
}

export default connect(mapStateToProps)(Summary)



const styles = StyleSheet.create({

})

