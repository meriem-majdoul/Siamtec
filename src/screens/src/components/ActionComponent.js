import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import ActionTitle from '../attributes/ActionTitle';
import ActionStatus from '../attributes/ActionStatus';
import ActionInstruction from '../attributes/ActionInstruction';

export default function ActionComponent({ title, status, instructions }) {
  const [showInstruction, setShowInstruction] = useState(false);
  return (
    <View style={styles.container}>
      <ActionTitle title={title} />
      <View style={styles.rightSection}>
        {status != null && <ActionStatus status={status} />}
        {instructions != null && (
          <ActionInstruction
            instructions={instructions}
            showPopup={showInstruction}
            setShowPopup={setShowInstruction}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomColor: '#F1F1F1',
    borderBottomWidth: 1,
    alignSelf: 'stretch',
    paddingVertical: 3,
    marginVertical: 5,
    marginLeft: 30,
    marginRight: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 50,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
});
