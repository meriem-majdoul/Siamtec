import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import moment from 'moment';
import 'moment/locale/fr';
moment.locale('fr');
import * as theme from '../core/theme';
import { isTablet } from '../core/constants';
import { useNavigation } from '@react-navigation/native'; // Import de useNavigation

const DocumentItem = ({ document, options, functions, onPress, ...props }) => {
    const navigation = useNavigation(); // Utilisation de useNavigation pour accéder à la navigation

    const setStateColor = (state) => {
        switch (state) {
            case 'A faire':
                return theme.colors.placeholder;
            case 'En cours':
                return 'orange';
            case 'Validé':
                return theme.colors.primary;
            default:
                return '#333';
        }
    };

    let iconType = 'folder';
    let colorIconType = theme.colors.gray;

    return (
        <Card style={{ paddingVertical: isTablet ? 12 : 0, marginVertical: 3, marginHorizontal: 5, elevation: 2, backgroundColor: theme.colors.white }} onPress={onPress}>
            <Card.Content style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                <View style={{ flex: 0.15, justifyContent: 'center', alignItems: 'flex-start' }}>
                    <MaterialCommunityIcons name={iconType} color={theme.colors.primary} size={33} />
                </View>

                <View style={{ flex: 0.85 }}>
                    <Text ellipsizeMode='middle' style={[theme.customFontMSmedium.body, { flex: 1, marginBottom: 10, lineHeight: 25 ,color:'black'}]}>
                        {document.name}
                    </Text>
                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
                        <View style={{ flex: 0.75 }}>
                            <Text numberOfLines={1} style={[theme.customFontMSmedium.caption, { color: theme.colors.gray_dark, textAlign: 'left' }]}>
                                Envoyé par {document.createdBy.fullName}
                            </Text>
                        </View>
                        <View style={{ flex: 0.25 }}>
                            <Text style={[theme.customFontMSmedium.caption, { color: theme.colors.gray_dark, textAlign: 'right' }]}>
                                {moment(document.createdAt).format('DD MMM')}
                            </Text>
                        </View>
                    </View>
                </View>
            </Card.Content>
        </Card>
    );
};

export default DocumentItem; // Pas besoin de 'withNavigation' ici
