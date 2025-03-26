import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { faPlus } from 'react-native-fontawesome'

import * as theme from "../core/theme";
import { constants, isTablet } from "../core/constants";
import CustomIcon from "./CustomIcon";

const MyFAB = ({ color = theme.colors.white, style, onPress, icon, ...props }) => (
    <TouchableOpacity style={[styles.fab, style]} onPress={onPress}>
        <CustomIcon icon={icon || faPlus} color={color} />
    </TouchableOpacity>
)

const ratio = isTablet ? 0.13 : 0.15

const styles = StyleSheet.create({
    fab: {
        flex: 1,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        right: 10,
        bottom: 10,
        width: constants.ScreenWidth * ratio,
        height: constants.ScreenWidth * ratio,
        borderRadius: constants.ScreenWidth * 0.15 / 2,
        zIndex: 20,
        ...theme.style.shadow
    }
})

export default MyFAB
