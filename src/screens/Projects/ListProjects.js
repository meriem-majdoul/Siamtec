import React, { Component } from 'react';
import { StyleSheet, View, FlatList, RefreshControl } from 'react-native';
import { connect } from 'react-redux'
import { faConstruction } from 'react-native-vector-icons/FontAwesome5'
import { faThLarge, faList } from 'react-native-vector-icons/FontAwesome5'
import _ from 'lodash'


import moment from 'moment';
import 'moment/locale/fr'
moment.locale('fr')

import { ActiveFilter, SearchBar, ListSubHeader, Filter, MyFAB, ProjectItem, ProjectItem2, EmptyList, Loading } from '../../components'

import Background from '../../components/NewBackground'
import CustomIcon from '../../components/CustomIcon'

import * as theme from '../../core/theme';
import { constants, phases } from '../../core/constants';
import { toggleFilter, setFilter, handleFilter, formatRow } from '../../core/utils'
import { configureQuery } from '../../core/privileges'
import { fetchDocuments } from '../../api/firestore-api';

const KEYS_TO_FILTERS = ['id', 'name', 'state', 'step',]

const states = [
    { label: 'Tous', value: '' },
    { label: 'En attente', value: 'En attente' },
    { label: 'En cours', value: 'En cours' },
    { label: 'Terminé', value: 'Terminé' },
    { label: 'Annulé', value: 'Annulé' },
]

class ListProjects extends Component {
    constructor(props) {
        super(props)
    
        this.onPressProject = this.onPressProject.bind(this)
        this.fetchProjects = this.fetchProjects.bind(this)
    
        // Accès aux paramètres de navigation avec React Navigation v5/v6
        const { route } = this.props;
    
        this.isRoot = route?.params?.isRoot ?? true; // Valeur par défaut si non définie
        this.titleText = route?.params?.titleText ?? 'Projets'; // Valeur par défaut si non définie
        this.showFAB = route?.params?.showFAB && this.isRoot; // Afficher le FAB seulement si isRoot est true
        this.filteredProjects = [];
    
        this.state = {
            projectsList: [],
            projectsCount: 0,
    
            showInput: false,
            searchInput: '',
    
            // Champs de filtre
            step: '',
            state: '',
            client: { id: '', fullName: '' },
            filterOpened: false,
    
            // Vue (grille/liste)
            view: 'list',
            columnCount: 1,
    
            loading: true,
            refreshing: false,
        }
    }
    


    componentWillUnmount() {
        if (this.willFocusSubscription)
            this.willFocusSubscription.remove()
    }

    async componentDidMount() {
        await this.fetchProjects()
        this.willFocusSubscription = this.props.navigation.addListener('willFocus', async () => await this.fetchProjects())
    }

    //#task: put lazy fetching: https://github.com/patrickleemsantos/react-native-food-panther/blob/master/App.js
    async fetchProjects() {
        this.setState({ refreshing: true })

        const { queryFilters } = this.props.permissions.projects

        if (queryFilters === []) {
            this.setState({ projectsList: [], projectsCount: 0 })
        }
        else {
            const params = { role: this.props.role.value }
            const query = configureQuery('Projects', queryFilters, params)

            const projectsList = await fetchDocuments(query)

            this.setState({
                projectsList,
                projectsCount: projectsList.length,
                loading: false,
                refreshing: false
            })
        }
    }

    renderProject(project) {
        const { view } = this.state

        if (view === 'list')
            return <ProjectItem project={project} onPress={() => this.onPressProject(project)} />

        else if (view === 'grid') {
            if (project.empty) {
                return <View style={styles.invisibleItem} />
            }

            else return <ProjectItem2 project={project} onPress={() => this.onPressProject(project)} />
        }
    }

    onPressProject(project) {
        if (this.isRoot)
            this.props.navigation.navigate('Process', { ProjectId: project.id })

        else {
            this.props.navigation.state.params.onGoBack(project)
            this.props.navigation.goBack()
        }
    }

