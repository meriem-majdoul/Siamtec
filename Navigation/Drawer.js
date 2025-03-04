import React, { Component } from 'react'
import { StyleSheet, SafeAreaView, StatusBar, Text, Dimensions, TouchableOpacity, View, FlatList } from 'react-native'
import AvatarText from '../components/AvatarText'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import firebase from '@react-native-firebase/app'
import { connect } from 'react-redux'
import NetInfo from "@react-native-community/netinfo"

import * as theme from '../core/theme';
import { constants } from '../core/constants';
import { resetState, setNetwork } from '../core/redux'

const db = firebase.firestore()

const menuPrivilleges = {
    backoffice: ['home', 'inbox', 'projects', 'agenda', 'users', 'requests', 'orders', 'documents', 'news', 'logout'],
    admin: ['home', 'inbox', 'projects', 'agenda', 'users', 'requests', 'orders', 'documents', 'news', 'logout'],
    dircom: ['home', 'inbox', 'projects', 'agenda', 'users', 'requests', 'documents', 'news', 'logout'],
    com: ['home', 'inbox', 'projects', 'agenda', 'users', 'requests', 'documents', 'news', 'logout'],
    tech: ['home', 'inbox', 'projects', 'agenda', 'users', 'requests', 'orders', 'documents', 'news', 'logout'],
    proseur: ['home', 'inbox', 'projects', 'agenda', 'users', 'requests', 'news', 'logout'],
    client: ['home', 'inbox', 'projects', 'requests', 'documents', 'news', 'logout']
}

const menuItems = [
    { id: 'home', name: 'Accueil', icon: 'home', color: 'green', navScreen: 'ProjectsStack' },
    { id: 'inbox', name: 'Boite de réception', icon: 'comment-text-multiple', color: '#EF6C00', navScreen: 'InboxStack' },
    { id: 'projects', name: 'Projets', icon: 'alpha-p-box', color: '#3F51B5', navScreen: 'ProjectsStack' }, //Create
    { id: 'agenda', name: 'Planning', icon: 'calendar', navScreen: 'AgendaStack' },
    { id: 'users', name: 'Utilisateurs', icon: 'account-multiple-outline', color: '#3b5998', navScreen: 'UsersManagementStack' },
    { id: 'requests', name: 'Gestion des demandes', icon: 'arrow-left-bold', color: '#AD1457', navScreen: 'RequestsManagementStack' },//Create
    { id: 'orders', name: 'Gestion des commandes', icon: 'file-document-edit-outline', navScreen: 'OrdersStack' }, //Create
    { id: 'documents', name: 'Documents', icon: 'file-document', color: '#6D4C41', navScreen: 'DocumentsStack' }, //Create
    { id: 'news', name: 'Actualités', icon: 'newspaper', navScreen: 'NewsStack' },//Create
    { id: 'logout', name: 'Se déconnecter', icon: 'logout', color: '#000000', navScreen: 'LoginScreen' },
]

class DrawerMenu extends React.Component {

    constructor(props) {
        super(props)
        this.renderMenuItem = this.renderMenuItem.bind(this)
        this.navigateToScreen = this.navigateToScreen.bind(this)

        this.state = {
            notificationCount: 0
        }
    }

    componentDidMount() {
        const { currentUser } = firebase.auth()
        if (currentUser) this.setNotificationBadge(currentUser.uid)
    }

    componentWillUnmount() {
        this.unsubscribenotifications()
    }

    setNotificationBadge(uid) {
        const query = db.collection('Users').doc(uid).collection('Notifications').where('deleted', '==', false).where('read', '==', false)
        this.unsubscribenotifications = query.onSnapshot((querysnapshot) => {
            if (querysnapshot.empty) return
            const notificationCount = querysnapshot.docs.length
            this.setState({ notificationCount })
        })
    }

    setMenuItems(role) {
        var arrMenuPrivilleges = menuPrivilleges[role]
        const menu = menuItems.filter(menuItem => arrMenuPrivilleges.includes(menuItem.id))
        return menu
    }

