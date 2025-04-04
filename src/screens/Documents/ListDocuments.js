import React, { Component } from 'react'
import { StyleSheet, Text, View, FlatList, RefreshControl } from 'react-native'
import { List } from 'react-native-paper'
import SearchInput, { createFilter } from 'react-native-search-filter'
import { connect } from 'react-redux'
import { faFolder } from 'react-native-vector-icons/FontAwesome5'

import Background from '../../components/NewBackground'
import SearchBar from '../../components/SearchBar'
import ActiveFilter from '../../components/ActiveFilter'
import ListSubHeader from '../../components/ListSubHeader'
import Filter from '../../components/Filter'
import DocumentItem from '../../components/DocumentItem'
import MyFAB from '../../components/MyFAB'
import EmptyList from '../../components/EmptyList'
import Loading from '../../components/Loading'

import { configureQuery } from '../../core/privileges'
import { myAlert, loadLog, load, toggleFilter, setFilter, handleFilter, countDown } from '../../core/utils'
import { fetchDocs, fetchDocuments } from '../../api/firestore-api';
import { uploadFileNew } from "../../api/storage-api";

import { auth, db } from '../../firebase'
import * as theme from '../../core/theme';
import { constants, highRoles } from '../../core/constants';

const KEYS_TO_FILTERS = ['id', 'name', 'state', 'type',]

const states = [
    { label: 'Tous', value: '' },
    { label: 'A faire', value: 'A faire' },
    { label: 'En cours', value: 'En cours' },
    { label: 'Validé', value: 'Validé' },
]

let types = [
    { label: 'Tous', value: '' },
    { label: 'Bon de commande', value: 'Bon de commande' },
    //{ label: 'Devis', value: 'Devis' },
    { label: 'Offre précontractuelle', value: 'Offre précontractuelle' },
    { label: 'Facture', value: 'Facture' },
    { label: 'Dossier CEE', value: 'Dossier CEE' },
    { label: 'Fiche EEB', value: 'Fiche EEB' },
    { label: 'Dossier aide', value: 'Dossier aide' },
    { label: 'Prime de rénovation', value: 'Prime de rénovation' },
    { label: 'Aide et subvention', value: 'Aide et subvention' },
    { label: 'Action logement', value: 'Action logement' },
    { label: 'PV réception', value: 'PV réception' },
    { label: 'Mandat SEPA', value: 'Mandat SEPA' },
    { label: 'Contrat CGU-CGV', value: 'Contrat CGU-CGV' },
    { label: 'Attestation fluide', value: 'Attestation fluide' },
    { label: 'Autre', value: 'Autre' },
]

class ListDocuments extends Component {
    constructor(props) {
        super(props)
        this.filteredDocuments = []
        this.uploadFileNew = uploadFileNew.bind(this)
        this.bootstrapUploads = this.bootstrapUploads.bind(this)
        this.fetchSynergysDocuments = this.fetchSynergysDocuments.bind(this)
        this.onPressDocument = this.onPressDocument.bind(this)

        const { route } = this.props;
        this.isRoot = route?.params?.isRoot ?? true;


        this.state = {
            documentsList: [],
            documentsCount: 0,

            //searchbar
            showInput: false,
            searchInput: '',

            //filters
            type: '',
            state: '',
            project: { id: '', name: '' },
            filterOpened: false,

            loading: true,
            refreshing: false
        }
    }

    componentWillUnmount() {
        if (this.willFocusSubscription)
            this.willFocusSubscription.remove()
    }

    async componentDidMount() {
        //Rehydrate killed upload tasks
        this.bootstrapUploads()
        await this.fetchSynergysDocuments()
        this.willFocusSubscription = this.props.navigation.addListener('willFocus', async () => await this.fetchSynergysDocuments())
    }


    async fetchSynergysDocuments(count) {
        this.setState({ refreshing: true })
        if (count) {
            await countDown(count)
        }
        const { queryFilters } = this.props.permissions.documents
        if (queryFilters === [])
            this.setState({ documentsList: [], documentsCount: 0, refreshing: false })
        else {
            const params = { role: this.props.role.value }
            var query = configureQuery('Documents', queryFilters, params)
            const documentsList = await fetchDocuments(query)
            this.setState({
                documentsList,
                documentsCount: documentsList.length,
                loading: false,
                refreshing: false
            })
        }
    }

    bootstrapUploads() {
        const { newAttachments } = this.props.documents //Documents uploads
        if (newAttachments === {}) return
        Object.entries(newAttachments).forEach(([DocumentId, attachment]) => {
            this.uploadOfflineBeta(attachment, DocumentId)
        })
    }

