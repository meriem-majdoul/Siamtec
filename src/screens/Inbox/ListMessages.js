import React, { Component } from 'react'
import { StyleSheet, View, TouchableOpacity, FlatList, Text, RefreshControl } from 'react-native'
import { List } from 'react-native-paper';
import { withNavigation } from 'react-navigation'
import { faPen, faEnvelope } from 'react-native-vector-icons/FontAwesome5'

import Background from '../../components/NewBackground'
import ListSubHeader from '../../components/ListSubHeader'
import MessageItem from '../../components/MessageItem'
import MyFAB from '../../components/MyFAB'
import EmptyList from '../../components/EmptyList'
import { Loading } from '../../components';

import firebase, { db } from '../../firebase'
import * as theme from '../../core/theme'
import { constants } from '../../core/constants'
import { configureQuery } from '../../core/privileges'

import { fetchDocs, fetchDocuments } from "../../api/firestore-api";
import { countDown } from '../../core/utils';

class ListMessages extends Component {
    constructor(props) {
        super(props)
        this.fetchMessages = this.fetchMessages.bind(this)
        this.markAsReadAndNavigate = this.markAsReadAndNavigate.bind(this)
        this.currentUser = firebase.auth().currentUser

        this.state = {
            messagesList: [],
            messagesCount: 0,
            loading: true,
            refreshing: false
        }
    }

    componentWillUnmount() {
        if (this.willFocusSubscription)
            this.willFocusSubscription.remove()
    }

    async componentDidMount() {
        await this.fetchMessages()
        this.willFocusSubscription = this.props.navigation.addListener('willFocus', async () => {
            await this.fetchMessages()
        })
    }

    async fetchMessages(count) {
        this.setState({ refreshing: true })
        if (count) {
            await countDown(count)
        }
        const { queryFilters } = this.props.permissions
        if (queryFilters === [])
            this.setState({ messagesList: [], messagesCount: 0, loading: false })
        else {
            const params = { role: this.props.role.value }
            const query = configureQuery('Messages', queryFilters, params)
            const messagesList = await fetchDocuments(query)
            this.setState({
                messagesList,
                messagesCount: messagesList.length,
                loading: false,
                refreshing: false
            })
        }
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
            db.collection('Messages').doc(message.id).update({ haveRead: usersHaveRead })
        }

        this.props.navigation.navigate('ViewMessage', { MessageId: message.id }) 
    }


    render() {
        let { messagesCount, loading } = this.state
        const { canCreate } = this.props.permissions

        const s = messagesCount > 1 ? 's' : ''

        return (
            <View style={{ flex: 1 }}>

                {loading ?
                    <Background>
                        <Loading size='large' />
                    </Background>
                    :
                    <Background showMotif={messagesCount < 5} style={styles.container}>
                        <ListSubHeader>{messagesCount} sujet{s}</ListSubHeader>

                        {messagesCount > 0 ?
                            < FlatList
                                style={styles.root}
                                contentContainerStyle={{ paddingBottom: constants.ScreenHeight * 0.1 }}
                                data={this.state.messagesList}
                                extraData={this.state}
                                keyExtractor={(item) => { return item.id }}
                                renderItem={(item) => this.renderMessage(item)}
                                refreshControl={
                                    <RefreshControl
                                        refreshing={this.state.refreshing}
                                        onRefresh={this.fetchMessages}
                                    />
                                }
                            />
                            :
                            <EmptyList
                                icon={faEnvelope}
                                iconColor={theme.colors.miInbox}
                                header='Messages'
                                description="Aucun message pour le moment."
                                offLine={this.props.offLine}
                            />
                        }
                        {canCreate &&
                            <MyFAB icon={faPen} onPress={() => this.props.navigation.navigate('NewMessage')} />
                        }
                    </Background >
                }
            </View>

        )

    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    root: {
        zIndex: 1,
        backgroundColor: "#fff",
    }
})



const mapStateToProps = (state) => {
    return {
        role: state.roles.role,
        permissions: state.permissions,
        network: state.network,
        //fcmToken: state.fcmtoken
    }
}

export default withNavigation(ListMessages)
