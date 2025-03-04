
import React from "react"
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image } from "react-native"
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

class AutoCompleteBrands extends React.Component {
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
            </View>
        )
    }

    //#edit
    viewBrand(BrandId) {
        console.log('PID', BrandId)
        this.props.navigation.navigate('CreateBrand', { BrandId: BrandId, onGoBack: (brand) => console.log(brand) })
    }

    showAlert(BrandId) {
        const title = "Supprimer la marque"
        const message = 'Etes-vous sûr de vouloir supprimer cette marque ?'
        const handleConfirm = () => this.handleDeleteBrand(BrandId)
        this.myAlert(title, message, handleConfirm)
    }

    async handleDeleteBrand(BrandId) {
        await db.collection('Brands').doc(BrandId).delete()
            .then(async () => this.props.navigation.goBack())
            .catch((e) => console.error(e))
    }

    customRenderSuggestion = suggestion => {
        //override suggestion render the drop down
        const brand = suggestion

        return (
            <View style={styles.suggestion}>
                <View style={{ padding: 5 }}>
                    <Image source={{ uri: brand.logo.downloadURL }} style={{ width: 45, height: 45 }} />
                </View>

                <View style={{ marginLeft: 10 }}>
                    <Text style={theme.customFontMSsemibold.body}>{brand.name}</Text>
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

    handleAddition = brand => {
        //suggestion clicked, push it to our tags array
        this.props.main.setState({ tagsSelected: this.props.main.state.tagsSelected.concat([brand]), brandError: '' })
    }

    onCustomTagCreated = userInput => {
        //user pressed enter, create a new tag from their input
        const brand = {
            name: userInput,
        }
        this.handleAddition(brand)
    }

    render() {
        return (
            <View>
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
                {this.props.errorText !== '' && <Text style={[theme.customFontMSregular.caption, styles.error]}>{this.props.errorText}</Text>}
            </View>
        )
    }
}

export default withNavigation(AutoCompleteBrands)

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