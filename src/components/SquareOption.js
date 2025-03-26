
import React from "react";
import { View, StyleSheet, TouchableOpacity, Text, Image } from "react-native";

import CustomIcon from './CustomIcon'

import * as theme from "../core/theme";
import { constants, isTablet } from "../core/constants";

const SquareOption = ({ element, index, elementSize, onPress }) => {

    const dynamicStyle = () => {
        const isSelected = element.selected
        if (isSelected)
            return {
                elevation: 0,
                borderWidth: 1,
                borderColor: theme.colors.primary
            }
        else return {}
    }

    const iconColor = element.selected ? theme.colors.primary : (element.iconColor || theme.colors.gray_medium)
    // const iconColor = element.iconColor
    const textColor = element.selected ? theme.colors.primary : theme.colors.secondary

    return (
        <TouchableOpacity
            style={[styles.container, { marginTop: isTablet ? 70 : 0, margin: elementSize * 0.03, width: elementSize, height: elementSize }, dynamicStyle()]}
            onPress={onPress}
        >
            <View style={{ height: elementSize * 0.55, justifyContent: 'center' }}>
                {element.icon &&
                    <CustomIcon
                        icon={element.icon}
                        size={elementSize * 0.3}
                        color={iconColor}
                    />
                }
                {element.image &&
                    <Image
                        source={element.image}
                        style={{ width: elementSize * 0.2, height: elementSize * 0.2 / (1200 / 1722) }}
                    />
                }
            </View>
            <View style={{ height: elementSize * 0.45, paddingHorizontal: 3, paddingTop: isTablet ? elementSize * 0.1 : 0 }}>
                <Text style={[isTablet ? theme.customFontMSsemibold.header : theme.customFontMSsemibold.caption, { textAlign: 'center', color: textColor }]}>{element.label}</Text>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.white,
        ...theme.style.shadow
    }
})

export default SquareOption