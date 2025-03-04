import React, { Component } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { List, Card, Paragraph, Title } from 'react-native-paper';

import MyFAB from '../../components/MyFAB'
import RequestItem from '../../components/RequestItem'
import EmptyList from '../../components/EmptyList'

import * as theme from '../../core/theme';
import { constants } from '../../core/constants';
import { fetchDocs } from '../../api/firestore-api';

import { withNavigation } from 'react-navigation'
import firebase from '@react-native-firebase/app';

import SearchInput, { createFilter } from 'react-native-search-filter'
const KEYS_TO_FILTERS = ['id', 'client.fullName', 'subject', 'state']

const db = firebase.firestore()
//#task replace this component by 'List' component

class ListRequests extends Component {
    constructor(props) {
        super(props)
        this.fetchDocs = fetchDocs.bind(this)

        this.state = {
            requestsList: [],
            requestsCount: 0,
            searchInput: ''
        }
    }

    componentDidMount() {
        const role = this.props.role.id
        const { currentUser } = firebase.auth()
        const isClient = (role === 'client')

        if (isClient)
            var query = db.collection('Requests').where('client.id', '==', "GS-US-POqM").where('type', '==', this.props.requestType).orderBy('createdAt', 'DESC')
        else
            var query = db.collection('Requests').where('type', '==', this.props.requestType).orderBy('createdAt', 'DESC')

        this.fetchDocs(query, 'requestsList', 'requestsCount', () => { })
    }

    renderTicketRequest(request) {
        return <RequestItem request={request} requestType={this.props.requestType} chatId={request.chatId} />
    }

    render() {
        let { requestsCount, requestsList } = this.state
        const s = requestsCount > 1 ? 's' : ''
        const filteredRequests = requestsList.filter(createFilter(this.props.searchInput, KEYS_TO_FILTERS))
        const { canCreate } = this.props.permissions

        return (
            <View style={{ flex: 1 }}>
                {requestsCount > 0 && <List.Subheader>{requestsCount} nouvelle{s} demande{s}</List.Subheader>}

                {requestsCount > 0 ?
                    <FlatList
                        enableEmptySections={true}
                        data={filteredRequests}
                        keyExtractor={item => item.id.toString()}
                        renderItem={({ item }) => this.renderTicketRequest(item)}
                        contentContainerStyle={{ paddingBottom: constants.ScreenHeight * 0.12 }} />
                    :
                    <EmptyList iconName='arrow-left-bold' header='Liste des demandes' description='Aucune nouvelle demande. Appuyez sur le boutton "+" pour en créer une nouvelle.' offLine={this.props.offLine} />
                }

                {canCreate && <MyFAB onPress={() => this.props.navigation.navigate(this.props.creationScreen)} />}
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
})

export default withNavigation(ListRequests)