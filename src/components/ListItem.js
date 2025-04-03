import React from 'react';
import { List } from 'react-native-paper';
import * as theme from '../core/theme';
import Menu from './Menu';
import { useNavigation } from '@react-navigation/native'; // Import du hook useNavigation

const ListItem = ({ options, functions, menu, remove, onPressRightIcon, ...props }) => {
    const navigation = useNavigation(); // Utilisation du hook useNavigation

    return (
        <List.Item
            titleStyle={theme.customFontMSmedium.body}
            descriptionStyle={theme.customFontMSmedium.caption}
            right={props => {
                if (menu) {
                    return <Menu options={options} functions={functions} />;
                }
            }}
            {...props}
        />
    );
};

export default ListItem;
