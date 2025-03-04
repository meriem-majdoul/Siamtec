import React, { Component } from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import { List } from 'react-native-paper';
import { connect } from 'react-redux'

import SearchBar from '../../components/SearchBar'
import Filter from '../../components/Filter'
import MyFAB from '../../components/MyFAB'
import OrderItem from '../../components/OrderItem' //#add
import EmptyList from '../../components/EmptyList'
import Loading from '../../components/Loading'

import * as theme from '../../core/theme';
import { constants } from '../../core/constants';
import { load, toggleFilter, setFilter, handleFilter } from '../../core/utils'
import { fetchDocs } from '../../api/firestore-api';

import { withNavigation } from 'react-navigation'
import firebase from '@react-native-firebase/app';

import SearchInput, { createFilter } from 'react-native-search-filter'
const KEYS_TO_FILTERS = ['id', 'name', 'state'] //#edit

const states = [
    { label: 'Tous', value: '' },
    { label: 'En cours', value: 'En cours' },
    { label: 'Terminé', value: 'Terminé' },
    { label: 'Annulé', value: 'Annulé' },
]

const db = firebase.firestore()

class ListOrders extends Component {
    constructor(props) {
        super(props)
        this.fetchDocs = fetchDocs.bind(this)
        this.onPressOrder = this.onPressOrder.bind(this) //#edit

        this.isRoot = this.props.navigation.getParam('isRoot', true)
        this.titleText = this.props.navigation.getParam('titleText', 'Commandes')
        this.showFAB = this.props.navigation.getParam('showFAB', true)
        this.filteredOrders = []

        this.state = {
            ordersList: [],
            ordersCount: 0,

            showInput: false,
            searchInput: '',

            //filters
            state: '',
            project: { id: '', name: '' },
            client: { id: '', fullName: '' },
            filterOpened: false,

            loading: false,
        }
    }

    async componentDidMount() {
        load(this, true)
        await this.fetchOrders()
    }

    async fetchOrders() {
        const query = db.collection('Orders').where('deleted', '==', false).orderBy('createdAt', 'DESC')
        this.fetchDocs(query, 'ordersList', 'ordersCount', async () => {
            let { ordersList } = this.state

            //Fetch client dynamicly
            for (let i = 0; i < ordersList.length; i++) {
                await db.collection('Projects').doc(ordersList[i].project.id).get().then((doc) => {
                    ordersList[i].client = doc.data().client
                })
            }

            this.setState({ ordersList, filteredOrders: ordersList })
            load(this, false)
        })
    }

    componentWillUnmount() {
        this.unsubscribe()
    }

    renderOrder(order) { //#edit
        return <OrderItem order={order} onPress={() => this.onPressOrder(order)} />
    }

    onPressOrder(order) {//#edit
        //if (this.isRoot)
        this.props.navigation.navigate('CreateOrder', { OrderId: order.id })

        // else {
        //     this.props.navigation.state.params.onGoBack({ id: project.id, name: project.name })
        //     this.props.navigation.goBack()
        // }
    }

    render() {
        let { ordersCount, ordersList, loading } = this.state
        let { state, project, client, filterOpened } = this.state
        let { searchInput, showInput } = this.state
        const { canCreate } = this.props.permissions.orders
        const { isConnected } = this.props.network

        const fields = [{ label: 'state', value: state }, { label: 'client.id', value: client.id }, { label: 'project.id', value: project.id }]
        this.filteredOrders = handleFilter(ordersList, this.filteredOrders, fields, searchInput, KEYS_TO_FILTERS)

        const filterCount = this.filteredOrders.length
        const filterActivated = filterCount < ordersCount
        const s = filterCount > 1 ? 's' : ''

        return (
            <View style={styles.container}>

                <SearchBar
                    close={!this.isRoot}
                    main={this}
                    title={!this.state.showInput}
                    titleText={this.titleText}
                    placeholder='Rechercher une commande'
                    showBar={showInput}
                    handleSearch={() => this.setState({ searchInput: '', showInput: !showInput })}
                    searchInput={searchInput}
                    searchUpdated={(searchInput) => this.setState({ searchInput })}
                />

                {filterActivated && <View style={{ backgroundColor: theme.colors.secondary, justifyContent: 'center', alignItems: 'center', paddingVertical: 5 }}><Text style={[theme.customFontMSsemibold.caption, { color: '#fff' }]}>Filtre activé</Text></View>}

                {loading ?
                    <View style={styles.container}>
                        <Loading size='large' />
                    </View>
                    :
                    <View style={styles.container}>
                        {ordersCount > 0 &&
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: theme.colors.gray50 }}>
                                <List.Subheader>{filterCount} commande{s}</List.Subheader>

                                {this.isRoot && <Filter
                                    main={this}
                                    opened={filterOpened}
                                    toggleFilter={() => toggleFilter(this)}
                                    setFilter={(field, value) => setFilter(this, field, value)}
                                    resetFilter={() => this.setState({ state: '', client: { id: '', fullName: '' }, project: { id: '', name: '' } })}
                                    options={[
                                        { id: 1, type: 'picker', title: "État", values: states, value: state, field: 'state' },
                                        { id: 2, type: 'screen', title: "Client", value: client.fullName, field: 'client', screen: 'ListClients', titleText: 'Filtre par client' },
                                        { id: 2, type: 'screen', title: "Projet", value: project.name, field: 'project', screen: 'ListProjects', titleText: 'Filtre par projet' },
                                    ]}
                                />}
                            </View>
                        }

                        {ordersCount > 0 ?
                            <FlatList
                                enableEmptySections={true}
                                data={this.filteredOrders}
                                keyExtractor={item => item.id.toString()}
                                renderItem={({ item }) => this.renderOrder(item)}
                                contentContainerStyle={{ paddingBottom: constants.ScreenHeight * 0.12 }} />
                            :
                            <EmptyList iconName='file-document-edit-outline' header='Liste des commandes' description='Gérez vos commandes. Appuyez sur le boutton "+" pour en créer une nouvelle.' offLine={!isConnected} />
                        }

                        {canCreate && this.showFAB && this.isRoot &&
                            <MyFAB onPress={() => this.props.navigation.navigate('CreateOrder')} />
                        }
                    </View>}
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
