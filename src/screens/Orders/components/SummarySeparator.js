
import React from 'react';
import {
    StyleSheet,
    View,
} from 'react-native';
import _ from 'lodash';
import * as theme from '../../../core/theme';
import { constants } from '../../../core/constants';

const SummarySeparator = ({ }) => {
    return (
        <View
            style={{
                height: StyleSheet.hairlineWidth,
                width: constants.ScreenWidth - theme.padding * 2,
                backgroundColor: '#E0E0E0',
                marginTop: 15,
            }}
        />
    );
};

export default SummarySeparator