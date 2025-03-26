import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import * as theme from '../../../core/theme'

export default function PhaseTitle({ title, selected }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={[theme.customFontMSregular.extraSmall, { textAlign: 'center' }, selected]}>{title}</Text>
    </View>
  )
}

// const styles = StyleSheet.create({
//   textStyle: {
//     color: '#484F5A',
//     fontSize: 12,
//     textAlign: 'center',
//   },
// });
