import React, { Component } from 'react';
import { StyleSheet, View, Keyboard } from 'react-native'
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons'
import _ from 'lodash'
import { connect } from 'react-redux'

import moment from 'moment';
import 'moment/locale/fr'
moment.locale('fr')

import Appbar from '../../components/Appbar'
import FormSection from '../../components/FormSection';
import Picker from "../../components/Picker";
import MyInput from '../../components/TextInput'
import Loading from "../../components/Loading";

import { db } from '../../firebase'
import * as theme from "../../core/theme";
import { issuesSubjects } from "../../core/constants";
import { generateId, myAlert, nameValidator, load, unformatDocument } from "../../core/utils";

import SuccessMessage from '../../components/SuccessMessage';

class Support extends Component {
    constructor(props) {
        super(props)

        this.handleSubmit = this.handleSubmit.bind(this)
        this.myAlert = myAlert.bind(this)

        this.initialState = {}
        this.IssueId = generateId('GS-ISS-')
        this.isEdit = false

        this.state = {
            subject: "Autre",
            description: "",
            descriptionError: "",

            createdAt: '',
            createdBy: { id: '', fullName: '' },
            editedAt: '',
            editedBy: { id: '', fullName: '' },

            error: '',
            loading: false,
            issuePublished: false,
        }
    }

    //VALIDATE
    validateInputs() {
        const { description } = this.state
        const descriptionError = nameValidator(description, '"Description"')
        if (descriptionError) {
            this.setState({ descriptionError, loading: false })
            return false
        }
        return true
    }

    async handleSubmit() {
        try {
            Keyboard.dismiss()

            const { error, loading } = this.state
            if (loading) return
            load(this, true)

            //1. Validate inputs
            const isValid = this.validateInputs()
            if (!isValid) return

            let props = ["subject", "description"]
            let issue = unformatDocument(this.state, props, this.props.currentUser, this.isEdit)

            db.collection('Issues').doc(this.IssueId).set(issue)

            //Show success message
            this.setState({ issuePublished: true, loading: false })
        }
        catch (e) {
            console.log("ERROR:::::", e)
        }
    }

    renderForm() {
        const { subject, description, descriptionError } = this.state
        return (
            <View style={styles.container}>
                <FormSection
                    sectionTitle='Informations générales'
                    sectionIcon={faInfoCircle}
                    form={
                        <View style={{ flex: 1 }}>
                            <MyInput
                                label="Numéro du problème"
                                returnKeyType="done"
                                value={this.IssueId}
                                editable={false}
                            />

                            <Picker
                                returnKeyType="next"
                                value={subject}
                                selectedValue={subject}
                                onValueChange={subject => this.setState({ subject })}
                                title="Sujet *"
                                elements={issuesSubjects}
                                containerStyle={{ marginBottom: 10 }}
                            />

                            <MyInput
                                label="Description du problème"
                                value={description}
                                onChangeText={description => this.setState({ description })}
                                error={!!descriptionError}
                                errorText={descriptionError}
                                multiline={true}
                            />
                        </View>
                    }
                />
            </View >
        )
    }

    renderSuccess() {
        const title = "Votre message a été envoyé !"
        const subHeading = "Nous vous remercions pour votre contribution dans le but d'améliorer d'avantage l'application Synergys. Un responsable traitera bientôt votre remarque."

        return (
            <View style={{ flex: 1 }}>
                <SuccessMessage
                    title={title}
                    subHeading={subHeading}
                />
            </View>
        )
    }

    render() {
        const { loading, issuePublished } = this.state
        const title = "Signaler un problème"

        return (
            <View style={styles.container}>
                <Appbar
                    back
                    title
                    titleText={title}
                    check={!loading && !issuePublished}
                    handleSubmit={this.handleSubmit}
                />
                {loading ?
                    <Loading size='large' />
                    :
                    issuePublished ?
                        this.renderSuccess()
                        :
                        this.renderForm()
                }
            </View >
        );
    }
}

const mapStateToProps = (state) => {
    return {
        role: state.roles.role,
        permissions: state.permissions,
        network: state.network,
        currentUser: state.currentUser
    }
}

export default connect(mapStateToProps)(Support)

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background
    }
})

