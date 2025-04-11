import { Component } from 'react';
import * as React from 'react';

import {
  Alert,
  LogBox,
  Platform,
  StyleSheet,
  Text,
  View
} from 'react-native';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';

import { persistStore } from 'redux-persist';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/es/integration/react';
import {
  Provider as PaperProvider,
  DefaultTheme,
  configureFonts,
} from 'react-native-paper';
import { MenuProvider } from 'react-native-popup-menu';
// import codePush from 'react-native-code-push';

import AppToast from './src/components/global/AppToast';
import NetworkStatus from './src/NetworkStatus';
import RootController from './src/Navigation/DrawerNavigator';
import { NavigationContainer } from '@react-navigation/native';


import firebase from './src/firebase';
import Store from './src/Store/configureStore';
import { fontsConfig } from './fontConfig';
import * as theme from './src/core/theme';
import MyStatusBar from './src/components/MyStatusBar';
// import { LoadDialog } from './src/components';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();
const paperTheme = {
  ...DefaultTheme,
  fonts: configureFonts(fontsConfig),
  colors: {
    primary: theme.colors.primary,
    accent: theme.colors.secondary,
    background: theme.colors.background,
    surface: theme.colors.surface,
    text: theme.colors.secondary,
    disabled: theme.colors.gray_medium,
    placeholder: theme.colors.gray_dark,
    backdrop: theme.colors.white,
    input: theme.colors.gray_dark,
  },
};

const HomeScreen = () => (
  <View style={styles.container}>
    <Text>Home Screen</Text>
  </View>
);

const DetailsScreen = () => (
  <View style={styles.container}>
    <Text>Details Screen</Text>
  </View>
);

const AppDrawer = () => (
  <Drawer.Navigator initialRouteName="Home">
    <Drawer.Screen name="Home" component={HomeScreen} />
    <Drawer.Screen name="Details" component={DetailsScreen} />
  </Drawer.Navigator>
);

const App = () => {
  const persistor = persistStore(Store);

  return (
    <Provider store={Store}>
      <PersistGate loading={null} persistor={persistor}>
        <PaperProvider theme={paperTheme}>
          <MenuProvider>
            <MyStatusBar>
              {/* {progressView}
              <Text>{this.state.syncMessage || ""}</Text> */}
              {/* <NetworkStatus> */}
                <RootController />
                <AppToast />
              {/* </NetworkStatus> */}
            </MyStatusBar>
          </MenuProvider>
        </PaperProvider>
      </PersistGate>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
