
import React from "react"
import { StyleSheet, Text, View, TextInput, TouchableHighlight } from "react-native"
import { Avatar } from 'react-native-paper'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import AutoTags from "react-native-tag-autocomplete"

import * as theme from "../core/theme";
import { constants } from "../core/constants";

const uri = "https://mobirise.com/bootstrap-template/profile-template/assets/images/timothy-paul-smith-256424-1200x800.jpg";

export default class AutoCompleteInput extends React.Component {
    state = {
        tagsSelected: [],
    }

    customFilterData = query => {
        //override suggestion filter, we can search by specific attributes
        query = query.toUpperCase();
        let searchResults = this.props.suggestions.filter(s => {
            return (
                s.toUpperCase().includes(query)
            )
        })
        return searchResults
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
                                <Text style={{ color: "white" }}> {t}</Text>
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
        const name = suggestion

        return (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 5, paddingVertical: 15, borderBottomWidth: StyleSheet.hairlineWidth * 0.5, borderBottomColor: theme.colors.gray2 }}>
                <Text>{name}</Text>
            </View>
        )
    }

    handleDelete = index => {
        //tag deleted, remove from our tags array
        let tagsSelected = this.props.tagsSelected
        tagsSelected.splice(index, 1)
        this.props.main.setState({ tagsSelected })
    }

    handleAddition = contact => {
        //suggestion clicked, push it to our tags array
        this.props.main.setState({ tagsSelected: this.props.main.state.tagsSelected.concat([contact]) })
    }

    onCustomTagCreated = userInput => {
        //user pressed enter, create a new tag from their input
        const team = userInput
        this.handleAddition(team)
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
                placeholder="Ajouter une équipe"
                filterData={this.customFilterData}
                renderSuggestion={this.customRenderSuggestion}
                renderTags={this.customRenderTags}
                onCustomTagCreated={this.onCustomTagCreated}
                style={{ backgroundColor: '#fff', marginLeft: -constants.ScreenWidth * 0.025, paddingBottom: 15, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.gray }}
               // autoFocus={this.props.autoFocus}
                autoFocus={false}
                showInput={this.props.showInput}
                createTagOnSpace={false}
            // renderTextInput={() => <TextInput style={[theme.customFontMSregular.body, { color: theme.colors.gray_light }]} {...this.props} />}
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
        paddingTop: 10,
        marginLeft: -5,
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
})