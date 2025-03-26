import React, { Component } from 'react';
import {  Text, TouchableHighlight, View, StyleSheet } from "react-native"
import Modal from "react-native-modal"
import { ScreenHeight } from '../core/constants';

class ModalTest extends Component {
    state = {
        modalVisible: true,
    }
    toggleModal(visible) {
        this.setState({ modalVisible: visible });
    }
    render() {
        return (
            <View style={styles.container}>
                <Modal
                    animationType={"slide"}
                    transparent={false}
                    visible={this.state.modalVisible}
                    onRequestClose={() => { console.log("Modal has been closed.") }}>

                    <View style={styles.modal}>
                        <TouchableHighlight onPress={() => { this.toggleModal(!this.state.modalVisible) }}>
                            <Text style={styles.text}>Close Modal</Text>
                        </TouchableHighlight>
                        <Text onPress={() => console.log("Hello world")}>Press me !</Text>

                    </View>
                </Modal>

                <TouchableHighlight onPress={() => { this.toggleModal(true) }}>
                    <Text style={styles.text}>Open Modal</Text>
                </TouchableHighlight>
            </View>
        )
    }
}
export default ModalTest

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        backgroundColor: '#ede3f2',
        padding: 100
    },
    modal: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#f7021a',
        padding: 100,
        marginTop: ScreenHeight*0.7
    },
    text: {
        color: '#3f2949',
        marginTop: 10
    }
})