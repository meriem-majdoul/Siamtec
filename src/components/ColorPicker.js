import React, { memo, useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import Modal from 'react-native-modal'
import { faTimes, faCheck } from 'react-native-fontawesome'

import CustomIcon from './CustomIcon'
import MyFAB from './MyFAB'

import * as theme from "../core/theme"
import { constants } from "../core/constants"


const ModalContent = ({ hideModal, updateParentColor, pickedColor, label }) => {

    const [selectedColor, setSelectedColor] = useState(pickedColor)

    const ColorItem = ({ color }) => {
        return (
            <TouchableOpacity
                onPress={() => setSelectedColor(color)}
                style={{ width: 60, height: 60, borderRadius: 15, backgroundColor: color, justifyContent: 'center', alignItems: 'center' }}>
                {color === selectedColor && <CustomIcon icon={faCheck} size={15} color={theme.colors.white} />}
            </TouchableOpacity>
        )
    }

    const updateParentColorAndHidemModal = (selectedColor) => {
        updateParentColor(selectedColor)
        hideModal()
    }

    return (
        <View style={modalStyles1.container}>
            <TouchableOpacity style={{ zIndex: 1, position: 'absolute', top: 20, right: theme.padding, justifyContent: 'center', alignItems: 'center' }} onPress={() => console.log('hello')}>
                <CustomIcon
                    icon={faTimes}
                    color={theme.colors.gray_dark}
                    onPress={hideModal}
                />
            </TouchableOpacity>
            <Text style={[theme.customFontMSregular.body, { paddingLeft: theme.padding * 1.5 }]}>{label}</Text>
            <View style={{ flexDirection: 'row', marginTop: 25, flexWrap: 'wrap' }}>
                {theme.colors.project.map((color, index) => {
                    return (
                        <TouchableOpacity key={index.toString()} style={{ width: '25%', marginVertical: 10, alignItems: 'center' }}>
                            <ColorItem color={color} index={index} />
                        </TouchableOpacity>
                    )
                })}
            </View>
            <View style={{ position: 'absolute', bottom: 40, width: '100%', alignItems: 'center' }}>
                <MyFAB icon={faCheck} style={{ position: 'relative' }} onPress={() => updateParentColorAndHidemModal(selectedColor)} />
            </View>
        </View>
    )
}

const ColorPicker = ({ updateParentColor, label, selectedColor, setColor, editable = true, ...props }) => {

    const [isModalVisible, setIsModalVisible] = useState(false)

    const SelectedColor = ({ }) => {
        return <View style={{ width: 30, height: 30, borderRadius: 5, backgroundColor: selectedColor }} />
    }

    const hideModal = () => setIsModalVisible(false)

    const ColorsModal = ({ }) => {
        return (
            <Modal
                isVisible={isModalVisible}
                onSwipeComplete={() => setIsModalVisible(false)}
                swipeDirection="down"
                animationIn="slideInUp"
                animationOut="slideOutDown"
                onBackdropPress={() => setIsModalVisible(false)}
                style={modalStyles1.modal} >
                <ModalContent hideModal={hideModal} updateParentColor={updateParentColor} pickedColor={selectedColor} label={label} />
            </Modal>
        )
    }

    return (
        <TouchableOpacity
            onPress={() => {
                if (!editable) return
                setIsModalVisible(true)
            }}
            style={[styles.container, { marginBottom: 0, marginTop: 20 }]}
        >
            <Text style={[theme.customFontMSregular.caption, { marginBottom: 15 }]}>{label}</Text>
            <SelectedColor />
            <ColorsModal />
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
})

const modalStyles1 = StyleSheet.create({
    modal: {
        width: constants.ScreenWidth,
        marginTop: constants.ScreenHeight * 0.3,
        marginHorizontal: 0,
        marginBottom: 0,
        borderTopLeftRadius: constants.ScreenWidth * 0.03,
        borderTopRightRadius: constants.ScreenWidth * 0.03,
        backgroundColor: theme.colors.background
    },
    container: {
        flex: 1,
        paddingTop: 25,
        backgroundColor: theme.colors.background,
        borderTopLeftRadius: constants.ScreenWidth * 0.03,
        borderTopRightRadius: constants.ScreenWidth * 0.03,
    },
    buttonsContainer: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#fff',
    },
    column: {
        flex: 0.5,
        justifyContent: 'center',
        alignItems: 'center'
    }
})


export default memo(ColorPicker);
