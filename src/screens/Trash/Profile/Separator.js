import React from 'react'
import { StyleSheet, View, Text } from 'react-native'

const Separator = ({ width, borderColor }) => (
    <View style={styles.container}>
        <View style={styles.separatorOffset} />
        <View style={[styles.separator, { width: width ? width : '100%', borderColor: borderColor ? borderColor : '#EDEDED' }]} />
    </View>
)

const styles = StyleSheet.create({

    container: {
        flexDirection: 'row',
    },
    separatorOffset: {
        flex: 2,
        flexDirection: 'row',
    },
    separator: {
        width: '100%',
        borderColor: '#EDEDED',
        borderWidth: 1,
        alignSelf: 'flex-start',
        //marginTop: 5
        // flex: 8,
        // flexDirection: 'row',
    },
})

export default Separator
