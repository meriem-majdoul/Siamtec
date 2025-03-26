import React, { memo } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native"
import { Appbar as appbar } from 'react-native-paper'
import { FontAwesomeIcon } from 'react-native-vector-icons/FontAwesome5'
import { faArrowLeft, faBars, faFilter, faRedo } from 'react-native-fontawesome'

import Menu from './Menu'
import Filter from './Filter'

import { setFilter } from '../core/utils'

import * as theme from "../core/theme";
import { constants, isTablet } from '../core/constants'
import { withNavigation } from 'react-navigation'

const PickerBar = ({
    titleText, options, functions, menuTrigger, style, navigation,
    main, filterOpened, type, status, priority, project, assignedTo,
    filter, refresh, onRefresh, menu = true, ...props }) => {

    const types = [
        { label: 'Tous', value: '' },
        { label: 'Normale', value: 'Normale', natures: ['com', 'tech'] }, //#static
        { label: 'Visite technique préalable', value: 'Visite technique préalable', natures: ['com'] }, //#dynamic
        { label: 'Visite technique', value: 'Visite technique', natures: ['tech'] }, //#dynamic
        { label: 'Installation', value: 'Installation', natures: ['tech'] }, //#dynamic 
        { label: 'Rattrapage', value: 'Rattrapage', natures: ['tech'] }, //#dynamic
        { label: 'Panne', value: 'Panne', natures: ['tech'] }, //#static
        { label: 'Entretien', value: 'Entretien', natures: ['tech'] }, //#static
        { label: 'Présentation étude', value: 'Présentation étude', natures: ['com'] }, //restriction: user can not create rdn manually (only during the process and only DC can posptpone it during the process)
    ]

    const priorities = [
        { label: 'Toutes', value: '' },
        { label: 'Urgente', value: 'urgente' },
        { label: 'Moyenne', value: 'moyenne' },
        { label: 'Faible', value: 'faible' },
    ]

    const statuses = [
        { label: 'Tous', value: '' },
        { label: 'En attente', value: 'En attente' },
        { label: 'En cours', value: 'En cours' },
        { label: 'Terminé', value: 'Terminé' },
        { label: 'Annulé', value: 'Annulé' },
    ]

    const AppBarIcon = ({ icon, onPress, style }) => {
        const faIcon = <FontAwesomeIcon icon={icon} size={24} color={theme.colors.appBarIcon} />
        return <appbar.Action icon={faIcon} onPress={onPress} />
    }

    const renderLeftIcon = () => {
        const showMenu = () => navigation.openDrawer()
        const navBack = () => navigation.goBack()

        const onPressLeftIcon = () => {
            if (menu) showMenu()
            else navBack()
        }

        return <AppBarIcon icon={menu ? faBars : faArrowLeft} onPress={onPressLeftIcon} />
    }

    return (
        <appbar.Header style={[{ backgroundColor: theme.colors.appBar, elevation: 0 }, style]}>
            {renderLeftIcon()}
            {/* <Menu
                options={options}
                functions={functions}
                menuTrigger={menuTrigger} /> */}

            {<appbar.Content title={titleText} titleStyle={[theme.customFontMSregular.header, { marginLeft: isTablet ? 10 : '-5%', letterSpacing: 1 }]}/>}

            <Filter
                isAppBar={true}
                main={main}
                opened={filterOpened}
                toggleFilter={() => main.handleFilter(true)}
                setFilter={(field, value) => setFilter(main, field, value)}
                resetFilter={() => {
                    main.setState({ type: '', status: '', priority: '', assignedTo: { id: '', fullName: '' }, project: { id: '', name: '' } }, () => {
                        main.handleFilter(true)
                    })
                }}
                options={[
                    { id: 0, type: 'picker', title: "Type", values: types, value: type, field: 'type' },
                    { id: 1, type: 'picker', title: "État", values: statuses, value: status, field: 'status' },
                    { id: 2, type: 'picker', title: "Priorité", values: priorities, value: priority, field: 'priority' },
                    { id: 3, type: 'screen', title: "Projet", value: project.name, field: 'project', screen: 'ListProjects', titleText: 'Filtre par projet' },
                    { id: 4, type: 'screen', title: "Affecté à", value: assignedTo.fullName, field: 'assignedTo', screen: 'ListEmployees', titleText: 'Filtre par utilisateur' },
                ]}
            />

            {refresh && <AppBarIcon icon={faRedo} onPress={onRefresh} />}
        </appbar.Header>
    )
}

export default withNavigation(PickerBar)