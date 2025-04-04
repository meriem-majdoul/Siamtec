import React, { Component } from 'react'
import DatePicker from 'react-native-date-picker'
import { View, Text, StyleSheet } from 'react-native'
import { ThemeColors } from 'react-navigation'
import * as theme from '../../core/theme'
import { Title } from 'react-native-paper'
import { connect } from 'react-redux'

import moment from 'moment';
import 'moment/locale/fr'
moment.locale('fr')

import Appbar from '../../components/Appbar'

class MyDatePicker extends Component {
    constructor(props) {
        super(props)
        this.handleSubmit = this.handleSubmit.bind(this)

        const { route } = this.props;

        // Récupération des paramètres via route?.params
        this.label = route?.params?.label ?? '';
        this.showDayPicker = route?.params?.showDayPicker ?? true;
        this.showTimePicker = route?.params?.showTimePicker ?? true;
        this.isAllDay = route?.params?.isAllDay ?? false;
        this.targetField = route?.params?.targetField ?? '';

        this.state = {
            selectedDate: new Date(),
            selectedHour: new Date()
        }
    }

    handleSubmit() {

        const { selectedDate, selectedHour } = this.state

        var date = moment(selectedDate).format()
        var time = moment(selectedHour).format('HH:mm')
        let output

        if (!this.showDayPicker)
            output = time

        else if (!this.showTimePicker)
            output = date

        else output = moment(`${date} ${time}`)

        this.props.navigation.state.params.onGoBack(output, this.targetField, this.isAllDay)
        this.props.navigation.goBack()
    }

    render() {
        let { selectedDate, selectedHour } = this.state

        const titleText = this.isAllDay ? 'Journée de la tâche' : `Date ${this.label}`
        const dateTitle = this.isAllDay ? 'Selectionnez une date' : `Date ${this.label}`
        const hourTitle = `Heure ${this.label}`

        return (
            <View style={{ flex: 1 }}>
                <Appbar close title titleText={titleText} check handleSubmit={this.handleSubmit} />
                <View style={styles.container}>
                    {this.showDayPicker &&
                        <View style={styles.dateContainer}>
                            <Title style={{ marginBottom: 15 }}>{dateTitle}</Title>
                            <DatePicker
                                date={selectedDate}
                                onDateChange={(selectedDate) => this.setState({ selectedDate })}
                                mode='date'
                                locale='fr'
                                androidVariant="nativeAndroid"
                                fadeToColor={theme.colors.primary}
                            />
                        </View>
                    }

                    {this.showTimePicker &&
                        <View style={styles.hourContainer}>
                            <Title style={{ marginBottom: 15 }}>{hourTitle}</Title>
                            <DatePicker
                                date={selectedHour}
                                onDateChange={(selectedHour) => this.setState({ selectedHour })}
                                mode='time'
                                locale='fr'
                                androidVariant="nativeAndroid"
                                fadeToColor={theme.colors.primary}
                            />
                        </View>
                    }

                </View>
            </View>
        )
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center'
    },
    dateContainer: {
        flex: 0.5,
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomColor: theme.colors.gray,
        borderBottomWidth: StyleSheet.hairlineWidth * 2
    },
    hourContainer: {
        flex: 0.5,
        alignItems: 'center',
        justifyContent: 'center'
    }
})

const mapStateToProps = (state) => {
    return {
        network: state.network,
    }
}

export default connect(mapStateToProps)(MyDatePicker)