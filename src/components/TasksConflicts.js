import React from "react"
import { View, StyleSheet, Text, TouchableOpacity, FlatList, Alert, ScrollView } from "react-native"
import { Switch } from "react-native-paper"
import Modal from 'react-native-modal'
import { faInfoCircle, faTimes, faCalendarPlus, faClock, faShieldCheck, faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons'
import _ from 'lodash'

import moment from 'moment';
import 'moment/locale/fr'
moment.locale('fr')

import { db } from '../firebase'
import * as theme from "../core/theme"
import { constants } from "../core/constants"
import { isEditOffline, navigateToScreen, compareTimes, displayError } from "../core/utils"
import CustomIcon from "./CustomIcon"
import ItemPicker from './ItemPicker'
import Button from './Button'
import EmptyList from './EmptyList'
import Section from "./Section"
import Loading from "./Loading"
import TimeslotForm from "./TimeslotForm"

const TasksConflicts = ({
    role,
    canWrite,

    isVisible,
    toggleModal,
    refreshConflicts,
    tasks,
    newTask,
    isEdit,
    startDate,
    endDate,
    handleDate,
    handleStartHour,
    handleDueHour,
    initPickedTaskSelectedItems,
    parentSelectedIsAllDay,
    parentPickedDate,
    parentPickedTask,
    parentSelectedDate,
    parentSelectedStartHour,
    parentSelectedDueHour,
    loading,
    isConnected,
    onIgnore,
    ...props
}) => {
    const firstTaskId = Object.keys(tasks)[0]
    const [pickedDate, setPickedDate] = React.useState('')
    const [pickedTask, setPickedTask] = React.useState(null)
    const [updateTaskLoading, setUpdateTaskLoading] = React.useState(false)
    const [selectedIsAllDay, setSelectedIsAllDay] = React.useState(false)
    const [selectedDate, setSelectedDate] = React.useState('')
    const [selectedStartHour, setSelectedStartHour] = React.useState('')
    const [selectedDueHour, setSelectedDueHour] = React.useState('')
    const [selectedDueHourError, setSelectedDueHourError] = React.useState('')

    //Rehydrating data after reset
    React.useEffect(() => {
        setPickedDate(parentPickedDate)
        setPickedTask(parentPickedTask)
        setSelectedIsAllDay(parentSelectedIsAllDay)
        setSelectedDate(parentSelectedDate)
        setSelectedStartHour(parentSelectedStartHour)
        setSelectedDueHour(parentSelectedDueHour)
    }, [props.parentPickedDate, parentPickedTask, props.parentSelectedIsAllDay, props.parentSelectedDate, props.parentSelectedStartHour, props.parentSelectedDueHour])

    //Helpers
    const initSelectedTask = () => {
        setPickedTask(null)
        setSelectedIsAllDay(false)
        setSelectedDate('')
        setSelectedStartHour('')
        setSelectedDueHour('')
    }

    const separator = (flex) => <View style={{ flex }} />

    //APPBAR
    const AppBar = ({ }) => {
        return (
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: theme.padding, paddingBottom: theme.padding * 1.5 }}>
                <TouchableOpacity style={{ zIndex: 1, justifyContent: 'center', alignItems: 'center' }} onPress={() => console.log('hello')}>
                    <CustomIcon icon={faTimes} color={theme.colors.gray_dark} onPress={toggleModal} />
                </TouchableOpacity>
                <Text style={[theme.customFontMSregular.h3, { marginLeft: theme.padding }]}>Oupss</Text>
                <Text
                    onPress={onIgnore}
                    style={[theme.customFontMSregular.body, { position: "absolute", top: theme.padding, right: theme.padding, color: theme.colors.error }]}>Ignorer</Text>
            </View>
        )
    }

    const TaskItem = ({ task, isPicked }) => {

        const { id, name, color, isAllDay, startHour, dueHour } = task
        const timerange = isAllDay ? 'Toute la journée' : `${task.startHour} - ${task.dueHour}`

        const onPressTask = () => {
            if (!task || !_.isEqual(task, pickedTask)) {
                setPickedTask(task)
                setSelectedIsAllDay(task.isAllDay)
                setSelectedDate(task.date)
                setSelectedStartHour(task.startHour)
                setSelectedDueHour(task.dueHour)
                //set selected items on parent
                initPickedTaskSelectedItems(task.isAllDay, task.date, task.startHour, task.dueHour)
            }
            else initSelectedTask()
        }

        return (
            <TouchableOpacity style={[styles.task, { borderRadius: 5, backgroundColor: task.color }]} onPress={onPressTask} >
                <View style={{ flex: 0.5, justifyContent: 'center', paddingRight: 5 }}>
                    <Text style={[theme.customFontMSregular.body, { color: '#fff' }]} numberOfLines={1}>
                        {task.name}
                    </Text>
                </View>
                <View style={{ flex: 0.5, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', paddingLeft: 5 }}>
                    <Text style={[theme.customFontMSregular.caption, { color: '#fff', marginRight: 10 }]} numberOfLines={1}>
                        {timerange}
                    </Text>
                    <CustomIcon
                        icon={isPicked ? faChevronDown : faChevronUp}
                        color={theme.colors.white} size={12}
                    />
                </View>
            </TouchableOpacity>
        )
    }

    //##HEADERS
    const renderHeader = (title, onPressInfo) => {
        return (
            <View style={styles.header}>
                <Text style={[theme.customFontMSregular.caption, { color: theme.colors.gray_dark, marginRight: 7 }]}>{title}</Text>
                <CustomIcon icon={faInfoCircle} color={theme.colors.gray_dark} size={15} onPress={onPressInfo} />
            </View>
        )
    }

    const renderDatesHeader = () => {
        const title = "Dates en conflit"
        const onPressInfo = () => Alert.alert('Dates en conflit', `Selectionnez une date pour voir la liste des tâches en conflit avec celle que vous essayez de créer.`)
        return renderHeader(title, onPressInfo)
    }

    const renderTasksHeader = (tasksCount) => {
        const s = tasksCount > 1 ? 's' : ''
        const title = `${tasksCount} tâche${s} en conflit`
        const onPressInfo = () => Alert.alert('Tâches en conflit', `Liste des tâches déjà affectées à l'utilisateur à qui vous voulez assigner une tâche, pendant le créneau horaire que vous avez choisi.`)
        return renderHeader(title, onPressInfo)
    }

    const renderCurrentTaskHeader = () => {
        const title = `Tâche en cours pour ${newTask.assignedTo.fullName} `
        const onPressInfo = () => Alert.alert('Tâche en cours', `Tâche que vous essayez de ${isEdit ? 'modifier' : 'créer'}.`)
        return renderHeader(title, onPressInfo)
    }

    //##DATES
    const renderDates = () => {

        let dates = []
        for (const taskId in tasks) {
            const date = tasks[taskId][0].date
            dates.push(date)
        }

        return (
            <View>
                {renderDatesHeader()}
                <FlatList
                    horizontal={true}
                    data={dates}
                    keyExtractor={date => date.toString()}
                    ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
                    renderItem={({ item }) => renderDate(item)}
                    style={{ marginTop: theme.padding / 1.25, marginBottom: theme.padding * 2 }}
                />
            </View>
        )
    }

    const renderDate = (date) => {
        const formatedDate = moment(date, 'YYYY-MM-DD').format('DD-MM-YYYY')
        const red = theme.colors.error
        const isSelected = pickedDate === date
        const backgroundColor = isSelected ? red : theme.colors.white
        const textColor = isSelected ? theme.colors.white : red

        const onPressDate = () => {
            initSelectedTask()
            setPickedDate(date)
        }

        return (
            <TouchableOpacity style={[styles.date, { borderColor: red, backgroundColor }]} onPress={onPressDate}>
                <Text style={[theme.customFontMSregular.caption, { color: textColor }]}>{formatedDate}</Text>
            </TouchableOpacity>
        )
    }

    //##TASKS
    const renderTasks = () => {

        let conflictingTasks = []
        for (const taskId in tasks) {
            if (pickedDate === tasks[taskId][0].date)
                conflictingTasks = tasks[taskId]
        }

        const tasksCount = conflictingTasks.length

        return (
            <View>
                {renderTasksHeader(tasksCount)}
                <FlatList
                    data={conflictingTasks}
                    keyExtractor={task => task.id.toString()}
                    renderItem={({ item, index }) => renderTask(item, index)}
                    style={{ marginTop: theme.padding / 1.25, marginBottom: theme.padding * 2 }}
                />
            </View>
        )
    }

    const renderTask = (task, index) => {

        const isPickedTask = _.isEqual(task, pickedTask)

        return (
            <View style={{ flex: 1, borderRadius: 5, backgroundColor: theme.colors.white, marginTop: index === 0 ? 0 : theme.padding }}>
                <TaskItem task={task} isPicked={isPickedTask} />

                {isPickedTask ?
                    updateTaskLoading ?
                        renderUpdateTaskLoading()
                        :
                        <View style={{ borderRadius: 5, backgroundColor: theme.colors.white }}>
                            {renderTimeForm(null, true, true)}
                            <Button
                                mode="contained"
                                onPress={updateTask}
                                containerStyle={{ alignSelf: 'flex-end' }}
                                outlinedColor={theme.colors.primary}
                            >
                                modifier
                            </Button>
                        </View>
                    : null
                }
            </View>

        )
    }

    //Update task
    const updateTask = async () => {
        try {
            //1. Check network
            let isEditOffLine = isEditOffline(isEdit, isConnected)
            if (isEditOffLine) return

            //2. Validate inputs (Times) //#task
            const isTimesValid = validateTimes(selectedIsAllDay, selectedStartHour, selectedDueHour)
            if (!isTimesValid) return

            //3. Set update
            const update = {
                isAllDay: selectedIsAllDay,
                date: moment(selectedDate).format('YYYY-MM-DD'),
            }

            if (!selectedIsAllDay) {
                update.startHour = selectedStartHour
                update.dueHour = selectedDueHour
            }

            //4. Update task
            setUpdateTaskLoading(true)
            await db.collection('Agenda').doc(pickedTask.id).update(update)
            await refreshConflicts()
            setUpdateTaskLoading(false)
        }
        catch (e) {
            displayError({ message: "Erreur lors de la mise à jour de la tâche. Veuillez réessayer." })
        }
    }

    const validateTimes = (isAllDay, startHour, dueHour) => {

        if (isAllDay) return true

        const timeError = compareTimes(moment(dueHour, 'hh:mm'), moment(startHour, 'hh:mm'), 'isBefore')

        if (timeError) {
            setSelectedDueHourError(timeError)
            return false
        }

        else return true
    }

    const renderUpdateTaskLoading = () => {
        return (
            <View style={{ alignItems: 'center', paddingVertical: 15 }}>
                <Text style={[theme.customFontMSregular.body, { marginBottom: 30 }]}>Modification en cours...</Text>
                <Loading />
            </View>
        )
    }

    //RENDER TIME FROM
    const isAllDaySwitch = (editable, isAllDay) => {
        return (
            <View style={styles.switchContainer}>
                <Text style={theme.customFontMSregular.body}>Toute la journée</Text>
                <Switch
                    value={isAllDay}
                    onValueChange={(isAllDay) => setSelectedIsAllDay(isAllDay)}
                    color={theme.colors.primary}
                    disabled={!editable}
                />
            </View>
        )
    }

    const datesForm = (editable, isEdit, isAllDay, startDate, endDate) => {

        const showEndDate = !isEdit && !isAllDay

        return (
            <View>
                <ItemPicker
                    onPress={() => handleDate(pickedDate, pickedTask, isAllDay)}
                    label={showEndDate ? 'Date de début *' : 'Jour *'}
                    value={moment(startDate).format('ll')}
                    editable={editable}
                    showAvatarText={false}
                    icon={faCalendarPlus}
                    errorText={startDate && startDate.error}
                />

                {separator(0.1)}

                {showEndDate &&
                    <ItemPicker
                        onPress={() => console.log('...')}
                        label="Date de fin *"
                        value={moment(endDate).format('ll')}
                        editable={editable}
                        showAvatarText={false}
                        icon={faCalendarPlus}
                        errorText={endDate && endDate.error}
                    />
                }
            </View>
        )
    }

    const timesForm = (editable, isEdit, isAllDay, startHour, dueHour) => {
        return (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>

                <ItemPicker
                    onPress={() => handleStartHour(pickedDate, pickedTask, isAllDay)}
                    label={'Heure de début *'}
                    value={startHour}
                    editable={editable}
                    showAvatarText={false}
                    icon={faClock}
                    style={{ flex: 0.47 }}
                />

                {separator(0.06)}

                <ItemPicker
                    onPress={() => handleDueHour(pickedDate, pickedTask, isAllDay)}
                    label={"Heure d'échéance *"}
                    value={dueHour}
                    editable={editable}
                    showAvatarText={false}
                    icon={faClock}
                    errorText={editable && selectedDueHour && selectedDueHourError}
                    style={{ flex: 0.47 }}
                />
            </View>
        )
    }

    const renderTimeForm = (task, editable, isEdit, start_Date, end_Date) => {

        if (!task) {
            var isAllDay = selectedIsAllDay
            var startDate = selectedDate
            var endDate = ''
            var startHour = selectedStartHour
            var dueHour = selectedDueHour
        }

        else {
            var { isAllDay, startHour, dueHour } = newTask
            var startDate = start_Date
            var endDate = end_Date
        }

        return (
            <View style={{ flex: 1 }}>
                <TimeslotForm
                    role={role}
                    canWrite={canWrite}
                    isAllDay={isAllDay}
                    startDate={startDate}
                    endDate={endDate}
                    startHour={moment(startHour, "HH:mm").format()}
                    dueHour={moment(dueHour, "HH:mm").format()}

                    hideEndDate={true}
                    setParentState={
                        (mode, dateId, value) => {
                            //#task: adapt this..
                            const update = mode === "date" ? moment(value).format() : moment(value).format('HH:mm')
                            // if(dateId === "startDate")
                            // if(dateId === "endDate")
                            // if(dateId === "startHour")
                            // if(dateId === "dueHour")
                        }
                    }
                    setIsAllDayParent={(isAllDay) => setSelectedIsAllDay(isAllDay)}
                />
                {/* {isAllDaySwitch(editable, isAllDay)}
                {datesForm(editable, isEdit, isAllDay, startDate, endDate)}
                {!isAllDay && timesForm(editable, isEdit, isAllDay, startHour, dueHour)} */}
            </View>
        )
    }

    //##PENDING TASK
    const renderCurrentTask = () => {
        const isPickedTask = _.isEqual(newTask, pickedTask)
        return (
            <View>
                {renderCurrentTaskHeader()}
                <View style={{ marginTop: theme.padding / 1.25 }}>
                    <TaskItem task={newTask} isPicked={isPickedTask} />
                    {isPickedTask && props.children}
                    {isPickedTask &&
                        <Button
                            mode="contained"
                            onPress={refreshConflicts}
                            containerStyle={{ alignSelf: 'flex-end' }}
                            outlinedColor={theme.colors.primary}
                        >
                            Modifier
                        </Button>
                    }
                </View>
            </View>
        )
    }

    const noConflicts = _.isEmpty(tasks)
    const isPickedDate = pickedDate !== ''

    return (
        <Modal
            isVisible={isVisible}
            style={styles.modal}
            onBackdropPress={toggleModal}>
            <View style={styles.container}>
                <AppBar />
                {noConflicts ?
                    <View style={{ flex: 1 }}>
                        <EmptyList
                            icon={faShieldCheck}
                            header='Aucun conflit'
                            description="Aucun conflit n'a été détécté. Vous pouvez soumettre cette tâche."
                        />
                    </View>
                    :
                    <ScrollView style={{ flex: 1 }}>
                        <View style={styles.conflictsContainer}>
                            {renderDates()}
                            {isPickedDate && renderTasks()}
                            {renderCurrentTask()}
                        </View>
                    </ScrollView>
                }
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    modal: {
        maxHeight: constants.ScreenHeight,
        margin: 0,
        marginTop: constants.ScreenHeight * 0.05,
    },
    container: {
        flex: 1,
        backgroundColor: theme.colors.white,
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15
    },
    //conflicts
    conflictsContainer: {
        flex: 1,
        paddingHorizontal: theme.padding
    },
    datesContainer: {
    },
    date: {
        paddingVertical: theme.padding / 1.75,
        paddingHorizontal: theme.padding / 1.5,
        borderWidth: 1,
        borderRadius: 25,
    },
    tasksContainer: {
        flex: 1,
        paddingHorizontal: theme.padding,
        paddingVertical: 5,
        // backgroundColor: 'pink'
    },
    header: {
        // marginTop: 5,
        flexDirection: 'row',
        alignItems: 'center',
    },
    task: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        paddingVertical: 5,
        paddingHorizontal: 10,
    },
    //Updates
    updatesContainer: {
        flex: 0.45,
        marginHorizontal: theme.padding,
        paddingTop: theme.padding,
        paddingBottom: theme.padding / 2,
        //backgroundColor: 'pink',
        borderTopWidth: StyleSheet.hairlineWidth * 2,
        borderTopColor: theme.colors.gray_light
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 15,
        // backgroundColor: 'pink'
    }
})

