import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, FlatList, Text, RefreshControl } from 'react-native';
import { List } from 'react-native-paper';
import { faPen, faEnvelope } from '@fortawesome/free-solid-svg-icons';

import Background from '../../components/NewBackground';
import ListSubHeader from '../../components/ListSubHeader';
import MessageItem from '../../components/MessageItem';
import MyFAB from '../../components/MyFAB';
import EmptyList from '../../components/EmptyList';
import { Loading } from '../../components';

import firebase, { db } from '../../firebase';
import * as theme from '../../core/theme';
import { constants } from '../../core/constants';
import { configureQuery } from '../../core/privileges';

import { fetchDocs, fetchDocuments } from "../../api/firestore-api";
import { countDown } from '../../core/utils';

import { useNavigation } from '@react-navigation/native'; // Utilisation du hook useNavigation

const ListMessages = (props) => {
    const navigation = useNavigation(); // Récupération de l'objet navigation
    const [messagesList, setMessagesList] = useState([]);
    const [messagesCount, setMessagesCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const currentUser = firebase.auth().currentUser;

    useEffect(() => {
        fetchMessages();

        const willFocusSubscription = navigation.addListener('focus', () => {
            fetchMessages();
        });

        return () => {
            willFocusSubscription();
        };
    }, []);

    const fetchMessages = async (count) => {
        setRefreshing(true);
        if (count) {
            await countDown(count);
        }
        const { queryFilters } = props.permissions;
        if (queryFilters === []) {
            setMessagesList([]);
            setMessagesCount(0);
            setLoading(false);
        } else {
            const params = { role: props.role.value };
            const query = configureQuery('Messages', queryFilters, params);
            const messagesList = await fetchDocuments(query);
            setMessagesList(messagesList);
            setMessagesCount(messagesList.length);
            setLoading(false);
            setRefreshing(false);
        }
    };

    const renderMessage = (item) => {
        const message = item.item;

        return (
            <TouchableOpacity onPress={() => markAsReadAndNavigate(message)}>
                <MessageItem message={message} />
            </TouchableOpacity>
        );
    };

    const markAsReadAndNavigate = async (message) => {
        let haveRead = message.haveRead.find((id) => id === currentUser.uid);

        if (!haveRead) {
            let usersHaveRead = message.haveRead;
            usersHaveRead = usersHaveRead.concat([currentUser.uid]);
            db.collection('Messages').doc(message.id).update({ haveRead: usersHaveRead });
        }

        navigation.navigate('ViewMessage', { MessageId: message.id });
    };

    const { messagesCount: count, loading: isLoading } = { messagesCount, loading };
    const { canCreate } = props.permissions;

    const s = count > 1 ? 's' : '';

    return (
        <View style={{ flex: 1 }}>
            {isLoading ? (
                <Background>
                    <Loading size='large' />
                </Background>
            ) : (
                <Background showMotif={count < 5} style={styles.container}>
                    <ListSubHeader>{count} sujet{s}</ListSubHeader>

                    {count > 0 ? (
                        <FlatList
                            style={styles.root}
                            contentContainerStyle={{ paddingBottom: constants.ScreenHeight * 0.1 }}
                            data={messagesList}
                            extraData={{ messagesList, refreshing }}
                            keyExtractor={(item) => item.id}
                            renderItem={(item) => renderMessage(item)}
                            refreshControl={
                                <RefreshControl refreshing={refreshing} onRefresh={fetchMessages} />
                            }
                        />
                    ) : (
                        <EmptyList
                            icon={faEnvelope}
                            iconColor={theme.colors.miInbox}
                            header='Messages'
                            description="Aucun message pour le moment."
                            offLine={props.offLine}
                        />
                    )}

                    {canCreate && <MyFAB icon={faPen} onPress={() => navigation.navigate('NewMessage')} />}
                </Background>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    root: {
        zIndex: 1,
        backgroundColor: "#fff",
    },
});

const mapStateToProps = (state) => {
    return {
        role: state.roles.role,
        permissions: state.permissions,
        network: state.network,
    };
};

export default ListMessages;
