import * as React from 'react';
import { Text, StyleSheet } from 'react-native';
import { Card, Provider, Appbar, Title, Paragraph, BottomNavigation } from 'react-native-paper';

import * as theme from '../core/theme'

import Analytics from '../screens/Dashboard/Analytics';
import Notifications from '../screens/Dashboard/Notifications';
import Shortcuts from '../screens/Dashboard/Shortcuts';
import Tasks from '../screens/Dashboard/Tasks';

const DashboardMenu = ({ ...props }) => {
  const StatsRoute = () => <Analytics navigation={props.navigation} />;
  const TasksRoute = () => <Tasks navigation={props.navigation} />
  const NotificationsRoute = () => <Notifications navigation={props.navigation} />
  const ShortcutsRoute = () => <Shortcuts navigation={props.navigation} />

  const [index, setIndex] = React.useState(3);
  const [routes] = React.useState([
    { key: 'stats', title: 'Stats', icon: 'google-analytics' },
    { key: 'tasks', title: 'Tâches', icon: 'clipboard-check-outline' },
    { key: 'notifications', title: 'Notifications', icon: 'bell' },
    { key: 'shortcuts', title: 'Raccourcis', icon: 'arrow-decision' },
  ])

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
   //   renderLabel={(label)=><Text style={[theme.customFontMSregular.caption]}>{label.route.title}</Text>}
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