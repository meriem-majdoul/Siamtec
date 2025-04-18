

import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableHighlight,
    Alert,
    FlatList,
    TouchableOpacity,
    ScrollView
} from 'react-native';
// import { FAB } from 'react-native-paper';
import { List } from 'react-native-paper';


import { Button } from 'native-base';
import Icon1 from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon2 from '@fortawesome/free-solid-svg-icons';
import Icon3 from 'react-native-vector-icons/Entypo';
import Icon4 from 'react-native-vector-icons/Feather';
import * as theme from '../../../core/theme';
import firebase from '@react-native-firebase/app';
import { color } from 'react-native-reanimated';
import { constants } from '../../../core/constants';
import UserItem from '../../../components/UserItem';

const db = firebase.firestore()

export default class ListTeams extends Component {

    constructor(props) {
        super(props);
        this.navigateToCreateTeam = this.navigateToCreateTeam.bind(this);
        this.getMembers = this.getMembers.bind(this);

        this.state = {
            teamsList: [],
            members: [],
            teamsCount: 0,
            expandedId: ''
        }
    }

    async componentDidMount() {
        this.setState({ loading: true })
        await this.getTeams()
    }

    componentDidUpdate() {
        console.log(this.state.teamsList)
    }

    eventClickLister = (viewId) => {
        Alert.alert("Navigate to profile of Nom Prénom")
    }

    navigateToCreateTeam() {
        this.props.navigation.navigate('CreateTeam')
    }

    async getTeams() {
        console.log('Getting users...')
        await db.collection('Teams').onSnapshot((querysnapshot) => {
            let teamsList = []
            let teamsCount = 0

            querysnapshot.forEach((doc) => {
                let id = doc.id
                let team = doc.data()
                team.id = id
                teamsList.push(team)
                teamsCount = teamsCount + 1
            })

            this.setState({ teamsList, teamsCount })

        })
            .then(() => console.log('Teams list retrieved'))
            .catch((err) => alert(err))
            .finally(() => this.setState({ loading: false }))
    }

    async getMembers(teamId) {
        console.log('teamId ' + teamId)
        await db.collection('Teams').doc(teamId).get().then((teamDoc) => {
            let membersId = teamDoc.data().members
            console.log(membersId)

            let members = []
            membersId.forEach((memberId) => {
                db.collection('Users').doc(memberId).get().then((userDoc) => {
                    let m = userDoc.data()
                    members.push(m)
                    this.setState({ members })
                })
            })
        }).then(() => this.setState({ expandedId: teamId }))
    }

    renderMembers() {
        return this.state.members.map((member, key) => {
            return (
                <UserItem 
                main= {this}
                item={member} 
                iconStyle= {{}}
                onPress= {() => Alert.alert('Item pressed')}/>
            )
        })
    }

    renderTeams() {

        return (
            <List.AccordionGroup
                expandedId={1}
                onAccordionPress={(expandedId) => {
                    this.getMembers(expandedId)
                }}>


                {this.state.teamsList.map((team, key) => {
                    return (
                        <List.Accordion
                            id={team.id}
                            titleComponent={team.name}
                            theme={{ colors: { primary: '#333' } }}
                            titleStyle={theme.customFontMSsemibold.header}
                            left={props => <Icon4 name= 'users' size = {18} color = {theme.colors.icon} style= {{marginHorizontal: 15}}/>}>
                            {this.renderMembers()}

                        </List.Accordion>
                    )
                })
                }

            </List.AccordionGroup>
        )
    }

    render() {
        let { teamsCount } = this.state
        const arr = [{ id: 'team1', name: 'team1', members: ['Synergys-utilisateur-2'], createdAt: '20 Oct 2020' }]

        let text = ''
        if (teamsCount === 1)
            text = 'équipe'

        else text = 'équipes'


        return (
            <ScrollView style={styles.container} >
                <View style={{ padding: constants.ScreenWidth * 0.04, justifyContent: 'space-between', paddingLeft: constants.ScreenWidth * 0.04 }}>
                    {teamsCount > 0 && <Text style={[theme.customFontMSsemibold.body, { color: theme.colors.gray }]}>{teamsCount} {text}</Text>}
                </View>

                { this.renderTeams()}

            </ScrollView >
        );
    }
}

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