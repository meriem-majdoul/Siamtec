import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCommentDots,faUsers } from '@fortawesome/free-solid-svg-icons';
import PropTypes from "prop-types";
import * as theme from "../core/theme";
import { isTablet } from "../core/constants";

const CustomIcon = ({
    icon = faCommentDots,
    size = isTablet ? 42 : 24,
    color = theme.colors.secondary,
    secondaryColor,
    onPress,
    style,
    ...props
}) => {
    if (!icon) return null;

    return onPress ? (
        <TouchableOpacity
            style={[styles.iconContainer, style]}
            onPress={onPress}
            hitSlop={theme.hitslop}
        >
            <FontAwesomeIcon icon={icon} size={size} color={color} {...props} />
        </TouchableOpacity>
    ) : (
        <FontAwesomeIcon icon={icon} size={size} color={color} {...props} />
    );
};

CustomIcon.propTypes = {
    icon: PropTypes.object,
    size: PropTypes.number,
    color: PropTypes.string,
    secondaryColor: PropTypes.string,
    onPress: PropTypes.func,
    style: PropTypes.object,
};

const styles = StyleSheet.create({
    iconContainer: {
        justifyContent: "center",
        alignItems: "center",
    },
});

export default CustomIcon;