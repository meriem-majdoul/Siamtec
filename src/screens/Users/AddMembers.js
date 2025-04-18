//Create or Edit a team

import React, { Component } from 'react'
import { StyleSheet, Text, View, TextInput, FlatList, Keyboard } from 'react-native'
import { List, Checkbox } from 'react-native-paper'

import moment from 'moment'
import 'moment/locale/fr'
moment.locale('fr')

import Appbar from "../../components/Appbar"
import SearchBar from "../../components/SearchBar"
import EmptyList from "../../components/EmptyList"
import Button from "../../components/Button"
import Toast from "../../components/Toast"
import UserItem from '../../components/UserItem'
import Loading from '../../components/Loading'

import { db } from '../../firebase'
import * as theme from '../../core/theme'
import { constants } from '../../core/constants'
import { load } from "../../core/utils"

import SearchInput, { createFilter } from 'react-native-search-filter'
import { handleFirestoreError } from '../../core/exceptions'
// import { faUsers, faUser } from '@fortawesome/free-solid-svg-icons'

const KEYS_TO_FILTERS = ['id', 'fullName', 'nom', 'prenom', 'denom']

export default class AddMembers extends Component {

    constructor(props) {
        super(props);
        this.getFreeUsers = this.getFreeUsers.bind(this)
        this.validateInputs = this.validateInputs.bind(this)
        this.addMembers = this.addMembers.bind(this)
        this.dismiss = this.dismiss.bind(this)

        const { route } = this.props;
        const { isCreation, teamId, existingMembers } = route.params || {};
    
        this.isCreation = isCreation || false; // create or edit data
        this.teamId = teamId || ''; // team ID
        this.existingMembers = existingMembers || []; // existing members list

        this.state = {
            title: 'Ajouter des membres',
            searchInput: '',
            showInput: false,

            nom: { value: '', error: '' },
            description: { value: '', error: '' },

            members: [],
            expanded: true,

            loading: false,
            error: ''
        }
    }

    componentDidMount() {
        Keyboard.dismiss()
        load(this, true)
        this.getFreeUsers()
    }

    componentWillUnmount() {
        this.unsubscribe()
    }

    getFreeUsers() {
        const query = db
            .collection('Users')
            .where('hasTeam', '==', false)
            .where('deleted', '==', false)
            
        this.unsubscribe = query.onSnapshot((querysnapshot) => {
            let members = []
            let membersCount = 0
            querysnapshot.forEach((doc) => {
                let user = {}
                user.isPro = doc.data().isPro
                user.role = doc.data().role
                user.nom = doc.data().nom
                user.prenom = doc.data().prenom
                user.denom = doc.data().denom
                user.id = doc.id
                user.checked = false
                members.push(user)
                membersCount = membersCount + 1
            })
            this.setState({ members, membersCount, loading: false })
        })
    }

    renderMember(member, key) {
        let { members } = this.state

        const check = (key) => {
            members[key].checked = !members[key].checked
            this.setState({ members })
        }

        return (
            <UserItem
                item={member}
                onPress={check.bind(this, key)}
                userType='utilisateur'
                controller={
                    <Checkbox
                        status={members[key].checked ? 'checked' : 'unchecked'}
                        onPress={check.bind(this, key)}
                        color={theme.colors.primary}
                    />
                }
            />
        )
    }

    validateInputs() {
        let { members } = this.state

        let selectedMembers = members.filter((member) => member.checked === true)
        selectedMembers = selectedMembers.map((member) => member.id)

        let membersError = ''
        if (selectedMembers.length === 0)
            membersError = 'Erreur, une équipe doit contenir au moins un membre.'

        if (membersError)
            this.setState({ error: membersError })

        return membersError
    }

    addMembers = async () => {
        let { error, loading } = this.state
        let { members } = this.state
        const batch = db.batch()

        if (loading) return
        load(this, true)

        //1. INPUTS VALIDATION
        const membersError = this.validateInputs()
        if (membersError) return

        //2. ADDING TEAM DOCUMENT
        console.log('add member')
        let selectedMembers = []
        selectedMembers = members.filter((member) => member.checked === true)
        selectedMembers = selectedMembers.map((member) => member.id)

        //2. Update new members documents
        for (const memberId of selectedMembers) {
            const memberRef = db.collection('Users').doc(memberId)
            batch.update(memberRef, { hasTeam: true, teamId: this.teamId })
        }

        if (!this.isCreation)
            selectedMembers = selectedMembers.concat(this.existingMembers)

        //1. Update Members of Team
        const teamRef = db.collection('Teams').doc(this.teamId)
        batch.update(teamRef, { members: selectedMembers })

        // Commit the batch
        batch.commit()
        this.dismiss()
    }

