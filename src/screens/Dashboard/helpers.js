
import React, { Component } from 'react'
import { StyleSheet, Text, View, FlatList } from 'react-native'
import { connect } from 'react-redux'

import moment from 'moment';
import 'moment/locale/fr'
moment.locale('fr')

import * as theme from '../../core/theme'
import { constants, highRoles } from '../../core/constants'
import { db, auth } from '../../firebase'

import { Section, EmptyList } from '../../components'
import { sortMonths } from '../../core/utils';

const viewMoreLink = (navigation, navScreen, navParams) => {
    const customStyle = { textAlign: 'center', color: theme.colors.primary, marginTop: 15 }
    return (
        <Text
            style={[theme.customFontMSmedium.body, customStyle]}
            onPress={() => navigation.navigate(navScreen, navParams)}
        >
            Voir plus
        </Text>
    )
}

export const renderSection = (sectionTitle, sectionIcon, listItems, countItems, navigation, navScreen, navParams = {}, renderItem, emptyListHeader, emptyListDesc, isConnected) => {
    if (countItems > 0)
        return (
            <FlatList
                data={listItems}
                keyExtractor={(item) => { return item.id }}
                ListFooterComponent={viewMoreLink(navigation, navScreen, navParams)}
                renderItem={renderItem}
                style={{ paddingHorizontal: theme.padding, paddingTop: theme.padding }}
            />
        )

    else return (
        <EmptyList
            icon={sectionIcon}
            header={emptyListHeader}
            description={emptyListDesc}
            offLine={!isConnected}
        />
    )
}

export const initTurnoverObjects = () => {
    let turnoverObjects = {}

    const sixMmonthsAgo = moment().subtract('5', 'months').format('YYYY-MM')
    const currentMonth = moment().format('YYYY-MM')
    let monthIterator = sixMmonthsAgo

    while (moment(monthIterator).isSameOrBefore(currentMonth)) {
        const year = moment(monthIterator, 'YYYY-MM').format('YYYY')
        const month = moment(monthIterator, 'YYYY-MM').format('MMM')
        const monthYear = moment(monthIterator, 'YYYY-MM').format('MM-YYYY')
        const turnoverObject = {
            year,
            month,
            monthYear,
            current: 0,
        }
        turnoverObjects[monthYear] = turnoverObject
        monthIterator = moment(monthIterator).add(1, 'month').format('YYYY-MM')
    }

    return turnoverObjects
}

export const analyticsQueriesBasedOnRole = (roleId, userId) => {
    let queries = {}
    if (highRoles.includes(roleId)) {
        queries.turnover = db
            .collectionGroup('Turnover')

        queries.projects = db
            .collection('Projects')
    }

    else if (roleId === 'com') {
        queries.turnover = db
            .collection('Users')
            .doc(userId)
            .collection('Turnover')

        queries.projects = db
            .collection('Projects')
            .where('createdBy.id', '==', userId)
    }

    return queries
}

export const setTurnoverArr = (turnoverObjects) => {
    let turnoverArr = []
    for (const key in turnoverObjects) {
        turnoverArr.push(turnoverObjects[key])
    }
    return turnoverArr
}

export const setMonthlyGoals = (turnoverArr) => {
    let monthlyGoals = []

    console.log("////", turnoverArr)
    for (const turnover of turnoverArr) {
        if (turnover.target) {
            monthlyGoals.push(turnover)
        }
    }

    monthlyGoals = sortMonths(monthlyGoals)

    return monthlyGoals
}

const styles = StyleSheet.create({
    container: {
        //  flex: 1,
        backgroundColor: theme.colors.secondary
    },
})

