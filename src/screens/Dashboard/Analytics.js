import React, { Component } from 'react'
import { StyleSheet, Text, View, FlatList, Dimensions, ScrollView } from 'react-native'
import { connect } from 'react-redux'
import { LineChart } from 'react-native-chart-kit'
//#task: try react-native-responsive-linechart
import NumberFormat from 'react-number-format';

import moment from 'moment';
import 'moment/locale/fr'
moment.locale('fr')

import { db, auth } from '../../firebase'
import * as theme from '../../core/theme'
import { constants, highRoles, isTablet } from '../../core/constants'
import { displayError, load, sortMonths } from '../../core/utils'
import { fetchTurnoverData } from '../../api/firestore-api'
import { analyticsQueriesBasedOnRole, initTurnoverObjects, setTurnoverArr, setMonthlyGoals } from './helpers'

import { Picker, TurnoverGoal, Loading, CustomIcon } from '../../components'
import Tooltip from '../../components/Tooltip'
import TurnoverGoalsContainer from '../../containers/TurnoverGoalsContainer'
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';

class Analytics extends Component {
    constructor(props) {
        super(props)
        this.refreshMonthlyGoals = this.refreshMonthlyGoals.bind(this)
        this.currentMonth = moment().format('MMM')
        this.currentMonth = this.currentMonth.charAt(0).toUpperCase() + this.currentMonth.slice(1)

        const role = this.props.role
        const roleId = role.id

        if (auth.currentUser)
            this.queries = analyticsQueriesBasedOnRole(roleId, auth.currentUser.uid)

        this.state = {
            totalIncome: 0,
            totalProjects: 0,
            totalClients: 0,
            chartLabels: [],
            chartDataSets: [[]],
            chartPeriod: 'lastSemester',
            monthlyGoals: [],
            selectedPointChart: null,
            loading: true
        }
    }

    async componentDidMount() {
        if (this.queries)
            await this.fetchData()
        load(this, false)
    }

    async fetchData() {
        try {
            const { turnover, projects } = this.queries
            const { uid } = auth.currentUser
            //Summary
            const totalIncome = await this.fetchTotalIncome(turnover)
            const { totalProjects, totalClients } = await this.fetchTotals(projects)
            //Stats data format
            let turnoverObjects = initTurnoverObjects()
            turnoverObjects = await fetchTurnoverData(turnover, turnoverObjects, uid)
            let turnoverArr = setTurnoverArr(turnoverObjects)
            turnoverArr = sortMonths(turnoverArr)

            //Goals
            const monthlyGoals = setMonthlyGoals(turnoverArr)

            //Chart
            const { chartLabels, chartDataSets } = this.setChart(turnoverArr)
            this.setState({ totalIncome, totalProjects, totalClients, chartDataSets, chartLabels, monthlyGoals })
        }
        catch (e) {
            const { message } = e
            displayError({ message })
        }
    }

    setChart(turnoverArr) {
        let semesterTurnoverArr = this.filterSemesterTurnover(turnoverArr)
        const chartData = semesterTurnoverArr.map((turnover) => turnover.current)
        const chartLabels = semesterTurnoverArr.map((turnover) => turnover.month)
        const chartDataSets = [chartData]
        return { chartLabels, chartDataSets }
    }

    filterSemesterTurnover(turnoverArr) {

        const sixMmonthsAgo = moment().subtract('5', 'months').format('YYYY-MM')
        const now = moment().format('YYYY-MM')

        turnoverArr = turnoverArr.filter((turnover) => {
            const monthYear = moment(turnover.monthYear, 'MM-YYYY').format('YYYY-MM')
            const isAfterSixMonthAgo = moment(monthYear).isSameOrAfter(sixMmonthsAgo, 'month')
            const isBeforeNow = moment(monthYear).isSameOrBefore(now, 'month')
            if (isAfterSixMonthAgo && isBeforeNow) return turnover
        })

        return turnoverArr
    }

    //SUMMARY DATA
    async fetchTotalIncome(query) {
        try {
            let totalIncome = 0
            let monthsTurnovers = {}
            const querySnapshot = await query.get().catch((e) => { throw new Error(errorMessages.firestore.get) })
            for (const doc of querySnapshot.docs) {
                monthsTurnovers = doc.data()
                delete monthsTurnovers.current
                delete monthsTurnovers.target

                for (const month in monthsTurnovers) {
                    const projectsIncome = monthsTurnovers[month].projectsIncome || {}
                    for (var projectId in projectsIncome) {
                        totalIncome += Number(projectsIncome[projectId].amount)
                    }
                }
            }
            return totalIncome
        }
        catch (e) {
            throw new Error(e)
        }
    }

