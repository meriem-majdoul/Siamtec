import React from "react"
import FontAwesome, { SolidIcons, RegularIcons, BrandIcons } from 'react-native-fontawesome'
import { StyleSheet, Text, TouchableOpacity } from "react-native"
import * as theme from '../core/theme'
import { Appbar } from 'react-native-paper'

import { FontAwesomeIcon } from 'react-native-vector-icons/FontAwesome5'
import { faCommentDots } from 'react-native-fontawesome'

import PropTypes from 'prop-types'
import { isTablet } from "../core/constants"

const CustomIcon = ({ icon = faCommentDots, size = isTablet ? 42 : 24, color = theme.colors.secondary, secondaryColor, onPress, style, headerLeft, headerRight, ...props }) => {

    if (!icon) return null
    if (onPress) return (
        <TouchableOpacity style={style} onPress={onPress} hitSlop={theme.hitslop}>
            <FontAwesomeIcon
                icon={icon}
                style={[styles.iconStyle, style]}
                color={color}
                secondaryColor={secondaryColor}
                size={size}
            />
        </TouchableOpacity>
    )

    else return (
        <FontAwesomeIcon
            icon={icon}
            style={[styles.iconStyle, style]}
            color={color}
            secondaryColor={secondaryColor}
            size={size}
        />
    )
}

const styles = StyleSheet.create({
    iconStyle: {
        color: theme.colors.secondary,
    },
})

export default CustomIcon
