
import React from "react";
import { View, StyleSheet, TouchableOpacity, Text, Image, TextInput } from "react-native";

import CustomIcon from './CustomIcon'

import * as theme from "../core/theme";
import { constants, isTablet } from "../core/constants";
//import TextInput from "./TextInput";
import { faMinus, faPlus } from "react-native-fontawesome";

const NumberInput = ({ number, changeValue, error, ...props }) => {

    const controller = (icon, operation) => {
        return (
            <TouchableOpacity style={styles.controller} onPress={() => changeValue(operation)}>
                <CustomIcon icon={icon} color={theme.colors.primary} />
            </TouchableOpacity>
        )
    }

    return (
        <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly' }}>
                {controller(faMinus, "sub")}
                <View style={{ width: constants.ScreenWidth * 0.55, borderBottomWidth: StyleSheet.hairlineWidth * 3, borderBottomColor: theme.colors.gray_extraLight }}>
                    <TextInput
                        returnKeyType="done"
                        keyboardType='numeric'
                        textAlign={'center'}
                        style={{ fontSize: isTablet ? 38 : undefined }}
                        {...props}
                    />
                </View>
                {controller(faPlus, "add")}
            </View>
            {error ? <Text style={[theme.customFontMSregular.caption, { color: theme.colors.error, textAlign: 'center', marginTop: 16 }]}>{error}</Text> : null}
        </View>
    )
}

const styles = StyleSheet.create({
    controller: {
        width: constants.ScreenWidth * 0.09,
        height: constants.ScreenWidth * 0.09,
        borderWidth: 1,
        borderRadius: 25,
        borderColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center'
    }
})

export default NumberInput