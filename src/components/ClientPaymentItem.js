import { faInfoCircle } from "react-native-fontawesome";
import React, { memo, useEffect, useRef } from "react";
import { View, StyleSheet, Text, Alert, TextInput as NativeTextInput } from "react-native";
import { TextInput as Input } from "react-native-paper";
import { isTablet } from "../core/constants";
import * as theme from "../core/theme";
import CustomIcon from "./CustomIcon";

const ClientPaymentInput = ({ date, payer, amount, ...props }) => {

    return (
        <View style={styles.container}>
            <Text>{date}</Text>
            <Text>{payer}</Text>
            <Text>{amount}</Text>
        </View>
    )

}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        paddingTop: 5,
        // marginBottom: 10,
        // backgroundColor: 'yellow'
    },
    input: {
        width: "100%",
        alignSelf: 'center',
        backgroundColor: 'transparent',
        borderBottomWidth: StyleSheet.hairlineWidth * 2,
        borderBottomColor: theme.colors.gray_extraLight,
        textAlign: 'center',
        paddingHorizontal: 0,
        textAlign: 'auto',
        height: isTablet ? 85 : undefined,
        //    backgroundColor: 'pink'
        textAlignVertical: "center",
        paddingTop: 0,
        paddingBottom: 0

    },
    error: {
        // paddingHorizontal: 4,
        paddingTop: 4,
        color: theme.colors.error
    }
});

export default ClientPaymentInput;
