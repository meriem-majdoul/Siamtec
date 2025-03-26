import React, { Component } from 'react';
import { View, Text } from "react-native"
import Child from './ChildComp'

export default class ParentComp extends React.Component {
    triggerChildAlert() {
        console.log(this.refs)
     //   this.refs.child.showAlert();
    }

    render() {
        return (
            <View>
                {/* Note that you need to give a value to the ref parameter, in this case child*/}
                <Child ref="child" />
                <Text onPress={this.triggerChildAlert}>PRESS !!!!!!!!!!!!!!!!!!!!!!!!!</Text>
            </View>
        );
    }
}