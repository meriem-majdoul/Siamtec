//Create or Edit a team

import React, { Component } from 'react'
import { StyleSheet, Text, View, Keyboard } from 'react-native'

import moment from 'moment'
import 'moment/locale/fr'  // without this line it didn't work
moment.locale('fr')

import firebase from '@react-native-firebase/app'

import Appbar from "../../components/Appbar"
import MyInput from '../../components/TextInput'
import Toast from "../../components/Toast"
import Loading from '../../components/Loading'

import * as theme from '../../core/theme'
import { constants } from '../../core/constants'
import { nameValidator, updateField, generatetId, setToast, load } from "../../core/utils"
import { handleFirestoreError } from '../../core/exceptions'

const db = firebase.firestore()

export default class CreateTeam extends Component {

    constructor(props) {
        super(props);
        this.validateInputs = this.validateInputs.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)

        this.isEdit = this.props.navigation.getParam('isEdit', false)
        this.teamId = this.props.navigation.getParam('teamId', '')
        this.existingMembers = this.props.navigation.getParam('existingMembers', '')
        this.name = this.props.navigation.getParam('nom', '')
        this.description = this.props.navigation.getParam('description', '')

        this.title = this.props.navigation.getParam('title', 'Créer une équipe')
        this.currentUser = firebase.auth().currentUser
        this.initialState = {}

        this.state = {
            teamId: '', //Not editable
            name: { value: '', error: '' },
            description: { value: '', error: '' },

            loading: false,
            error: ''
        }
    }

    async componentDidMount() {
        if (!this.isEdit) {
            const teamId = generatetId('GS-EQ-')
            this.setState({ teamId })
        }

        else {
            const teamId = this.teamId
            const name = { value: this.name, error: '' }
            const description = { value: this.description, error: '' }
            this.setState({ teamId, name, description }, () => this.initialState = { teamId, name, description })
        }
    }

    componentWillUnmount() {
        Keyboard.dismiss()
    }

    validateInputs() {
        let { name } = this.state

        let nameError = nameValidator(name.value, `Nom de l'équipe`)

        if (nameError) {
            name.error = nameError
            Keyboard.dismiss()
            this.setState({ name, loading: false })
            return false
        }

        return true
    }

    handleSubmit() {
        if (this.state.loading || this.state === this.initialState) return

        load(this, true)

        //1. INPUTS VALIDATION
        const isValid = this.validateInputs()
        if (!isValid) return

        //2. ADDING TEAM DOCUMENT
        let { teamId, name, description } = this.state

        let team = {
            name: name.value,
            description: description.value,
            members: [],
            editedAt: moment().format('lll'),
            editedBy: { id: this.currentUser.uid, fullName: this.currentUser.displayName },
            deleted: false
        }

        if (this.isEdit) {
            team.members = this.existingMembers
        }

        if (!this.isEdit) {
            team.createdAt = moment().format('lll')
            team.createdBy = { id: this.currentUser.uid, fullName: this.currentUser.displayName }
        }

        console.log('Ready to set team...')
        db.collection('Teams').doc(teamId).set(team, { merge: true })

        if (this.isEdit)
            this.props.navigation.navigate('ViewTeam', { teamId: this.teamId, prevScreen: 'CreateTeam' })
        else
            this.props.navigation.navigate('AddMembers', { teamId: teamId, isCreation: true })
    }


    render() {
        let { teamId, name, description, members, loading, error } = this.state

        return (
            <View style={styles.container}>
                <Appbar back={!loading} close title titleText={this.title} check={!loading} handleSubmit={this.handleSubmit} />
                {loading ?
                    <Loading size='large' />
                    :
                    <View style={styles.formContainer}>
                        <MyInput
                            label="Identifiant de l'équipe"
                            value={teamId}
                            editable={false}
                            style={{ marginBottom: 15 }}
                            disabled
                        />

                        <MyInput
                            label="Nom de l'équipe"
                            returnKeyType="done"
                            value={name.value}
                            onChangeText={text => updateField(this, name, text)}
                            error={!!name.error}
                            errorText={name.error}
                            autoFocus={true}
                        />

                        <MyInput
                            label="Description de l'équipe"
                            returnKeyType="done"
                            value={description.value}
                            onChangeText={text => updateField(this, description, text)}
                            error={!!description.error}
                            errorText={description.error}
                            multiline={true}
                            numberOfLines={5}
                        />
                    </View>
                }
                <Toast message={error} onDismiss={() => this.setState({ error: '' })} />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background
    },
    formContainer: {
        elevation: 2,
        paddingHorizontal: constants.ScreenWidth * 0.1,
        paddingBottom: constants.ScreenWidth * 0.10,
        paddingTop: constants.ScreenWidth * 0.10,
        marginBottom: constants.ScreenHeight * 0.025,
        backgroundColor: theme.colors.surface
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