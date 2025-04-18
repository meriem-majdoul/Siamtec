import React from 'react';
import { ActivityIndicator } from 'react-native';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';

import { CustomIcon } from '../../../components';
import * as theme from '../../../core/theme'

export default function PhaseStatus({ params, status }) {

  if (status === 'pending') {
    return <ActivityIndicator color={theme.colors.primary} />
  }

  else if (status === 'done') {
    return (
      <CustomIcon
        icon={faCheck}
        color={theme.colors.primary}
        size={20}
      />
    )
  }

  else return null
}
