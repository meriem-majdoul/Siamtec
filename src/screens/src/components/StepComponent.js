import React, { useState } from 'react'
import { StyleSheet, View, Text } from 'react-native'
import StepProgress from '../attributes/StepProgress'
import StepTitle from '../attributes/StepTitle'
import StepInstruction from '../attributes/StepInstruction'

export default function StepComponent({ title, progress, instructions, children }) {

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', alignItems: 'center'}}>
        <StepProgress progress={progress} />
        <StepTitle title={title} />
        <StepInstruction instructions={instructions} />
      </View>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginLeft: 10,
    // backgroundColor: 'green'
  },
})
