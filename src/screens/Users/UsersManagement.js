import React from "react";
import { Text, StyleSheet, TouchableOpacity, View } from 'react-native';
import { connect } from 'react-redux';
import { faUser, faUsers } from '@fortawesome/free-solid-svg-icons';

import TwoTabs from '../../components/TwoTabs';
import SearchBar from '../../components/SearchBar';
import TabView from '../../components/TabView';

import ListUsers from './ListUsers';
import ListTeams from './ListTeams';

import { db } from '../../firebase';
import * as theme from "../../core/theme";
import { constants } from "../../core/constants";
import { getRoleIdFromValue } from "../../core/utils";

class UsersManagement extends React.Component {
    constructor(props) {
        super(props);
        this.isRoot = this.props.route?.params?.isRoot ?? true;

        this.state = {
            index: 0,
            showInput: false,
            searchInput: '',
        };

        this.focusListener = null; // Pour stocker l'écouteur de focus
    }

    componentDidMount() {
        // Ajouter un écouteur pour rafraîchir les utilisateurs lors du focus
        this.focusListener = this.props.navigation.addListener('focus', () => {
            if (this.state.index === 0) {
                this.setState({ searchInput: '' }); // Réinitialiser la recherche
            }
        });
    }

    componentWillUnmount() {
        // Nettoyer l'écouteur
        if (this.focusListener) {
            this.focusListener();
        }
    }

    viewProfile(user) {
        const { id, role } = user;
        const roleId = getRoleIdFromValue(role);

        // Navigation vers le profil de l'utilisateur avec ses paramètres
        this.props.navigation.navigate('ProfileStack', {
            screen: 'Profile',
            params: { user: { id, roleId } },
        });
    }

    render() {
        const queryUsers = db.collection('Users').where('deleted', '==', false);
        const routes = [
            { key: 'first', title: 'UTILISATEURS' },
            { key: 'second', title: 'ÉQUIPES' },
        ];

        const { index, searchInput } = this.state;
        const permissionsUsers = this.props.permissions.users;
        const permissionsTeams = this.props.permissions.teams;
        const { isConnected } = this.props.network;

        return (
            <View style={{ flex: 1 }}>
                <SearchBar
                    menu={this.isRoot}
                    main={this}
                    title={!this.state.showInput}
                    placeholder={index === 0 ? 'Rechercher par nom, id, ou rôle' : 'Rechercher une équipe'}
                    showBar={this.state.showInput}
                    handleSearch={() => this.setState({ searchInput: '', showInput: !this.state.showInput })}
                    searchInput={this.state.searchInput}
                    searchUpdated={(searchInput) => this.setState({ searchInput })}
                />

                <TabView
                    navigationState={{ index, routes }}
                    onIndexChange={(index) => this.setState({ index, searchInput: '', showInput: false })}
                    icon1={faUser}
                    icon2={faUsers}
                    Tab1={
                        <ListUsers
                            searchInput={searchInput}
                            prevScreen='UsersManagement'
                            userType='utilisateur'
                            menu
                            offLine={!isConnected}
                            permissions={permissionsUsers}
                            query={queryUsers}
                            showButton
                            onPress={(user) => this.viewProfile(user)}
                            emptyListHeader='Aucun utilisateur'
                            emptyListDesc='Gérez les utilisateurs. Appuyez sur le boutton, en bas à droite, pour en créer un nouveau.'
                        />
                    }
                    Tab2={
                        <ListTeams
                            searchInput={searchInput}
                            offLine={!isConnected}
                            permissions={permissionsTeams}
                        />
                    }
                />
            </View>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        role: state.roles.role,
        permissions: state.permissions,
        network: state.network,
    };
};

export default connect(mapStateToProps)(UsersManagement);
