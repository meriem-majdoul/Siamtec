import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, Image, ScrollView, FlatList } from 'react-native';
import { List } from 'react-native-paper';

import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons'

import MyFAB from './MyFAB'
import Button from './Button'

import * as theme from '../core/theme';
import { constants } from '../core/constants';
import { myAlert } from '../core/utils'
import { fetchDocs, fetchDocuments, fetchMessages } from '../api/firestore-api';

import { withNavigation } from 'react-navigation'

class CustomList extends Component {
    constructor(props) {
        super(props)
        this.myAlert = myAlert.bind(this)
        // this.fetchDocs = fetchDocs.bind(this)
        // this.filterMessages = this.filterMessages.bind(this)

        this.state = {
            List: [],
            Count: 0
        }
    }

    async componentDidMount() {
        const query = this.props.query
        //this.fetchDocs(query, 'List', 'Count', () => { })
        const List = await fetchDocuments(query)
        this.setState({ List, Count: List.length, loading: false })
    }

    render() {
        let { Count } = this.state

        let s = ''
        if (Count > 1)
            s = 's'

        return (
            <View style={styles.container}>
                {Count > 0 && <List.Subheader>{Count} {this.props.itemLabel}{s}</List.Subheader>}
                <FlatList
                    style={styles.root}
                    contentContainerStyle={{ paddingBottom: constants.ScreenHeight * 0.1 }}
                    data={this.state.List}
                    extraData={this.state}
                    keyExtractor={(item) => { return item.id }}
                    renderItem={(item) => this.props.renderItem(item)}
                />
                <MyFAB icon={this.props.fabIcon} onPress={() => this.props.navigation.navigate(this.props.creationScreen)} />
            </View >
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    root: {
        backgroundColor: "#fff",
    }
})

export default withNavigation(CustomList)