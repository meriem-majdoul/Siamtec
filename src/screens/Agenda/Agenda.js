
import React, { Component } from 'react';
import { Alert, StyleSheet, Text, View, TouchableOpacity, ScrollView, FlatList, RefreshControl } from 'react-native';
import { Agenda, LocaleConfig } from 'react-native-calendars';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { faCaretDown, faCheckCircle, faTimesCircle, faPauseCircle } from 'react-native-vector-icons/FontAwesome5' 
const XDate = require('xdate')

import dateutils from 'react-native-calendars/src/dateutils'

import _ from 'lodash'
import firebase, { db } from '../../firebase'

import moment from 'moment'
import 'moment/locale/fr'
moment.locale('fr')

import ActiveFilter from '../../components/ActiveFilter'
import CustomIcon from '../../components/CustomIcon'
import OffLineBar from '../../components/OffLineBar'
import PickerBar from '../../components/PickerBar'
import Appbar from '../../components/Appbar'
import PlanningTabs from '../../components/PlanningTabs'
import Filter from '../../components/Filter'
import MyFAB from '../../components/MyFAB'
import EmptyList from '../../components/EmptyList'
import Loading from '../../components/Loading'

import { configureQuery } from '../../core/privileges'
import { load, myAlert, toggleFilter, setFilter, handleFilterAgenda as applyFilterAgenda, handleFilterTasks as applyFilterTasks } from '../../core/utils'
import * as theme from '../../core/theme'
import { constants, highRoles } from '../../core/constants'
import { connect } from 'react-redux'
import { ActivityIndicator } from 'react-native';
import { TaskItem } from '../../components';

