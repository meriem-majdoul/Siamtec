

import React, { Component } from 'react';
import { StyleSheet, Text, View, Alert, FlatList, ScrollView } from 'react-native';
import { List, Card, Title, Paragraph, IconButton } from 'react-native-paper';
import firebase from '@react-native-firebase/app';

import * as theme from '../../core/theme';
import { constants } from '../../core/constants';
import { checkPlural, load, myAlert, setToast } from '../../core/utils';

// import { deleteTeam } from '../../api/firestore-api';

import Appbar from "../../components/Appbar";
import ListItem from '../../components/ListItem';
import EmptyList from '../../components/EmptyList';
import Loading from '../../components/Loading';
import Toast from '../../components/Toast';

const db = firebase.firestore()

export default class ViewTeam extends Component {

    constructor(props) {
        super(props);
        this.getMembersData = this.getMembersData.bind(this);
        this.addMembers = this.addMembers.bind(this);
        this.editDetails = this.editDetails.bind(this);
        // this.myAlert = myAlert.bind(this);
        // this.showAlert = this.showAlert.bind(this);
        this.teamId = this.props.navigation.getParam('teamId', null)

        this.state = {
            members: [],
            expanded: true,
            team: {},

            loading: false,
            toastMessage: '',
            toastType: '',
        }
    }

    async componentDidMount() {
        load(this, true)
        this.unsubscribe = await db.collection('Teams').doc(this.teamId).onSnapshot(async (doc) => {
            const team = doc.data()
            await this.getMembersData(team.members)
            this.setState({ team })
            load(this, false)
        })
    }

    componentWillUnmount() {
        this.unsubscribe()
    }

    async getMembersData(membersId) {
        if (membersId === []) return

        let members = []
        for (const memberId of membersId) {
            await db.collection('Users').doc(memberId).get().then((doc) => {
                let member = doc.data()
                member.id = doc.id
                members.push(member)
            })
        }

        this.setState({ members })
        return
    }

    renderTeam() {
        const { expanded, loading } = this.state
        return (
            <Card style={{ margin: 5, elevation: 2 }}>
                <List.Accordion
                    id={this.teamId}
                    titleComponent={<Text style={theme.customFontMSbold.header}>Membres</Text>}
                    expanded={expanded}
                    onPress={() => this.setState({ expanded: !expanded })}
                    theme={{ colors: { primary: '#333' } }}
                    titleStyle={theme.customFontMSsemibold.title}>

                    {loading ? <Loading style={{ margin: constants.ScreenWidth * 0.1 }} /> : this.renderMembers()}
                </List.Accordion>
            </Card>
        )
    }

    renderMembers() {
        let { members } = this.state

        if (members.length > 0)
            return members.map((member, key) => {
                return (
                    <ListItem
                        title={member.isPro ? member.denom : member.prenom + ' ' + member.nom}
                        description={member.role}
                        iconRightName='dots-horizontal'
                        left={props => {
                            if (member.role === 'Admin')
                                return <List.Icon {...props} icon="account-cog" />

                            else if (member.isPro)
                                return <List.Icon {...props} icon="briefcase" />

                            else if (!member.isPro && member.role !== 'Admin')
                                return <List.Icon {...props} icon="account" />
                        }}

                        menu
                        options={[
                            { id: 0, title: 'Voir le profil' },
                            { id: 1, title: "Retirer de l'équipe" },
                        ]}

                        functions={[
                            () => this.viewProfil(member.id),
                            () => this.removeMember(member.id),
                        ]}
                    />
                )
            })

        else return (
            <EmptyList iconName='account' iconStyle={{ width: 110, height: 110, marginBottom: 0 }} header='Aucun membre' description='' headerTextStyle={{ color: theme.colors.gray2, marginTop: 0 }} />
        )
    }

    //Buttons
    addMembers() {
        this.props.navigation.navigate('AddMembers', { teamId: this.teamId, existingMembers: this.state.team.members })
    }

    editDetails() {
        let { team } = this.state
        this.props.navigation.navigate('CreateTeam',
            {
                isEdit: true,
                title: "Modifier l'équipe",
                teamId: this.teamId,
                nom: team.name,
                description: team.description,
                existingMembers: this.state.team.members
            })
    }

    removeMember(memberId) {
        load(this, true)
        const batch = db.batch()

        const newMembers = this.state.team.members
        const index = newMembers.indexOf(memberId)
        newMembers.splice(index, 1)

        //1. Update Members of Team
        const teamRef = db.collection('Teams').doc(this.teamId)
        batch.update(teamRef, { members: newMembers })

        //2. Update users belonging to this team (attach them from it)
        const memberRef = db.collection('Users').doc(memberId)
        batch.update(memberRef, { hasTeam: false, teamId: '' })

        // Commit the batch
        batch.commit()
            .then(() => {
                load(this, false)
                console.log("Batch succeeded !")
            })
            .catch(e => {
                load(this, false)
                setToast(this, 'e', 'Erreur de connection avec la Base de données')
            })
    }

    viewProfil(userId) {
        this.props.navigation.navigate('Profile', { userId: userId })
    }

    // showAlert(team) {
    //     const title = "Supprimer l'équipe"
    //     const message = 'Etes-vous sûr de vouloir supprimer cette équipe ? Cette opération est irreversible.'
    //     const handleConfirm = async () => await deleteTeam(team).then(() => console.log('Batch succeeded !!!'))
    //     this.myAlert(title, message, handleConfirm)
    // }

    render() {
        let { toastMessage, toastType } = this.state

        return (
            <View style={{ flex: 1, backgroundColor: '#fff' }}>
                <Appbar back title titleText={this.state.team.name}
                    // del
                    // handleDelete={() => this.showAlert(this.state.team)}
                    controller
                    controllerIcon='account-plus'
                    handleAction={this.addMembers} />

                <ScrollView style={styles.container} >
                    <Card style={{ margin: 5, elevation: 2 }} onPress={this.editDetails}>
                        <Card.Content>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                <Title style={theme.customFontMSbold.header}>Informations générales</Title>
                                <IconButton icon="pencil" onPress={this.editDetails} size={25} color={theme.colors.primary} />
                            </View>
                            <Paragraph style={theme.customFontMSsemibold.body}>{this.state.team.name}</Paragraph>
                            <Paragraph style={theme.customFontMSregular.body}>{this.state.team.description}</Paragraph>
                        </Card.Content>
                    </Card>
                    {this.renderTeam()}
                </ScrollView >

                <Toast
                    containerStyle={{ bottom: 5 }}
                    message={toastMessage}
                    type={toastType}
                    onDismiss={() => this.setState({ toastMessage: '' })} />

            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    description: {
        fontSize: 15,
        color: "#646464",
    },
    title: {
        fontSize: 18,
        color: "#151515",
    },
});


