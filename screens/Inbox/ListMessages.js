import React, { Component } from 'react'
import { StyleSheet, View, TouchableOpacity, FlatList } from 'react-native'
import { List } from 'react-native-paper';
import { withNavigation } from 'react-navigation'
import firebase from '@react-native-firebase/app'

import MessageItem from '../../components/MessageItem'
import MyFAB from '../../components/MyFAB'
import EmptyList from '../../components/EmptyList'

import * as theme from '../../core/theme'
import { constants } from '../../core/constants'

import { fetchDocs } from "../../api/firestore-api";

const db = firebase.firestore()

class ListMessages extends Component {
    constructor(props) {
        super(props)
        this.fetchDocs = fetchDocs.bind(this)
        this.markAsReadAndNavigate = this.markAsReadAndNavigate.bind(this)
        this.currentUser = firebase.auth().currentUser

        this.state = {
            messagesList: [],
            messagesCount: 0,
        }
    }

    async componentDidMount() {
        const query = db.collection('Messages').where('subscribers', 'array-contains', this.currentUser.uid)
        //.orderBy('sentAt', 'DESC')
        this.fetchDocs(query, 'messagesList', 'messagesCount', () => { })
    }


    renderMessage(item) {
        const message = item.item

        return (
            <TouchableOpacity onPress={() => this.markAsReadAndNavigate(message)}>
                <MessageItem message={message} />
            </TouchableOpacity>
        )
    }

    markAsReadAndNavigate = async (message) => {
        let haveRead = message.haveRead.find((id) => id === this.currentUser.uid)

        if (!haveRead) {
            let usersHaveRead = message.haveRead
            usersHaveRead = usersHaveRead.concat([this.currentUser.uid])
            await db.collection('Messages').doc(message.id).update({ haveRead: usersHaveRead })
        }

        this.props.navigation.navigate('ViewMessage', { message: message })
    }


    render() {
        let { messagesCount } = this.state

        const s = messagesCount > 1 ? 's' : ''

        return (
            <View style={styles.container}>
                <List.Subheader>{messagesCount} message{s}</List.Subheader>
                {messagesCount > 0 ?
                    < FlatList
                        style={styles.root}
                        contentContainerStyle={{ paddingBottom: constants.ScreenHeight * 0.1 }}
                        data={this.state.messagesList}
                        extraData={this.state}
                        keyExtractor={(item) => { return item.id }}
                        renderItem={(item) => this.renderMessage(item)}
                    />
                    :
                    <EmptyList iconName='email' header='Messages' description="Vous n'avez aucun message pour le moment." offLine={this.props.offLine} />
                }
                <MyFAB icon='pencil' onPress={() => this.props.navigation.navigate('NewMessage')} />
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


export default withNavigation(ListMessages)