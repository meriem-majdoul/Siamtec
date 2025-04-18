import * as React from 'react';
import { Appbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
    faArrowLeft,
    faTimes,
    faBars,
    faRedo,
    faSearch,
    faPaperclip,
    faEllipsisV,
    faTrash,
    faCheck,
    faPaperPlane,
    faPen
} from '@fortawesome/free-solid-svg-icons';

import Loading from './Loading';
import * as theme from '../core/theme';

// Map string names to icon objects
const iconMap = {
    "arrow-left": faArrowLeft,
    "times": faTimes,
    "bars": faBars,
    "redo": faRedo,
    "search": faSearch,
    "paperclip": faPaperclip,
    "ellipsis-v": faEllipsisV,
    "trash": faTrash,
    "check": faCheck,
    "paper-plane": faPaperPlane,
    "pen": faPen,
};

const AppBarIcon = ({ icon, iconColor, onPress }) => {
    const iconObj = iconMap[icon];
    if (!iconObj) return null;
    return <Appbar.Action icon={() => <FontAwesomeIcon icon={iconObj} color={iconColor} size={24} />} onPress={onPress} />;
};

const CustomAppbar = ({
    white, appBarColor,
    back, customBackHandler, blackBack, close, title, search, dots, check, send, attach, menu, edit, del, refresh, loading, controller,
    titleText, controllerIcon, iconsColor,
    searchBar,
    handleSearch, handleSubmit, handleSend, handleAttachement, handleMore, handleEdit, handleAction, handleDelete, handleRefresh,
    style, ...props
}) => {
    const navigation = useNavigation();

    let navBack = () => navigation.goBack();
    const showMenu = () => navigation.openDrawer();

    if (white) {
        return (
            <Appbar.Header style={[{ backgroundColor: '#ffffff', elevation: 0, color: '#000' }, style]}>
                <AppBarIcon icon="arrow-left" onPress={customBackHandler || navBack} />
                {title && <Appbar.Content title={titleText} titleStyle={theme.customFontMSregular.h3} />}
            </Appbar.Header>
        );
    }

    return (
        <Appbar.Header style={[{ backgroundColor: appBarColor || theme.colors.appBar, elevation: 0, color: '#000' }, style]}>
            {back && <AppBarIcon icon="arrow-left" onPress={customBackHandler || navBack} iconColor={iconsColor || theme.colors.secondary} />}
            {close && <AppBarIcon icon="times" onPress={customBackHandler || navBack} iconColor={iconsColor || theme.colors.secondary} />}
            {menu && <AppBarIcon icon="bars" onPress={showMenu} />}
            {searchBar}
            {title && <Appbar.Content title={titleText} titleStyle={[theme.customFontMSregular.header, { color: '#000', marginLeft: back || close || menu ? 0 : theme.padding, letterSpacing: 1 }]} />}
            {refresh && <AppBarIcon icon="redo" onPress={handleRefresh} />}
            {search && <AppBarIcon icon="search" onPress={handleSearch} />}
            {attach && <AppBarIcon icon="paperclip" onPress={handleAttachement} />}
            {dots && <AppBarIcon icon="ellipsis-v" onPress={handleMore} />}
            {del && <AppBarIcon icon="trash" onPress={handleDelete} />}
            {loading && <Loading size='small' color='#fff' style={{ position: 'absolute', right: 15 }} />}
            {check && <AppBarIcon icon="check" onPress={handleSubmit} iconColor={iconsColor || theme.colors.primary} />}
            {send && <AppBarIcon icon="paper-plane" onPress={handleSend} />}
            {edit && <AppBarIcon icon="pen" onPress={handleEdit} iconColor={iconsColor || theme.colors.secondary} />}
            {controller && <Appbar.Action icon={controllerIcon} onPress={handleAction} />}
        </Appbar.Header>
    );
};

export default CustomAppbar;