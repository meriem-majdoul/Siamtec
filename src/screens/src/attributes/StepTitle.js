import React from 'react'
import { StyleSheet, Text } from 'react-native'
import * as theme from '../../../core/theme'

export default function StepTitle({ title }) {
  return <Text style={[theme.customFontMSregular.body, styles.stepTitle]}>{title}</Text>
}

const styles = StyleSheet.create({
  stepTitle: {
    color: theme.colors.primary,
    marginHorizontal: 10
  }
})