    async fetchTotals(query) {
        try {
            let totalProjects = 0
            let totalClients = 0
            const querySnapshot = await query.get()
            const clients = []
            querySnapshot.forEach((doc) => {
                const project = doc.data()
                const clientId = project.client.id
                if (!clients.includes(clientId))
                    clients.push(clientId)
            })
            totalProjects = querySnapshot.docs.length
            totalClients = clients.length
            return { totalProjects, totalClients }
        }
        catch (e) {
            throw new Error(e)
        }
    }

    renderSummary() {
        const { totalIncome, totalProjects, totalClients } = this.state

        const summaryData = [
            {
                label: 'Clients',
                value: totalClients,
                symbol: '',
                colors: { primary: '#F5276D', secondary: '#FFEFF4' }
            },
            {
                label: 'Projets',
                value: totalProjects,
                symbol: '',
                colors: { primary: '#FF9A27', secondary: '#FFF6E6' }
            },
            {
                label: 'Revenu total',
                value: totalIncome,
                symbol: '€',
                colors: { primary: '#555CC4', secondary: '#EEEFFF' }
            },
        ]

        const emptySpace = () => <View style={{ flex: 0.15 }} />

        return (
            <View style={styles.summaryContainer}>
                {summaryData.map((data, index) => {
                    return (
                        <View
                            key={index.toString()}
                            style={[styles.summaryColumn, { backgroundColor: data.colors.secondary }]}
                        >
                            {emptySpace()}
                            <View style={styles.summaryLabelContainer}>
                                <Text style={[theme.customFontMSsemibold.caption, styles.summaryLabel]}>{data.label}</Text>
                            </View>
                            <View style={styles.summaryValueContainer}>
                                <NumberFormat
                                    value={data.value}
                                    displayType={'text'}
                                    thousandSeparator={true}
                                    suffix={data.symbol}
                                    renderText={value => <Text style={[theme.customFontMSsemibold.body, styles.summaryValue, { color: data.colors.primary }]}>{value.toString()}</Text>}
                                />
                            </View>
                            {emptySpace()}
                        </View>
                    )
                })
                }
            </View>
        )
    }

    tooltipDecorators(state, data) {
        if (state === null) {
            return null;
        }

        const { index, value, x, y } = state;
        const textX = data.labels[index];
        const position = data.labels.length === index + 1 ? 'left' : 'right';

        return (
            <Tooltip
                textX={String(textX)}
                textY={String(value)}
                x={x}
                y={y}
                stroke={theme.colors.primary}
                pointStroke={theme.colors.secondary}
                position={position}
                dismiss={() => this.setState({ selectedPointChart: null })}
            />
        );
    };

    renderChart() {
        const { chartPeriod, monthlyGoals, chartDataSets, chartLabels, selectedPointChart } = this.state
        const periods = [
            { label: 'Le mois courant', value: 'currentMonth' },
            { label: 'Les 6 derniers mois', value: 'lastSemester' },
            { label: "L'année dernière", value: 'lastYear' },
        ]

        const labels = chartLabels

        let datasets = []
        const formatedChartDataSets = chartDataSets[0].map((data) => { return data / 1000 })
        const dataObject = { data: formatedChartDataSets }
        datasets[0] = dataObject

        const data = { labels, datasets }

        return (
            <View style={{ marginTop: theme.padding * 1.5, borderTopWidth: 16, borderTopColor: theme.colors.gray_extraLight, paddingHorizontal: theme.padding }}>
                <View style={styles.chartHeader}>
                    <View>
                        <Text style={[theme.customFontMSsemibold.body]}>Statistiques</Text>
                    </View>
                    <View style={{ flexDirection: "row", alignItems: 'center' }}>
                        <Text style={[theme.customFontMSregular.body, { color: theme.colors.gray_dark, marginRight: 5 }]}>Les 6 derniers mois</Text>
                        <CustomIcon icon={faChevronDown} color={theme.colors.gray_dark} size={12} />
                    </View>
                </View>

                <LineChart
                    data={data}
                    width={Dimensions.get("window").width - theme.padding * 2} // from react-native
                    height={isTablet ? 500 : 220}
                    yAxisLabel="€"
                    yAxisSuffix="k"
                    yAxisInterval={1} // optional, defaults to 1
                    paddingTop={"15"}
                    chartConfig={{
                        backgroundColor: "#e26a00",
                        backgroundGradientFrom: "#fb8c00",
                        backgroundGradientTo: "#ffa726",
                        decimalPlaces: 2, // optional, defaults to 2dp
                        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                        style: {
                            borderRadius: 8,
                        },
                        propsForDots: {
                            r: "6",
                            strokeWidth: "2",
                            stroke: "#ffa726"
                        },
                        propsForHorizontalLabels: {
                            fontSize: isTablet ? "12" : "10",
                            x: "54"
                        },
                        propsForVerticalLabels: {
                            fontSize: isTablet ? "16" : "10",
                           // y: "0"
                        }
                    }}
                    decorator={() => this.tooltipDecorators(selectedPointChart, data)}
                    onDataPointClick={(data) => {
                        this.setState({ selectedPointChart: data })
                    }}
                    bezier
                    style={{
                        marginTop: 0,
                        //backgroundColor: 'pink',
                        marginBottom: 25,
                        borderRadius: 8,
                        //paddingTop: 20
                    }}
                />

            </View>

        )
    }

