import React, { Component } from 'react';
import { StyleSheet, Text, View, FlatList, RefreshControl } from 'react-native';
import { List } from 'react-native-paper';
import { connect } from 'react-redux'
import { faFileInvoice } from 'react-native-vector-icons/FontAwesome5'
import { withNavigation } from 'react-navigation'

import SearchInput, { createFilter } from 'react-native-search-filter'
import Background from '../../components/NewBackground'
import ActiveFilter from '../../components/ActiveFilter'
import SearchBar from '../../components/SearchBar'
import ListSubHeader from '../../components/ListSubHeader'
import Filter from '../../components/Filter'
import MyFAB from '../../components/MyFAB'
import OrderItem from '../../components/OrderItem' //#add
import EmptyList from '../../components/EmptyList'
import Loading from '../../components/Loading'

import { db, auth } from '../../firebase'
import * as theme from '../../core/theme';
import { constants } from '../../core/constants';
import { load, toggleFilter, setFilter, handleFilter, countDown } from '../../core/utils'
import { configureQuery } from '../../core/privileges'
import { fetchDocs, fetchDocuments } from '../../api/firestore-api';
import { firebase } from '@react-native-firebase/app';

const KEYS_TO_FILTERS = ['id', 'name', 'state'] //#edit

const states = [
    { label: 'Tous', value: '' },
    { label: 'En cours', value: 'En cours' },
    { label: 'Terminé', value: 'Terminé' },
    { label: 'Annulé', value: 'Annulé' },
]

class ListOrders extends Component {
    constructor(props) {
        super(props);
        this.onPressOrder = this.onPressOrder.bind(this); //#edit
        this.fetchOrders = this.fetchOrders.bind(this); //#edit
    
        const { route } = this.props;
    
        this.isRoot = route?.params?.isRoot ?? true;
        this.autoGenPdf = route?.params?.autoGenPdf ?? false; // For pdf generation
        this.docType = route?.params?.docType ?? ''; // For pdf generation
        this.popCount = route?.params?.popCount ?? 1; // For pdf generation
    
        // filters
        this.project = route?.params?.project ?? undefined; // For pdf generation
    
        this.titleText = route?.params?.titleText ?? 'Commandes';
        this.showFAB = (route?.params?.showFAB ?? true) && this.isRoot;
        this.filteredOrders = [];
    
        this.state = {
            ordersList: [],
            ordersCount: 0,
    
            showInput: false,
            searchInput: '',
    
            // filters
            state: '',
            project: { id: '', name: '' },
            client: { id: '', fullName: '' },
            filterOpened: false,
    
            loading: true,
            refreshing: false
        };
    }
    

    async componentDidMount() {
        await this.fetchOrders()
        if (this.project)
            this.setState({ project: this.project }) //#task: change filter to QueryFilter
    }

    async fetchOrders(count) {
        this.setState({ refreshing: true })
        if (count) {
            await countDown(count)
        }
        const { queryFilters } = this.props.permissions.orders
        if (queryFilters === [])
            this.setState({ ordersList: [], ordersCount: 0, refreshing: false })
        else {
            const params = { role: this.props.role.value }
            var query = configureQuery('Orders', queryFilters, params) //#task make query as a prop (for project filtering during process OP generation)
            const ordersList = await fetchDocuments(query)
            this.setState({
                ordersList,
                ordersCount: ordersList.length,
                loading: false,
                refreshing: false
            })
        }
    }

    renderOrder(order) { //#edit
        return <OrderItem order={order} onPress={() => this.onPressOrder(order)} />
    }

    onPressOrder(order) { //#edit
        const { route, navigation } = this.props;
        const { isRoot, docType, popCount } = this;
    
        if (isRoot) {
            navigation.navigate('CreateOrder', {
                OrderId: order.id,
                onGoBack: () => this.fetchOrders(2000),
            });
        } else {
            const documentId = route?.params?.DocumentId ?? '';
            const onGoBack = route?.params?.onGoBack ?? null;
    
            navigation.navigate('CreateOrder', {
                OrderId: order.id,
                autoGenPdf: true,
                docType: docType,
                DocumentId: documentId,
                popCount: popCount,
                onGoBack: onGoBack,
            });
        }
    }
    

