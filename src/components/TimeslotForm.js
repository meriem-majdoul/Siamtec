
import React, { Component } from 'react'
import { StyleSheet, Text, View, ScrollView, Keyboard, Alert, TouchableOpacity } from 'react-native'
import { Switch } from 'react-native-paper'
import DatePicker from 'react-native-date-picker'
import { faCalendarPlus, faClock } from '@fortawesome/free-solid-svg-icons'

import moment from 'moment';
import 'moment/locale/fr'
moment.locale('fr')

import ItemPicker from '../components/ItemPicker'

import { navigateToScreen } from '../core/utils'
import * as theme from '../core/theme'
import { constants } from '../core/constants'

class TimeslotForm extends Component {

    constructor(props) {
        super(props)

        this.state = {
            //Schedule
            isAllDay: this.props.isAllDay,
            startDate: moment(this.props.startDate).toDate(),
            endDate: moment(this.props.endDate).toDate(),
            startHour: moment(this.props.startHour).toDate(),
            dueHour: moment(this.props.dueHour).toDate(),

            // startDateError: '',
            // endDateError: '',
            endDateError: this.props.endDateError,
            dueHourError: this.props.dueHourError,

            togglePickers: {
                startDate: false,
                endDate: false,
                startHour: false,
                dueHour: false,
            }
        }
    }

    async componentDidUpdate(prevProps, prevState, snapshot) {

        if (prevProps.isAllDay !== this.props.isAllDay) {
            this.setState({ isAllDay: this.props.isAllDay })
        }
        if (prevProps.startDate !== this.props.startDate) {
            this.setState({ startDate: moment(this.props.startDate).toDate() })
        }
        if (prevProps.endDate !== this.props.endDate) {
            this.setState({ endDate: moment(this.props.endDate).toDate() })
        }
        if (prevProps.startHour !== this.props.startHour) {
            this.setState({ startHour: moment(this.props.startHour).toDate() })
        }
        if (prevProps.dueHour !== this.props.dueHour) {
            this.setState({ dueHour: moment(this.props.dueHour).toDate() })
        }
        //Errors
        if (prevProps.endDateError !== this.props.endDateError) {
            this.setState({ endDateError: this.props.endDateError })
        }
        if (prevProps.dueHourError !== this.props.dueHourError) {
            this.setState({ dueHourError: this.props.dueHourError })
        }
    }

    setAllTogglePickers(bool) {
        let { togglePickers } = this.state
        for (let key in togglePickers) {
            togglePickers[key] = bool
        }
        this.setState({ togglePickers })
    }

    togglePicker(pickerId) {
        let { togglePickers } = this.state
        for (let key in togglePickers) {
            if (key === pickerId)
                togglePickers[key] = !togglePickers[key]
            else togglePickers[key] = false
        }
        this.setState({ togglePickers })
    }

    //Renderers
    renderForm() {
        const { isAllDay, startHour, dueHour, togglePickers } = this.state
        const { startHourError, dueHourError } = this.state
        const { canWrite } = this.props

        return (
            <View style={{ flex: 1 }}>

                <View style={styles.isAllDayContainer}>
                    <Text style={theme.customFontMSregular.body}>Toute la journée</Text>
                    <View style={styles.isAllDaySwitchContainer}>
                        <Switch
                            value={isAllDay}
                            onValueChange={(isAllDay) => {
                                this.setState({ isAllDay })
                                this.props.setIsAllDayParent(isAllDay)
                                this.setAllTogglePickers(false)
                            }}
                            color={theme.colors.primary}
                            disabled={!canWrite}
                        />
                    </View>
                </View>

                {this.renderDates(togglePickers)}
                {this.props.showHours && this.renderHours(togglePickers)}

            </View>
        )
    }

    renderSingleDateForm() {
        const { togglePickers, startDate } = this.state
        return (
            <View>
                {this.renderItemPicker("startDate", "Date *", startDate, this.props.startDateError, "date")}
                {togglePickers["startDate"] && this.renderDatePicker("date", "startDate", startDate)}
            </View>
        )
    }

    renderDatePicker(mode, dateId, date) {
        return (
            <DatePicker
                date={date}
                onDateChange={(newDate) => {
                    if (this.props.hideEndDate && mode === "date") {
                        this.setState({ startDate: newDate, endDate: newDate })
                        this.props.setParentState(mode, "startDate", newDate)
                        this.props.setParentState(mode, "endDate", newDate)
                    }
                    else {
                        let update = {}
                        update[dateId] = newDate
                        this.setState(update)
                        this.props.setParentState(mode, dateId, newDate)
                    }
                }}
                mode={mode}
                locale='fr'
                androidVariant="nativeAndroid"
                fadeToColor={theme.colors.primary}
                style={{ alignSelf: "center" }}
                textColor={theme.colors.section}
            />
        )
    }

    renderItemPicker(id, label, value, error, mode) {
        const { canWrite } = this.props
        const { togglePickers } = this.state

        return (
            <View style={{ borderBottomWidth: togglePickers[id] ? 5 : 0, borderBottomColor: theme.colors.section }}>
                <ItemPicker
                    onPress={() => this.togglePicker(id)}
                    label={label}
                    value={mode === "date" ? moment(value).format('ll') : moment(value).format('HH:mm')}
                    editable={canWrite}
                    showAvatarText={false}
                    icon={mode === "date" ? faCalendarPlus : faClock}
                    errorText={error}
                    style={{ width: this.props.hideEndDate && mode === "date" ? constants.ScreenWidth - theme.padding * 2 : constants.ScreenWidth * 0.4 }}
                />
            </View>
        )
    }

    renderDates(togglePickers) {

        const { isAllDay, startDate, endDate } = this.state
        const showEndDate = !isAllDay && !this.props.hideEndDate
        const startDateTitle = this.props.hideEndDate ? "Date *" : "Date de début *"

        return (
            <View>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginVertical: theme.padding }}>
                    {this.renderItemPicker("startDate", startDateTitle, startDate, this.props.startDateError, "date")}

                    {showEndDate &&
                        this.renderItemPicker("endDate", "Date de fin *", endDate, this.props.endDateError, "date")
                    }
                </View>

                {togglePickers["startDate"] &&
                    this.renderDatePicker("date", "startDate", startDate)
                }
                {togglePickers["endDate"] &&
                    this.renderDatePicker("date", "endDate", endDate)
                }
            </View>
        )
    }


    renderHours(togglePickers) {

        const { isAllDay, startHour, dueHour, startHourError, dueHourError } = this.state


        return (
            <View>

                <View style={{ flexDirection: "row", justifyContent: "space-between", marginVertical: theme.padding }}>
                    {!isAllDay &&
                        this.renderItemPicker("startHour", "Heure de début *", startHour, startHourError, "time")
                    }

                    {!isAllDay &&
                        this.renderItemPicker("dueHour", "Heure d'échéance *", dueHour, dueHourError, "time")
                    }
                </View>
                {togglePickers["startHour"] &&
                    this.renderDatePicker("time", "startHour", startHour)
                }
                {togglePickers["dueHour"] &&
                    this.renderDatePicker("time", "dueHour", dueHour)
                }
            </View>
        )
    }

    render() {
        if (this.props.isSingleDate)
            return this.renderSingleDateForm()
        else return this.renderForm()
    }
}



export default TimeslotForm

const styles = StyleSheet.create({
    isAllDayContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: theme.padding * 2
    },
    isAllDaySwitchContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    }
})