


import React, { memo } from "react";
import { View, StyleSheet, Text, SafeAreaView } from "react-native";
import { TextInput as Input } from "react-native-paper";
import * as theme from "../core/theme";

const ModalController = ({ children, ...props }) => (

    <Modal
        isVisible={showModal}
        coverScreen='true'
        onBackdropPress={() => this.setState({ showModal: false })} // Android back press
        onSwipeComplete={() => this.setState({ showModal: false })} // Swipe to discard
        animationIn="slideInUp" // Has others, we want slide in from the left
        animationOut="slideOutDown" // When discarding the drawer
        swipeDirection="down" // Discard the drawer with swipe to left
        useNativeDriver // Faster animation 
        hideModalContentWhileAnimating // Better performance, try with/without
        propagateSwipe // Allows swipe events to propagate to children components (eg a ScrollView inside a modal)
        style={styles.modalStyle} // Needs to contain the width, 75% of screen width in our case
    >
        <SafeAreaView style={{
            flex: 1,
            justifyContent: 'flex-start',
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
            backgroundColor: "white"
        }}>
            {children}
        </SafeAreaView>

    </Modal>

)

const styles = StyleSheet.create({
    modalStyle: {
        flex: 1,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        margin: 0,
        marginTop: constants.ScreenHeight * 0.65,
        width: constants.ScreenWidth, // SideMenu width
        height: constants.ScreenHeight * 0.1,
    }
})

export default memo(const ModalController = ({ children, ...props }) => (
    );











