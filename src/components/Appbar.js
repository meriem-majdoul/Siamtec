import React from 'react';
import { Appbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { faArrowLeft, faTimes, faBars, faRedo, faSearch, faPaperclip, faEllipsisV, faTrash, faCheck, faPaperPlane, faPen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import PropTypes from 'prop-types';
import * as theme from '../core/theme';
import Loading from './Loading';

// Mapping des icônes
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

const AppBarIcon = ({ icon, iconColor = theme.colors.secondary, onPress }) => {
    const iconObj = iconMap[icon];
    if (!iconObj) return null;

    return (
        <Appbar.Action
            icon={() => <FontAwesomeIcon icon={iconObj} color={iconColor} size={24} />}
            onPress={onPress}
        />
    );
};

AppBarIcon.propTypes = {
    icon: PropTypes.string.isRequired, // Nom de l'icône dans le mapping
    iconColor: PropTypes.string, // Couleur de l'icône
    onPress: PropTypes.func, // Fonction appelée au clic
};

const CustomAppbar = ({
    white, appBarColor, back, customBackHandler, blackBack, close, title, search, dots, check, send, attach, menu, edit, del, refresh, loading, controller,
    titleText, controllerIcon, iconsColor, searchBar, handleSearch, handleSubmit, handleSend, handleAttachement, handleMore, handleEdit, handleAction, handleDelete, handleRefresh,
    style, ...props
}) => {
    const navigation = useNavigation();
    const navBack = () => navigation.goBack();
    const showMenu = () => navigation.openDrawer();

    return (
        <Appbar.Header style={[{ backgroundColor: white ? '#ffffff' : appBarColor || theme.colors.appBar, elevation: 0 }, style]}>
            {back && <AppBarIcon icon="arrow-left" onPress={customBackHandler || navBack} iconColor={iconsColor} />}
            {close && <AppBarIcon icon="times" onPress={customBackHandler || navBack} iconColor={iconsColor} />}
            {menu && <AppBarIcon icon="bars" onPress={showMenu} />}
            {searchBar}
            {title && <Appbar.Content title={titleText} titleStyle={[theme.customFontMSregular.header, { color: '#000', marginLeft: back || close || menu ? 0 : theme.padding }]} />}
            {refresh && <AppBarIcon icon="redo" onPress={handleRefresh} />}
            {search && <AppBarIcon icon="search" onPress={handleSearch} />}
            {attach && <AppBarIcon icon="paperclip" onPress={handleAttachement} />}
            {dots && <AppBarIcon icon="ellipsis-v" onPress={handleMore} />}
            {del && <AppBarIcon icon="trash" onPress={handleDelete} />}
            {loading && <Loading size="small" color="#fff" style={{ position: 'absolute', right: 15 }} />}
            {check && <AppBarIcon icon="check" onPress={handleSubmit} />}
            {send && <AppBarIcon icon="paper-plane" onPress={handleSend} />}
            {edit && <AppBarIcon icon="pen" onPress={handleEdit} />}
            {controller && <Appbar.Action icon={controllerIcon} onPress={handleAction} />}
        </Appbar.Header>
    );
};

CustomAppbar.propTypes = {
    white: PropTypes.bool,
    appBarColor: PropTypes.string,
    back: PropTypes.bool,
    customBackHandler: PropTypes.func,
    close: PropTypes.bool,
    title: PropTypes.bool,
    search: PropTypes.bool,
    dots: PropTypes.bool,
    check: PropTypes.bool,
    send: PropTypes.bool,
    attach: PropTypes.bool,
    menu: PropTypes.bool,
    edit: PropTypes.bool,
    del: PropTypes.bool,
    refresh: PropTypes.bool,
    loading: PropTypes.bool,
    controller: PropTypes.bool,
    titleText: PropTypes.string,
    controllerIcon: PropTypes.any,
    iconsColor: PropTypes.string,
    searchBar: PropTypes.element,
    handleSearch: PropTypes.func,
    handleSubmit: PropTypes.func,
    handleSend: PropTypes.func,
    handleAttachement: PropTypes.func,
    handleMore: PropTypes.func,
    handleEdit: PropTypes.func,
    handleAction: PropTypes.func,
    handleDelete: PropTypes.func,
    handleRefresh: PropTypes.func,
    style: PropTypes.object,
};

export default CustomAppbar;
