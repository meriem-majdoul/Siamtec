import React, { Component } from 'react'
import { StyleSheet, Text, View, FlatList } from 'react-native'
import { List } from 'react-native-paper'
import firebase from '@react-native-firebase/app'
import SearchInput, { createFilter } from 'react-native-search-filter'
import { connect } from 'react-redux'

import SearchBar from '../../components/SearchBar'
import Filter from '../../components/Filter'
import DocumentItem from '../../components/DocumentItem'
import MyFAB from '../../components/MyFAB'
import EmptyList from '../../components/EmptyList'
import Loading from '../../components/Loading'

import { myAlert, downloadFile, loadLog, load, toggleFilter, setFilter, handleFilter } from '../../core/utils'
import { fetchDocs } from '../../api/firestore-api';
import { uploadFileNew } from "../../api/storage-api";

import * as theme from '../../core/theme';
import { constants } from '../../core/constants';

const KEYS_TO_FILTERS = ['id', 'name', 'state', 'type',]
const db = firebase.firestore()

const states = [
    { label: 'Tous', value: '' },
    { label: 'A faire', value: 'A faire' },
    { label: 'En cours', value: 'En cours' },
    { label: 'Validé', value: 'Validé' },
]

const types = [
    { label: 'Tous', value: '' },
    { label: 'Bon de commande', value: 'Bon de commande' },
    { label: 'Devis', value: 'Devis' },
    { label: 'Facture', value: 'Facture' },
    { label: 'Dossier CEE', value: 'Dossier CEE' },
    { label: 'Prime de rénovation', value: 'Prime de rénovation' },
    { label: 'Aide et subvention', value: 'Aide et subvention' },
    { label: 'Action logement', value: 'Action logement' },
]

class ListDocuments extends Component {
    constructor(props) {
        super(props)
        this.filteredDocuments = []
        this.fetchDocs = fetchDocs.bind(this)
        this.uploadFileNew = uploadFileNew.bind(this)
        this.bootstrapUploads = this.bootstrapUploads.bind(this)

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
        }
    }

    //Fetch documents
    componentDidMount() {
        //Rehydrate killed upload tasks
        this.bootstrapUploads()

        const role = this.props.role.id
        const { currentUser } = firebase.auth()
        const isClient = (role === 'client')

        if (isClient)
            var query = db.collection('Documents').where('project.client.id', '==', currentUser.uid).where('deleted', '==', false).orderBy('createdAt', 'desc')

        else
            var query = db.collection('Documents').where('deleted', '==', false).orderBy('createdAt', 'desc')

        this.fetchDocs(query, 'documentsList', 'documentsCount', () => load(this, false))
    }

    bootstrapUploads() {
        const { newAttachments } = this.props.documents //Documents uploads
        console.log('1. Pending attachments.....', newAttachments)

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
        return <DocumentItem document={document} />
    }

    componentWillUnmount() {
        this.unsubscribe && this.unsubscribe()
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

                <SearchBar
                    main={this}
                    title={!showInput}
                    titleText='Documents'
                    placeholder='Rechercher un document'
                    showBar={showInput}
                    handleSearch={() => this.setState({ searchInput: '', showInput: !showInput })}
                    searchInput={searchInput}
                    searchUpdated={(searchInput) => this.setState({ searchInput })}
                />

                {filterActivated && <View style={styles.filterActive}><Text style={[theme.customFontMSsemibold.caption, { color: '#fff' }]}>Filtre activé</Text></View>}

                { loading ?
                    <View style={styles.container}>
                        <Loading size='large' />
                    </View>
                    :
                    <View style={styles.container}>
                        {documentsCount > 0 &&
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: theme.colors.gray50 }}>
                                <List.Subheader>{filterCount} document{s}</List.Subheader>

                                <Filter
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
                            </View>
                        }

                        {documentsCount > 0 ?
                            <FlatList
                                enableEmptySections={true}
                                data={this.filteredDocuments}
                                keyExtractor={item => item.id.toString()}
                                renderItem={({ item }) => this.renderDocument(item)}
                                contentContainerStyle={{ paddingBottom: constants.ScreenHeight * 0.12 }} />
                            :
                            <EmptyList iconName='file-document' header='Liste des documents' description='Gérez tous vos documents (factures, devis, etc). Appuyez sur le boutton "+" pour en ajouter.' offLine={!isConnected} />
                        }
                        {canCreate && <MyFAB onPress={() => this.props.navigation.navigate('UploadDocument')} />}
                    </View>}
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
