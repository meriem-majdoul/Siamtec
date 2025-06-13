import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { View, Text, StyleSheet } from 'react-native';

import AuthLoadingScreen from '../screens/Authentication/AuthLoadingScreen';
import DrawerMenu from './Drawer';
import { GuestTab, AppStack } from './StackNavigators';
import { constants } from '../core/constants';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';



const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

const AppDrawer = () => {
  const getScreenName = (route) => {
    const focusedRouteName = getFocusedRouteNameFromRoute(route) || "Accueil";
    return focusedRouteName;
  };

  return (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerMenu {...props} />}
      screenOptions={({ route }) => {
        const screenName = getScreenName(route);
        return {
          drawerStyle: {
            width: constants.ScreenWidth * 0.83,
          },
          drawerLabelStyle: {
            color: 'blue',
            fontSize: 16,
          },
          drawerInactiveTintColor: 'gray',
          swipeEnabled: false,
          headerShown: screenName === "DashboardStack" || screenName === "Accueil",
        };
      }}
    >
      <Drawer.Screen name="Accueil" component={AppStack} />
    </Drawer.Navigator>
  );
};


const MyApp = () => (
  <NavigationContainer>
    <Stack.Navigator initialRouteName="AuthLoading">
      <Stack.Screen
        name="AuthLoading"
        component={AuthLoadingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="App"
        component={AppDrawer}
        options={({ route }) => ({
          headerShown: false,
        })}
      />
      <Stack.Screen
        name="Guest"
        component={GuestTab}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AppStack"
        component={AppStack}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  </NavigationContainer>
);

// Styles pour le Header
const styles = StyleSheet.create({
  header: {
    backgroundColor: 'blue',
    padding: 16,
    alignItems: 'center',
  },
  headerText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default MyApp;
