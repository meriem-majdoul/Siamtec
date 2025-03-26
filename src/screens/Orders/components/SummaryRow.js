

import React from 'react';
import {
    StyleSheet,
    Text,
    View,
} from 'react-native';
import _ from 'lodash';
import * as theme from '../../../core/theme';

const SummaryRow = ({
    label,
    value,
    valuePrefix = '€',
    textTheme = theme.customFontMSmedium.caption,
    labelStyle,
}) => {
    return (
        <View style={{ flex: 1, flexDirection: 'row', marginTop: 15 }}>
            <View style={{ flex: 0.5, alignItems: 'flex-end' }}>
                <Text
                    style={[textTheme, { color: theme.colors.placeholder }, labelStyle]}>
                    {label}
                </Text>
            </View>

            <View style={{ flex: 0.5, alignItems: 'flex-end' }}>
                <Text style={textTheme}>
                    {valuePrefix}
                    {value}
                </Text>
            </View>
        </View>
    );
};

export default SummaryRow