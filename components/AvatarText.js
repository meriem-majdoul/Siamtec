import React from 'react'
import { Avatar } from 'react-native-paper'
import firebase from '@react-native-firebase/app';
import * as theme from '../core/theme';

const AvatarText = ({ label, size = 45, ...props }) => (
    <Avatar.Text
        size={size}
        label={label}
        labelStyle={{ color: '#fff' }} style={{ backgroundColor: theme.colors.secondary }}
        {...props} />
)

export default AvatarText
