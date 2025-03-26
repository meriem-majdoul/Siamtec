import React from "react";
import { Text, StyleSheet, TouchableOpacity, View } from 'react-native'
import { connect } from 'react-redux'
import { faUser, faAddressCard, fal, faFileInvoice, faVial, faVials, faHandHoldingUsd, faSave } from 'react-native-vector-icons/FontAwesome5'

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
        super(props)
        this.renderItem = this.renderItem.bind(this)
        this.onPressItem = this.onPressItem.bind(this)

        this.titleText = this.props.navigation.getParam('titleText', 'Mandats Synergys')
        this.isRoot = this.props.navigation.getParam('isRoot', true)

        this.project = this.props.navigation.getParam('project', undefined)
        this.autoGenPdf = this.props.navigation.getParam('autoGenPdf', false) // For pdf generation
        this.docType = this.props.navigation.getParam('docType', '') // For pdf generation
        this.popCount = this.props.navigation.getParam('popCount', 1) // For pdf generation

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
            <MandatSynergysItem
                mandat={item}
                onPress={() => this.onPressItem(item)}
                applicantName={`${item.applicantFirstName} ${item.applicantLastName}`} />
        )
    }

    onPressItem(item) {
        if (this.isRoot)
            this.props.navigation.navigate('CreateMandatSynergys', {
                MandatSynergysId: item.id
            })

        else this.props.navigation.navigate('CreateMandatSynergys', {
            MandatSynergysId: item.id,
            autoGenPdf: true,
            docType: this.docType,
            project: this.props.navigation.getParam('project', ''),
            DocumentId: this.props.navigation.getParam('DocumentId', ''),
            popCount: this.popCount,
            onGoBack: this.props.navigation.getParam('onGoBack', null)
        })
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










