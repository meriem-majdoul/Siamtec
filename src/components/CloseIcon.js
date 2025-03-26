import { faTimes } from "react-native-fontawesome";
import React, { memo } from "react";
//import { StyleSheet } from "react-native";
import * as theme from "../core/theme";
import CustomIcon from "./CustomIcon";

const CloseIcon = ({ onPress, style, color, icon, ...props }) => {
    return (
        <CustomIcon
            icon={icon || faTimes}
            color={color || theme.colors.gray_dark}
            onPress={onPress}
            style={style}
        />
    )
}

// const styles = StyleSheet.create({

// });

export default memo(CloseIcon);
