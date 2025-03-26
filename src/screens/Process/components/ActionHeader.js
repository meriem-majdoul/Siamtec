




import React, { Component } from "react"
import { View, StyleSheet } from "react-native"
import _ from 'lodash'

import CustomIcon from '../../../components/CustomIcon'
import { isTablet } from '../../../core/constants'

import * as theme from "../../../core/theme"
import { Header } from "../../../components/typography/Typography"
import { faEye } from "react-native-vector-icons/FontAwesome5"


class ActionHeader extends Component {

    constructor(props) {
        super(props)
        this.navigateToProcessHistory = this.navigateToProcessHistory.bind(this)
    }

    navigateToProcessHistory() {
        const { process, project, canUpdate, role } = this.props
        const { client, step } = project
        const navParams = { process, project, clientId: client.id, step, canUpdate, role }
        this.props.navigation.navigate('Progression', navParams)
    }

    renderHeaderBar() {
        return (
            <View style={styles.headerBarContainer}>
                <Header style={styles.headerBarText}>Suivi</Header>
                <CustomIcon
                    icon={faEye}
                    color={theme.colors.white}
                    style={styles.eye}
                    onPress={this.navigateToProcessHistory}
                />
            </View>
        )
    }

    render() {
        return this.renderHeaderBar()
    }
}

const styles = StyleSheet.create({
    headerBarContainer: {
        backgroundColor: theme.colors.section,
        borderTopRightRadius: 5,
        borderTopLeftRadius: 5,
        borderBottomWidth: 2,
        borderBottomColor: theme.colors.gray_light,
        paddingVertical: theme.padding,
        // justifyContent: 'center'
    },
    headerBarText: {
        textAlign: 'center',
        color: theme.colors.white
    },
    eye: {
        zIndex: 1,
        position: 'absolute',
        top: theme.padding / 2,
        right: theme.padding / 2
    },
})

export default ActionHeader