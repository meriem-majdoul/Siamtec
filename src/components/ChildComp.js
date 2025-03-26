

import React, { Component } from 'react';
import { Text } from 'react-native';

export default class ChildComp extends React.Component {

    showAlert() {
        alert('Hello World');
    }

    render() {
        return (
            <Text>Hello</Text>
        );
    }
}