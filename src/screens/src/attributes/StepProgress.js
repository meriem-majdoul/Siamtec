/* eslint-disable react-native/no-inline-styles */
/* eslint-disable radix */
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { isTablet } from '../../../core/constants';
import * as theme from '../../../core/theme'

export default function StepProgress({ progress }) {
  const color = progress >= 75 ? theme.colors.primary : theme.colors.secondary
  const { extraSmall, small, caption } = theme.customFontMSmedium
  return (
    <AnimatedCircularProgress
      size={isTablet ? 65 : 33}
      width={2}
      fill={progress}
      tintColor={color}
      // onAnimationComplete={() => console.log('onAnimationComplete')}
      backgroundColor="#D8D8D8"
      rotation={0}>
      {(fill) => (
        <Text style={[extraSmall, { fontSize: isTablet ? 17 : 8, color, textAlign: 'center' },]}>
          {parseInt(progress)}%
        </Text>
      )}
    </AnimatedCircularProgress>
  );
}

const styles = StyleSheet.create({
  percentText: {
    textAlign: 'center',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
