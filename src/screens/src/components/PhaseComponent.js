import React from 'react';
import { StyleSheet, View, ScrollView, Text } from 'react-native';
import StepIndicator from 'react-native-step-indicator';
import PhaseTitle from '../attributes/PhastTitle';
import PhaseStatus from '../attributes/PhaseStatus';
import { PRIMARY_COLOR } from '../utils/color';
import { constants, isTablet } from '../../../core/constants';
import * as theme from '../../../core/theme';

const secondIndicatorStyles = {
  stepIndicatorSize: 30,
  currentStepIndicatorSize: 30,
  separatorStrokeWidth: 2,
  currentStepStrokeWidth: 2,
  stepStrokeCurrentColor: theme.colors.primary,
  stepStrokeWidth: 2,
  separatorStrokeFinishedWidth: 2,
  stepStrokeFinishedColor: theme.colors.primary,
  stepStrokeUnFinishedColor: theme.colors.primary,
  separatorFinishedColor: theme.colors.primary,
  separatorUnFinishedColor: theme.colors.gray_light,
  stepIndicatorFinishedColor: '#ffffff',
  stepIndicatorUnFinishedColor: '#ffffff',
  stepIndicatorCurrentColor: '#ffffff',
  stepIndicatorLabelFontSize: 5,
  currentStepIndicatorLabelFontSize: 8,
  stepIndicatorLabelCurrentColor: '#aaaaaa',
  stepIndicatorLabelFinishedColor: '#ffffff',
  stepIndicatorLabelUnFinishedColor: '#aaaaaa',
  labelColor: theme.colors.secondary,
  labelSize: 8,
  currentStepLabelColor: '#999999',
};

export default function PhaseComponent({ labels, status, currentPage, setCurrentPage }) {

  const onStepPress = (position) => {
    if (status[position] !== 'grayed')
      setCurrentPage(position)
  }

  const renderStepIndicator = (params) => (
    <PhaseStatus
      params={params}
      status={status[params.position]}
    />
  )

  const renderLabel = ({ position, label, currentPosition }) => {

    const color = position === currentPosition ? theme.colors.primary : status[position] === 'grayed' ? theme.colors.gray_dark : theme.colors.secondary

    return (
      <View style={{ marginTop: isTablet ? 15 : 0 }}>
        <Text style={[isTablet ?
          theme.customFontMSregular.caption
          :
          theme.customFontMSregular.extraSmall, { textAlign: 'center', color }]}>{label}</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <StepIndicator
        currentPosition={currentPage}
        stepCount={labels.length}
        customStyles={secondIndicatorStyles}
        onPress={onStepPress}
        renderStepIndicator={renderStepIndicator}
        renderLabel={renderLabel}
        labels={labels}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginBottom: 35
  },
  stepLabelSelected: {
    color: '#25D366'
  },
  stepLabel: {
    // color: '#000'
  }
});
