import React from "react";
import { View, TouchableHighlight, Alert, Text, StyleSheet, ActivityIndicator } from "react-native";
import * as theme from "../core/theme";
import Icon from 'react-native-vector-icons/Entypo'
import Dialog from "react-native-dialog"
import { constants } from "../core/constants";

import Modal from 'react-native-modal'

const LoadDialog = ({ message, loading, ...props }) => (
    <Modal
        isVisible={loading}
        style={{ maxHeight: 120, marginTop: constants.ScreenHeight*0.4 }}>

        <View style={styles.modalView}>
            <View style={styles.loadingContainer}>
                <ActivityIndicator color={theme.colors.primary} size={24} style={{ marginRight: 5 }} />
            </View>
            <View style={styles.messageContainer}>
                <Text style={theme.customFontMSsemibold.body, { marginLeft: 5 }}>{message}</Text>
            </View>
        </View>
    </Modal>
)

const styles = StyleSheet.create({
    modalView: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: "#fff", 
    },
    loadingContainer: {
        flex: 0.2
    },
    messageContainer: {
        flex: 0.8
    }
})

export default LoadDialog
