import React, { memo } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';

import CustomIcon from './CustomIcon';

import * as theme from "../core/theme";

const AvatarText = ({ text, style }) => (
    <View style={[styles.avatarText, style]}>
        <Text style={[theme.customFontMSregular.small, { color: theme.colors.white }]}>
            {text}
        </Text>
    </View>
);

const ItemPicker = ({
    label,
    value = '',
    errorText = '',
    onPress = () => {},
    showAvatarText = true,
    icon = faPlusCircle,
    editable = true,
    style,
}) => {
    const noError = !errorText;
    const noValue = !value;

    const onPressItem = () => {
        if (editable) onPress();
    };

    const borderBottomColor = noError ? theme.colors.gray_extraLight : theme.colors.error;
    const labelColor = noError ? theme.colors.secondary : theme.colors.error;

    const renderLabel = (font, isPlaceholder) => (
        <Text
            numberOfLines={1}
            style={[font, { color: labelColor, paddingTop: isPlaceholder ? 0 : 15 }]}
        >
            {label}
        </Text>
    );

    // Générer l'avatar textuel
    const avatarText = !noValue
        ? value
              .split(' ')
              .slice(0, 2)
              .map(word => word.charAt(0).toUpperCase())
              .join('')
        : '';

    return (
        <View style={[styles.container, style]}>
            <TouchableOpacity
                onPress={onPressItem}
                style={[
                    styles.pickerContainer,
                    {
                        borderBottomColor,
                        paddingTop: noValue ? 15 : 0,
                        paddingBottom: 10,
                    },
                ]}
            >
                {!noValue ? (
                    <View>
                        {renderLabel(theme.customFontMSregular.caption, false)}
                        <View style={styles.valueContainer}>
                            <View style={styles.textContainer}>
                                {showAvatarText && (
                                    <AvatarText
                                        text={avatarText}
                                        style={{ marginRight: theme.padding / 2 }}
                                    />
                                )}
                                <Text
                                    style={[
                                        theme.customFontMSregular.body,
                                        { color: theme.colors.gray_dark },
                                    ]}
                                >
                                    {value}
                                </Text>
                            </View>
                            <CustomIcon icon={icon} color={theme.colors.inpuIcon} />
                        </View>
                    </View>
                ) : (
                    <View style={styles.placeholderContainer}>
                        <View style={{ flex: 0.905 }}>
                            {renderLabel(theme.customFontMSregular.body, true)}
                        </View>
                        <CustomIcon icon={icon} color={theme.colors.inpuIcon} />
                    </View>
                )}
            </TouchableOpacity>

            {!noError && (
                <Text style={[theme.customFontMSregular.caption, styles.error]}>
                    {errorText}
                </Text>
            )}
        </View>
    );
};

ItemPicker.defaultProps = {
    value: '',
    errorText: '',
    onPress: () => {},
    showAvatarText: true,
    icon: faPlusCircle,
    editable: true,
};

const styles = StyleSheet.create({
    container: {},
    pickerContainer: {
        borderBottomWidth: StyleSheet.hairlineWidth * 3,
    },
    error: {
        paddingTop: 10,
        color: theme.colors.error,
    },
    avatarText: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.primary,
    },
    valueContainer: {
        flexDirection: 'row',
        paddingTop: 10,
    },
    textContainer: {
        flex: 1,
        flexDirection: 'row',
        paddingRight: theme.padding,
    },
    placeholderContainer: {
        height: 45,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
});

export default memo(ItemPicker);
