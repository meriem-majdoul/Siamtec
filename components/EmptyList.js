import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
// import {} from "react-native-paper";
import * as theme from "../core/theme";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

const EmptyList = ({ iconName, iconStyle, header, headerTextStyle, description, descriptionTextStyle, style, offLine = false, offLineHeader, offlineDescription, ...props }) => {

    if (offLine)
        return (
            <View style={[styles.container, style]}>
                <View style={[{ width: 130, height: 130, borderRadius: 75, justifyContent: 'center', alignItems: 'center', marginBottom: 20, backgroundColor: '#fff' }, iconStyle]}>
                    <Icon name='access-point-network-off' size={80} color={theme.colors.gray100} />
                </View>
                <View style={[{ marginBottom: 10 }]}>
                    <Text style={[theme.customFontMSbold.h3, { textAlign: 'center' }, headerTextStyle]}>Pas de données en cache</Text>
                </View>
                <View>
                    <Text style={[theme.customFontMSmedium.body, { textAlign: 'center', color: theme.colors.placeholder }, descriptionTextStyle]}>Veuillez rétablir votre connection réseau pour récupérer les données du serveur.</Text>
                </View>
            </View>
        )

    else return (
        <View style={[styles.container, style]}>
            <View style={[{ width: 130, height: 130, borderRadius: 75, justifyContent: 'center', alignItems: 'center', marginBottom: 20, backgroundColor: '#fff' }, iconStyle]}>
                <Icon name={iconName} size={80} color={theme.colors.gray100} />
            </View>
            <View style={[{ marginBottom: 10 }]}>
                <Text style={[theme.customFontMSbold.h3, { textAlign: 'center' }, headerTextStyle]}>{header}</Text>
            </View>
            <View>
                <Text style={[theme.customFontMSmedium.body, { textAlign: 'center', color: theme.colors.placeholder }, descriptionTextStyle]}>{description}</Text>
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
    },
})

export default EmptyList
