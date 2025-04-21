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
    { key: 'stats', title: 'Stats', icon: () => <FontAwesomeIcon icon={faChartBar} size={20} color="black" /> },
    { key: 'tasks', title: 'Tâches', icon: () => <FontAwesomeIcon icon={faClipboardCheck} size={20} color="black" /> },
    { key: 'notifications', title: 'Notifications', icon: () => <FontAwesomeIcon icon={faBell} size={20} color="black" /> },
    { key: 'shortcuts', title: 'Raccourcis', icon: () => <FontAwesomeIcon icon={faArrowAltCircleRight} size={20} color="black" /> },
  ]);
  

  const renderScene = BottomNavigation.SceneMap({
    stats: StatsRoute,
    tasks: TasksRoute,
    notifications: NotificationsRoute,
    shortcuts: ShortcutsRoute,
  })

  return (
    // <Provider>
    <BottomNavigation
      navigationState={{ index, routes }}
      onIndexChange={setIndex}
      renderScene={renderScene}
      barStyle={{ backgroundColor: '#fff', height: 55 }}
      activeColor={"#061357"}
      safeAreaInset={{ bottom: 0 }}
      labelMaxFontSizeMultiplier={1.5}
    //  renderLabel={(label)=><Text style={[theme.customFontMSregular.caption]}>{label.route.title}</Text>}
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