    renderSearchBar() {
        const { searchInput, showInput } = this.state
        let { step, state, client, filterOpened } = this.state

        return (
            <SearchBar
                menu={this.isRoot}
                main={this}
                title={!showInput}
                titleText={this.titleText}
                placeholder='Rechercher un projet'
                showBar={showInput}
                handleSearch={() => this.setState({ searchInput: '', showInput: !showInput })}
                searchInput={searchInput}
                searchUpdated={(searchInput) => this.setState({ searchInput })}
                filterComponent={
                    <Filter
                        isAppBar={true}
                        main={this}
                        opened={filterOpened}
                        toggleFilter={() => toggleFilter(this)}
                        setFilter={(field, value) => setFilter(this, field, value)}
                        resetFilter={() => this.setState({ step: '', state: '', client: { id: '', fullName: '' } })}
                        options={[
                            { id: 0, type: 'picker', title: "Étape", values: phases, value: step, field: 'step' },
                            { id: 1, type: 'picker', title: "État", values: states, value: state, field: 'state' },
                            { id: 2, type: 'screen', title: "Client", value: client.fullName, field: 'client', screen: 'ListClients', titleText: 'Filtre par client' },
                        ]}
                    />
                }
            />
        )
    }

    toggleViewMode() {
        const { view } = this.state

        if (view === 'list')
            this.setState({ view: 'grid', columnCount: 3 })
        else if (view === 'grid')
            this.setState({ view: 'list', columnCount: 1 })
    }

    render() {

        let { projectsCount, projectsList, view, columnCount, loading } = this.state
        let { step, state, client, filterOpened } = this.state
        let { searchInput, showInput } = this.state
        const { canCreate } = this.props.permissions.projects
        const { isConnected } = this.props.network

        const fields = [{ label: 'step', value: step }, { label: 'state', value: state }, { label: 'client.id', value: client.id }]
        this.filteredProjects = handleFilter(projectsList, this.filteredProjects, fields, searchInput, KEYS_TO_FILTERS)
        const filterCount = this.filteredProjects.length
        const filterActivated = filterCount < projectsCount
        const s = filterCount > 1 ? 's' : ''
        const isList = view === 'list'

        return (
            <View style={{ flex: 1 }}>

                {loading ?
                    <Background>
                        {this.renderSearchBar()}
                        <Loading size='large' />
                    </Background>
                    :
                    <Background showMotif={filterCount < 3}>
                        {this.renderSearchBar()}
                        {filterActivated && <ActiveFilter />}

                        {projectsCount > 0 &&
                            <ListSubHeader right={<CustomIcon icon={isList ? faThLarge : faList} size={18} onPress={this.toggleViewMode.bind(this)} />}>{filterCount} projet{s}</ListSubHeader>
                        }

                        {projectsCount > 0 ?

                            <FlatList
                                enableEmptySections={true}
                                data={formatRow(this.state.view === 'list' ? false : true, this.filteredProjects, columnCount)}
                                keyExtractor={item => item.id}
                                renderItem={({ item }) => this.renderProject(item)}
                                style={{ zIndex: 5 }}
                                numColumns={columnCount}
                                key={columnCount}
                                columnWrapperStyle={columnCount > 1 && styles.columnWrapperStyle}
                                contentContainerStyle={{ paddingBottom: constants.ScreenHeight * 0.12, paddingHorizontal: theme.padding, paddingTop: 10 }}
                                refreshControl={
                                    <RefreshControl
                                        refreshing={this.state.refreshing}
                                        onRefresh={this.fetchProjects}
                                    />
                                }
                            />
                            :
                            <EmptyList icon={faConstruction} header='Aucun projet' description='Gérez tous vos projets. Appuyez sur le boutton "+" pour en créer un nouveau.' />
                        }

                        {canCreate && this.showFAB &&
                            <MyFAB onPress={() => this.props.navigation.navigate('CreateProject')} />
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
    columnWrapperStyle: {
        justifyContent: 'space-between',
        zIndex: 10
    },
    invisibleItem: { //Same shape of ProjectItem2
        width: constants.ScreenWidth * 0.24,
        height: constants.ScreenWidth * 0.24,
        borderRadius: constants.ScreenWidth * 0.05,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        backgroundColor: 'transparent'
    }
})

const mapStateToProps = (state) => {
    return {
        role: state.roles.role,
        permissions: state.permissions,
        network: state.network,
        currentUser: state.currentUser
        //fcmToken: state.fcmtoken
    }
}

export default connect(mapStateToProps)(ListProjects)





   // const collection = formatedActions[documentId][0]['collection'] //PROJECTS: all array items have same collection

            // for (let action of formatedActions[documentId]) { // NOM & PRENOM: actions targeting same collection / same document

            //     const { properties } = action

            //     const isValid = await this.verifyDataExist(collection, documentId, properties)

            //     if (isValid) {
            //         action.status = 'done'
            //     }
            // }