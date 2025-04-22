import * as React from 'react';
import { Text, StyleSheet } from 'react-native';
import { Card, Provider, Appbar, Title, Paragraph, BottomNavigation } from 'react-native-paper';

import * as theme from '../core/theme'

import Analytics from '../screens/Dashboard/Analytics';
import Notifications from '../screens/Dashboard/Notifications';
import Shortcuts from '../screens/Dashboard/Shortcuts';
import Tasks from '../screens/Dashboard/Tasks';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChartBar, faClipboardCheck, faBell, faArrowAltCircleRight } from '@fortawesome/free-solid-svg-icons';

const DashboardMenu = ({ ...props }) => {
  const StatsRoute = () => <Analytics navigation={props.navigation} />;
  const TasksRoute = () => <Tasks navigation={props.navigation} />
  const NotificationsRoute = () => <Notifications navigation={props.navigation} />
  const ShortcutsRoute = () => <Shortcuts navigation={props.navigation} />

  const [index, setIndex] = React.useState(3);
  const [routes] = React.useState([
    { key: 'stats', title: 'Stats', icon: faChartBar },
    { key: 'tasks', title: 'Tâches', icon: faClipboardCheck },
    { key: 'notifications', title: 'Notifications', icon: faBell },
    { key: 'shortcuts', title: 'Raccourcis', icon: faArrowAltCircleRight },
  ])

  const renderScene = BottomNavigation.SceneMap({
    stats: StatsRoute,
    tasks: TasksRoute,
    notifications: NotificationsRoute,
    shortcuts: ShortcutsRoute,
  })

  const renderIcon = ({ route }) => (
    <FontAwesomeIcon icon={route.icon} size={20} color={index === routes.indexOf(route) ? '#061357' : 'gray'} />
  );

  return (
    // <Provider>
    <BottomNavigation
      navigationState={{ index, routes }}
      onIndexChange={setIndex}
      renderScene={renderScene}
      renderIcon={renderIcon}
      barStyle={{ backgroundColor: '#FFF', height: 55, color:'black' }}
      activeColor={"#061357"}
      safeAreaInset={{ bottom: 0 }}
      labelMaxFontSizeMultiplier={1.5}
      renderLabel={(label)=><Text style={[theme.customFontMSregular.caption]}>{label.route.title}</Text>}
    />
    // </Provider>
  )
}

const styles = StyleSheet.create({
  title: {
    margin: 10,
    fontSize: 15,
    textAlign: 'center',
    fontSize: 35
  }
});
export default DashboardMenu;