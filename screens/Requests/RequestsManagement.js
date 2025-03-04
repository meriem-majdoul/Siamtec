//Conditionnal rendering depending on USER ROLE

import React, { memo } from "react";
import { Text, StyleSheet, TouchableOpacity } from 'react-native'
import { FAB } from 'react-native-paper'
import Animated from 'react-native-reanimated';
import { connect } from 'react-redux'

import Appbar from '../../components/Appbar'
import SearchBar from '../../components/SearchBar'
import TabView from '../../components/TabView'

import ListProjects from './ListProjects';
import ListTickets from './ListTickets';

import * as theme from "../../core/theme";
import { constants } from "../../core/constants";
import { View } from "react-native-ui-lib";
import TwoTabs from "../../components/TwoTabs";

const initialLayout = { width: constants.ScreenWidth }

class RequestsManagement extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            index: 0,
            showInput: false,
            searchInput: ''
        }
    }

    render() {

        const routes = [
            { key: 'first', title: 'PROJETS' },
            { key: 'second', title: 'TICKETS' },
        ]

        const { index, showInput, searchInput } = this.state
        const permissionsRequests = this.props.permissions.requests
        const { isConnected } = this.props.network

        return (
            <View style={{ flex: 1 }}>
                <SearchBar
                    main={this} 
                    title={!showInput}
                    titleText='Demandes'
                    placeholder='Rechercher une demande'
                    showBar={this.state.showInput}
                    handleSearch={() => this.setState({ searchInput: '', showInput: !this.state.showInput })}
                    searchInput={this.state.searchInput}
                    searchUpdated={(searchInput) => this.setState({ searchInput })}
                />

                <TabView
                    navigationState={{ index, routes }}
                    onIndexChange={(index) => this.setState({ index, searchInput: '', showInput: false })}

                    Tab1={<ListProjects searchInput={searchInput} offLine={!isConnected} permissions={permissionsRequests} role= {this.props.role}/>}
                    Tab2={<ListTickets searchInput={searchInput} offLine={!isConnected} permissions={permissionsRequests} role= {this.props.role}/>} />
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

export default connect(mapStateToProps)(RequestsManagement)










