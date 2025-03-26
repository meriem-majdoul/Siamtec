import React, { Component } from 'react';
import { StyleSheet, View, FlatList, RefreshControl } from 'react-native';
import { List, Card, Paragraph, Title } from 'react-native-paper';
import { faTicketAlt } from 'react-native-vector-icons/FontAwesome5'
import { withNavigation } from 'react-navigation'
import SearchInput, { createFilter } from 'react-native-search-filter'

import ListSubHeader from '../../components/ListSubHeader'
import MyFAB from '../../components/MyFAB'
import RequestItem from '../../components/RequestItem'
import EmptyList from '../../components/EmptyList'
import { Loading } from '../../components';

import firebase, { db } from '../../firebase'
import * as theme from '../../core/theme';
import { constants } from '../../core/constants';
import { fetchDocs, fetchDocuments } from '../../api/firestore-api';
import { configureQuery } from '../../core/privileges';
import { countDown } from '../../core/utils';

const KEYS_TO_FILTERS = ['id', 'client.fullName', 'subject', 'state']

//#task replace this component by 'List' component

class ListRequests extends Component {
    constructor(props) {
        super(props)
        // this.fetchDocs = fetchDocs.bind(this)
        this.fetchRequests = this.fetchRequests.bind(this)

        this.state = {
            requestsList: [],
            requestsCount: 0,
            searchInput: '',
            loading: true,
            refreshing: false
        }
    }

    async componentDidMount() {
        await this.fetchRequests()
    }

    async fetchRequests(count) {
        this.setState({ refreshing: true })
        if (count) {
            await countDown(count)
        }
        const { queryFilters } = this.props.permissions
        if (queryFilters === [])
            this.setState({
                requestsList: [],
                requestsCount: 0,
                loading: false,
                refreshing: false
            })

        else {
            const params = { type: this.props.requestType }
            var query = configureQuery('Requests', queryFilters, params)

            const requestsList = await fetchDocuments(query)
            this.setState({
                requestsList,
                requestsCount: requestsList.length,
                loading: false,
                refreshing: false
            })
        }
    }

    renderTicketRequest(request) {
        return <RequestItem request={request} requestType={this.props.requestType} chatId={request.chatId} />
    }

    render() {
        let { requestsCount, requestsList, loading } = this.state
        const s = requestsCount > 1 ? 's' : ''
        const filteredRequests = requestsList.filter(createFilter(this.props.searchInput, KEYS_TO_FILTERS))
        const { canCreate } = this.props.permissions

        if (loading)
            return <Loading />

        else return (
            <View style={styles.container}>
                {requestsCount > 0 && <ListSubHeader>{requestsCount} nouvelle{s} demande{s}</ListSubHeader>}

                {requestsCount > 0 ?
                    <FlatList
                        enableEmptySections={true}
                        data={filteredRequests}
                        keyExtractor={item => item.id.toString()}
                        renderItem={({ item }) => this.renderTicketRequest(item)}
                        contentContainerStyle={{ paddingBottom: constants.ScreenHeight * 0.12 }}
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.refreshing}
                                onRefresh={this.fetchRequests}
                            />
                        }
                    />
                    :
                    <EmptyList
                        icon={faTicketAlt}
                        iconColor={theme.colors.miRequests}
                        header='Aucune demande'
                        description='Appuyez sur le boutton "+" pour en créer une nouvelle.'
                        offLine={this.props.offLine}
                    />
                }

                {canCreate &&
                    <MyFAB onPress={() => this.props.navigation.navigate(this.props.creationScreen, { onGoBack: () => this.fetchRequests(2000) })} />
                }
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background
    },
})

export default withNavigation(ListRequests)