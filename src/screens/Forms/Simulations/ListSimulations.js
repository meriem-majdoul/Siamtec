import React from "react";
import { Text, StyleSheet, TouchableOpacity, View } from 'react-native'
import { connect } from 'react-redux'
import { faUser, faAddressCard, fal, faFileInvoice, faVial, faVials } from '@fortawesome/free-solid-svg-icons'

import TwoTabs from '../../../components/TwoTabs'
import SearchBar from '../../../components/SearchBar'
import TabView from '../../../components/TabView'
import EmptyList from "../../../components/EmptyList";

import ListUsers from '../../Users/ListUsers'

import { db } from '../../../firebase'
import * as theme from "../../../core/theme"; 
import { constants } from "../../../core/constants";
import ListFormsContainer from "../../../containers/ListFormsContainer";
import SimulationItem from "../../../components/genForms/SimulationItem";
import { setStatusBarColor } from "../../../core/redux";


class ListSimulations extends React.Component {

    constructor(props) {
        super(props)
        this.renderItem = this.renderItem.bind(this)
        this.onPressItem = this.onPressItem.bind(this)
        const { route } = this.props;

        // Récupération des paramètres via route?.params
        this.titleText = route?.params?.titleText ?? 'Simulations';
        this.isRoot = route?.params?.isRoot ?? true;
        this.project = route?.params?.project ?? undefined;
        this.autoGenPdf = route?.params?.autoGenPdf ?? false; // Pour la génération de PDF
        this.docType = route?.params?.docType ?? ''; // Pour la génération de PDF
        this.popCount = route?.params?.popCount ?? 1; // Pour la génération de PDF
        this.state = {
            index: 0,
            showInput: false,
            searchInput: '',
        }
    }

    componentDidMount() {
        setStatusBarColor(this, { backgroundColor: theme.colors.background, barStyle: "dark-content" })
    }

    renderItem(item) {
        return (
            <SimulationItem
                simulation={item}
                onPress={() => this.onPressItem(item)}
                nameSir={item.nameSir}
                nameMiss={item.nameMiss} />
        )
    }

    onPressItem(item) {
        const { navigation, route } = this.props;
    
        if (this.isRoot) {
            navigation.navigate('CreateSimulation', {
                SimulationId: item.id,
            });
        } else {
            navigation.navigate('CreateSimulation', {
                SimulationId: item.id,
                autoGenPdf: true,
                docType: this.docType,
                project: route.params?.project ?? '',
                DocumentId: route.params?.DocumentId ?? '',
                popCount: this.popCount,
                onGoBack: route.params?.onGoBack ?? null,
            });
        }
    }
    

    render() {
        const { index, searchInput, showInput } = this.state
        const { isConnected } = this.props.network
        const query = this.project ? db.collection('Simulations').where('project.id', '==', this.project.id) : db.collection('Simulations').orderBy('createdAt', 'desc')
        const emptyListDesc = this.isRoot ? 'Appuyez sur le boutton "+" pour faire une simulation.' : "Veuillez créer une fiche EEB à partir d'une nouvelle simulation."

        return (
            <View style={{ flex: 1 }}>
                <ListFormsContainer
                    titleText="Simulations"
                    collection='Simulations'
                    query={query}
                    creationScreen="CreateSimulation"
                    navigation={this.props.navigation}
                    renderItem={this.renderItem}
                    countTitle="simulation"
                    KEYS_TO_FILTERS={['id']}
                    isRoot={this.isRoot}
                    emptyList={
                        <EmptyList
                            icon={faVials}
                            header='Aucune simulation'
                            description={emptyListDesc}
                            offLine={!isConnected}
                        />
                    }
                />
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

export default connect(mapStateToProps)(ListSimulations)










