
import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native'
import CustomIcon from './CustomIcon'
import * as theme from '../core/theme'
import { constants } from '../core/constants'
import { faTimes } from 'react-native-fontawesome';

const ModalHeader = ({ title, toggleModal }) => {
    return (
        <View style={styles.header}>
            <View style={{ alignItems: "center" }}>
                <Text style={[theme.customFontMSregular.header, styles.title]}>{title}</Text>
            </View>
            <CustomIcon
                onPress={toggleModal}
                icon={faTimes}
                color={theme.colors.white}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: theme.colors.primary,
        borderTopLeftRadius: constants.ScreenWidth * 0.03,
        borderTopRightRadius: constants.ScreenWidth * 0.03,
        paddingHorizontal: theme.padding,
        paddingVertical: 10
    },
    title: {
        color: '#fff',
        textAlign: 'center',
        marginLeft: 10
    }
})

export default ModalHeader