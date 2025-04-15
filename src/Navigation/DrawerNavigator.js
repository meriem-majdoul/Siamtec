import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

import AuthLoadingScreen from '../screens/Authentication/AuthLoadingScreen';
import DrawerMenu from './Drawer';
import { GuestTab, AppStack } from './StackNavigators';
import { constants } from '../core/constants';
import { useNavigationState } from '@react-navigation/native';


const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();
// const navigation = useNavigation();

// const getCurrentRouteName = () => {
//   // Récupère le nom de l'écran actuellement actif dans la pile de navigation
//   const currentRoute = navigation.getState().routes[navigation.getState().index];
//   return currentRoute.name;
// };

// Configuration du Drawer avec AppStack comme écran principal
const AppDrawer = () =>{
  const screenName = useNavigationState(state => state.routes[state.index].name);
  return (
  <Drawer.Navigator
    drawerContent={(props) => <DrawerMenu {...props} screenName={screenName}/>}
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
    <Drawer.Screen name="Menu" component={AppStack} 
      
        />
  </Drawer.Navigator>
);
};
// Configuration principale avec AuthLoading et AppDrawer
const MyApp = () => (
  <NavigationContainer>
    <Stack.Navigator initialRouteName="AuthLoading">
      <Stack.Screen name="AuthLoading" component={AuthLoadingScreen} options={{ headerShown: false }} />
      <Stack.Screen name="App" component={AppDrawer}  options={{ headerShown: false }}/>
      <Stack.Screen name="Guest" component={GuestTab} options={{ headerShown: false }} />
      <Stack.Screen name="AppStack" component={AppStack} options={{ headerShown: false }} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default MyApp;
