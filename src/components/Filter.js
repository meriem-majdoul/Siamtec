import * as React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { List, Appbar } from 'react-native-paper';
import { faFilter, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { MenuProvider, Menu as PopupMenu, MenuOptions, MenuOption, MenuTrigger, renderers } from 'react-native-popup-menu';
import { useNavigation } from '@react-navigation/native';

import Picker from '../components/Picker';
import TextInput from '../components/TextInput';
import Button from '../components/Button';
import CustomIcon from '../components/CustomIcon';
import * as theme from '../core/theme';
import { constants } from '../core/constants';
import { refreshClient, refreshProject, refreshUser } from '../core/utils';
import ItemPicker from './ItemPicker';

const { SlideInMenu } = renderers;

const Filter = ({ main, opened, toggleFilter, setFilter, resetFilter, options, functions, menuStyle, isAppBar = false, ...props }) => {
    const navigation = useNavigation();

    const onPressScreenPicker = (option) => {
        if (option.disabled) return;

        toggleFilter();

        let callback;
        if (option.screen === 'ListClients') {
             option.drawer='ClientsManagementStack';
            callback = (client) => ({ client: refreshUser(client) });
        } else if (option.screen === 'ListProjects') {
            option.drawer='ProjectsStack';
            callback = (project) => ({ project: refreshProject(project, false) });
        } else if (option.screen === 'ListEmployees') {
            option.drawer='AgendaStack';
            callback = (assignedTo) => ({ assignedTo: refreshUser(assignedTo) });
        }

        const refresh = (filter) => {
            const obj = callback(filter);
            main.setState(obj);
        };

        const navParams = {
            isRoot: false,
            titleText: option.titleText,
            showButton: false,
            onGoBack: refresh,
        };
        navigation.push(option.drawer,{screen:option.screen, params:navParams});
    };

    const renderFilterIcon = () => {
        if (isAppBar) {
            return (
                <Appbar.Action
                    icon={() => <FontAwesomeIcon icon={faFilter} color={theme.colors.appBarIcon} size={24} />}
                    onPress={toggleFilter}
                />
            );
        } else {
            return <FontAwesomeIcon icon={faFilter} size={20} color={theme.colors.appBarIcon} />;
        }
    };

    const renderHeader = () => {
        return (
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <FontAwesomeIcon icon={faFilter} color={theme.colors.white} size={15} />
                    <Text style={[theme.customFontMSregular.header, { color: '#fff', textAlign: 'center', marginLeft: 10 }]}>
                        Filtrer par
                    </Text>
                </View>
                <TouchableOpacity onPress={toggleFilter}>
                    <FontAwesomeIcon icon={faTimes} color={theme.colors.white} size={15} />
                </TouchableOpacity>
            </View>
        );
    };

    const renderOptions = () => {
        return options.map((option, index) => renderOption(option, index));
    };

    const renderOption = (option, index) => {
        if (option.type === 'picker') {
            return (
                <Picker
                    key={index.toString()}
                    title={option.title}
                    value={option.value}
                    selectedValue={option.value}
                    onValueChange={(value) => setFilter(option.field, value)}
                    elements={option.values}
                />
            );
        } else if (option.type === 'screen') {
            return (
                <ItemPicker
                    key={index.toString()}
                    onPress={() => onPressScreenPicker(option)}
                    label={option.title}
                    value={option.value}
                    editable={true}
                />
            );
        }
    };

    const renderFooter = () => {
        return (
            <View style={styles.buttonsContainer}>
                <Button mode="outlined" onPress={resetFilter} outlinedColor={theme.colors.primary}>
                    Réinitialiser
                </Button>
                <Button mode="contained" onPress={toggleFilter}>
                    Confirmer
                </Button>
            </View>
        );
    };

    return (
        <PopupMenu renderer={SlideInMenu} opened={opened} onBackdropPress={toggleFilter} style={menuStyle}>
            <MenuTrigger onPress={toggleFilter}>
                {renderFilterIcon()}
            </MenuTrigger>
            <MenuOptions optionsContainerStyle={{ height: constants.ScreenHeight * 0.935, elevation: 50 }}>
                {renderHeader()}
                <View style={{ paddingHorizontal: theme.padding, paddingVertical: 5 }}>
                    {renderOptions()}
                    {renderFooter()}
                </View>
            </MenuOptions>
        </PopupMenu>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: theme.colors.primary,
        borderTopLeftRadius: constants.ScreenWidth * 0.03,
        borderTopRightRadius: constants.ScreenWidth * 0.03,
        paddingHorizontal: theme.padding,
        paddingVertical: 10,
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
    },
});

export default Filter;
