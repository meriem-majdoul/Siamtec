
import React from "react";
import { View, StyleSheet, Text, TouchableOpacity, Alert } from "react-native";
import { TextInput as Input } from "react-native-paper";
import * as theme from "../core/theme";
import { constants } from '../core/constants'

const RequestState = ({ state, isEdit, onPress, ...props }) => {

    const stateWidth = constants.ScreenWidth * 0.125

    //  if (isEdit)
    return (
        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
            <TouchableOpacity
                style={[styles.stateStyle, {
                    backgroundColor: state === 'En attente' ? theme.colors.error : '#fff',
                    borderTopLeftRadius: stateWidth,
                    borderBottomLeftRadius: stateWidth
                }]}
                onPress = {() => onPress('En attente')}>
                <Text style={[theme.customFontMSsemibold.body, { color: state === 'En attente' ? '#fff' : '#333', textAlign: 'center' }]}>En attente</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.stateStyle, {
                    backgroundColor: state === 'En cours' ? 'orange' : '#fff',
                    borderRightWidth: StyleSheet.hairlineWidth,
                    borderRightColor: theme.colors.gray
                }]}
                onPress = {() => onPress('En cours')}>
                <Text style={[theme.customFontMSsemibold.body, { color: state === 'En cours' ? '#fff' : '#333', textAlign: 'center' }]}>En cours</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.stateStyle, {
                    backgroundColor: state === 'Résolu' ? theme.colors.primary : '#fff',
                    borderTopRightRadius: stateWidth,
                    borderBottomRightRadius: stateWidth
                }]}
                onPress = {() => onPress('Résolu')}>
                <Text style={[theme.customFontMSsemibold.body, { color: state === 'Résolu' ? '#fff' : '#333', textAlign: 'center' }]}>Résolu</Text>
            </TouchableOpacity>
        </View>
    )

    //else
    //     return (
    //         <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: constants.ScreenHeight * 0.05 }}>
    //             <View style={{borderWidth: StyleSheet.hairlineWidth,  borderColor: theme.colors.gray, backgroundColor: theme.colors.disabled, borderTopLeftRadius: constants.ScreenWidth * 0.125, borderBottomLeftRadius: constants.ScreenWidth * 0.125, justifyContent: 'center', alignItems: 'center', width: constants.ScreenWidth * 0.3, height: constants.ScreenHeight * 0.07 }}>
    //                 <Text style={[theme.customFontMSsemibold.body, { color: '#fff', textAlign: 'center' }]}>En attente</Text>
    //             </View>

    //             <View style={{ borderWidth: StyleSheet.hairlineWidth, borderColor: theme.colors.gray, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', width: constants.ScreenWidth * 0.3, height: constants.ScreenHeight * 0.07 }}>
    //                 <Text style={[theme.customFontMSsemibold.body, { color: theme.colors.disabled, textAlign: 'center' }]}>En cours</Text>
    //             </View>

    //             <View style={{borderWidth: StyleSheet.hairlineWidth, borderColor: theme.colors.gray, backgroundColor: '#fff', borderTopRightRadius: constants.ScreenWidth * 0.125, borderBottomRightRadius: constants.ScreenWidth * 0.125, justifyContent: 'center', alignItems: 'center', width: constants.ScreenWidth * 0.3, height: constants.ScreenHeight * 0.07 }}>
    //                 <Text style={[theme.customFontMSsemibold.body, { color: theme.colors.disabled, textAlign: 'center' }]}>Résolu</Text>
    //             </View>
    //         </View>
    //     )
}


const styles = StyleSheet.create({
    stateStyle: {
        justifyContent: 'center', alignItems: 'center',
        width: constants.ScreenWidth * 0.25,
        height: constants.ScreenHeight * 0.07,
        ...theme.style.shadow
    }
})

export default RequestState
