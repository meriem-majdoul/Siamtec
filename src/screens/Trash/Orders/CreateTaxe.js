import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, Image, TouchableOpacity, Keyboard } from 'react-native';
import { Card, Title, FAB, ProgressBar, List } from 'react-native-paper'

import * as theme from '../../../core/theme';
import { constants } from '../../../core/constants';

import Appbar from '../../../components/Appbar'
import AutoCompleteProducts from '../../../components/AutoCompleteProducts'
import MyInput from '../../../components/TextInput'
import Picker from "../../../components/Picker"
import Loading from "../../../components/Loading"

import { updateField, nameValidator, setToast, load } from "../../../core/utils";
import firebase from '@react-native-firebase/app';
import { handleFirestoreError } from '../../../core/exceptions';

const db = firebase.firestore()

export default class CreateTask extends Component {
    constructor(props) {
        super(props)
        this.handleSubmit = this.handleSubmit.bind(this)

        this.state = {
            name: { value: "", error: '' },
            rate: { value: '', error: '' },
        }
    }

    validateInputs() {
        let { name, rate } = this.state

        let nameError = nameValidator(rate.value, `"Nom de la taxe"`)
        let rateError = nameValidator(rate.value, `"Valeur"`)

        if (nameError || rateError) {
            Keyboard.dismiss()
            name.error = nameError
            rate.error = rateError
            this.setState({ name, rate, loading: false })
            return false
        }

        return true
    }

    async handleSubmit() {
        //Handle Loading or No edit done
        if (this.state.loading) return

        load(this, true)

        //0. Validate inputs
        const isValid = this.validateInputs()
        if (!isValid) return

        // 1. ADDING product to firestore
        let { name, rate } = this.state

        const taxe = {
            name: name.value,
            rate: Number(rate.value),
        }

        await db.collection('Taxes').doc().set(taxe).catch((e) => {
            load(this, false)
            handleFirestoreError(e)
        })

        load(this, false)
        this.props.navigation.goBack()
    }

    render() {
        const { name, rate, loading } = this.state

        return (
            <View style={styles.container}>
                <Appbar back={!loading} title titleText='Nouvelle taxe' check={!loading} handleSubmit={this.handleSubmit} />

                {loading ?
                    <Loading size='large' />
                    :
                    <Card style={{ margin: 10, paddingVertical: 10, paddingHorizontal: 5 }}>
                        <Card.Content>
                            <MyInput
                                label="Nom de la taxe"
                                returnKeyType="done"
                                value={name.value}
                                onChangeText={text => updateField(this, name, text)}
                                error={!!name.error}
                                errorText={name.error}
                                multiline={true} />

                            <MyInput
                                label="Valeur (%)"
                                returnKeyType="done"
                                keyboardType='numeric'
                                value={rate.value}
                                onChangeText={text => updateField(this, rate, text)}
                                error={!!rate.error}
                                errorText={rate.error}
                            />
                        </Card.Content>
                    </Card>

                }

            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    plusIcon: {
        flex: 0.1,
        padding: 5,
        justifyContent: 'flex-start',
        alignItems: 'center',
    }
})

