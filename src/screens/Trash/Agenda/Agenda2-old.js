import React, { Component } from 'react';
import { Alert, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Agenda, LocaleConfig } from 'react-native-calendars';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import MyFAB from '../../../components/MyFAB'
import EmptyList from '../../../components/EmptyList';

import { colors, fonts } from '../../styles';
import firebase from '@react-native-firebase/app';

import moment from 'moment';
import 'moment/locale/fr'
moment.locale('fr')

import * as theme from '../../../core/theme'
import { constants } from '../../../core/constants'
// const testIDs = require('../testIDs');
import { withNavigation } from 'react-navigation'
import { MainBundlePath } from 'react-native-fs';

LocaleConfig.locales['fr'] = {
    monthNames: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
    monthNamesShort: ['Janv.', 'Févr.', 'Mars', 'Avril', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'],
    dayNames: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
    dayNamesShort: ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'],
    today: 'Aujourd\'hui'
};
LocaleConfig.defaultLocale = 'fr';

const db = firebase.firestore()

class Agenda2 extends Component {
    constructor(props) {
        super(props);

        this.state = {
            items: {}
        }
    }

    // shouldComponentUpdate(nextProps) {
    //     let shouldUpdate = false
    //     if (this.props.items !== nextProps.items) shouldUpdate = true

    //     console.log('shouldUpdate: ' + shouldUpdate)
    //     console.log(this.props.items)
    //     console.log(nextProps.items)

    //     return shouldUpdate
    // }

    render() {

        return (
            <View style={{ flex: 1 }} >
                <Agenda
                    LocaleConfig
                    //displayLoadingIndicator
                    renderEmptyData={this.renderEmptyData.bind(this)}
                    items={this.props.items}
                    loadItemsForMonth={this.props.loadItems}
                    selected={moment().subtract(1, 'day').format('YYYY-MM-DD')}
                    renderItem={this.renderItem.bind(this)}
                    renderEmptyDate={this.renderEmptyDate.bind(this)}
                    rowHasChanged={this.rowHasChanged.bind(this)}
                    theme={{
                        dotColor: colors.primaryLight,
                        todayTextColor: theme.colors.primary,
                        selectedDayBackgroundColor: theme.colors.primary,
                        agendaDayTextColor: colors.primaryLight,
                        agendaDayNumColor: colors.primaryLight,
                        agendaTodayColor: theme.colors.primary,
                        backgroundColor: '#F1F1F8',
                    }}
                    onDayPress={(day) => console.log(day)}
                />
                <MyFAB onPress={() => this.props.navigation.navigate('CreateTask', { onGoBack: this.props.main.refreshItems })} />
            </View >
        )
    }


    renderEmptyData() {
        return (<EmptyList iconName='format-list-bulleted' header='Liste des tâches' description='Aucune tâche planifiée pour ce jour-ci.' />)
    }

    renderTaskStatusController(key, date, taskId, status) {
        switch (status) {
            case 'En cours':
                return <MaterialCommunityIcons name='check-circle-outline' size={30} color='#BDBDBD'
                    onPress={async () => {
                        const { main } = this.props
                        db.collection('Agenda').doc(date).collection('Tasks').doc(taskId).update({ status: 'Terminé' })
                        // main.refreshItems()

                        let filteredItems = main.filteredItems
                        console.log('key: ' + filteredItems[date][key].status)
                        filteredItems[date][key].status = 'Terminé'
                        main.filteredItems = filteredItems
                    }} />

            case 'Terminé':
                return <MaterialCommunityIcons name='check-circle' size={30} color={theme.colors.primary}
                    onPress={async () => {
                        const { main } = this.props
                        db.collection('Agenda').doc(date).collection('Tasks').doc(taskId).update({ status: 'En cours' })
                        // main.refreshItems()

                        let filteredItems = main.filteredItems
                        console.log('key: ' + filteredItems[date][key].status)
                        filteredItems[date][key].status = 'En cours'
                        main.filteredItems = filteredItems

                        // let items = main.state.items
                        // items[date][key].status = 'En cours'
                        // main.setState({ items })
                    }} />

            case 'Annulé':
                return <MaterialCommunityIcons name='close-circle-outline' size={30} color={theme.colors.error} />

            case 'En attente':
                return <MaterialCommunityIcons name='dots-horizontal-circle-outline' size={30} color={theme.colors.placeholder} />

            default:
                return null
        }
    }

    renderItem(item) {
        console.log('rendering item...')
        console.log(item)

        const labels =
            item.labels &&
            item.labels.map(label => (
                <View key={`label-${label}`} style={{ padding: 5, justifyContent: 'center', alignItems: 'center', backgroundColor: label === 'urgente' ? theme.colors.error : label === 'faible' ? theme.colors.primary : colors.primary, borderRadius: 3 }}>
                    <Text style={{ color: 'white', fontSize: 8 }}>{label}</Text>
                </View>
            ))

        return (
            //Make swipable view to change task status
            <TouchableOpacity onPress={() => this.props.navigation.navigate('CreateTask', { isEdit: true, title: 'Modifier la tâche', DateId: item.date, TaskId: item.id, onGoBack: this.props.main.refreshItems })} style={styles.item}>
                <View style={{ flex: 0.8, justifyContent: 'space-between', height: constants.ScreenHeight * 0.1, marginVertical: 10 }}>
                    <Text numberOfLines={1} style={theme.customFontMSbold.body}>{item.name}</Text>
                    <Text style={[theme.customFontMSsemibold.caption, { color: 'gray', marginTop: 5 }]}>{item.type} {item.dayProgress !== '1/1' && <Text style={[theme.customFontMSregular.caption, { fontWeight: 'normal' }]}>(jour {item.dayProgress})</Text>}</Text>
                </View>

                <View style={{ flex: 0.2, justifyContent: 'space-between', alignItems: 'center', paddingVertical: 5 }}>
                    {labels}
                    {this.renderTaskStatusController(item.key, item.date, item.id, item.status)}
                </View>
            </TouchableOpacity>
        )
    }

    renderEmptyDate() {
        return (
            <View style={styles.emptyDate}>
                <Text style={[theme.customFontMSregular.body, { color: theme.colors.placeholder }]}>Aucune tâche</Text>
            </View>
        )
    }

    rowHasChanged(r1, r2) { //use this to detect item changes and re-render item that has changed (exp: task status change)
        return true
        //return r1.status !== r2.status;
    }

    timeToString(time) {
        const date = new Date(time);
        return date.toISOString().split('T')[0];
    }
}

export default withNavigation(Agenda2)

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.whiteTwo,
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
});