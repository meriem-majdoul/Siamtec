import React, { Component } from 'react';
import { StyleSheet, Text, View, FlatList, Keyboard } from 'react-native';
import { List, Card } from 'react-native-paper';
import { connect } from 'react-redux'

import SearchBar from '../../components/SearchBar'
import Filter from '../../components/Filter'
import MyFAB from '../../components/MyFAB'
import ProjectItem from '../../components/ProjectItem'
import EmptyList from '../../components/EmptyList'
import Loading from '../../components/Loading'

import * as theme from '../../core/theme';
import { constants } from '../../core/constants';
import { load, toggleFilter, setFilter, handleFilter } from '../../core/utils'
import { requestRESPermission, requestWESPermission } from '../../core/permissions'
import { fetchDocs } from '../../api/firestore-api';

import { withNavigation } from 'react-navigation'
import firebase from '@react-native-firebase/app';

import SearchInput, { createFilter } from 'react-native-search-filter'
import { TouchableOpacity } from 'react-native-gesture-handler';
const KEYS_TO_FILTERS = ['id', 'name', 'state', 'step',]

const states = [
    { label: 'Tous', value: '' },
    { label: 'En attente', value: 'En attente' },
    { label: 'En cours', value: 'En cours' },
    { label: 'Terminé', value: 'Terminé' },
    { label: 'Annulé', value: 'Annulé' },
]

const steps = [
    { label: 'Toutes', value: '' },
    { label: 'Prospect', value: 'Prospect' },
    { label: 'Chantier', value: 'Chantier' },
    { label: 'SAV', value: 'SAV' },
]

const db = firebase.firestore()

class ListProjects extends Component {
    constructor(props) {
        super(props)
        this.onPressProject = this.onPressProject.bind(this)
        this.fetchDocs = fetchDocs.bind(this)

        this.isRoot = this.props.navigation.getParam('isRoot', true)
        this.titleText = this.props.navigation.getParam('titleText', 'Projets')
        this.showFAB = this.props.navigation.getParam('showFAB', true)
        this.filteredProjects = []

        this.state = {
            projectsList: [],
            projectsCount: 0,

            showInput: false,
            searchInput: '',

            //filter fields
            step: '',
            state: '',
            client: { id: '', fullName: '' },
            filterOpened: false,

            loading: true,
        }
    }

    componentDidMount() {
        Keyboard.dismiss()
        requestWESPermission()
        requestRESPermission()

        const role = this.props.role.id
        const { currentUser } = firebase.auth()
        const isClient = (role === 'client')

        if (isClient)
            var query = db.collection('Projects').where('client.id', '==', currentUser.uid).where('deleted', '==', false).orderBy('createdAt', 'DESC')

        else
            var query = db.collection('Projects').where('deleted', '==', false).orderBy('createdAt', 'DESC')

        this.fetchDocs(query, 'projectsList', 'projectsCount', () => load(this, false))
    }

    renderProject(project) {
        return <ProjectItem project={project} onPress={() => this.onPressProject(project)} />
    }

    onPressProject(project) {
        if (this.isRoot)
            this.props.navigation.navigate('CreateProject', { ProjectId: project.id })

        else {
            this.props.navigation.state.params.onGoBack({ id: project.id, name: project.name, client: project.client })
            this.props.navigation.goBack()
        }
    }

    render() {

        let { projectsCount, projectsList, loading } = this.state
        let { step, state, client, filterOpened } = this.state
        let { searchInput, showInput } = this.state
        const { canCreate } = this.props.permissions.projects
        const { isConnected } = this.props.network

        const fields = [{ label: 'step', value: step }, { label: 'state', value: state }, { label: 'client.id', value: client.id }]
        this.filteredProjects = handleFilter(projectsList, this.filteredProjects, fields, searchInput, KEYS_TO_FILTERS)

        const filterCount = this.filteredProjects.length
        const filterActivated = filterCount < projectsCount

        const s = filterCount > 1 ? 's' : ''

        return (
            <View style={styles.container}>
                <SearchBar
                    close={!this.isRoot}
                    main={this}
                    title={!showInput}
                    titleText={this.titleText}
                    placeholder='Rechercher un projet'
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
                        {projectsCount > 0 &&
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: theme.colors.gray50 }}>

                                <List.Subheader>{filterCount} projet{s}</List.Subheader>

                                {this.isRoot && <Filter
                                    main={this}
                                    opened={filterOpened}
                                    toggleFilter={() => toggleFilter(this)}
                                    setFilter={(field, value) => setFilter(this, field, value)}
                                    resetFilter={() => this.setState({ step: '', state: '', client: { id: '', fullName: '' } })}
                                    options={[
                                        { id: 0, type: 'picker', title: "Étape", values: steps, value: step, field: 'step' },
                                        { id: 1, type: 'picker', title: "État", values: states, value: state, field: 'state' },
                                        { id: 2, type: 'screen', title: "Client", value: client.fullName, field: 'client', screen: 'ListClients', titleText: 'Filtre par client' },
                                    ]}
                                />}
                            </View>
                        }

                        {projectsCount > 0 ?
                            <FlatList
                                enableEmptySections={true}
                                data={this.filteredProjects}
                                keyExtractor={item => item.id.toString()}
                                renderItem={({ item }) => this.renderProject(item)}
                                contentContainerStyle={{ paddingBottom: constants.ScreenHeight * 0.12 }} />
                            :
                            <EmptyList iconName='alpha-p-box' header='Liste des projets' description='Gérez tous vos projets. Appuyez sur le boutton "+" pour en créer un nouveau.' />
                        }

                        {canCreate && this.showFAB && this.isRoot &&
                            <MyFAB onPress={() => this.props.navigation.navigate('CreateProject')} />
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
})

const mapStateToProps = (state) => {
    return {
        role: state.roles.role,
        permissions: state.permissions,
        network: state.network,
        //fcmToken: state.fcmtoken
    }
}

export default connect(mapStateToProps)(ListProjects)