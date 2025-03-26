import React from 'react';
import { Text, View } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';

import AuthLoadingScreen from '../screens/Authentication/AuthLoadingScreen';
import DrawerMenu from './Drawer';
import { GuestTab, AppStack } from './StackNavigators';
import { constants } from '../core/constants';

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const AppDrawer = () => (
  <Drawer.Navigator
    drawerContent={(props) => <DrawerMenu {...props} />}
    screenOptions={{ drawerLockMode: 'locked-closed', drawerStyle: { width: constants.ScreenWidth * 0.83 } }}
  >
    <Drawer.Screen name="App" component={AppStack} />
  </Drawer.Navigator>
);

const MyApp = () => (
  <NavigationContainer>
    <Stack.Navigator initialRouteName="AuthLoading">
      <Stack.Screen name="AuthLoading" component={AuthLoadingScreen} options={{ headerShown: false }} />
      <Stack.Screen name="App" component={AppDrawer} options={{ headerShown: false }} />
      <Stack.Screen name="Guest" component={GuestTab} options={{ headerShown: false }} />
    </Stack.Navigator>
  </NavigationContainer>
);

const prefix = /https:\/\/synergys.page.link\/|synergys:\/\//;

const MainApp = () => <MyApp uriPrefix={prefix} />;

export default MainApp;