export default TasksConflicts



    // const tasks = { }
    // const tasks = {
    //     "GS-TC-HaK4": [
    //         {
    //             "id": "GS-TC-Pjw4",
    //             //"address": [Object],
    //             //"assignedTo": [Object],
    //             "color": "#25D366",
    //             "createdAt": "2021-04-13T07:59:46+00:00",
    //             //"createdBy": [Object],
    //             "date": "2021-04-13",
    //             "deleted": false,
    //             "description": "",
    //             "editedAt": "2021-04-13T07:59:46+00:00",
    //             //"editedBy": [Object], 
    //             "isAllDay": false,
    //             "startHour": '08:00',
    //             "dueHour": '10:00',
    //             "name": "Isallday",
    //             "natures": ['com'],
    //             "priority": "Moyenne",
    //             //"project": [Object],
    //             "status": "En cours",
    //             "type": "Normale"
    //         },
    //         {
    //             "id": "GS-TC-Pjw4",
    //             //"address": [Object],
    //             //"assignedTo": [Object],
    //             "color": "#25D366",
    //             "createdAt": "2021-04-13T07:59:46+00:00",
    //             //"createdBy": [Object],
    //             "date": "2021-04-13",
    //             "deleted": false,
    //             "description": "",
    //             "editedAt": "2021-04-13T07:59:46+00:00",
    //             //"editedBy": [Object], 
    //             "isAllDay": false,
    //             "startHour": '12:00',
    //             "dueHour": '16:00',
    //             "name": "Isallday",
    //             "natures": ['com'],
    //             "priority": "Moyenne",
    //             //"project": [Object],
    //             "status": "En cours",
    //             "type": "Normale"
    //         }
    //     ]
    // }

    // const newTask = {
    //     "id": "GS-TC-Pjw4",
    //     //"address": [Object],
    //     //"assignedTo": [Object],
    //     "color": "#25D366",
    //     "createdAt": "2021-04-13T07:59:46+00:00",
    //     //"createdBy": [Object],
    //     "date": "2021-04-13",
    //     "deleted": false,
    //     "description": "",
    //     "editedAt": "2021-04-13T07:59:46+00:00",
    //     //"editedBy": [Object], 
    //     "isAllDay": false,
    //     "startHour": '08:00',
    //     "dueHour": '10:00',
    //     "name": "Isallday",
    //     "natures": ['com'],
    //     "priority": "Moyenne",
    //     //"project": [Object],
    //     "status": "En cours",
    //     "type": "Normale"
    // }