

import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import * as theme from '../core/theme';

const ActiveFilter = () => (
    <View style={styles.container}><Text style={[theme.customFontMSregular.caption, { color: theme.colors.white }]}>Filtre activé</Text></View>
)

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 5
    }
})

export default ActiveFilter




