import * as React from 'react';
import { Appbar as appbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';  
import { FontAwesomeIcon } from 'react-native-vector-icons/FontAwesome5';
import { faArrowLeft, faTimes, faBars, faRedo, faPaperclip, faEllipsisV, faTrash, faPaperPlane, faPen, faSearch, faCheck } from 'react-native-vector-icons/FontAwesome5';

import Loading from './Loading';
import * as theme from '../core/theme';

const Appbar = ({
    white, appBarColor,
    back, customBackHandler, blackBack, close, title, search, dots, check, send, attach, menu, edit, del, refresh, loading, controller,
    titleText, controllerIcon, iconsColor,
    searchBar,
    handleSearch, handleSubmit, handleSend, handleAttachement, handleMore, handleEdit, handleAction, handleDelete, handleRefresh,
    style, ...props }) => {

    const navigation = useNavigation(); 

    let navBack = () => navigation.goBack();
    const showMenu = () => navigation.openDrawer();

    const AppBarIcon = ({ icon, iconColor, onPress, style }) => {
        const faIcon = <FontAwesomeIcon icon={icon} size={24} color={iconColor} />;
        return <appbar.Action icon={faIcon} onPress={onPress} />;
    };

    if (white) {
        return (
            <appbar.Header style={[{ backgroundColor: '#ffffff', elevation: 0 }, style]}>
                <AppBarIcon icon={faArrowLeft} onPress={customBackHandler || navBack} />
                {title && <appbar.Content title={titleText} titleStyle={theme.customFontMSregular.h3} />}
            </appbar.Header>
        );
    }

    return (
        <appbar.Header style={[{ backgroundColor: appBarColor || theme.colors.appBar, elevation: 0 }, style]}>
            {back && <AppBarIcon icon={faArrowLeft} onPress={customBackHandler || navBack} iconColor={iconsColor || theme.colors.secondary} />}
            {close && <AppBarIcon icon={faTimes} onPress={customBackHandler || navBack} iconColor={iconsColor || theme.colors.secondary} />}
            {menu && <AppBarIcon icon={faBars} onPress={showMenu} />}
            {searchBar}
            {title && <appbar.Content title={titleText} titleStyle={[theme.customFontMSregular.header, { marginLeft: back || close || menu ? 0 : theme.padding, letterSpacing: 1 }]} />}
            {refresh && <AppBarIcon icon={faRedo} onPress={handleRefresh} />}
            {search && <AppBarIcon icon={faSearch} onPress={handleSearch} />}
            {attach && <AppBarIcon icon={faPaperclip} onPress={handleAttachement} />}
            {dots && <AppBarIcon icon={faEllipsisV} onPress={handleMore} />}
            {del && <AppBarIcon icon={faTrash} onPress={handleDelete} />}
            {loading && <Loading size='small' color='#fff' style={{ position: 'absolute', right: 15 }} />}
            {check && <AppBarIcon icon={faCheck} onPress={handleSubmit} iconColor={iconsColor || theme.colors.primary} />}
            {send && <AppBarIcon icon={faPaperPlane} onPress={handleSend} />}
            {edit && <AppBarIcon icon={faPen} onPress={handleEdit} iconColor={iconsColor || theme.colors.secondary} />}
            {controller && <appbar.Action icon={controllerIcon} onPress={handleAction} />}
        </appbar.Header>
    );
};

export default Appbar;  
