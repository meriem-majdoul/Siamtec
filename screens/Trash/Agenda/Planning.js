import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, Image } from 'react-native';
import DateTime from 'react-native-customize-selected-date'
import _ from 'lodash'
import Icon from 'react-native-vector-icons/FontAwesome'

import moment from 'moment'
import 'moment/locale/fr'
moment.locale('fr')

const tasks = [{
    name: 'Faire un devis',
    notes: 'Réaliser un devis pour le projet A concernant le client X',
    due_at: "2020-08-21T13:00:00+01:00",
    projet: 'projetID',
    assignee: 'userID',
    approval_status: 'pending', //approved; rejected //If you set completed to true, this field will be set to approved.
    completed: false,
    completed_by: '',
    followers: ['userFCMToken'] //for notifications 
},
{
    name: 'Rendez-vous',
    notes: 'Réaliser un devis pour le projet A concernant le client X',
    due_at: "2020-08-17T13:00:00+01:00",
    projet: 'projetID',
    assignee: 'userID',
    approval_status: 'approved', //approved; rejected //If you set completed to true, this field will be set to approved.
    completed: true,
    completed_by: '',
    followers: ['userFCMToken'] //for notifications 
}]

export default class Agenda extends Component {
    constructor(props) {
        super(props)
        this.state = {
            time: ''
        }
    }

    onChangeDate(date) {
        let task_date = ''
        tasks.forEach((task) => {
            task_date = moment(task.due_at).format('YYYY-MM-DD')
          if(task_date === date)
          alert('Titre: ' + task.name + ', Date: '+ date +' , Complétée: ' + task.completed)
        })
    }

    renderChildDay(day) {
        if (_.includes(['2020-08-17', '2020-09-10', '2020-09-20'], day)) { //All tasks are done
            return <Icon name="circle"
                //size={SCREEN_WIDTH * 0.05}
                color="green" />
        }
        if (_.includes(['2020-08-21', '2020-09-09', '2020-09-21', '2018-09-19'], day)) { //One task or more are not completed
            return <Icon name="circle"
               // size={SCREEN_WIDTH * 0.05}
                color="red" />
        }
    }

    render() {
        return (
            <View style={styles.container}>
                <Text>1</Text>
                {/* <DateTime
                    date={this.state.time}
                    changeDate={(date) => this.onChangeDate(date)}
                    format='YYYY-MM-DD'
                    renderChildDay={(day) => this.renderChildDay(day)}
                    //currentDayStyle = {{color: ''}}
                /> */}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    icLockRed: {
        width: 13 / 2,
        height: 9,
        position: 'absolute',
        top: 2,
        left: 1
    }
});

