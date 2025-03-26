import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { isIphoneX, getStatusBarHeight } from 'react-native-iphone-x-helper';
import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function NavBar({ title }) {
  return (
    <View style={styles.navBar}>
      <View style={styles.navBtnSection}>
        <Entypo name="menu" size={30} color="black" />
        <Text style={styles.navTitle}>{title}</Text>
      </View>
      <View style={styles.navBtnSection}>
        <Ionicons
          name="ios-search"
          size={24}
          color="black"
          style={styles.navIcon}
        />
        <Ionicons
          name="ios-notifications-outline"
          size={24}
          color="black"
          style={styles.navIcon}
        />
        <Ionicons
          name="ios-refresh"
          size={24}
          color="black"
          style={styles.navIcon}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navBar: {
    backgroundColor: '#F8F8F8',
    paddingHorizontal: 5,
    paddingTop: isIphoneX() ? getStatusBarHeight() + 10 : 10,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  navTitle: {
    fontSize: 20,
    marginLeft: 5,
  },
  navBtnSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navIcon: {
    marginHorizontal: 2,
  },
});
