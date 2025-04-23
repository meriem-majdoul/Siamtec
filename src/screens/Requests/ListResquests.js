import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  RefreshControl
} from 'react-native';
import { faTicketAlt } from '@fortawesome/free-solid-svg-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import SearchInput, { createFilter } from 'react-native-search-filter';

import ListSubHeader from '../../components/ListSubHeader';
import MyFAB from '../../components/MyFAB';
import RequestItem from '../../components/RequestItem';
import EmptyList from '../../components/EmptyList';
import { Loading } from '../../components';

import * as theme from '../../core/theme';
import { constants } from '../../core/constants';
import { fetchDocuments } from '../../api/firestore-api';
import { configureQuery } from '../../core/privileges';
import { countDown } from '../../core/utils';

const KEYS_TO_FILTERS = ['id', 'client.fullName', 'subject', 'state'];

const ListRequests = (props) => {
  const [requestsList, setRequestsList] = useState([]);
  const [requestsCount, setRequestsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const navigation = useNavigation();

  const fetchRequests = useCallback(async (delayMs) => {
    setRefreshing(true);
    if (delayMs) {
      await countDown(delayMs);
    }
    const { queryFilters } = props.permissions;
    if (!queryFilters.length) {
      setRequestsList([]);
      setRequestsCount(0);
      setLoading(false);
      setRefreshing(false);
      return;
    }
    const params = { type: props.requestType };
    const query = configureQuery('Requests', queryFilters, params);
    try {
      const docs = await fetchDocuments(query);
      setRequestsList(docs);
      setRequestsCount(docs.length);
    } catch (err) {
      console.error('fetchRequests error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [props.permissions, props.requestType]);

  // 1) Chargement initial
  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // 2) Rechargement automatique au "focus" (retour sur cet écran)
  useFocusEffect(
    useCallback(() => {
      fetchRequests();
    }, [fetchRequests])
  );

  const filteredRequests = requestsList.filter(
    createFilter(props.searchInput, KEYS_TO_FILTERS)
  );
  const { canCreate } = props.permissions;
  const plural = requestsCount > 1 ? 's' : '';

  if (loading) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      {requestsCount > 0 && (
        <ListSubHeader>
          {requestsCount} nouvelle{plural} demande{plural}
        </ListSubHeader>
      )}

      {requestsCount > 0 ? (
        <FlatList
          data={filteredRequests}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <RequestItem
              request={item}
              requestType={props.requestType}
              chatId={item.chatId}
            />
          )}
          contentContainerStyle={{
            paddingBottom: constants.ScreenHeight * 0.12
          }}
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
          description="Appuyez sur le bouton '+' pour en créer une nouvelle."
          offLine={props.offLine}
        />
      )}

      {canCreate && (
        <MyFAB
          onPress={() =>
            navigation.navigate(props.creationScreen)
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background
  }
});

export default ListRequests;
