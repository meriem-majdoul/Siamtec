import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, Image, TouchableOpacity, Keyboard } from 'react-native';
import { Card, Title, FAB, ProgressBar, List } from 'react-native-paper'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { connect } from 'react-redux'

import * as theme from '../../core/theme';
import { constants } from '../../core/constants';

import Appbar from '../../components/Appbar'
import AutoCompleteProducts from '../../components/AutoCompleteProducts'
import MyInput from '../../components/TextInput'
import Picker from "../../components/Picker"

import { updateField, nameValidator, arrayValidator, priceValidator, setToast, load } from "../../core/utils";
import { fetchDocs } from '../../api/firestore-api';
import firebase from '@react-native-firebase/app';

const db = firebase.firestore()

class AddItem extends Component {
    constructor(props) {
        super(props)
        this.fetchDocs = fetchDocs.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
        this.handleDelete = this.handleDelete.bind(this)
        this.refreshProduct = this.refreshProduct.bind(this)

        this.orderLine = this.props.navigation.getParam('orderLine', null)
        this.orderKey = this.props.navigation.getParam('orderKey', '')
        this.isEdit = this.orderLine ? true : false

        this.state = {
            item: { id: '', name: '' },
            description: { value: "", error: '' },
            quantity: { value: '', error: '' },
            price: { value: '', error: '' },
            taxe: { name: '', rate: '', value: '' },

            tagsSelected: [],
            suggestions: [],
        }
    }

    async componentDidMount() {
        if (this.isEdit) {
            console.log('order line:', this.orderLine)
            let { description, quantity, price, taxe, tagsSelected } = this.state
            description.value = this.orderLine.description
            quantity.value = this.orderLine.quantity
            price.value = this.orderLine.price
            taxe = this.orderLine.taxe
            tagsSelected.push(this.orderLine.product)

            this.setState({ description, quantity, price, taxe, tagsSelected })
        }

        load(this, true)
        this.fetchSuggestions()
    }

    fetchSuggestions() {
        const query = db.collection('Products')
        this.fetchDocs(query, 'suggestions', '', () => { load(this, false) })
    }

    validateInputs() {
        let { tagsSelected, tagsSelectedError, quantity, price } = this.state

        let tagsError = arrayValidator(tagsSelected, `"Article"`)
        let quantityError = nameValidator(quantity.value, `"Quantité"`)
        let priceError = priceValidator(price.value)

        if (tagsError || quantityError || priceError) {
            Keyboard.dismiss()
            tagsSelectedError = tagsError
            quantity.error = quantityError
            price.error = priceError
            this.setState({ tagsSelected, quantity, price, loading: false })
            return false
        }

        return true
    }

    handleSubmit() {
        //Handle Loading or No edit done
        if (this.state.loading || this.state === this.initialState) return

        load(this, true)

        //0. Validate inputs
        const isValid = this.validateInputs()
        if (!isValid) return

        // 1. ADDING product to firestore
        let { tagsSelected, description, quantity, price, taxe } = this.state
        const taxeValue = (taxe.rate / 100) * price.value * quantity.value
        taxe.value = taxeValue

        let orderLine = {
            product: tagsSelected[0],
            description: description.value,
            quantity: quantity.value,
            price: price.value,
            taxe: taxe
        }

        this.props.navigation.state.params.onGoBack(orderLine, this.orderKey)
        this.props.navigation.goBack()
    }

    handleDelete() {
        this.setState({ tagsSelected: [], price: { value: '', error: '' } })
    }

    refreshProduct(product) {
        this.setState({ tagsSelected: [product], price: { value: product.price, error: '' }, quantity: { value: '1', error: '' } })
    }

    render() {
        const { item, description, suggestions, tagsSelected, quantity, price, taxe, loading } = this.state
        const noItemSelected = tagsSelected.length === 0

        const { isConnected } = this.props.network

        return (
            <View style={styles.container}>
                <Appbar back={!loading} title titleText='Ligne de commande' check={!loading} handleSubmit={this.handleSubmit} />

                <Card style={{ margin: 10, paddingVertical: 10, paddingHorizontal: 5 }}>
                    <Card.Content>
                        <Text style={[theme.customFontMSsemibold.caption, { color: theme.colors.primary }]}>Article</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>

                            <View style={{ flex: 0.9 }}>
                                <AutoCompleteProducts
                                    // placeholder={noItemSelected ? 'Écrivez pour choisir un article' : ''}
                                    placeholder='Écrivez pour choisir un article'
                                    suggestions={suggestions}
                                    tagsSelected={tagsSelected}
                                    main={this}
                                    autoFocus={false}
                                    showInput={noItemSelected}
                                    errorText=''
                                    suggestionsBellow={true}
                                />
                            </View>

                            {noItemSelected ?
                                <TouchableOpacity style={styles.plusIcon} onPress={() => this.props.navigation.navigate('CreateProduct', { onGoBack: this.refreshProduct })}>
                                    <MaterialCommunityIcons name='plus' color={theme.colors.primary} size={21} />
                                </TouchableOpacity>
                                :
                                <TouchableOpacity style={[styles.plusIcon, { paddingTop: 0 }]} onPress={this.handleDelete}>
                                    <MaterialCommunityIcons name='close' color={theme.colors.placeholder} size={21} />
                                </TouchableOpacity>
                            }
                        </View>

                        <MyInput
                            label="Description"
                            returnKeyType="done"
                            value={description.value}
                            onChangeText={text => updateField(this, description, text)}
                            error={!!description.error}
                            errorText={description.error}
                            multiline={true} />

                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ flex: 0.5, paddingRight: 15 }}>
                                <MyInput
                                    label="Quantité"
                                    returnKeyType="done"
                                    keyboardType='numeric'
                                    value={quantity.value}
                                    onChangeText={text => updateField(this, quantity, text)}
                                    error={!!quantity.error}
                                    errorText={quantity.error}
                                />
                            </View>

                            <View style={{ flex: 0.5, paddingLeft: 15 }}>
                                <MyInput
                                    label="Prix unitaire"
                                    returnKeyType="done"
                                    keyboardType='numeric'
                                    value={price.value}
                                    onChangeText={text => updateField(this, price, text)}
                                    error={!!price.error}
                                    errorText={price.error}
                                />
                            </View>
                        </View>

                        <View>
                            <MyInput
                                label="Taxe (%)"
                                returnKeyType="done"
                                keyboardType='numeric'
                                value={taxe.name}
                                onChangeText={rate => {
                                    let { taxe } = this.state
                                    taxe.name = rate
                                    taxe.rate = Number(rate)
                                    this.setState({ taxe })
                                }}
                            />
                        </View>

                    </Card.Content>
                </Card>

            </View>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        role: state.roles.role,
        network: state.network
        //fcmToken: state.fcmtoken
    }
}

export default connect(mapStateToProps)(AddItem)

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

