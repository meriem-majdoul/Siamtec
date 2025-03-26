
import React from "react";
import { View, StyleSheet, Text, TouchableOpacity, Alert } from "react-native";
import { faTasks, faCalendar } from 'react-native-fontawesome'

import * as theme from "../core/theme";
import { constants } from '../core/constants'
import Section from './Section'
import CustomIcon from './CustomIcon'

const PlanningTabs = ({ isAgenda, onPress1, onPress2, ...props }) => {

    const tabWidth = constants.ScreenWidth * 0.125

    const Tab = ({ label, icon, active, onPress }) => {
        const backgroundColor = active ? theme.colors.white : theme.colors.tabs
        const textColor = active ? theme.colors.secondary : theme.colors.gray_dark
        const tabStyle = { flexDirection: 'row', padding: theme.padding, width: constants.ScreenWidth * 0.45, justifyContent: 'center', backgroundColor: backgroundColor, borderRadius: 10 }

        return (
            <TouchableOpacity style={tabStyle} onPress={onPress}>
                <CustomIcon icon={icon} color={textColor} />
                <Text style={[theme.customFontMSregular.body, { color: textColor, marginLeft: 10 }]}>
                    {label}
                </Text>
            </TouchableOpacity>
        )
    }

    return (
        <View style={styles.container}>
            <Tab label='Mon Agenda' icon={faTasks} active={isAgenda} onPress={onPress1} />
            <Tab label='Planning' icon={faCalendar} active={!isAgenda} onPress={onPress2} />
        </View>
    )
}


const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 15,
        backgroundColor: theme.colors.tabs
    },
    stateStyle: {
        //elevation: 3,
        justifyContent: 'center', alignItems: 'center',
        width: constants.ScreenWidth * 0.3,
        height: constants.ScreenHeight * 0.07
    }
})

export default PlanningTabs
