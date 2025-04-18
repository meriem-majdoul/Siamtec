import React, { Component } from 'react'
import { StyleSheet, Text, View, FlatList } from 'react-native'
import { connect } from 'react-redux'
import { faCalendar } from '@fortawesome/free-solid-svg-icons'

import moment from 'moment';
import 'moment/locale/fr'
moment.locale('fr')

import { db, auth } from '../../firebase'
import * as theme from '../../core/theme'
import { constants } from '../../core/constants'
import { load } from '../../core/utils'
import { fetchDocs, fetchDocuments } from '../../api/firestore-api'
import { renderSection } from './helpers'

import { EmptyList, TaskItem, Loading } from '../../components'

class Tasks extends Component {
    constructor(props) {
        super(props)
        // this.fetchDocs = fetchDocs.bind(this)

        this.state = {
            tasksList: [],
            tasksCount: 0,
            loading: true
        }
    }

    async componentDidMount() {
        const today = moment().format('YYYY-MM-DD')
        const query = db
            .collection('Agenda')
            .where('assignedTo.id', '==', auth.currentUser.uid)
            .where('date', '>=', today)
            .orderBy('date', 'asc')
            .limit(5)

        let tasksList = await fetchDocuments(query)
        tasksList = this.formatTasks(tasksList)
        this.setState({ tasksList, tasksCount: tasksList.length, loading: false })
    }

    tasksSection(isConnected) {
        let { tasksCount, tasksList } = this.state
        const onPressTask = (TaskId) => {
            this.props.navigation.navigate('CreateTask', { prevScreen: 'Summary', onGoBack: () => console.log('Do nothing...'), TaskId })
        }

        //Headers & items
        const renderItem = (item) => {
            if (item.item.isHeader) {
                return <Text style={[theme.customFontMSregular.body, { paddingVertical: 10 }]}>{item.item.label}</Text>
            }
            else return <TaskItem task={item.item} onPress={() => onPressTask(item.item.id)} />
        }

        const navParams = { isRoot: false, isAgenda: true }
        return renderSection('Tâches', faCalendar, tasksList, tasksCount, this.props.navigation, 'Agenda', navParams, renderItem, 'Tâches', 'Aucune nouvelle tâche.', isConnected)
    }

    formatTasks(tasksList) {

        const today = { label: "Ajourd'hui", value: moment().format('YYYY-MM-DD') }
        const tomorrow = { label: "Demain", value: moment().add(1, 'day').format('YYYY-MM-DD') }
        const startThisWeek = { label: "Cette semaine", value: moment().add(2, 'day').format('YYYY-MM-DD') }
        const endThisWeek = { label: "Cette semaine", value: moment().add(7, 'days').format('YYYY-MM-DD') }

        let currentDate = ''

        for (let i = 0; i < tasksList.length; i++) {
            const task = tasksList[i]

            if (currentDate !== task.date) {
                currentDate = task.date

                const isToday = moment(task.date).isSame(today.value, 'day')
                const isTomorrow = moment(task.date).isSame(tomorrow.value, 'day')
                //const isThisWeek = moment(task.date).isSameOrAfter(startThisWeek.value, 'day') && moment(task.date).isBefore(endThisWeek.value, 'day')

                if (isToday)
                    tasksList.splice(i, 0, { id: i, label: today.label, isHeader: true })

                else if (isTomorrow)
                    tasksList.splice(i, 0, { id: i, label: tomorrow.label, isHeader: true })

                // else if (isThisWeek)
                //     tasksList.splice(i, 0, { id: i, label: startThisWeek.label, isHeader: true })

                else tasksList.splice(i, 0, { id: i, label: moment(currentDate, 'YYYY-MM-DD').format('DD-MM-YYYY'), isHeader: true })
            }

        }

        return tasksList
    }

    tasksSummary() {
        const columnStyle = { flex: 1, justifyContent: 'center', alignItems: 'center' }
        return (
            <View style={{ height: constants.ScreenHeight * 0.15, borderRadius: 25, backgroundColor: theme.colors.white, flexDirection: 'row', ...theme.style.shadow }}>
                <View style={columnStyle}>
                    <Text>30</Text>
                    <Text>En retard</Text>
                </View>
                <View style={columnStyle}>
                    <Text>55</Text>
                    <Text>En cours</Text>
                </View>
                <View style={columnStyle}>
                    <Text>280</Text>
                    <Text>Terminé</Text>
                </View>
            </View>
        )
    }

    render() {
        const { loading } = this.state
        const { isConnected } = this.props.network

        return (
            <View style={styles.mainContainer}>
                {loading ?
                    <Loading />
                    :
                    this.tasksSection(isConnected)
                }
            </View>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        role: state.roles.role,
        permissions: state.permissions,
        network: state.network,
        //fcmToken: state.fcmtoken
    }
}

export default connect(mapStateToProps)(Tasks)


const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: theme.colors.white
    },
})

