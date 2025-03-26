import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
// import {} from "react-native-paper";
import * as theme from "../core/theme";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { faWifiSlash } from 'react-native-fontawesome'
import CustomIcon from "./CustomIcon";
import { constants } from "../core/constants";

const EmptyList = ({ icon, iconStyle, header, headerTextStyle, description, descriptionTextStyle, style, offLine = false, offLineHeader, offlineDescription, ...props }) => {

    const headerText = offLine ? "Pas de données en cache" : header
    const descriptionText = offLine ? "Veuillez rétablir votre connection réseau pour récupérer les données du serveur." : description
    const iconObject = offLine ? faWifiSlash : icon

    return (
        <View style={[styles.container, style]}>
            <CustomIcon icon={iconObject} size={150} color={theme.colors.gray_light} style={{ marginBottom: 40 }} />
            <View style={[{ marginBottom: 10 }]}>
                <Text style={[theme.customFontMSregular.h3, { color: theme.colors.secondary, textAlign: 'center' }, headerTextStyle]}>{headerText}</Text>
            </View>
            <View style={{ width: constants.ScreenWidth * 0.75 }}>
                <Text style={[theme.customFontMSregular.body, { textAlign: 'center', color: theme.colors.gray_dark }, descriptionTextStyle]}>{descriptionText}</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 33,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2
       // backgroundColor: 'green',
    },
})

export default EmptyList
