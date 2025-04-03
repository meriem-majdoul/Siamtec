import React from 'react';
import ListRequests from './ListResquests';
import { useNavigation } from '@react-navigation/native'; // Utilisation du hook useNavigation

const ListProjects = (props) => {
    const navigation = useNavigation(); // Utiliser le hook useNavigation pour accéder à la navigation

    return (
        <ListRequests
            searchInput={props.searchInput}
            requestType="project"
            creationScreen="CreateProjectReq"
            offLine={props.offLine}
            permissions={props.permissions}
            role={props.role}
            navigation={navigation} // Passer l'objet navigation à ListRequests si nécessaire
        />
    );
};

export default ListProjects;
