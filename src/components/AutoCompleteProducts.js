import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import AutoTags from "react-native-tag-autocomplete";
import { useNavigation } from "@react-navigation/native";

import { db } from "../firebase";
import * as theme from "../core/theme";
import { errorMessages, ScreenHeight, ScreenWidth } from "../core/constants";
import { displayError, myAlert } from "../core/utils";

const AutoCompleteProducts = (props) => {
    const navigation = useNavigation();
    const [tagsSelected, setTagsSelected] = useState([]);

    const customFilterData = (query) => {
        query = query.toUpperCase();
        return props.suggestions.filter((suggestion) =>
            suggestion.name.toUpperCase().includes(query)
        );
    };

    const customRenderTags = (tags) => (
        <View style={styles.customTagsContainer}>
            {props.tagsSelected.map((tag, i) => (
                <Text key={i.toString()} numberOfLines={1} style={{ color: "#000" }}>
                    {tag.name}
                </Text>
            ))}
            {props.errorText !== "" && (
                <Text style={[theme.customFontMSregular.caption, styles.error]}>
                    {props.errorText}
                </Text>
            )}
        </View>
    );

    const viewProduct = (ProductId) => {
        navigation.navigate("CreateProduct", {
            ProductId: ProductId,
            onGoBack: (product) => console.log(product),
        });
    };

    const showAlert = (ProductId) => {
        myAlert(
            "Supprimer l'article",
            "Etes-vous sûr de vouloir supprimer cet article ? Cette opération est irréversible.",
            () => handleDeleteProduct(ProductId)
        );
    };

    const handleDeleteProduct = (ProductId) => {
        db.collection("Products")
            .doc(ProductId)
            .delete()
            .catch(() => displayError({ message: errorMessages.firestore.delete }));
    };

    const customRenderSuggestion = (suggestion) => {
        const product = suggestion;
        return (
            <View style={styles.suggestion}>
                <View>
                    <Text style={theme.customFontMSbold.body}>{product.name}</Text>
                    <Text style={[theme.customFontMSregular.body, { color: "gray", marginTop: 10 }]}>
                        Prix: <Text style={{ color: "#000" }}>€{product.price}</Text>
                    </Text>
                </View>
                {props.role === "admin" && (
                    <View style={{ justifyContent: "space-between" }}>
                        <TouchableOpacity onPress={() => viewProduct(product.id)} style={styles.iconButton}>
                            <MaterialCommunityIcons name="pencil" size={19} color={theme.colors.graySilver} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => showAlert(product.id)} style={styles.iconButton}>
                            <MaterialCommunityIcons name="delete" size={19} color={theme.colors.graySilver} />
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        );
    };

    return (
        <AutoTags
            suggestions={props.suggestions}
            tagsSelected={props.tagsSelected}
            handleAddition={(product) => props.main.setState({ tagsSelected: [...props.tagsSelected, product] })}
            handleDelete={(index) => {
                let updatedTags = [...props.tagsSelected];
                updatedTags.splice(index, 1);
                props.main.setState({ tagsSelected: updatedTags });
            }}
            placeholder={props.placeholder}
            filterData={customFilterData}
            renderSuggestion={customRenderSuggestion}
            renderTags={customRenderTags}
            onCustomTagCreated={(userInput) => {
                const product = { name: userInput, id: null };
                props.main.setState({ tagsSelected: [...props.tagsSelected, product] });
            }}
            style={styles.autotags}
            autoFocus={false}
            suggestionsBellow={props.suggestionsBellow}
            editable={props.editable}
            createTagOnSpace={false}
            containerStyle={styles.containerStyle}
            inputContainerStyle={styles.inputContainerStyle}
            listStyle={styles.listStyle}
            flatListProps={{ height: ScreenHeight * 0.3 }}
            showInput={props.showTextInput}
        />
    );
};

export default AutoCompleteProducts;

const styles = StyleSheet.create({
    customTagsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center",
        paddingTop: 10,
        width: ScreenWidth * 0.9,
    },
    suggestion: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderBottomWidth: StyleSheet.hairlineWidth * 0.5,
        borderBottomColor: theme.colors.gray2,
    },
    autotags: {
        backgroundColor: "#fff",
        marginLeft: -ScreenWidth * 0.02,
        paddingTop: 5,
        paddingBottom: 15,
        width: ScreenWidth - theme.padding * 2,
        borderBottomWidth: StyleSheet.hairlineWidth * 3,
        borderBottomColor: theme.colors.gray_extraLight,
    },
    error: {
        paddingHorizontal: 4,
        paddingTop: 4,
        color: theme.colors.error,
    },
    inputContainerStyle: {
        marginLeft: 7,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: theme.colors.gray_extraLight,
        
    },
    containerStyle: {
        minWidth: 200,
        maxWidth: ScreenWidth - theme.padding,
    },
    listStyle: {
        backgroundColor: "white",
        margin: 0,
        paddingHorizontal: theme.padding / 2,
    },
    iconButton: {
        flex: 0.5,
        marginVertical: 7,
        justifyContent: "center",
        alignItems: "center",
    },
});
