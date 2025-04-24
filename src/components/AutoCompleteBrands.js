import React, { useState } from "react"
import { StyleSheet, Text, View, Image } from "react-native"
import { Avatar } from 'react-native-paper'
import AutoTags from "react-native-tag-autocomplete"

import { db } from '../firebase'
import * as theme from "../core/theme";
import { constants, errorMessages, isTablet } from "../core/constants";
import { displayError, myAlert } from "../core/utils";
import { useNavigation } from '@react-navigation/native'; // Importez useNavigation ici

const uri = "https://mobirise.com/bootstrap-template/profile-template/assets/images/timothy-paul-smith-256424-1200x800.jpg";

const AutoCompleteBrands = (props) => {
    const navigation = useNavigation(); // Utilisation de useNavigation pour obtenir l'objet navigation
    const [tagsSelected, setTagsSelected] = useState([]);

    // const myAlert = myAlert.bind(this);

    const customFilterData = query => {
        query = query.toUpperCase();
        let searchResults = props.suggestions.filter(suggestion => {
            return suggestion.name.toUpperCase().includes(query);
        });
        return searchResults;
    };

    const customRenderTags = tags => {
        const noTags = tags.length === 0;
        return (
            <View style={[styles.customTagsContainer, { borderBottomWidth: noTags ? 0 : StyleSheet.hairlineWidth * 2 }]}>
                {props.tagsSelected.map((tag, i) => {
                    return (
                        <Text key={i.toString()} numberOfLines={1} style={[theme.customFontMSregular.body, { color: theme.colors.gray_dark }]}>
                            {tag.name}
                        </Text>
                    );
                })}
            </View>
        );
    };

    const viewBrand = (BrandId) => {
        navigation.navigate('CreateBrand', { BrandId: BrandId, onGoBack: (brand) => console.log(brand) });
    };

    const showAlert = (BrandId) => {
        const title = "Supprimer la marque";
        const message = 'Etes-vous sûr de vouloir supprimer cette marque ?';
        const handleConfirm = () => handleDeleteBrand(BrandId);
        myAlert(title, message, handleConfirm);
    };
    

    const handleDeleteBrand = async (BrandId) => {
        try {
            await db.collection('Brands').doc(BrandId).delete();
            navigation.goBack();
        } catch (e) {
            displayError({ message: errorMessages.firestore.delete });
        }
    };

    const customRenderSuggestion = suggestion => {
        const brand = suggestion;
        return (
            <View style={styles.suggestion}>
                <View style={{ padding: 5 }}>
                    <Image source={{ uri: brand.logo.downloadURL }} style={{ width: 45, height: 45 }} />
                </View>
                <View style={{ marginLeft: 10 }}>
                    <Text style={theme.customFontMSsemibold.body}>{brand.name}</Text>
                </View>
            </View>
        );
    };

    const handleDelete = index => {
        let tagsSelected = props.tagsSelected;
        tagsSelected.splice(index, 1);
        props.main.setState({ tagsSelected });
    };

    const handleAddition = brand => {
        props.main.setState({ tagsSelected: props.main.state.tagsSelected.concat([brand]), brandError: '' });
    };

    const onCustomTagCreated = userInput => {
        const brand = { name: userInput };
        handleAddition(brand);
    };

    return (
        <View>
            <AutoTags
                suggestions={props.suggestions}
                tagsSelected={props.tagsSelected}
                handleAddition={handleAddition}
                handleDelete={handleDelete}
                placeholder={props.placeholder}
                placeholderTextColor="#888"
                filterData={customFilterData}
                renderSuggestion={customRenderSuggestion}
                renderTags={customRenderTags}
                onCustomTagCreated={onCustomTagCreated}
                style={styles.autotags}
                autoFocus={false}
                showInput={props.showInput}
                suggestionsBellow={props.suggestionsBellow}
                editable={props.editable}
                createTagOnSpace={false}
                containerStyle={styles.containerStyle}
                inputContainerStyle={styles.inputContainerStyle}
                listContainerStyle={styles.listContainerStyle}
                listStyle={[styles.listStyle, theme.style.shadow]}
            />
            {props.errorText !== '' && <Text style={[theme.customFontMSregular.caption, styles.error]}>{props.errorText}</Text>}
        </View>
    );
};

export default AutoCompleteBrands;

const styles = StyleSheet.create({
    customTagsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "flex-start",
        alignItems: 'center',
        paddingBottom: 10,
        borderBottomColor: theme.colors.gray_light,
        width: constants.ScreenWidth * 0.9
    },
    customTag: {
        flexDirection: 'row',
        backgroundColor: theme.colors.secondary,
        justifyContent: "center",
        alignItems: "center",
        height: 30,
        marginLeft: 5,
        marginTop: 5,
        borderRadius: 30,
        padding: 8
    },
    container: {
        flex: 1,
    },
    suggestion: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 10,
        borderBottomWidth: StyleSheet.hairlineWidth * 0.5,
        borderBottomColor: theme.colors.gray2
    },
    autotags: {
        backgroundColor: '#fff',
        color:'#000',
        marginLeft: -constants.ScreenWidth * 0.02,
        paddingTop: 5,
        paddingBottom: 15,
        width: constants.ScreenWidth * 0.9,
        borderBottomWidth: StyleSheet.hairlineWidth * 3,
        borderBottomColor: theme.colors.gray_extraLight
    },
    error: {
        paddingHorizontal: 4,
        paddingTop: 4,
        color: theme.colors.error
    },
    inputContainerStyle: {
        marginLeft: isTablet ? 21 : 5,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: theme.colors.gray_extraLight,
        borderWidth: 0
    },
    containerStyle: {
        minWidth: 200,
        maxWidth: constants.ScreenWidth - theme.padding,
    },
    listContainerStyle: {
        backgroundColor: "white",
        borderWidth: 0
    },
    listStyle: {
        backgroundColor: 'white',
        margin: 0,
        paddingHorizontal: theme.padding / 2,
        borderWidth: 0
    }
});
