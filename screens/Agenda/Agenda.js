
import React, { Component } from 'react';
import { Alert, StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { Agenda, LocaleConfig } from 'react-native-calendars';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import _ from 'lodash'
import firebase from '@react-native-firebase/app'

import moment from 'moment';
import 'moment/locale/fr'
moment.locale('fr')

import OffLineBar from '../../components/OffLineBar'
import PickerBar from '../../components/PickerBar'
import Appbar from '../../components/Appbar'
import TasksTab from '../../components/TasksTab'
import Filter from '../../components/Filter'
import MyFAB from '../../components/MyFAB'
import EmptyList from '../../components/EmptyList'

import { load, myAlert, toggleFilter, setFilter, handleFilterAgenda as applyFilterAgenda, handleFilterTasks as applyFilterTasks } from '../../core/utils'
import * as theme from '../../core/theme'
import { constants } from '../../core/constants'
// const testIDs = require('../testIDs');
import { withNavigation } from 'react-navigation'
import { connect } from 'react-redux'

LocaleConfig.locales['fr'] = {
    monthNames: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
    monthNamesShort: ['Janv.', 'Févr.', 'Mars', 'Avril', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'],
    dayNames: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
    dayNamesShort: ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'],
    today: 'Aujourd\'hui'
}
LocaleConfig.defaultLocale = 'fr'

const db = firebase.firestore()
const KEYS_TO_FILTERS = ['type', 'status', 'priority', 'project.id', 'assignedTo.id']

const types = [
    { label: 'Tous', value: '' },
    { label: 'Normale', value: 'Normale' },
    { label: 'Rendez-vous', value: 'Rendez-vous' },
    { label: 'Visite technique', value: 'Visite technique' },
    { label: 'Installation', value: 'Installation' },
    { label: 'Rattrapage', value: 'Rattrapage' },
    { label: 'Panne', value: 'Panne' },
    { label: 'Entretien', value: 'Entretien' },
]

const priorities = [
    { label: 'Toutes', value: '' },
    { label: 'Urgente', value: 'urgente' },
    { label: 'Moyenne', value: 'moyenne' },
    { label: 'Faible', value: 'faible' },
]

const statuses = [
    { label: 'Tous', value: '' },
    { label: 'En attente', value: 'En attente' },
    { label: 'En cours', value: 'En cours' },
    { label: 'Terminé', value: 'Terminé' },
    { label: 'Annulé', value: 'Annulé' },
]

class Agenda2 extends Component {
    constructor(props) {
        super(props)
        this.isAgenda = this.props.navigation.getParam('isAgenda', false) //#task: set it to true
        this.loadItems = this.loadItems.bind(this)
        this.refreshItems = this.refreshItems.bind(this)
        this.handleFilter = this.handleFilter.bind(this)
        this.toggleTasksTab = this.toggleTasksTab.bind(this)
        this.projectFilter = this.props.navigation.getParam('projectFilter', { id: '', name: '' })

        this.state = {
            //Settings
            isAgenda: this.isAgenda,
            isCalendar: true,

            //Calendar mode
            items: {},
            filteredItems: {},

            //List mode
            taskItems: [],
            filteredTaskItems: [],

            //filter fields
            type: '',
            status: '',
            priority: '',
            assignedTo: { id: '', fullName: '' },
            project: this.projectFilter,
            filterOpened: false,
        }
    }

    componentWillUnmount() {
        this.unsubscribeAgenda && this.unsubscribeAgenda()
        //this.allTasksListeners.length > 0 && this.allTasksListeners.forEach((tasksListener) => tasksListener())
    }

    refreshItems(refresh) {
        if (refresh) {
            this.setState({ items: {}, filteredItems: {} })
            this.loadItems()
        }
    }

    setTasksQuery(agendaRef) {
        const roleId = this.props.role.id
        const { isAgenda } = this.state
        const { currentUser } = firebase.auth()

        let query = null

        //AGENDA
        if (isAgenda) {
            query = agendaRef.collection('Tasks').where('assignedTo.id', '==', currentUser.id)
            return query
        }

        //PLANNING
        //if (roleId === 'admin')
        query = agendaRef.collection('Tasks')

        // else if (roleId === 'dircom')
        //     query = agendaRef.collection('Tasks').where('assignedTo.role', '==', 'com')

        // else if (roleId === 'tech')
        //     query = agendaRef.collection('Tasks').where('assignedTo.role', '==', 'poseur')

        // else if (roleId === 'com')
        //     query = agendaRef.collection('Tasks').where('assignedTo.id', '==', currentUser.id)

        // else if (roleId === 'poseur')
        //     query = agendaRef.collection('Tasks')

        return query
    }

    loadItems(day) {
        setTimeout(async () => {
            // this.allTasksListeners = []

            this.unsubscribeAgenda = db.collection('Agenda').onSnapshot((agendaSnapshot) => {
                agendaSnapshot.forEach(async (dateDoc) => {
                    const date = dateDoc.id //exp: 2021-01-07

                    //if (!this.state.items[date]) {
                    const query = this.setTasksQuery(dateDoc.ref)
                    const unsubscribeTasks = query.onSnapshot((tasksSnapshot) => { //#todo: unsubscribe all listeners
                        this.state.items[date] = []

                        if (tasksSnapshot === null) return

                        console.log('tasksSnapshot', tasksSnapshot)

                        tasksSnapshot.forEach((taskDoc) => {

                            const task = taskDoc.data()
                            const dueDate = moment(task.dueDate).format('YYYY-MM-DD')
                            const startDate = moment(task.startDate).format('YYYY-MM-DD')
                            const isPeriod = moment(startDate).isBefore(dueDate, 'day')
                            const duration = moment(dueDate).diff(startDate, 'day') + 1
                            let timeLine = 1
                            let dayProgress = `${timeLine}/${duration}`

                            this.state.items[date].push({
                                id: taskDoc.id,
                                date: date,
                                name: task.name,
                                type: task.type,
                                status: task.status,
                                priority: task.priority.toLowerCase(),
                                project: task.project,
                                assignedTo: task.assignedTo,
                                dayProgress: dayProgress
                            })

                            //Tasks lasting for 2days or more...
                            if (isPeriod) {
                                timeLine = 2
                                var dateIterator = moment(startDate).add(1, 'day').format('YYYY-MM-DD')
                                let predicate = (moment(dateIterator).isBefore(dueDate, 'day') || moment(dateIterator).isSame(dueDate, 'day'))

                                while (predicate) {
                                    dayProgress = `${timeLine}/${duration}`
                                    this.state.items[dateIterator] = []
                                    this.state.items[dateIterator].push({
                                        id: taskDoc.id,
                                        date: dateIterator,
                                        name: task.name,
                                        type: task.type,
                                        status: task.status,
                                        priority: task.priority.toLowerCase(),
                                        project: task.project,
                                        assignedTo: task.assignedTo,
                                        dayProgress: dayProgress,
                                        // labels: [task.priority.toLowerCase()],
                                    })

                                    timeLine += 1
                                    dateIterator = moment(dateIterator).add(1, 'day').format('YYYY-MM-DD')
                                    predicate = (moment(dateIterator).isBefore(dueDate, 'day') || moment(dateIterator).isSame(dueDate, 'day'))
                                }
                            }

                            const newItems = {}
                            Object.keys(this.state.items).forEach(key => {
                                newItems[key] = this.state.items[key]
                            })
                            this.setState({ items: newItems }, () => {
                                const taskItems = this.setTaskItems()
                                this.setState({ taskItems }, () => this.handleFilter(false))
                            })
                        })
                    })

                    // this.allTasksListeners.push(unsubscribeTasks)

                    // }
                })
            })

        }, 1000)
    }

    renderTaskStatusController(date, taskId, status) {
        switch (status) {
            case 'En cours':
                return <MaterialCommunityIcons name='check-circle-outline' size={30} color='#BDBDBD'
                    onPress={() => db.collection('Agenda').doc(date).collection('Tasks').doc(taskId).update({ status: 'Terminé' })} />

            case 'Terminé':
                return <MaterialCommunityIcons name='check-circle' size={30} color={theme.colors.primary}
                    onPress={() => db.collection('Agenda').doc(date).collection('Tasks').doc(taskId).update({ status: 'En cours' })} />

            case 'Annulé':
                return <MaterialCommunityIcons name='close-circle-outline' size={30} color={theme.colors.error} />

            case 'En attente':
                return <MaterialCommunityIcons name='dots-horizontal-circle-outline' size={30} color={theme.colors.placeholder} />

            default:
                return null
        }
    }

    renderItem(item) {

        const priority = item.priority
        const label = (
            <View style={{ padding: 5, justifyContent: 'center', alignItems: 'center', backgroundColor: priority === 'urgente' ? '#f5276d' : priority === 'faible' ? '#f2d004' : theme.colors.agenda, borderRadius: 3 }}>
                <Text style={{ color: 'white', fontSize: 8 }}>{priority}</Text>
            </View >
        )

        return (
            <TouchableOpacity onPress={() => this.props.navigation.navigate('CreateTask', { onGoBack: this.refreshItems, DateId: item.date, TaskId: item.id })} style={styles.item}>
                <View style={{ flex: 0.8, justifyContent: 'space-between', height: constants.ScreenHeight * 0.1, marginVertical: 10 }}>
                    <Text numberOfLines={1} style={theme.customFontMSbold.body}>{item.name}</Text>
                    <Text style={[theme.customFontMSsemibold.caption, { color: 'gray', marginTop: 5 }]}>{item.type} {item.dayProgress !== '1/1' && <Text style={[theme.customFontMSregular.caption, { fontWeight: 'normal' }]}>(jour {item.dayProgress})</Text>}</Text>
                </View>

                <View style={{ flex: 0.2, justifyContent: 'space-between', alignItems: 'center', paddingVertical: 5 }}>
                    {label}
                    {this.renderTaskStatusController(item.date, item.id, item.status)}
                </View>
            </TouchableOpacity>
        )
    }

    renderEmptyData() {
        const { isConnected } = this.props.network
        return (<EmptyList iconName='format-list-bulleted' header='Liste des tâches' description='Aucune tâche planifiée pour ce jour-ci.' offLine={!isConnected} />)
    }

    renderEmptyDate() {
        return (
            <View style={styles.emptyDate}>
                <Text style={[theme.customFontMSregular.body, { color: theme.colors.placeholder }]}>Aucune tâche</Text>
            </View>
        )
    }

    handleFilter(toggle) {
        if (toggle) toggleFilter(this)

        const { isCalendar, items, taskItems, type, status, priority, assignedTo, project, filterOpened } = this.state
        const fields = [{ label: 'type', value: type }, { label: 'status', value: status }, { label: 'priority', value: priority }, { label: 'project.id', value: project.id }, { label: 'assignedTo.id', value: assignedTo.id }]

        if (isCalendar) { //Calendar mode
            let filteredItems = {}
            filteredItems = applyFilterAgenda(items, filteredItems, fields, KEYS_TO_FILTERS)
            this.setState({ filteredItems })
        }

        else { //List mode
            let filteredTaskItems = []
            filteredTaskItems = applyFilterTasks(taskItems, fields, KEYS_TO_FILTERS)
            this.setState({ filteredTaskItems })
        }
    }

    renderAppBarPicker() {
        const { isAgenda } = this.state
        const roleId = this.props.role.id
        return (
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                <Text style={[theme.customFontMSmedium.title, { color: '#fff', marginHorizontal: 10 }]}>{isAgenda ? 'Mon agenda' : 'Planning'}</Text>
                <MaterialIcons name='arrow-drop-down' color='#fff' size={33} />
            </View>
        )
    }

    setCalendarType(isAgenda) {
        this.setState({ isAgenda }, () => this.refreshItems(true))
    }

    //Tab functions
    setTaskItems() {
        const { items } = this.state
        let tasksList = []

        for (let key in items) { //key is "date"
            let tasks = items[key]

            if (tasks.length > 0) {
                let elements = []
                tasks.forEach((task) => elements.push(task)) //other elements: tasks in that date
                tasksList.push(elements) // array of arrays
            }
        }

        return tasksList
    }

    renderTaskItems() {
        const { filteredTaskItems } = this.state
        return filteredTaskItems.map((item, key) => {
            return (
                <View style={{ padding: 15 }}>
                    <Text style={theme.customFontMSbold.header}>{item[0].date}</Text>
                    {item.map((taskItem) => {
                        return this.renderItem(taskItem)
                    })}
                </View>
            )
        })
    }

    toggleTasksTab(bool) {
        this.setState({ isCalendar: bool }, () => this.handleFilter(false))
    }

    render() {

        const roleId = this.props.role.id
        let { isCalendar, displayType, items, filteredItems, type, status, priority, assignedTo, project, filterOpened } = this.state //items and filter fields
        const filterActivated = !_.isEqual(items, filteredItems)

        return (
            <View style={{ flex: 1 }}>

                { (roleId === 'admin' || roleId === 'dircom' || roleId === 'tech') ?
                    <PickerBar
                        options={[
                            { id: 0, title: "Mon agenda" },
                            { id: 1, title: "Planning" },
                        ]}

                        functions={[
                            () => this.setCalendarType(true),
                            () => this.setCalendarType(false),
                        ]}
                        menuTrigger={this.renderAppBarPicker()}
                        main={this}
                        filterOpened={filterOpened}
                        type={type}
                        status={status}
                        priority={priority}
                        project={project}
                        assignedTo={assignedTo} />
                    :
                    <Appbar menu title titleText='Mon agenda' />
                }

                <TasksTab isCalendar={isCalendar} onPress1={() => this.toggleTasksTab(false)} onPress2={() => this.toggleTasksTab(true)} />

                {filterActivated &&
                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 5, backgroundColor: theme.colors.secondary, }}>
                        <Text style={[theme.customFontMSsemibold.caption, { color: '#fff' }]}>Filtre activé</Text>
                    </View>
                }

                <View style={{ flex: 1 }} >
                    {isCalendar ?
                        <Agenda
                            LocaleConfig
                            //displayLoadingIndicator
                            renderEmptyData={this.renderEmptyData.bind(this)}
                            items={this.state.filteredItems}
                            loadItemsForMonth={this.loadItems}
                            selected={moment().format('YYYY-MM-DD')}
                            renderItem={this.renderItem.bind(this)}
                            renderEmptyDate={this.renderEmptyDate.bind(this)}
                            rowHasChanged={(r1, r2) => { return true }}
                            theme={{
                                dotColor: theme.colors.agendaLight,
                                todayTextColor: theme.colors.primary,
                                selectedDayBackgroundColor: theme.colors.primary,
                                agendaDayTextColor: theme.colors.agendaLight,
                                agendaDayNumColor: theme.colors.agendaLight,
                                agendaTodayColor: theme.colors.primary,
                                backgroundColor: '#F1F1F8',
                            }}
                        />
                        :
                        <ScrollView contentContainerStyle={{ paddingBottom: constants.ScreenHeight * 0.1 }}>
                            {this.renderTaskItems()}
                        </ScrollView>
                    }
                </View>
                <MyFAB onPress={() => this.props.navigation.navigate('CreateTask')} />
            </View>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        role: state.roles.role,
        network: state.network,
        //fcmToken: state.fcmtoken
    }
}

export default connect(mapStateToProps)(Agenda2)

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: 'white',
        borderRadius: 5,
        paddingRight: 5,
        paddingLeft: 15,
        marginRight: 10,
        marginTop: 10,
    },
    emptyDate: {
        justifyContent: 'center',
        marginLeft: 19,
        height: 15,
        flex: 1,
        paddingTop: 30,
    },
})









       // const labels =
        //     item.labels &&
        //     item.labels.map(label => (
        //         <View key={`label-${label}`} style={{ padding: 5, justifyContent: 'center', alignItems: 'center', backgroundColor: label === 'urgente' ? theme.colors.error : label === 'faible' ? theme.colors.primary : colors.primary, borderRadius: 3 }}>
        //             <Text style={{ color: 'white', fontSize: 8 }}>{label}</Text>
        //         </View>
        //     ))