import React, { Component } from 'react'
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'

import moment from 'moment';
import 'moment/locale/fr'
moment.locale('fr')

import * as theme from '../core/theme'
import { constants } from '../core/constants'

import { TurnoverGoal } from '../components'

class TurnoverGoalsContainer extends Component {

    renderGoals() {
        return (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {!this.props.isCom && this.addGoal()}
                {this.props.monthlyGoals.map((goal, index) => (
                    <TurnoverGoal
                        key={index.toString()}
                        goal={goal}
                        index={index}
                        onPress={this.props.onPressGoal.bind(this)}
                    />
                ))}
            </View>
        )
    }

    addGoal() {
        const size = constants.ScreenWidth * 0.238
        return (
            <TouchableOpacity style={{ marginBottom: 25, alignItems: 'center' }} onPress={this.props.onPressNewGoal}>
                <View style={[{ width: size, height: size, borderRadius: size / 2 }, styles.plus]}>
                    <Text style={[theme.customFontMSregular.h1, { color: theme.colors.gray_medium }]}>+</Text>
                </View>
                <Text style={[theme.customFontMSregular.caption, { color: theme.colors.gray_medium, textAlign: 'center' }]}>Nouvel objectif</Text>
            </TouchableOpacity>
        )
    }

    render() {
        return this.renderGoals()
    }
}

const styles = StyleSheet.create({
    plus: {
        borderWidth: 1,
        borderColor: theme.colors.gray_medium,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10
    }
})

export default TurnoverGoalsContainer