    uploadOfflineBeta(attachment, DocumentId) {
        const { storageRefPath } = attachment
        // console.log('2. uploadOfflineBeta')
        // console.log('2.1 attachment:', attachment)
        // console.log('2.2 storageRefPath:', storageRefPath)
        // console.log('2.3 DocumentId:', DocumentId)
        this.uploadFileNew(attachment, storageRefPath, DocumentId, true)
    }

    renderDocument(document) {
        return <DocumentItem document={document} onPress={() => this.onPressDocument(document.id)} />
    }

    onPressDocument(DocumentId) {
        this.props.navigation.navigate('UploadDocument', {
            isEdit: true,
            title: '',
            DocumentId,
            onGoBack: () => this.fetchSynergysDocuments(2000)
        })
    }

    renderSearchBar() {
        let { type, state, project, filterOpened } = this.state
        let { searchInput, showInput } = this.state

        return (
            <SearchBar
                menu={this.isRoot}
                main={this}
                title={!showInput}
                titleText='Documents'
                placeholder='Rechercher un document'
                showBar={showInput}
                handleSearch={() => this.setState({ searchInput: '', showInput: !showInput })}
                searchInput={searchInput}
                searchUpdated={(searchInput) => this.setState({ searchInput })}
                filterComponent={
                    <Filter
                        isAppBar
                        main={this}
                        opened={filterOpened}
                        toggleFilter={() => toggleFilter(this)}
                        setFilter={(field, value) => setFilter(this, field, value)}
                        resetFilter={() => this.setState({ type: '', state: '', project: { id: '', name: '' } })}
                        options={[
                            { id: 0, type: 'picker', title: "Type", values: types, value: type, field: 'type' },
                            { id: 1, type: 'picker', title: "État", values: states, value: state, field: 'state' },
                            { id: 2, type: 'screen', title: "Projet", value: project.name, field: 'project', screen: 'ListProjects', titleText: 'Filtre par projet' },
                        ]}
                    />
                }
            />
        )
    }

    render() {
        let { documentsCount, documentsList, loading } = this.state
        let { type, state, project, filterOpened } = this.state
        let { searchInput, showInput } = this.state
        const { canCreate } = this.props.permissions.documents
        const { isConnected } = this.props.network

        const fields = [{ label: 'type', value: type }, { label: 'state', value: state }, { label: 'project.id', value: project.id }]
        this.filteredDocuments = handleFilter(documentsList, this.filteredDocuments, fields, searchInput, KEYS_TO_FILTERS)
        const filterCount = this.filteredDocuments.length
        const filterActivated = filterCount < documentsCount
        const s = filterCount > 1 ? 's' : ''

        return (
            <View style={styles.container}>

                {loading ?
                    <Background style={styles.container}>
                        {this.renderSearchBar()}
                        <Loading size='large' />
                    </Background>
                    :
                    <Background showMotif={filterCount < 6} style={styles.container}>
                        {this.renderSearchBar()}
                        {filterActivated && <ActiveFilter />}
                        {documentsCount > 0 && <ListSubHeader>{filterCount} document{s}</ListSubHeader>}

                        {documentsCount > 0 ?
                            <FlatList
                                enableEmptySections={true}
                                data={this.filteredDocuments}
                                keyExtractor={item => item.id.toString()}
                                renderItem={({ item }) => this.renderDocument(item)}
                                style={{ zIndex: 1 }}
                                contentContainerStyle={{ paddingBottom: constants.ScreenHeight * 0.12 }}
                                refreshControl={
                                    <RefreshControl
                                        refreshing={this.state.refreshing}
                                        onRefresh={this.fetchSynergysDocuments}
                                    />
                                }
                            />
                            :
                            <EmptyList icon={faFolder} header='Aucun document' description='Gérez tous vos documents (factures, Offres, etc). Appuyez sur le boutton "+" pour en ajouter.' offLine={!isConnected} />
                        }
                        {canCreate &&
                            <MyFAB onPress={() => this.props.navigation.navigate('UploadDocument', { onGoBack: () => this.fetchSynergysDocuments(2000) })} />
                        }
                    </Background>}
            </View>

        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    filterActive: {
        backgroundColor: theme.colors.secondary,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 5
    }
})

const mapStateToProps = (state) => {
    return {
        role: state.roles.role,
        permissions: state.permissions,
        network: state.network,
        documents: state.documents
        //fcmToken: state.fcmtoken
    }
}

export default connect(mapStateToProps)(ListDocuments)
