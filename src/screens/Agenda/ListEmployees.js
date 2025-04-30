//Conditionnal rendering depending on USER ROLE

import React from "react";
import { Text, StyleSheet, TouchableOpacity, View } from 'react-native'
import { connect } from 'react-redux'
import { db } from '../../firebase'
import { withNavigation } from 'react-navigation'

import TwoTabs from '../../components/TwoTabs'
// import SearchBar from '../../components/SearchBar'
import TabView from '../../components/TabView'

import ListUsers from '../Users/ListUsers'

import * as theme from "../../core/theme"
import { constants } from "../../core/constants"

class ListEmployees extends React.Component {

    constructor(props) {
        super(props);
    
        const { route } = this.props;
    
        this.onPressEmployee = this.onPressEmployee.bind(this);
        this.getEmployee = this.getEmployee.bind(this);
    
        // Accès aux paramètres via route?.params
        this.isRoot = route?.params?.isRoot ?? true;
        this.titleText = route?.params?.titleText ?? '';
    
        this.isProcess = route?.params?.isProcess ?? false;
        this.queryFilters = route?.params?.queryFilters ?? null;
        this.query = route?.params?.query ?? null;
        this.project = route?.params?.project ?? null;
    
        this.state = {
            showInput: false,
            searchInput: ''
        };
    }
    
    onPressEmployee(user) {
        if (this.isProcess)
            this.updateEmployee(user)
        else this.getEmployee(user)
    }

    getEmployee(user) {
        const { onGoBack } = this.props.route.params || {};
        if (onGoBack) onGoBack(user);
        this.props.navigation.goBack();
    }

    updateEmployee(user) {
        //1. Set user
        const { isPro, id, nom, prenom, role, email, phone } = user
        const fullName = isPro ? nom : `${prenom} ${nom}`
        const techContact = { id, fullName, email, role, phone }
        //2. Update
        db.collection("Projects").doc(this.project.id).update({ techContact })
        //3. Invoke onGoback
        this.props.navigation.state.params.onGoBack()
        //4. Go back
        this.props.navigation.goBack()
    }

    //Used during process
    formatQuery() {
        if (!this.queryFilters) return null
        let queryFilters = db.collection('Users')
        for (const item of this.queryFilters) {
            const { filter, operation, value } = item
            queryFilters = queryFilters.where(filter, operation, value)
        }
        return queryFilters
    }

    render() {
        const queryUsers = this.query || this.formatQuery() || db.collection('Users').where('deleted', '==', false)
   
     //   console.log("queryUsers", queryUsers)
        const { searchInput, showInput } = this.state
        const permissions = this.props.permissions.users
        const { isConnected } = this.props.network

        return (
            <View style={{ flex: 1 }}>
                {/* <SearchBar
                    menu={this.isRoot}
                    main={this}
                    title={!showInput}
                    titleText={this.titleText}
                    placeholder="Rechercher par nom, id, ou rôle"
                    showBar={showInput}
                    handleSearch={() => this.setState({ searchInput: '', showInput: !showInput })}
                    searchInput={searchInput}
                    searchUpdated={(searchInput) => this.setState({ searchInput })}
                /> */}

                <ListUsers
                    searchInput={searchInput}
                    prevScreen={this.props.prevScreen}
                    userType='utilisateur'
                    offLine={!isConnected}
                    permissions={permissions}
                    query={queryUsers}
                    //showButton 
                    onPress={this.onPressEmployee}
                    emptyListHeader='Aucun utilisateur disponible'
                    emptyListDesc="Veuillez créer un nouvel utilisateur via l'interface de gestion des utilisateurs." />
            </View>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        role: state.roles.role,
        permissions: state.permissions,
        network: state.network,
        //fcmToken: state.fcmtoken
    }
}

export default connect(mapStateToProps)(ListEmployees)