    onPressNewGoal() {
        this.props.navigation.navigate('AddGoal', { onGoBack: this.refreshMonthlyGoals })
    }

    onPressGoal(goal, index) {
        let incomeSources = []
        let incomeSource = {}

        const navParams = {
            userId: auth.currentUser.uid,
            GoalId: goal.id,
            currentTurnover: goal.current,
            incomeSources: goal.sources,
            monthYear: goal.monthYear,
            onGoBack: this.refreshMonthlyGoals
        }

        this.props.navigation.navigate('AddGoal', navParams)
    }

    async refreshMonthlyGoals() {
        try {
            const initialTurnoverObjects = initTurnoverObjects()
            let turnoverObjects = await fetchTurnoverData(this.queries.turnover, initialTurnoverObjects, auth.currentUser.uid)
            const turnoverArr = setTurnoverArr(turnoverObjects)
            const monthlyGoals = setMonthlyGoals(turnoverArr)
            this.setState({ monthlyGoals })
        }
        catch (e) {
            const { message } = e
            displayError({ message })
        }
    }

    renderGoals() {
        const { monthlyGoals } = this.state
        const roleId = this.props.role.id
        const isCom = roleId === 'com'

        return (
            <View style={{ borderTopWidth: 16, borderTopColor: theme.colors.gray_extraLight, padding: theme.padding }}>
                <Text style={[theme.customFontMSsemibold.body, { marginBottom: theme.padding }]}>Objectifs</Text>
                <TurnoverGoalsContainer
                    monthlyGoals={monthlyGoals}
                    onPressNewGoal={this.onPressNewGoal.bind(this)}
                    onPressGoal={this.onPressGoal.bind(this)}
                    navigation={this.props.navigation}
                    isCom={isCom}
                />
            </View>
        )
    }

    render() {
        const { chartLabels, loading, selectedPointChart } = this.state
        const { isConnected } = this.props.network

        return (
            <View style={styles.container}>
                {loading ?
                    <Loading />
                    :
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {this.renderSummary()}
                        {chartLabels.length > 0 && this.renderChart()}
                        {this.renderGoals()}
                    </ScrollView>
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

export default connect(mapStateToProps)(Analytics)

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.white,
        // paddingHorizontal: theme.padding,
        paddingTop: theme.padding
    },
    //Summary
    summaryContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: theme.padding
    },
    summaryColumn: {
        height: constants.ScreenHeight * 0.1,
        width: constants.ScreenWidth * 0.275,
        borderRadius: 8,
        ...theme.style.shadow
    },
    summaryLabelContainer: {
        flex: 0.45,
        paddingHorizontal: 10,
        justifyContent: 'center'
    },
    summaryLabel: {
        color: theme.colors.secondary,
        textAlign: 'center',
        opacity: 0.6
    },
    summaryValueContainer: {
        flex: 0.25,
        justifyContent: 'center'
    },
    summaryValue: {
        textAlign: 'center'
    },
    //CHART
    chartHeader: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        marginVertical: theme.padding,
    },
})

