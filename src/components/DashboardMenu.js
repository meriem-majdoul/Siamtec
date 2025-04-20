import * as React from 'react';
import { Text, StyleSheet } from 'react-native';
import { Card, Provider, Appbar, Title, Paragraph, BottomNavigation } from 'react-native-paper';

import * as theme from '../core/theme'

import Analytics from '../screens/Dashboard/Analytics';
import Notifications from '../screens/Dashboard/Notifications';
import Shortcuts from '../screens/Dashboard/Shortcuts';
import Tasks from '../screens/Dashboard/Tasks';
// import {faChartBar} from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChartBar, faClipboardCheck, faBell, faArrowAltCircleRight } from '@fortawesome/fontawesome-svg-core';


const DashboardMenu = ({ ...props }) => {
  const StatsRoute = () => <Analytics navigation={props.navigation} />;
  const TasksRoute = () => <Tasks navigation={props.navigation} />;
  const NotificationsRoute = () => <Notifications navigation={props.navigation} />;
  const ShortcutsRoute = () => <Shortcuts navigation={props.navigation} />;

  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: 'stats', title: 'Stats', icon: () => <FontAwesomeIcon icon={faChartBar} size={24} color="#061357" /> },
    { key: 'tasks', title: 'Tâches', icon: () => <FontAwesomeIcon icon={faClipboardCheck} size={24} color="#061357" /> },
    { key: 'notifications', title: 'Notifications', icon: () => <FontAwesomeIcon icon={faBell} size={24} color="#061357" /> },
    { key: 'shortcuts', title: 'Raccourcis', icon: () => <FontAwesomeIcon icon={faArrowAltCircleRight} size={24} color="#061357" /> },
  ]);

  const renderScene = BottomNavigation.SceneMap({
    stats: StatsRoute,
    tasks: TasksRoute,
    notifications: NotificationsRoute,
    shortcuts: ShortcutsRoute,
  });

  return (
    <BottomNavigation
      navigationState={{ index, routes }}
      onIndexChange={setIndex}
      renderScene={renderScene}
      barStyle={{ backgroundColor: '#fff', height: 55 }}
      activeColor={'#061357'}
      safeAreaInset={{ bottom: 0 }}
      renderLabel={({ route }) => (
        <Text style={[theme.customFontMSregular.caption]}>{route.title}</Text>
      )}
    />
  );
};

const styles = StyleSheet.create({
  title: {
    margin: 10,
    textAlign: 'center',
    fontSize: 35,
  },
});

export default DashboardMenu;
