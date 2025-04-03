import React, { Component } from 'react';
import { Alert, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Agenda, LocaleConfig } from 'react-native-calendars';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MyFAB from '../../../components/MyFAB';
import EmptyList from '../../../components/EmptyList';
import { colors, fonts } from '../../styles';
import firebase from '@react-native-firebase/app';
import moment from 'moment';
import 'moment/locale/fr';
import { useNavigation } from '@react-navigation/native';  // Importez useNavigation
import * as theme from '../../../core/theme';
import { constants } from '../../../core/constants';

moment.locale('fr');

LocaleConfig.locales['fr'] = {
    monthNames: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
    monthNamesShort: ['Janv.', 'Févr.', 'Mars', 'Avril', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'],
    dayNames: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
    dayNamesShort: ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'],
    today: 'Aujourd\'hui'
};
LocaleConfig.defaultLocale = 'fr';

const db = firebase.firestore();

const Agenda2 = (props) => {
    const navigation = useNavigation();  // Utilisation de useNavigation

    const [items, setItems] = React.useState({});

    const renderEmptyData = () => (
        <EmptyList iconName='format-list-bulleted' header='Liste des tâches' description='Aucune tâche planifiée pour ce jour-ci.' />
    );

    const renderTaskStatusController = (key, date, taskId, status) => {
        switch (status) {
            case 'En cours':
                return <MaterialCommunityIcons name='check-circle-outline' size={30} color='#BDBDBD'
                    onPress={async () => {
                        const { main } = props;
                        db.collection('Agenda').doc(date).collection('Tasks').doc(taskId).update({ status: 'Terminé' });
                        let filteredItems = main.filteredItems;
                        filteredItems[date][key].status = 'Terminé';
                        main.filteredItems = filteredItems;
                    }} />;
            case 'Terminé':
                return <MaterialCommunityIcons name='check-circle' size={30} color={theme.colors.primary}
                    onPress={async () => {
                        const { main } = props;
                        db.collection('Agenda').doc(date).collection('Tasks').doc(taskId).update({ status: 'En cours' });
                        let filteredItems = main.filteredItems;
                        filteredItems[date][key].status = 'En cours';
                        main.filteredItems = filteredItems;
                    }} />;
            case 'Annulé':
                return <MaterialCommunityIcons name='close-circle-outline' size={30} color={theme.colors.error} />;
            case 'En attente':
                return <MaterialCommunityIcons name='dots-horizontal-circle-outline' size={30} color={theme.colors.placeholder} />;
            default:
                return null;
        }
    };

    const renderItem = (item) => {
        const labels = item.labels && item.labels.map(label => (
            <View key={`label-${label}`} style={{ padding: 5, justifyContent: 'center', alignItems: 'center', backgroundColor: label === 'urgente' ? theme.colors.error : label === 'faible' ? theme.colors.primary : colors.primary, borderRadius: 3 }}>
                <Text style={{ color: 'white', fontSize: 8 }}>{label}</Text>
            </View>
        ));

        return (
            <TouchableOpacity onPress={() => navigation.navigate('CreateTask', { isEdit: true, title: 'Modifier la tâche', DateId: item.date, TaskId: item.id, onGoBack: props.main.refreshItems })} style={styles.item}>
                <View style={{ flex: 0.8, justifyContent: 'space-between', height: constants.ScreenHeight * 0.1, marginVertical: 10 }}>
                    <Text numberOfLines={1} style={theme.customFontMSbold.body}>{item.name}</Text>
                    <Text style={[theme.customFontMSsemibold.caption, { color: 'gray', marginTop: 5 }]}>{item.type} {item.dayProgress !== '1/1' && <Text style={[theme.customFontMSregular.caption, { fontWeight: 'normal' }]}>(jour {item.dayProgress})</Text>}</Text>
                </View>

                <View style={{ flex: 0.2, justifyContent: 'space-between', alignItems: 'center', paddingVertical: 5 }}>
                    {labels}
                    {renderTaskStatusController(item.key, item.date, item.id, item.status)}
                </View>
            </TouchableOpacity>
        );
    };

    const renderEmptyDate = () => (
        <View style={styles.emptyDate}>
            <Text style={[theme.customFontMSregular.body, { color: theme.colors.placeholder }]}>Aucune tâche</Text>
        </View>
    );

    const rowHasChanged = (r1, r2) => true;

    const timeToString = (time) => {
        const date = new Date(time);
        return date.toISOString().split('T')[0];
    };

    return (
        <View style={{ flex: 1 }}>
            <Agenda
                LocaleConfig
                renderEmptyData={renderEmptyData}
                items={props.items}
                loadItemsForMonth={props.loadItems}
                selected={moment().subtract(1, 'day').format('YYYY-MM-DD')}
                renderItem={renderItem}
                renderEmptyDate={renderEmptyDate}
                rowHasChanged={rowHasChanged}
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
            <MyFAB onPress={() => navigation.navigate('CreateTask', { onGoBack: props.main.refreshItems })} />
        </View>
    );
};

export default Agenda2;

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
