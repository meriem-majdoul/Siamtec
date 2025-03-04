
import * as React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { List } from 'react-native-paper';
import * as theme from '../core/theme';
import { constants } from '../core/constants';

import Picker from '../components/Picker'
import TextInput from '../components/TextInput'
import Button from '../components/Button'

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Menu as PopupMenu, MenuOptions, MenuOption, MenuTrigger, renderers } from 'react-native-popup-menu';
import { withNavigation } from 'react-navigation'

const { SlideInMenu } = renderers

const Filter = ({ main, opened, toggleFilter, setFilter, resetFilter, options, functions, menuStyle, iconColor, ...props }) => {

    //Screen filters: refresh selected value
    const refreshClient = (isPro, id, nom, prenom) => {
        toggleFilter()
        let fullName = ''
        let client = { id: '', fullName: '' }
        if (isPro)
            fullName = nom
        else
            fullName = prenom + ' ' + nom
        client.id = id
        client.fullName = fullName
        main.setState({ client })
    }

    const refreshProject = (project) => {
        toggleFilter()
        main.setState({ project })
    }

    const refreshEmployee = (isPro, id, prenom, nom) => {
        toggleFilter()
        const assignedTo = { id, fullName: `${prenom} ${nom}`, error: '' }
        main.setState({ assignedTo })
    }

    return (
        <PopupMenu renderer={SlideInMenu} opened={opened} onBackdropPress={toggleFilter} style={menuStyle}>
            <MenuTrigger style={{ paddingHorizontal: constants.ScreenWidth * 0.033 }} onPress={toggleFilter}>
                <MaterialCommunityIcons
                    name='filter'
                    size={24}
                    color={iconColor || theme.colors.secondary}
                />
            </MenuTrigger>

            <MenuOptions optionsContainerStyle={{ borderTopLeftRadius: constants.ScreenWidth * 0.03, borderTopRightRadius: constants.ScreenWidth * 0.03, elevation: 10 }}>
                <View style={{ backgroundColor: theme.colors.secondary, borderTopLeftRadius: constants.ScreenWidth * 0.03, borderTopRightRadius: constants.ScreenWidth * 0.03, paddingHorizontal: constants.ScreenWidth * 0.05, paddingVertical: 10 }}>
                    <Text style={[theme.customFontMSsemibold.body, { color: '#fff' }]}>Filtrer par</Text>
                </View>

                <View style={{ paddingHorizontal: constants.ScreenWidth * 0.05, paddingVertical: 5, }}>
                    {options.map((option) => {
                        if (option.type === 'picker')
                            return (
                                <Picker
                                    title={option.title}
                                    value={option.value}
                                    selectedValue={option.value}
                                    onValueChange={(value) => setFilter(option.field, value)}
                                    elements={option.values} />
                            )

                        else if (option.type === 'screen')
                            return (
                                <TouchableOpacity onPress={() => {
                                    toggleFilter()

                                    let refresh
                                    if (option.screen === 'ListClients')
                                        refresh = refreshClient

                                    else if (option.screen === 'ListProjects')
                                        refresh = refreshProject

                                    else if (option.screen === 'ListEmployees')
                                        refresh = refreshEmployee

                                    props.navigation.navigate(option.screen, { onGoBack: refresh, titleText: option.titleText, showButton: false, isRoot: false })
                                }}>
                                    <TextInput
                                        label={option.title}
                                        value={option.value}
                                        editable={false} />
                                </TouchableOpacity>
                            )
                    })
                    }

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Button mode="outlined" onPress={resetFilter} style={{ width: constants.ScreenWidth * 0.45 }} outlinedColor={theme.colors.secondary}>
                            Réinitialiser
                        </Button>
                        <Button mode="contained" onPress={toggleFilter} style={{ width: constants.ScreenWidth * 0.4, backgroundColor: theme.colors.secondary }} >
                            Confirmer
                        </Button>
                    </View>
                </View>

            </MenuOptions>

        </PopupMenu>
    )
}

export default withNavigation(Filter)




// shouldComponentUpdate(nextProps, nextState) {
//     console.log('shouldComponentUpdate..')
//     console.log(this.state.status)
//     console.log(nextState.status)

//     const { items, filteredItems, type, status, priority, assignedTo, project, filterOpened } = this.state
//     const changeItems = items !== nextState.items
//     const changeFilteredItems = items !== nextState.filteredItems
//     const changeType = type !== nextState.type
//     const changeStatus = status !== nextState.status
//     const changePriority = priority !== nextState.priority
//     const changeAssignedTo = assignedTo !== nextState.assignedTo
//     const changeProject = project !== nextState.project
//     const changeFilterOpened = filterOpened !== nextState.filterOpened

//     if (changeItems) console.log('Items changed')
//     if (changeFilteredItems) console.log('Filtered Items changed')
//     if (changeType) console.log('Type changed')
//     if (changeStatus) console.log('Status changed')
//     if (changePriority) console.log('Priority changed')
//     if (changeAssignedTo) console.log('AssignedTo changed')
//     if (changeProject) console.log('Project changed')
//     if (changeFilterOpened) console.log('FilterOpened changed')

//     const predicate0 = (changeItems)
//     const predicate1 = (changeFilteredItems || changeFilterOpened)
//     const predicate2 = (changeType || changeStatus || changePriority || changeAssignedTo || changeProject)

//     const predicate = (changeItems || changeType || changeStatus || changePriority || changeAssignedTo || changeProject || changeFilterOpened)
//     if (predicate) {
//         // if(!changeFilterOpened)
//         let filteredItems = []
//         const fields = [{ label: 'type', value: type }, { label: 'status', value: status }, { label: 'priority', value: priority }, { label: 'project.id', value: project.id }, { label: 'assignedTo.id', value: assignedTo.id }]
//         filteredItems = handleFilter(items, this.state.filteredItems, fields, KEYS_TO_FILTERS)
//         this.setState({ filteredItems }, () => console.log('filtered items', this.state.filteredItems))
//         return true
//     }

//     if(filteredItems !== nextState.filteredItems) return true
// }

// applyFilter() {
//     toggleFilter(this)

//     const { items, type, status, priority, assignedTo, project, filterOpened } = this.state
//     let filteredItems = []
//     const fields = [{ label: 'type', value: type }, { label: 'status', value: status }, { label: 'priority', value: priority }, { label: 'project.id', value: project.id }, { label: 'assignedTo.id', value: assignedTo.id }]
//     filteredItems = handleFilter(items, filteredItems, fields, KEYS_TO_FILTERS)
//     this.setState({ filteredItems })
// }