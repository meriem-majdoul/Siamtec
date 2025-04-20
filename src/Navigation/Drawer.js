import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, FlatList } from 'react-native';
import { faHomeLgAlt, faInbox, faDraftingCompass, faCalendarAlt, faUserFriends, faAddressCard, faTicketAlt, faFileInvoice, faFolderClosed, faNewspaper, faRightFromBracket, faVials, faCogs } from '@fortawesome/free-solid-svg-icons';
import { faCommentDots, faCog } from "@fortawesome/free-solid-svg-icons";
import { connect } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

import AvatarText from '../components/AvatarText';
import CustomIcon from '../components/CustomIcon';
import AppVersion from '../components/AppVersion';
import * as theme from '../core/theme';
import { constants, isTablet } from '../core/constants';
import { setStatusBarColor } from '../core/redux';
import firebase, { db } from '../firebase';

//I removed 'planning' as the tasks feature is not used anymore
const menuPrivilleges = {
  backoffice: ['home', 'inbox', 'projects', 'users', 'clients', 'requests', 'orders', 'simulator', 'documents', 'news', "settings", 'logout'],
  admin: ['home', 'inbox', 'projects', , 'users', 'clients', 'requests', 'orders', 'simulator', 'documents', 'news', "settings", 'logout'],
  dircom: ['home', 'inbox', 'projects', 'users', 'clients', 'requests', 'documents', 'simulator', 'news', "settings", 'logout'],
  com: ['home', 'inbox', 'projects', 'clients', 'requests', 'documents', 'simulator', 'news', "settings", 'logout'],
  tech: ['home', 'inbox', 'projects', 'users', 'clients', 'requests', 'orders', 'documents', 'simulator', 'news', "settings", 'logout'],
  poseur: ['projects', 'inbox', 'requests', 'news', "settings", 'logout'],
  client: ['projects', 'inbox', 'requests', 'documents', 'news', "settings", 'logout'],
  designoffice: ['projects', 'inbox', 'news', "settings", 'logout'],
};

 // { id: 'planning', name: 'Planning', icon: faCalendarAlt, color: theme.colors.miPlanning, navScreen: 'Agenda', drawer: 'AgendaStack' },

 const menuItems = [
  { id: 'home', name: 'Accueil', icon: faHomeLgAlt, color: theme.colors.miHome, navScreen: 'Dashboard', drawer: 'DashboardStack' },
  { id: 'inbox', name: 'Boite de réception', icon: faInbox, color: '#EF6C00', navScreen: 'Inbox', drawer: 'InboxStack' },
  { id: 'projects', name: 'Projets', icon: faDraftingCompass, color: '#3F51B5', navScreen: 'ListProjects', drawer: 'ProjectsStack' },
  { id: 'planning', name: 'Planning', icon: faCalendarAlt, color: theme.colors.miPlanning, navScreen: 'Agenda', drawer: 'AgendaStack' },
  { id: 'users', name: 'Utilisateurs', icon: faUserFriends, color: theme.colors.miUsers, navScreen: 'UsersManagement', drawer: 'UsersManagementStack' },
  { id: 'clients', name: 'Clients/Prospects', icon: faAddressCard, color: theme.colors.miClients, navScreen: 'ClientsManagement', drawer: 'ClientsManagementStack' },
  { id: 'requests', name: 'Demandes', icon: faTicketAlt, color: theme.colors.miRequests, navScreen: 'RequestsManagement', drawer: 'RequestsManagementStack' },
  { id: 'orders', name: 'Commandes', icon: faFileInvoice, color: theme.colors.miOrders, navScreen: 'ListOrders', drawer: 'OrdersStack' },
  { id: 'documents', name: 'Documents', icon: faFolderClosed, color: theme.colors.miDocuments, navScreen: 'ListDocuments', drawer: 'DocumentsStack' }, // changed
  { id: 'simulator', name: 'Simulateur', icon: faVials, color: theme.colors.miSimulator, navScreen: 'ListSimulations', drawer: 'SimulatorStack' },
  { id: 'news', name: 'Actualités', icon: faNewspaper, color: theme.colors.miNews, navScreen: 'ListNews', drawer: 'NewsStack' },
  { id: 'settings', name: 'Paramètres', icon: faCogs, color: theme.colors.miSettings, navScreen: 'Settings', drawer: 'SettingsStack' },
  { id: 'logout', name: 'Se déconnecter', icon: faRightFromBracket, color: theme.colors.miLogout, navScreen: 'LoginScreen', drawer: 'AuthStack' }, // changed
];