LocaleConfig.locales['fr'] = {
    monthNames: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
    monthNamesShort: ['Janv.', 'Févr.', 'Mars', 'Avril', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'],
    dayNames: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
    dayNamesShort: ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'],
    today: 'Aujourd\'hui'
}
LocaleConfig.defaultLocale = 'fr'

const KEYS_TO_FILTERS = ['type', 'status', 'priority', 'project.id', 'assignedTo.id']

const types = [
    { label: 'Tous', value: '' },
    { label: 'Normale', value: 'Normale' }, //#static
    { label: 'Visite technique préalable', value: 'Visite technique préalable' }, //#dynamic
    { label: 'Visite technique', value: 'Visite technique' }, //#dynamic
    { label: 'Installation', value: 'Installation' }, //#dynamic
    { label: 'Rattrapage', value: 'Rattrapage' }, //#dynamic
    { label: 'Panne', value: 'Panne' }, //#static
    { label: 'Entretien', value: 'Entretien' }, //#static
    { label: 'Présentation étude', value: 'Présentation étude' }, //restriction: user can not create rdn manually (only during the process and only DC can posptpone it during the process)
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
        this.isRoot = this.props.navigation.getParam('isRoot', true) //#task: set it to true
        this.loadItems = this.loadItems.bind(this)
        this.refreshItems = this.refreshItems.bind(this)
        this.handleFilter = this.handleFilter.bind(this)
        this.togglePlanningTabs = this.togglePlanningTabs.bind(this)
        this.projectFilter = this.props.navigation.getParam('projectFilter', { id: '', name: '' })

        const lowRoles = ['com', 'poseur']
        const currentRole = this.props.role.id
        const isLowRole = lowRoles.includes(currentRole)
        this.isAgenda = isLowRole || this.isAgenda

        this.state = {
            //Settings
            isAgenda: this.isAgenda,

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

            selectedDay: moment().format('YYYY-MM-DD'),
            currentMonthYear: moment().format('MMMM YYYY'),
            refreshing: false,
        }
    }

    refreshItems(refresh) {
        if (!refresh) return
        this.setState({ refreshing: true })
        const { selectedDay } = this.state
        this.setState({ items: {}, filteredItems: {} }, () => this.loadItems(selectedDay))
    }

    setTasksQuery() {
        const roleId = this.props.role.id
        const { isAgenda } = this.state
        const { currentUser } = firebase.auth()
        let query = null

        //AGENDA (static)
        if (isAgenda) {
            query = db
                .collection('Agenda')
                .where('assignedTo.id', '==', currentUser.uid)
                .orderBy('date', 'asc')
            return query
        }

        //PLANNING (dynamic)
        else {
            const { queryFilters } = this.props.permissions.tasks
            if (queryFilters === []) return null
            else {
                const params = { role: this.props.role.value }
                query = configureQuery('Agenda', queryFilters, params)
                return query
            }
        }

        return query
    }

    async loadItems(day) {
        let items = {}
        if (!items[day.dateString]) {
            items[day.dateString] = []
            const query = this.setTasksQuery()
            if (!query) return
            await query.get().then((tasksSnapshot) => {
                for (const taskDoc of tasksSnapshot.docs) {
                    const task = taskDoc.data()
                    const { date } = task
                    if (!items[date])
                        items[date] = []
                    items[date].push(task)
                }
            })
            this.setState({ items }, () => this.handleFilter(false))
        }
    }


    handleFilter(toggle) {
        if (toggle) toggleFilter(this)
        const { items, taskItems, type, status, priority, assignedTo, project, filterOpened } = this.state
        const fields = [
            { label: 'type', value: type },
            { label: 'status', value: status },
            { label: 'priority', value: priority },
            { label: 'project.id', value: project.id },
            { label: 'assignedTo.id', value: assignedTo.id }
        ]
        let filteredItems = {}
        filteredItems = applyFilterAgenda(items, filteredItems, fields, KEYS_TO_FILTERS)
        this.setState({ filteredItems })
    }

    renderAppBarPicker() {
        const { isAgenda } = this.state
        const roleId = this.props.role.id
        return (
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                <Text style={[theme.customFontMSregular.title, { color: theme.colors.secondary, marginHorizontal: 10 }]}>{isAgenda ? 'Mon agenda' : 'Planning'}</Text>
                <CustomIcon icon={faCaretDown} color={theme.colors.gray_dark} />
            </View>
        )
    }

    setCalendarType(isAgenda) {
        this.setState({ isAgenda }, () => this.refreshItems(true))
    }

    togglePlanningTabs(isAgenda) {
        this.setState({ isAgenda }, () => this.refreshItems(true))
    }

    onDayPress(selectedDay) {
        this.setState({ selectedDay, currentMonthYear: `${moment(selectedDay.dateString).format('MMMM YYYY')}` })
    }

    renderDay(dateObject, item) {
        if (dateObject) {
            const date = moment(dateObject.dateString, 'YYYY-MM-DD').format()
            const dayNum = moment(date).format('D')
            let dayName = moment(date).format('ddd').toUpperCase()
            dayName = dayName.slice(0, -1)
            const today = moment(date).isSame(moment().format()) ? { color: theme.colors.primary } : undefined;
            return (
                <View style={styles.day}>
                    <Text allowFontScaling={false} style={[styles.dayNum, today]}>{dayNum}</Text>
                    <Text allowFontScaling={false} style={[styles.dayText, today]}>{dayName}</Text>
                </View>
            )
        }
        else {
            return (
                <View style={styles.day}>
                    <Text allowFontScaling={false} style={[styles.dayNum, { color: '#fff' }]}></Text>
                    <Text allowFontScaling={false} style={[styles.dayText, { color: '#fff' }]}></Text>
                </View>
            )
        }
    }

    renderItem(item) {
        const onPressItem = () => {
            const navParams = { prevScreen: 'Agenda', onGoBack: this.refreshItems, TaskId: item.id }
            this.props.navigation.navigate('CreateTask', navParams)
        }
        return (
            <TaskItem
                task={item}
                onPress={onPressItem}
                style={{ width: constants.ScreenWidth * 0.8 }}
            />
        )
    }

    renderEmptyData() {
        const { isConnected } = this.props.network
        return (
            <ActivityIndicator
                size='large'
                color={theme.colors.primary}
                style={{ marginTop: constants.ScreenHeight * 0.3 }}
            />
        )
    }

    renderEmptyDate() {
        return (
            <View style={styles.item}>
                <Text style={[theme.customFontMSregular.body, { color: theme.colors.gray_dark }]}>Aucune tâche</Text>
            </View>
        )
    }

    rowHasChanged(r1, r2) {
        return r1.status !== r2.status
    }

    render() {
        const roleId = this.props.role.id
        const { canCreate } = this.props.permissions.tasks
        let { isAgenda, displayType, items, filteredItems, taskItems, filteredTaskItems, type, status, priority, assignedTo, project, filterOpened, refreshing, currentMonthYear } = this.state
        const filterActivated = !_.isEqual(items, filteredItems)
        const isHighrole = highRoles.includes(this.props.role.id)

        return (
            <View style={{ flex: 1 }}>
                {isHighrole ?
                    <PickerBar
                        main={this}
                        menu={this.isRoot}
                        titleText={currentMonthYear}
                        //Refresh
                        refresh
                        onRefresh={() => this.refreshItems(true)}
                        //Filter
                        filter
                        filterOpened={filterOpened}
                        type={type}
                        status={status}
                        priority={priority}
                        project={project}
                        assignedTo={assignedTo} />
                    :
                    <Appbar
                        back={!this.isRoot}
                        menu={this.isRoot}
                        title
                        titleText='Mon agenda'
                    />
                }

                {isHighrole &&
                    <PlanningTabs
                        isAgenda={isAgenda}
                        onPress1={() => this.togglePlanningTabs(true)}
                        onPress2={() => this.togglePlanningTabs(false)}
                    />
                }

                {filterActivated && <ActiveFilter />}

                <View style={{ flex: 1 }} >
                    <Agenda
                        LocaleConfig
                        //displayLoadingIndicator
                        renderEmptyData={this.renderEmptyData.bind(this)}
                        items={this.state.filteredItems}
                        loadItemsForMonth={this.loadItems}
                        selected={moment().format('YYYY-MM-DD')}
                        onDayPress={this.onDayPress.bind(this)}
                        renderItem={this.renderItem.bind(this)}
                        renderEmptyDate={this.renderEmptyDate.bind(this)}
                        rowHasChanged={this.rowHasChanged.bind(this)}
                        displayLoadingIndicator={true}
                        style={{ backgroundColor: theme.colors.white }}
                        //onRefresh={() => this.refreshItems(true)} <-- #bug: this line disables zIndex which is used to put background below flatlist items (issue is followed up on react-native github repository)
                        theme={{
                            dotColor: theme.colors.agendaLight,
                            todayTextColor: theme.colors.primary,
                            selectedDayBackgroundColor: theme.colors.primary,
                            agendaDayTextColor: theme.colors.agendaLight,
                            agendaDayNumColor: theme.colors.agendaLight,
                            agendaTodayColor: theme.colors.primary,
                            textDayFontFamily: 'Montserrat-Regular',
                            // backgroundColor: 'green',
                            'stylesheet.agenda.list': {
                                container: {
                                    flexDirection: 'row',
                                    alignItems: 'flex-start',
                                    justifyContent: 'flex-start',
                                },
                                // day: {
                                //     width: 63,
                                //     alignItems: 'center',
                                //     justifyContent: 'flex-start',
                                //     marginTop: 0, 
                                //     backgroundColor: 'brown'
                                // },
                                dayNum: styles.dayNum,
                                dayText: styles.dayText,
                                day: styles.day,
                            },
                            'stylesheet.agenda.main': {
                                reservations: {
                                    flex: 1,
                                    marginTop: 110,
                                },
                            }
                        }}
                        renderDay={this.renderDay}
                    />
                </View>
                {canCreate && this.isRoot && <MyFAB onPress={() => this.props.navigation.navigate('CreateTask', { prevScreen: 'Agenda', onGoBack: this.refreshItems })} />}
            </View>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        role: state.roles.role,
        network: state.network,
        permissions: state.permissions,
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
        //flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        borderRadius: 5,
        paddingVertical: 5,
        paddingHorizontal: 10,
        marginRight: 15,
        marginBottom: 10,
        //marginTop: 10,
    },
    emptyDate: {
        justifyContent: 'center',
        marginLeft: 19,
        height: 15,
        flex: 1,
        paddingTop: 30,
    },

    //Agenda theme
    day: {
        width: 63,
        alignItems: 'center',
        justifyContent: 'flex-start',
        // marginTop: 32,
    },
    dayNum: {
        fontFamily: 'Lato-Regular',
        fontSize: 18,
        color: theme.colors.secondary,
        //fontSize: 28,
        marginTop: -3
    },
    dayText: {
        fontFamily: 'Montserrat-Medium',
        marginLeft: 2,
        fontSize: 10,
        letterSpacing: 1,
        color: theme.colors.gray_googleAgenda
    }
})
