import React, { Component } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { connect } from 'react-redux';
import moment from 'moment';
import 'moment/locale/fr';

import { setNetwork } from './core/redux';

moment.locale('fr');

class NetworkStatus extends Component {
  constructor(props) {
    super(props);
    this.alertDisplayed = false;
    this.unsubscribeNetwork = null;
  }

  componentDidMount() {
    this.networkListener();
  }

  networkListener = () => {
    this.unsubscribeNetwork = NetInfo.addEventListener(state => {
      const { type, isConnected } = state;
      const network = { type, isConnected };

    //   console.log('Network state:', network);

      if (!isConnected && !this.alertDisplayed) {
        Alert.alert(
          'Mode Hors-Ligne',
          "L'application risque de ne pas fonctionner de façon optimale en mode hors-ligne. Veuillez rétablir votre connexion réseau.",
          [{ text: 'OK', onPress: () => (this.alertDisplayed = false) }]
        );
        this.alertDisplayed = true;
      }

      // Mise à jour du state Redux
      this.props.setNetwork(network);
    });
  };

  componentWillUnmount() {
    if (this.unsubscribeNetwork) {
      this.unsubscribeNetwork();
    }
  }

  render() {
    const { isConnected } = this.props.network || {};

    console.log('Is connected:', isConnected);

    return (
      <View style={styles.container}>
        {/* {!isConnected && <OfflineBar />} */}
        {this.props.children}
      </View>
    );
  }
}

const mapStateToProps = state => ({
  role: state.roles.role,
  network: state.network,
});

const mapDispatchToProps = {
  setNetwork,
};

export default connect(mapStateToProps, mapDispatchToProps)(NetworkStatus);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
