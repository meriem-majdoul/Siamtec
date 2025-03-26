import React, { Component } from 'react';
import { View, Text, ScrollView, Dimensions, TouchableOpacity, StyleSheet } from 'react-native';
import Modal from 'react-native-modal'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

import * as  theme from '../../core/theme'
import { constants, isTablet } from '../../core/constants'
import TermsConditions from './TermsConditions';

const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
    const paddingToBottom = 20;
    return layoutMeasurement.height + contentOffset.y >=
        contentSize.height - paddingToBottom;
};

export default class TermsConditionsModal extends Component {

    constructor(props) {
        super(props) 
        this.state = {
            accepted: false
        }
    }

    renderHeader() {

        return (
            <View style={styles.headerContainer}>
                <TouchableOpacity
                    style={styles.downloadButton}
                    onPress={this.props.downloadPdf}
                >
                    <MaterialCommunityIcons
                        name='download'
                        size={24}
                        color={theme.colors.primary}
                        style={{ padding: 15 }}
                    />
                    <Text style={[theme.customFontMSsemibold.body, { color: theme.colors.primary }]}>Télécharger</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={this.props.toggleTerms}
                    hitSlop={theme.hitslop}
                >
                    <MaterialCommunityIcons
                        name='close'
                        size={21}
                        style={{ padding: 15 }}
                    />
                </TouchableOpacity>

            </View>
        )
    }

    renderTitle() {
        return (
            <View style={{ marginVertical: 15, paddingHorizontal: 30 }}>
                <Text style={[theme.customFontMSsemibold.header, { alignSelf: 'center' }]}>CONDITIONS GÉNÉRALES DE</Text>
                <Text style={[theme.customFontMSsemibold.header, { alignSelf: 'center' }]}>VENTE ET DE TRAVAUX (CGV)</Text>
            </View>
        )
    }

    renderConfirmButton() {
        return (
            <TouchableOpacity
                //disabled={!this.state.accepted}
                onPress={this.props.acceptTerms}
                //style={this.state.accepted ? styles.button : styles.buttonDisabled}>
                style={styles.button}>
                <Text style={styles.buttonLabel}>J'ai lu et accepté</Text>
            </TouchableOpacity>
        )
    }

    render() {
        return (
            <Modal isVisible={this.props.showTerms} style={styles.modal}>
                {this.renderHeader()}
                {this.renderTitle()}
                <TermsConditions />
                {this.renderConfirmButton()}
            </Modal >
        )
    }

}

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
    modal: {
        maxHeight: constants.ScreenHeight * 0.8,
        marginTop: constants.ScreenHeight * 0.1,
        backgroundColor: '#fff'
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    downloadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    container: {
        marginTop: 20,
        marginLeft: 10,
        marginRight: 10
    },
    title: {
        fontSize: 22,
        alignSelf: 'center'
    },
    tcP: {
        marginTop: 10,
        marginBottom: 10,
        fontSize: 12
    },
    tcP: {
        marginTop: 10,
        fontSize: 12
    },
    tcL: {
        marginLeft: 10,
        marginTop: 10,
        marginBottom: 10,
        fontSize: 12
    },
    tcContainer: {
        marginTop: 15,
        marginBottom: 15,
        height: height * .7
    },

    button: {
        backgroundColor: theme.colors.primary,
        // borderRadius: 5,
        padding: isTablet ? 30 : 10
    },

    buttonDisabled: {
        backgroundColor: '#999',
        //borderRadius: 5,
        padding: 10
    },

    buttonLabel: {
        fontSize: isTablet ? 28 : 14,
        color: '#FFF',
        alignSelf: 'center'
    },
    article: {
        marginBottom: 15
    },
    header: {
        marginBottom: 5
    }

})