    renderHeader(currentUser, role) {
        const { displayName } = currentUser

        return (
            <TouchableOpacity style={styles.headerContainer} onPress={() => this.navigateToScreen('Profile')}>
                <View style={{ flex: 0.2, justifyContent: 'center', alignItems: 'center' }}>
                    {currentUser && <AvatarText size={constants.ScreenWidth * 0.11} label={displayName.charAt(0)} />}
                </View>

                <View style={{ flex: 0.8, flexDirection: 'row', marginBottom: 3 }}>
                    <View style={{ flex: 0.8 }}>
                        {currentUser && <Text numberOfLines={1} style={[theme.customFontMSsemibold.header, { color: '#fff', paddingLeft: 15 }]}>{displayName}</Text>}
                        <Text style={[theme.customFontMSmedium.body, { color: '#fff', paddingLeft: 15 }]}>{role.value}</Text>
                    </View>
                    <View style={{ flex: 0.2, justifyContent: 'center', alignItems: 'center' }}>
                        <FontAwesome name='gear' size={20} style={{ color: '#fff' }} />
                    </View>
                </View>
            </TouchableOpacity>
        )
    }

    renderFlatList() {

        const arrMenu = this.setMenuItems(this.props.role.id)
        const { notificationCount } = this.state

        return (
            <FlatList
                scrollEnabled={(constants.ScreenHeight >= 667) ? false : true}
                data={arrMenu}
                keyExtractor={item => item.id.toString()}
                style={{ marginTop: 15 }}
                renderItem={({ item }) => this.renderMenuItem(item)} />)
    }

    renderMenuItem(item) {
        const { notificationCount } = this.state

        if (item.id === 'logout')
            return (
                <TouchableOpacity onPress={this.handleSignout.bind(this)} style={styles.menuItem}>
                    <MaterialCommunityIcons name={item.icon} size={20} color={item.color} style={{ paddingLeft: 20 }} />
                    <Text style={[styles.menuText, theme.customFontMSsemibold.body]}>{item.name}</Text>
                </TouchableOpacity>
            )

        else return (
            <TouchableOpacity onPress={() => this.navigateToScreen(item.navScreen)} style={styles.menuItem}>
                <MaterialCommunityIcons name={item.icon} size={20} color={item.color} style={{ paddingLeft: 20 }} />
                {item.id === 'inbox' ?
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={[styles.menuText, theme.customFontMSsemibold.body]}>{item.name}</Text>
                        {notificationCount > 0 &&
                            <View style={styles.notificationBadge}>
                                <Text style={{ fontSize: 8, color: '#fff' }}>{notificationCount}</Text>
                            </View>
                        }
                    </View>
                    :
                    <Text style={[styles.menuText, theme.customFontMSsemibold.body]}>{item.name}</Text>
                }
            </TouchableOpacity>
        )
    }

    handleSignout() {
        firebase.auth().signOut().then(async () => {
            resetState(this)
            const { type, isConnected } = await NetInfo.fetch()
            const network = { type, isConnected }
            setNetwork(this, network)
        })
    }

    navigateToScreen(navScreen) {
        this.props.navigation.navigate(navScreen)
    }

    render() {
        const { role } = this.props
        const { currentUser } = firebase.auth()

        return (
            <SafeAreaView style={styles.container}>
                <StatusBar backgroundColor={theme.colors.statusbar} barStyle="light-content" />

                {currentUser && this.renderHeader(currentUser, role)}

                <View style={styles.menuContainer}>
                    {currentUser && this.renderFlatList()}
                </View>

                <View style={[styles.footerContainer, { bottom: 5 }]}>
                    <Text style={[theme.customFontMSregular.caption, { marginLeft: 15, color: theme.colors.gray400 }]}>App v1.0.1</Text>
                </View>

            </SafeAreaView>
        )
    }

}

const mapStateToProps = (state) => {

    return {
        role: state.roles.role,
        //fcmToken: state.fcmtoken
    }
}

export default connect(mapStateToProps)(DrawerMenu)

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerContainer: {
        flex: 0.15,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: theme.colors.primary
    },
    menuContainer: {
        flex: 0.85,
        justifyContent: 'center',
        backgroundColor: '#fff'
    },
    footerContainer: {
        flex: 1,
        justifyContent: 'center',
        height: 30,
        position: 'absolute',
        bottom: 10,
        right: 10
    },
    menuItem: {
        flex: 1,
        height: constants.ScreenHeight * 0.077,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start'
    },
    notificationBadge: {
        backgroundColor: '#00ACC1',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        width: 20,
        height: 20
    },
    menuText: {
        marginHorizontal: constants.ScreenWidth * 0.05,
    },
})