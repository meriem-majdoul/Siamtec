import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { faBell } from '@fortawesome/free-solid-svg-icons';

import * as theme from '../../core/theme';
import { constants } from '../../core/constants';

import Background from '../../components/NewBackground';
import ListSubHeader from '../../components/ListSubHeader';
import NotificationItem from '../../components/NotificationItem';
import EmptyList from '../../components/EmptyList';
import MyFAB from '../../components/MyFAB';
import Loading from '../../components/Loading';

import firebase, { db } from '../../firebase';
import { fetchDocs, fetchDocuments } from "../../api/firestore-api";
import { load, myAlert } from "../../core/utils";

import { useNavigation } from '@react-navigation/native'; // Utilisation du hook useNavigation

const ListNotifications = (props) => {
    const navigation = useNavigation(); // Récupérer l'objet navigation
    const [notificationsList, setNotificationsList] = useState([]);
    const [notificationsCount, setNotificationsCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const currentUser = firebase.auth().currentUser;

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        setRefreshing(true);
        const collection = props.role.id === "client" ? "Clients" : "Users";
        let query = db
            .collection(collection)
            .doc(currentUser.uid)
            .collection('Notifications')
            .where('deleted', '==', false)
            .orderBy('sentAt', 'desc');
        
        const notificationsList = await fetchDocuments(query);

        setNotificationsList(notificationsList);
        setNotificationsCount(notificationsList.length);
        setLoading(false);
        setRefreshing(false);
    };

    const { notificationsCount: count, loading: isLoading } = { notificationsCount, loading };
    const s = count > 1 ? 's' : '';

    return (
        <View style={{ flex: 1 }}>
            {isLoading ? (
                <Background>
                    <Loading size="large" />
                </Background>
            ) : (
                <Background showMotif={count < 5} style={styles.container}>
                    <ListSubHeader style={{ marginBottom: 10 }}>{count} notification{s}</ListSubHeader>

                    {count > 0 ? (
                        <FlatList
                            style={styles.root}
                            contentContainerStyle={{ paddingBottom: constants.ScreenHeight * 0.1 }}
                            data={notificationsList}
                            extraData={{ notificationsList, refreshing }}
                            keyExtractor={(item) => item.id}
                            renderItem={(item) => <NotificationItem notification={item.item} navigation={navigation} />}
                            refreshControl={
                                <RefreshControl refreshing={refreshing} onRefresh={fetchNotifications} />
                            }
                        />
                    ) : (
                        <EmptyList icon={faBell} iconColor={theme.colors.miInbox} header="Notifications" description="Aucune notification pour le moment." offLine={props.offLine} />
                    )}
                </Background>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#ffffff",
    },
    root: {
        zIndex: 1,
        paddingHorizontal: theme.padding,
        backgroundColor: "#ffffff",
    },
});

export default ListNotifications;
