import { Component } from 'react';
import * as React from 'react';

import {
  Alert,
  LogBox,
  Platform,
  StyleSheet,
  Text
} from 'react-native';
import notifee, { AndroidImportance } from '@notifee/react-native';

import { persistStore } from 'redux-persist';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/es/integration/react';
import {
  Provider as PaperProvider,
  DefaultTheme,
  configureFonts,
} from 'react-native-paper';
import { MenuProvider } from 'react-native-popup-menu';
import SplashScreen from 'react-native-splash-screen';
import codePush from 'react-native-code-push';

import AppToast from './components/global/AppToast';
import NetworkStatus from './NetworkStatus';
import RootController from './Navigation/DrawerNavigator';

import firebase from './firebase';
import Store from './Store/configureStore';
import { fontsConfig } from '../fontConfig';
import * as theme from './core/theme';
import MyStatusBar from './components/MyStatusBar';
import { LoadDialog } from './components';

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
  },
};

class App extends Component {

  constructor(props) {
    super(props)

    // this.syncImmediate = this.syncImmediate.bind(this)

    // this.state = {
    //   progress: 0
    // }
  }

  // syncImmediate() {
  //   codePush.sync(
  //     { installMode: codePush.InstallMode.IMMEDIATE },
  //     this.codePushStatusDidChange.bind(this),
  //     this.codePushDownloadDidProgress.bind(this)
  //   );
  // }

  // codePushStatusDidChange(syncStatus) {
  //   switch (syncStatus) {
  //     case codePush.SyncStatus.CHECKING_FOR_UPDATE:
  //       this.setState({ syncMessage: "Checking for update." });
  //       break;
  //     case codePush.SyncStatus.DOWNLOADING_PACKAGE:
  //       this.setState({ syncMessage: "Downloading package." });
  //       break;
  //     case codePush.SyncStatus.AWAITING_USER_ACTION:
  //       this.setState({ syncMessage: "Awaiting user action." });
  //       break;
  //     case codePush.SyncStatus.INSTALLING_UPDATE:
  //       this.setState({ syncMessage: "Installing update." });
  //       break;
  //     case codePush.SyncStatus.UP_TO_DATE:
  //       this.setState({ syncMessage: "App up to date.", progress: false });
  //       break;
  //     case codePush.SyncStatus.UPDATE_IGNORED:
  //       this.setState({ syncMessage: "Update cancelled by user.", progress: false });
  //       break;
  //     case codePush.SyncStatus.UPDATE_INSTALLED:
  //       this.setState({ syncMessage: "Update installed and will be applied on restart.", progress: false });
  //       break;
  //     case codePush.SyncStatus.UNKNOWN_ERROR:
  //       this.setState({ syncMessage: "An unknown error occurred.", progress: false });
  //       break;
  //   }
  // }

  // codePushDownloadDidProgress(progress) {
  //   this.setState({ progress });
  // }

  async componentDidMount() {

    SplashScreen.hide();

    //this.syncImmediate.bind(this)

    //Notification channels
    const channelId = await notifee.createChannel({
      id: 'projects',
      name: 'projects',
      lights: false,
      vibration: true,
      importance: AndroidImportance.HIGH,
    });

    this.foregroundMessages = firebase
      .messaging()
      .onMessage(this.onForegroundMessageReceived);
  }

  //Forground: messages listener
  async onForegroundMessageReceived(message) {
    console.log("notification received on foreground...")
    try {
      console.log(message.data.notifee)
      if (Platform.OS === 'ios') {
        delete message.data?.message;
      }
      await notifee.displayNotification(JSON.parse(message.data.notifee));
    }

    catch (e) {
      console.log(e, "...........................")
    }
  }

  componentWillUnmount() {
    this.foregroundMessages && this.foregroundMessages();
  }

  render() {
    let persistor = persistStore(Store);
    persistor.purge()

    // let progressView;
    // if (this.state.progress) {
    //   const { receivedBytes, totalBytes } = this.state.progress
    //   const progress = (receivedBytes / totalBytes) * 100
    //   const loadingDialog = progress !== false
    //   progressView = (
    //     <LoadDialog loading={loadingDialog} message={progress} />
    //     // <Text>Installation de la dernière version: {progress}%</Text>
    //   );
    // }

    return (
      <Provider store={Store}>
        <PersistGate persistor={persistor}>
          <PaperProvider theme={paperTheme}>
            <MenuProvider>
              <MyStatusBar>
                {/* {progressView}
                <Text>{this.state.syncMessage || ""}</Text> */}
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
  }
}

LogBox.ignoreAllLogs(true);

const styles = StyleSheet.create({
  safeviewArea: {
    flex: 1,
  },
});

const codePushOptions = {
  checkFrequency: codePush.CheckFrequency.ON_APP_RESUME,
  installMode: codePush.InstallMode.IMMEDIATE,
};

export default codePush(codePushOptions)(App);
