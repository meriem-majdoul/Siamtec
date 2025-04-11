import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

import AuthLoadingScreen from '../screens/Authentication/AuthLoadingScreen';
import DrawerMenu from './Drawer';
import { GuestTab, AppStack } from './StackNavigators';
import { constants } from '../core/constants';

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

const AppDrawer = () => (
  <Drawer.Navigator
    drawerContent={(props) => <DrawerMenu {...props} />}
    screenOptions={{
      drawerStyle: {
        width: constants.ScreenWidth * 0.83,
      },
      drawerLabelStyle: {
        color: 'blue',
        fontSize: 16,
      },
      drawerInactiveTintColor: 'gray',
      swipeEnabled: false, // Désactive le swipe pour ouvrir le tiroir
    }}
  >
    <Drawer.Screen name="App" component={AppStack} />
  </Drawer.Navigator>
);

const MyApp = () => (
  <NavigationContainer>
    <Stack.Navigator
      initialRouteName="AuthLoading"
      screenOptions={{
        headerShown: false, // Appliquer par défaut
      }}
    >
      <Stack.Screen name="AuthLoading" component={AuthLoadingScreen} />
      <Stack.Screen name="App" component={AppDrawer} />
      <Stack.Screen name="Guest" component={GuestTab} />
      <Stack.Screen name="AppStack" component={AppStack} />
    </Stack.Navigator>
  </NavigationContainer>
);

const prefix = /https:\/\/synergys.page.link\/|synergys:\/\//;

const MainApp = () => <MyApp uriPrefix={prefix} />;

export default MainApp;
