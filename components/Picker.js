import React, { memo } from "react";
import { View, StyleSheet, Text } from "react-native";
import { Picker } from '@react-native-community/picker'
import * as theme from "../core/theme";
import { constants } from "../core/constants";

const MyPicker = ({ containerStyle, style, elements, title, errorText, enabled = true, ...props }) => (
    <View style={[styles.container, { marginBottom: errorText ? 15 : 5 }]}>

        <View style={[styles.pickerContainer, containerStyle]}>
            <Text style={styles.header}>{title}</Text>
            <Picker style={[styles.input, style]} enabled= {enabled} {...props}>
                {elements.map((item) => {
                    return (<Picker.Item label={item.label} value={item.value} />)
                })}
            </Picker>
        </View>
        {errorText ? <Text style={[theme.customFontMSregular.caption, styles.error]}>{errorText}</Text> : null}

    </View>


)

const styles = StyleSheet.create({
    container: {
        width: "100%",
        marginTop: 5
    },
    pickerContainer: {
        marginTop: 15,
        marginBottom: 10,
        borderBottomWidth: 0.25,
        borderBottomColor: '#C7C7CD',
    },
    header: {
        fontSize: 12,
        color: '#757575',
    },
    input: {
        marginLeft: -7,
        color: '#333',
        alignItems: 'flex-start'
    },
    error: {
        paddingHorizontal: 4,
        color: theme.colors.error
    }
});

export default MyPicker;
