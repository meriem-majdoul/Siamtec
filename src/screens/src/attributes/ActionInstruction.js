/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function ActionInstruction({
  instructions,
  showPopup,
  setShowPopup,
}) {
  return (
    <View style={{ zIndex: 10 }}>
      <Ionicons
        onPress={() => setShowPopup(!showPopup)}
        name="ios-information-circle-outline"
        size={20}
        color="#0A0F70"
        style={styles.iconStyle}
      />
      {showPopup && (
        <View style={styles.instructionContainer}>
          <TouchableOpacity
            onPress={() => setShowPopup(false)}
            style={styles.instructionSection}>
            <Text style={{ fontSize: 12 }}>{instructions}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  iconStyle: {
    marginLeft: 5,
  },
  instructionContainer: {
    padding: 10,
    position: 'absolute',
    top: 15,
    width: 200,
    alignSelf: 'flex-end',
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
