import React, { useState, useEffect } from 'react'
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert, RefreshControl } from 'react-native'
import { List } from 'react-native-paper'
import { faUsers } from '@fortawesome/free-solid-svg-icons'
import { useNavigation } from '@react-navigation/native'  // Importez useNavigation
import SearchInput, { createFilter } from 'react-native-search-filter'

import { db } from '../../firebase'
import * as theme from '../../core/theme'
import { constants } from '../../core/constants'
import { myAlert, checkPlural, load } from '../../core/utils'
import { fetchDocs, deleteTeam, fetchDocuments } from '../../api/firestore-api'

import ListSubHeader from '../../components/ListSubHeader'
import UserItem from '../../components/UserItem'
import EmptyList from '../../components/EmptyList'
import MyFAB from '../../components/MyFAB'
import Loading from '../../components/Loading'

const KEYS_TO_FILTERS = ['id', 'name']

const ListTeams = (props) => {
    const [teamsList, setTeamsList] = useState([])
    const [teamsCount, setTeamsCount] = useState(0)
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const navigation = useNavigation()  // Utilisez le hook useNavigation

    useEffect(() => {
        fetchTeams()
    }, [])

    const fetchTeams = async () => {
        setRefreshing(true)
        const query = db.collection('Teams').where('deleted', '==', false)
        const teamsList = await fetchDocuments(query)
        setTeamsList(teamsList)
        setTeamsCount(teamsList.length)
        setLoading(false)
        setRefreshing(false)
    }

    const viewTeam = (team) => {
        navigation.navigate('ViewTeam', { teamId: team.id })
    }

    const alertDeleteTeam = (team) => {
        const title = "Supprimer l'équipe"
        const message = 'Etes-vous sûr de vouloir supprimer cette équipe ? Cette opération est irreversible.'
        const handleConfirm = async () => await deleteTeam(team).then(() => console.log('Batch succeeded !!!'))
        myAlert(title, message, handleConfirm)
    }

    const renderTeam = (team) => {
        const { canDelete } = props.permissions

        return (
            <UserItem
                isTeam
                item={team}
                onPress={() => viewTeam(team)}
                options={[
                    { id: 0, title: "Voir l'équipe" },
                    { id: 1, title: "Supprimer l'équipe" },
                ]}
                functions={[
                    () => viewTeam(team),
                    () => {
                        if (!canDelete) Alert.alert('Action non autorisée', 'Seul un administrateur peut supprimer une équipe.')
                        else alertDeleteTeam(team)
                    },
                ]}
            />
        )
    }

    const filteredTeams = teamsList.filter(createFilter(props.searchInput, KEYS_TO_FILTERS))
    const { canCreate } = props.permissions

    return (
        <View style={styles.container}>
            {loading ? (
                <View style={styles.container}>
                    <Loading />
                </View>
            ) : (
                <View style={[styles.container, { paddingHorizontal: constants.ScreenWidth * 0.015 }]}>
                    {teamsCount > 0 && <ListSubHeader>{teamsCount} équipe{teamsCount > 1 ? 's' : ''}</ListSubHeader>}
                    {teamsCount > 0 ? (
                        <FlatList
                            enableEmptySections={true}
                            data={filteredTeams}
                            keyExtractor={item => item.id.toString()}
                            renderItem={({ item }) => renderTeam(item)}
                            style={{ paddingHorizontal: 15 }}
                            contentContainerStyle={{ paddingBottom: 75 }}
                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshing}
                                    onRefresh={fetchTeams}
                                />
                            }
                        />
                    ) : (
                        <EmptyList
                            icon={faUsers}
                            iconColor={theme.colors.miUsers}
                            header='Aucune équipe'
                            description='Gérez les équipes. Appuyez sur le bouton "+" pour en créer un nouvelle.'
                            offLine={props.offLine}
                        />
                    )}

                    {canCreate && <MyFAB onPress={() => navigation.navigate('CreateTeam')} />}
                </View>
            )}
        </View>
    )
}

export default ListTeams

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background
    },
    box: {
        padding: 20,
        marginBottom: 5,
        backgroundColor: 'white',
        flexDirection: 'row',
    },
    boxContent: {
        flex: 1,
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
