import React from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
// import {  } from "react-native-paper";
import * as theme from "../core/theme";
import Icon from 'react-native-vector-icons/Entypo'

const Loading = ({ style, size = 'large', color, ...props }) => (
    <View style={[styles.container, style]}>
        <ActivityIndicator color={color|| theme.colors.primary} size={size} />
    </View>
)

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
})
   
export default Loading
