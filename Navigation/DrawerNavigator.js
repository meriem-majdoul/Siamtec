import React, { Component } from 'react'
import firebase from '@react-native-firebase/app'

import { createAppContainer, createSwitchNavigator, NavigationEvents } from 'react-navigation';
import { createDrawerNavigator } from 'react-navigation-drawer';
import { createStackNavigator } from 'react-navigation-stack';

import { AuthStack, AppStack } from './StackNavigators'
import AuthLoadingScreen from '../screens/Authentication/AuthLoadingScreen'

import { constants } from '../core/constants'
import DrawerMenu from './Drawer'

const AppDrawer = createDrawerNavigator({
  App: {
    screen: AppStack,
    path: ''
  }
}
  ,{
    contentComponent: props => <DrawerMenu role={props} {...props} />,
    drawerLockMode: "locked-closed",
    drawerWidth: constants.ScreenWidth * 0.83,
    contentOptions: {
      activeTintColor: 'pink'
    },
    layout: {
      orientation: ["portrait"],
    },
  })

const MainSwitch = createSwitchNavigator(
  {
    Starter: AuthLoadingScreen,
    App: AppDrawer,
    Auth: AuthStack
  },
  {
    initialRouteName: 'Starter'
  }
)

const App = createAppContainer(MainSwitch)

const prefix = /https:\/\/synergys.page.link\/|synergys:\/\//

const MainApp = () => <App uriPrefix={prefix} />

export default MainApp