import React, { memo } from "react";
import { View, StyleSheet, Text, TouchableOpacity, Platform } from "react-native";
import { Picker } from '@react-native-picker/picker'
import Modal from "react-native-modal"
import * as theme from "../core/theme";
import { constants, isTablet } from "../core/constants";
import CustomIcon from './CustomIcon'
import { Caption } from './typography/Typography'
import { faAngleDown, faCheck } from "@fortawesome/free-solid-svg-icons";
import CloseIcon from "./CloseIcon";

const MyPicker = ({ containerStyle, style, pickerContainerStyle, elements, title, showTitle = true, errorText, enabled = true, ...props }) => {

    const [isModalVisible, setIsModalVisible] = React.useState(false)
    const [isPickerVisible, setIsPickerVisible] = React.useState(false)

    const toggleModal = () => {
        setIsModalVisible(!isModalVisible)
    }

    const togglePicker = () => {
        if (!enabled) return
        setIsPickerVisible(!isPickerVisible)
    }

    const picker = () => {
        return (
            <Picker
                //style={[styles.input]}
                style={{color:'#000'}}
                enabled={enabled}
                dropdownIconColor={theme.colors.gray_dark}
                {...props}
            >
                {
                    elements ?
                        elements.map((item, index) =>
                            <Picker.Item key={index.toString()} label={item.label} value={item.value} />)
                        : null
                }
            </Picker>
        )
    }



    const renderPicker = () => {
        if (Platform.OS === "android")
            return picker()

        else return (
            <View>
                <TouchableOpacity style={styles.iosPicker} onPress={togglePicker} >
                    <Caption>{props.selectedValue}</Caption>
                    <CustomIcon icon={faAngleDown} color={theme.colors.gray_dark} />
                </TouchableOpacity>

                <View>
                    {isPickerVisible &&
                        <CloseIcon
                            icon={faCheck}
                            onPress={togglePicker}
                            color={"green"}
                            style={{ zIndex: 10, position: "absolute", right: 0, top: 10, padding: 15 }}
                        />
                    }
                    {isPickerVisible && picker()}
                </View>
            </View >

        )
        // else return (
        //     <View>
        //         <TouchableOpacity style={styles.iosPicker} onPress={toggleModal}>
        //             <Caption text={props.selectedValue} />
        //             <CustomIcon icon={faAngleDown} color={theme.colors.gray_dark} />
        //         </TouchableOpacity>

        //         <Modal
        //             isVisible={isModalVisible}
        //             onBackdropPress={toggleModal}
        //             style={styles.modal}
        //             backdropOpacity={0.25}
        //         >
        //             <View style={styles.modalContainer}>
        //                 <Body text={title} style={{ textAlign: "center" }} />
        //                 {picker()}
        //             </View>
        //         </Modal>
        //     </View>
        // )
    }

    return (
        <View style={[styles.container, style]}>

            <View style={[styles.pickerContainer, pickerContainerStyle]}>
                {showTitle &&
                    <Caption>{title}</Caption>
                }
                {renderPicker()}
            </View>

            {errorText ?
                <Text style={[theme.customFontMSregular.caption, styles.error]}>{errorText}</Text>
                :
                null
            }

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        paddingTop: 15,
        marginVertical: isTablet ? 15 : 0
    },
    pickerContainer: {
        borderBottomWidth: Platform.OS === "android" ? StyleSheet.hairlineWidth * 3 : 0,
        borderBottomColor: theme.colors.gray_extraLight,
      
    },
    input: {
        color: theme.colors.gray_dark,
        //height: 40,
        //alignItems: 'flex-start',
        backgroundColor:'gray',
    },
    error: {
        paddingHorizontal: 4,
        paddingVertical: 4,
        color: theme.colors.error
    },
    iosPicker: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 5,
        ...theme.style.inputBorderBottom
    },
    modal: {
        marginTop: 600,
    },
    modalContainer: {
        backgroundColor: "white",
        borderTopRightRadius: 15,
        borderTopLeftRadius: 15,
        paddingVertical: 5
    }
});

export default MyPicker;