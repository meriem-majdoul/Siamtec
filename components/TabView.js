import * as React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { TabView as Tabview, TabBar, SceneMap } from 'react-native-tab-view';
import ListUsers from '../screens/Users/ListUsers'
import ListTeams from '../screens/Users/ListTeams'
import * as theme from '../core/theme'

const initialLayout = { width: Dimensions.get('window').width }


export default class TabView extends React.Component {

  render() {
    const renderScene = ({ route }) => {
      switch (route.key) {
        case 'first':
          return this.props.Tab1;
        case 'second':
          return this.props.Tab2;
        default:
          return null;
      }
    }

    return (
      <Tabview
        renderScene={renderScene}
        initialLayout={initialLayout}
        renderTabBar={props => <TabBar {...props}
          indicatorStyle={{ backgroundColor: 'white' }}
          style={{ backgroundColor: theme.colors.primary }}
          renderLabel={({ route, focused, color }) => (
            <Text style={[theme.customFontMSsemibold.body, { color: '#fff' }]}>
              {route.title}
            </Text>
          )}
        />}
        {...this.props}
      />
    )
  }

}

const styles = StyleSheet.create({
  scene: {
    flex: 1,
  },
});