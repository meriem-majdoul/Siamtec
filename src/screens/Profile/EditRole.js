
import React, { Component } from 'react'
import { StyleSheet, Alert, View } from 'react-native'
import { connect } from 'react-redux'

import Appbar from '../../components/Appbar'
import AddressSearch from '../../components/AddressSearch'
import Picker from "../../components/Picker";
import Toast from "../../components/Toast"
import Loading from "../../components/Loading"

import { displayError, isEditOffline, load } from "../../core/utils"
import { setCurrentUser, setRole } from "../../core/redux"
import * as theme from "../../core/theme"
import { constants, errorMessages, roles } from '../../core/constants'
import firebase, { functions, db } from '../../firebase'


class EditRole extends Component {

    constructor(props) {
        super(props)
        this.handleSubmit = this.handleSubmit.bind(this)
        this.setCustomClaim = this.setCustomClaim.bind(this)

        this.prevScreen = this.props.navigation.getParam('prevScreen', '')
        this.userId = this.props.navigation.getParam('userId', '')
        this.currentRole = this.props.navigation.getParam('currentRole', '')
        this.dataCollection = this.props.navigation.getParam('dataCollection', 'Users')

        this.state = {
            role: '',
            loading: false,
        }
    }

    componentDidMount() {
        this.setState({ role: this.currentRole })
    }

    async handleSubmit() {
        try {
            const { isConnected } = this.props.network
            let isEditOffLine = isEditOffline(this.isEdit, isConnected)
            if (isEditOffLine) {
                load(this, false)
                return
            }

            const { loading, role } = this.state
            if (this.currentRole === role || loading) return
            load(this, true)
            await this.setCustomClaim()
        }
        catch (err) {
            console.log(err)
        }
        finally{
            load(this, false)
        }
    }

    setCustomClaim() {
        const setCustomClaim = functions.httpsCallable('setCustomClaim')
        return setCustomClaim({ role: this.state.role, userId: this.userId })
            .then(async result => {
                try { 
                    const { role } = this.state
                    const { currentUser } = firebase.auth()
                    //Update redux state
                    let currUser = this.props.currentUser
                    currUser.role = role
                    setCurrentUser(this, currUser)

                    await db.collection(this.dataCollection).doc(this.userId).update({ role })
                    if (this.userId === currentUser.uid) {
                        currentUser.getIdToken(true)
                        for (const role of roles) {
                            if (role.value === this.state.role.toLocaleLowerCase())
                                setRole(this, role)
                        }
                    }
                    this.props.navigation.state.params.onGoBack('success', 'Le rôle a été modifié avec succès')
                    this.props.navigation.goBack()
                }
                catch (e) {
                    throw new Error(e)
                }
            })
            .catch(err => { throw new Error(err) })
    }

    render() {
        let { role, loading, toastMessage, toastType } = this.state

        return (
            <View style={{ flex: 1, backgroundColor: '#fff' }}>
                <Appbar back={!loading} title titleText="Changer le rôle" check={!loading} handleSubmit={this.handleSubmit} />

                {loading ?
                    <Loading size='large' />
                    :
                    <View style={{ flex: 1, padding: 20 }}>
                        <Picker
                            label="Rôle"
                            returnKeyType="next"
                            value={role}
                            selectedValue={role}
                            onValueChange={(role) => this.setState({ role })}
                            title="Type d'utilisateur"
                            elements={roles}
                        />
                    </View>
                }

                <Toast
                    containerStyle={{ bottom: constants.ScreenWidth * 0.6 }}
                    message={toastMessage}
                    type={toastType}
                    onDismiss={() => this.setState({ toastMessage: '' })} />
            </View>
        )
    }
}

const mapStateToProps = (state) => {

    return {
        role: state.roles.role,
        currentUser: state.currentUser,
        network: state.network
        //fcmToken: state.fcmtoken
    }
}

export default connect(mapStateToProps)(EditRole)


const styles = StyleSheet.create({
    dialogContainer: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: "center",
        justifyContent: "center",
    }
})