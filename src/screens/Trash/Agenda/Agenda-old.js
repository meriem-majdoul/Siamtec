//Conditionnal rendering depending on USER ROLE

import React from "react";
import { View, Text } from "react-native";

import moment from 'moment';
import 'moment/locale/fr'
moment.locale('fr')

import Appbar from '../../../components/Appbar'
import TabView from '../../../components/TabView'
import Filter from '../../../components/Filter'
import Planning from '../../Agenda/Planning';
import Calendar from '../../Agenda/Calendar';

import { load, myAlert, toggleFilter, setFilter, handleFilterAgenda as handleFilter } from '../../../core/utils'

import firebase from '@react-native-firebase/app';
import { connect } from 'react-redux'

const db = firebase.firestore()
const KEYS_TO_FILTERS = ['type', 'status', 'priority', 'project.id', 'assignedTo.id']

const types = [
    { label: 'Normale', value: 'Normale' },
    { label: 'Rendez-vous', value: 'Rendez-vous' },
    { label: 'Visite technique', value: 'Visite technique' },
    { label: 'Installation', value: 'Installation' },
    { label: 'Rattrapage', value: 'Rattrapage' },
    { label: 'Panne', value: 'Panne' },
    { label: 'Entretien', value: 'Entretien' },
]

const priorities = [
    { label: 'Urgente', value: 'Urgente' },
    { label: 'Moyenne', value: 'Moyenne' },
    { label: 'Faible', value: 'Faible' },
]

const statuses = [
    { label: 'En attente', value: 'En attente' },
    { label: 'En cours', value: 'En cours' },
    { label: 'Terminé', value: 'Terminé' },
    { label: 'Annulé', value: 'Annulé' },
]

class Agenda extends React.Component {

    constructor(props) {
        super(props)
        this.loadItems = this.loadItems.bind(this)
        this.refreshItems = this.refreshItems.bind(this)
        this.filteredItems = {}

        this.state = {
            index: 0,
            showInput: false,
            searchInput: '',
            items: {},

            //filters
            type: '',
            status: '',
            priority: '',
            assignedTo: { id: '', fullName: '' },
            project: { id: '', name: '' },
            filterOpened: false,
        }
    }

    refreshItems() {
        this.setState({ items: {} })
        this.loadItems()
    }

    setQuery(agendaRef) {
        const roleId = this.props.role.id
        const { index } = this.state
        const { currentUser } = firebase.auth()

        let query = null

        if (index === 1) {
            query = agendaRef.collection('Tasks').where('assignedTo.id', '==', currentUser.id)
            return query
        }

        if (roleId === 'admin')
            query = agendaRef.collection('Tasks')

        else if (roleId === 'dircom')
            query = agendaRef.collection('Tasks').where('role', '==', 'Directeur commercial')

        else if (roleId === 'tech')
            query = agendaRef.collection('Tasks').where('role', '==', 'Responsable technique')

        return query
    }


