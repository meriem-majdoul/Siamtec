/* eslint-disable react-native/no-inline-styles */
/* eslint-disable radix */
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { isTablet } from '../../../core/constants';
import * as theme from '../../../core/theme'

export default function StepProgress({ progress, style, size = 27 }) {

  return (
    <AnimatedCircularProgress
      size={size}
      width={2}
      fill={progress || 0}
      tintColor={progress >= 75 ? theme.colors.primary : theme.colors.secondary}
      style={style}
      //onAnimationComplete={() => console.log('onAnimationComplete')}
      backgroundColor="#D8D8D8"
      rotation={0}
    >
      {(fill) => {
        return (
          <Text
            style={[
              isTablet ? theme.customFontMSbold.body : theme.customFontMSbold.extraSmall,
              { color: progress >= 75 ? theme.colors.primary : theme.colors.secondary },
            ]}>
            {parseInt(fill)}%
          </Text>
        )
      }}
    </AnimatedCircularProgress>
  );
}
