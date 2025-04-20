import React from "react";
import { Text, StyleSheet, TouchableOpacity, View } from 'react-native'
import { connect } from 'react-redux'
import { faUser, faAddressCard, fal, faFileInvoice, faVial, faVials, faHandHoldingUsd } from '@fortawesome/free-solid-svg-icons'

import TwoTabs from '../../../components/TwoTabs'
import SearchBar from '../../../components/SearchBar'
import TabView from '../../../components/TabView'
import EmptyList from "../../../components/EmptyList";

import ListUsers from '../../Users/ListUsers'

import { db } from '../../../firebase'
import * as theme from "../../../core/theme";
import { constants } from "../../../core/constants";
import ListFormsContainer from "../../../containers/ListFormsContainer";
// import SimulationItem from "../../../components/SimulationItem";
import { setStatusBarColor } from "../../../core/redux";
import MandatMPRItem from "../../../components/genForms/MandatMPRItem";


class ListMandatsMPR extends React.Component {

    constructor(props) {
        super(props)
        this.renderItem = this.renderItem.bind(this)
        this.onPressItem = this.onPressItem.bind(this)

        const { route } = this.props;
        const { titleText, isRoot, project, autoGenPdf, docType, popCount } = route.params || {};
    
        this.titleText = titleText || 'Simulations';
        this.isRoot = isRoot !== undefined ? isRoot : true;
        this.project = project || undefined;
        this.autoGenPdf = autoGenPdf || false;
        this.docType = docType || '';
        this.popCount = popCount || 1;

        this.state = {
            index: 0,
            showInput: false,
            searchInput: '',
        }
    }

    componentDidMount() {
        setStatusBarColor(this, { backgroundColor: theme.colors.primary, barStyle: "dark-content" })
    }

    renderItem(item) {
        return (
            <MandatMPRItem
                mandat={item}
                onPress={() => this.onPressItem(item)}
                applicantName={`${item.applicantFirstName} ${item.applicantLastName}`} />
        )
    }

    onPressItem(item) {
        const { navigation, route } = this.props;
        const { project, DocumentId, onGoBack } = route.params || {}; // Récupère les paramètres si disponibles
    
        if (this.isRoot) {
            navigation.navigate('CreateMandatMPR', {
                MandatMPRId: item.id
            });
        } else {
            navigation.navigate('CreateMandatMPR', {
                MandatMPRId: item.id,
                autoGenPdf: true,
                docType: this.docType,
                project: project || '', // Valeur par défaut ''
                DocumentId: DocumentId || '',
                popCount: this.popCount,
                onGoBack: onGoBack || null
            });
        }
    }
    

    render() {
        const { index, searchInput, showInput } = this.state
        const { isConnected } = this.props.network
        const query = this.project ? db.collection('MandatsMPR').where('project.id', '==', this.project.id) : db.collection('MandatsMPR').orderBy('createdAt', 'desc')
        const emptyListDesc = this.isRoot ? 'Appuyez sur le boutton "+" pour créer un mandat MaPrimeRénov.' : "Veuillez créer un mandat MaPrimeRénov à partir d'un nouveau formulaire."

        return (
            <View style={{ flex: 1 }}>
                <ListFormsContainer
                    titleText="Mandats MPR"
                    collection='MandatsMPR'
                    query={query}
                    creationScreen="CreateMandatMPR"
                    navigation={this.props.navigation}
                    fetchItems={this.fetchItems}
                    renderItem={this.renderItem}
                    countTitle="mandat"
                    KEYS_TO_FILTERS={['id']}
                    isRoot={this.isRoot}
                    emptyList={
                        <EmptyList
                            icon={faHandHoldingUsd}
                            header='Aucun mandat MaPrimeRénov'
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

export default connect(mapStateToProps)(ListMandatsMPR)










