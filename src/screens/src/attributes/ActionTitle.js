import React from 'react';
import { StyleSheet, Text } from 'react-native';

export default function ActionTitle({ title }) {
  return <Text style={styles.stepTitle}>{title}</Text>;
}

const styles = StyleSheet.create({
  stepTitle: {
    // color: '#25D366',
    // marginHorizontal: 10,
  },
});
