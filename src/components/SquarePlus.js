import React from "react";
import { StyleSheet, TouchableOpacity, View, Text } from "react-native";
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { faCloudUpload, faFileUpload } from '@fortawesome/free-solid-svg-icons';

import * as theme from "../core/theme";
import { constants } from "../core/constants";

import CustomIcon from "./CustomIcon";
const squareSize = constants.ScreenWidth * 0.8

const SquarePlus = ({
    style, 
    onPress,
    icon,
    title = '',
    isBig = false,
    errorText,
    ...props
}) => {

    if (isBig) {
        return (
            <View style= {style}>
                <TouchableOpacity style={[styles.bigImageBox]} onPress={onPress}>
                    <View style={[styles.dashedBigImageBox]}>
                        <View style={{ alignItems: 'center' }}>
                            <CustomIcon icon={faFileUpload} color={theme.colors.primary} size={constants.ScreenWidth * 0.15} />
                            <Text style={[theme.customFontMSsemibold.header, { color: theme.colors.primary, marginTop: theme.padding * 1.5, letterSpacing: 0.5 }]}>{title !== "" ? title : "Ajouter un document"}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
                {errorText ? <Text style={[theme.customFontMSregular.caption, styles.error]}>{errorText}</Text> : null}
            </View>
        )
    }

    else return (
        <TouchableOpacity style={[styles.imagesBox, style]} onPress={onPress}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <CustomIcon icon={faPlus} color={theme.colors.gray_dark} size={21} />
                {title !== '' && <Text style={[theme.customFontMSregular.caption, { marginLeft: 5, color: theme.colors.gray_dark }]}>{title}</Text>}
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    imagesBox: {
        justifyContent: 'center',
        alignItems: 'center',
        width: constants.ScreenWidth * 0.24,
        height: constants.ScreenWidth * 0.24,
        backgroundColor: theme.colors.background,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: theme.colors.gray_dark,
        borderRadius: 1
    },
    bigImageBox: {
        alignSelf: "center",
        justifyContent: 'center',
        alignItems: 'center',
        width: squareSize,
        height: squareSize,
        backgroundColor: "#f2f3f5",
        //  borderWidth: 1,
        //  borderStyle: 'dashed',
        // borderColor: theme.colors.gray_dark,
        borderRadius: 5,
        ...theme.style.shadow
    },
    dashedBigImageBox: {
        alignSelf: "center",
        justifyContent: 'center',
        alignItems: 'center',
        width: squareSize * 0.9,
        height: squareSize * 0.9,
        backgroundColor: "#f2f3f5",
        borderWidth: 5,
        borderStyle: 'dashed',
        borderColor: "#dbdce0",
        borderRadius: 5
    },
    error: {
        // paddingHorizontal: 4,
        paddingTop: theme.padding,
        color: theme.myRedColor,
        textAlign: "center"
    }
})

export default SquarePlus
