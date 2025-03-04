
import React from "react";
import { View, StyleSheet, Text, TouchableOpacity, Alert } from "react-native";
import * as theme from "../core/theme";
import { constants } from '../core/constants'

const TasksTab = ({ isCalendar, onPress1, onPress2, ...props }) => {

    const tabWidth = constants.ScreenWidth * 0.125

    return (
        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
            <TouchableOpacity
                style={[styles.stateStyle, {
                    backgroundColor: !isCalendar ? theme.colors.secondary : '#fff',
                    width: '50%'
                }]}
                onPress={onPress1}>
                <Text style={[theme.customFontMSsemibold.body, { color: !isCalendar ? '#fff' : '#333', textAlign: 'center' }]}>Liste</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.stateStyle, {
                    backgroundColor: isCalendar ? theme.colors.secondary : '#fff',
                    width: '50%'
                }]}
                onPress={onPress2}>
                <Text style={[theme.customFontMSsemibold.body, { color: isCalendar ? '#fff' : '#333', textAlign: 'center' }]}>Calendrier</Text>
            </TouchableOpacity>
        </View>
    )
}


const styles = StyleSheet.create({
    stateStyle: {
        //elevation: 3,
        justifyContent: 'center', alignItems: 'center',
        width: constants.ScreenWidth * 0.3,
        height: constants.ScreenHeight * 0.07
    }
})

export default TasksTab
