import React from 'react';
import { useNavigation } from '@react-navigation/native';
import ListRequests from './ListResquests';

const ListTickets = (props) => {
    const navigation = useNavigation();

    return (
        <ListRequests
            searchInput={props.searchInput}
            requestType="ticket"
            creationScreen="CreateTicketReq"
            offLine={props.offLine}
            permissions={props.permissions}
            role={props.role}
            navigation={navigation} // Passer navigation comme prop
        />
    );
};

export default ListTickets;
