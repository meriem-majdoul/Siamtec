import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { MenuProvider } from 'react-native-popup-menu';
import { DefaultTheme, configureFonts, Provider as PaperProvider } from 'react-native-paper';
import { persistStore } from 'redux-persist';

import Store from './src/Store/configureStore';
import { fontsConfig } from './fontConfig';
import * as theme from './src/core/theme';
import MyStatusBar from './src/components/MyStatusBar';
import NetworkStatus from './src/NetworkStatus';
import RootController from './src/Navigation/DrawerNavigator';
import AppToast from './src/components/global/AppToast';
import SplashScreen from './src/components/SplashScreen'; // Assurez-vous que ce composant existe

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

const App = () => {
  const [isSplashVisible, setSplashVisible] = useState(true);
  const persistor = persistStore(Store);

  useEffect(() => {
    // Simuler un délai pour le SplashScreen (par exemple 3 secondes)
    const timeout = setTimeout(() => {
      setSplashVisible(false);
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  if (isSplashVisible) {
    return <SplashScreen />;
  }

  return (
    <Provider store={Store}>
      <PersistGate loading={null} persistor={persistor}>
        <PaperProvider theme={paperTheme}>
          <MenuProvider>
            <MyStatusBar>
              <NetworkStatus>
                <RootController />
                <AppToast />
              </NetworkStatus>
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
