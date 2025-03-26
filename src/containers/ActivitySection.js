import React from "react"
import { View, StyleSheet, Text, TouchableOpacity } from "react-native"
import { Card, Title } from 'react-native-paper'
import { faChartLine, faRetweet } from "react-native-vector-icons/FontAwesome5"

import moment from 'moment'
import 'moment/locale/fr'
moment.locale('fr')

import FormSection from '../components/FormSection'
import MyInput from '../components/TextInput'

import * as theme from "../core/theme";
import { getRoleIdFromValue } from "../core/utils";

const ActivitySection = ({
    createdBy,
    createdAt,
    editedBy,
    editedAt,
    navigation,
    isExpanded,
    onPressSection,
    formSectionContainerStyle,
    ...props
}) => {

    const navigateToProfile = (user) => navigation.navigate('Profile', { user: { id: user.id, roleId: getRoleIdFromValue(user.role) } })
    const showEditedAt = editedAt !== '' && editedAt !== undefined
    const showEditedBy = editedBy.id !== '' && editedBy.id !== undefined

    return (
        <FormSection
            sectionTitle='Activité'
            sectionIcon={faChartLine}
            isExpanded={isExpanded}
            onPressSection={onPressSection}
            containerStyle={formSectionContainerStyle}
            form={
                <View style={{ flex: 1 }}>
                    <MyInput
                        label="Date de création"
                        returnKeyType="done"
                        value={moment(createdAt).format('lll')}
                        editable={false}
                    />

                    <TouchableOpacity onPress={() => navigateToProfile(createdBy)}>
                        <MyInput
                            label="Crée par"
                            returnKeyType="done"
                            value={createdBy.fullName}
                            editable={false}
                            link
                        />
                    </TouchableOpacity>

                    {showEditedAt &&
                        <MyInput
                            label="Date de mise à jour"
                            returnKeyType="done"
                            value={moment(editedAt).format('lll')}
                            editable={false}
                        />
                    }

                    {showEditedBy &&
                        <TouchableOpacity onPress={() => navigateToProfile(editedBy)}>
                            <MyInput
                                label="Dernier intervenant"
                                returnKeyType="done"
                                value={editedBy.fullName}
                                editable={false}
                                link
                            />
                        </TouchableOpacity>
                    }
                </View>
            }
        />
    )

}

export default ActivitySection


