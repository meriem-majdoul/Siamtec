
import React, { Component } from 'react';
import { View } from 'react-native';
import { Paragraph, Title } from 'react-native-paper';
import * as  theme from '../core/theme'
import { constants } from '../core/constants'
import CustomIcon from './CustomIcon';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';


export default class SuccessMessage extends Component {

    render() {
        return (
            <View style={{ padding: theme.padding }}>
                <View style={{ marginTop: theme.padding, alignItems: "center" }}>
                    <Title style={{ textAlign: "center", marginBottom: theme.padding, color: "green", fontWeight: 'bold' }}>
                        {this.props.title}
                    </Title>
                    <Paragraph style={{ textAlign: "center", marginTop: 16 }}>
                        {this.props.subHeading}
                    </Paragraph>
                    <CustomIcon
                        icon={faCheckCircle}
                        color={theme.colors.primary}
                        size={constants.ScreenWidth * 0.42}
                        style={{ alignSelf: "center", marginTop: constants.ScreenHeight * 0.12 }}
                    />
                </View>
            </View>
        )
    }
}