const DrawerMenu = ({ role, currentUser }) => {
  const navigation = useNavigation();
  const [notificationCount, setNotificationCount] = React.useState(0);

  React.useEffect(() => {
    if (currentUser) setNotificationBadge(currentUser.uid);
    setStatusBarColor({ backgroundColor: theme.colors.background, barStyle: "dark-content" });

    return () => {
      unsubscribenotifications && unsubscribenotifications();
    };
  }, [currentUser]);

  const setNotificationBadge = (uid) => {
    const query = db
      .collection('Users')
      .doc(uid)
      .collection('Notifications')
      .where('deleted', '==', false)
      .where('read', '==', false);

    unsubscribenotifications = query.onSnapshot((querysnapshot) => {
      if (querysnapshot.empty) return;
      setNotificationCount(querysnapshot.docs.length);
    });
  };

  const setMenuItems = (role) => {
    const arrMenuPrivilleges = menuPrivilleges[role];
    if (arrMenuPrivilleges) {
      return menuItems.filter(menuItem => arrMenuPrivilleges.includes(menuItem.id));
    }
  };

  const renderHeader = () => {
    const showChatIcon = !role.isClient && (role.isHighRole || role.isLowRole); // Employees only

    return (
      <TouchableOpacity style={styles.headerContainer} onPress={() => navigateToScreen2('ProfileStack', 'Profile', { isRoot: false })}>
        <View style={{ flex: 0.22, justifyContent: 'center', alignItems: 'center' }}>
          <AvatarText
            size={isTablet ? 90 : 45}
            label={currentUser && currentUser.fullName ? currentUser.fullName.charAt(0) : '?'}
            labelStyle={{ color: theme.colors.white }}
          />
        </View>

        <View style={{ flex: 0.78, flexDirection: 'row', marginBottom: 3 }}>
          <View style={{ flex: 0.73 }}>
            <Text numberOfLines={1} style={[theme.customFontMSmedium.title, { color: theme.colors.secondary }]}>
              {currentUser.fullName}
            </Text>
            <Text style={[theme.customFontMSmedium.body, { color: theme.colors.gray_dark }]}>
              {role.value}
            </Text>
          </View>
          <View style={{ flex: 0.27, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>
            <CustomIcon icon={faCog} color={theme.colors.gray_medium} />
            {showChatIcon &&
              <CustomIcon
                icon={faCommentDots}
                color={theme.colors.primary}
                onPress={() => navigateToScreen('ChatStack', { chatId: 'GlobalChat' })}
              />
            }
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderMenu = () => {
    const arrMenu = setMenuItems(role.id);

    return (
      <FlatList
        data={arrMenu}
        showsVerticalScrollIndicator
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ paddingVertical: theme.padding / 2, paddingLeft: theme.padding }}
        renderItem={({ item }) => renderMenuItem(item)}
      />
    );
  };

  const renderMenuItem = (item) => {
    if (item.id === 'logout') {
      return (
        <TouchableOpacity onPress={handleSignout} style={styles.menuItem}>
          <CustomIcon icon={item.icon} color={item.color} />
          <Text style={[styles.menuText, theme.customFontMSmedium.body]}>{item.name}</Text>
        </TouchableOpacity>
      );
    } else {

      return (
        <TouchableOpacity onPress={() => navigateToScreen2(item.drawer, item.navScreen)} style={styles.menuItem}>
          <CustomIcon icon={item.icon} color={item.color} />
          {item.id === 'inbox' ? (
            <View style={{ flexDirection: 'row', alignItems: "center" }}>
              <Text style={[styles.menuText, theme.customFontMSmedium.body]}>{item.name}</Text>
              {notificationCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={{ fontSize: isTablet ? 14 : 8, color: '#fff', fontWeight: "bold" }}>{notificationCount}</Text>
                </View>
              )}
            </View>
          ) : (
            <Text style={[styles.menuText, theme.customFontMSmedium.body]}>{item.name}</Text>
          )}
        </TouchableOpacity>
      );
    }
  };

  const handleSignout = async () => {
    await firebase.auth().signOut();
  };

  const navigateToScreen = (screenName, screenParams) => {
    navigation.navigate(screenName, screenParams);
  };

  const navigateToScreen2 = (drawer, screenName, screenParams) => {
    navigation.navigate(drawer, { screenName, screenParams });
  };

  return (
    <View style={styles.container}>
      {currentUser && renderHeader()}
      <View style={styles.menuContainer}>
        {currentUser && renderMenu()}
      </View>
      <View style={[styles.footerContainer, { bottom: 5 }]}>
        <AppVersion />
      </View>
    </View>
  );
};

const mapStateToProps = (state) => ({
  role: state.roles.role,
  currentUser: state.currentUser,
});

export default connect(mapStateToProps)(DrawerMenu);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flex: 0.13,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray_light,
  },
  menuContainer: {
    flex: 0.87,
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
    color: '#000',
  },
  footerContainer: {
    flex: 1,
    justifyContent: 'center',
    height: 30,
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
  menuItem: {
    flex: 1,
    height: constants.ScreenHeight * 0.07,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  notificationBadge: {
    backgroundColor: '#00ACC1',
    borderRadius: isTablet ? 20 : 11,
    justifyContent: 'center',
    alignItems: 'center',
    width: isTablet ? 40 : 22,
    height: isTablet ? 40 : 22,
  },
  menuText: {
    marginHorizontal: constants.ScreenWidth * 0.05,
    color: '#000',
  },
});
