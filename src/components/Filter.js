import * as React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { List, Appbar } from 'react-native-paper';
import { faFilter, faTimes } from 'react-native-fontawesome'
import { MenuProvider, Menu as PopupMenu, MenuOptions, MenuOption, MenuTrigger, renderers } from 'react-native-popup-menu';
import { useNavigation } from '@react-navigation/native'; // Importez useNavigation

import Picker from '../components/Picker'
import TextInput from '../components/TextInput'
import Button from '../components/Button'
import CustomIcon from '../components/CustomIcon'
import { SystemMessage } from 'react-native-gifted-chat';

import * as theme from '../core/theme';
import { constants } from '../core/constants';
import { refreshClient, refreshProject, refreshUser } from '../core/utils';
import ItemPicker from './ItemPicker';

const { SlideInMenu } = renderers

const Filter = ({ main, opened, toggleFilter, setFilter, resetFilter, options, functions, menuStyle, isAppBar = false, ...props }) => {

    const navigation = useNavigation(); // Utilisez useNavigation pour accéder à navigation

    const onPressScreenPicker = (option) => {
        if (option.disabled) return

        toggleFilter()

        if (option.screen === 'ListClients')
            var callback = (client) => {
                client = refreshUser(client)
                return { client }
            }

        else if (option.screen === 'ListProjects')
            var callback = (project) => {
                project = refreshProject(project, false)
                return { project }
            }

        else if (option.screen === 'ListEmployees')
            var callback = (assignedTo) => {
                assignedTo = refreshUser(assignedTo)
                return { assignedTo }
            }

        const refresh = (filter) => {
            const obj = callback(filter)
            main.setState(obj)
        }

        const navParams = {
            isRoot: false,
            titleText: option.titleText,
            showButton: false,
            onGoBack: refresh
        }
        navigation.push(option.screen, navParams) // Utilisez navigation.push à la place de props.navigation.push
    }

    const renderFilterIcon = () => {
        if (isAppBar) return <Appbar.Action icon={<CustomIcon icon={faFilter} color={theme.colors.appBarIcon} size={24}/>} />
        else return <CustomIcon icon={faFilter} />
    }

    const renderHeader = () => {
        return (
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: "center" }}>
                    <CustomIcon icon={faFilter} color={theme.colors.white} size={15} />
                    <Text style={[theme.customFontMSregular.header, { color: '#fff', textAlign: 'center', marginLeft: 10 }]}>Filtrer par</Text>
                </View>
                <CustomIcon onPress={toggleFilter} icon={faTimes} color={theme.colors.white} />
            </View>
        )
    }

    const renderOptions = () => {
        return options.map((option, index) => renderOption(option, index))
    }

    const renderOption = (option, index) => {

        if (option.type === 'picker') {
            return (
                <Picker
                    key={index.toString()}
                    title={option.title}
                    value={option.value}
                    selectedValue={option.value}
                    onValueChange={(value) => setFilter(option.field, value)}
                    elements={option.values} />
            )
        }

        else if (option.type === 'screen') {
            return (
                <ItemPicker
                    key={index.toString()}
                    onPress={() => onPressScreenPicker(option)}
                    label={option.title}
                    value={option.value}
                    editable={true}
                />
            )
        }
    }

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
        )
    }

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
    )
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: theme.colors.primary,
        borderTopLeftRadius: constants.ScreenWidth * 0.03,
        borderTopRightRadius: constants.ScreenWidth * 0.03,
        paddingHorizontal: theme.padding,
        paddingVertical: 10
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15
    }
})

export default Filter