    loadTasks() {
        //  setTimeout(async () => {

        db.collection('Agenda').get().then((querysnapshot) => {
            querysnapshot.forEach(async (dateDoc) => {
                const date = dateDoc.id

                if (!this.state.items[date]) {
                    this.state.items[date] = []

                    const query = this.setQuery(dateDoc.ref)
                    query.get().then((tasksSnapshot) => {
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
                                key: this.state.items[date].length,
                                date: date,
                                name: task.name,
                                dayProgress: dayProgress,
                                type: task.type,
                                status: task.status,
                                labels: [task.priority.toLowerCase()],
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
                                        key: this.state.items[dateIterator].length,
                                        date: dateIterator,
                                        name: task.name,
                                        dayProgress: dayProgress,
                                        type: task.type,
                                        status: task.status,
                                        labels: [task.priority.toLowerCase()],
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
                            this.setState({ items: newItems })
                        })
                    })
                }

            })
        })

        //  }, 1000)
    }

    loadItems(day) {
        console.log('loading items........................')
        //  setTimeout(async () => {

        db.collection('Agenda').get().then((querysnapshot) => {
            querysnapshot.forEach(async (dateDoc) => {
                const date = dateDoc.id

                if (!this.state.items[date]) {
                    this.state.items[date] = []

                    const query = this.setQuery(dateDoc.ref)
                    query.get().then((tasksSnapshot) => {
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
                                key: this.state.items[date].length,
                                date: date,
                                name: task.name,
                                dayProgress: dayProgress,
                                type: task.type,
                                status: task.status,
                                labels: [task.priority.toLowerCase()],
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
                                        key: this.state.items[dateIterator].length,
                                        date: dateIterator,
                                        name: task.name,
                                        dayProgress: dayProgress,
                                        type: task.type,
                                        status: task.status,
                                        labels: [task.priority.toLowerCase()],
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
                            this.setState({ items: newItems })
                        })
                    })
                }

            })
        })

        //  }, 1000)
    }

    render() {
        const roleId = this.props.role.id
        let { items, type, status, priority, assignedTo, project, filterOpened } = this.state //items and filter fields
        let { index } = this.state
        const routes = [
            { key: 'first', title: 'PLANNING' },
            { key: 'second', title: 'MON AGENDA' },
        ]

        const fields = [{ label: 'type', value: type }, { label: 'status', value: status }, { label: 'priority', value: priority }, { label: 'project.id', value: project.id }, { label: 'assignedTo.id', value: assignedTo.id }]
        this.filteredItems = handleFilter(items, this.filteredItems, fields, KEYS_TO_FILTERS)

        console.log('filtered items')
        console.log(this.filteredItems)

        //  const filterCount = this.filteredItems.length
        //  const filterActivated = filterCount < projectsCount

        // let s = ''
        // if (filterCount > 1)
        //     s = 's'

        if (roleId === 'admin' || roleId === 'dircom' || roleId === 'tech')
            return (
                <View style={{ flex: 1 }}>
                    <Appbar menu title refresh handleRefresh={this.refreshItems} />

                    <Filter
                        main={this}
                        opened={filterOpened}
                        toggleFilter={() => toggleFilter(this)}
                        setFilter={(field, value) => setFilter(this, field, value)}
                        resetFilter={() => this.setState({ type: '', status: '', priority: '', assignedTo: { id: '', fullName: '' }, project: { id: '', name: '' } })}
                        options={[
                            { id: 0, type: 'picker', title: "Type", values: types, value: type, field: 'type' },
                            { id: 1, type: 'picker', title: "État", values: statuses, value: status, field: 'status' },
                            { id: 2, type: 'picker', title: "Priorité", values: priorities, value: priority, field: 'priority' },
                            { id: 3, type: 'screen', title: "Projet", value: project.name, field: 'project', screen: 'ListProjects', titleText: 'Filtre par projet' },
                            { id: 4, type: 'screen', title: "Affecté à", value: assignedTo.fullName, field: 'assignedTo', screen: 'ListEmployees', titleText: 'Filtre par utilisateur' },
                        ]} />

                    <TabView
                        navigationState={{ index, routes }}
                        onIndexChange={(index) => this.setState({ index }, () => this.refreshItems())} //searchInput: '', showInput: false,
                        Tab2={<Calendar main={this} items={this.filteredItems} loadItems={this.loadItems} />}
                        // Tab2={<Calendar main={this} items={this.state.items} loadItems={this.loadItems} />}
                        Tab1={<Calendar main={this} items={this.state.items} loadItems={this.loadItems} />} />
                </View>
            )

        else return (
            <View style={{ flex: 1 }}>
                <Appbar menu title titleText='Mon agenda' refresh handleRefresh={this.refreshItems} />
                <Calendar main={this} items={this.state.items} loadItems={this.loadItems} />
            </View>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        role: state.roles.role,
        //fcmToken: state.fcmtoken
    }
}

export default connect(mapStateToProps)(Agenda)











