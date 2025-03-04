import React from "react";
import { StyleSheet } from "react-native";
import { FAB } from "react-native-paper";
import * as theme from "../core/theme";
import { constants } from "../core/constants";

const MyFAB = ({ style, onPress, icon, ...props }) => (
    <FAB
        style={[styles.fab, style]}
        icon={icon || "plus"}
        iconSize = {constants.ScreenWidth*0.06}
        onPress={onPress} />
)

const styles = StyleSheet.create({
    fab: {
        flex: 1,
        backgroundColor: '#007f00',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
        width: constants.ScreenWidth*0.15,
        height: constants.ScreenWidth*0.15,
        borderRadius: 100,
    }
});

export default MyFAB