    dismiss() {
        if (this.isCreation)
            this.props.navigation.pop(2)

        else
            this.props.navigation.navigate('ViewTeam', { teamId: this.teamId })
    }

    render() {
        let { searchInput, title, nom, description, members, membersCount, loading, error } = this.state

        const filteredMembers = members.filter(createFilter(this.state.searchInput, KEYS_TO_FILTERS))

        if (loading)
            return (
                <View style={styles.container}>
                    <Appbar title titleText='Ajout des membres...' />
                    <Loading />
                </View>
            )

        else return (
            <View style={styles.container}>

                {membersCount > 0 ?
                    <SearchBar
                        menu={false}
                        main={this}
                        title={!this.state.showInput}
                        titleText={title}
                        placeholder='Rechercher un utilisateur'
                        magnifyStyle={{ right: constants.ScreenWidth * 0.12 }}
                        showBar={this.state.showInput}
                        handleSearch={() => this.setState({ searchInput: '', showInput: !this.state.showInput })}
                        searchInput={this.state.searchInput}
                        searchUpdated={(searchInput) => this.setState({ searchInput })}
                        check
                        handleSubmit={this.addMembers}
                    />
                    :
                    <Appbar back title titleText={title} check handleSubmit={this.dismiss} />
                }

                {
                    this.isCreation &&
                    <View style={{ paddingTop: 15, marginBottom: 15, paddingHorizontal: 15 }}>
                        <Text style={theme.customFontMSregular.body}>Votre équipe a été crée</Text>
                        <Text style={[theme.customFontMSregular.caption, { color: theme.colors.gray_dark, marginTop: 10 }]}>Rassemblez les personnes qui vont contribuer ensemble dans la réalisation de projets.</Text>
                    </View>
                }

                {membersCount > 0 ?
                    <FlatList
                        enableEmptySections={true}
                        data={filteredMembers}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item, index }) => this.renderMember(item, index)}
                        style={{ paddingHorizontal: theme.padding, paddingTop: theme.padding }}
                        contentContainerStyle={{ paddingBottom: constants.ScreenHeight * 0.12 }} />
                    :
                    <EmptyList  header='Aucun membre disponible' description='Veuillez libérer des membres de leurs équipes, ou ajoutez de nouveaux utilisateurs.' />
                    // <EmptyList icon={faUser} header='Aucun membre disponible' description='Veuillez libérer des membres de leurs équipes, ou ajoutez de nouveaux utilisateurs.' />
                }
                <Toast message={error} onDismiss={() => this.setState({ error: '' })} containerStyle={{ bottom: constants.ScreenHeight * 0.05 }} />

                {membersCount === 0 &&
                    <Button
                        mode="contained"
                        onPress={() => this.props.navigation.navigate('UsersManagement')}
                        style={{ position: 'absolute', bottom: 0, marginVertical: 0, borderRadius: 0 }}>
                        <Text style={theme.customFontMSbold.body}>Libérer/Créer un utilisateur</Text>
                    </Button>
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
    fab: {
        flex: 1,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
        width: 50,
        height: 50,
        borderRadius: 100,
    },
    button: {
        width: '80%',
        alignSelf: 'center',
        bottom: 0
    }
});



/* <List.Accordion
title="Accordion 1"
id='team1'
title="Team 1"
theme={{ colors: { primary: '#333' } }}
titleStyle={theme.customFontMSsemibold.header}>
{this.renderMembers()}
</List.Accordion> */


// {this.state.teamsList.map((team, key) => {
//     <List.Accordion
//         id={team.id}
//         title={team.name}
//         theme={{ colors: { primary: '#333' } }}
//         titleStyle={theme.customFontMSsemibold.header}>
//         {this.renderMembers()}
//     </List.Accordion>
// })
// }