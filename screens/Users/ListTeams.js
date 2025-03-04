
import React, { Component } from 'react'
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert } from 'react-native'
import { List } from 'react-native-paper'
import firebase from '@react-native-firebase/app'

import * as theme from '../../core/theme'
import { constants } from '../../core/constants'
import { myAlert, checkPlural, load } from '../../core/utils'
import { fetchDocs, deleteTeam } from '../../api/firestore-api'

import ListItem from '../../components/ListItem'
import EmptyList from '../../components/EmptyList'
import MyFAB from '../../components/MyFAB'
import Loading from '../../components/Loading'


import { withNavigation } from 'react-navigation'
import SearchInput, { createFilter } from 'react-native-search-filter'

const KEYS_TO_FILTERS = ['id', 'name']
const db = firebase.firestore()

class ListTeams extends Component {

    constructor(props) {
        super(props);
        this.myAlert = myAlert.bind(this)
        this.alertDeleteTeam = this.alertDeleteTeam.bind(this)
        this.renderTeam = this.renderTeam.bind(this)
        this.fetchDocs = fetchDocs.bind(this)

        this.state = {
            teamsList: [],
            teamsCount: 0,
            members: [],

            loading: false,
        }
    }

    async componentDidMount() {
        load(this, true)
        const query = db.collection('Teams').where('deleted', '==', false)
        this.fetchDocs(query, 'teamsList', 'teamsCount', () => load(this, false))
    }

    viewTeam(team) {
        this.props.navigation.navigate('ViewTeam', { teamId: team.id })
    }

    alertDeleteTeam(team) {
        const title = "Supprimer l'équipe"
        const message = 'Etes-vous sûr de vouloir supprimer cette équipe ? Cette opération est irreversible.'
        const handleConfirm = async () => await deleteTeam(team).then(() => console.log('Batch succeeded !!!'))
        this.myAlert(title, message, handleConfirm)
    }

    renderTeam(team) {
        const { canDelete } = this.props.permissions
        let description = checkPlural(team.members.length, ' membre')

        return (
            <TouchableOpacity onPress={() => this.viewTeam(team)}>
                <ListItem
                    title={team.name}
                    description={description}
                    iconRightName='dots-horizontal'
                    left={props => <List.Icon {...props} icon="account-group" />}

                    menu
                    options={[
                        { id: 0, title: "Voir l'équipe" },
                        { id: 1, title: "Supprimer l'équipe" },
                    ]}

                    functions={[
                        () => this.viewTeam(team),
                        () => {
                            if (!canDelete) Alert.alert('Action non autorisée', 'Seul un administrateur peut supprimer une équipe.')
                            else this.alertDeleteTeam(team)
                        },
                    ]}
                />
            </TouchableOpacity>
        )
    }

    render() {
        let { teamsCount, teamsList, loading } = this.state

        const s = teamsCount > 1 ? 's' : ''

        const filteredTeams = teamsList.filter(createFilter(this.props.searchInput, KEYS_TO_FILTERS))
        const { canCreate } = this.props.permissions

        return (
            <View style={styles.container}>
                {loading ?
                    <View style={styles.container}>
                        <Loading />
                    </View>
                    :
                    <View style={[styles.container, { paddingHorizontal: constants.ScreenWidth * 0.015 }]}>

                        {teamsCount > 0 && <List.Subheader>{teamsCount} équipe{s}</List.Subheader>}
                        {teamsCount > 0 ?
                            <FlatList
                                enableEmptySections={true}
                                data={filteredTeams}
                                keyExtractor={item => item.id.toString()}
                                renderItem={({ item }) => this.renderTeam(item)}
                                style={{ paddingHorizontal: 15 }}
                                contentContainerStyle={{ paddingBottom: 75 }} />
                            :
                            <EmptyList iconName='account-multiple-outline' header='Liste des équipes' description='Gérez les équipes. Appuyez sur le boutton "+" pour en créer un nouvelle.' offLine={this.props.offLine} />
                        }

                        {canCreate && <MyFAB onPress={() => this.props.navigation.navigate('CreateTeam')} />}

                    </View>}
            </View>

        )
    }
}

export default withNavigation(ListTeams)

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    box: {
        padding: 20,
        marginBottom: 5,
        backgroundColor: 'white',
        flexDirection: 'row',
    },
    boxContent: {
        flex: 1,
        //flexDirection: 'column',
        //alignItems: 'flex-start',
        marginLeft: 10,
    },
    description: {
        fontSize: 15,
        color: "#646464",
    },
    title: {
        fontSize: 18,
        color: "#151515",
    },
})


/* <TeamItem
membersCount = {team.members.length}
onPress={() => this.navigateToViewTeam(team)}
teamName={team.name}
controller={
    <Menu style={{ flex: 0.1 }}>
        <MenuTrigger>
            <Icon1
                name='dots-horizontal'
                size={20}
                color={theme.colors.placeholder} />
        </MenuTrigger>

        <MenuOptions>
            <MenuOption onSelect={() => this.props.navigation.navigate('ViewTeam', { team: team })} style={{ flexDirection: 'row', padding: constants.ScreenWidth * 0.03 }}>
                <Text style={theme.customFontMSmedium.body}>Voir les détails</Text>
            </MenuOption>
            <MenuOption onSelect={() => this.props.navigation.navigate('EditTeam', { team: team })} style={{ flexDirection: 'row', padding: constants.ScreenWidth * 0.03 }}>
                <Text style={theme.customFontMSmedium.body}>Renommer l'équipe</Text>
            </MenuOption>
            <MenuOption onSelect={() => alert(`Voir`)} style={{ flexDirection: 'row', padding: constants.ScreenWidth * 0.03 }}>
                <Text style={[theme.customFontMSmedium.body]}>Supprimer</Text>
            </MenuOption>
            {/* <MenuOption onSelect={() => alert(`Not called`)} disabled={true} text='Supprimer' />
        </MenuOptions>
    </Menu>
*/
