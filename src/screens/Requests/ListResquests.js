import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, RefreshControl } from 'react-native';
import { List } from 'react-native-paper';
import { faTicketAlt } from '@fortawesome/free-solid-svg-icons';
import { useNavigation } from '@react-navigation/native';  // Utiliser le hook useNavigation
import SearchInput, { createFilter } from 'react-native-search-filter';

import ListSubHeader from '../../components/ListSubHeader';
import MyFAB from '../../components/MyFAB';
import RequestItem from '../../components/RequestItem';
import EmptyList from '../../components/EmptyList';
import { Loading } from '../../components';

import firebase, { db } from '../../firebase';
import * as theme from '../../core/theme';
import { constants } from '../../core/constants';
import { fetchDocs, fetchDocuments } from '../../api/firestore-api';
import { configureQuery } from '../../core/privileges';
import { countDown } from '../../core/utils';

const KEYS_TO_FILTERS = ['id', 'client.fullName', 'subject', 'state'];

const ListRequests = (props) => {
    const [requestsList, setRequestsList] = useState([]);
    const [requestsCount, setRequestsCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const navigation = useNavigation();  // Utilisation du hook useNavigation

    useEffect(() => {
        fetchRequests();
    }, []);  // Charger les demandes une seule fois au démarrage du composant

    const fetchRequests = async (count) => {
        setRefreshing(true);
        if (count) {
            await countDown(count);
        }

        const { queryFilters } = props.permissions;
        if (queryFilters.length === 0) {
            setRequestsList([]);
            setRequestsCount(0);
            setLoading(false);
            setRefreshing(false);
        } else {
            const params = { type: props.requestType };
            const query = configureQuery('Requests', queryFilters, params);
            const requestsList = await fetchDocuments(query);
            setRequestsList(requestsList);
            setRequestsCount(requestsList.length);
            setLoading(false);
            setRefreshing(false);
        }
    };

    const renderTicketRequest = (request) => {
        return <RequestItem request={request} requestType={props.requestType} chatId={request.chatId} />;
    };

    const s = requestsCount > 1 ? 's' : '';  // Cette ligne n'a pas besoin de redéclaration de `requestsCount`
    const filteredRequests = requestsList.filter(createFilter(props.searchInput, KEYS_TO_FILTERS));
    const { canCreate } = props.permissions;

    if (loading) return <Loading />;

    return (
        <View style={styles.container}>
            {requestsCount > 0 && <ListSubHeader>{requestsCount} nouvelle{s} demande{s}</ListSubHeader>}

            {requestsCount > 0 ? (
                <FlatList
                    enableEmptySections={true}
                    data={filteredRequests}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => renderTicketRequest(item)}
                    contentContainerStyle={{ paddingBottom: constants.ScreenHeight * 0.12 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => fetchRequests()}
                        />
                    }
                    
                />
            ) : (
                <EmptyList
                    icon={faTicketAlt}
                    iconColor={theme.colors.miRequests}
                    header="Aucune demande"
                    description="Appuyez sur le boutton '+' pour en créer une nouvelle."
                    offLine={props.offLine}
                />
            )}

            {canCreate && (
                <MyFAB
                    onPress={() =>
                        navigation.navigate(props.creationScreen, {
                            onGoBack: () => fetchRequests(2000),
                        })
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
      
    },
});

export default ListRequests;
