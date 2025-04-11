import React, { Component } from 'react';
import { StyleSheet, Text, View, FlatList, RefreshControl } from 'react-native';
import { List } from 'react-native-paper';
import { connect } from 'react-redux'
import { faFileInvoice } from 'react-native-vector-icons/FontAwesome5'
import { withNavigation } from 'react-navigation'

import SearchInput, { createFilter } from 'react-native-search-filter'
import Background from '../components/NewBackground'
import ActiveFilter from '../components/ActiveFilter'
import SearchBar from '../components/SearchBar'
import ListSubHeader from '../components/ListSubHeader'
import Filter from '../components/Filter'
import MyFAB from '../components/MyFAB'
import OrderItem from '../components/OrderItem' //#add
import EmptyList from '../components/EmptyList'
import Loading from '../components/Loading'

import firebase, { db, auth } from '../firebase'
import * as theme from '../core/theme';
import { constants } from '../core/constants';
import { load, toggleFilter, setFilter, handleFilter, countDown } from '../core/utils'
import { configureQuery } from '../core/privileges'
import { fetchDocs, fetchDocuments } from '../api/firestore-api';

class ListFormsContainer extends Component {
    constructor(props) {
        super(props)
        this.fetchItems = this.fetchItems.bind(this)

        const { route } = this.props;

        this.isRoot = route?.params?.isRoot ?? true;
        this.autoGenPdf = route?.params?.autoGenPdf ?? false;
        this.docType = route?.params?.docType ?? '';
        this.popCount = route?.params?.popCount ?? 1;

// filters
// this.project = route?.params?.project ?? undefined; // For pdf generation
this.showFAB = (route?.params?.showFAB ?? true) && this.isRoot;
        this.filteredItems = []

        this.state = {
            List: [],
            Count: 0,

            showInput: false,
            searchInput: '',

            //filters
            state: '',
            project: { id: '', name: '' },
            client: { id: '', fullName: '' },
            filterOpened: false,

            loading: true,
            refreshing: false
        }
    }

    async componentDidMount() {
        await this.fetchItems()
        // this.willFocusSubscription = this.props.navigation.addListener('willFocus', async () => console.log('123456789'))
    }

    // componentWillUnmount() {
    //     if (this.willFocusSubscription)
    //         this.willFocusSubscription()
    // }

    async fetchItems(count) {
        this.setState({ refreshing: true })
        if (count) {
            await countDown(count)
        }
        // const { queryFilters } = this.props.permissions.eeb
        // if (queryFilters === []) this.setState({ List: [], Count: 0 })
        // else {
        //     const params = { role: this.props.role.value }
        //     var query = configureQuery('Orders', queryFilters, params)
        const { collection, query } = this.props
        // this.fetchDocs(query, 'List', 'Count', async () => { load(this, false) })
        //}
        const List = await fetchDocuments(query)
        this.setState({ List, Count: List.length, loading: false, refreshing: false })
    }

    render() {
        let { Count, List, loading } = this.state
        let { state, project, client, filterOpened } = this.state
        let { searchInput, showInput } = this.state
        const { titleText, countTitle, creationScreen } = this.props
        const canCreate = true //#task: edit it..
        const { isConnected } = this.props.network

        const fields = [
            { label: 'state', value: state },
            { label: 'client.id', value: client.id },
            { label: 'project.id', value: project.id }
        ]
        this.filteredItems = handleFilter(List, this.filteredItems, fields, searchInput, this.props.KEYS_TO_FILTERS)
        const filterCount = this.filteredItems.length
        const filterActivated = filterCount < Count
        const s = filterCount > 1 ? 's' : ''

        return (
            <View style={styles.container}>

                <Background showMotif={filterCount < 4} style={styles.container}>

                    <SearchBar
                        menu={this.props.isRoot}
                        title={!showInput}
                        titleText={titleText}
                        showBar={showInput}
                        placeholder='Rechercher un élément'
                        handleSearch={() => this.setState({ searchInput: '', showInput: !showInput })}
                        searchInput={searchInput}
                        searchUpdated={(searchInput) => this.setState({ searchInput })}
                    />

                    {loading ?
                        <Loading size='large' />
                        :
                        <View>
                            {filterActivated && <ActiveFilter />}
                            {Count > 0 && <ListSubHeader>{filterCount} {countTitle}{s}</ListSubHeader>}

                            {Count > 0 ?
                                <FlatList
                                    enableEmptySections={true}
                                    data={this.filteredItems}
                                    keyExtractor={item => item.id.toString()}
                                    renderItem={({ item }) => this.props.renderItem(item)}
                                    style={{ zIndex: 1 }}
                                    contentContainerStyle={{ paddingBottom: constants.ScreenHeight * 0.12, paddingHorizontal: theme.padding }}
                                    refreshControl={
                                        <RefreshControl
                                            refreshing={this.state.refreshing}
                                            onRefresh={this.fetchItems}
                                        />
                                    }
                                />
                                :
                                <View style={{ alignSelf: "center" }}>
                                    {this.props.emptyList}
                                </View>
                            }

                        </View>
                    }

                    {!loading && canCreate && this.showFAB &&
                        <MyFAB onPress={() => this.props.navigation.navigate(creationScreen, { onGoBack: () => this.fetchItems(2000) })} />
                    }

                </Background>
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

export default connect(mapStateToProps)(ListFormsContainer)
