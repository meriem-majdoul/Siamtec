import React from "react";
import { Text, StyleSheet, TouchableOpacity, View } from 'react-native'
import { connect } from 'react-redux'
import { faUser, faAddressCard, fal, faFileInvoice, faVial, faVials, faHandHoldingUsd, faSave } from '@fortawesome/free-solid-svg-icons'

import TwoTabs from '../../../components/TwoTabs'
import SearchBar from '../../../components/SearchBar'
import TabView from '../../../components/TabView'
import EmptyList from "../../../components/EmptyList";

import ListUsers from '../../Users/ListUsers'

import { db } from '../../../firebase'
import * as theme from "../../../core/theme";
import { constants } from "../../../core/constants";
import ListFormsContainer from "../../../containers/ListFormsContainer";
import { setStatusBarColor } from "../../../core/redux";
import MandatSynergysItem from "../../../components/genForms/MandatSynergysItem";

class ListMandatsSynergys extends React.Component {

    constructor(props) {
        super(props);
    
        this.renderItem = this.renderItem.bind(this);
        this.onPressItem = this.onPressItem.bind(this);
    
        const { route } = this.props;
        this.titleText = route.params?.titleText || 'Mandats Synergys';
        this.isRoot = route.params?.isRoot ?? true;
    
        this.project = route.params?.project ?? undefined;
        this.autoGenPdf = route.params?.autoGenPdf ?? false; // For pdf generation
        this.docType = route.params?.docType ?? ''; // For pdf generation
        this.popCount = route.params?.popCount ?? 1; // For pdf generation
    
        this.state = {
            index: 0,
            showInput: false,
            searchInput: '',
        };
    }
    

    componentDidMount() {
        setStatusBarColor(this, { backgroundColor: theme.colors.primary, barStyle: "dark-content" })
    }

    renderItem(item) {
        return (
            <MandatSynergysItem
                mandat={item}
                onPress={() => this.onPressItem(item)}
                applicantName={`${item.applicantFirstName} ${item.applicantLastName}`} />
        )
    }

    onPressItem(item) {
        const { navigation } = this.props;
        const project = navigation?.getParam('project', '');
        const DocumentId = navigation?.getParam('DocumentId', '');
        const onGoBack = navigation?.getParam('onGoBack', null);
    
        if (this.isRoot) {
            navigation.navigate('CreateMandatSynergys', {
                MandatSynergysId: item.id
            });
        } else {
            navigation.navigate('CreateMandatSynergys', {
                MandatSynergysId: item.id,
                autoGenPdf: true,
                docType: this.docType,
                project,
                DocumentId,
                popCount: this.popCount,
                onGoBack
            });
        }
    }
    

    render() {
        const { index, searchInput, showInput } = this.state
        const { isConnected } = this.props.network
        const query = this.project ? db.collection('MandatsSynergys').where('project.id', '==', this.project.id) : db.collection('MandatsSynergys').orderBy('createdAt', 'desc')
        const emptyListDesc = this.isRoot ? 'Appuyez sur le boutton "+" pour créer un mandat Synergys.' : "Veuillez créer un mandat Synergys à partir d'un nouveau formulaire."

        return (
            <View style={{ flex: 1 }}>
                <ListFormsContainer
                    titleText="Mandats Synergys"
                    collection='MandatsSynergys'
                    query={query}
                    creationScreen="CreateMandatSynergys"
                    navigation={this.props.navigation}
                    renderItem={this.renderItem}
                    countTitle="mandat"
                    KEYS_TO_FILTERS={['id']}
                    isRoot={this.isRoot}
                    emptyList={
                        <EmptyList
                            icon={faSave}
                            header='Aucun mandat Synergys'
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

export default connect(mapStateToProps)(ListMandatsSynergys)










