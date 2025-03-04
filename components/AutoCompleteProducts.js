
import React from "react"
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from "react-native"
import { Avatar } from 'react-native-paper'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import AutoTags from "react-native-tag-autocomplete"
import firebase from '@react-native-firebase/app'

import * as theme from "../core/theme";
import { constants } from "../core/constants";
import { myAlert } from "../core/utils";

import { withNavigation } from 'react-navigation'

const uri = "https://mobirise.com/bootstrap-template/profile-template/assets/images/timothy-paul-smith-256424-1200x800.jpg";
const db = firebase.firestore()

class AutoCompleteProducts extends React.Component {
    constructor(props) {
        super(props)
        this.myAlert = myAlert.bind(this)

        this.state = {
            tagsSelected: [],
        }
    }

    customFilterData = query => {
        //override suggestion filter, we can search by specific attributes
        query = query.toUpperCase();
        let searchResults = this.props.suggestions.filter(susgestion => {
            return (
                // s.id.toUpperCase().includes(query) ||
                susgestion.name.toUpperCase().includes(query)
            )
        })
        return searchResults
    }

    customRenderTags = tags => {
        return (
            <View style={styles.customTagsContainer}>
                {this.props.tagsSelected.map((tag, i) => {
                    return <Text numberOfLines={1} style={{ color: "#000" }}>{tag.name}</Text>
                })}
                {this.props.errorText !== '' && <Text style={[theme.customFontMSregular.caption, styles.error]}>{errorText}</Text>}
            </View>
        )
    }

    viewProduct(ProductId) {
        console.log('PID', ProductId)
        this.props.navigation.navigate('CreateProduct', { ProductId: ProductId, onGoBack: (product) => console.log(product) })
    }


    showAlert(ProductId) {
        const title = "Supprimer l'article"
        const message = 'Etes-vous sûr de vouloir supprimer cet article ? Cette opération est irreversible.'
        const handleConfirm = () => this.handleDeleteProduct(ProductId)
        this.myAlert(title, message, handleConfirm)
    }

    async handleDeleteProduct(ProductId) {
        await db.collection('Products').doc(ProductId).update({ deleted: true })
            .then(async () => this.props.navigation.goBack())
            .catch((e) => console.error(e))
    }

    customRenderSuggestion = suggestion => {
        //override suggestion render the drop down
        const product = suggestion

        return (
            <View style={styles.suggestion}>
                <View>
                    <Text style={theme.customFontMSbold.body}>{product.name}</Text>
                    <Text style={[theme.customFontMSregular.body, { color: 'gray', marginTop: 10 }]}>Prix: <Text style={{ color: '#000' }}>€{product.price}</Text></Text>
                </View>
                <View style={{ justifyContent: 'space-between' }}>
                    <TouchableOpacity onPress={() => this.viewProduct(product.id)} style={{ flex: 0.5, marginBottom: 7, justifyContent: 'center', alignItems: 'center' }}>
                        <MaterialCommunityIcons name='pencil' size={19} color={theme.colors.graySilver} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.showAlert(product.id)} style={{ flex: 0.5, marginTop: 7, justifyContent: 'center', alignItems: 'center' }}>
                        <MaterialCommunityIcons name='delete' size={19} color={theme.colors.graySilver} />
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    handleDelete = index => {
        //tag deleted, remove from our tags array
        let tagsSelected = this.props.tagsSelected
        tagsSelected.splice(index, 1)
        this.props.main.setState({ tagsSelected })
    }

    handleAddition = product => {
        //suggestion clicked, push it to our tags array
        this.props.main.setState({ tagsSelected: this.props.main.state.tagsSelected.concat([product]), price: { value: product.price, error: '' }, quantity: { value: '1', error: '' }, taxe: { name: product.taxe, rate: product.taxe } })
    }

    onCustomTagCreated = userInput => {
        //user pressed enter, create a new tag from their input
        const product = {
            name: userInput,
            id: null,
        }
        this.handleAddition(product)
    }

    render() {
        return (
            <AutoTags
                //required
                suggestions={this.props.suggestions}
                tagsSelected={this.props.tagsSelected}
                handleAddition={this.handleAddition}
                handleDelete={this.handleDelete}
                //optional
                placeholder={this.props.placeholder}
                filterData={this.customFilterData}
                renderSuggestion={this.customRenderSuggestion}
                renderTags={this.customRenderTags}
                onCustomTagCreated={this.onCustomTagCreated}
                //handleEmptyDate= {() => console.log('Empty data..')}
                createTagOnSpace
                style={styles.autotags}
                listStyle={{ elevation: 3 }}
                autoFocus={this.props.autoFocus}
                showInput={this.props.showInput}
                suggestionsBellow={this.props.suggestionsBellow}
                editable={this.props.editable}
            />
        )
    }
}

export default withNavigation(AutoCompleteProducts)

const styles = StyleSheet.create({
    customTagsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "flex-start",
        alignItems: 'center',
        width: 300
    },
    customTag: {
        flexDirection: 'row',
        backgroundColor: theme.colors.secondary,
        justifyContent: "center",
        alignItems: "center",
        height: 30,
        marginLeft: 5,
        marginTop: 5,
        borderRadius: 30,
        padding: 8
    },
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    suggestion: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 10,
        // backgroundColor: 'pink'
        borderBottomWidth: StyleSheet.hairlineWidth * 0.5,
        borderBottomColor: theme.colors.gray2
    },
    autotags: {
        backgroundColor: '#fff',
        marginLeft: -constants.ScreenWidth * 0.025,
        paddingBottom: 15,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: theme.colors.gray
    },
    error: {
        paddingHorizontal: 4,
        paddingTop: 4,
        color: theme.colors.error
    }
})