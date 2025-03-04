import * as React from 'react';
import { TouchableOpacity } from 'react-native'
import { Appbar as appbar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { withNavigation } from 'react-navigation'
import { Send } from 'react-native-gifted-chat';

import Loading from './Loading'

import * as theme from '../core/theme'

const Appbar = ({
    white,
    back, customBackHandler, blackBack, close, title, search, dots, check, send, attach, menu, edit, del, refresh, loading, controller,
    titleText, controllerIcon,
    searchBar,
    handleSearch, handleSubmit, handleSend, handleAttachement, handleMore, handleEdit, handleAction, handleDelete, handleRefresh,
    navigation, goBack, style, ...props }) => {

    // let navBack = () => navigation.pop()
    // if (goBack)
    let navBack = () => navigation.goBack()

    const showMenu = () => navigation.openDrawer()

    let backColor = '#ffffff'
    if (close)
        backColor = '#fff'

    if (white) {
        return (
            <appbar.Header style={[{ backgroundColor: '#ffffff', elevation: 0 }, style]}>
                <TouchableOpacity onPress={navBack} style={{ marginHorizontal: 5 }} >
                    <Icon name="arrow-left" size={21} color='#333' />
                </TouchableOpacity>
                {title && <appbar.Content title={titleText} titleStyle={theme.customFontMSmedium.title} />}
            </appbar.Header>
        )
    }

    else return (
        <appbar.Header style={[{ backgroundColor: theme.colors.primary, elevation: 0 }, style]}>
            {back && <appbar.BackAction onPress={customBackHandler || navBack} color={backColor} style={{ marginHorizontal: 5 }} />}
            {menu &&
                <TouchableOpacity onPress={showMenu} style={{ marginHorizontal: 10 }} >
                    <Icon name="menu" size={24} color='#fff' />
                </TouchableOpacity>
            }
            {searchBar}
            {title && <appbar.Content title={titleText} titleStyle={theme.customFontMSmedium.title} />}
            {refresh && <appbar.Action icon="refresh" onPress={handleRefresh} />}
            {search && <appbar.Action icon="magnify" onPress={handleSearch} />}
            {attach && <appbar.Action icon="attachment" onPress={handleAttachement} />}
            {dots && <appbar.Action icon="dots-vertical" onPress={handleMore} />}
            {del && <appbar.Action icon="delete" onPress={handleDelete} />}
            {loading && <Loading size='small' color= '#fff' style={{ position: 'absolute', right: 15 }} />}
            {check && <appbar.Action icon="check" onPress={handleSubmit} />}
            {send && <appbar.Action icon="send" onPress={handleSend} />}
            {edit && <appbar.Action icon="pencil" onPress={handleEdit} />}
            {controller && <appbar.Action icon={controllerIcon} onPress={handleAction} />}
        </appbar.Header>
   )
}

export default withNavigation(Appbar)