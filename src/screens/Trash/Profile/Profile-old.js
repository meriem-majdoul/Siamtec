import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, Image } from 'react-native';
import MyProfile from './ProfileComponent'
import * as theme from '../../../core/theme'

export default class Profile extends Component {
    constructor(props) {
        super(props)
        this.state = {
            a: ''
        }
    }

    render() {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={[theme.customFontMSbold.h1, { textAlign: 'center' }]}>En cours de développement...</Text>
            </View>
            //   <MyProfile avatarBackground= 'green' name= 'Rose Marie'  />
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

