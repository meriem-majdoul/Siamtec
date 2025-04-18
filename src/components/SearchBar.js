import React, { memo } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { Appbar as appbar } from 'react-native-paper';
import { faBars, faTimes, faSearch, faArrowLeft, faCheck } from 'react-native-fontawesome';
import { Searchbar } from "react-native-paper";
import * as theme from "../core/theme";
import { constants, isTablet } from '../core/constants';
import { useNavigation } from '@react-navigation/native';  // Remplacer withNavigation par useNavigation

import { FontAwesomeIcon } from '@fortawesome/free-solid-svg-icons';
import { faFilter } from 'react-native-fontawesome';

const SearchBar = ({
    menu = true, close,
    main, placeholder,
    showBar,
    title, titleText,
    searchInput = '', searchUpdated, handleSearch, magnifyStyle,
    check, handleSubmit,
    filterComponent,
    style, ...props }) => {

    const navigation = useNavigation();  // Utilisation du hook useNavigation

    const showMenu = () => navigation.openDrawer();
    const navBack = () => navigation.pop();

    const AppBarIcon = ({ icon, onPress, style }) => {
        const faIcon = <FontAwesomeIcon icon={icon} size={24} />;
        return <appbar.Action icon={() => <FontAwesomeIcon icon={icon} size={24} />} onPress={onPress} />;
    };

    const renderLeftIcon = () => {
        const icon = showBar ? faArrowLeft : menu ? faBars : faTimes;
        const handleAction = showBar ? handleSearch : menu ? showMenu : navBack;
        return <AppBarIcon icon={icon} onPress={handleAction} />;
    };

    return (
        <appbar.Header style={[{ backgroundColor: theme.colors.appBar, elevation: 0 }, style]}>
            {renderLeftIcon()}
            {title && <appbar.Content title={titleText} titleStyle={[theme.customFontMSregular.header, { marginLeft: isTablet ? 0 : '-5%', letterSpacing: 1 }]} />}
            {showBar &&
                <Searchbar
                    placeholder={placeholder}
                    placeholderTextColor={theme.colors.gray_dark}
                    onChangeText={(searchInput) => searchUpdated(searchInput)}
                    value={searchInput}
                    inputStyle={[theme.customFontMSregular.h3, { color: theme.colors.secondary }]}
                    style={{ backgroundColor: theme.colors.appBar, elevation: 0 }}
                    theme={{ colors: { placeholder: '#fff', text: '#fff' } }}
                    icon={() => null}
                    autoFocus={false}
                    selectionColor={theme.colors.gray_dark}
                />
            }
            {!showBar && <AppBarIcon icon={faSearch} onPress={handleSearch} />}
            {!showBar && filterComponent}
            {check && !showBar && <AppBarIcon icon={faCheck} onPress={handleSubmit} />}
        </appbar.Header>
    );
};

export default SearchBar;
