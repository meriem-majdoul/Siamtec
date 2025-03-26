//Create or Edit a team

import React, { Component } from 'react'
import { StyleSheet, Text, View, Keyboard } from 'react-native'
import _ from 'lodash'
import { connect } from 'react-redux'
import moment from 'moment'
import 'moment/locale/fr'  // without this line it didn't work
moment.locale('fr')

import Appbar from "../../components/Appbar"
import MyInput from '../../components/TextInput'
import Toast from "../../components/Toast"
import Loading from '../../components/Loading'

import firebase, { db, auth } from '../../firebase'
import * as theme from '../../core/theme'
import { constants } from '../../core/constants'
import { nameValidator, updateField, generateId, setToast, load } from "../../core/utils"
import { handleFirestoreError } from '../../core/exceptions'

class CreateTeam extends Component {

    constructor(props) {
        super(props);
        this.validateInputs = this.validateInputs.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)

        this.teamId = this.props.navigation.getParam('teamId', '')
        this.isEdit = this.teamId ? true : false
        this.teamId = this.isEdit ? this.teamId : generateId('GS-EQ-')

        this.existingMembers = this.props.navigation.getParam('existingMembers', '')
        this.name = this.props.navigation.getParam('nom', '')
        this.description = this.props.navigation.getParam('description', '')
        this.title = this.props.navigation.getParam('title', 'Créer une équipe')

        this.state = {
            name: { value: this.name, error: '' },
            description: { value: this.description, error: '' },
            loading: false,
        }

        this.initialState = _.cloneDeep(this.state)
    }

    validateInputs() {
        let { name } = this.state
        const nameError = nameValidator(name.value, `Nom de l'équipe`)
        if (nameError) {
            name.error = nameError
            Keyboard.dismiss()
            this.setState({ name, loading: false })
            return false
        }
        return true
    }

    handleSubmit() {
        if (this.state.loading || _.isEqual(this.state, this.initialState)) return
        load(this, true)

        //1. INPUTS VALIDATION
        const isValid = this.validateInputs()
        if (!isValid) return

        //2. ADDING TEAM DOCUMENT
        const { name, description } = this.state
        const { currentUser } = this.props

        let team = {
            name: name.value,
            description: description.value,
            members: [],
            editedAt: moment().format(),
            editedBy: currentUser,
            deleted: false
        }

        if (this.isEdit) {
            team.members = this.existingMembers
        }

        else {
            team.createdAt = moment().format()
            team.createdBy = currentUser
        }

        db.collection('Teams').doc(this.teamId).set(team, { merge: true })

        if (this.isEdit)
            this.props.navigation.navigate('ViewTeam', { teamId: this.teamId, prevScreen: 'CreateTeam' })
        else
            this.props.navigation.navigate('AddMembers', { teamId: this.teamId, isCreation: true })
    }


    render() {
        const { name, description, members, loading, error } = this.state

        return (
            <View style={styles.container}>
                <Appbar close={!loading} title titleText={this.title} check={!loading} handleSubmit={this.handleSubmit} />
                {loading ?
                    <Loading size='large' />
                    :
                    <View style={styles.formContainer}>
                        {this.isEdit &&
                            <MyInput
                                label="Identifiant de l'équipe"
                                value={this.teamId}
                                editable={false}
                                disabled
                            />
                        }

                        <MyInput
                            label="Nom de l'équipe *"
                            returnKeyType="done"
                            value={name.value}
                            onChangeText={text => updateField(this, name, text)}
                            error={!!name.error}
                            errorText={name.error}
                            autoFocus={false}
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

const mapStateToProps = (state) => {
    return {
        role: state.roles.role,
        currentUser: state.currentUser
        // permissions: state.permissions,
        // network: state.network,
        //fcmToken: state.fcmtoken
    }
}

export default connect(mapStateToProps)(CreateTeam)

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background
    },
    formContainer: {
        paddingHorizontal: theme.padding * 1.2,
        paddingBottom: constants.ScreenWidth * 0.10,
        paddingTop: 25,
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
})