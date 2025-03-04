import React from "react";
import { View, StyleSheet, Text } from "react-native"
import Ionicons from 'react-native-vector-icons/Ionicons'
import * as theme from "../core/theme";

const OffLineBar = ({ ...props }) => (
    <View style={styles.container}>
        <Ionicons name='cloud-offline-outline' color={theme.colors.white} />
        <Text style={[theme.customFontMSregular.body, { color: theme.colors.white, marginLeft: 10 }]}>Mode Hors-Ligne</Text>
    </View>
)

const styles = StyleSheet.create({
    container: {
        width: "100%",
        paddingVertical: 5,
        flexDirection: 'row',
        backgroundColor: theme.colors.offline,
        justifyContent: 'center',
        alignItems: 'center'
    },
})

export default OffLineBar
