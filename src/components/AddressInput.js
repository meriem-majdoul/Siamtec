import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text, TouchableOpacity, Linking } from "react-native";
import { Checkbox } from "react-native-paper";
import { faEye, faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
import MyInput from "./TextInput";
import ModalOptions from "./ModalOptions";
import ItemPicker from "./ItemPicker";
import * as theme from "../core/theme";
import { notAvailableOffline } from "../core/exceptions";
import { constants } from "../core/constants";

const AddressInput = ({
    offLine,
    onPress,
    address,
    onChangeText,
    clearAddress,
    addressError,
    label,
    editable = true,
}) => {
    const [checked, setChecked] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const elements = [
        {
            label: "Google Maps",
            value: "googleMaps",
            image: require("../assets/icons/googleMaps.png"),
            selected: false,
        },
        {
            label: "Waze",
            value: "waze",
            iconColor: "#14c6f7",
            selected: false,
        },
    ];  

    const isAddressMarked =
        address.marker && address.marker.latitude && address.marker.longitude;

    useEffect(() => {
        if (address.description && !isAddressMarked) {
            setChecked(true);
        }
    }, [address.description, isAddressMarked]);

    const onPressRightIcon = () => {
        if (isAddressMarked) {
            setShowModal(true);
        } else {
            openMap();
        }
    };

    const openMap = () => {
        if (!editable) return;
        if (offLine) {
            notAvailableOffline("La carte est indisponible en mode hors-ligne");
            return;
        }
        onPress();
    };

    const openMapURL = async (mapTool) => {
        const { latitude, longitude } = address.marker;
        const urls = {
            waze: `https://www.waze.com/ul?ll=${latitude}%2C${longitude}&navigate=yes&zoom=17`,
            googleMaps: `https://www.google.com/maps/search/?api=1&query=${latitude}%2C${longitude}`,
        };

        const url = urls[mapTool];
        if (url) await Linking.openURL(url);
    };

    const handleSelectMapTool = (index) => {
        const selectedTool = elements[index].value;
        openMapURL(selectedTool);
    };

    const toggleModal = () => setShowModal(!showModal);

    const onPressCheck = () => {
        if (!editable) return;
        setChecked(!checked);
        clearAddress();
    };

    return (
        <View>
            {checked ? (
                <MyInput
                    label={label || "Adresse"}
                    value={address.description}
                    onChangeText={onChangeText}
                    error={!!addressError}
                    errorText={addressError}
                    editable={editable}
                />
            ) : (
                <ItemPicker
                    onPress={openMap}
                    label="Adresse"
                    editable={editable}
                    icon={faMapMarkerAlt}
                    value={address.description}
                />
            )}

            <View style={styles.checkboxContainer}>
                <Checkbox.Android
                    status={checked ? "checked" : "unchecked"}
                    onPress={onPressCheck}
                    color={theme.colors.primary}
                    style={styles.checkbox}
                />
                <Text
                    style={[theme.customFontMSregular.body, styles.checkboxText]}
                    onPress={onPressCheck}
                >
                    Saisir l'adresse manuellement
                </Text>
            </View>

            <ModalOptions
                title="Ouvrir l'adresse avec"
                columns={2}
                isLoading={false}
                modalStyle={{ marginTop: constants.ScreenHeight * 0.5 }}
                isVisible={showModal}
                toggleModal={toggleModal}
                elements={elements}
                autoValidation={true}
                handleSelectElement={(elements, index) =>
                    handleSelectMapTool(index)
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    checkboxContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginLeft: -10,
        marginTop: 10,
    },
    checkbox: {
        backgroundColor: "green",
        borderWidth: 3,
        borderColor: "green",
    },
    checkboxText: {
        color: theme.colors.gray_dark,
    },
});

export default AddressInput;
