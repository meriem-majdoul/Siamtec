import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, useNavigationState } from '@react-navigation/native';

import AuthLoadingScreen from '../screens/Authentication/AuthLoadingScreen';
import DrawerMenu from './Drawer';
import { GuestTab, AppStack } from './StackNavigators';
import { constants } from '../core/constants';

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

// Configuration du Drawer avec AppStack comme écran principal
const AppDrawer = () => {
  // Utilisation de useNavigationState pour obtenir le nom de l'écran actif
  const screenName = useNavigationState((state) => state.routes[state.index].name) || "Accueil";

  console.log('screenName:', screenName);

  return (
    <Drawer.Navigator
      drawerContent={(props) =>
        // Afficher le menu seulement si on est sur "Accueil"
      <DrawerMenu {...props} screenName={screenName} /> 
      }
      screenOptions={{
        drawerStyle: {
          width: constants.ScreenWidth * 0.83,
        },
        drawerLabelStyle: {
          color: 'blue',
          fontSize: 16,
        },
        drawerInactiveTintColor: 'gray',
        swipeEnabled: screenName === "Accueil", // Désactive le swipe sauf sur "Accueil"
      }}
    >
      <Drawer.Screen name="Accueil" component={AppStack} />
    </Drawer.Navigator>
  );
};

// Configuration principale avec AuthLoading et AppDrawer
const MyApp = () => (
  <NavigationContainer>
    <Stack.Navigator initialRouteName="AuthLoading">
      <Stack.Screen name="AuthLoading" component={AuthLoadingScreen} options={{ headerShown: false }} />
      <Stack.Screen name="App" component={AppDrawer} options={{ headerShown: false }} />
      <Stack.Screen name="Guest" component={GuestTab} options={{ headerShown: false }} />
      <Stack.Screen name="AppStack" component={AppStack} options={{ headerShown: false }} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default MyApp;
