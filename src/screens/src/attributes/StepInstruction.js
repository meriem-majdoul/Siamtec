/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { faInfoCircle } from 'react-native-vector-icons/FontAwesome5';

import { CustomIcon } from '../../../components';
import * as theme from '../../../core/theme'
import { isTablet } from '../../../core/constants';

export default function StepInstruction({ instructions }) {
  return (
    <View>
      <CustomIcon
        icon={faInfoCircle}
        onPress={() => Alert.alert('', instructions)}
        size={isTablet ? 24 : 15}
        color={theme.colors.gray_dark}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  instructionContainer: {
    padding: 10,
    position: 'absolute',
    top: 15,
    width: 200,
    alignSelf: 'center',
  },
  instructionSection: {
    borderRadius: 7,
    borderColor: '#0A0F70',
    borderWidth: 1,
    padding: 3,
    backgroundColor: 'white',
    zIndex: 11,
    ...theme.style.shadow
  },
});
