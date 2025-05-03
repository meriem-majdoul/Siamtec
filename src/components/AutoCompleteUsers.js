
import React from "react"
import { StyleSheet, Text, View, TextInput, TouchableHighlight, Dimensions } from "react-native"
import { Avatar } from 'react-native-paper'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import AutoTags from "react-native-tag-autocomplete"

import * as theme from "../core/theme";
import { constants } from "../core/constants";

import AvatarText from '../components/AvatarText'

const uri = "https://mobirise.com/bootstrap-template/profile-template/assets/images/timothy-paul-smith-256424-1200x800.jpg";

export default class AutoCompleteUsers extends React.Component {
    state = {
        tagsSelected: [],
    }

    customFilterData = query => {
        //override suggestion filter, we can search by specific attributes
        query = query.toUpperCase();
        let searchResults = this.props.suggestions.filter(s => {
            return (
                s.fullName.toUpperCase().includes(query) ||
                s.email.toUpperCase().includes(query)
            )
        })
        return searchResults;
    }

    customRenderTags = tags => {
        //override the tags render
        return (
            <View style={styles.customTagsContainer}>
                {this.props.tagsSelected.map((t, i) => {
                    return (
                        <TouchableHighlight
                            key={i.toString()}
                            onPress={() => this.handleDelete(i)}>
                            <View style={styles.customTag}>
                                <Text style={{ color: "white" }}> {t.fullName || t.email}</Text>
                                <Icon name="close" size={15} color='#fff' style={{ marginLeft: 3 }} />
                            </View>
                        </TouchableHighlight>
                    )
                })}
            </View>
        )
    }

    customRenderSuggestion = suggestion => {
        //override suggestion render the drop down
        const name = suggestion.fullName
        const email = suggestion.email

        return (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 15, borderBottomWidth: StyleSheet.hairlineWidth * 0.5, borderBottomColor: theme.colors.gray2 }}>
                <Text>{name}</Text>
                <AvatarText label={name.charAt(0)} size={35} />
            </View>
        )
    }

    handleDelete = index => {
        //tag deleted, remove from our tags array
        if (this.props.editable) {
            let tagsSelected = this.props.tagsSelected
            tagsSelected.splice(index, 1)
            this.props.main.setState({ tagsSelected })
        }
    }

    handleAddition = contact => {
        //suggestion clicked, push it to our tags array
        this.props.main.setState({ tagsSelected: this.props.main.state.tagsSelected.concat([contact]) })
    }

    onCustomTagCreated = userInput => {
    
        //user pressed enter, create a new tag from their input
        const contact = {
            email: userInput,
            fullName: null
        }
        this.handleAddition(contact)
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
                // autoFocus={this.props.autoFocus}
                style={styles.autotags}

                autoFocus={false}
                showInput={this.props.showInput}
                editable={this.props.editable}
                suggestionsBellow={this.props.suggestionsBellow}
                createTagOnSpace={false}

                containerStyle={[styles.containerStyle,
                    //theme.style.shadow
                ]}
                inputContainerStyle={styles.inputContainerStyle}
                listContainerStyle={styles.listContainerStyle}
                listStyle={[styles.listStyle, theme.style.shadow]}
                // renderTextInput={() => <TextInput 
                // placeholderTextColor="gray"
                // style={[theme.customFontMSregular.body, { color: '#000'}]} {...this.props} />}
            />
        )
    }
}

const styles = StyleSheet.create({
    customTagsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "flex-start",
        backgroundColor: "#fff",
        //paddingTop: 10,
        marginLeft: -5,
        width: 300
    },
    customTag: {
        flexDirection: 'row',
        backgroundColor: theme.colors.primary,
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
    inputContainerStyle: {
        marginLeft: -5,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: theme.colors.gray_extraLight,
        borderWidth: 0,
        paddingVertical: theme.padding/3
    },
    containerStyle: {
        minWidth: 200,
        maxWidth: constants.ScreenWidth - theme.padding,
        marginLeft: 6,
        shadowColor: theme.colors.secondary,
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2.22,
        elevation: 3,
    },
    listContainerStyle: {
        backgroundColor: "white",
        borderWidth: 0,
    },
    listStyle: {
        backgroundColor: 'white',
        margin: 0,
        paddingHorizontal: theme.padding / 2,
        borderWidth: 0,
    },
    autotags: {
        //backgroundColor: '#fff',
        //marginLeft: -constants.ScreenWidth * 0.02,
        // paddingTop: 5,
        // paddingBottom: 15,
        width: constants.ScreenWidth * 0.9,
        // borderBottomWidth: StyleSheet.hairlineWidth * 3,
        // borderBottomColor: theme.colors.gray_extraLight
    },
})

