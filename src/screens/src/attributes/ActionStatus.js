import React from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function ActionStatus({ status }) {
  const color = status === 'pending' ? 'gray' : "#25D366"
  return (
    <MaterialCommunityIcons name="check-circle" size={24} color={color} />
  );
}
