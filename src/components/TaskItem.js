
import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native'

import moment from 'moment';
import 'moment/locale/fr'
moment.locale('fr')

import * as theme from '../core/theme'

const TaskItem = ({ task, onPress, style }) => {

    const { id, name, status, isAllDay, color, date, startHour, dueHour } = task
    const TaskId = id
    const done = status === 'Terminé'
    const canceled = status === 'Annulé'
    const timerange = isAllDay ? 'Toute la journée' : `${startHour} - ${dueHour}`

    //Check if task is not done on time.
    const today = moment().format('YYYY-MM-DD')
    const now = moment().format('HH:mm')
    const isTodayAfterDate = moment(today).isAfter(date, 'day')
    const isNowAfterTime = moment(now, 'hh:mm').isAfter(moment(dueHour, 'hh:mm'), 'hour')
    const isToday = today === date
    const isCurrentAfterTaskDate = isAllDay ? isTodayAfterDate : isToday && isNowAfterTime
    const isLate = !done && isCurrentAfterTaskDate && !canceled

    const taskColor = isLate ? theme.colors.white : color
    const textColor = isLate ? theme.colors.error : theme.colors.white
    const borderWidth = isLate ? StyleSheet.hairlineWidth : 0
    const opacity = done ? 0.5 : 1

    return (
        <TouchableOpacity style={[styles.item, { backgroundColor: taskColor, opacity, borderColor: theme.colors.error, borderWidth }, style]} onPress={onPress} >
            <View style={{ flex: 0.5, justifyContent: 'center', paddingRight: 5 }}>
                <Text style={[theme.customFontMSsemibold.caption, { color: textColor }]} numberOfLines={1}>{name}</Text>
            </View>
            <View style={{ flex: 0.5, alignItems: 'flex-end', justifyContent: 'center', paddingLeft: 5 }}>
                {/* <Text style={[theme.customFontMSregular.caption, { color: '#fff' }]} numberOfLines={1}>{task.assignedTo.fullName}</Text> */}
                <Text style={[theme.customFontMSsemibold.caption, { color: textColor, marginRight: 10 }]} numberOfLines={1}>{timerange}</Text>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    item: {
        //flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        borderRadius: 5,
        paddingVertical: 5,
        paddingHorizontal: 10,
        marginBottom: 10,
        //marginTop: 10,
    },
})

export default TaskItem