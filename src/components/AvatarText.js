import React from 'react'
import { Avatar } from 'react-native-paper'
import * as theme from '../core/theme';

const AvatarText = ({ label, labelStyle, size = 45, style, ...props }) => (
    <Avatar.Text
        size={size}
        label={label}
        labelStyle={{ color: '#fff' }, labelStyle} style={{ backgroundColor: theme.colors.secondary }, style}
        {...props} />
)

export default AvatarText
