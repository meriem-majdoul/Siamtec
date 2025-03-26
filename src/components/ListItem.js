
import * as React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { List } from 'react-native-paper';
import * as theme from '../core/theme';
import { constants } from '../core/constants';
import Menu from './Menu'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { withNavigation } from 'react-navigation'


const ListItem = ({ navigation, options, functions, menu, remove, onPressRightIcon, ...props }) => {

    return (
        <List.Item
            titleStyle={theme.customFontMSmedium.body}
            descriptionStyle={theme.customFontMSmedium.caption}
            right={props => {
                if (menu)
                    return <Menu options={options} functions={functions} />
            }}
            {...props}
        />
    )
}

export default withNavigation(ListItem)