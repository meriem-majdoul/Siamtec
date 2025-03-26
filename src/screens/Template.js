import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, Image } from 'react-native';

export default class template extends Component {
    constructor(props) {
        super(props)
        this.state = {
            a: ''
        }
    } 

    render() {
        return (
            <View style={styles.container}>
                <Text>This is a template screen.</Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