    renderSearchBar() {
        let { state, project, client, filterOpened } = this.state
        let { searchInput, showInput } = this.state

        // return (
        //     <SearchBar
        //         menu={this.isRoot}
        //         main={this}
        //         title={!this.state.showInput}
        //         titleText={this.titleText}
        //         placeholder='Rechercher une commande'
        //         showBar={showInput}
        //         handleSearch={() => this.setState({ searchInput: '', showInput: !showInput })}
        //         searchInput={searchInput}
        //         searchUpdated={(searchInput) => this.setState({ searchInput })}
        //         filterComponent={
        //             <Filter
        //                 isAppBar
        //                 main={this}
        //                 opened={filterOpened}
        //                 toggleFilter={() => toggleFilter(this)}
        //                 setFilter={(field, value) => setFilter(this, field, value)}
        //                 resetFilter={() => this.setState({ state: '', client: { id: '', fullName: '' }, project: { id: '', name: '' } })}
        //                 options={[
        //                     { id: 1, type: 'picker', title: "État", values: states, value: state, field: 'state' },
        //                     // { id: 2, type: 'screen', title: "Client", value: client.fullName, field: 'client', screen: 'ListClients', titleText: 'Filtre par client' },
        //                     { id: 2, type: 'screen', title: "Projet", value: project.name, field: 'project', screen: 'ListProjects', titleText: 'Filtre par projet', disabled: this.project },
        //                 ]}
        //             />
        //         }
        //     />
        // )
    }

    render() {
        let { ordersCount, ordersList, loading } = this.state
        let { state, project, client, filterOpened } = this.state
        let { searchInput, showInput } = this.state
        const { canCreate } = this.props.permissions.orders
        const { isConnected } = this.props.network

        const fields = [
            { label: 'state', value: state },
            { label: 'client.id', value: client.id },
            { label: 'project.id', value: project.id }
        ]
        this.filteredOrders = handleFilter(ordersList, this.filteredOrders, fields, searchInput, KEYS_TO_FILTERS)

        const filterCount = this.filteredOrders.length
        const filterActivated = filterCount < ordersCount
        const s = filterCount > 1 ? 's' : ''

        return (
            <View style={styles.container}>

                {loading ?
                    <Background style={styles.container}>
                        {this.renderSearchBar()}
                        <Loading size='large' />
                    </Background>
                    :
                    <Background showMotif={filterCount < 4} style={styles.container}>

                        {this.renderSearchBar()}
                        {filterActivated && <ActiveFilter />}
                        {ordersCount > 0 && <ListSubHeader>{filterCount} commande{s}</ListSubHeader>}

                        {ordersCount > 0 ?
                            <FlatList
                                enableEmptySections={true}
                                data={this.filteredOrders}
                                keyExtractor={item => item.id.toString()}
                                renderItem={({ item }) => this.renderOrder(item)}
                                style={{ zIndex: 1 }}
                                contentContainerStyle={{ paddingBottom: constants.ScreenHeight * 0.12, paddingHorizontal: theme.padding }}
                                refreshControl={
                                    <RefreshControl
                                        refreshing={this.state.refreshing}
                                        onRefresh={this.fetchOrders}
                                    />
                                }
                            />
                            :
                            <EmptyList
                                icon={faFileInvoice}
                                header='Aucune commande'
                                description='Gérez vos commandes. Appuyez sur le boutton "+" pour en créer une nouvelle.'
                                offLine={!isConnected}
                            />
                        }

                        {canCreate && this.showFAB &&
                            <MyFAB onPress={() => this.props.navigation.navigate('CreateOrder', { onGoBack: () => this.fetchOrders(2000) })} />
                        }
                    </Background>}
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background
    },
});

const mapStateToProps = (state) => {
    return {
        role: state.roles.role,
        permissions: state.permissions,
        network: state.network,
        //fcmToken: state.fcmtoken
    }
}

export default connect(mapStateToProps)(ListOrders)
